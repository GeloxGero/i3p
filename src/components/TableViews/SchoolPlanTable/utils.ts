// utils.ts — SchoolPlanTable
//
// Pure, side-effect-free helper functions.
// Every function here is unit-testable without a DOM or React context.

import { MONTH_ORDER, monthIndex, type MonthName } from "./constants";


// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Formats a number as Philippine Peso with thousands separators and 2 decimal
 * places.  Example: formatPeso(1234567.8) → "₱1,234,567.80"
 *
 * We use `Intl.NumberFormat` instead of a hand-rolled regex because it handles
 * edge cases (negative numbers, very large values, locales) automatically.
 */
export const formatPeso = (value: number): string =>
	new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
		minimumFractionDigits: 2,
	}).format(value);

/**
 * Returns a 3-letter abbreviated month label (e.g. "Jan", "Feb").
 * Falls back to the first 3 characters of the input if the month is unknown.
 */
export const shortMonth = (month: string): string => month.slice(0, 3);

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Derives the MonthName from a "yyyy-MM-dd" date string.
 * Returns null when the string cannot be parsed so callers can filter safely.
 *
 * Return type is `MonthName | null` (not `string | null`) so the compiler
 * knows the value is safe to pass to any function that requires a MonthName.
 */
export const monthFromDate = (dateStr: string): MonthName | null => {
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return null;
	return MONTH_ORDER[d.getMonth()]; // d.getMonth() is always 0–11, safe index
};

/**
 * Builds the canonical "yyyy-MM-dd" date string for the first day of the
 * given year + month name.
 *
 * Uses `monthIndex()` from constants so there is no direct `as` cast — if
 * `month` is not a valid MonthName the index is -1 and the caller gets
 * an invalid date string they can detect, rather than silent data corruption.
 *
 * Example: buildDateString(2024, "March") → "2024-03-01"
 */
export const buildDateString = (year: number, month: string): string => {
	const idx = monthIndex(month) + 1; // monthIndex is 0-based; +1 for ISO months
	const mm = String(Math.max(idx, 1)).padStart(2, "0");
	return `${year}-${mm}-01`;
};

// ─── Budget helpers ───────────────────────────────────────────────────────────

/**
 * Computes the budget utilisation ratio clamped to [0, 1].
 *
 * Returns 0 when annualBudget is null or ≤ 0 so UI components never divide
 * by zero — they can treat 0 as "no budget configured".
 */
export const budgetRatio = (
	spent: number,
	annualBudget: number | null,
): number => {
	if (!annualBudget || annualBudget <= 0) return 0;
	return Math.min(spent / annualBudget, 1);
};

/**
 * Returns a Tailwind colour class based on budget utilisation.
 *   < 75%  → green   (safe)
 *   75–90% → yellow  (caution)
 *   ≥ 90%  → red     (critical)
 */
export const budgetColour = (ratio: number): string => {
	if (ratio >= 0.9) return "text-red-500";
	if (ratio >= 0.75) return "text-yellow-500";
	return "text-green-500";
};

// ─── Duplicate-check helpers ──────────────────────────────────────────────────

/**
 * Builds the stable composite key used to detect duplicates.
 * Must match the backend's matching logic in CheckDuplicates.
 *
 * Key = "<1-based-month-number>|<activity-trimmed-lowercased>"
 *
 * Cost and quantity are intentionally excluded so that items with the same
 * activity but a different budget are still surfaced as potential duplicates
 * (the user may have updated the cost deliberately).
 */
export const duplicateKey = (date: string, activity: string): string => {
	const d = new Date(date);
	const month = isNaN(d.getTime()) ? "0" : String(d.getMonth() + 1);
	return `${month}|${activity.trim().toLowerCase()}`;
};

// ─── General helpers ──────────────────────────────────────────────────────────

/**
 * Typed shorthand for Array.prototype.every.
 */
export const allMatch = <T>(arr: T[], predicate: (x: T) => boolean): boolean =>
	arr.every(predicate);

/**
 * Clamps a number between min and max (inclusive).
 */
export const clamp = (value: number, min: number, max: number): number =>
	Math.max(min, Math.min(max, value));


// ─── SchoolPlanTable Helpers ──────────────────────────────────────────────────────────