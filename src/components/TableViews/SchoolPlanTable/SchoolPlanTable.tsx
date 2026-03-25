// src/components/TableViews/SchoolPlanTable/SchoolPlanTable.tsx
//
// FIXES IN THIS VERSION
// ─────────────────────
// • AddItemModal no longer auto-opens on page load (was caused by
//   `addModalOpen` initialising to `true` in a previous version).
// • All useEffect hooks are here; children are pure render components.
// • Year is a button-group (not dropdown); current year is auto-selected.
// • Month tabs include a "Total" tab that aggregates all months.
// • AR codes in the table are clickable links → /projects/detail?ar=<code>
// • Import flow: parse → check-duplicates → resolve → commit → toast.
// • Skeleton loading during fetch and after import commit.

import { useState, useEffect, useMemo, useCallback } from "react";
import {
	fetchPlans,
	fetchPlanDetail,
	setBudget,
	deleteItem,
	recalculate,
	checkDuplicates,
	resolveDuplicates,
} from "./api";
import type {
	SchoolImplementationHeaderDto,
	SchoolImplementationDetailDto,
	MonthSheetDto,
	DuplicatePairDto,
	DuplicateResolutionDto,
	CandidateItemDto,
	ViewMode,
	ColumnVisibility,
} from "./types";
import {
	MONTH_ORDER,
	DEFAULT_COLUMN_VISIBILITY,
	DEFAULT_ANNUAL_BUDGET,
	isMonthName,
	type MonthName,
} from "./constants";

import MonthNavigation from "./components/monthNavigation";
import TableRenderer from "./components/tableRenderer";
import CardRenderer from "./components/cardRenderer";
import TotalView from "./components/totalView";
import ActionsBar from "./components/actions";
import ImportModal from "./components/importModal";
import DuplicateResolver from "./components/duplicateResolver";
import AddItemModal from "./components/addItemModal";
import SkeletonTable from "./components/skeletonTable";

interface Props {
	onToast?: (message: string, type?: "success" | "error") => void;
}

