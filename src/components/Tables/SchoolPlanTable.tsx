import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Button,
	Select,
	SelectItem,
	Spinner,
	Chip,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Tooltip,
	Input,
} from "@heroui/react";
import { useEffect, useState, useRef } from "react";
import { $token } from "../../store/authStore";
import { useStore } from "@nanostores/react";
import * as XLSX from "xlsx";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SchoolPlanItem {
	id?: number;
	kraArea: string;
	specificProgram: string;
	programActivity: string;
	purpose: string;
	performanceIndicator: string;
	resourceDescription: string;
	quantity: number | string;
	estimatedCost: number;
	accountTitle: string;
	accountCode: string;
	category: string;
	arCode?: string | null;
	isVerified?: boolean;
	status?: "Implemented" | "Approved" | string | number;
}

type TableRowData = SchoolPlanItem & {
	_rowKey: string;
	_isSubtotal?: true;
	_subtotalValue?: number;
};

interface MonthSheet {
	month: string;
	hasSip: boolean;
	items: SchoolPlanItem[];
	subTotals: Record<string, number>;
	grandTotal: number;
}

interface SchoolPlanHeader {
	id: string;
	year: number;
	school: string;
	totalEstimatedCost: number;
	annualBudget: number | null;
}

interface SchoolPlan {
	id: string;
	year: number;
	school: string;
	annualBudget: number | null;
	months: MonthSheet[];
}

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColDef {
	uid: string;
	label: string;
	className?: string;
}

const ALL_COLUMNS: ColDef[] = [
	{ uid: "kraArea", label: "KRA", className: "w-[160px]" },
	{
		uid: "specificProgram",
		label: "Specific Program (SiP)",
		className: "w-[140px]",
	},
	{ uid: "programActivity", label: "Programs / Projects / Activities" },
	{ uid: "purpose", label: "Purpose / Objectives" },
	{ uid: "performanceIndicator", label: "Performance Indicator" },
	{ uid: "resourceDescription", label: "Resources" },
	{ uid: "quantity", label: "Qty", className: "text-right w-14" },
	{
		uid: "estimatedCost",
		label: "Est. Cost (₱)",
		className: "text-right w-36",
	},
	{ uid: "accountTitle", label: "Account Title" },
	{ uid: "accountCode", label: "Account Code", className: "w-28" },
	{ uid: "arCode", label: "AR Code", className: "w-44" },
	{ uid: "status", label: "Status", className: "w-32" },
];

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

// ─── Constants ────────────────────────────────────────────────────────────────

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
	"Repair and Maintenance": "Repair & Maint.",
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

const API = "http://localhost:5109";

// ─── Template Layout ──────────────────────────────────────────────────────────

interface SectionDef {
	category: string;
	startCol: number;
}

const TEMPLATE_SECTIONS: SectionDef[] = [
	{ category: "Regular Expenditure", startCol: 0 },
	{ category: "Project Related Expenditure", startCol: 11 },
	{ category: "Repair and Maintenance", startCol: 22 },
	{ category: "Others", startCol: 33 },
];

const OFF_KRA = 0,
	OFF_SIP = 1,
	OFF_PPA = 2,
	OFF_PURPOSE = 3,
	OFF_PERF_IND = 4;
const OFF_RES_DESC = 5,
	OFF_QTY = 6,
	OFF_COST = 7,
	OFF_ACC_TITLE = 8,
	OFF_ACC_CODE = 9;
const HEADER_ROW_INDEX = 3;
const DATA_START_INDEX = 4;

const REQUIRED_HEADER_KEYWORDS = [
	"key result area",
	"specific program",
	"programs/projects",
	"estimated",
	"account",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isMonthSheet(name: string) {
	return MONTH_NAMES.some((m) => name.trim().toLowerCase() === m.toLowerCase());
}
function normalizeMonthName(name: string) {
	const t = name.trim().toLowerCase();
	return MONTH_NAMES.find((m) => m.toLowerCase() === t) ?? name.trim();
}
function triggerDownload(url: string, filename: string) {
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
function parseCost(raw: unknown): number {
	return parseFloat(String(raw ?? "").replace(/[₱,\s]/g, "")) || 0;
}
function cellStr(row: unknown[], col: number): string {
	return String(row[col] ?? "").trim();
}

// ─── Template Validator ───────────────────────────────────────────────────────

function validateSipTemplate(workbook: XLSX.WorkBook): string | null {
	const monthSheets = workbook.SheetNames.filter(isMonthSheet);
	if (monthSheets.length === 0)
		return "No month-named sheets found. Please use the official School Implementation Plan template.";
	const ws = workbook.Sheets[monthSheets[0]];
	const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
		header: 1,
		defval: "",
	});
	const headerRow = rows[HEADER_ROW_INDEX] ?? [];
	const headerJoined = headerRow.map((c) => String(c).toLowerCase()).join(" ");
	for (const kw of REQUIRED_HEADER_KEYWORDS)
		if (!headerJoined.includes(kw))
			return `The uploaded file does not match the official SIP template. Missing header: "${kw}".`;
	for (const { category, startCol } of TEMPLATE_SECTIONS)
		if (
			!String(headerRow[startCol] ?? "")
				.toLowerCase()
				.includes("key result area")
		)
			return `Template mismatch in section "${category}" at column ${startCol + 1}. Please use the official template.`;
	return null;
}

