import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AboutPage } from "../components/about/about-page";
import { aboutCopy, profile } from "../content/profile";
import { experience } from "../content/achievements";
import { skills } from "../content/skills";

const suppliedBio = "I'm a Computer Science undergraduate at IIIT Vadodara with a strong interest in building practical software products. I enjoy working across the software development process, from creating responsive interfaces to implementing backend logic, designing data flows, and integrating external services. My interests include full-stack development, backend systems, database engineering, data structures and algorithms, and applied artificial intelligence. I believe the best way to learn software engineering is to build, test, debug, and continuously improve real projects.";
const render = () => renderToStaticMarkup(<AboutPage />);

test("About preserves the exact supplied bio independently of Home copy", () => {
  assert.equal(aboutCopy.bio, suppliedBio);
  const text = render().replaceAll("&#x27;", "'");
  assert.ok(text.includes(suppliedBio));
  assert.equal(profile.description, "I'm a Computer Science undergraduate at IIIT Vadodara interested in full-stack development, backend engineering, databases, and applied AI/ML. I enjoy turning ideas into functional products, exploring system design, and solving challenging programming problems.");
});

test("About renders all six requested sections and no placeholder", () => {
  const html = render();
  const sections = [...html.matchAll(/<section[^>]*id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(sections, ["about-bio", "about-education", "about-experience", "about-campus", "about-learning", "about-next"]);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((html.match(/<h2\b/g) ?? []).length, 6);
  assert.ok(!html.includes("A little more, soon.") && !html.includes("null") && !html.includes("undefined"));
});

test("education and internship use supplied facts without an invented CGPA scale or document links", () => {
  const html = render();
  assert.ok(html.includes(profile.education.institution) && html.includes(profile.education.field));
  // React can separate adjacent text nodes with comments; remove them for text comparison.
  const text = html.replace(/<!--.*?-->/g, "");
  assert.ok(text.includes("2024–2028") && text.includes("<dd>8.31</dd>"));
  for (const item of experience.filter((item) => item.visibility === "public")) {
    assert.ok(html.includes(item.title));
    if (item.organization) assert.ok(html.includes(item.organization));
    if (item.description) assert.ok(html.includes(item.description));
    if (item.dateLabel) assert.ok(html.includes(item.dateLabel));
    for (const document of item.documents ?? []) assert.ok(html.includes(document.label));
  }
  assert.equal(profile.education.cgpaScale, null);
  assert.ok(!html.includes("<a ")); // Current certificate/recommendation URLs are unknown.
});

test("campus, current learning and future interests come only from the content layer", () => {
  const html = render();
  for (const community of profile.campus) assert.ok(html.includes(community));
  for (const topic of skills.find((group) => group.id === "learning")!.items) assert.ok(html.includes(topic));
  for (const topic of aboutCopy.exploreNext) {
    assert.ok(suppliedBio.toLowerCase().includes(topic.toLowerCase()));
    assert.ok(html.includes(topic));
  }
});