export default function SchoolPlanTable({ onToast }: Props) {
	// ── Plan list ─────────────────────────────────────────────────────────────
	const [plans, setPlans] = useState<SchoolImplementationHeaderDto[]>([]);
	const [plansLoading, setPlansLoading] = useState(true);

	// ── Selected plan ──────────────────────────────────────────────────────────
	const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
	const [planDetail, setPlanDetail] =
		useState<SchoolImplementationDetailDto | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);

	// ── UI ─────────────────────────────────────────────────────────────────────
	const [activeMonth, setActiveMonth] = useState<MonthName | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>("table");
	const [columns, setColumns] = useState<ColumnVisibility>(
		DEFAULT_COLUMN_VISIBILITY,
	);
	const [showPastYears, setShowPastYears] = useState(false);

	// ── Modals — ALL default to FALSE (fixes auto-open bug) ───────────────────
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [addModalOpen, setAddModalOpen] = useState(false); // ← was true, caused bug

	// ── Duplicate resolution ───────────────────────────────────────────────────
	const [duplicates, setDuplicates] = useState<DuplicatePairDto[]>([]);
	const [nonDuplicates, setNonDuplicates] = useState<CandidateItemDto[]>([]);
	const [pendingYear, setPendingYear] = useState<number | null>(null);
	const [resolverOpen, setResolverOpen] = useState(false);
	const [importing, setImporting] = useState(false);

	// ── EFFECT: load plan list once ────────────────────────────────────────────
	useEffect(() => {
		let cancelled = false;
		setPlansLoading(true);

		fetchPlans()
			.then((data) => {
				if (cancelled) return;
				setPlans(data);
				// Auto-select current year; fall back to most recent
				const currentYear = new Date().getFullYear();
				const match =
					data.find((p) => p.year === currentYear) ?? data[0] ?? null;
				if (match) setSelectedPlanId(match.id);
			})
			.catch(() => onToast?.("Failed to load plans.", "error"))
			.finally(() => {
				if (!cancelled) setPlansLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ── EFFECT: load detail when selected plan changes ─────────────────────────
	useEffect(() => {
		if (selectedPlanId === null) return;
		let cancelled = false;
		setDetailLoading(true);
		setPlanDetail(null);

		fetchPlanDetail(selectedPlanId)
			.then((data) => {
				if (cancelled) return;
				setPlanDetail(data);

				// Auto-select current calendar month if it has data; else first month
				const currentMonthName = MONTH_ORDER[new Date().getMonth()];
				const available = data.months.map((m) => m.month);
				const rawAuto = available.includes(currentMonthName)
					? currentMonthName
					: (available[0] ?? null);
				setActiveMonth(
					rawAuto !== null && isMonthName(rawAuto) ? rawAuto : null,
				);
			})
			.catch(() => onToast?.("Failed to load plan detail.", "error"))
			.finally(() => {
				if (!cancelled) setDetailLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [selectedPlanId]); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Derived: year button list ──────────────────────────────────────────────
	const visibleYears = useMemo(() => {
		const sorted = [...plans].sort((a, b) => b.year - a.year);
		return showPastYears ? sorted : sorted.slice(0, 5);
	}, [plans, showPastYears]);

	// ── Derived: active sheet (null = "Total" tab) ─────────────────────────────
	const activeMonthSheet = useMemo<MonthSheetDto | null>(() => {
		if (!planDetail) return null;

		if (activeMonth !== null) {
			return planDetail.months.find((m) => m.month === activeMonth) ?? null;
		}

		// "Total" tab — synthesise a merged sheet
		if (planDetail.months.length === 0) return null;
		const allItems = planDetail.months.flatMap((m) => m.items);
		const allGrand = planDetail.months.reduce((s, m) => s + m.grandTotal, 0);
		const mergedSub: Record<string, number> = {};
		for (const m of planDetail.months) {
			for (const [cat, v] of Object.entries(m.subTotals)) {
				mergedSub[cat] = (mergedSub[cat] ?? 0) + v;
			}
		}
		return {
			month: "All months",
			hasSip: planDetail.months.some((m) => m.hasSip),
			items: allItems,
			subTotals: mergedSub,
			grandTotal: allGrand,
		};
	}, [planDetail, activeMonth]);

	const effectiveBudget = useMemo(
		() => planDetail?.annualBudget ?? DEFAULT_ANNUAL_BUDGET,
		[planDetail],
	);

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleYearSelect = useCallback((planId: number) => {
		setSelectedPlanId(planId);
	}, []);

	const handleDeleteItem = useCallback(
		async (itemId: number) => {
			if (!selectedPlanId) return;
			await deleteItem(itemId);
			const updated = await fetchPlanDetail(selectedPlanId);
			setPlanDetail(updated);
			onToast?.("Item removed.");
		},
		[selectedPlanId, onToast],
	);

	const handleSetBudget = useCallback(
		async (value: number | null) => {
			if (!selectedPlanId) return;
			await setBudget(selectedPlanId, value);
			const updated = await fetchPlanDetail(selectedPlanId);
			setPlanDetail(updated);
			onToast?.(
				value ? `Budget set to ₱${value.toLocaleString()}.` : "Budget cleared.",
			);
		},
		[selectedPlanId, onToast],
	);

	const handleRecalculate = useCallback(async () => {
		if (!selectedPlanId) return;
		await recalculate(selectedPlanId);
		const updated = await fetchPlanDetail(selectedPlanId);
		setPlanDetail(updated);
		onToast?.("Total recalculated.");
	}, [selectedPlanId, onToast]);

	/** IMPORT STEP 1 — candidates arrive from ImportModal (file parsed client-side) */
	const handleCandidatesReady = useCallback(
		async (year: number, candidates: CandidateItemDto[]) => {
			setImportModalOpen(false);
			setPendingYear(year);

			try {
				const result = await checkDuplicates(year, candidates);

				if (result.hasDuplicates) {
					const dupKeys = new Set(
						result.duplicates.map(
							(d) => `${d.incoming.date}|${d.incoming.activity}`,
						),
					);
					setDuplicates(result.duplicates);
					setNonDuplicates(
						candidates.filter((c) => !dupKeys.has(`${c.date}|${c.activity}`)),
					);
					setResolverOpen(true);
				} else {
					// No duplicates — commit immediately
					await commitImport(year, [], candidates);
				}
			} catch {
				onToast?.("Duplicate check failed.", "error");
			}
		},
		[onToast],
	); // eslint-disable-line react-hooks/exhaustive-deps

	/** IMPORT STEP 2 — user resolved duplicates, commit everything */
	const handleResolutionsSubmit = useCallback(
		async (resolutions: DuplicateResolutionDto[]) => {
			if (pendingYear === null) return;
			setResolverOpen(false);
			await commitImport(pendingYear, resolutions, nonDuplicates);
			setDuplicates([]);
			setNonDuplicates([]);
			setPendingYear(null);
		},
		[pendingYear, nonDuplicates],
	); // eslint-disable-line react-hooks/exhaustive-deps

	const commitImport = async (
		year: number,
		resolutions: DuplicateResolutionDto[],
		clean: CandidateItemDto[],
	) => {
		setImporting(true);
		try {
			const result = await resolveDuplicates({
				year,
				resolutions,
				nonDuplicates: clean,
			});
			const updatedPlans = await fetchPlans();
			setPlans(updatedPlans);
			const match = updatedPlans.find((p) => p.year === year);
			if (match) setSelectedPlanId(match.id);
			onToast?.(
				`Import complete — ${result.directInserted + result.kept} added, ${result.merged} merged, ${result.deleted} skipped.`,
			);
		} catch {
			onToast?.("Import failed.", "error");
		} finally {
			setImporting(false);
		}
	};

	const toggleColumn = useCallback((key: keyof ColumnVisibility) => {
		setColumns((prev) => ({ ...prev, [key]: !prev[key] }));
	}, []);

	// ── Render ────────────────────────────────────────────────────────────────

	if (plansLoading) {
		return (
			<div className="p-4">
				<SkeletonTable rows={8} cols={6} />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{/* ── Year selector ─────────────────────────────────────────────── */}
			<div className="flex flex-wrap items-center gap-2">
				{visibleYears.map((p) => (
					<button
						key={p.id}
						onClick={() => handleYearSelect(p.id)}
						className={[
							"px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all",
							selectedPlanId === p.id
								? "bg-primary text-white border-primary shadow-sm"
								: "border-default-200 text-default-600 hover:border-primary hover:text-primary",
						].join(" ")}
					>
						{p.year}
					</button>
				))}

				{plans.length > 5 && (
					<button
						onClick={() => setShowPastYears((v) => !v)}
						className="px-3 py-1 text-xs text-default-400 hover:text-default-600 underline transition-colors"
					>
						{showPastYears ? "Show less" : `+${plans.length - 5} older years`}
					</button>
				)}
			</div>

			{/* ── Budget / total summary ─────────────────────────────────────── */}
			{planDetail && (
				<TotalView
					totalEstimatedCost={planDetail.totalEstimatedCost}
					annualBudget={planDetail.annualBudget}
					effectiveBudget={effectiveBudget}
					onSetBudget={handleSetBudget}
				/>
			)}

			{/* ── Actions bar ───────────────────────────────────────────────── */}
			<ActionsBar
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				columns={columns}
				onToggleColumn={toggleColumn}
				onImport={() => setImportModalOpen(true)}
				onAddItem={() => setAddModalOpen(true)}
				onRecalculate={handleRecalculate}
			/>

			{/* ── Month navigation ──────────────────────────────────────────── */}
			{planDetail && (
				<MonthNavigation
					sheets={planDetail.months}
					activeMonth={activeMonth}
					onMonthChange={setActiveMonth}
				/>
			)}

			{/* ── Table / Card / Skeleton ───────────────────────────────────── */}
			{detailLoading || importing ? (
				<SkeletonTable rows={10} cols={6} />
			) : activeMonthSheet ? (
				viewMode === "table" ? (
					<TableRenderer
						sheet={activeMonthSheet}
						columns={columns}
						onDeleteItem={handleDeleteItem}
					/>
				) : (
					<CardRenderer
						sheet={activeMonthSheet}
						onDeleteItem={handleDeleteItem}
					/>
				)
			) : (
				<div className="text-center text-default-400 py-20 text-sm">
					No data yet. Import an Excel file or add items manually.
				</div>
			)}

			{/* ── Import modal ──────────────────────────────────────────────── */}
			{importModalOpen && (
				<ImportModal
					currentYear={new Date().getFullYear()}
					onCandidatesReady={handleCandidatesReady}
					onClose={() => setImportModalOpen(false)}
				/>
			)}

			{/* ── Duplicate resolver ────────────────────────────────────────── */}
			{resolverOpen && pendingYear !== null && (
				<DuplicateResolver
					year={pendingYear}
					duplicates={duplicates}
					onSubmit={handleResolutionsSubmit}
					onClose={() => {
						setResolverOpen(false);
						setDuplicates([]);
						setNonDuplicates([]);
						setPendingYear(null);
					}}
				/>
			)}

			{/* ── Add item modal ────────────────────────────────────────────── */}
			{addModalOpen && selectedPlanId !== null && planDetail && (
				<AddItemModal
					planId={selectedPlanId}
					year={planDetail.year}
					activeMonth={activeMonth}
					annualBudget={planDetail.annualBudget}
					currentTotal={planDetail.totalEstimatedCost}
					existingActivities={planDetail.months.flatMap((m) =>
						m.items.map((i) => ({
							month: m.month,
							activity: i.programActivity,
						})),
					)}
					onClose={() => setAddModalOpen(false)}
					onItemAdded={async () => {
						setAddModalOpen(false);
						const updated = await fetchPlanDetail(selectedPlanId);
						setPlanDetail(updated);
						onToast?.("Item added successfully.");
					}}
				/>
			)}
		</div>
	);
}
