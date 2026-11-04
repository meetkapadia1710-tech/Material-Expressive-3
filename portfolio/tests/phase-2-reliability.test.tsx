import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { POST as postContact } from "../app/api/contact/route";
import { GET as getGFG } from "../app/api/gfg/route";
import { GET as getCalendar } from "../app/api/github-calendar/route";
import { GitHubSection } from "../components/achievements/github-section";
import { getGFGStats } from "../lib/geeksforgeeks";
import { getGitHubCalendar } from "../lib/github-calendar";

const validContact = { name: " Fixture ", email: " fixture@example.test ", subject: " Feedback ", message: " Test only. " };
const post = (body: string) => postContact(new Request("http://localhost/api/contact", { method: "POST", body }));

test("Contact POST rejects malformed, invalid and oversized requests before provider calls", async (t) => {
  const request = t.mock.method(globalThis, "fetch", async () => { throw new Error("unexpected fetch"); });
  for (const raw of ["{", "null", "[]", JSON.stringify({ name: 7 }), ...[
    { name: " ", subject: " ", message: " " }, { email: "invalid" },
    { email: `${"a".repeat(120)}@example.test` }, { message: "x".repeat(5001) },
  ].map((overrides) => JSON.stringify({ ...validContact, ...overrides }))]) {
    const response = await post(raw);
    assert.equal(response.status, 400, raw.slice(0, 40));
    assert.equal((await response.json()).success, false);
  }
  assert.equal((await post(JSON.stringify({ botcheck: "filled" }))).status, 200);
  assert.equal(request.mock.callCount(), 0);
});

test("Contact POST forwards normalized input and sanitizes configuration and provider failures", async (t) => {
  const keys = ["WEB3FORMS_ACCESS_KEY", "NEXT_PUBLIC_WEB3FORMS_KEY", "WEB3FORMS_KEY"];
  const savedKeys = keys.map((key) => process.env[key]);
  t.after(() => keys.forEach((key, index) => {
    const value = savedKeys[index];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }));
  for (const key of keys) delete process.env[key];

  const unavailable = await post(JSON.stringify(validContact));
  assert.equal(unavailable.status, 503);
  assert.doesNotMatch(await unavailable.text(), /ACCESS_KEY|\.env/);

  process.env.WEB3FORMS_ACCESS_KEY = "fixture-key";
  let mode = "success";
  const request = t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
    assert.deepEqual(JSON.parse(String(init.body)), {
      access_key: "fixture-key", name: "Fixture", email: "fixture@example.test",
      subject: "[Portfolio Contact] Feedback", message: "Test only.",
      from_name: "Fixture via Meet's Portfolio",
    });
    if (mode === "network") throw new Error("internal network details");
    if (mode === "malformed") return new Response("<html>private gateway details</html>");
    return Response.json({ success: true, message: "internal provider details" }, { status: mode === "success" ? 200 : 502 });
  });

  const success = await post(JSON.stringify(validContact));
  assert.equal(success.status, 200);
  assert.equal((await success.json()).success, true);
  for (mode of ["rejected", "malformed", "network"]) {
    const response = await post(JSON.stringify(validContact));
    assert.equal(response.status, 502, mode);
    const data = await response.json();
    assert.equal(data.success, false);
    assert.equal(data.fallbackMailto, true);
    assert.doesNotMatch(data.message, /internal|private|fixture-key/);
  }
  assert.equal(request.mock.callCount(), 4);
});

function htmlFixture(body: string): typeof fetch {
  return async () => new Response(body);
}

test("GFG parses complete metrics, keeps zero, and fails closed on consent and partial HTML", async () => {
  assert.deepEqual(await getGFGStats("fixture", htmlFixture('{"score":0,"total_problems_solved":0,"institute_rank":0}')),
    { username: "fixture", score: 0, problemsSolved: 0, instituteRank: 0 });
  assert.equal(await getGFGStats("fixture", htmlFixture('<html>Consent page</html>')), null);
  assert.equal(await getGFGStats("fixture", htmlFixture('{"score":327,"total_problems_solved":111}')), null);
});

function calendarDay(date: string, level: number, tooltip?: string) {
  return `<td data-level="${level}" id="day-${date}" data-date="${date}"></td>` +
    (tooltip ? `<tool-tip for="day-${date}">${tooltip}</tool-tip>` : "");
}

const saturday = calendarDay("2026-10-03", 2, "2 contributions on October 3rd.");
const sunday = calendarDay("2026-10-04", 1, "1 contribution on October 4th.");
const monday = calendarDay("2026-10-05", 0, "No contributions on October 5th.");
const verifiedCalendar = saturday + sunday + monday;

test("GitHub calendar calculates counts and streaks and groups a partial first week on UTC Sunday", async () => {
  const result = await getGitHubCalendar("fixture", htmlFixture(verifiedCalendar));
  assert.ok(result);
  assert.equal(result.totalContributions, 3);
  assert.equal(result.currentStreak, 2);
  assert.equal(result.longestStreak, 2);
  assert.deepEqual(result.maxDay, { date: "2026-10-03", count: 2 });
  assert.deepEqual(result.weeks.map((week) => week.map(({ date, count }) => [date, count])),
    [[["2026-10-03", 2]], [["2026-10-04", 1], ["2026-10-05", 0]]]);
  const zero = await getGitHubCalendar("fixture", htmlFixture(monday));
  assert.equal(zero?.totalContributions, 0);
  assert.equal(zero?.maxDay.date, "2026-10-05");
});

test("GitHub calendar rejects missing or inconsistent counts, duplicate dates and gaps", async () => {
  for (const html of [
    calendarDay("2026-10-05", 2),
    calendarDay("2026-10-05", 2, "No contributions on October 5th."),
    calendarDay("2026-02-30", 0, "No contributions."),
    saturday + monday,
    saturday + saturday,
  ]) assert.equal(await getGitHubCalendar("fixture", htmlFixture(html)), null, html);
});

test("Incomplete upstream HTML returns 502 from both data endpoints", async (t) => {
  t.mock.method(globalThis, "fetch", htmlFixture("<html>Consent page</html>"));
  assert.equal((await getGFG()).status, 502);
  assert.equal((await getCalendar()).status, 502);
});

test("GitHub section labels each source independently in all availability combinations", async (t) => {
  let repository = false;
  let calendar = false;
  t.mock.method(globalThis, "fetch", async (url: string) => {
    if (url.includes("/contributions")) return calendar ? new Response(verifiedCalendar) : new Response(null, { status: 503 });
    if (!repository) return new Response(null, { status: 503 });
    return Response.json(url.includes("/repos?") ? [] : { public_repos: 0, followers: 0 });
  });
  for (const available of [[false, false], [true, false], [false, true], [true, true]]) {
    [repository, calendar] = available;
    const html = renderToStaticMarkup(await GitHubSection());
    assert.equal(html.includes("Repository data from GitHub"), repository);
    assert.equal(html.includes("Repository reference data"), !repository);
    assert.equal(html.includes("Calendar data from GitHub"), calendar);
    assert.equal(html.includes("GitHub contribution data is currently unavailable."), !calendar);
    assert.equal(html.includes("heatmap-metric-card"), calendar);
    assert.doesNotMatch(html, /Cached Snapshot|GitHub Sync|\b683\b/i);
  }
});