// ─── Excel Parser ─────────────────────────────────────────────────────────────

function parseSchoolPlanWorkbook(workbook: XLSX.WorkBook): MonthSheet[] {
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
		for (let ri = DATA_START_INDEX; ri < rows.length; ri++) {
			const row = rows[ri];
			for (const { category, startCol } of TEMPLATE_SECTIONS) {
				const kra = cellStr(row, startCol + OFF_KRA);
				const ppa = cellStr(row, startCol + OFF_PPA);
				const sip = cellStr(row, startCol + OFF_SIP);
				if (!kra && !ppa) continue;
				if (kra.toUpperCase() === "NONE" || ppa.toUpperCase() === "NONE")
					continue;
				if (
					ppa.toUpperCase().includes("SUB-TOTAL") ||
					kra.toUpperCase().includes("SUB-TOTAL")
				) {
					subTotals[category] = parseCost(row[startCol + OFF_COST]);
					continue;
				}
				if (
					ppa.toLowerCase().includes("total budget") ||
					kra.toLowerCase().includes("total budget")
				)
					continue;
				const estimatedCost = parseCost(row[startCol + OFF_COST]);
				if (!ppa && estimatedCost === 0) continue;
				items.push({
					kraArea: kra,
					specificProgram: sip || "Unimplemented",
					programActivity: ppa,
					purpose: cellStr(row, startCol + OFF_PURPOSE),
					performanceIndicator: cellStr(row, startCol + OFF_PERF_IND),
					resourceDescription: cellStr(row, startCol + OFF_RES_DESC),
					quantity:
						row[startCol + OFF_QTY] != null
							? (row[startCol + OFF_QTY] as string | number)
							: "",
					estimatedCost,
					accountTitle: cellStr(row, startCol + OFF_ACC_TITLE),
					accountCode: cellStr(row, startCol + OFF_ACC_CODE),
					category,
				});
			}
		}
		for (const { category } of TEMPLATE_SECTIONS) {
			if (subTotals[category] === undefined) {
				const t = items
					.filter((i) => i.category === category)
					.reduce((s, i) => s + i.estimatedCost, 0);
				if (t > 0) subTotals[category] = t;
			}
		}
		const grandTotal = items.reduce((s, i) => s + i.estimatedCost, 0);
		const hasSip = items.some(
			(i) => i.specificProgram && i.specificProgram !== "Unimplemented",
		);
		results.push({ month, hasSip, items, subTotals, grandTotal });
	}
	results.sort(
		(a, b) =>
			(MONTH_NAMES.indexOf(a.month) || 99) -
			(MONTH_NAMES.indexOf(b.month) || 99),
	);
	return results;
}

// ─── Column Chooser ───────────────────────────────────────────────────────────

function ColumnChooser({
	visibleCols,
	onChange,
}: {
	visibleCols: Set<string>;
	onChange: (k: Set<string>) => void;
}) {
	return (
		<Dropdown closeOnSelect={false}>
			<DropdownTrigger>
				<Button
					variant="flat"
					size="sm"
					endContent={
						<svg
							aria-hidden
							height="1em"
							fill="none"
							viewBox="0 0 24 24"
							width="1em"
						>
							<path
								d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeMiterlimit={10}
								strokeWidth={1.5}
							/>
						</svg>
					}
				>
					Columns
				</Button>
			</DropdownTrigger>
			<DropdownMenu
				disallowEmptySelection
				aria-label="Toggle columns"
				selectionMode="multiple"
				selectedKeys={visibleCols}
				onSelectionChange={(k) => onChange(new Set(k as Set<string>))}
			>
				{ALL_COLUMNS.map((col) => (
					<DropdownItem key={col.uid}>{col.label}</DropdownItem>
				))}
			</DropdownMenu>
		</Dropdown>
	);
}

