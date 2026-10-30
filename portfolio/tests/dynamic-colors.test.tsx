import assert from "node:assert/strict";
import test from "node:test";
import { createDynamicColorRecord } from "../lib/dynamic-colors";
import { projectAccentStyle } from "../lib/project-accent";

function luminance(hex: string) {
  const channels = hex.slice(1).match(/.{2}/g)!.map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("seed-derived HCT palettes provide complete light and dark semantic roles with checked contrast", () => {
  const presetSeeds = ["#6142AE", "#006A60", "#805600", "#9A405D"];
  const customSeeds = ["#FFFFFF", "#000000", "#FF00FF", "#7F8081", "#C0FF00"];
  for (const seed of [...presetSeeds, ...customSeeds]) {
    const record = createDynamicColorRecord(seed);
    assert.ok(record, `${seed} should produce a contrast-safe palette`);
    assert.equal(record.seed, seed.toUpperCase(), `${seed} must retain its own source seed`);
    for (const roles of [record.light, record.dark]) {
      assert.ok(roles.primary && roles["on-primary"] && roles.background && roles.surface);
      for (const role of [
        "surface-container-lowest", "surface-container-low", "surface-container",
        "surface-container-high", "surface-container-highest", "surface-dim", "surface-bright",
        "shadow", "scrim", "surface-tint",
      ]) assert.match(roles[role] ?? "", /^#[\da-f]{6}$/i, `${seed} missing ${role}`);
      for (const [surface, foreground] of [
        ["primary", "on-primary"], ["primary-container", "on-primary-container"],
        ["secondary", "on-secondary"], ["secondary-container", "on-secondary-container"],
        ["tertiary", "on-tertiary"], ["tertiary-container", "on-tertiary-container"],
        ["error", "on-error"], ["error-container", "on-error-container"],
        ["background", "on-background"], ["surface", "on-surface"],
        ["surface-variant", "on-surface-variant"], ["inverse-surface", "inverse-on-surface"],
      ]) assert.ok(contrast(roles[surface], roles[foreground]) >= 4.5, `${seed} ${surface}/${foreground}`);
      for (const background of [
        "background", "surface", "surface-variant", "surface-container-lowest", "surface-container-low",
        "surface-container", "surface-container-high", "surface-container-highest",
      ]) {
        assert.ok(contrast(roles[background], roles["on-surface"]) >= 4.5, `${seed} ${background}/on-surface`);
        assert.ok(contrast(roles[background], roles["on-surface-variant"]) >= 4.5, `${seed} ${background}/on-surface-variant`);
        assert.ok(contrast(roles[background], roles.outline) >= 3, `${seed} ${background}/outline`);
        assert.ok(contrast(roles[background], roles["outline-variant"]) >= 3, `${seed} ${background}/outline-variant`);
      }
      for (const accent of ["primary", "secondary", "tertiary"]) {
        for (const background of [
          "background", "surface", "surface-variant", "surface-container-lowest", "surface-container-low",
          "surface-container", "surface-container-high", "surface-container-highest",
        ]) assert.ok(contrast(roles[accent], roles[background]) >= 4.5, `${seed} ${accent}/${background}`);
      }
    }
  }
});

test("invalid seeds are rejected instead of generating an unverified palette", () => {
  assert.equal(createDynamicColorRecord("not-a-color"), null);
});

test("project accents are serialized as scoped roles and never as document-wide role mutations", () => {
  assert.equal(projectAccentStyle(null), undefined);
  const style = projectAccentStyle("#006A60");
  assert.ok(style);
  const projectRoles = style as Record<string, string>;
  assert.equal(projectRoles["--project-light-primary"], createDynamicColorRecord("#006A60")?.light.primary);
  assert.equal(projectRoles["--project-dark-on-primary-container"], createDynamicColorRecord("#006A60")?.dark["on-primary-container"]);
  assert.equal(projectRoles["--project-light-surface-container-high"], createDynamicColorRecord("#006A60")?.light["surface-container-high"]);
  assert.equal(projectRoles["--project-dark-tertiary"], createDynamicColorRecord("#006A60")?.dark.tertiary);
  assert.equal(Object.keys(projectRoles).length, Object.keys(createDynamicColorRecord("#006A60")!.light).length * 2);
  assert.equal("--color-primary" in projectRoles, false);
});
