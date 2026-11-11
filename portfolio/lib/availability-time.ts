import type { AvailabilityConfig, AvailabilitySchedule } from "@/content/types";

export interface AvailabilityTimeSnapshot {
  /** Zero-padded 12-hour string, e.g. "09:05 AM" (always 8 characters for tabular layout stability). */
  timeStr: string;
  /** ISO-8601 timestamp string for `<time dateTime="...">`, e.g. "2026-11-11T09:05:00+05:30". */
  iso: string;
  /** Hour in 24-hour target timezone (0-23). */
  hour24: number;
  /** Minute in target timezone (0-59). */
  minute: number;
  /** Derived or configured short timezone abbreviation (e.g. "IST"). */
  abbr: string;
  /** Derived or configured UTC offset label (e.g. "UTC+5:30"). */
  offset: string;
  /** Whether current target timezone hour falls within configured active working hours. */
  isOnline: boolean;
  /** Schedule label from content config corresponding to `isOnline`. */
  scheduleLabel: string;
  /** Minute key (YYYY-MM-DDTHH:mm) used to detect minute boundaries without re-animating unchanged minutes. */
  minuteKey: string;
}

const IST_FALLBACK_OFFSET_MINUTES = 5 * 60 + 30;
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getCachedFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${options.timeZone ?? ""}|${options.timeZoneName ?? ""}|${options.year ?? ""}|${options.hour12 ?? ""}`;
  let cached = formatterCache.get(key);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, cached);
  }
  return cached;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function format12Hour(hour24: number, minute: number): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${pad2(hour12)}:${pad2(minute)} ${period}`;
}

export function isWithinAvailabilitySchedule(
  hour24: number,
  schedule: Pick<AvailabilitySchedule, "startHour" | "endHour">,
): boolean {
  if (schedule.startHour <= schedule.endHour) {
    return hour24 >= schedule.startHour && hour24 < schedule.endHour;
  }
  return hour24 >= schedule.startHour || hour24 < schedule.endHour;
}

function extractPartsViaIntl(
  date: Date,
  timeZone: string,
): {
  year: number;
  month: number;
  day: number;
  hour24: number;
  minute: number;
} | null {
  if (typeof Intl === "undefined" || typeof Intl.DateTimeFormat !== "function") {
    return null;
  }
  try {
    const formatter = getCachedFormatter("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const getNum = (type: Intl.DateTimeFormatPartTypes) => {
      const val = parts.find((p) => p.type === type)?.value;
      return val ? Number.parseInt(val, 10) : Number.NaN;
    };
    const year = getNum("year");
    const month = getNum("month");
    const day = getNum("day");
    const rawHour = getNum("hour");
    const minute = getNum("minute");
    if ([year, month, day, rawHour, minute].some(Number.isNaN)) {
      return null;
    }
    return {
      year,
      month,
      day,
      hour24: rawHour === 24 ? 0 : rawHour,
      minute,
    };
  } catch {
    return null;
  }
}

function extractPartsViaUtcOffset(
  date: Date,
  offsetMinutes: number,
): {
  year: number;
  month: number;
  day: number;
  hour24: number;
  minute: number;
} {
  const shifted = new Date(date.getTime() + offsetMinutes * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour24: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

function parseUtcOffsetMinutes(offsetLabel: string): number {
  const match = offsetLabel.match(/(?:UTC|GMT)?\s*([+-])(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) return IST_FALLBACK_OFFSET_MINUTES;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number.parseInt(match[2], 10);
  const mins = match[3] ? Number.parseInt(match[3], 10) : 0;
  return sign * (hours * 60 + mins);
}

function toIsoOffsetString(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  return `${sign}${pad2(hours)}:${pad2(mins)}`;
}

function deriveZoneLabels(
  date: Date,
  config: Pick<AvailabilityConfig, "timeZone" | "timeZoneAbbr" | "timeZoneOffset">,
  forceFallback: boolean,
): { abbr: string; offset: string; isoOffset: string } {
  const fallbackMinutes = parseUtcOffsetMinutes(config.timeZoneOffset);
  let abbr = config.timeZoneAbbr;
  let offset = config.timeZoneOffset;

  if (!forceFallback && typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function") {
    try {
      const abbrParts = getCachedFormatter("en-IN", {
        timeZone: config.timeZone,
        timeZoneName: "short",
      }).formatToParts(date);
      const rawAbbr = abbrParts.find((p) => p.type === "timeZoneName")?.value;
      if (rawAbbr && !rawAbbr.startsWith("GMT")) {
        abbr = rawAbbr;
      }
    } catch {
      // Retain configured abbreviation on partial-ICU environments.
    }

    try {
      const offsetParts = getCachedFormatter("en-US", {
        timeZone: config.timeZone,
        timeZoneName: "shortOffset",
      }).formatToParts(date);
      const rawOffset = offsetParts.find((p) => p.type === "timeZoneName")?.value;
      if (rawOffset) {
        offset = rawOffset.replace(/^GMT/, "UTC");
      }
    } catch {
      // Retain configured offset on engines without shortOffset support.
    }
  }

  const offsetMinutes = parseUtcOffsetMinutes(offset || config.timeZoneOffset);
  const resolvedMinutes = Number.isNaN(offsetMinutes) ? fallbackMinutes : offsetMinutes;
  return {
    abbr,
    offset,
    isoOffset: toIsoOffsetString(resolvedMinutes),
  };
}

/**
 * Computes formatted local time, ISO timestamp, derived zone labels, and schedule status
 * for the configured timezone, falling back to UTC offset calculation when Intl lacks
 * timezone database support.
 */
export function computeAvailabilityTime(
  date: Date,
  config: Pick<AvailabilityConfig, "timeZone" | "timeZoneAbbr" | "timeZoneOffset" | "schedule">,
  options?: { forceFallback?: boolean },
): AvailabilityTimeSnapshot {
  const forceFallback = Boolean(options?.forceFallback);
  const zoneLabels = deriveZoneLabels(date, config, forceFallback);
  const offsetMinutes = parseUtcOffsetMinutes(zoneLabels.offset);

  const parts =
    (!forceFallback && extractPartsViaIntl(date, config.timeZone)) ||
    extractPartsViaUtcOffset(date, offsetMinutes);

  const isOnline = isWithinAvailabilitySchedule(parts.hour24, config.schedule);
  const scheduleLabel = isOnline ? config.schedule.activeStatus : config.schedule.restingStatus;
  const datePart = `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
  const time24Part = `${pad2(parts.hour24)}:${pad2(parts.minute)}`;

  return {
    timeStr: format12Hour(parts.hour24, parts.minute),
    iso: `${datePart}T${time24Part}:00${zoneLabels.isoOffset}`,
    hour24: parts.hour24,
    minute: parts.minute,
    abbr: zoneLabels.abbr,
    offset: zoneLabels.offset,
    isOnline,
    scheduleLabel,
    minuteKey: `${datePart}T${time24Part}`,
  };
}

/**
 * Returns milliseconds remaining until the start of the next wall-clock minute boundary.
 */
export function getMsUntilNextMinute(now: Date): number {
  const remaining = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  if (remaining <= 0) return 60_000;
  return remaining;
}

