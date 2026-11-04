import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The platform currently targets Indian food establishments. */
export const APP_TIME_ZONE = "Asia/Kolkata";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: APP_TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: APP_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: APP_TIME_ZONE,
});

const weekdayFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  timeZone: APP_TIME_ZONE,
});

const dayFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  timeZone: APP_TIME_ZONE,
});

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  timeZone: APP_TIME_ZONE,
});

export function formatDate(value: string | Date) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value: string | Date) {
  return timeFormatter.format(new Date(value));
}

export function formatWeekday(value: string | Date) {
  return weekdayFormatter.format(new Date(value));
}

export function formatDayNumber(value: string | Date) {
  return dayFormatter.format(new Date(value));
}

export function formatMonth(value: string | Date) {
  return monthFormatter.format(new Date(value));
}

export function formatQuantity(value: number, unit?: string) {
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
  }).format(value);

  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatRelative(value: string | Date, now = new Date()) {
  const target = new Date(value).getTime();
  const diff = target - now.getTime();
  const absMinutes = Math.round(Math.abs(diff) / 60_000);

  if (absMinutes < 1) return "just now";

  const suffix = (text: string) => (diff >= 0 ? `in ${text}` : `${text} ago`);

  if (absMinutes < 60) return suffix(`${absMinutes}m`);

  const hours = Math.round(absMinutes / 60);
  if (hours < 24) return suffix(`${hours}h`);

  const days = Math.round(hours / 24);
  if (days < 7) return suffix(`${days}d`);

  return formatDate(value);
}

export type DeadlineState = "overdue" | "soon" | "normal";

export function getDeadlineState(
  value: string | Date,
  now = new Date(),
): DeadlineState {
  const diff = new Date(value).getTime() - now.getTime();
  if (diff <= 0) return "overdue";
  if (diff <= 2 * 60 * 60 * 1000) return "soon";
  return "normal";
}

export function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "?";

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function timeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  const asUtc = Date.UTC(
    lookup("year"),
    lookup("month") - 1,
    lookup("day"),
    lookup("hour"),
    lookup("minute"),
    lookup("second"),
  );

  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/**
 * Converts a `datetime-local` wall-clock value (for example
 * `2026-11-01T18:30`) into an ISO timestamp in the platform's time zone.
 */
export function zonedDateTimeToIso(
  local: string,
  timeZone = APP_TIME_ZONE,
) {
  if (!local) return local;
  const normalized = local.length === 16 ? `${local}:00` : local;
  const naive = Date.parse(`${normalized}Z`);

  if (Number.isNaN(naive)) {
    const fallback = new Date(local);
    return Number.isNaN(fallback.getTime())
      ? local
      : fallback.toISOString();
  }

  const offset = timeZoneOffsetMs(new Date(naive), timeZone);
  return new Date(naive - offset).toISOString();
}

export function toDateTimeLocalValue(value: string | Date) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: APP_TIME_ZONE,
  }).formatToParts(date);

  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${lookup("year")}-${lookup("month")}-${lookup("day")}T${lookup(
    "hour",
  )}:${lookup("minute")}`;
}

export function isoHoursFromNow(hours: number, base = new Date()) {
  return new Date(base.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function dateKey(value: string | Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(value));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function percent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}
