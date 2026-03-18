import {
	MONTH_NAMES,
	HEADER_ROW_INDEX,
	REQUIRED_HEADER_KEYWORDS,
	TEMPLATE_SECTIONS,
	DATA_START_INDEX,
	TableColumn,
} from "./constants";

import type { MonthSheet, SchoolPlanItem } from "./types";
import * as XLSX from "xlsx";

function isMonthSheet(n: string) {
	return MONTH_NAMES.some((m) => n.trim().toLowerCase() === m.toLowerCase());
}
function normalizeMonthName(n: string) {
	const t = n.trim().toLowerCase();
	return MONTH_NAMES.find((m) => m.toLowerCase() === t) ?? n.trim();
}

function parseCost(raw: unknown): number {
	return parseFloat(String(raw ?? "").replace(/[₱,\s]/g, "")) || 0;
}
function cellStr(row: unknown[], col: number): string {
	return String(row[col] ?? "").trim();
}
function fmt(n: number): string {
	return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

function validateSipTemplate(workbook: XLSX.WorkBook): string | null {
	const monthSheets = workbook.SheetNames.filter(isMonthSheet);
	if (monthSheets.length === 0)
		return "No month-named sheets found. Use the official SIP template.";
	const ws = workbook.Sheets[monthSheets[0]];
	const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
		header: 1,
		defval: "",
	});
	const headerRow = rows[HEADER_ROW_INDEX] ?? [];
	const headerJoined = headerRow.map((c) => String(c).toLowerCase()).join(" ");
	for (const kw of REQUIRED_HEADER_KEYWORDS)
		if (!headerJoined.includes(kw))
			return `Missing header: "${kw}". Use the official SIP template.`;
	for (const { category, startCol } of TEMPLATE_SECTIONS)
		if (
			!String(headerRow[startCol] ?? "")
				.toLowerCase()
				.includes("key result area")
		)
			return `Template mismatch in "${category}" at column ${startCol + 1}.`;
	return null;
}

export function parseSchoolPlanWorkbook(workbook: XLSX.WorkBook): MonthSheet[] {
	const results: MonthSheet[] = [];

	for (const sheetName of workbook.SheetNames) {
		if (!isMonthSheet(sheetName)) continue;

		const month = normalizeMonthName(sheetName);
		const ws = workbook.Sheets[sheetName];
		const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
			header: 1,
			defval: "",
		});

		const items: SchoolPlanItem[] = [];
		const subTotals: Record<string, number> = {};

		// Iterate through rows starting from the data index
		for (let ri = DATA_START_INDEX; ri < rows.length; ri++) {
			const row = rows[ri];

			for (const { category, startCol } of TEMPLATE_SECTIONS) {
				// Using the Enum for semantic clarity
				const kra = cellStr(row, startCol + TableColumn.KRA);
				const ppa = cellStr(row, startCol + TableColumn.PPA);
				const sip = cellStr(row, startCol + TableColumn.SiP);

				// Skip empty or filler rows
				if (!kra && !ppa) continue;
				if (kra.toUpperCase() === "NONE" || ppa.toUpperCase() === "NONE")
					continue;

				// Handle Sub-total rows from the Excel template
				if (
					ppa.toUpperCase().includes("SUB-TOTAL") ||
					kra.toUpperCase().includes("SUB-TOTAL")
				) {
					subTotals[category] = parseCost(row[startCol + TableColumn.Cost]);
					continue;
				}

				// Skip headers/footers accidentally caught in data range
				if (
					ppa.toLowerCase().includes("total budget") ||
					kra.toLowerCase().includes("total budget")
				)
					continue;

				const estimatedCost = parseCost(row[startCol + TableColumn.Cost]);
				if (!ppa && estimatedCost === 0) continue;

				items.push({
					kraArea: kra,
					specificProgram: sip || "Unimplemented",
					programActivity: ppa,
					purpose: cellStr(row, startCol + TableColumn.Purpose),
					performanceIndicator: cellStr(row, startCol + TableColumn.PerfInd),
					resourceDescription: cellStr(row, startCol + TableColumn.ResDesc),
					quantity: row[startCol + TableColumn.Qty]
						? (row[startCol + TableColumn.Qty] as string | number)
						: "",
					estimatedCost,
					accountTitle: cellStr(row, startCol + TableColumn.AccTitle),
					accountCode: cellStr(row, startCol + TableColumn.AccCode),
					category,
				});
			}
		}

		// Calculate missing subtotals if the Excel didn't provide them
		for (const { category } of TEMPLATE_SECTIONS) {
			if (subTotals[category] === undefined) {
				const total = items
					.filter((i) => i.category === category)
					.reduce((sum, item) => sum + item.estimatedCost, 0);
				if (total > 0) subTotals[category] = total;
			}
		}

		const grandTotal = items.reduce((sum, item) => sum + item.estimatedCost, 0);
		const hasSip = items.some(
			(i) => i.specificProgram && i.specificProgram !== "Unimplemented",
		);

		results.push({ month, hasSip, items, subTotals, grandTotal });
	}

	// Sort sheets by calendar order
	return results.sort(
		(a, b) => MONTH_NAMES.indexOf(a.month) - MONTH_NAMES.indexOf(b.month),
	);
}

export {
	isMonthSheet,
	validateSipTemplate,
	normalizeMonthName,
	parseCost,
	cellStr,
	fmt,
};
