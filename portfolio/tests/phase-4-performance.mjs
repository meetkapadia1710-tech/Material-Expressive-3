import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const base = process.env.MOBILE_URL ?? 'http://127.0.0.1:4420';
const output = process.env.PHASE4_OUTPUT ?? resolve(tmpdir(), 'portfolio-p4', 'lab');
const runs = Number(process.env.PHASE4_RUNS ?? '3');
const profile = process.argv.includes('--profile');
const cases = [['mobile-home', '/', true], ['mobile-achievements', '/achievements', true], ['desktop-home', '/', false]];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const rows = [];
  await mkdir(output, { recursive: true });
  try {
    for (let run = 1; run <= runs; run++) {
      for (const [name, route, mobile] of cases) {
        const context = await browser.newContext({
          viewport: { width: mobile ? 390 : 1440, height: mobile ? 820 : 900 },
          isMobile: mobile, hasTouch: mobile, colorScheme: 'light',
        });
        const page = await context.newPage();
        const cdp = await context.newCDPSession(page);
        if (mobile) {
          await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
          await cdp.send('Network.enable');
          await cdp.send('Network.emulateNetworkConditions', {
            offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750, connectionType: 'cellular3g',
          });
        }
        await page.addInitScript(() => {
          window.lab = { lcp: [], shifts: [], tasks: [], frames: [], interactions: [] };
          const watch = (type, callback) => {
            if (PerformanceObserver.supportedEntryTypes.includes(type)) {
              new PerformanceObserver((list) => list.getEntries().forEach(callback)).observe({ type, buffered: true, durationThreshold: 16 });
            }
          };
          watch('largest-contentful-paint', (entry) => {
            const el = entry.element;
            window.lab.lcp.push({ ms: entry.startTime, size: entry.size, tag: el?.tagName, id: el?.id, css: el?.className,
              text: el?.textContent?.trim().slice(0, 95), url: entry.url });
          });
          watch('layout-shift', (entry) => {
            if (!entry.hadRecentInput) window.lab.shifts.push([entry.startTime, entry.value]);
          });
          watch('longtask', (entry) => window.lab.tasks.push([entry.startTime, entry.duration]));
          watch('long-animation-frame', (entry) => {
            if (entry.duration >= 75) window.lab.frames.push({ time: entry.startTime, ms: entry.duration, blocking: entry.blockingDuration,
              scripts: entry.scripts.map((s) => ({ url: s.sourceURL, fn: s.sourceFunctionName, ms: s.duration, forcedLayout: s.forcedStyleAndLayoutDuration, type: s.invokerType })) });
          });
          watch('event', (entry) => {
            if (entry.interactionId) window.lab.interactions.push(entry.duration);
          });
        });
        if (profile) {
          await cdp.send('Profiler.enable');
          await cdp.send('Profiler.start');
        }
        const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' });
        if (response.status() !== 200) throw new Error(route + ' returned ' + response.status());
        await page.locator('[data-route-ready=true]').waitFor({ state: 'attached' });
        await page.waitForFunction(() => performance.now() >= 4500);
        const startup = await page.evaluate(() => {
          const { lcp, shifts, tasks, frames } = window.lab;
          let cls = 0, sum = 0, first = -Infinity, last = -Infinity;
          for (const [time, value] of shifts) {
            if (time - first > 5000 || time - last > 1000) { sum = 0; first = time; }
            sum += value;
            last = time;
            cls = Math.max(cls, sum);
          }
          const resources = performance.getEntriesByType('resource').map((r) => ({
            name: new URL(r.name).pathname, start: Math.round(r.startTime), end: Math.round(r.responseEnd), bytes: r.transferSize, type: r.initiatorType,
          }));
          const nav = performance.getEntriesByType('navigation')[0];
          return { lcp: lcp.at(-1), lcpCandidates: lcp, cls, tasks, frames, resources, ttfb: nav.responseStart,
            js: resources.filter((r) => r.name.endsWith('.js')).reduce((n, r) => n + r.bytes, 0),
            images: resources.filter((r) => r.type === 'img').reduce((n, r) => n + r.bytes, 0),
            intro: sessionStorage.getItem('meet-portfolio-intro-seen-v3') === 'true',
            coarse: matchMedia('(pointer: coarse)').matches, dom: document.getElementsByTagName('*').length };
        });
        if (profile) {
          const result = await cdp.send('Profiler.stop');
          await writeFile(resolve(output, name + '.cpuprofile'), JSON.stringify(result.profile));
        }
        await page.locator('.command-trigger').click();
        await page.getByRole('combobox').waitFor();
        await page.waitForTimeout(250);
        const interactions = await page.evaluate(() => window.lab.interactions);
        rows.push({ name, run, ...startup, longest: Math.max(0, ...startup.tasks.map((task) => task[1])),
          interaction: interactions.length ? Math.max(...interactions) : null });
        console.log(name, run, JSON.stringify({ lcp: Math.round(startup.lcp?.ms ?? 0), element: startup.lcp?.css,
          cls: startup.cls, longest: rows.at(-1).longest, js: startup.js, interaction: rows.at(-1).interaction }));
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await writeFile(resolve(output, 'lab.json'), JSON.stringify(rows, null, 2));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });

