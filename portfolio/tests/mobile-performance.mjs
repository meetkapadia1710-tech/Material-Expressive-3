import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.MOBILE_URL ?? 'http://127.0.0.1:4382';
const output = process.env.MOBILE_OUTPUT ?? 'artifacts/mobile/verification';
const routes = ['/', '/projects', '/projects/repograde', '/about', '/skills', '/achievements', '/contact', '/resume', '/phase-38-404'];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const results = [];

async function openMobilePage() {
  const page = await browser.newPage({ viewport: { width: 390, height: 820 }, isMobile: true, hasTouch: true });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8,
    connectionType: 'cellular3g',
  });
  await page.addInitScript(() => {
    window.mobileTimings = { tasks: [], shifts: [], frames: [] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.mobileTimings.tasks.push({ start: entry.startTime, duration: entry.duration });
    }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.mobileTimings.shifts.push({ start: entry.startTime, value: entry.value });
    }).observe({ type: 'layout-shift', buffered: true });
    if (PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (entry.duration >= 100) {
          window.mobileTimings.frames.push({
            start: entry.startTime, duration: entry.duration,
            scripts: entry.scripts.map(({ sourceURL, sourceFunctionName, duration }) => ({ sourceURL, sourceFunctionName, duration })),
          });
        }
      }).observe({ type: 'long-animation-frame', buffered: true });
    }
  });
  return page;
}

async function measure(page, start = 0) {
  await page.waitForTimeout(1800);
  return page.evaluate((since) => {
    const tasks = window.mobileTimings.tasks.filter(({ start }) => start >= since);
    const shifts = window.mobileTimings.shifts.filter(({ start }) => start >= since);
    const frames = window.mobileTimings.frames.filter(({ start }) => start >= since);
    let cls = 0;
    let session = 0;
    let first = -Infinity;
    let last = -Infinity;
    for (const shift of shifts) {
      if (shift.start - first > 5000 || shift.start - last > 1000) {
        first = shift.start;
        session = 0;
      }
      last = shift.start;
      session += shift.value;
      cls = Math.max(cls, session);
    }
    return { cls, maxTask: Math.max(0, ...tasks.map(({ duration }) => duration)), tasks, shifts, frames };
  }, start);
}

try {
  for (const route of routes) {
    const page = await openMobilePage();
    await page.goto(base + route, { waitUntil: 'load' });
    results.push({ route, ...await measure(page) });
    await page.context().close();
  }

  const page = await openMobilePage();
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  for (const destination of ['/projects', '/projects/repograde', '/about', '/achievements', '/skills', '/contact', '/resume', '/']) {
    const from = new URL(page.url()).pathname;
    const bar = page.getByRole('navigation', { name: 'Mobile Navigation' });
    const primary = bar.locator(`a[href="${destination}"]`);
    let link = primary;
    if (destination === '/projects/repograde') link = page.locator('main a[href="/projects/repograde"]').first();
    if (destination === '/resume') link = page.locator('main a[href="/resume"]').first();
    if (destination === '/skills' || destination === '/contact') {
      await bar.getByRole('button', { name: 'More navigation and settings' }).click();
      link = page.getByRole('dialog').locator(`a[href="${destination}"]`);
    }
    const previousHeading = await page.locator('main h1').first().textContent();
    const start = await page.evaluate(() => performance.now());
    await link.click();
    await page.waitForURL(base + destination);
    await page.waitForFunction((previous) => {
      const heading = document.querySelector('main h1');
      return heading && heading.textContent !== previous;
    }, previousHeading);
    const routeCommit = await page.evaluate((since) => performance.now() - since, start);
    results.push({ route: `${from} → ${destination}`, routeCommit: Math.round(routeCommit), ...await measure(page, start) });
  }
} finally {
  await browser.close();
  await mkdir(output, { recursive: true });
  await writeFile(`${output}/performance.json`, JSON.stringify(results, null, 2));
  console.table(results.map(({ route, routeCommit, cls, maxTask }) => ({ route, routeCommit, cls, maxTask })));
}
