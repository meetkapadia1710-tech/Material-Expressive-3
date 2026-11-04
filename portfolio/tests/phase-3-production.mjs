import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const base = process.env.MOBILE_URL ?? 'http://127.0.0.1:4411';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const zero = { count: 0, percentage: 0 };

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  const home = await page.goto(base);
  assert.equal(home.status(), 200);
  const headers = home.headers();
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['x-frame-options'], 'SAMEORIGIN');
  assert.equal(headers['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.match(headers['permissions-policy'], /camera=\(\)/);
  const settings = await page.request.get(base + '/api/contact');
  assert.equal(settings.headers()['cache-control'], 'no-store');
  const config = await settings.json();
  assert.deepEqual(Object.keys(config), ['configured']);
  assert.equal(typeof config.configured, 'boolean');
  const tooLarge = await page.request.post(base + '/api/contact', { data: { extra: 'é'.repeat(33_000) } });
  assert.equal(tooLarge.status(), 413);

  const selected = page.locator('main button[data-active][aria-pressed="true"]');
  const category = page.locator('main button[data-active][aria-pressed="false"]').first();
  assert.equal(await selected.count(), 1);
  const label = await category.innerText();
  await category.click();
  assert.equal(await selected.count(), 1);
  assert.equal(await selected.innerText(), label);

  await page.keyboard.press('Control+k');
  const query = page.getByRole('combobox', { name: 'Search pages, projects, and actions' });
  await query.fill('RepoGrade');
  await query.press('Home');
  assert.equal(await query.evaluate((input) => input.selectionStart), 0);
  await query.press('End');
  assert.equal(await query.evaluate((input) => input.selectionStart), 'RepoGrade'.length);
  await query.press('Escape');

  await page.goto(base + '/about');
  assert.equal(await page.locator('.about-principle-card h3').count(), 4);
  assert.equal(await page.locator('.about-topic-item[tabindex]').count(), 0);
  const axe = await new AxeBuilder({ page }).withRules(['heading-order']).analyze();
  assert.deepEqual(axe.violations.map((rule) => rule.id), []);

  await page.goto(base + '/projects/coastal-blue-carbon');
  assert.equal(await page.locator('.detail-aside').count(), 0);
  await page.goto(base + '/projects/repograde');
  assert.equal(await page.locator('.detail-aside').count(), 1);
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://meetkapadia.dev/projects/repograde');
  const missing = await page.goto(base + '/phase-38-404');
  assert.equal(missing.status(), 404);
  assert.match(await page.title(), /page not found/i);
  assert.match(await page.locator('meta[name=robots]').getAttribute('content'), /noindex/);
  assert.equal(await page.locator('link[rel=canonical]').count(), 0);

  await page.route('**/api/leetcode', (route) => route.fulfill({ json: {
    total: 0, totalDisplay: '0', easy: zero, medium: zero, hard: zero, recent: [],
  } }));
  await page.goto(base + '/achievements');
  const difficulties = page.getByRole('radiogroup', { name: 'Difficulty Filter' });
  const all = difficulties.getByRole('radio', { name: 'All (0)' });
  await all.waitFor();
  await all.focus();
  await page.keyboard.press('ArrowRight');
  const easy = difficulties.getByRole('radio', { name: 'Easy (0)' });
  assert.equal(await easy.getAttribute('aria-checked'), 'true');
  assert(await easy.evaluate((el) => el === document.activeElement));
  assert.equal(await difficulties.locator('[tabindex="0"]').count(), 1);
  assert.equal(await page.locator('.leetcode-recent-section').count(), 0);
  assert.equal(await page.locator('svg [stroke-dasharray*="NaN"]').count(), 0);
  assert.equal(await page.locator('#achievement-github input[type=date]').count(), 0);
  assert.deepEqual(errors, []);

  const print = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  await print.goto(base + '/resume');
  assert.equal(await print.locator('html').getAttribute('data-intro-pending'), null);
  await print.emulateMedia({ media: 'print' });
  assert.equal(await print.getByRole('button', { name: 'Print / Save PDF' }).count(), 0);
  assert.equal(await print.locator('article h1').evaluate((el) => getComputedStyle(el).color), 'rgb(0, 0, 0)');
  console.log('Production headers, contact boundaries, accessibility, SEO, LeetCode zero state and print checks passed');
} finally {
  await browser.close();
}

