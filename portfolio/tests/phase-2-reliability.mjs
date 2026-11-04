import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { createDynamicColorRecord } from '../lib/dynamic-colors.ts';

const base = process.env.MOBILE_URL ?? 'http://127.0.0.1:4401';
const provider = 'https://api.web3forms.com/submit';
const screenshots = process.env.PHASE_2_SCREENSHOTS;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });

async function visit(page, path, origin = base) {
  assert.equal((await page.goto(origin + path, { waitUntil: 'domcontentloaded' })).status(), 200);
  await page.locator('[data-route-ready="true"]').waitFor({ state: 'attached' });
}

async function capture(locator, name) {
  if (screenshots) await locator.screenshot({ path: resolve(screenshots, name + '.png') });
}

async function contrast(page, selector) {
  const { violations } = await new AxeBuilder({ page }).include(selector).withRules(['color-contrast']).analyze();
  assert.deepEqual(violations.flatMap((rule) => rule.nodes.map((node) => [node.target, node.failureSummary])), []);
}

async function verifyContact(page, width, origin = base) {
  let providerState = 'reject';
  let submitted = 0;
  let directProviderRequests = 0;
  await page.route(provider, (route) => {
    directProviderRequests++;
    return route.abort();
  });
  await page.route('**/api/contact', async (route) => {
    assert.equal(route.request().method(), 'POST');
    submitted++;
    const body = route.request().postDataJSON();
    assert.deepEqual([body.name, body.email, body.subject, body.message],
      ['Fixture User', 'fixture@example.test', 'Fixture', 'No real message.']);
    assert.equal('access_key' in body, false);
    if (providerState === 'network') return route.abort();
    if (providerState === 'unconfigured') return route.fulfill({ status: 503, json: { success: false } });
    return route.fulfill({ status: providerState === 'reject' ? 502 : 200, json: { success: true } });
  });
  await visit(page, '/contact', origin);
  const form = page.locator('main form');
  const button = form.getByRole('button', { name: 'Send Message' });
  const emailLink = form.getByRole('link', { name: 'Or open email app' });
  await button.click();
  assert.equal(await form.locator('[aria-invalid="true"]').count(), 4);
  assert(await form.locator('#contact-name').evaluate((el) => el === document.activeElement));
  assert.equal(submitted, 0);

  for (const [field, value] of Object.entries({
    name: ' Fixture User ', email: 'fixture@example.test', subject: 'Fixture', message: ' No real message. ',
  })) await form.locator('#contact-' + field).fill(value);

  await button.click();
  const alert = form.getByRole('alert');
  await alert.filter({ hasText: 'Your message could not be sent' }).waitFor();
  assert.equal(submitted, 1);
  assert.equal(page.url(), origin + '/contact');
  assert.equal(await form.locator('#contact-message').inputValue(), ' No real message. ');
  assert.equal(await page.getByText('Opening your email app', { exact: true }).count(), 0);
  assert.match(decodeURIComponent(await emailLink.getAttribute('href')), /^mailto:[^?]+\?subject=Fixture&body=Name: Fixture User\nEmail: fixture@example.test\n\nNo real message\.$/);
  await contrast(page, 'form [role="alert"]');
  await capture(form, 'contact-error-' + width);

  await button.focus();
  await page.keyboard.press('Tab');
  assert(await emailLink.evaluate((el) => el === document.activeElement));
  await emailLink.evaluate((el) => el.addEventListener('click', (event) => {
    event.preventDefault();
    el.dataset.keyboardActivated = 'true';
  }, { once: true }));
  await page.keyboard.press('Enter');
  assert.equal(await emailLink.getAttribute('data-keyboard-activated'), 'true');

  providerState = 'network';
  await button.click();
  await alert.filter({ hasText: 'Unable to connect' }).waitFor();
  assert.equal(submitted, 2);

  providerState = 'unconfigured';
  await button.click();
  await alert.filter({ hasText: 'Online delivery is currently unavailable' }).waitFor();
  assert.equal(submitted, 3);

  providerState = 'success';
  await button.click();
  await form.getByRole('heading', { name: 'Message Sent Directly!' }).waitFor();
  assert.equal(submitted, 4);
  assert.equal(directProviderRequests, 0);
  assert.equal(await alert.count(), 0);
  await form.getByRole('button', { name: 'Send Another Message' }).click();
  assert.equal(await form.locator('#contact-message').inputValue(), '');
  await page.unroute(provider);
  await page.unroute('**/api/contact');
}


async function verifyResume(page, width) {
  await visit(page, '/resume');
  const button = page.getByRole('button', { name: /Copy ATS Text/ });
  await button.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => typeof window.finishClipboard === 'function');
  assert.equal(await button.getAttribute('aria-disabled'), 'true');
  assert.equal(await page.getByText('Plain text resume copied to clipboard!', { exact: true }).count(), 0);
  assert(await button.evaluate((el) => el === document.activeElement));
  assert.equal(await page.locator('textarea').count(), 0);
  await page.evaluate(() => window.finishClipboard(false));
  const error = page.locator('main').getByRole('alert');
  await error.filter({ hasText: 'Could not copy the résumé' }).waitFor();
  assert.equal(await page.getByText('Plain text resume copied to clipboard!', { exact: true }).count(), 0);
  await contrast(page, 'main [role="alert"]');
  await capture(page.locator('main > div').first(), 'resume-error-' + width);

  const print = page.getByRole('button', { name: 'Print / Save PDF' });
  await print.click();
  assert.equal(await page.evaluate(() => window.printed), true);
  await page.emulateMedia({ media: 'print' });
  assert.equal(await error.isVisible(), false);
  await page.emulateMedia({ media: 'screen' });

  await button.click();
  await page.waitForFunction(() => typeof window.finishClipboard === 'function');
  await page.evaluate(() => window.finishClipboard(true));
  await page.getByRole('button', { name: 'Copied to Clipboard!' }).waitFor();
  assert.match(await page.evaluate(() => window.copiedText), /MEET KAPADIA/);
  assert.equal(await error.count(), 0);
}

