import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createDynamicColorRecord } from "../lib/dynamic-colors";

const css = readFileSync(new URL("../styles/themes.css", import.meta.url), "utf8");

function luminance(hex: string) {
  const channels = hex.slice(1).match(/.{2}/g)!.map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function parseRoles(block: string) {
  return Object.fromEntries(Array.from(block.matchAll(/--color-([\da-z-]+):\s*(#[\da-f]{6})/gi), (match) => [match[1], match[2]]));
}

function parseDefaultColors(block: string) {
  return Object.fromEntries(Array.from(block.matchAll(/--(default-[\da-z-]+):\s*(#[\da-f]{6})/gi), (match) => [match[1], match[2]]));
}

function defaultBlock(selector: string) {
  return css.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1];
}

test("hand-designed Default light and dark themes keep accessible text and icon pairs", () => {
  const lightBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1];
  const darkBlock = css.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.ok(lightBlock);
  assert.ok(darkBlock);
  for (const [mode, roles] of [["light", parseRoles(lightBlock)], ["dark", parseRoles(darkBlock)]] as const) {
    for (const [background, foreground] of [
      ["primary", "on-primary"], ["primary-container", "on-primary-container"],
      ["secondary", "on-secondary"], ["secondary-container", "on-secondary-container"],
      ["tertiary", "on-tertiary"], ["tertiary-container", "on-tertiary-container"],
      ["error", "on-error"], ["error-container", "on-error-container"],
      ["background", "on-background"], ["surface", "on-surface"],
      ["surface-variant", "on-surface-variant"], ["inverse-surface", "inverse-on-surface"],
    ]) assert.ok(contrast(roles[background], roles[foreground]) >= 4.5, `${mode} ${background}/${foreground}`);
    const surfaces = ["background", "surface", "surface-variant", "surface-container-lowest", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest"];
    for (const surface of surfaces) {
      assert.ok(contrast(roles[surface], roles["on-surface"]) >= 4.5, `${mode} ${surface}/on-surface`);
      assert.ok(contrast(roles[surface], roles["on-surface-variant"]) >= 4.5, `${mode} ${surface}/on-surface-variant`);
      assert.ok(contrast(roles[surface], roles.outline) >= 3, `${mode} ${surface}/outline`);
    }
  }
  const light = parseRoles(lightBlock);
  const dark = parseRoles(darkBlock);
  assert.ok(contrast(light.secondary, "#292431") >= 4.5, "light lime logo foreground");
  assert.ok(contrast(light.secondary, "#46551A") >= 4.5, "light lime hero icon");
  assert.ok(contrast(light.secondary, "#5F702A") >= 4.5, "adjusted light lime About icon");
  assert.ok(contrast(dark.secondary, "#283815") >= 4.5, "dark lime logo foreground");
  assert.ok(contrast(dark.secondary, "#2B3D14") >= 4.5, "dark lime hero and About icons");
});

test("Default restores the historical hand-designed roles while generated seeds remain project-scoped", () => {
  const lightBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1];
  const darkBlock = css.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1];
  const generated = createDynamicColorRecord("#006A60");
  assert.ok(lightBlock && darkBlock && generated);
  const staticThemes = { light: parseRoles(lightBlock), dark: parseRoles(darkBlock) };
  assert.equal(staticThemes.light.primary, "#6142AE");
  assert.equal(staticThemes.light.secondary, "#E3F29C");
  assert.equal(staticThemes.light.tertiary, "#865336");
  assert.equal(staticThemes.light.background, "#FAF8F3");
  assert.equal(staticThemes.light.surface, "#FFFDF9");
  assert.equal(staticThemes.dark.primary, "#CFB7FF");
  assert.equal(staticThemes.dark.secondary, "#CBE78D");
  assert.equal(staticThemes.dark.background, "#141318");
  assert.equal(staticThemes.dark.surface, "#211F27");
  assert.equal(staticThemes.dark["surface-container-highest"], "#2D2935");
  const projectMapping = css.slice(css.indexOf("/* A scoped project seed"));
  for (const theme of ["light", "dark"] as const) {
    for (const role of Object.keys(generated[theme])) {
      assert.ok(projectMapping.includes(`--color-${role}: var(--project-${theme}-${role})`), `${theme} ${role} should be project-scoped`);
    }
  }
  for (const token of [
    "default-home-status-foreground", "default-home-stack-background", "default-project-card-outline",
    "default-project-chip-background", "default-project-exploration-background", "default-project-tone-0-panel",
  ]) assert.ok(projectMapping.includes(`--${token}: initial`), `${token} should not leak into a project accent`);
});

test("Default's restored component accents retain readable foreground/background pairs", () => {
  const lightBlock = defaultBlock(":root\\[data-color-palette=\\\"default\\\"\\]");
  const darkBlock = defaultBlock(":root\\[data-theme=\\\"dark\\\"\\]\\[data-color-palette=\\\"default\\\"\\]");
  assert.ok(lightBlock && darkBlock);

  const themes = {
    light: parseDefaultColors(lightBlock),
    dark: parseDefaultColors(darkBlock),
  };
  const pairs = [
    ["default-hero-label-selected-foreground", "default-hero-label-selected-background"],
    ["default-hero-caption", "default-hero-art-background"],
    ["default-hero-message", "default-hero-bloom"],
    ["default-about-bio-copy", "default-about-bio-background"],
    ["default-about-bio-heading", "default-about-bio-background"],
    ["default-about-year-foreground", "default-about-year-background"],
    ["default-about-learning-foreground", "default-about-learning-background"],
    ["default-about-next-foreground", "default-about-next-background"],
    ["default-project-filter-label", "default-project-filter-background"],
    ["default-project-filter-hover-foreground", "default-project-filter-hover"],
    ["default-project-count-foreground", "default-project-count-background"],
    ["default-project-chip-foreground", "default-project-chip-background"],
    ["default-project-exploration-foreground", "default-project-exploration-background"],
    ["default-achievement-profile-foreground", "default-achievement-profile-background"],
    ["default-achievement-profile-metric", "default-achievement-profile-background"],
    ["default-contact-foreground", "default-contact-background"],
  ];

  for (const [theme, colors] of Object.entries(themes)) {
    for (const [foreground, background] of pairs) {
      assert.ok(contrast(colors[background], colors[foreground]) >= 4.5, `${theme} ${foreground}/${background}`);
    }
    for (let index = 0; index < 5; index += 1) {
      const prefix = `default-project-tone-${index}`;
      assert.ok(contrast(colors[`${prefix}-icon`], colors[`${prefix}-icon-foreground`]) >= 4.5, `${theme} ${prefix} icon pair`);
      assert.ok(contrast(colors[`${prefix}-panel`], colors[`${prefix}-number`]) >= 4.5, `${theme} ${prefix} number pair`);
      assert.ok(contrast(colors[`${prefix}-panel`], colors["default-project-tag"]) >= 4.5, `${theme} ${prefix} tag pair`);
    }
  }
});
