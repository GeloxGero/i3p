// constants.ts — SchoolPlanTable
//
// All static lists, default values, and derived helpers live here.
// Having them in one file prevents "magic string" proliferation and makes it
// easy to confirm that the frontend's column offsets match the backend template.

import type { ColumnVisibility, ExpenditureCategory } from "./types";

// ─── Month order (must match backend MonthOrder) ──────────────────────────────
//
// `as const` makes every element a string-literal type rather than `string`.
// This gives exhaustive type-checking on switch statements and lets TypeScript
// verify that you never accidentally pass an arbitrary string where a month
// name is expected — but it also means Array.prototype.indexOf only accepts
// MonthName, not plain string.  Use the helpers below instead.
export const MONTH_ORDER = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

export type MonthName = (typeof MONTH_ORDER)[number];

/**
 * Type-guard: returns true and narrows the type when `s` is a valid MonthName.
 *
 * WHY THIS EXISTS
 * ───────────────
 * MONTH_ORDER is a readonly tuple of literal types (`as const`).
 * TypeScript's overload for Array.prototype.indexOf on such a tuple only
 * accepts elements of the same literal union — passing a plain `string`
 * causes TS2345.  Wrapping the check in a type-guard keeps the boundary
 * clean: everything outside is `string`, everything inside is `MonthName`.
 */
export function isMonthName(s: string): s is MonthName {
	return (MONTH_ORDER as readonly string[]).includes(s);
}

/**
 * Returns the 1-based calendar index (1 = January … 12 = December) of a month
 * name string, or -1 when the string is not a valid month.
 *
 * WHY NOT JUST CAST?
 * ──────────────────
 * `as (typeof MONTH_ORDER)[number]` silences the error but doesn't protect
 * against runtime surprises when an API returns an unexpected casing or
 * locale variant.  This function validates first, so callers get -1 instead
 * of a silent 0 (indexOf miss).
 */
export function monthIndex(month: string): number {
	const idx = (MONTH_ORDER as readonly string[]).indexOf(month);
	return idx; // 0-based; callers add 1 for 1-based month numbers
}

// ─── Expenditure categories (must match backend CategoryOrder) ────────────────
export const CATEGORY_ORDER: ExpenditureCategory[] = [
	"Regular Expenditure",
	"Project Related Expenditure",
	"Repair and Maintenance",
	"Others",
];

// ─── Column labels for the table header ───────────────────────────────────────
// Keys mirror ColumnVisibility so ColumnToggle can iterate them generically.
export const COLUMN_LABELS: Record<keyof ColumnVisibility, string> = {
	kraArea: "KRA",
	specificProgram: "Specific Program",
	programActivity: "Programs / Projects / Activities",
	purpose: "Purpose / Objectives",
	performanceIndicator: "Performance Indicator",
	resourceDescription: "Resources Description",
	quantity: "Quantity",
	estimatedCost: "Estimated Cost",
	accountTitle: "Account Title",
	accountCode: "Account Code",
	category: "Category",
	arCode: "AR Code",
	status: "Status",
};

// ─── Default column visibility ────────────────────────────────────────────────
export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
	kraArea: true,
	specificProgram: true,
	programActivity: true,
	purpose: false,
	performanceIndicator: false,
	resourceDescription: false,
	quantity: true,
	estimatedCost: true,
	accountTitle: true,
	accountCode: false,
	category: true,
	arCode: true,
	status: true,
};

// ─── Default annual budget (shown on charts before admin sets a real value) ───
export const DEFAULT_ANNUAL_BUDGET = 1_500_000;

// ─── Skeleton row count used while data is loading ───────────────────────────
export const SKELETON_ROW_COUNT = 8;
