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
	// AR / verification fields populated when reading a saved plan from the API
	arCode?: string | null;
	isVerified?: boolean;
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
}

interface SchoolPlan {
	id: string;
	year: number;
	school: string;
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

// ─── Excel Parser ─────────────────────────────────────────────────────────────

function parseSchoolPlanWorkbook(workbook: XLSX.WorkBook): MonthSheet[] {
	const results: MonthSheet[] = [];

	for (const sheetName of workbook.SheetNames) {
		if (!isMonthSheet(sheetName)) continue;

		const month = normalizeMonthName(sheetName);
		const ws = workbook.Sheets[sheetName];
		const rows: any[][] = XLSX.utils.sheet_to_json(ws, {
			header: 1,
			defval: "",
		});

		const items: SchoolPlanItem[] = [];
		const subTotals: Record<string, number> = {};
		let grandTotal = 0;
		let currentCategory = "Regular Expenditure";
		let hasSip = false;
		let dataStart = 0;
		let hasGap = false;

		for (let i = 0; i < rows.length; i++) {
			const joined = rows[i].join(" ").toLowerCase();
			if (
				joined.includes("key result area") ||
				joined.includes("programs/projects")
			) {
				hasSip = joined.includes("specific program") || joined.includes("sip");
				dataStart = i + 1;
				if (hasSip) {
					const afterPpa = String(rows[i][3] ?? "").trim();
					const twoAfter = String(rows[i][4] ?? "")
						.trim()
						.toLowerCase();
					hasGap = afterPpa === "" && twoAfter.includes("purpose");
				}
				break;
			}
		}

		const gap = hasGap ? 1 : 0;
		const COL = hasSip
			? {
					kra: 0,
					sip: 1,
					ppa: 2,
					purpose: 3 + gap,
					perfInd: 4 + gap,
					resDesc: 5 + gap,
					qty: 6 + gap,
					cost: 7 + gap,
					accTitle: 8 + gap,
					accCode: 9 + gap,
				}
			: {
					kra: 0,
					sip: -1,
					ppa: 1,
					purpose: 2,
					perfInd: 3,
					resDesc: 4,
					qty: 5,
					cost: 6,
					accTitle: 7,
					accCode: 8,
				};

		const categoryKeywords = [
			"Regular Expenditure",
			"Project Related Expenditure",
			"Repair and Maintenance",
			"Others",
		];

		for (let i = dataStart; i < rows.length; i++) {
			const row = rows[i];
			const col0 = String(row[COL.kra] ?? "").trim();
			const col1 = String(row[COL.ppa] ?? "").trim();
			const costRaw = row[COL.cost];

			// Stop at grand-total line
			if (
				col1.toLowerCase().includes("total budget") ||
				col0.toLowerCase().includes("total budget")
			) {
				grandTotal =
					parseFloat(
						String(costRaw ?? row[COL.cost - 1] ?? "0").replace(/[₱,\s]/g, ""),
					) || 0;
				break;
			}

			const matchedCat = categoryKeywords.find(
				(c) =>
					col1.toLowerCase().includes(c.toLowerCase()) ||
					col0.toLowerCase().includes(c.toLowerCase()),
			);
			if (matchedCat) {
				currentCategory = matchedCat;
				continue;
			}

			if (
				col1.toUpperCase().includes("SUB-TOTAL") ||
				col0.toUpperCase().includes("SUB-TOTAL")
			) {
				subTotals[currentCategory] =
					parseFloat(
						String(costRaw ?? row[COL.cost - 1] ?? "0").replace(/[₱,\s]/g, ""),
					) || 0;
				continue;
			}

			if (!col0 && !col1) continue;
			if (col1.toUpperCase() === "NONE" || col0.toUpperCase() === "NONE")
				continue;

			const estimatedCost =
				parseFloat(String(costRaw ?? "").replace(/[₱,\s]/g, "")) || 0;
			if (!col1 && estimatedCost === 0) continue;

			items.push({
				kraArea: col0,
				specificProgram: hasSip
					? String(row[COL.sip] ?? "").trim() || "Unimplemented"
					: "Unimplemented",
				programActivity: col1,
				purpose: String(row[COL.purpose] ?? "").trim(),
				performanceIndicator: String(row[COL.perfInd] ?? "").trim(),
				resourceDescription: String(row[COL.resDesc] ?? "").trim(),
				quantity: row[COL.qty] ?? "",
				estimatedCost,
				accountTitle: String(row[COL.accTitle] ?? "").trim(),
				accountCode: String(row[COL.accCode] ?? "").trim(),
				category: currentCategory,
			});
		}

		results.push({ month, hasSip, items, subTotals, grandTotal });
	}

	results.sort((a, b) => {
		const ai = MONTH_NAMES.indexOf(a.month);
		const bi = MONTH_NAMES.indexOf(b.month);
		return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
	});

	return results;
}

// ─── Column Chooser ───────────────────────────────────────────────────────────

function ColumnChooser({
	visibleCols,
	onChange,
}: {
	visibleCols: Set<string>;
	onChange: (keys: Set<string>) => void;
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
				onSelectionChange={(keys) => onChange(new Set(keys as Set<string>))}
			>
				{ALL_COLUMNS.map((col) => (
					<DropdownItem key={col.uid}>{col.label}</DropdownItem>
				))}
			</DropdownMenu>
		</Dropdown>
	);
}

// ─── Template Download Dropdown ───────────────────────────────────────────────

function TemplateDownloadDropdown() {
	const DownloadIcon = () => (
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
	);

	return (
		<Dropdown>
			<DropdownTrigger>
				<Button variant="flat" size="sm" startContent={<DownloadIcon />}>
					Templates
				</Button>
			</DropdownTrigger>
			<DropdownMenu aria-label="Download Excel templates">
				<DropdownItem
					key="sip"
					description="12 monthly sheets · 4 category sections · auto sub-totals"
					startContent={<span className="text-base">📋</span>}
					onPress={() =>
						triggerDownload(
							`http://localhost:5109/api/Template/SchoolImplementationPlan_Template.xlsx`,
							"SchoolImplementationPlan_Template.xlsx",
						)
					}
				>
					School Implementation Plan
				</DropdownItem>
				<DropdownItem
					key="app"
					description="Single sheet · UNSPSC · auto Total Amount formula"
					startContent={<span className="text-base">📊</span>}
					onPress={() =>
						triggerDownload(
							`http://localhost:5109/api/Template/AnnualProcurementPlan_Template.xlsx`,
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

// ─── AR Code Cell ─────────────────────────────────────────────────────────────

function ArCodeCell({ row }: { row: SchoolPlanItem }) {
	if (!row.arCode) {
		return <span className="text-xs text-default-300 italic">—</span>;
	}
	return (
		<Tooltip
			content={
				row.isVerified
					? "All linked APP items verified ✓"
					: "Pending photo verification — click to review"
			}
		>
			<a
				href={`/ar/${encodeURIComponent(row.arCode)}`}
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

// ─── Grand Total Card ─────────────────────────────────────────────────────────

function GrandTotalCard({ sheet }: { sheet: MonthSheet }) {
	if (sheet.grandTotal <= 0) return null;
	return (
		<div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-6 py-3">
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
			</div>
			<div className="flex gap-4 text-sm text-default-500">
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
			return row.specificProgram === "Unimplemented" ? (
				<span className="text-xs text-default-300 italic">Unimplemented</span>
			) : (
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
											{activeCols.map((col, idx) => {
												const isLast = idx === activeCols.length - 1;
												const isSecond = idx === activeCols.length - 2;
												if (col.uid === "estimatedCost" || isLast) {
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
												}
												if (col.uid === "accountTitle" || isSecond) {
													return (
														<TableCell
															key={col.uid}
															className="text-right font-semibold text-default-500"
														>
															Sub-Total
														</TableCell>
													);
												}
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

// ─── Month Filter Bar (preview modal sticky bottom) ───────────────────────────

function MonthFilterBar({
	sheets,
	activeMonth,
	onSelect,
}: {
	sheets: MonthSheet[];
	activeMonth: string;
	onSelect: (month: string) => void;
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
							{sheet.hasSip && (
								<span
									className={[
										"text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
										isActive
											? "bg-white/20 text-white"
											: "bg-success/10 text-success-600",
									].join(" ")}
								>
									SiP
								</span>
							)}
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

// ─── Month Tab Bar (main view top) ────────────────────────────────────────────

function MonthTabBar({
	sheets,
	activeMonth,
	onSelect,
}: {
	sheets: MonthSheet[];
	activeMonth: string;
	onSelect: (month: string) => void;
}) {
	return (
		<div className="flex flex-wrap gap-2 pb-2 border-b border-default-200">
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
						{sheet.hasSip && (
							<span
								className={[
									"text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
									isActive
										? "bg-white/20 text-white"
										: "bg-success/10 text-success-600",
								].join(" ")}
							>
								SiP
							</span>
						)}
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

// ─── Dev: Seed Fake APP Items banner ─────────────────────────────────────────

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

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [previewSheets, setPreviewSheets] = useState<MonthSheet[]>([]);
	const [previewActiveMonth, setPreviewActiveMonth] =
		useState<string>("January");
	const [fileToUpload, setFileToUpload] = useState<File | null>(null);

	const token = useStore($token);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// ── File → parse → preview modal ──────────────────────────────────────────
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setFileToUpload(file);
		const reader = new FileReader();
		reader.onload = (evt) => {
			const workbook = XLSX.read(evt.target?.result, { type: "binary" });
			const parsed = parseSchoolPlanWorkbook(workbook);
			setPreviewSheets(parsed);
			setPreviewActiveMonth(parsed[0]?.month ?? "January");
			onOpen();
		};
		reader.readAsBinaryString(file);
		e.target.value = "";
	};

	// ── Confirm upload ─────────────────────────────────────────────────────────
	const confirmUpload = async () => {
		if (!fileToUpload) return;
		setUploading(true);
		const formData = new FormData();
		formData.append("file", fileToUpload);
		try {
			await fetch(`${API}/api/SchoolImplementation/import`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});
			await fetchPlanHeaders();
			alert("Uploaded successfully!");
			onClose();
		} catch {
			alert("Upload failed.");
		} finally {
			setUploading(false);
		}
	};

	// ── Fetch plan list ────────────────────────────────────────────────────────
	const fetchPlanHeaders = async () => {
		setLoadingHeaders(true);
		try {
			const res = await fetch(`${API}/api/SchoolImplementation`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setPlanHeaders(await res.json());
		} finally {
			setLoadingHeaders(false);
		}
	};

	// ── Fetch full plan ────────────────────────────────────────────────────────
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

	// Items in the active month that have no AR code yet (for dev seeding)
	const unlinkedItems = (activeSheet?.items ?? []).filter(
		(i) => !i.arCode && i.id != null,
	);

	if (loadingHeaders)
		return <div className="p-8 text-default-500">Loading plans...</div>;

	return (
		<div className="flex flex-col gap-6">
			{/* ── Toolbar ── */}
			<div className="flex justify-between items-center flex-wrap gap-3">
				<Select
					label="Select School Implementation Plan Year"
					className="max-w-xs"
					onSelectionChange={handleSelectionChange}
				>
					{planHeaders.map((p) => (
						<SelectItem key={p.id}>
							{p.year} — {p.school}
						</SelectItem>
					))}
				</Select>

				<div className="flex gap-2 items-center flex-wrap">
					<ColumnChooser visibleCols={visibleCols} onChange={setVisibleCols} />
					<TemplateDownloadDropdown />
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						accept=".xlsx, .xls"
						className="hidden"
					/>
					<Button
						color="primary"
						onPress={() => fileInputRef.current?.click()}
						isLoading={uploading}
					>
						{uploading ? "Importing..." : "Import Excel"}
					</Button>
				</div>
			</div>

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
							Review all sheets before confirming. Navigate months using the bar
							below.
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
								No recognisable month sheets found. Make sure the file contains
								sheets named "January", "February", etc. (any case).
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

					{activeSheet && <GrandTotalCard sheet={activeSheet} />}

					{activeSheet ? (
						<MonthTable sheet={activeSheet} visibleCols={visibleCols} />
					) : (
						<div className="text-center text-default-400 p-10">
							Select a month above.
						</div>
					)}
				</div>
			) : (
				<div className="text-gray-500 text-center p-10">
					Select a year from the dropdown to view the School Implementation
					Plan.
				</div>
			)}
		</div>
	);
}
