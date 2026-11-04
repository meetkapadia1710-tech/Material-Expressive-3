import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
const engines = { chromium, firefox, webkit };
const base = process.env.MOBILE_URL ?? 'http://127.0.0.1:4420';
const engine = process.env.PHASE4_ENGINE ?? 'chromium';
const fixtures = { name: 'Example', email: 'example@example.test', subject: 'Fixture', message: 'Local fixture only.' };
const mainRoutes = ['/', '/about', '/projects', '/projects/repograde', '/skills', '/achievements', '/contact', '/resume', '/phase-38-404'];

async function visit(page, route) {
  const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('[data-route-ready=true]').waitFor({ state: 'attached' });
  return response;
}

async function verifySections(browser, width, motion) {
  const context = await browser.newContext({
    viewport: { width, height: 820 }, hasTouch: width < 600, reducedMotion: motion,
  });
  try {
    const page = await context.newPage();
    await page.goto(base + '/achievements');
    await page.locator('[data-route-ready=true]').waitFor({ state: 'attached' });
    await page.locator('#achievement-github').waitFor();
    const nav = page.getByRole('navigation', { name: 'Achievements sections' });
    const checkLanding = async (link) => {
      const hash = await link.getAttribute('href');
      await page.waitForFunction((fragment) => {
        const bar = document.querySelector('.achievements-nav-wrapper');
        const heading = document.getElementById(fragment.slice(1))?.querySelector('h2');
        if (!bar || !heading) return false;
        const top = heading.getBoundingClientRect().top;
        const barBottom = bar.getBoundingClientRect().bottom;
        return location.hash === fragment && top >= barBottom + 2 && top <= barBottom + 36 &&
          document.querySelector('.nav-segment-button[aria-current="location"]')?.getAttribute('href') === fragment;
      }, hash);
      // Let any leftover smooth scroll settle before checking the selected chip.
      await page.waitForTimeout(300);
      assert.equal(await link.getAttribute('aria-current'), 'location');
      assert.equal(await nav.locator('[aria-current="location"]').count(), 1);
    };
    for (const label of ['Hackathons', 'Certifications', 'Coding Profiles', 'GitHub Activity', 'Experience']) {
      const link = nav.getByRole('link', { name: label, exact: true });
      await link.click();
      await checkLanding(link);
    }
    await nav.getByRole('link', { name: 'Experience', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await checkLanding(nav.getByRole('link', { name: 'Hackathons', exact: true }));
  } finally {
    await context.close();
  }
}

async function verifyStartup(browser) {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(base, { waitUntil: 'domcontentloaded' });
  await desktop.locator('.intro-loader-pass').waitFor();
  assert.equal(await desktop.locator('#portfolio-intro canvas').count(), 0);
  await desktop.keyboard.press('Escape');
  await desktop.locator('#portfolio-intro').waitFor({ state: 'hidden' });
  await desktop.waitForFunction(() => document.activeElement?.id === 'main-content');
  await desktop.getByRole('button', { name: /Inspect 3D Pass/ }).click();
  const pass = desktop.getByRole('dialog', { name: /M3 Interactive Pass/ });
  await pass.locator('canvas').waitFor();
  await desktop.context().close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 820 }, isMobile: true, hasTouch: true });
  await mobile.addInitScript(() => {
    window.centerCountChanges = 0;
    new MutationObserver((records) => {
      for (const record of records) {
        const element = record.target instanceof Element ? record.target : record.target.parentElement;
        if (element?.closest('.leetcode-center-count')) window.centerCountChanges++;
      }
    }).observe(document, { subtree: true, childList: true, characterData: true });
  });
  await mobile.goto(base + '/achievements');
  const count = mobile.locator('.leetcode-center-count');
  assert((await count.boundingBox()).y > 820);
  await mobile.waitForTimeout(900);
  assert((await mobile.evaluate(() => window.centerCountChanges)) <= 3, 'offscreen count ran an animation');
  await mobile.context().close();
}

