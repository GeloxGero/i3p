// src/components/ArDetailPage.tsx
//
// Detail page for a single ImplementationItem identified by its AR code.
// Reached by clicking an AR code link in the table: /projects/detail?ar=AR-2024-XXXXXX
//
// SECTIONS
// ────────
// 1. Header  — AR code, status badge, back link
// 2. Item details card — all fields from the ImplementationItem
// 3. Cross-references list (PlanCrossReference rows linked to this item)
// 4. List items seeded to this AR code
// 5. DEV TOOLS — seed button (adds a list item to this AR code)
//
// SEED BUTTON BEHAVIOUR
// ─────────────────────
// Every click calls POST /api/Ar/{arCode}/seed which adds one random list item
// whose cost is within the remaining budget (estimatedCost − sum of existing items).
// If adding another item would exceed the budget the backend returns 400 and the
// frontend shows a warning banner (non-blocking — the button is just disabled).

import { useState, useEffect, useCallback } from "react";
import { formatPeso } from "./TableViews/SchoolPlanTable/utils";
import {devFuncSeedArItem} from "../devUtils/ArDetailDevUtils.ts";
import {Def, Section, StatusBadge, ErrorState} from "./ArDetails/ArRenders.tsx"
import type {ArDetailResponse} from "./ArDetails/ArTypes.ts"

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
	arCode: string;
}

