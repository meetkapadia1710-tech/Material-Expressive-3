import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { createDynamicColorRecord } from '../lib/dynamic-colors.ts';

const routes = ['/', '/projects', '/projects/repograde', '/about', '/skills', '/achievements', '/contact', '/resume', '/phase-38-404'];
const base = process.env.MOBILE_URL ?? 'http://127.0.0.1:4382';
const output = process.env.MOBILE_OUTPUT ?? 'artifacts/mobile/verification';
const audit = process.argv.includes('--audit');
const widths = audit ? [320, 360, 375, 390, 412, 430, 599, 600, 768, 1024, 844] : [320, 360, 390, 430, 599, 768, 844, 1024, 1280, 1440, 1920];
const schemes = audit ? ['light'] : ['light', 'dark'];
const seeds = audit ? [null] : [null, '#6142AE', '#006A60'];
const introKey = 'meet-portfolio-intro-seen-v3';
const cases = [];
const axeResults = [];
const failures = [];

function inspectLayout() {
  const viewport = document.documentElement.clientWidth;
  const modal = document.querySelector('dialog:modal, [role=dialog][aria-modal=true]');
  const root = modal ?? document.body;
  const controlsSelector = 'a[href], button, input:not([type=hidden]), textarea, select, summary, [role=button], [role=option], [role=tab], [role=radio]';
  const selector = (element) => `${element.localName}${element.id ? `#${element.id}` : ''}${[...element.classList].map((part) => `.${part}`).join('')}${element.getAttribute('aria-label') ? ` [${element.getAttribute('aria-label')}]` : ''}`;
  const bounds = ({ left, top, width, height }) => [left, top, width, height].map(Math.round);
  const flags = { overflow: [], overlaps: [], small: [], clipped: [], overlays: [] };
  const controls = [];
  const managedBounds = (element) => {
    const parent = element.parentElement?.closest('[data-scroll-region], [data-decoration]');
    if (!parent) return null;
    const style = getComputedStyle(parent);
    const rect = parent.getBoundingClientRect();
    return rect.left >= -1 && rect.right <= viewport + 1 && /^(clip|hidden|auto|scroll)$/.test(style.overflowX) ? parent : null;
  };

  for (const element of root.querySelectorAll('*')) {
    if (element.closest('.sr-only, .visually-hidden, [inert], [hidden]') || !element.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    if (element.closest('svg') && element.localName !== 'svg') continue;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const style = getComputedStyle(element);
    const managed = managedBounds(element);
    if (rect.left < -1 || rect.right > viewport + 1) {
      flags.overflow.push({ element: selector(element), bounds: bounds(rect), within: managed ? selector(managed) : null });
    }
    if (['sticky', 'fixed'].includes(style.position)) flags.overlays.push({ element: selector(element), position: style.position, bounds: bounds(rect) });
    if (element.matches(controlsSelector) && !element.closest('[aria-hidden=true]') && !element.matches('.skip-link, input[type=radio], input[type=checkbox]')) {
      if (rect.width < 43.5 || rect.height < 43.5) flags.small.push({ element: selector(element), bounds: bounds(rect) });
      const clip = managed?.getBoundingClientRect();
      const visible = clip ? {
        left: Math.max(rect.left, clip.left), right: Math.min(rect.right, clip.right),
        top: Math.max(rect.top, clip.top), bottom: Math.min(rect.bottom, clip.bottom),
      } : rect;
      controls.push({ element, rect, visible, fixed: element.closest('[data-fixed-ui], [class=toast-region]') });
    }
    if (element.hasAttribute('data-intentional-truncation') || element.closest('[aria-hidden=true], [data-decoration]')) continue;
    const text = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (text.length && element.clientWidth && /^(clip|hidden)$/.test(style.overflowX) && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)) {
      flags.clipped.push({ element: selector(element), text: text.map((node) => node.textContent.trim()).join(' ').slice(0, 120) });
    }
  }

  for (const [index, first] of controls.entries()) {
    for (const second of controls.slice(index + 1)) {
      if (first.element.contains(second.element) || second.element.contains(first.element) || first.fixed !== second.fixed) continue;
      const { visible: a } = first;
      const { visible: b } = second;
      if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) {
        flags.overlaps.push({ first: selector(first.element), second: selector(second.element), bounds: [bounds(first.rect), bounds(second.rect)] });
      }
    }
  }
  return { viewport, scrollWidth: document.scrollingElement.scrollWidth, ...flags };
}

