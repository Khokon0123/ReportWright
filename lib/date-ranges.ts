import {
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
  differenceInCalendarDays,
} from "date-fns";

export type DateRangePreset = "this_month" | "last_month" | "custom";

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;
}

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

/** Returns the current period and the immediately preceding period of equal length. */
export function resolveDateRanges(
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string
): { current: DateRange; previous: DateRange } {
  let current: DateRange;

  const now = new Date();

  if (preset === "this_month") {
    current = { start: fmt(startOfMonth(now)), end: fmt(now) };
  } else if (preset === "last_month") {
    const lastMonth = subMonths(now, 1);
    current = { start: fmt(startOfMonth(lastMonth)), end: fmt(endOfMonth(lastMonth)) };
  } else {
    if (!customStart || !customEnd) {
      throw new Error("customStart and customEnd are required for a custom date range.");
    }
    current = { start: customStart, end: customEnd };
  }

  const start = new Date(current.start);
  const end = new Date(current.end);
  const lengthDays = differenceInCalendarDays(end, start) + 1;

  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - (lengthDays - 1));

  return {
    current,
    previous: { start: fmt(previousStart), end: fmt(previousEnd) },
  };
}
