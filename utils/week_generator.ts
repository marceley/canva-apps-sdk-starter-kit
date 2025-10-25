import type { WeekOption } from "src/types";

/**
 * Generates week numbers in "wwyy" format
 * @param weeksBack - Number of weeks to go back from current date (default: 4)
 * @param weeksForward - Number of weeks to go forward from current date (default: 12)
 * @returns Array of week options with value and label
 */
export function generateWeeks(
  weeksBack: number = 4,
  weeksForward: number = 12,
): WeekOption[] {
  const weeks: WeekOption[] = [];
  const now = new Date();

  // Go back weeksBack weeks
  for (let i = weeksBack; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - 7 * i);

    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear().toString().slice(-2);
    const value = `${weekNumber.toString().padStart(2, "0")}${year}`;
    const label = `Uge ${value}`;

    weeks.push({ value, label });
  }

  // Add current week
  const currentWeekNumber = getWeekNumber(now);
  const currentYear = now.getFullYear().toString().slice(-2);
  const currentValue = `${currentWeekNumber
    .toString()
    .padStart(2, "0")}${currentYear}`;
  weeks.push({ value: currentValue, label: `Uge ${currentValue}` });

  // Go forward weeksForward weeks
  for (let i = 1; i <= weeksForward; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + 7 * i);

    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear().toString().slice(-2);
    const value = `${weekNumber.toString().padStart(2, "0")}${year}`;
    const label = `Uge ${value}`;

    weeks.push({ value, label });
  }

  return weeks;
}

/**
 * Gets the ISO week number for a given date
 * @param date - The date to get the week number for
 * @returns The week number (1-53)
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
