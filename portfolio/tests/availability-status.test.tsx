import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LiveStatusCard } from "../components/ui/live-status-card";
import { profile } from "../content/profile";
import {
  computeAvailabilityTime,
  getMsUntilNextMinute,
  isWithinAvailabilitySchedule,
} from "../lib/availability-time";

test("midnight rollover computes exact IST 12:00 AM and ISO date rollover", () => {
  // 2026-11-11 18:29:00 UTC === 2026-11-11 23:59:00 IST
  const beforeMidnight = new Date("2026-11-11T18:29:00.000Z");
  const snapBefore = computeAvailabilityTime(beforeMidnight, profile.availability);
  assert.equal(snapBefore.timeStr, "11:59 PM");
  assert.equal(snapBefore.hour24, 23);
  assert.equal(snapBefore.minute, 59);
  assert.equal(snapBefore.iso, "2026-11-11T23:59:00+05:30");
  assert.equal(snapBefore.isOnline, false);
  assert.equal(snapBefore.scheduleLabel, profile.availability.schedule.restingStatus);

  // 2026-11-11 18:30:00 UTC === 2026-11-12 00:00:00 IST (midnight rollover!)
  const atMidnight = new Date("2026-11-11T18:30:00.000Z");
  const snapMidnight = computeAvailabilityTime(atMidnight, profile.availability);
  assert.equal(snapMidnight.timeStr, "12:00 AM");
  assert.equal(snapMidnight.hour24, 0);
  assert.equal(snapMidnight.minute, 0);
  assert.equal(snapMidnight.iso, "2026-11-12T00:00:00+05:30");
  assert.equal(snapMidnight.isOnline, false);

  // Noon check: 2026-11-12 06:30:00 UTC === 2026-11-12 12:00:00 IST
  const atNoon = new Date("2026-11-12T06:30:00.000Z");
  const snapNoon = computeAvailabilityTime(atNoon, profile.availability);
  assert.equal(snapNoon.timeStr, "12:00 PM");
  assert.equal(snapNoon.hour24, 12);
  assert.equal(snapNoon.isOnline, true);
});

test("schedule edge hours switch cleanly between resting and active online states", () => {
  // 08:59 IST = 03:29 UTC -> Resting
  const beforeStart = computeAvailabilityTime(
    new Date("2026-11-11T03:29:00.000Z"),
    profile.availability,
  );
  assert.equal(beforeStart.hour24, 8);
  assert.equal(beforeStart.timeStr, "08:59 AM");
  assert.equal(beforeStart.isOnline, false);
  assert.equal(beforeStart.scheduleLabel, profile.availability.schedule.restingStatus);

  // 09:00 IST = 03:30 UTC -> Online
  const atStart = computeAvailabilityTime(
    new Date("2026-11-11T03:30:00.000Z"),
    profile.availability,
  );
  assert.equal(atStart.hour24, 9);
  assert.equal(atStart.timeStr, "09:00 AM");
  assert.equal(atStart.isOnline, true);
  assert.equal(atStart.scheduleLabel, profile.availability.schedule.activeStatus);

  // 21:59 IST = 16:29 UTC -> Online
  const beforeEnd = computeAvailabilityTime(
    new Date("2026-11-11T16:29:00.000Z"),
    profile.availability,
  );
  assert.equal(beforeEnd.hour24, 21);
  assert.equal(beforeEnd.timeStr, "09:59 PM");
  assert.equal(beforeEnd.isOnline, true);

  // 22:00 IST = 16:30 UTC -> Resting
  const atEnd = computeAvailabilityTime(
    new Date("2026-11-11T16:30:00.000Z"),
    profile.availability,
  );
  assert.equal(atEnd.hour24, 22);
  assert.equal(atEnd.timeStr, "10:00 PM");
  assert.equal(atEnd.isOnline, false);
  assert.equal(atEnd.scheduleLabel, profile.availability.schedule.restingStatus);

  // Overnight window edge check
  assert.equal(isWithinAvailabilitySchedule(23, { startHour: 22, endHour: 6 }), true);
  assert.equal(isWithinAvailabilitySchedule(5, { startHour: 22, endHour: 6 }), true);
  assert.equal(isWithinAvailabilitySchedule(12, { startHour: 22, endHour: 6 }), false);
});

