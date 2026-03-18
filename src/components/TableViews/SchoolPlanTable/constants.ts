import type { ColDef, SectionDef } from "./types";

const ALL_COLUMNS: ColDef[] = [
	{ uid: "kraArea", label: "KRA", className: "w-[140px]" },
	{
		uid: "specificProgram",
		label: "Specific Program (SiP)",
		className: "w-[120px]",
	},
	{ uid: "programActivity", label: "Programs / Projects / Activities" },
	{ uid: "purpose", label: "Purpose / Objectives" },
	{ uid: "performanceIndicator", label: "Performance Indicator" },
	{ uid: "resourceDescription", label: "Resources" },
	{ uid: "quantity", label: "Qty", className: "text-right w-12" },
	{
		uid: "estimatedCost",
		label: "Est. Cost (₱)",
		className: "text-right w-32",
	},
	{ uid: "accountTitle", label: "Account Title" },
	{ uid: "accountCode", label: "Account Code", className: "w-24" },
	{ uid: "arCode", label: "AR Code", className: "w-40" },
	{ uid: "status", label: "Status", className: "w-28" },
];

// Mobile shows minimal columns; tablet shows more
const MOBILE_VISIBLE = new Set(["programActivity", "estimatedCost", "status"]);
const DEFAULT_VISIBLE = new Set([
	"kraArea",
	"specificProgram",
	"programActivity",
	"purpose",
	"quantity",
	"estimatedCost",
	"accountTitle",
	"accountCode",
	"arCode",
	"status",
]);

const MONTH_NAMES = [
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
];
const EXPENDITURE_TYPES = [
	"Regular Expenditure",
	"Project Related Expenditure",
	"Repair and Maintenance",
	"Others",
] as const;
const CATEGORY_LABELS: Record<string, string> = {
	"Regular Expenditure": "Regular",
	"Project Related Expenditure": "Project",
	"Repair and Maintenance": "Repair",
	Others: "Others",
};
const CATEGORY_COLORS: Record<
	string,
	"primary" | "success" | "warning" | "secondary" | "default"
> = {
	"Regular Expenditure": "primary",
	"Project Related Expenditure": "success",
	"Repair and Maintenance": "warning",
	Others: "secondary",
};

const TEMPLATE_SECTIONS: SectionDef[] = [
	{ category: "Regular Expenditure", startCol: 0 },
	{ category: "Project Related Expenditure", startCol: 11 },
	{ category: "Repair and Maintenance", startCol: 22 },
	{ category: "Others", startCol: 33 },
];

// Keep these as individual constants because they aren't "Columns"

const REQUIRED_HEADER_KEYWORDS = [
	"key result area",
	"specific program",
	"programs/projects",
	"estimated",
	"account",
];

export const HEADER_ROW_INDEX = 3;
export const DATA_START_INDEX = 4;

export enum TableColumn {
	KRA = 0,
	SiP, // Automatically 1
	PPA, // Automatically 2
	Purpose, // Automatically 3
	PerfInd, // ...
	ResDesc,
	Qty,
	Cost,
	AccTitle,
	AccCode,
}

export {
	ALL_COLUMNS,
	MOBILE_VISIBLE,
	DEFAULT_VISIBLE,
	MONTH_NAMES,
	EXPENDITURE_TYPES,
	CATEGORY_LABELS,
	CATEGORY_COLORS,
	REQUIRED_HEADER_KEYWORDS,
	TEMPLATE_SECTIONS,
};
