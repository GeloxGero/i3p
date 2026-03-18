import type { SchoolPlanItem, MonthSheet } from "../types";
import { CATEGORY_LABELS } from "../constants";
import { Chip } from "@heroui/react";
import { fmt } from "../utils";

function MobileItemCard({ item }: { item: SchoolPlanItem }) {
	const isApproved =
		item.status === "Approved" ||
		item.status === (1 as any) ||
		item.status === "1";

	const isPending = item.status === (3 as any);

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
					{isApproved ? "Verified" : "Pending Verification"}
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

export { GrandTotalCard, MobileItemCard };