test("UTC+5:30 fallback matches Intl timezone calculation when Intl is unavailable", () => {
  const sampleDates = [
    new Date("2026-01-15T18:29:59.000Z"), // Winter non-DST edge
    new Date("2026-07-15T18:30:00.000Z"), // Summer DST-elsewhere edge (IST has zero DST)
    new Date("2026-11-11T03:30:00.000Z"), // 09:00 AM IST
  ];

  for (const d of sampleDates) {
    const intlSnap = computeAvailabilityTime(d, profile.availability);
    const fallbackSnap = computeAvailabilityTime(d, profile.availability, {
      forceFallback: true,
    });
    assert.equal(fallbackSnap.timeStr, intlSnap.timeStr);
    assert.equal(fallbackSnap.iso, intlSnap.iso);
    assert.equal(fallbackSnap.hour24, intlSnap.hour24);
    assert.equal(fallbackSnap.minute, intlSnap.minute);
    assert.equal(fallbackSnap.isOnline, intlSnap.isOnline);
    assert.equal(fallbackSnap.offset, "UTC+5:30");
    assert.equal(fallbackSnap.abbr, "IST");
  }
});

test("visitor in non-IST local timezone still sees Asia/Kolkata IST time", () => {
  const originalTz = process.env.TZ;
  try {
    process.env.TZ = "America/New_York";
    const utcInstant = new Date("2026-07-04T14:00:00.000Z"); // 10:00 AM EDT in NY, 07:30 PM IST in India
    const snap = computeAvailabilityTime(utcInstant, profile.availability);
    assert.equal(snap.timeStr, "07:30 PM");
    assert.equal(snap.hour24, 19);
    assert.equal(snap.minute, 30);
    assert.equal(snap.isOnline, true);
    assert.equal(snap.abbr, "IST");
  } finally {
    if (originalTz === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTz;
    }
  }
});

test("fake timers schedule updates aligned to exact minute boundaries across midnight", (t) => {
  // Start 10 seconds before IST midnight: 2026-11-11 18:29:50.000Z === 23:59:50 IST
  const startMs = Date.parse("2026-11-11T18:29:50.000Z");
  t.mock.timers.enable({ apis: ["Date", "setTimeout"], now: startMs });

  assert.equal(getMsUntilNextMinute(new Date()), 10_000);
  assert.equal(getMsUntilNextMinute(new Date("2026-11-11T18:29:00.000Z")), 60_000);
  assert.equal(getMsUntilNextMinute(new Date("2026-11-11T18:29:59.999Z")), 1);

  const ticks: string[] = [];
  function scheduleTick() {
    const snap = computeAvailabilityTime(new Date(), profile.availability);
    ticks.push(snap.timeStr);
    const delay = getMsUntilNextMinute(new Date());
    setTimeout(scheduleTick, delay);
  }

  // Initial sync at 11:59 PM
  scheduleTick();
  assert.deepEqual(ticks, ["11:59 PM"]);

  // Advance 9.9s -> still no extra tick before boundary
  t.mock.timers.tick(9_900);
  assert.deepEqual(ticks, ["11:59 PM"]);

  // Cross midnight boundary (+100ms -> 00:00:00 IST)
  t.mock.timers.tick(100);
  assert.deepEqual(ticks, ["11:59 PM", "12:00 AM"]);

  // Advance 1 full minute (+60,000ms -> 00:01:00 IST)
  t.mock.timers.tick(60_000);
  assert.deepEqual(ticks, ["11:59 PM", "12:00 AM", "12:01 AM"]);
});

test("LiveStatusCard SSR renders neutral state, content-layer strings, and respects open=false and href modes", () => {
  const html = renderToStaticMarkup(<LiveStatusCard />);
  const decoded = html.replaceAll("&amp;", "&");
  assert.ok(decoded.includes('aria-label="Availability and local time"'));
  assert.ok(decoded.includes(profile.availability.statusLabel));
  assert.ok(decoded.includes(profile.availability.period));
  assert.ok(decoded.includes(profile.availability.periodAccessibleLabel));
  assert.ok(decoded.includes(profile.location.label));
  assert.ok(decoded.includes(profile.availability.responseCommitment));
  assert.ok(decoded.includes(profile.availability.regionLabel));
  // Neutral server state placeholder prevents baking stale build time
  assert.ok(decoded.includes("--:-- --"));
  assert.ok(decoded.includes("<time "));
  assert.ok(!decoded.includes("<a "), "Informational card should not render anchor links");

  // When open is false, status chip and period disappear gracefully
  const closedHtml = renderToStaticMarkup(
    <LiveStatusCard availability={{ ...profile.availability, open: false }} />,
  ).replaceAll("&amp;", "&");
  assert.ok(!closedHtml.includes(profile.availability.statusLabel));
  assert.ok(!closedHtml.includes(profile.availability.period));
  assert.ok(closedHtml.includes(profile.location.label));
  assert.ok(closedHtml.includes(profile.availability.responseCommitment));

  // Optional link mode renders the whole surface as a single accessible anchor
  const linkedHtml = renderToStaticMarkup(
    <LiveStatusCard href="/contact" linkLabel="Open contact page and availability" />,
  );
  assert.ok(linkedHtml.includes('href="/contact"'));
  assert.ok(linkedHtml.includes('aria-label="Open contact page and availability"'));
});
