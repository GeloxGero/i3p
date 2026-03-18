import {
	Button,
	Select,
	SelectItem,
	Spinner,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from "@heroui/react";
import { useEffect, useState, useRef } from "react";
import { $token } from "../../../store/authStore";
import { useStore } from "@nanostores/react";
import * as XLSX from "xlsx";
import { toast } from "../../Toast";
import type { SchoolPlanHeader, SchoolPlan, MonthSheet } from "./types";
import { DEFAULT_VISIBLE, MOBILE_VISIBLE } from "./constants";
import { validateSipTemplate, parseSchoolPlanWorkbook } from "./utils";
import {
	GrandTotalCard,
	MonthTable,
	MonthFilterBar,
	SeedFakeBanner,
	MonthTabBar,
	TotalView,
	ColumnChooser,
	TemplateDownloadDropdown,
	AddItemModal,
} from "./components";

import { SchoolPlanApi } from "./api";

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
		fetchPlanHeaders();
		const check = () => {
			const mobile = window.innerWidth < 640;
			setIsMobile(mobile);
			// On mobile switch to minimal columns automatically
			setVisibleCols(mobile ? MOBILE_VISIBLE : DEFAULT_VISIBLE);
		};
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, [token]);

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
		try {
			await SchoolPlanApi.importExcel(fileToUpload, token); // 2. Clean call
			await fetchPlanHeaders();
			toast.success("Import successful");
			onClose();
		} catch (err: any) {
			toast.error("Import failed", err.message);
		} finally {
			setUploading(false);
		}
	};

	const fetchPlanHeaders = async () => {
		setLoadingHeaders(true);
		try {
			const data = await SchoolPlanApi.getHeaders(token); // 3. Clean call
			setPlanHeaders(data);
			if (data.length > 0 && !selectedPlan) fetchPlanById(data[0].id);
		} finally {
			setLoadingHeaders(false);
		}
	};

	const fetchPlanById = async (planId: string) => {
		setLoadingItems(true);
		try {
			const data = await SchoolPlanApi.getById(planId, token); // 4. Clean call
			setSelectedPlan(data);
			setActiveMonth(data.months?.[0]?.month ?? "January");
		} finally {
			setLoadingItems(false);
		}
	};

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
										+ Add Line Item
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
