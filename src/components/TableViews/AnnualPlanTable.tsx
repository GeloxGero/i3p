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
} from "@heroui/react";
import { useEffect, useState, useRef } from "react";
import { $token } from "../../store/authStore";
import { useStore } from "@nanostores/react";
import * as XLSX from "xlsx";
import { toast } from "../Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppItem {
	id?: number;
	no: string;
	unspsc?: string;
	itemDescription: string;
	specification: string;
	unitOfMeasure: string;
	totalQuantity: number | string;
	price: number;
	totalAmount: number;
}

interface AnnualPlan {
	id: number;
	year: number;
	fileName: string;
	yearTotal: number;
	items: AppItem[];
}

interface AnnualPlanHeader {
	id: number;
	year: number;
	fileName: string;
	yearTotal: number;
}

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColDef {
	uid: string;
	label: string;
	className?: string;
}

const ALL_COLUMNS: ColDef[] = [
	{ uid: "no", label: "No.", className: "w-12" },
	{ uid: "unspsc", label: "UNSPSC", className: "w-28" },
	{ uid: "itemDescription", label: "Item Description" },
	{ uid: "specification", label: "Specification" },
	{ uid: "unitOfMeasure", label: "Unit", className: "w-16" },
	{ uid: "totalQuantity", label: "Qty", className: "text-right w-14" },
	{ uid: "price", label: "Unit Price (₱)", className: "text-right w-32" },
	{
		uid: "totalAmount",
		label: "Total Amount (₱)",
		className: "text-right w-32",
	},
];

const MOBILE_VISIBLE = new Set([
	"itemDescription",
	"totalQuantity",
	"totalAmount",
]);
const DEFAULT_VISIBLE = new Set([
	"no",
	"itemDescription",
	"specification",
	"unitOfMeasure",
	"totalQuantity",
	"price",
	"totalAmount",
]);

const API = "http://localhost:5109";

