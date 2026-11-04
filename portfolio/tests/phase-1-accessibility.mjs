import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { createDynamicColorRecord } from '../lib/dynamic-colors.ts';
import { getPublicProjects, projects } from '../content/projects.ts';

const base = process.env.MOBILE_URL ?? 'http://127.0.0.1:4382';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const recentKey = 'portfolio-command-recent';
const reviewProjects = projects.filter((project) => project.visibility !== 'public');

async function visit(page, path) {
  assert.equal((await page.goto(base + path)).status(), 200, path);
  await page.locator('[data-route-ready="true"]').waitFor({ state: 'attached' });
}

async function focused(locator) {
  await locator.page().waitForFunction((el) => el === document.activeElement, await locator.elementHandle());
}

async function verifyPreview(page, compact) {
  await visit(page, '/projects');
  const trigger = page.getByRole('button', { name: 'Quick preview of RepoGrade' });
  const dialog = page.getByRole('dialog', { name: 'RepoGrade', exact: true });
  const first = dialog.getByRole('button', { name: 'Close project preview', exact: true });
  const last = dialog.getByRole('button', { name: 'Close Preview', exact: true });
  if (compact) await trigger.tap();
  else {
    await trigger.focus();
    await page.keyboard.press('Enter');
  }
  await dialog.waitFor();
  assert(await dialog.evaluate((el) => el.matches(':modal')));
  await focused(first);
  await trigger.evaluate((el) => el.focus());
  await focused(first);
  await page.keyboard.press('Shift+Tab');
  await focused(last);
  await page.keyboard.press('Tab');
  await focused(first);
  await page.keyboard.press('Tab');
  await focused(dialog.getByRole('link', { name: 'Explore Full Project' }));
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  await focused(trigger);

  await trigger.click();
  await first.click();
  await dialog.waitFor({ state: 'hidden' });
  await focused(trigger);

  await trigger.click();
  await last.click();
  await dialog.waitFor({ state: 'hidden' });
  await focused(trigger);

  await trigger.click();
  await dialog.waitFor();
  await page.mouse.click(4, 4);
  await dialog.waitFor({ state: 'hidden' });
  await focused(trigger);
  assert.notEqual(await page.locator('body').evaluate((el) => el.style.overflow), 'hidden');

  const reviewTrigger = page.getByRole('button', { name: 'Quick preview of Agrisetu' });
  await reviewTrigger.click();
  const reviewDialog = page.getByRole('dialog', { name: 'Agrisetu', exact: true });
  await reviewDialog.waitFor();
  assert.equal(await reviewDialog.getByRole('link', { name: 'Explore Full Project' }).count(), 0);
  await page.keyboard.press('Escape');
  await reviewDialog.waitFor({ state: 'hidden' });
  await focused(reviewTrigger);

  await trigger.click();
  await dialog.getByRole('link', { name: 'Explore Full Project' }).click();
  await page.waitForURL(base + '/projects/repograde');
  await page.getByRole('heading', { name: 'RepoGrade', exact: true }).waitFor();
  assert.notEqual(await page.locator('body').evaluate((el) => el.style.overflow), 'hidden');
}

async function verifySearch(page, compact) {
  await visit(page, '/');
  const trigger = page.getByRole('button', { name: 'Search pages, projects, and actions', exact: true });
  await trigger.waitFor();
  assert.equal(await trigger.getAttribute('aria-keyshortcuts'), 'Control+K Meta+K');
  assert.equal(await trigger.locator('span').isVisible(), !compact);
  if (!compact) {
    const shortcut = await trigger.locator('kbd').evaluate((el) => getComputedStyle(el, '::before').content);
    assert.match(shortcut, /Ctrl K/);
    const { violations } = await new AxeBuilder({ page }).include('.command-trigger')
      .withRules(['label-content-name-mismatch']).analyze();
    assert.deepEqual(violations.map(({ id }) => id), []);
  }

  await page.evaluate(({ key, review }) => {
    localStorage.setItem(key, JSON.stringify([...review, 'project:repograde', 'page:/projects']));
  }, { key: recentKey, review: reviewProjects.map(({ slug }) => 'project:' + slug) });
  if (compact) await trigger.tap();
  else await page.keyboard.press('Control+k');
  const input = page.getByRole('combobox', { name: 'Search pages, projects, and actions' });
  await input.waitFor();
  await focused(input);
  await page.waitForFunction((key) => localStorage.getItem(key) === '["project:repograde","page:/projects"]', recentKey);
  const publicOptions = page.getByRole('group', { name: 'Projects', exact: true }).getByRole('option');
  assert.equal(await publicOptions.count(), getPublicProjects().length);
  for (const { slug, name } of reviewProjects) {
    await input.fill(name);
    assert.equal(await page.locator('[role="option"][id$="-project-' + slug + '"]').count(), 0, slug);
  }
  await input.fill('RepoGrade');
  const result = page.getByRole('option', { name: /RepoGrade/ });
  await result.waitFor();
  if (compact) await result.tap();
  else await input.press('Enter');
  await page.waitForURL(base + '/projects/repograde');
}


