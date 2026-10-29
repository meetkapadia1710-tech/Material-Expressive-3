import assert from "node:assert/strict";
import test from "node:test";
import { createDynamicColorRecord } from "../lib/dynamic-colors";

function luminance(hex: string) {
  const channels = hex.slice(1).match(/.{2}/g)!.map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("expressive HCT seeds provide light and dark semantic roles with checked contrast", () => {
  for (const seed of ["#6142AE", "#006A60", "#805600", "#9A405D", "#12AB34"]) {
    const record = createDynamicColorRecord(seed);
    assert.ok(record, `${seed} should produce a contrast-safe palette`);
    assert.equal(record.seed, seed);
    for (const roles of [record.light, record.dark]) {
      assert.ok(roles.primary && roles["on-primary"] && roles.background && roles.surface);
      for (const [surface, foreground] of [
        ["primary", "on-primary"], ["primary-container", "on-primary-container"],
        ["secondary", "on-secondary"], ["secondary-container", "on-secondary-container"],
        ["tertiary", "on-tertiary"], ["tertiary-container", "on-tertiary-container"],
        ["error", "on-error"], ["error-container", "on-error-container"],
        ["background", "on-background"], ["surface", "on-surface"],
        ["surface-variant", "on-surface-variant"], ["inverse-surface", "inverse-on-surface"],
      ]) assert.ok(contrast(roles[surface], roles[foreground]) >= 4.5, `${seed} ${surface}/${foreground}`);
      assert.ok(contrast(roles.outline, roles.surface) >= 3, `${seed} outline/surface`);
      assert.ok(contrast(roles["outline-variant"], roles.surface) >= 3, `${seed} outline-variant/surface`);
    }
  }
});

test("invalid seeds fall back instead of generating an unverified palette", () => {
  assert.equal(createDynamicColorRecord("not-a-color"), null);
});
