import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SkillsPage } from "../components/skills/skills-page";
import { skillCategories, skills, skillsPageCopy } from "../content/skills";
import type { SkillCategory } from "../content/types";
import { groupSkillItems } from "../lib/skill-groups";

test("every content item appears once under its category, without losing the legacy string view", () => {
  const html = renderToStaticMarkup(<SkillsPage />);
  assert.equal((html.match(/<section\b/g) ?? []).length, skillCategories.length);
  assert.equal(new Set(skillCategories.map((category) => category.id)).size, skillCategories.length);
  for (const category of skillCategories) {
    assert.ok(html.includes(`id="skills-${category.id}-heading"`));
    assert.deepEqual(skills.find((group) => group.id === category.id)?.items, category.items.map((item) => item.name));
    for (const item of category.items) assert.equal(html.split(`<li>${item.name}</li>`).length - 1, 1);
  }
});

test("named AI study topics, fundamentals and current learning are not presented as hands-on", () => {
  const ai = groupSkillItems(skillCategories.find((group) => group.id === "ai-ml")!);
  assert.deepEqual(ai.handsOn.map((item) => item.name), ["Gemini integration", "Groq integration", "Ollama integration", "RAG"]);
  assert.deepEqual(ai.learningStudy.map((item) => item.name), ["Bayesian inference", "HMM", "EM", "K-means", "GMM"]);
  const current = groupSkillItems(skillCategories.find((group) => group.id === "learning")!);
  assert.equal(current.handsOn.length, 0);
  assert.ok(current.learningStudy.every((item) => item.practice === "learning"));
  assert.equal(groupSkillItems(skillCategories.find((group) => group.id === "fundamentals")!).handsOn.length, 0);
});

test("new categories and items render through data alone", () => {
  // Fixtures demonstrate extensibility, not new claims about Meet's skills.
  const category: SkillCategory = { id: "fixture", name: "Fixture category", items: [{ name: "Fixture practical tool", practice: "hands-on" }, { name: "Fixture learning topic", practice: "learning" }, { name: "Fixture study topic", practice: "study" }], overview: "Fixture summary", note: null };
  const html = renderToStaticMarkup(<SkillsPage categories={[category]} />);
  assert.ok(html.includes(category.name));
  assert.ok(html.includes(skillsPageCopy.groupLabels.handsOn));
  assert.ok(html.includes(skillsPageCopy.groupLabels.learningStudy));
  for (const item of category.items) assert.ok(html.includes(`<li>${item.name}</li>`));
});

test("empty categories, empty items and absent subgroup headings are omitted", () => {
  const empty: SkillCategory = { id: "empty", name: "Empty category", items: [{ name: "  ", practice: "study" }], overview: "", note: null };
  const html = renderToStaticMarkup(<SkillsPage categories={[empty]} />);
  assert.ok(!html.includes("<section") && !html.includes("<h3") && !html.includes("null"));
  const single: SkillCategory = { ...empty, id: "single", name: "Single category", items: [{ name: "A study topic", practice: "study" }] };
  const singleHtml = renderToStaticMarkup(<SkillsPage categories={[single]} />);
  assert.ok(!singleHtml.includes('data-practice="hands-on"'));
  assert.ok(singleHtml.includes('data-practice="learning-study"'));
});

test("skills are text lists with no ratings, percentages, progress widgets or badges", () => {
  const html = renderToStaticMarkup(<SkillsPage />);
  assert.ok(html.includes("<ul>") && html.includes("<li>"));
  assert.ok(!/<(?:progress|meter)\b|role="progressbar"|\d+\s*%|\bbadge\b/i.test(html));
});