async function verifyCalendar(page, width, origin = base) {
  await visit(page, '/achievements', origin);
  const section = page.locator('#achievement-github');
  await section.waitFor();
  const repo = section.getByText(/Repository (data from GitHub|reference data)/);
  await repo.waitFor();
  const region = section.getByRole('region', { name: 'Contribution calendar' });
  await region.waitFor();
  assert.equal(await section.locator('input[type="date"]').count(), 0);
  const chart = region.locator('svg.heatmap-weeks');
  if (await chart.count()) {
    assert(await chart.isVisible());
    await section.getByText('Calendar data from GitHub', { exact: true }).waitFor();
  } else {
    await region.getByText('GitHub contribution data is currently unavailable.').waitFor();
    assert.equal(await section.locator('.heatmap-metric-card').count(), 0);
  }
  assert.equal(await section.getByText(/cached snapshot|sync.*hourly/i).count(), 0);
  assert(await page.evaluate(() => document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth));
  await capture(section, 'github-' + width);
}

async function verifyCalendarRetry(page, origin) {
  let complete;
  let notifyIntercept;
  const intercepted = new Promise((resolve) => { notifyIntercept = resolve; });
  await page.route('**/api/github-calendar', async (route) => {
    await new Promise((resolve) => { complete = resolve; notifyIntercept(); });
    await route.fulfill({ json: {
      totalContributions: 2, currentStreak: 1, longestStreak: 1,
      maxDay: { date: '2026-10-03', count: 2 },
      weeks: [[{ id: 'sat', date: '2026-10-03', count: 2, level: 2 }]],
      monthLabels: [{ month: 'Oct', weekIndex: 0 }],
    } });
  });
  await visit(page, '/achievements', origin);
  const section = page.locator('#achievement-github');
  await section.getByText('GitHub contribution data is currently unavailable.').waitFor();
  assert.equal(await section.locator('.heatmap-metric-card').count(), 0);
  const repositoryLabel = section.getByText(/Repository (data from GitHub|reference data)/);
  const before = await repositoryLabel.innerText();
  await intercepted;
  complete();
  await section.getByText('Calendar data from GitHub', { exact: true }).waitFor();
  assert.equal(await repositoryLabel.innerText(), before);
  assert.match(await section.locator('path.level-2').getAttribute('d'), /^M3 94h/);
  assert.equal(await section.locator('input[type="date"]').count(), 0);
}

try {
  if (screenshots) await mkdir(screenshots, { recursive: true });
  for (const [width, scheme, seed] of [[320, 'light', '#6142AE'], [390, 'dark', null], [768, 'dark', '#006A60'], [1440, 'light', null]]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 }, hasTouch: width < 600, isMobile: width < 600,
      colorScheme: scheme, reducedMotion: 'reduce',
    });
    const palette = seed ? { ...createDynamicColorRecord(seed), mode: 'seed' } : { mode: 'default' };
    await context.addInitScript(({ palette, scheme }) => {
      localStorage.setItem('portfolio-color-palette', JSON.stringify(palette));
      localStorage.setItem('portfolio-theme', scheme);
      sessionStorage.setItem('meet-portfolio-intro-seen-v3', 'true');
      document.execCommand = () => { throw new Error('Legacy copy denied'); };
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: (text) => new Promise((resolve, reject) => {
        window.finishClipboard = (allow) => {
          delete window.finishClipboard;
          if (!allow) return reject(new Error('Clipboard denied'));
          window.copiedText = text;
          resolve();
        };
      }) } });
      window.print = () => { window.printed = true; };
    }, { palette, scheme });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      const url = message.location().url;
      if (url.startsWith(provider) || url.endsWith('/api/github-calendar') || url.endsWith('/api/contact')) return;
      errors.push(message.text());
    });
    await verifyContact(page, width);
    await verifyResume(page, width);
    await verifyCalendar(page, width);
    assert.deepEqual(errors, []);
    console.log(width + ' px ' + scheme + ' ' + (seed ?? 'Default') + ' Contact, Resume, GitHub and scoped axe passed');
    await context.close();
  }

  if (process.env.PHASE_2_FIXTURE_URL) {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await verifyCalendarRetry(page, process.env.PHASE_2_FIXTURE_URL);
    await verifyContact(page, '390-runtime-config', process.env.PHASE_2_FIXTURE_URL);
    await context.close();
    console.log('Calendar recovery, weekday placement, repository provenance and runtime Contact configuration passed');
  }
} finally {
  await browser.close();
}

