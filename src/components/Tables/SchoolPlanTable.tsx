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
import { toast } from "../Toast";

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

interface ColDef {
	uid: string;
	label: string;
	className?: string;
}

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
const API = "http://localhost:5109";

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
	OFF_PERF_IND = 4,
	OFF_RES_DESC = 5,
	OFF_QTY = 6,
	OFF_COST = 7,
	OFF_ACC_TITLE = 8,
	OFF_ACC_CODE = 9;
const HEADER_ROW_INDEX = 3,
	DATA_START_INDEX = 4;
const REQUIRED_HEADER_KEYWORDS = [
	"key result area",
	"specific program",
	"programs/projects",
	"estimated",
	"account",
];

function isMonthSheet(n: string) {
	return MONTH_NAMES.some((m) => n.trim().toLowerCase() === m.toLowerCase());
}
function normalizeMonthName(n: string) {
	const t = n.trim().toLowerCase();
	return MONTH_NAMES.find((m) => m.toLowerCase() === t) ?? n.trim();
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
					quantity: row[startCol + OFF_QTY]
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

// ─── Mobile Card Row ─────────────────────────────────────────────────────────

function MobileItemCard({ item }: { item: SchoolPlanItem }) {
	const isApproved =
		item.status === "Approved" ||
		item.status === (1 as any) ||
		item.status === "1";

	return (
		<div className="border border-default-200 rounded-xl p-3 flex flex-col gap-2 bg-background">
			<div className="flex items-start justify-between gap-2">
				<p className="text-sm font-medium leading-snug flex-1">
					{item.programActivity}
				</p>
				<Chip
					size="sm"
					variant="flat"
					color={isApproved ? "success" : "warning"}
					className="shrink-0"
				>
					{isApproved ? "Verified" : "Implemented"}
				</Chip>
			</div>

			{/* KRA Area context */}
			{item.kraArea && (
				<p className="text-xs text-default-400">{item.kraArea}</p>
			)}

			{/* NEW: AR Code Section - Positioned as a secondary tag */}
			{item.arCode && (
				<div className="flex items-center gap-1.5">
					<span className="text-[10px] uppercase font-bold text-default-400 tracking-tight">
						AR Code:
					</span>
					<a
						href={`/projects/detail?code=${encodeURIComponent(item.arCode)}`}
						className="text-xs font-mono font-semibold text-primary hover:text-primary-400 transition-colors underline underline-offset-2 flex items-center gap-1"
					>
						{item.arCode}
						{item.isVerified ? (
							<span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-success text-white text-[8px] font-bold">
								✓
							</span>
						) : (
							<span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-warning/20 text-warning-700 text-[8px] font-bold border border-warning/30">
								!
							</span>
						)}
					</a>
				</div>
			)}

			{/* Footer row with Account Title and Cost */}
			<div className="flex items-center justify-between mt-1 pt-1 border-t border-default-50">
				<span className="text-xs text-default-500 truncate max-w-[60%]">
					{item.accountTitle || "—"}
				</span>
				<span className="text-sm font-bold text-primary">
					{item.estimatedCost > 0 ? fmt(item.estimatedCost) : "—"}
				</span>
			</div>
		</div>
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
				href={`/projects/detail?code=${encodeURIComponent(row.arCode)}`}
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
	return (
		<Chip
			size="sm"
			variant="flat"
			color={row.isVerified ? "success" : "warning"}
		>
			{row.isVerified ? "Approved" : "Implemented"}
		</Chip>
	);
}

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
			return (
				<span className="text-sm leading-snug">{row.programActivity}</span>
			);
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
					{row.estimatedCost > 0 ? fmt(row.estimatedCost) : "—"}
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
				<Button variant="flat" size="sm">
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
				<Button variant="flat" size="sm">
					Templates
				</Button>
			</DropdownTrigger>
			<DropdownMenu aria-label="Download Excel templates">
				<DropdownItem
					key="sip"
					onPress={() =>
						triggerDownload(
							// Matches: api/templates/download-school-implementation-plan
							`https://i3p-1.onrender.com/api/templates/download-school-implementation-plan`,
							"SchoolImplementationPlan_Template.xlsx",
						)
					}
				>
					School Implementation Plan
				</DropdownItem>
				<DropdownItem
					key="app"
					onPress={() =>
						triggerDownload(
							// Matches: api/templates/download-procurement-plan
							`https://i3p-1.onrender.com/api/templates/download-procurement-plan`,
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

// ─── Grand Total Card ─────────────────────────────────────────────────────────

function GrandTotalCard({
	sheet,
	annualBudget,
}: {
	sheet: MonthSheet;
	annualBudget?: number | null;
}) {
	const monthlyTarget = annualBudget ? annualBudget / 12 : null;
	const overTarget = monthlyTarget && sheet.grandTotal > monthlyTarget;
	return (
		<div className="flex flex-col gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 sm:px-6 py-4">
			<div className="flex items-start justify-between gap-3 flex-wrap">
				<div className="flex flex-col">
					<span className="text-xs text-default-500 uppercase tracking-wide">
						Total Budget — {sheet.month}
					</span>
					<span className="text-xl sm:text-2xl font-bold text-primary">
						{fmt(sheet.grandTotal)}
					</span>
					{monthlyTarget && (
						<span
							className={`text-xs mt-0.5 font-medium ${overTarget ? "text-danger-500" : "text-success-600"}`}
						>
							{overTarget ? "▲" : "▼"} vs monthly target {fmt(monthlyTarget)}
						</span>
					)}
				</div>
				<div className="flex flex-wrap gap-3 text-sm text-default-500">
					{Object.entries(sheet.subTotals).map(([cat, val]) => (
						<div key={cat} className="flex flex-col items-end">
							<span className="text-xs text-default-400">
								{CATEGORY_LABELS[cat] ?? cat}
							</span>
							<span className="font-semibold text-default-700">{fmt(val)}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// ─── Month Table ──────────────────────────────────────────────────────────────

function MonthTable({
	sheet,
	visibleCols,
	isMobile,
}: {
	sheet: MonthSheet;
	visibleCols: Set<string>;
	isMobile: boolean;
}) {
	const categories = Array.from(new Set(sheet.items.map((i) => i.category)));
	const activeCols = ALL_COLUMNS.filter((c) => visibleCols.has(c.uid));
	return (
		<div className="flex flex-col gap-4 pb-4">
			{categories.map((cat) => {
				const catItems = sheet.items.filter((i) => i.category === cat);
				const subtotal = sheet.subTotals[cat];
				return (
					<div key={cat} className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<h3 className="text-xs sm:text-sm font-semibold text-default-600 uppercase tracking-wide">
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

						{/* Mobile: card list */}
						{isMobile ? (
							<div className="flex flex-col gap-2">
								{catItems.map((item, idx) => (
									<MobileItemCard key={idx} item={item} />
								))}
								{subtotal !== undefined && (
									<div className="flex items-center justify-between px-3 py-2 bg-default-100/80 rounded-xl">
										<span className="text-xs font-semibold text-default-500 uppercase tracking-wide">
											Sub-Total
										</span>
										<span className="text-sm font-bold text-primary">
											{fmt(subtotal)}
										</span>
									</div>
								)}
								{catItems.length === 0 && (
									<p className="text-xs text-default-400 px-1">No items.</p>
								)}
							</div>
						) : (
							// Desktop/tablet: scrollable table
							<div className="overflow-x-auto -mx-0">
								<Table aria-label={`${cat} items`} removeWrapper>
									<TableHeader>
										{activeCols.map((col) => (
											<TableColumn
												key={col.uid}
												className={col.className ?? ""}
											>
												{col.label}
											</TableColumn>
										))}
									</TableHeader>
									<TableBody
										emptyContent="No items."
										items={[
											...catItems.map(
												(item, idx) =>
													({ ...item, _rowKey: `item-${idx}` }) as TableRowData,
											),
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
										]}
									>
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
						)}
					</div>
				);
			})}
		</div>
	);
}

// ─── Month Filter / Tab Bars ──────────────────────────────────────────────────

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
		<div className="sticky bottom-0 z-50 bg-background/90 backdrop-blur-md border-t border-default-200 px-3 sm:px-6 py-2.5 shrink-0">
			<div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
				{sheets.map((sheet) => {
					const isActive = sheet.month === activeMonth;
					return (
						<button
							key={sheet.month}
							onClick={() => onSelect(sheet.month)}
							className={[
								"flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0",
								isActive
									? "bg-primary text-white shadow"
									: "bg-default-100 text-default-600 hover:bg-default-200",
							].join(" ")}
						>
							{sheet.month.slice(0, 3)}
							{sheet.grandTotal > 0 && (
								<span
									className={[
										"text-[10px] px-1 py-0.5 rounded-full",
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
		<div className="flex gap-1.5 pb-2 border-b border-default-200 overflow-x-auto scrollbar-hide">
			<button
				onClick={() => onSelect("TOTAL")}
				className={[
					"flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0",
					activeMonth === "TOTAL"
						? "bg-default-800 text-white shadow"
						: "bg-default-100 text-default-600 hover:bg-default-200",
				].join(" ")}
			>
				Total
				{planTotal > 0 && (
					<span
						className={[
							"text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full",
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
							"flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0",
							isActive
								? "bg-primary text-white shadow"
								: "bg-default-100 text-default-600 hover:bg-default-200",
						].join(" ")}
					>
						{/* Show abbreviated month on narrow screens */}
						<span className="sm:hidden">{sheet.month.slice(0, 3)}</span>
						<span className="hidden sm:inline">{sheet.month}</span>
						{sheet.grandTotal > 0 && (
							<span
								className={[
									"text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full",
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
	const budget = annualBudget ?? null;
	const remaining = budget != null ? budget - planTotal : null;
	const utilPct =
		budget != null && budget > 0
			? Math.min((planTotal / budget) * 100, 100)
			: null;
	const overBudget = budget != null && planTotal > budget;
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between bg-default-800 text-white rounded-2xl px-4 sm:px-6 py-4 sm:py-5 flex-wrap gap-3">
				<div>
					<p className="text-xs uppercase tracking-widest text-white/50 mb-1">
						Annual Total Expenditure
					</p>
					<p className="text-2xl sm:text-3xl font-bold">{fmt(planTotal)}</p>
				</div>
				<div className="text-right">
					<p className="text-xs text-white/50 uppercase tracking-wide mb-1">
						Months with data
					</p>
					<p className="text-xl sm:text-2xl font-semibold">
						{sheets.filter((s) => s.grandTotal > 0).length} / {sheets.length}
					</p>
				</div>
			</div>

			{budget != null && (
				<div
					className={[
						"rounded-2xl border px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4",
						overBudget
							? "bg-danger-50 border-danger-200"
							: "bg-primary/5 border-primary/20",
					].join(" ")}
				>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
						<div className="flex flex-col">
							<span className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								Expenditure
							</span>
							<span className="text-lg sm:text-2xl font-bold text-primary">
								{fmt(planTotal)}
							</span>
						</div>
						<div className="flex flex-col text-right sm:text-right">
							<span className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								Budget
							</span>
							<span className="text-lg sm:text-2xl font-bold text-default-700">
								{fmt(budget)}
							</span>
						</div>
						<div className="flex flex-col col-span-2 sm:col-span-1 sm:text-right">
							<span className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								{overBudget ? "Over Budget" : "Remaining"}
							</span>
							<span
								className={`text-lg sm:text-2xl font-bold ${overBudget ? "text-danger-600" : "text-success-600"}`}
							>
								{overBudget ? "+" : ""}
								{fmt(Math.abs(remaining!))}
							</span>
						</div>
					</div>
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
						<div className="h-2 bg-default-100 rounded-full overflow-hidden">
							<div
								className={`h-full rounded-full transition-all ${overBudget ? "bg-danger-500" : "bg-primary"}`}
								style={{ width: `${Math.min(utilPct ?? 0, 100)}%` }}
							/>
						</div>
					</div>
				</div>
			)}

			<div className="rounded-xl border border-default-200 overflow-hidden">
				<table className="w-full text-sm">
					<thead>
						<tr className="bg-default-50 border-b border-default-200">
							<th className="text-left px-3 sm:px-4 py-3 font-semibold text-default-600 uppercase text-xs tracking-wide">
								Month
							</th>
							<th className="text-right px-3 sm:px-4 py-3 font-semibold text-default-600 uppercase text-xs tracking-wide">
								Expenditure
							</th>
							<th className="px-3 sm:px-4 py-3 w-32 sm:w-52 hidden sm:table-cell" />
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
									<td className="px-3 sm:px-4 py-2.5">
										<span
											className={hasData ? "font-medium" : "text-default-400"}
										>
											{sheet.month}
										</span>
									</td>
									<td className="px-3 sm:px-4 py-2.5 text-right font-semibold tabular-nums">
										{hasData ? (
											<span className="text-primary">
												{fmt(sheet.grandTotal)}
											</span>
										) : (
											<span className="text-default-300 font-normal">—</span>
										)}
									</td>
									<td className="px-3 sm:px-4 py-2.5 hidden sm:table-cell">
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
							<td className="px-3 sm:px-4 py-3 font-bold text-default-700 uppercase text-xs tracking-wide">
								TOTAL
							</td>
							<td className="px-3 sm:px-4 py-3 text-right font-bold text-base sm:text-lg text-primary tabular-nums">
								{fmt(planTotal)}
							</td>
							<td className="hidden sm:table-cell px-4 py-3" />
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
	const yr = new Date().getFullYear();
	const mi = MONTH_NAMES.indexOf(activeMonth);
	const initialDate =
		mi >= 0 ? `${yr}-${String(mi + 1).padStart(2, "0")}-01` : `${yr}-01-01`;
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
		const m = MONTH_NAMES.indexOf(activeMonth);
		const d =
			m >= 0 ? `${yr}-${String(m + 1).padStart(2, "0")}-01` : `${yr}-01-01`;
		setForm((f) => ({ ...f, date: d }));
	}, [activeMonth, isOpen]);
	const set = (key: keyof typeof form) => (v: string) =>
		setForm((f) => ({ ...f, [key]: v }));
	const save = async () => {
		if (!form.activity || !form.estimatedCost) return;
		setSaving(true);
		try {
			await fetch(
				`https://i3p-server-1.onrender.com/api/SchoolImplementation/item`,
				{
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
				},
			);
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
			size="lg"
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
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<Input
							label="Date"
							type="date"
							value={form.date}
							onValueChange={set("date")}
							className="col-span-1 sm:col-span-2"
						/>
						<Select
							label="Expenditure Type"
							className="col-span-1 sm:col-span-2"
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
							className="col-span-1 sm:col-span-2"
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
							label="Purpose"
							value={form.purpose}
							onValueChange={set("purpose")}
							className="col-span-1 sm:col-span-2"
						/>
						<Input
							label="Performance Indicator"
							value={form.indicator}
							onValueChange={set("indicator")}
							className="col-span-1 sm:col-span-2"
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
							className="col-span-1 sm:col-span-2"
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
			// Seed for the first unlinked item as a demo
			await fetch(
				`https://i3p-server-1.onrender.com/api/Ar/seed-fake-links/${items[0].id}`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				},
			);
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
	// Detect mobile breakpoint
	const [isMobile, setIsMobile] = useState(false);

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const {
		isOpen: addItemOpen,
		onOpen: openAddItem,
		onClose: closeAddItem,
	} = useDisclosure();
	const token = useStore($token);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const check = () => {
			const mobile = window.innerWidth < 640;
			setIsMobile(mobile);
			// On mobile switch to minimal columns automatically
			setVisibleCols(mobile ? MOBILE_VISIBLE : DEFAULT_VISIBLE);
		};
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);

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
			const res = await fetch(
				`https://i3p-server-1.onrender.com/api/SchoolImplementation/import`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
					body: formData,
				},
			);
			if (!res.ok) {
				toast.error("Import failed", await res.text());
				return;
			}
			const data = await res.json();
			await fetchPlanHeaders();
			toast.success(
				"Import successful",
				data.message ?? `${data.itemCount} items imported`,
			);
			onClose();
		} catch {
			toast.error("Upload failed", "Could not connect to server.");
		} finally {
			setUploading(false);
		}
	};

	const fetchPlanHeaders = async () => {
		setLoadingHeaders(true);
		try {
			const res = await fetch(
				`https://i3p-server-1.onrender.com/api/SchoolImplementation`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const data: SchoolPlanHeader[] = await res.json();
			setPlanHeaders(data);
			if (data.length > 0 && !selectedPlan) fetchPlanById(data[0].id);
		} finally {
			setLoadingHeaders(false);
		}
	};

	const fetchPlanById = async (planId: string) => {
		setLoadingItems(true);
		try {
			const res = await fetch(
				`https://i3p-server-1.onrender.com/api/SchoolImplementation/${planId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
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

	// Items in the active month that have no AR code yet (for dev seeding)
	const unlinkedItems = (activeSheet?.items ?? []).filter(
		(i) => !i.arCode && i.id != null,
	);
	if (loadingHeaders)
		return <div className="p-4 sm:p-8 text-default-500">Loading plans...</div>;

	return (
		<div className="flex flex-col gap-4 sm:gap-6">
			{/* ── Plan selector + Import (always visible) ── */}
			<div className="flex items-center gap-2 flex-wrap">
				<Select
					label="Plan Year"
					className="flex-1 min-w-0 max-w-xs"
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

			{/* ── Validation error ── */}
			{validationError && (
				<div className="flex items-start gap-3 px-3 sm:px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl text-sm">
					<span className="text-danger-600 shrink-0">⚠</span>
					<div className="flex flex-col gap-1 flex-1 min-w-0">
						<span className="font-semibold text-danger-700">
							Invalid File Format
						</span>
						<span className="text-danger-600 text-xs break-words">
							{validationError}
						</span>
					</div>
					<button
						onClick={() => setValidationError(null)}
						className="text-danger-400 hover:text-danger-600 shrink-0"
					>
						×
					</button>
				</div>
			)}

			{/* ── Preview Modal ── */}
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="full"
				scrollBehavior="normal"
				classNames={{ wrapper: "overflow-hidden" }}
			>
				<ModalContent className="flex flex-col h-[100dvh] overflow-hidden">
					<ModalHeader className="flex flex-col gap-1 shrink-0 px-4 sm:px-6">
						<span>Preview Import Data</span>
						<span className="text-xs sm:text-sm font-normal text-default-500">
							Review before confirming.
						</span>
					</ModalHeader>
					<ModalBody className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-6 py-3">
						{previewSheets.length > 0 ? (
							previewSheet ? (
								<div className="flex flex-col gap-3">
									<GrandTotalCard sheet={previewSheet} />
									<MonthTable
										sheet={previewSheet}
										visibleCols={visibleCols}
										isMobile={isMobile}
									/>
								</div>
							) : (
								<div className="text-center text-default-400 p-10">
									Select a month below.
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
					<ModalFooter className="shrink-0 px-4 sm:px-6">
						<Button color="danger" variant="flat" size="sm" onPress={onClose}>
							Cancel
						</Button>
						<Button
							color="primary"
							size="sm"
							isLoading={uploading}
							onPress={confirmUpload}
						>
							Confirm & Import
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* ── Main Content ── */}
			{loadingItems ? (
				<div className="flex justify-center p-10">
					<Spinner
						classNames={{ label: "text-foreground mt-4" }}
						variant="wave"
					/>
				</div>
			) : selectedPlan ? (
				<div className="flex flex-col gap-3 sm:gap-4">
					<div>
						<h2 className="text-lg sm:text-2xl font-bold leading-tight">
							School Implementation Plan — {selectedPlan.year}
						</h2>
						<p className="text-xs sm:text-sm text-default-500 mt-0.5">
							{selectedPlan.school}
						</p>
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
							{/* Grand Total Card — budget summary only, no toolbar */}
							{activeSheet && (
								<GrandTotalCard
									sheet={activeSheet}
									annualBudget={selectedPlan.annualBudget}
								/>
							)}
							{/* ── Dev seed banner ── */}
							{/* 2. Responsive Seed Banner (Mobile-Optimized) */}
							{unlinkedItems.length > 0 && (
								<SeedFakeBanner
									planId={selectedPlan.id}
									items={unlinkedItems}
									token={token}
									onDone={() => fetchPlanById(selectedPlan.id)}
								/>
							)}
							{/* ── Secondary toolbar — Columns, Templates, Add Item — separate from budget card ── */}
							{activeSheet && (
								<div className="flex items-center gap-2 flex-wrap border border-default-200 rounded-xl px-4 py-2.5 bg-default-50/50">
									<ColumnChooser
										visibleCols={visibleCols}
										onChange={setVisibleCols}
									/>
									<TemplateDownloadDropdown />
									<div className="flex-1" />
									<Button color="success" size="sm" onPress={openAddItem}>
										+ Add Item
									</Button>
								</div>
							)}

							{activeSheet ? (
								<MonthTable
									sheet={activeSheet}
									visibleCols={visibleCols}
									isMobile={isMobile}
								/>
							) : (
								<div className="text-center text-default-400 p-10">
									Select a month above.
								</div>
							)}
						</>
					)}
				</div>
			) : (
				<div className="text-default-500 text-center p-10 text-sm">
					Select a year to view the School Implementation Plan.
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
