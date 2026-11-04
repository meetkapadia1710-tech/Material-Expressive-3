import assert from "node:assert/strict";
import test from "node:test";
import { GET, POST } from "../app/api/contact/route";
import { getLeetCodeStats } from "../lib/leetcode";

test("contact bounds request bytes before sending any provider request", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected provider call"); });
  const url = "http://localhost/api/contact";
  const declared = await POST(new Request(url, {
    method: "POST", body: "{}", headers: { "Content-Length": "65537" },
  }));
  assert.equal(declared.status, 413);

  // The Request has a body stream and no length header.
  const streamed = new Request(url, { method: "POST", body: JSON.stringify({ extra: "é".repeat(33_000) }) });
  assert.equal(streamed.headers.has("content-length"), false);
  assert.equal((await POST(streamed)).status, 413);
  assert.equal(fetch.mock.callCount(), 0);
});

test("contact configuration reports availability without returning the key", async (t) => {
  const old = process.env.WEB3FORMS_ACCESS_KEY;
  t.after(() => {
    if (old === undefined) delete process.env.WEB3FORMS_ACCESS_KEY;
    else process.env.WEB3FORMS_ACCESS_KEY = old;
  });
  process.env.WEB3FORMS_ACCESS_KEY = "private-fixture";
  const response = await GET();
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { configured: true });
});

const counts = ["All", "Easy", "Medium", "Hard"].map((difficulty) => ({ difficulty, count: 0 }));
const fixture = (acSubmissionNum: unknown, recentAcSubmissionList: unknown) => ({
  data: { matchedUser: { submitStats: { acSubmissionNum } }, recentAcSubmissionList },
});

test("LeetCode accepts reported zero and empty recent results", async () => {
  const stats = await getLeetCodeStats("fixture", async () => Response.json(fixture(counts, [])));
  assert.equal(stats?.total, 0);
  assert.deepEqual(stats?.recent, []);
  assert.equal(stats?.easy.percentage, 0);
});

test("LeetCode rejects missing, invalid and GraphQL-error responses", async () => {
  for (const result of [
    fixture(counts.slice(1), []), fixture(counts, null),
    fixture([{ difficulty: "All", count: -1 }, ...counts.slice(1)], []),
    fixture(counts, [{ title: "Fixture", titleSlug: "../other", timestamp: "100" }]),
    { ...fixture(counts, []), errors: [{ message: "provider failure" }] },
  ]) {
    assert.equal(await getLeetCodeStats("fixture", async () => Response.json(result)), null);
  }
});