function record(result) {
  cases.push(result);
  const issues = [
    result.scrollWidth > result.viewport ? `horizontal scroll ${result.scrollWidth} > ${result.viewport}` : '',
    ...result.overflow.filter((item) => !item.within).map((item) => `overflow ${item.element}`),
    ...result.overlaps.map((item) => `overlap ${item.first} / ${item.second}`),
    ...result.small.map((item) => `target ${item.element} (${item.bounds.slice(2).join('×')})`),
    ...result.clipped.map((item) => `clipped ${item.element}`),
  ].filter(Boolean);
  if (issues.length) failures.push(`${result.route} ${result.width}px ${result.scheme} ${result.seed ?? 'Default'}: ${issues.join(', ')}`);
}

async function capture(page, route, width, scheme, seed, screenshot) {
  await page.locator('[data-route-ready=true]').waitFor({ state: 'attached' });
  if (screenshot) {
    await page.evaluate(async () => {
      const images = [...document.images].map((image) => {
        image.loading = 'eager';
        return image.decode().catch(() => {});
      });
      await Promise.race([Promise.all(images), new Promise((resolve) => setTimeout(resolve, 10_000))]);
    });
  }
  const geometry = await page.evaluate(inspectLayout);
  record({ route, width, scheme, seed, ...geometry });
  if (screenshot) {
    const name = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
    await page.screenshot({ path: `${output}/${name}-${width}.png`, fullPage: true, animations: 'disabled' });
    await page.evaluate(async () => {
      window.scrollTo(0, document.scrollingElement.scrollHeight);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      window.scrollTo(0, document.scrollingElement.scrollHeight);
    });
    const footerClear = await page.evaluate(() => {
      const bar = document.querySelector('[data-fixed-ui]');
      const last = document.querySelector('.site-footer button');
      return !bar || !last || last.getBoundingClientRect().bottom <= bar.getBoundingClientRect().top;
    });
    if (!footerClear) failures.push(`${route} ${width}px: fixed navigation covers the final footer action`);
  }
}

async function verifyOverlayStates(page) {
  await page.goto(base);
  await page.getByRole('button', { name: 'More navigation and settings' }).click();
  const more = page.getByRole('dialog', { name: 'More Navigation & Tools' });
  await more.waitFor();
  await more.locator("summary").click();
  await capture(page, '/more-palette', 390, 'light', null, false);
  await page.keyboard.press('Escape');
  if (await more.isVisible()) await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'More navigation and settings' }).click();
  await more.getByRole('button', { name: /shortcuts/i }).click();
  await page.getByRole('dialog', { name: 'Keyboard Shortcuts' }).waitFor();
  await capture(page, '/shortcuts', 390, 'light', null, false);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /search/i }).first().click();
  const search = page.getByRole('combobox');
  await search.fill('react');
  await page.setViewportSize({ width: 390, height: 420 });
  assert(await search.evaluate((input) => input === document.activeElement && input.getBoundingClientRect().bottom <= visualViewport.height));
  await capture(page, '/search-reduced-height', 390, 'light', null, false);
  await page.goto(base + '/projects');
  await page.getByRole('button', { name: 'Filters' }).click();
  const filters = page.getByRole('dialog', { name: 'Filters' });
  await filters.waitFor();
  await capture(page, '/projects-filter-sheet', 390, 'light', null, false);
  await filters.getByRole('combobox', { name: /category/i }).click();
  await capture(page, '/projects-category-menu', 390, 'light', null, false);
  await filters.getByRole('option', { name: 'Developer tooling' }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('button', { name: /filters.*1/i }).waitFor();
  await page.getByRole('button', { name: /quick preview of repograde/i }).click();
  await page.getByRole('dialog').waitFor();
  await capture(page, '/projects-preview', 390, 'light', null, false);
  await page.keyboard.press('Escape');
  await page.goto(base + '/contact');
  const field = page.locator('textarea');
  await field.fill('Keyboard reflow check');
  await field.scrollIntoViewIfNeeded();
  assert(await field.evaluate((input) => input.getBoundingClientRect().bottom <= visualViewport.height));
  await capture(page, '/contact-reduced-height', 390, 'light', null, false);
  await page.goto(base + '/achievements');
  const heatmap = page.getByRole('region', { name: 'Contribution calendar' });
  await page.waitForFunction(() => {
    const region = document.querySelector('.heatmap-scroll-area');
    return region && region.scrollWidth - region.clientWidth - region.scrollLeft < 2;
  });
  assert(await heatmap.isVisible());
  await page.locator('.credential-view-btn').first().click();
  await page.getByRole('dialog').waitFor();
  await capture(page, '/credential-sheet', 390, 'light', null, false);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'More navigation and settings' }).click();
  await more.getByRole('link', { name: /skills & craft/i }).click();
  await page.waitForURL(base + '/skills');
  await more.waitFor({ state: 'hidden' });
  const skill = page.locator('.skill-item-interactive').first();
  await skill.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  await capture(page, '/skill-sheet', 390, 'light', null, false);
  await page.keyboard.press('Escape');
  assert(await skill.evaluate((button) => button === document.activeElement));
}

