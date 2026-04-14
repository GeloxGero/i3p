// components/monthNavigation.tsx
//
// Horizontal pill-button month navigator.
//
// PROPS  (must match SchoolPlanTable.tsx call-site exactly)
// ──────────────────────────────────────────────────────────
//   sheets:        MonthSheetDto[]        — full sheet objects from the API
//   activeMonth:   MonthName | null       — null = "Total" tab active
//   onMonthChange: (m: MonthName | null)  — fired on click / keyboard nav
//
// WHY `sheets` INSTEAD OF `months: string[]`?
// ─────────────────────────────────────────────
// SchoolPlanTable already holds MonthSheetDto[].  Passing the full objects
// lets this component show grand-total badges and item-count chips without
// the parent pre-computing extra derived arrays.

import { useRef, useEffect, useState, useCallback } from "react";
import type { MonthSheetDto } from "../types";
import { formatPeso } from "../utils";
import { MONTH_ORDER, monthIndex, type MonthName } from "../constants";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	sheets: MonthSheetDto[];
	activeMonth: MonthName | null;
	onMonthChange: (month: MonthName | null) => void;
}

// Sentinel string used as the Map key for the "Total" tab.
// Never a real MonthName so it cannot collide with month strings.
const TOTAL_KEY = "__TOTAL__" as const;
type TabKey = MonthName | typeof TOTAL_KEY;

// ─── Component ────────────────────────────────────────────────────────────────

export default function MonthNavigation({
	sheets,
	activeMonth,
	onMonthChange,
}: Props) {
	const scrollRef = useRef<HTMLDivElement>(null);
	// Shared ref map so auto-scroll and keyboard focus both work without
	// leaking DOM knowledge outside this component.
	const buttonRefs = useRef<Map<TabKey, HTMLButtonElement>>(new Map());

	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	// Sort sheets into calendar order so the tab strip always reads Jan → Dec.
	// monthIndex returns -1 for unrecognised strings, sorting them first.
	const orderedSheets = [...sheets].sort(
		(a, b) => monthIndex(a.month) - monthIndex(b.month),
	);

	// Year-wide aggregates for the "Total" tab badge
	const totalGrand = sheets.reduce((s, m) => s + m.grandTotal, 0);
	const totalItemCount = sheets.reduce((s, m) => s + m.items.length, 0);
	const anyHasSip = sheets.some((m) => m.hasSip);

	// Ordered key list: Total first, then months in calendar order.
	// Arrow-key navigation follows this list left-to-right.
	const orderedKeys: TabKey[] = [
		TOTAL_KEY,
		...orderedSheets.map((s) => s.month as MonthName),
	];

	// ── Auto-scroll active tab into view ─────────────────────────────────────
	// Pure DOM effect — kept here, not in the parent, because the parent has
	// no knowledge of which button element corresponds to which tab key.
	useEffect(() => {
		const key: TabKey = activeMonth ?? TOTAL_KEY;
		const btn = buttonRefs.current.get(key);
		if (!btn || !scrollRef.current) return;
		btn.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "nearest",
		});
	}, [activeMonth]);

	// ── Scroll-shadow tracking ────────────────────────────────────────────────
	const updateScroll = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 4);
		setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
	}, []);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		updateScroll();
		el.addEventListener("scroll", updateScroll, { passive: true });
		window.addEventListener("resize", updateScroll, { passive: true });
		return () => {
			el.removeEventListener("scroll", updateScroll);
			window.removeEventListener("resize", updateScroll);
		};
	}, [updateScroll]);

	// ── Keyboard navigation (ARIA tab-list) ───────────────────────────────────
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			const currentKey: TabKey = activeMonth ?? TOTAL_KEY;
			const idx = orderedKeys.indexOf(currentKey);

			let next: TabKey | null = null;
			if (e.key === "ArrowRight")
				next = orderedKeys[Math.min(idx + 1, orderedKeys.length - 1)] ?? null;
			if (e.key === "ArrowLeft")
				next = orderedKeys[Math.max(idx - 1, 0)] ?? null;
			if (e.key === "Home") next = TOTAL_KEY;
			if (e.key === "End") next = orderedKeys[orderedKeys.length - 1] ?? null;

			if (!next) return;
			e.preventDefault();
			onMonthChange(next === TOTAL_KEY ? null : (next as MonthName));
			buttonRefs.current.get(next)?.focus();
		},
		[activeMonth, orderedKeys, onMonthChange],
	);

	if (sheets.length === 0) return null;

	return (
		<div className="relative">
			{canScrollLeft && (
				<div
					aria-hidden
					className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10"
					style={{
						background:
							"linear-gradient(to right, var(--heroui-background,#fff) 20%, transparent)",
					}}
				/>
			)}
			{canScrollRight && (
				<div
					aria-hidden
					className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10"
					style={{
						background:
							"linear-gradient(to left, var(--heroui-background,#fff) 20%, transparent)",
					}}
				/>
			)}

			<div
				ref={scrollRef}
				role="tablist"
				aria-label="Month navigation"
				onKeyDown={handleKeyDown}
				className="flex gap-1.5 overflow-x-auto py-1"
				style={
					{
						scrollbarWidth: "none",
						msOverflowStyle: "none",
					} as React.CSSProperties
				}
			>
				{/* Total tab */}
				<MonthTab
					tabKey={TOTAL_KEY}
					label="Total"
					total={totalGrand}
					itemCount={totalItemCount}
					hasSip={anyHasSip}
					isActive={activeMonth === null}
					isSummary
					onClick={() => onMonthChange(null)}
					buttonRefs={buttonRefs}
				/>

				<div
					className="w-px bg-default-200 self-stretch shrink-0 mx-0.5"
					aria-hidden
				/>

				{orderedSheets.map((sheet) => (
					<MonthTab
						key={sheet.month}
						tabKey={sheet.month as MonthName}
						label={sheet.month}
						total={sheet.grandTotal}
						itemCount={sheet.items.length}
						hasSip={sheet.hasSip}
						isActive={activeMonth === sheet.month}
						onClick={() => onMonthChange(sheet.month as MonthName)}
						buttonRefs={buttonRefs}
					/>
				))}
			</div>
		</div>
	);
}

