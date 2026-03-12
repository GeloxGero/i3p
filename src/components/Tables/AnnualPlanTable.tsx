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
	{ uid: "no", label: "No.", className: "w-14" },
	{ uid: "unspsc", label: "UNSPSC", className: "w-32" },
	{ uid: "itemDescription", label: "Item Description" },
	{ uid: "specification", label: "Specification" },
	{ uid: "unitOfMeasure", label: "Unit", className: "w-20" },
	{ uid: "totalQuantity", label: "Qty", className: "text-right w-16" },
	{ uid: "price", label: "Unit Price (₱)", className: "text-right w-36" },
	{
		uid: "totalAmount",
		label: "Total Amount (₱)",
		className: "text-right w-36",
	},
];

const DEFAULT_VISIBLE = new Set([
	"no",
	"itemDescription",
	"specification",
	"unitOfMeasure",
	"totalQuantity",
	"price",
	"totalAmount",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePreviewFromWorkbook(workbook: XLSX.WorkBook): AppItem[] {
	const sheetName = workbook.SheetNames[0];
	const worksheet = workbook.Sheets[sheetName];
	const json: any[] = XLSX.utils.sheet_to_json(worksheet);

	const cleaned = json
		.filter(
			(item: any) =>
				Object.hasOwn(item, "__EMPTY_2") &&
				Object.hasOwn(item, "__EMPTY_28") &&
				Object.hasOwn(item, "__EMPTY_7") &&
				Object.hasOwn(item, "__EMPTY_29") &&
				Object.hasOwn(item, "__EMPTY_30"),
		)
		.slice(1);

	return cleaned.map((row: any) => ({
		no: row["APP-CSE 2025 FORM - Other Items"] ?? "",
		itemDescription: row["__EMPTY_2"] ?? "",
		specification: row["__EMPTY_5"] ?? "",
		unitOfMeasure: row["__EMPTY_7"] ?? "",
		totalQuantity: row["__EMPTY_28"] ?? 0,
		price: row["__EMPTY_29"] ?? 0,
		totalAmount: row["__EMPTY_30"] ?? 0,
	}));
}

function fmtPeso(value: number | null | undefined) {
	if (!value && value !== 0) return "—";
	return `₱${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
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

// ─── Grand Total Card ─────────────────────────────────────────────────────────

function GrandTotalCard({
	yearTotal,
	year,
	itemCount,
}: {
	yearTotal: number;
	year: number;
	itemCount: number;
}) {
	return (
		<div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-6 py-3">
			<div className="flex flex-col">
				<span className="text-xs text-default-500 uppercase tracking-wide">
					Annual Procurement Total — {year}
				</span>
				<span className="text-2xl font-bold text-primary">
					{fmtPeso(yearTotal)}
				</span>
			</div>
			<div className="flex gap-4 text-sm text-default-500 items-center">
				<Chip size="sm" variant="flat" color="primary">
					{itemCount} line items
				</Chip>
			</div>
		</div>
	);
}

// ─── Item Table ───────────────────────────────────────────────────────────────

function ItemTable({
	items,
	visibleCols,
}: {
	items: AppItem[];
	visibleCols: Set<string>;
}) {
	const activeCols = ALL_COLUMNS.filter((c) => visibleCols.has(c.uid));

	function renderCell(item: AppItem, uid: string) {
		switch (uid) {
			case "no":
				return (
					<span className="text-xs font-mono text-default-400">{item.no}</span>
				);
			case "unspsc":
				return <span className="text-xs font-mono">{item.unspsc ?? "—"}</span>;
			case "itemDescription":
				return <span className="font-medium">{item.itemDescription}</span>;
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

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [previewItems, setPreviewItems] = useState<AppItem[]>([]);
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
			const parsed = parsePreviewFromWorkbook(workbook);
			setPreviewItems(parsed);
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
			await fetch("http://localhost:5109/api/AnnualProcurementPlan/import", {
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
			const res = await fetch(
				"http://localhost:5109/api/AnnualProcurementPlan",
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const data = await res.json();
			setPlanHeaders(data);
		} finally {
			setLoadingHeaders(false);
		}
	};

	// ── Fetch full plan ────────────────────────────────────────────────────────
	const fetchPlanById = async (planId: string) => {
		setLoadingItems(true);
		try {
			const res = await fetch(
				`http://localhost:5109/api/AnnualProcurementPlan/${planId}`,
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

	// Preview grand total (summed client-side from parsed rows)
	const previewTotal = previewItems.reduce(
		(sum, i) => sum + (Number(i.totalAmount) || 0),
		0,
	);

	if (loadingHeaders)
		return <div className="p-8 text-default-500">Loading plans...</div>;

	return (
		<div className="flex flex-col gap-8">
			{/* ── Toolbar ── */}
			<div className="flex justify-between items-center">
				<Select
					label="Select Annual Procurement Plan Year"
					className="max-w-xs"
					onSelectionChange={handleSelectionChange}
				>
					{planHeaders.map((p) => (
						<SelectItem key={p.id}>
							{p.year} — {p.fileName}
						</SelectItem>
					))}
				</Select>

				<div className="flex gap-2 items-center">
					<ColumnChooser visibleCols={visibleCols} onChange={setVisibleCols} />

					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						accept=".xlsx, .xls, .csv"
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
							Review all items before confirming the import.
						</span>
					</ModalHeader>

					<ModalBody className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
						{previewItems.length > 0 ? (
							<div className="flex flex-col gap-4">
								{/* Grand total card in preview */}
								<div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-6 py-3">
									<div className="flex flex-col">
										<span className="text-xs text-default-500 uppercase tracking-wide">
											Preview Total
										</span>
										<span className="text-2xl font-bold text-primary">
											{fmtPeso(previewTotal)}
										</span>
									</div>
									<Chip size="sm" variant="flat" color="primary">
										{previewItems.length} line items
									</Chip>
								</div>
								<ItemTable items={previewItems} visibleCols={visibleCols} />
							</div>
						) : (
							<div className="text-center text-default-400 p-10">
								No recognisable items found in the file.
							</div>
						)}
					</ModalBody>

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
							Annual Procurement Plan — {selectedPlan.year}
						</h2>
						<p className="text-default-500 text-sm">{selectedPlan.fileName}</p>
					</div>

					{/* Grand total card above the table */}
					<GrandTotalCard
						yearTotal={selectedPlan.yearTotal}
						year={selectedPlan.year}
						itemCount={selectedPlan.items?.length ?? 0}
					/>

					{/* Item table */}
					<ItemTable
						items={selectedPlan.items ?? []}
						visibleCols={visibleCols}
					/>
				</div>
			) : (
				<div className="text-gray-500 text-center p-10">
					Select a year from the dropdown to view the Annual Procurement Plan.
				</div>
			)}
		</div>
	);
}