async function verifyBrowserZoom() {
  const extension = resolve(output, 'zoom-extension');
  await mkdir(extension, { recursive: true });
  await writeFile(resolve(extension, 'manifest.json'), JSON.stringify({
    manifest_version: 3, name: 'Local browser zoom verification', version: '1.0',
    permissions: ['tabs'], background: { service_worker: 'worker.js' },
  }));
  await writeFile(resolve(extension, 'worker.js'), 'chrome.runtime.onInstalled.addListener(() => {});');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', viewport: { width: 1024, height: 800 }, colorScheme: 'light', reducedMotion: 'reduce',
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.goto(base);
    const zoom = await worker.evaluate(async (url) => {
      const [tab] = await chrome.tabs.query({ url: `${url}/*` });
      await chrome.tabs.setZoom(tab.id, 2);
      return chrome.tabs.getZoom(tab.id);
    }, base);
    assert.equal(zoom, 2);
    for (const route of routes) {
      await page.goto(base + route);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => innerWidth), 512);
      await capture(page, route, '200% zoom', 'light', null, false);
    }
  } finally {
    await context.close();
  }
}

async function verifyDesktopNavigation() {
  const context = await browser.newContext({ viewport: { width: 1024, height: 820 } });
  try {
    await context.addInitScript((key) => sessionStorage.setItem(key, 'true'), introKey);
    const page = await context.newPage();
    await page.goto(base);
    await page.locator('[data-route-ready=true]').waitFor({ state: 'attached' });
    await page.locator('.site-header').getByRole('link', { name: 'Projects' }).click();
    await page.waitForURL(base + '/projects');
    await page.getByRole('heading', { name: 'Projects.' }).waitFor();
    await page.locator('main a[href="/projects/repograde"]').first().click();
    await page.waitForURL(base + '/projects/repograde');
    await page.getByRole('heading', { name: 'RepoGrade', exact: true }).waitFor();
    await page.goBack();
    await page.getByRole('heading', { name: 'Projects.' }).waitFor();
  } finally {
    await context.close();
  }
}

const server = process.env.MOBILE_URL ? null : spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '4382'], { stdio: 'inherit' });
let browser;
try {
  for (let attempt = 0; ; attempt += 1) {
    if (await fetch(base).then((response) => response.ok).catch(() => false)) break;
    if (attempt >= 60 || server?.exitCode != null) throw new Error('Production server unavailable. Run npm run build first.');
    await delay(500);
  }
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  for (const seed of seeds) for (const scheme of schemes) for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: width === 844 ? 390 : 820 },
      isMobile: width < 1024, hasTouch: width < 1024,
      deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: scheme,
    });
    const palette = seed ? { ...createDynamicColorRecord(seed), mode: 'seed' } : { mode: 'default' };
    await context.addInitScript(({ palette, scheme, introKey }) => {
      localStorage.setItem('portfolio-color-palette', JSON.stringify(palette));
      localStorage.setItem('portfolio-theme', scheme);
      sessionStorage.setItem(introKey, 'true');
    }, { palette, scheme, introKey });
    const page = await context.newPage();
    for (const route of routes) {
      const response = await page.goto(base + route, { waitUntil: 'load' });
      assert.equal(response.status(), route === routes.at(-1) ? 404 : 200, route);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('html').getAttribute('data-color-palette'), palette.mode);
      assert.equal(await page.locator('html').getAttribute('data-theme'), scheme);
      if (seed) assert.equal(await page.locator('html').getAttribute('data-color-seed'), seed);
      await capture(page, route, width, scheme, seed, audit && [360, 390].includes(width));
      if (!audit && width === 390 && !seed) {
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const violations = result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }));
        axeResults.push({ route, scheme, violations });
        if (violations.length) failures.push(`${route} ${scheme} axe: ${violations.map((violation) => violation.id).join(', ')}`);
      }
    }
    if (!audit && width === 390 && scheme === 'light' && !seed) {
      try { await verifyOverlayStates(page); }
      catch (error) { failures.push(`Overlay interaction: ${error.message}`); }
    }
    await context.close();
    console.log(`${width} ${scheme} ${seed ?? 'Default'} checked`);
  }
  if (audit) await verifyBrowserZoom();
  else {
    try { await verifyDesktopNavigation(); }
    catch (error) { failures.push(`Expanded navigation: ${error.message}`); }
  }
  await writeFile(`${output}/measurements.json`, JSON.stringify(cases, null, 2));
  if (axeResults.length) await writeFile(`${output}/axe.json`, JSON.stringify(axeResults, null, 2));
  if (failures.length) {
    console.error(failures.slice(0, 30).join('\n'));
    console.error(`${failures.length} checks failed. See ${output}/measurements.json.`);
    process.exitCode = 1;
  }
} finally {
  await browser?.close();
  server?.kill();
}