function fmtPeso(value: number | null | undefined) {
	if (value == null) return "—";
	return `₱${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

// ─── Template validator ───────────────────────────────────────────────────────
// Template: Row 1=title, Row 2=headers (A=UNSPSC, B=ItemDesc, C=Spec, D=UOM, E=Qty, F=Price, G=Total), Row 3=instruction, Row 5+=data

function parseAppTemplate(workbook: XLSX.WorkBook): AppItem[] | string {
	const ws = workbook.Sheets[workbook.SheetNames[0]];
	const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
		header: 1,
		defval: "",
	});

	// Validate header row 2 (index 1)
	const headerRow = rows[1] ?? [];
	const h1 = String(headerRow[0] ?? "").toLowerCase();
	const h2 = String(headerRow[1] ?? "").toLowerCase();
	if (!h1.includes("unspsc") || !h2.includes("item description"))
		return "The file does not match the official APP template. Expected UNSPSC in column A and Item Description in column B of row 2.";

	// Data starts at row 5 (index 4)
	const items: AppItem[] = [];
	for (let ri = 4; ri < rows.length; ri++) {
		const row = rows[ri];
		const desc = String(row[1] ?? "").trim();
		const unspsc = String(row[0] ?? "").trim();
		if (!desc && !unspsc) continue;
		if (
			desc.toLowerCase().includes("total") ||
			unspsc.toLowerCase().includes("total")
		)
			break;
		const qty = parseFloat(String(row[4] ?? "").replace(/[₱,\s]/g, "")) || 0;
		const price = parseFloat(String(row[5] ?? "").replace(/[₱,\s]/g, "")) || 0;
		const amt =
			parseFloat(String(row[6] ?? "").replace(/[₱,\s]/g, "")) || qty * price;
		items.push({
			no: String(ri - 3),
			unspsc: unspsc || undefined,
			itemDescription: desc,
			specification: String(row[2] ?? "").trim(),
			unitOfMeasure: String(row[3] ?? "").trim(),
			totalQuantity: qty,
			price,
			totalAmount: amt,
		});
	}
	return items;
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

// ─── Grand Total Card ─────────────────────────────────────────────────────────

function GrandTotalCard({
	yearTotal,
	year,
	itemCount,
	toolbarButtons,
}: {
	yearTotal: number;
	year: number;
	itemCount: number;
	toolbarButtons?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 sm:px-6 py-4">
			<div className="flex items-start justify-between gap-3 flex-wrap">
				<div className="flex flex-col">
					<span className="text-xs text-default-500 uppercase tracking-wide">
						Annual Procurement Total — {year}
					</span>
					<span className="text-xl sm:text-2xl font-bold text-primary">
						{fmtPeso(yearTotal)}
					</span>
				</div>
				<Chip size="sm" variant="flat" color="primary">
					{itemCount} line items
				</Chip>
			</div>
			{toolbarButtons && (
				<div className="flex items-center gap-2 pt-1 border-t border-primary/15 flex-wrap">
					{toolbarButtons}
				</div>
			)}
		</div>
	);
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────

function MobileItemCard({ item }: { item: AppItem }) {
	return (
		<div className="border border-default-200 rounded-xl p-3 flex flex-col gap-2 bg-background">
			<p className="text-sm font-medium leading-snug">{item.itemDescription}</p>
			{item.specification && (
				<p className="text-xs text-default-400">{item.specification}</p>
			)}
			<div className="flex items-center justify-between">
				<span className="text-xs text-default-500">
					{item.unitOfMeasure} × {item.totalQuantity}
				</span>
				<span className="text-sm font-semibold text-primary">
					{fmtPeso(item.totalAmount)}
				</span>
			</div>
		</div>
	);
}

// ─── Item Table ───────────────────────────────────────────────────────────────

function ItemTable({
	items,
	visibleCols,
	isMobile,
}: {
	items: AppItem[];
	visibleCols: Set<string>;
	isMobile: boolean;
}) {
	const activeCols = ALL_COLUMNS.filter((c) => visibleCols.has(c.uid));

	if (isMobile) {
		return (
			<div className="flex flex-col gap-2">
				{items.map((item, i) => (
					<MobileItemCard key={i} item={item} />
				))}
			</div>
		);
	}

	function renderCell(item: AppItem, uid: string) {
		switch (uid) {
			case "no":
				return (
					<span className="text-xs font-mono text-default-400">{item.no}</span>
				);
			case "unspsc":
				return <span className="text-xs font-mono">{item.unspsc ?? "—"}</span>;
			case "itemDescription":
				return (
					<span className="font-medium text-sm leading-snug">
						{item.itemDescription}
					</span>
				);
			case "specification":
				return (
					<span className="text-xs text-default-500 leading-tight">
						{item.specification}
					</span>
				);
			case "unitOfMeasure":
				return <span className="text-xs">{item.unitOfMeasure}</span>;
			case "totalQuantity":
				return <span className="block text-right">{item.totalQuantity}</span>;
			case "price":
				return (
					<span className="block text-right text-default-600">
						{fmtPeso(item.price)}
					</span>
				);
			case "totalAmount":
				return (
					<span className="block text-right font-semibold text-primary">
						{fmtPeso(item.totalAmount)}
					</span>
				);
			default:
				return null;
		}
	}

	return (
		<div className="overflow-x-auto">
			<Table aria-label="Annual Procurement Plan items" removeWrapper>
				<TableHeader>
					{activeCols.map((col) => (
						<TableColumn key={col.uid} className={col.className ?? ""}>
							{col.label}
						</TableColumn>
					))}
				</TableHeader>
				<TableBody emptyContent="No items found." items={items}>
					{(item) => (
						<TableRow key={item.id ?? item.no}>
							{activeCols.map((col) => (
								<TableCell key={col.uid}>{renderCell(item, col.uid)}</TableCell>
							))}
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnnualPlanTable() {
	const [planHeaders, setPlanHeaders] = useState<AnnualPlanHeader[]>([]);
	const [selectedPlan, setSelectedPlan] = useState<AnnualPlan | null>(null);
	const [loadingHeaders, setLoadingHeaders] = useState(true);
	const [loadingItems, setLoadingItems] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [visibleCols, setVisibleCols] = useState<Set<string>>(DEFAULT_VISIBLE);
	const [isMobile, setIsMobile] = useState(false);
	const [previewItems, setPreviewItems] = useState<AppItem[]>([]);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [fileToUpload, setFileToUpload] = useState<File | null>(null);

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const token = useStore($token);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const check = () => {
			const mobile = window.innerWidth < 640;
			setIsMobile(mobile);
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
			const result = parseAppTemplate(workbook);
			if (typeof result === "string") {
				setValidationError(result);
				e.target.value = "";
				return;
			}
			setValidationError(null);
			setFileToUpload(file);
			setPreviewItems(result);
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
				`https://i3p-server-1.onrender.com/api/AnnualProcurementPlan/import`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
					body: formData,
				},
			);
			if (!res.ok) {
				const msg = await res.text();
				toast.error("Import failed", msg);
				return;
			}
			const data = await res.json();
			await fetchPlanHeaders();
			toast.success(
				"Import successful",
				`${data.itemCount} items imported · ${fmtPeso(Number(data.yearTotal))}`,
			);
			onClose();
		} catch (err) {
			toast.error("Upload failed", "Could not connect to server.");
		} finally {
			setUploading(false);
		}
	};

	const fetchPlanHeaders = async () => {
		setLoadingHeaders(true);
		try {
			const res = await fetch(
				`https://i3p-server-1.onrender.com/api/AnnualProcurementPlan`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const data = await res.json();
			setPlanHeaders(data);
			if (data.length > 0 && !selectedPlan) fetchPlanById(String(data[0].id));
		} finally {
			setLoadingHeaders(false);
		}
	};

	const fetchPlanById = async (planId: string) => {
		setLoadingItems(true);
		try {
			const res = await fetch(
				`https://i3p-server-1.onrender.com/api/AnnualProcurementPlan/${planId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const data: AnnualPlan = await res.json();
			setSelectedPlan(data);
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
	const previewTotal = previewItems.reduce(
		(s, i) => s + (Number(i.totalAmount) || 0),
		0,
	);

	if (loadingHeaders)
		return <div className="p-4 sm:p-8 text-default-500">Loading plans...</div>;

	const toolbarButtons = (
		<>
			{!isMobile && (
				<ColumnChooser visibleCols={visibleCols} onChange={setVisibleCols} />
			)}
		</>
	);

	return (
		<div className="flex flex-col gap-4 sm:gap-6">
			{/* ── Plan selector row ── */}
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
							{p.year} — {p.fileName}
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
				{isMobile && (
					<ColumnChooser visibleCols={visibleCols} onChange={setVisibleCols} />
				)}
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
						{previewItems.length > 0 ? (
							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 sm:px-6 py-3 flex-wrap gap-2">
									<div className="flex flex-col">
										<span className="text-xs text-default-500 uppercase tracking-wide">
											Preview Total
										</span>
										<span className="text-xl sm:text-2xl font-bold text-primary">
											{fmtPeso(previewTotal)}
										</span>
									</div>
									<Chip size="sm" variant="flat" color="primary">
										{previewItems.length} line items
									</Chip>
								</div>
								<ItemTable
									items={previewItems}
									visibleCols={visibleCols}
									isMobile={isMobile}
								/>
							</div>
						) : (
							<div className="text-center text-default-400 p-10">
								No recognisable items found in the file.
							</div>
						)}
					</ModalBody>
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
							Annual Procurement Plan — {selectedPlan.year}
						</h2>
						<p className="text-xs sm:text-sm text-default-500 mt-0.5">
							{selectedPlan.fileName}
						</p>
					</div>
					<GrandTotalCard
						yearTotal={selectedPlan.yearTotal}
						year={selectedPlan.year}
						itemCount={selectedPlan.items?.length ?? 0}
						toolbarButtons={toolbarButtons}
					/>
					<ItemTable
						items={selectedPlan.items ?? []}
						visibleCols={visibleCols}
						isMobile={isMobile}
					/>
				</div>
			) : (
				<div className="text-default-500 text-center p-10 text-sm">
					Select a year to view the Annual Procurement Plan.
				</div>
			)}
		</div>
	);
}