function TemplateDownloadDropdown() {
	return (
		<Dropdown>
			<DropdownTrigger>
				<Button
					variant="flat"
					size="sm"
					startContent={
						<svg
							aria-hidden
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
					}
				>
					Templates
				</Button>
			</DropdownTrigger>
			<DropdownMenu aria-label="Download Excel templates">
				<DropdownItem
					key="sip"
					description="12 monthly sheets · 4 category sections"
					startContent={<span className="text-base">📋</span>}
					onPress={() =>
						triggerDownload(
							`${API}/api/Template/SchoolImplementationPlan_Template.xlsx`,
							"SchoolImplementationPlan_Template.xlsx",
						)
					}
				>
					School Implementation Plan
				</DropdownItem>
				<DropdownItem
					key="app"
					description="Single sheet · UNSPSC · auto Total Amount"
					startContent={<span className="text-base">📊</span>}
					onPress={() =>
						triggerDownload(
							`${API}/api/Template/AnnualProcurementPlan_Template.xlsx`,
							"AnnualProcurementPlan_Template.xlsx",
						)
					}
				>
					Annual Procurement Plan
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}

// ─── Cells ────────────────────────────────────────────────────────────────────

function ArCodeCell({ row }: { row: SchoolPlanItem }) {
	if (!row.arCode)
		return <span className="text-xs text-default-300 italic">—</span>;
	return (
		<Tooltip
			content={
				row.isVerified
					? "All linked APP items verified ✓"
					: "Pending photo verification — click to review"
			}
		>
			<a
				href={`/projects/${encodeURIComponent(row.arCode)}`}
				className="inline-flex items-center gap-1.5 group"
			>
				<span className="text-xs font-mono text-primary underline underline-offset-2 group-hover:text-primary-600 transition-colors">
					{row.arCode}
				</span>
				{row.isVerified ? (
					<span className="flex items-center justify-center w-4 h-4 rounded-full bg-success text-white text-[9px] font-bold shrink-0">
						✓
					</span>
				) : (
					<span className="flex items-center justify-center w-4 h-4 rounded-full bg-warning/20 text-warning-700 text-[9px] font-bold shrink-0">
						!
					</span>
				)}
			</a>
		</Tooltip>
	);
}

function StatusCell({ row }: { row: SchoolPlanItem }) {
	// status arrives from the API as a number (0 = Implemented, 1 = Approved)
	// or as a string in local preview data. Normalise both.
	const raw = row.status;
	const isApproved = raw === "Approved" || raw === (1 as any) || raw === "1";
	const label = isApproved ? "Verified" : "Implemented";
	return (
		<Chip size="sm" variant="flat" color={isApproved ? "success" : "warning"}>
			{label}
		</Chip>
	);
}

// ─── Grand Total Card ─────────────────────────────────────────────────────────

function GrandTotalCard({
	sheet,
	annualBudget,
	addItemButton,
	toolbarButtons,
}: {
	sheet: MonthSheet;
	annualBudget?: number | null;
	addItemButton?: React.ReactNode;
	toolbarButtons?: React.ReactNode;
}) {
	const monthlyTarget = annualBudget ? annualBudget / 12 : null;
	const overTarget = monthlyTarget && sheet.grandTotal > monthlyTarget;

	return (
		<div className="flex flex-col gap-3 bg-primary/10 border border-primary/20 rounded-xl px-6 py-4">
			{/* Top row: totals */}
			<div className="flex items-start justify-between gap-4 flex-wrap">
				<div className="flex flex-col">
					<span className="text-xs text-default-500 uppercase tracking-wide">
						Total Budget — {sheet.month}
					</span>
					<span className="text-2xl font-bold text-primary">
						₱
						{sheet.grandTotal.toLocaleString("en-PH", {
							minimumFractionDigits: 2,
						})}
					</span>
					{monthlyTarget && (
						<span
							className={`text-xs mt-0.5 font-medium ${overTarget ? "text-danger-500" : "text-success-600"}`}
						>
							{overTarget ? "▲" : "▼"} vs monthly target ₱
							{monthlyTarget.toLocaleString("en-PH", {
								maximumFractionDigits: 0,
							})}
						</span>
					)}
				</div>
				<div className="flex gap-4 text-sm text-default-500 flex-wrap">
					{Object.entries(sheet.subTotals).map(([cat, val]) => (
						<div key={cat} className="flex flex-col items-end">
							<span className="text-xs text-default-400">
								{CATEGORY_LABELS[cat] ?? cat}
							</span>
							<span className="font-semibold text-default-700">
								₱{val.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Bottom row: action toolbar — only shown when props are provided */}
			{(toolbarButtons || addItemButton) && (
				<div className="flex items-center gap-2 pt-1 border-t border-primary/15 flex-wrap">
					{toolbarButtons}
					<div className="flex-1" />
					{addItemButton}
				</div>
			)}
		</div>
	);
}

// ─── Cell Renderer ────────────────────────────────────────────────────────────

function renderCell(row: SchoolPlanItem, uid: string): React.ReactNode {
	switch (uid) {
		case "kraArea":
			return (
				<span className="text-xs text-default-500 leading-tight">
					{row.kraArea}
				</span>
			);
		case "specificProgram":
			return row.specificProgram === "Unimplemented" ? null : (
				<span className="text-xs leading-tight">{row.specificProgram}</span>
			);
		case "programActivity":
			return row.programActivity;
		case "purpose":
			return <span className="text-xs leading-tight">{row.purpose}</span>;
		case "performanceIndicator":
			return (
				<span className="text-xs leading-tight">
					{row.performanceIndicator}
				</span>
			);
		case "resourceDescription":
			return (
				<span className="text-xs leading-tight">{row.resourceDescription}</span>
			);
		case "quantity":
			return <span className="block text-right">{row.quantity}</span>;
		case "estimatedCost":
			return (
				<span className="block text-right font-medium">
					{row.estimatedCost > 0
						? `₱${row.estimatedCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
						: "—"}
				</span>
			);
		case "accountTitle":
			return <span className="text-xs">{row.accountTitle}</span>;
		case "accountCode":
			return <span className="text-xs font-mono">{row.accountCode}</span>;
		case "arCode":
			return <ArCodeCell row={row} />;
		case "status":
			return <StatusCell row={row} />;
		default:
			return null;
	}
}

// ─── MonthTable ───────────────────────────────────────────────────────────────

function MonthTable({
	sheet,
	visibleCols,
}: {
	sheet: MonthSheet;
	visibleCols: Set<string>;
}) {
	const categories = Array.from(new Set(sheet.items.map((i) => i.category)));
	const activeCols = ALL_COLUMNS.filter((c) => visibleCols.has(c.uid));
	return (
		<div className="flex flex-col gap-6 pb-4">
			{categories.map((cat) => {
				const catItems = sheet.items.filter((i) => i.category === cat);
				const subtotal = sheet.subTotals[cat];
				const tableData: TableRowData[] = [
					...catItems.map((item, idx) => ({ ...item, _rowKey: `item-${idx}` })),
					...(subtotal !== undefined
						? [
								{
									_rowKey: "subtotal",
									_isSubtotal: true as const,
									_subtotalValue: subtotal,
									kraArea: "",
									specificProgram: "",
									programActivity: "",
									purpose: "",
									performanceIndicator: "",
									resourceDescription: "",
									quantity: "",
									estimatedCost: 0,
									accountTitle: "",
									accountCode: "",
									category: cat,
								},
							]
						: []),
				];
				return (
					<div key={cat} className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<h3 className="text-sm font-semibold text-default-600 uppercase tracking-wide">
								{cat}
							</h3>
							<Chip
								size="sm"
								color={CATEGORY_COLORS[cat] ?? "default"}
								variant="flat"
							>
								{CATEGORY_LABELS[cat] ?? cat} · {catItems.length}
							</Chip>
						</div>
						<Table aria-label={`${cat} items`} removeWrapper>
							<TableHeader>
								{activeCols.map((col) => (
									<TableColumn key={col.uid} className={col.className ?? ""}>
										{col.label}
									</TableColumn>
								))}
							</TableHeader>
							<TableBody emptyContent="No items." items={tableData}>
								{(row: TableRowData) =>
									row._isSubtotal ? (
										<TableRow
											key={row._rowKey}
											className="bg-default-100/60 font-bold"
										>
											{activeCols.map((col) => {
												if (col.uid === "estimatedCost")
													return (
														<TableCell
															key={col.uid}
															className="text-right font-bold text-primary"
														>
															₱
															{row._subtotalValue!.toLocaleString("en-PH", {
																minimumFractionDigits: 2,
															})}
														</TableCell>
													);
												if (col.uid === "accountTitle")
													return (
														<TableCell
															key={col.uid}
															className="text-right font-semibold text-default-500"
														>
															Sub-Total
														</TableCell>
													);
												return <TableCell key={col.uid}>{""}</TableCell>;
											})}
										</TableRow>
									) : (
										<TableRow key={row._rowKey}>
											{activeCols.map((col) => (
												<TableCell key={col.uid}>
													{renderCell(row, col.uid)}
												</TableCell>
											))}
										</TableRow>
									)
								}
							</TableBody>
						</Table>
					</div>
				);
			})}
		</div>
	);
}

// ─── Month Filter Bar (in preview modal) ──────────────────────────────────────

function MonthFilterBar({
	sheets,
	activeMonth,
	onSelect,
}: {
	sheets: MonthSheet[];
	activeMonth: string;
	onSelect: (m: string) => void;
}) {
	return (
		<div className="sticky bottom-0 z-50 bg-background/90 backdrop-blur-md border-t border-default-200 px-6 py-3 shrink-0">
			<div className="flex flex-wrap gap-2">
				{sheets.map((sheet) => {
					const isActive = sheet.month === activeMonth;
					return (
						<button
							key={sheet.month}
							onClick={() => onSelect(sheet.month)}
							className={[
								"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
								isActive
									? "bg-primary text-white shadow-md"
									: "bg-default-100 text-default-600 hover:bg-default-200",
							].join(" ")}
						>
							{sheet.month}
							{sheet.grandTotal > 0 && (
								<span
									className={[
										"text-xs px-1.5 py-0.5 rounded-full",
										isActive
											? "bg-white/20 text-white"
											: "bg-default-200 text-default-500",
									].join(" ")}
								>
									₱{(sheet.grandTotal / 1000).toFixed(0)}k
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

// ─── Month Tab Bar ────────────────────────────────────────────────────────────

function MonthTabBar({
	sheets,
	activeMonth,
	onSelect,
}: {
	sheets: MonthSheet[];
	activeMonth: string;
	onSelect: (m: string) => void;
}) {
	const planTotal = sheets.reduce((sum, s) => sum + s.grandTotal, 0);
	return (
		<div className="flex flex-wrap gap-2 pb-2 border-b border-default-200">
			<button
				onClick={() => onSelect("TOTAL")}
				className={[
					"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
					activeMonth === "TOTAL"
						? "bg-default-800 text-white shadow-md"
						: "bg-default-100 text-default-600 hover:bg-default-200",
				].join(" ")}
			>
				<svg
					aria-hidden
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2.5}
					strokeLinecap="round"
					strokeLinejoin="round"
					className="shrink-0"
				>
					<line x1="12" y1="1" x2="12" y2="23" />
					<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
				</svg>
				Total
				{planTotal > 0 && (
					<span
						className={[
							"text-xs px-1.5 py-0.5 rounded-full",
							activeMonth === "TOTAL"
								? "bg-white/20 text-white"
								: "bg-default-200 text-default-500",
						].join(" ")}
					>
						₱{(planTotal / 1_000_000).toFixed(2)}M
					</span>
				)}
			</button>
			{sheets.map((sheet) => {
				const isActive = sheet.month === activeMonth;
				return (
					<button
						key={sheet.month}
						onClick={() => onSelect(sheet.month)}
						className={[
							"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
							isActive
								? "bg-primary text-white shadow-md"
								: "bg-default-100 text-default-600 hover:bg-default-200",
						].join(" ")}
					>
						{sheet.month}
						{sheet.grandTotal > 0 && (
							<span
								className={[
									"text-xs px-1.5 py-0.5 rounded-full",
									isActive
										? "bg-white/20 text-white"
										: "bg-default-200 text-default-500",
								].join(" ")}
							>
								₱{(sheet.grandTotal / 1000).toFixed(0)}k
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
}

// ─── Total View ───────────────────────────────────────────────────────────────

function TotalView({
	sheets,
	annualBudget,
}: {
	sheets: MonthSheet[];
	annualBudget?: number | null;
}) {
	const planTotal = sheets.reduce((sum, s) => sum + s.grandTotal, 0);
	const fmt = (n: number) =>
		`₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

	const budget = annualBudget ?? null;
	const remaining = budget != null ? budget - planTotal : null;
	const utilPct =
		budget != null && budget > 0
			? Math.min((planTotal / budget) * 100, 100)
			: null;
	const overBudget = budget != null && planTotal > budget;

	return (
		<div className="flex flex-col gap-4">
			{/* ── Annual summary header ── */}
			<div className="flex items-center justify-between bg-default-800 text-white rounded-2xl px-6 py-5 flex-wrap gap-4">
				<div>
					<p className="text-xs uppercase tracking-widest text-white/50 mb-1">
						Annual Total Expenditure
					</p>
					<p className="text-3xl font-bold">{fmt(planTotal)}</p>
				</div>
				<div className="text-right">
					<p className="text-xs text-white/50 uppercase tracking-wide mb-1">
						Months with data
					</p>
					<p className="text-2xl font-semibold">
						{sheets.filter((s) => s.grandTotal > 0).length} / {sheets.length}
					</p>
				</div>
			</div>

			{/* ── Budget comparison card ── only shown when annualBudget is set ── */}
			{budget != null && (
				<div
					className={[
						"rounded-2xl border px-6 py-5 flex flex-col gap-4",
						overBudget
							? "bg-danger-50 border-danger-200"
							: "bg-primary/5 border-primary/20",
					].join(" ")}
				>
					<div className="flex flex-wrap items-start justify-between gap-4">
						{/* Expenditure */}
						<div className="flex flex-col">
							<span className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								Total Expenditure
							</span>
							<span className="text-2xl font-bold text-primary">
								{fmt(planTotal)}
							</span>
						</div>
						{/* Annual Budget */}
						<div className="flex flex-col text-right">
							<span className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								Annual Budget
							</span>
							<span className="text-2xl font-bold text-default-700">
								{fmt(budget)}
							</span>
						</div>
						{/* Remaining / Over */}
						<div
							className={[
								"flex flex-col text-right",
								overBudget ? "" : "",
							].join("")}
						>
							<span className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								{overBudget ? "Over Budget" : "Remaining"}
							</span>
							<span
								className={`text-2xl font-bold ${overBudget ? "text-danger-600" : "text-success-600"}`}
							>
								{overBudget ? "+" : ""}
								{fmt(Math.abs(remaining!))}
							</span>
						</div>
					</div>

					{/* Progress bar */}
					<div className="flex flex-col gap-1.5">
						<div className="flex justify-between text-xs text-default-500">
							<span>
								{overBudget
									? "Over budget"
									: `${utilPct!.toFixed(1)}% utilised`}
							</span>
							<span>
								{fmt(planTotal)} of {fmt(budget)}
							</span>
						</div>
						<div className="h-2.5 bg-default-100 rounded-full overflow-hidden">
							<div
								className={`h-full rounded-full transition-all ${overBudget ? "bg-danger-500" : "bg-primary"}`}
								style={{ width: `${Math.min(utilPct ?? 0, 100)}%` }}
							/>
						</div>
						{overBudget && (
							<div className="flex justify-end">
								<span className="text-xs font-medium text-danger-500">
									{((planTotal / budget) * 100).toFixed(1)}% of budget used
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* ── Month-by-month breakdown ── */}
			<div className="rounded-xl border border-default-200 overflow-hidden">
				<table className="w-full text-sm">
					<thead>
						<tr className="bg-default-50 border-b border-default-200">
							<th className="text-left px-4 py-3 font-semibold text-default-600 uppercase text-xs tracking-wide">
								Month
							</th>
							<th className="text-right px-4 py-3 font-semibold text-default-600 uppercase text-xs tracking-wide w-48">
								Expenditure
							</th>
							<th className="px-4 py-3 w-52" />
						</tr>
					</thead>
					<tbody>
						{sheets.map((sheet) => {
							const pct =
								planTotal > 0 ? (sheet.grandTotal / planTotal) * 100 : 0;
							const hasData = sheet.grandTotal > 0;
							return (
								<tr
									key={sheet.month}
									className={[
										"border-b border-default-100 hover:bg-default-50/60 transition-colors",
										!hasData ? "opacity-40" : "",
									].join(" ")}
								>
									<td className="px-4 py-3">
										<span
											className={hasData ? "font-medium" : "text-default-400"}
										>
											{sheet.month}
										</span>
									</td>
									<td className="px-4 py-3 text-right font-semibold tabular-nums">
										{hasData ? (
											<span className="text-primary">
												{fmt(sheet.grandTotal)}
											</span>
										) : (
											<span className="text-default-300 font-normal">—</span>
										)}
									</td>
									<td className="px-4 py-3">
										{hasData && (
											<div className="flex items-center gap-2">
												<div className="flex-1 h-1.5 bg-default-100 rounded-full overflow-hidden">
													<div
														className="h-full bg-primary rounded-full"
														style={{ width: `${pct}%` }}
													/>
												</div>
												<span className="text-xs text-default-400 w-10 text-right tabular-nums">
													{pct.toFixed(1)}%
												</span>
											</div>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
					<tfoot>
						<tr className="bg-default-100 border-t-2 border-default-300">
							<td className="px-4 py-3 font-bold text-default-700 uppercase text-xs tracking-wide">
								TOTAL
							</td>
							<td className="px-4 py-3 text-right font-bold text-lg text-primary tabular-nums">
								{fmt(planTotal)}
							</td>
							<td className="px-4 py-3" />
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
}

// ─── Add Item Modal ───────────────────────────────────────────────────────────

function AddItemModal({
	activeMonth,
	token,
	isOpen,
	onClose,
	onAdded,
}: {
	activeMonth: string;
	token: string | null;
	isOpen: boolean;
	onClose: () => void;
	onAdded: () => void;
}) {
	const currentYear = new Date().getFullYear();
	const monthIndex = MONTH_NAMES.indexOf(activeMonth);
	const initialDate =
		monthIndex >= 0
			? `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}-01`
			: `${currentYear}-01-01`;
	const blank = {
		date: initialDate,
		kra: "",
		sipProgram: "",
		activity: "",
		purpose: "",
		indicator: "",
		resources: "",
		quantity: "",
		estimatedCost: "",
		accountTitle: "",
		accountCode: "",
		expenditureType: "Regular Expenditure",
		status: "Implemented" as "Implemented" | "Approved",
	};
	const [form, setForm] = useState(blank);
	const [saving, setSaving] = useState(false);
	useEffect(() => {
		const mi = MONTH_NAMES.indexOf(activeMonth);
		const yr = new Date().getFullYear();
		const dt =
			mi >= 0 ? `${yr}-${String(mi + 1).padStart(2, "0")}-01` : `${yr}-01-01`;
		setForm((f) => ({ ...f, date: dt }));
	}, [activeMonth, isOpen]);
	const set = (key: keyof typeof form) => (v: string) =>
		setForm((f) => ({ ...f, [key]: v }));
	const save = async () => {
		if (!form.activity || !form.estimatedCost) return;
		setSaving(true);
		try {
			await fetch(`${API}/api/SchoolImplementation/item`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					date: form.date,
					kra: form.kra || null,
					sipProgram: form.sipProgram || "Unimplemented",
					activity: form.activity,
					purpose: form.purpose || null,
					indicator: form.indicator || null,
					resources: form.resources || null,
					quantity: form.quantity || null,
					estimatedCost: parseFloat(form.estimatedCost) || 0,
					accountTitle: form.accountTitle || null,
					accountCode: form.accountCode || null,
					expenditureType: form.expenditureType,
					status: form.status === "Approved" ? 1 : 0,
				}),
			});
			setForm(blank);
			onAdded();
			onClose();
		} finally {
			setSaving(false);
		}
	};
	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onClose}
			size="2xl"
			scrollBehavior="inside"
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-0.5">
					<span>Add Implementation Item</span>
					<span className="text-sm font-normal text-default-500">
						An AR code will be auto-generated.
					</span>
				</ModalHeader>
				<ModalBody>
					<div className="grid grid-cols-2 gap-3">
						<Input
							label="Date"
							type="date"
							value={form.date}
							onValueChange={set("date")}
							className="col-span-2"
						/>
						<Select
							label="Expenditure Type"
							className="col-span-2"
							selectedKeys={[form.expenditureType]}
							onSelectionChange={(k) =>
								set("expenditureType")(Array.from(k)[0] as string)
							}
						>
							{EXPENDITURE_TYPES.map((t) => (
								<SelectItem key={t}>{t}</SelectItem>
							))}
						</Select>
						<Input
							label="KRA"
							value={form.kra}
							onValueChange={set("kra")}
							className="col-span-2"
						/>
						<Input
							label="Specific Program (SiP)"
							value={form.sipProgram}
							onValueChange={set("sipProgram")}
						/>
						<Input
							label="Activity / PPA"
							value={form.activity}
							onValueChange={set("activity")}
							isRequired
						/>
						<Input
							label="Purpose / Objectives"
							value={form.purpose}
							onValueChange={set("purpose")}
							className="col-span-2"
						/>
						<Input
							label="Performance Indicator"
							value={form.indicator}
							onValueChange={set("indicator")}
							className="col-span-2"
						/>
						<Input
							label="Resources"
							value={form.resources}
							onValueChange={set("resources")}
						/>
						<Input
							label="Quantity"
							value={form.quantity}
							onValueChange={set("quantity")}
						/>
						<Input
							label="Estimated Cost (₱)"
							value={form.estimatedCost}
							onValueChange={set("estimatedCost")}
							type="number"
							isRequired
						/>
						<div className="flex flex-col gap-1.5">
							<span className="text-sm text-default-600">Status</span>
							<div className="flex gap-2">
								{(["Implemented", "Approved"] as const).map((s) => (
									<button
										key={s}
										type="button"
										onClick={() => setForm((f) => ({ ...f, status: s }))}
										className={[
											"flex-1 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all",
											form.status === s
												? s === "Approved"
													? "border-success bg-success/10 text-success-700"
													: "border-warning bg-warning/10 text-warning-700"
												: "border-default-200 text-default-500 hover:border-default-300",
										].join(" ")}
									>
										{s}
									</button>
								))}
							</div>
						</div>
						<Input
							label="Account Title"
							value={form.accountTitle}
							onValueChange={set("accountTitle")}
							className="col-span-2"
						/>
						<Input
							label="Account Code"
							value={form.accountCode}
							onValueChange={set("accountCode")}
						/>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="flat" onPress={onClose}>
						Cancel
					</Button>
					<Button
						color="primary"
						isLoading={saving}
						onPress={save}
						isDisabled={!form.activity || !form.estimatedCost}
					>
						Add Item
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

// ─── Dev Seed Banner ──────────────────────────────────────────────────────────

function SeedFakeBanner({
	planId,
	items,
	token,
	onDone,
}: {
	planId: string;
	items: SchoolPlanItem[];
	token: string | null;
	onDone: () => void;
}) {
	const [loading, setLoading] = useState(false);
	const seed = async () => {
		setLoading(true);
		try {
			await fetch(`${API}/api/Ar/seed-fake-links/${items[0].id}`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
			});
			onDone();
		} finally {
			setLoading(false);
		}
	};
	return (
		<div className="flex items-center gap-3 px-4 py-2.5 bg-warning-50 border border-warning-200 rounded-xl text-sm">
			<span className="text-warning-700 font-medium">
				{items.length} SIP item{items.length !== 1 ? "s" : ""} without an AR
				code.
			</span>
			<Button
				size="sm"
				color="warning"
				variant="flat"
				isLoading={loading}
				onPress={seed}
			>
				Seed fake APP items (dev)
			</Button>
			<span className="text-warning-500 text-xs">
				Generates 3 test APP items linked to the first unlinked row.
			</span>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SchoolPlanTable() {
	const [planHeaders, setPlanHeaders] = useState<SchoolPlanHeader[]>([]);
	const [selectedPlan, setSelectedPlan] = useState<SchoolPlan | null>(null);
	const [activeMonth, setActiveMonth] = useState<string>("January");
	const [loadingHeaders, setLoadingHeaders] = useState(true);
	const [loadingItems, setLoadingItems] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [visibleCols, setVisibleCols] = useState<Set<string>>(DEFAULT_VISIBLE);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [previewSheets, setPreviewSheets] = useState<MonthSheet[]>([]);
	const [previewActiveMonth, setPreviewActiveMonth] =
		useState<string>("January");
	const [fileToUpload, setFileToUpload] = useState<File | null>(null);

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const {
		isOpen: addItemOpen,
		onOpen: openAddItem,
		onClose: closeAddItem,
	} = useDisclosure();

	const token = useStore($token);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (evt) => {
			const workbook = XLSX.read(evt.target?.result, { type: "binary" });
			const error = validateSipTemplate(workbook);
			if (error) {
				setValidationError(error);
				e.target.value = "";
				return;
			}
			setValidationError(null);
			setFileToUpload(file);
			const parsed = parseSchoolPlanWorkbook(workbook);
			setPreviewSheets(parsed);
			setPreviewActiveMonth(parsed[0]?.month ?? "January");
			onOpen();
		};
		reader.readAsBinaryString(file);
		e.target.value = "";
	};

	const confirmUpload = async () => {
		if (!fileToUpload) return;
		setUploading(true);
		const formData = new FormData();
		formData.append("file", fileToUpload);
		try {
			const res = await fetch(`${API}/api/SchoolImplementation/import`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});
			if (!res.ok) {
				alert(`Import failed: ${await res.text()}`);
				return;
			}
			await fetchPlanHeaders();
			alert("Uploaded successfully!");
			onClose();
		} catch {
			alert("Upload failed.");
		} finally {
			setUploading(false);
		}
	};

	const fetchPlanHeaders = async () => {
		setLoadingHeaders(true);
		try {
			const res = await fetch(`${API}/api/SchoolImplementation`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data: SchoolPlanHeader[] = await res.json();
			setPlanHeaders(data);
			// ── Default: auto-select the most recent plan ──────────────────────
			if (data.length > 0 && !selectedPlan) {
				// Headers are already sorted descending by year from the server
				fetchPlanById(data[0].id);
			}
		} finally {
			setLoadingHeaders(false);
		}
	};

	const fetchPlanById = async (planId: string) => {
		setLoadingItems(true);
		try {
			const res = await fetch(`${API}/api/SchoolImplementation/${planId}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data: SchoolPlan = await res.json();
			setSelectedPlan(data);
			setActiveMonth(data.months?.[0]?.month ?? "January");
		} finally {
			setLoadingItems(false);
		}
	};

	useEffect(() => {
		fetchPlanHeaders();
	}, [token]);

	const handleSelectionChange = (keys: any) => {
		const id = Array.from(keys)[0] as string;
		if (id) fetchPlanById(id);
	};

	const activeSheet = selectedPlan?.months?.find(
		(m) => m.month === activeMonth,
	);
	const previewSheet = previewSheets.find(
		(m) => m.month === previewActiveMonth,
	);
	const unlinkedItems = (activeSheet?.items ?? []).filter(
		(i) => !i.arCode && i.id != null,
	);

	if (loadingHeaders)
		return <div className="p-8 text-default-500">Loading plans...</div>;

	// Toolbar items that live inside the grand total card (Columns + Templates only)
	const toolbarButtons = (
		<>
			<ColumnChooser visibleCols={visibleCols} onChange={setVisibleCols} />
			<TemplateDownloadDropdown />
		</>
	);

	const addItemButton = selectedPlan ? (
		<Button color="success" size="sm" onPress={openAddItem}>
			+ Add Item
		</Button>
	) : null;

	return (
		<div className="flex flex-col gap-6">
			{/* ── Plan selector ── always visible, Import button here so it works before data loads */}
			<div className="flex justify-between items-center flex-wrap gap-3">
				<Select
					label="Select School Implementation Plan Year"
					className="max-w-xs"
					selectedKeys={
						selectedPlan ? new Set([String(selectedPlan.id)]) : undefined
					}
					onSelectionChange={handleSelectionChange}
				>
					{planHeaders.map((p) => (
						<SelectItem key={p.id}>
							{p.year} — {p.school}
						</SelectItem>
					))}
				</Select>
				<div className="flex items-center gap-2">
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						accept=".xlsx,.xls"
						className="hidden"
					/>
					<Button
						color="primary"
						size="sm"
						onPress={() => fileInputRef.current?.click()}
						isLoading={uploading}
					>
						{uploading ? "Importing..." : "Import Excel"}
					</Button>
				</div>
			</div>

			{/* ── Validation error banner ── */}
			{validationError && (
				<div className="flex items-start gap-3 px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl text-sm">
					<span className="text-danger-600 text-lg shrink-0">⚠</span>
					<div className="flex flex-col gap-1">
						<span className="font-semibold text-danger-700">
							Invalid File Format
						</span>
						<span className="text-danger-600">{validationError}</span>
					</div>
					<button
						onClick={() => setValidationError(null)}
						className="ml-auto text-danger-400 hover:text-danger-600 text-lg shrink-0"
					>
						×
					</button>
				</div>
			)}

			{/* ── Dev seed banner ── */}
			{selectedPlan && unlinkedItems.length > 0 && (
				<SeedFakeBanner
					planId={selectedPlan.id}
					items={unlinkedItems}
					token={token}
					onDone={() => fetchPlanById(selectedPlan.id)}
				/>
			)}

			{/* ── Preview Modal ── */}
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="full"
				scrollBehavior="normal"
				classNames={{ wrapper: "overflow-hidden" }}
			>
				<ModalContent className="flex flex-col h-screen overflow-hidden">
					<ModalHeader className="flex flex-col gap-1 shrink-0">
						<span>Preview Import Data</span>
						<span className="text-sm font-normal text-default-500">
							Review all sheets before confirming. Navigate months below.
						</span>
					</ModalHeader>
					<ModalBody className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
						{previewSheets.length > 0 ? (
							previewSheet ? (
								<div className="flex flex-col gap-4">
									<GrandTotalCard sheet={previewSheet} />
									<MonthTable sheet={previewSheet} visibleCols={visibleCols} />
								</div>
							) : (
								<div className="text-center text-default-400 p-10">
									Select a month below to preview.
								</div>
							)
						) : (
							<div className="text-center text-default-400 p-10">
								No data found in file.
							</div>
						)}
					</ModalBody>
					{previewSheets.length > 0 && (
						<MonthFilterBar
							sheets={previewSheets}
							activeMonth={previewActiveMonth}
							onSelect={setPreviewActiveMonth}
						/>
					)}
					<ModalFooter className="shrink-0">
						<Button color="danger" variant="flat" onPress={onClose}>
							Cancel
						</Button>
						<Button
							color="primary"
							isLoading={uploading}
							onPress={confirmUpload}
						>
							Confirm &amp; Import
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* ── Main Content ── */}
			{loadingItems ? (
				<div className="flex justify-center p-10">
					<Spinner label="Loading plan items..." />
				</div>
			) : selectedPlan ? (
				<div className="flex flex-col gap-4">
					<div>
						<h2 className="text-2xl font-bold">
							School Implementation Plan — {selectedPlan.year}
						</h2>
						<p className="text-default-500">{selectedPlan.school}</p>
					</div>
					<MonthTabBar
						sheets={selectedPlan.months ?? []}
						activeMonth={activeMonth}
						onSelect={setActiveMonth}
					/>
					{activeMonth === "TOTAL" ? (
						<TotalView
							sheets={selectedPlan.months ?? []}
							annualBudget={selectedPlan.annualBudget}
						/>
					) : (
						<>
							{/* Grand total card with toolbar embedded inside */}
							{activeSheet && (
								<GrandTotalCard
									sheet={activeSheet}
									annualBudget={selectedPlan.annualBudget}
									toolbarButtons={toolbarButtons}
									addItemButton={addItemButton}
								/>
							)}
							{activeSheet ? (
								<MonthTable sheet={activeSheet} visibleCols={visibleCols} />
							) : (
								<div className="text-center text-default-400 p-10">
									Select a month above.
								</div>
							)}
						</>
					)}
				</div>
			) : (
				<div className="text-gray-500 text-center p-10">
					Select a year from the dropdown to view the School Implementation
					Plan.
				</div>
			)}

			{selectedPlan && (
				<AddItemModal
					activeMonth={activeMonth === "TOTAL" ? "January" : activeMonth}
					token={token}
					isOpen={addItemOpen}
					onClose={closeAddItem}
					onAdded={() => fetchPlanById(selectedPlan.id)}
				/>
			)}
		</div>
	);
}