async function verifySkills(page, compact) {
  await visit(page, '/skills');
  const search = page.getByRole('searchbox', { name: 'Filter skills or linked projects' });
  const modes = page.getByRole('radiogroup', { name: 'Competency matrix filter' });
  const all = modes.getByRole('radio', { name: 'All Skills' });
  const production = modes.getByRole('radio', { name: 'Production Stacks' });
  const theory = modes.getByRole('radio', { name: 'Theoretical Foundations' });
  const categories = page.getByRole('group', { name: 'Skill categories' });
  const allCategories = categories.getByRole('button', { name: 'All Categories' });
  await search.focus();
  await page.keyboard.press('Tab');
  await focused(all);
  for (const [key, selected] of [
    ['ArrowLeft', theory], ['ArrowUp', production], ['ArrowDown', theory], ['ArrowRight', all],
  ]) {
    await page.keyboard.press(key);
    await focused(selected);
    assert.equal(await selected.getAttribute('aria-checked'), 'true');
    assert.equal(await modes.locator('[role="radio"][tabindex="0"]').count(), 1);
  }
  await page.keyboard.press('Tab');
  await focused(allCategories);
  await page.keyboard.press('Tab');
  const languages = categories.getByRole('button', { name: 'Languages' });
  await focused(languages);
  await page.keyboard.press('Space');
  assert.equal(await languages.getAttribute('aria-pressed'), 'true');
  assert.equal(await allCategories.getAttribute('aria-pressed'), 'false');
  assert.equal(await page.getByRole('heading', { name: 'Frontend', exact: true }).count(), 0);
  if (compact) await allCategories.tap();
  else await allCategories.click();
  await page.getByRole('heading', { name: 'Frontend', exact: true }).waitFor();

  const tabs = page.getByRole('tablist', { name: 'Code snippet tabs' }).getByRole('tab');
  await tabs.first().focus();
  for (const [key, index] of [
    ['ArrowLeft', 2], ['Home', 0], ['ArrowRight', 1], ['End', 2], ['ArrowRight', 0],
  ]) {
    await page.keyboard.press(key);
    const selected = tabs.nth(index);
    await focused(selected);
    assert.equal(await selected.getAttribute('aria-selected'), 'true');
    assert.equal(await page.getByRole('tabpanel').count(), 1);
  }
  assert(await tabs.evaluateAll((elements) => elements.every((tab) => {
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    return panel?.getAttribute('aria-labelledby') === tab.id &&
      panel.hidden === (tab.getAttribute('aria-selected') !== 'true');
  })));
  await page.keyboard.press('Tab');
  await focused(page.getByRole('tabpanel').getByRole('button', { name: /Copy Code/ }));
  if (compact) await tabs.last().tap();
  else await tabs.last().click();
  assert.equal(await tabs.last().getAttribute('aria-selected'), 'true');
  const panel = page.getByRole('tabpanel');
  const code = (await panel.locator('.craftsmanship-line-text').allTextContents()).join('\n');
  await panel.getByRole('button', { name: /Copy Code/ }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert.equal(copied.replaceAll('\r\n', '\n'), code);
}

async function verifyContrast(page, scheme, seed) {
  await visit(page, '/skills');
  const theme = page.locator('html');
  assert.equal(await theme.getAttribute('data-theme'), scheme);
  assert.equal(await theme.getAttribute('data-color-palette'), seed ? 'seed' : 'default');
  if (seed) assert.equal(await theme.getAttribute('data-color-seed'), seed);
  const label = scheme + ' ' + (seed ?? 'Default');
  const tabs = page.getByRole('tablist', { name: 'Code snippet tabs' }).getByRole('tab');
  for (const tab of await tabs.all()) {
    await tab.click();
    await page.getByRole('tabpanel').waitFor();
    const { violations } = await new AxeBuilder({ page }).include('.craftsmanship-container')
      .withRules(['color-contrast']).analyze();
    assert.deepEqual(violations.flatMap(({ nodes }) => nodes.map((node) => node.failureSummary)), [], label + ' ' + await tab.innerText());
  }
}

try {
  for (const width of [1440, 390]) {
    const compact = width < 600;
    const context = await browser.newContext({
      viewport: { width, height: 850 },
      hasTouch: compact,
      isMobile: compact,
      reducedMotion: compact ? 'reduce' : 'no-preference',
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    await context.addInitScript(() => sessionStorage.setItem('meet-portfolio-intro-seen-v3', 'true'));
    const page = await context.newPage();
    await verifyPreview(page, compact);
    await verifySearch(page, compact);
    await verifySkills(page, compact);
    console.log(width + ' px preview, search, Skills interaction checks passed');
    await context.close();
  }

  for (const scheme of ['light', 'dark']) {
    for (const seed of [null, '#6142AE', '#006A60']) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce',
      });
      const palette = seed ? { ...createDynamicColorRecord(seed), mode: 'seed' } : { mode: 'default' };
      await context.addInitScript(({ palette, scheme }) => {
        localStorage.setItem('portfolio-color-palette', JSON.stringify(palette));
        localStorage.setItem('portfolio-theme', scheme);
      }, { palette, scheme });
      await verifyContrast(await context.newPage(), scheme, seed);
      console.log(scheme + ' ' + (seed ?? 'Default') + ' contrast passed for all 3 snippets');
      await context.close();
    }
  }
} finally {
  await browser.close();
}