export default function ArDetailPage({ arCode }: Props) {
	const [detail, setDetail] = useState<ArDetailResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [seedError, setSeedError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// ── Fetch detail ─────────────────────────────────────────────────────────
	const loadDetail = useCallback(async () => {
		if (!arCode) return;
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/Ar/${encodeURIComponent(arCode)}`);
			if (!res.ok)
				throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
			setDetail(await res.json());
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load AR detail.");
		} finally {
			setLoading(false);
		}
	}, [arCode]);

	useEffect(() => {
		loadDetail();
	}, [loadDetail]);


	// ── Render ────────────────────────────────────────────────────────────────

	if (!arCode) {
		return <ErrorState message="No AR code provided in the URL." />;
	}

	if (loading) {
		return (
			<div className="p-6 flex flex-col gap-4 animate-pulse">
				{[80, 200, 120].map((h, i) => (
					<div
						key={i}
						className="rounded-xl bg-default-100"
						style={{ height: h }}
					/>
				))}
			</div>
		);
	}

	if (error || !detail) {
		return <ErrorState message={error ?? "Item not found."} />;
	}

	const { item, listItems, totalListCost, remainingBudget } = detail;
	const budgetPct =
		item.estimatedCost > 0
			? Math.min((totalListCost / item.estimatedCost) * 100, 100)
			: 0;
	const overBudget = remainingBudget <= 0;

	return (
		<div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
			{/* ── Back link ────────────────────────────────────────────────── */}
			<a
				href="/projects"
				className="text-sm text-default-400 hover:text-primary transition-colors flex items-center gap-1"
			>
				← Back to Projects
			</a>

			{/* ── Header ───────────────────────────────────────────────────── */}
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<p className="text-xs text-default-400 font-mono mb-1">
						{item.arCode}
					</p>
					<h1 className="text-xl font-bold text-default-900">
						{item.activity || "Unnamed Activity"}
					</h1>
					<p className="text-sm text-default-500 mt-1">{item.kra}</p>
				</div>
				<StatusBadge status={item.status} verified={item.isVerified} />
			</div>

			{/* ── Implementation item details ───────────────────────────────── */}
			<Section title="Implementation Item Details">
				<dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
					<Def label="SIP Program" value={item.sipProgram} />
					<Def label="Category" value={item.expenditureType} />
					<Def label="Date" value={item.date} />
					<Def
						label="Estimated Cost"
						value={formatPeso(item.estimatedCost)}
						mono
					/>
					<Def label="Quantity" value={item.quantity} />
					<Def label="Account Title" value={item.accountTitle} />
					<Def label="Account Code" value={item.accountCode} mono />
					<Def label="Purpose" value={item.purpose} wide />
					<Def label="Indicator" value={item.indicator} wide />
					<Def label="Resources" value={item.resources} wide />
				</dl>
			</Section>

			{/* ── Budget utilisation ────────────────────────────────────────── */}
			<Section title="Budget">
				<div className="flex justify-between text-sm mb-2">
					<span className="text-default-500">
						List items total:{" "}
						<span className="font-semibold text-default-800">
							{formatPeso(totalListCost)}
						</span>
					</span>
					<span
						className={
							overBudget ? "text-red-500 font-semibold" : "text-default-500"
						}
					>
						Remaining: {formatPeso(remainingBudget)}
					</span>
				</div>
				<div className="h-2.5 rounded-full bg-default-100 overflow-hidden">
					<div
						className={`h-full rounded-full transition-all duration-500 ${overBudget ? "bg-red-400" : budgetPct >= 75 ? "bg-yellow-400" : "bg-green-400"}`}
						style={{ width: `${budgetPct}%` }}
					/>
				</div>
				<p className="text-xs text-default-400 mt-1">
					{budgetPct.toFixed(1)}% of {formatPeso(item.estimatedCost)} budget
					used
				</p>
			</Section>

			{/* ── List items ────────────────────────────────────────────────── */}
			<Section title={`List Items (${listItems.length})`}>
				{listItems.length === 0 ? (
					<p className="text-sm text-default-400 italic">No list items yet.</p>
				) : (
					<div className="overflow-x-auto rounded-lg border border-default-200">
						<table className="w-full text-sm">
							<thead>
								<tr className="bg-default-50 border-b border-default-200 text-xs font-semibold text-default-500 uppercase tracking-wide">
									<th className="px-3 py-2 text-left">Description</th>
									<th className="px-3 py-2 text-right">Qty</th>
									<th className="px-3 py-2 text-right">Unit Cost</th>
									<th className="px-3 py-2 text-right">Total</th>
								</tr>
							</thead>
							<tbody>
								{listItems.map((li) => (
									<tr
										key={li.id}
										className="border-b border-default-100 last:border-0"
									>
										<td className="px-3 py-2">{li.description}</td>
										<td className="px-3 py-2 text-right">{li.quantity}</td>
										<td className="px-3 py-2 text-right font-mono">
											{formatPeso(li.unitCost)}
										</td>
										<td className="px-3 py-2 text-right font-mono font-semibold">
											{formatPeso(li.totalCost)}
										</td>
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr className="bg-primary/5 font-bold">
									<td
										colSpan={3}
										className="px-3 py-2 text-right text-sm text-default-700"
									>
										Total
									</td>
									<td className="px-3 py-2 text-right text-sm text-primary font-mono">
										{formatPeso(totalListCost)}
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				)}
			</Section>

			{/* ── DEV TOOLS ─────────────────────────────────────────────────── */}
			<Section title="⚙ Dev Tools" subtle>
				<p className="text-xs text-default-400 mb-3">
					Each click adds one randomly-generated list item within the remaining
					budget.
					{overBudget && (
						<span className="text-red-500 font-medium ml-1">
							Budget exhausted — seeding is disabled.
						</span>
					)}
				</p>

				{seedError && (
					<div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 flex gap-2">
						<span>⚠</span>
						<span>{seedError}</span>
					</div>
				)}

				{overBudget && (
					<div className="mb-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-3 py-2">
						Adding another item would exceed the estimated cost budget of{" "}
						{formatPeso(item.estimatedCost)}.
					</div>
				)}

				<button
					onClick={async () => {
						devFuncSeedArItem(detail, arCode);
						await loadDetail();
					}}
					disabled={ overBudget}
					className={
						"px-4 py-2 rounded-lg text-sm font-medium border transition-all"
				}
				>
				</button>
			</Section>
		</div>
	);
}