// ─── MonthTab ─────────────────────────────────────────────────────────────────
// Internal sub-component — not exported. Registers itself in the shared
// buttonRefs map via a callback ref so auto-scroll and keyboard focus work.

interface MonthTabProps {
	tabKey: TabKey;
	label: string;
	total: number;
	itemCount: number;
	hasSip: boolean;
	isActive: boolean;
	isSummary?: boolean;
	onClick: () => void;
	buttonRefs: React.MutableRefObject<Map<TabKey, HTMLButtonElement>>;
}

function MonthTab({
	tabKey,
	label,
	total,
	itemCount,
	hasSip,
	isActive,
	isSummary = false,
	onClick,
	buttonRefs,
}: MonthTabProps) {
	const setRef = (el: HTMLButtonElement | null) => {
		if (el) buttonRefs.current.set(tabKey, el);
		else buttonRefs.current.delete(tabKey);
	};

	const activeStyle = isSummary
		? "bg-default-700 text-white shadow-sm"
		: "bg-primary text-white shadow-sm";
	const inactiveStyle = "bg-default-100 text-default-600 hover:bg-default-200";

	return (
		<button
			ref={setRef}
			role="tab"
			aria-selected={isActive}
			onClick={onClick}
			className={[
				"relative flex flex-col items-start gap-0.5",
				"px-3 pt-2 pb-2.5 rounded-xl text-left shrink-0",
				"transition-all duration-150",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
				isActive ? activeStyle : inactiveStyle,
			].join(" ")}
		>
			{hasSip && (
				<span
					aria-label="Contains SIP items"
					className={[
						"absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full",
						isActive ? "bg-white/60" : "bg-green-400",
					].join(" ")}
				/>
			)}

			<span className="text-sm font-semibold leading-none">
				<span className="hidden sm:inline">{label}</span>
				<span className="sm:hidden">{label.slice(0, 3)}</span>
			</span>

			<span
				className={[
					"text-xs leading-none font-mono tabular-nums",
					isActive ? "text-white/80" : "text-default-400",
				].join(" ")}
			>
				{formatPeso(total)}
			</span>

			<span
				className={[
					"text-[10px] leading-none px-1.5 py-0.5 rounded-full",
					isActive
						? "bg-white/20 text-white"
						: "bg-default-200 text-default-500",
				].join(" ")}
			>
				{itemCount} {itemCount === 1 ? "item" : "items"}
			</span>
		</button>
	);
}