(async () => {
  const browser = await engines[engine].launch(engine === 'chromium' ? { executablePath: process.env.CHROME_PATH } : {});
  const coverage = [];
  try {
    for (const [width, height, scheme] of [[320, 640, 'light'], [390, 820, 'dark'], [844, 390, 'dark'], [1440, 900, 'light']]) {
      const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme,
        reducedMotion: 'reduce', hasTouch: width < 600 });
      const errors = [];
      const openPage = async () => {
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        return page;
      };
      // Test cold loads in fresh tabs, separately from real same-tab navigation.
      for (const route of mainRoutes) {
        const page = await openPage();
        const response = await visit(page, route);
        assert.equal(response.status(), route === '/phase-38-404' ? 404 : 200, route);
        assert(await page.locator('main h1').first().isVisible(), route);
        const geometry = await page.evaluate(() => [document.scrollingElement.scrollWidth, document.documentElement.clientWidth]);
        assert(geometry[0] <= geometry[1], route + ' horizontal overflow ' + geometry.join('/'));
        assert.equal(await page.locator('html').getAttribute('data-theme'), scheme);
        await page.close();
      }
      let page = await openPage();
      await visit(page, '/');
      const primaryNav = width < 600 ? page.getByRole('navigation', { name: 'Mobile Navigation' }) : page.locator('.site-header .navigation');
      await primaryNav.getByRole('link', { name: 'Projects', exact: true }).click();
      await page.waitForURL(base + '/projects');
      await page.waitForFunction(() => document.activeElement?.matches('main h1') &&
        document.activeElement.textContent === 'Projects.');
      const trigger = page.getByRole('button', { name: 'Quick preview of RepoGrade' });
      await trigger.focus();
      await page.keyboard.press('Enter');
      const preview = page.getByRole('dialog', { name: 'RepoGrade', exact: true });
      await preview.waitFor();
      assert(await preview.evaluate((el) => el.matches(':modal') && el.contains(document.activeElement)));
      await page.keyboard.press('Tab');
      assert(await preview.evaluate((el) => el.contains(document.activeElement)));
      await page.keyboard.press('Escape');
      await preview.waitFor({ state: 'hidden' });
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Quick preview of RepoGrade');
      await page.close();

      page = await openPage();
      await visit(page, '/skills');
      const radios = page.getByRole('radiogroup', { name: 'Competency matrix filter' });
      await radios.getByRole('radio', { name: 'All Skills' }).focus();
      await page.keyboard.press('ArrowRight');
      const selected = radios.getByRole('radio', { name: 'Production Stacks' });
      assert.equal(await selected.getAttribute('aria-checked'), 'true');
      assert(await selected.evaluate((el) => el === document.activeElement));
      await page.close();

      page = await openPage();
      await page.route('**/api/contact', (route) => {
        assert.equal(route.request().method(), 'POST');
        return route.fulfill({ status: 503, json: { success: false } });
      });
      await visit(page, '/contact');
      const submit = page.getByRole('button', { name: 'Send Message' });
      await submit.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.activeElement?.id === 'contact-name');
      for (const [field, value] of Object.entries(fixtures)) await page.locator('#contact-' + field).fill(value);
      await submit.focus();
      await page.keyboard.press('Enter');
      await page.locator('form').getByRole('alert').filter({ hasText: 'Online delivery is currently unavailable' }).waitFor();
      assert.equal(await page.locator('#contact-message').inputValue(), fixtures.message);
      assert.match(await page.getByRole('link', { name: 'Or open email app' }).getAttribute('href'), /^mailto:/);
      await page.close();

      page = await openPage();
      await visit(page, '/resume');
      await page.emulateMedia({ media: 'print' });
      assert.equal(await page.getByRole('button', { name: 'Print / Save PDF' }).count(), 0);
      await page.waitForFunction(() => {
        const heading = document.querySelector('article h1');
        return heading && getComputedStyle(heading).color === 'rgb(0, 0, 0)';
      });
      assert.deepEqual(errors, []);
      coverage.push(width + 'x' + height + ' ' + scheme);
      await context.close();
    }
    await verifySections(browser, 390, 'reduce');
    await verifySections(browser, 1440, 'no-preference');
    if (engine === 'chromium') await verifyStartup(browser);
    console.log(engine, browser.version(), 'PASS', coverage.join(', '), 'and Achievements section tracking');
  } finally { await browser.close(); }
})().catch((error) => { console.error(engine, error); process.exitCode = 1; });

