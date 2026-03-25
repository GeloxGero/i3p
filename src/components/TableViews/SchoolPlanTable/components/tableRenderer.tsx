// components/tableRenderer.tsx
//
// Renders the month-sheet data table.
//
// FIX: onDeleteItem typed as `(id: number) => void | Promise<void>`
// ────────────────────────────────────────────────────────────────────
// SchoolPlanTable.handleDeleteItem is async (returns Promise<void>).
// Previously the Props interface declared `void` which caused TS2322.
// The union `void | Promise<void>` accepts both sync and async handlers.

import { useMemo } from "react";
import type {
	MonthSheetDto,
	SchoolPlanItemDto,
	ColumnVisibility,
} from "../types";
import { SipStatus } from "../types";
import { formatPeso } from "../utils";
import { CATEGORY_ORDER, COLUMN_LABELS } from "../constants";

interface Props {
	sheet: MonthSheetDto;
	columns: ColumnVisibility;
	// Accepts both sync and async delete handlers — the parent uses async.
	onDeleteItem: (id: number) => void | Promise<void>;
}

export default function TableRenderer({ sheet, columns, onDeleteItem }: Props) {
	const visibleCols = useMemo(
		() =>
			(Object.keys(columns) as (keyof ColumnVisibility)[]).filter(
				(k) => columns[k],
			),
		[columns],
	);

	const grouped = useMemo(() => {
		const map = new Map<string, SchoolPlanItemDto[]>();
		for (const item of sheet.items) {
			const cat = item.category ?? "Regular Expenditure";
			if (!map.has(cat)) map.set(cat, []);
			map.get(cat)!.push(item);
		}
		return CATEGORY_ORDER.map((cat) => ({
			category: cat,
			items: map.get(cat) ?? [],
		})).filter((g) => g.items.length > 0);
	}, [sheet.items]);

	if (sheet.items.length === 0) {
		return (
			<div className="text-center py-16 text-default-400 text-sm">
				No items for {sheet.month}.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-default-200">
			<table className="w-full text-sm">
				<thead>
					<tr className="bg-default-50 border-b border-default-200">
						{visibleCols.map((key) => (
							<th
								key={key}
								className="px-3 py-2.5 text-left text-xs font-semibold text-default-500 uppercase tracking-wide whitespace-nowrap"
							>
								{COLUMN_LABELS[key]}
							</th>
						))}
						<th className="w-8" />
					</tr>
				</thead>

				<tbody>
					{grouped.map(({ category, items }) => (
						<>
							{/* Category header row */}
							<tr key={`cat-${category}`} className="bg-default-100/60">
								<td
									colSpan={visibleCols.length + 1}
									className="px-3 py-1.5 text-xs font-bold text-default-600 uppercase tracking-wider"
								>
									{category}
								</td>
							</tr>

							{/* Data rows */}
							{items.map((item) => (
								<tr
									key={item.id}
									className="border-b border-default-100 hover:bg-default-50/60 transition-colors group"
								>
									{visibleCols.map((key) => (
										<td key={key} className="px-3 py-2 align-top">
											<CellValue colKey={key} item={item} />
										</td>
									))}
									<td className="px-2 py-2 text-right">
										<button
											onClick={() => onDeleteItem(item.id)}
											className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 text-base leading-none"
											title="Remove item"
										>
											×
										</button>
									</td>
								</tr>
							))}

							{/* Category subtotal */}
							<tr
								key={`sub-${category}`}
								className="bg-default-50 border-b border-default-200"
							>
								<td
									colSpan={visibleCols.length}
									className="px-3 py-1.5 text-right text-xs font-semibold text-default-500"
								>
									Subtotal — {category}
								</td>
								<td className="px-3 py-1.5 text-right text-xs font-semibold text-default-700 whitespace-nowrap">
									{formatPeso(sheet.subTotals[category] ?? 0)}
								</td>
							</tr>
						</>
					))}

					{/* Grand total */}
					<tr className="bg-primary/5 font-semibold">
						<td
							colSpan={visibleCols.length}
							className="px-3 py-2.5 text-right text-sm text-default-700"
						>
							Grand Total — {sheet.month}
						</td>
						<td className="px-3 py-2.5 text-right text-sm text-primary whitespace-nowrap">
							{formatPeso(sheet.grandTotal)}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}

// ─── Cell renderers ───────────────────────────────────────────────────────────

function CellValue({
	colKey,
	item,
}: {
	colKey: keyof ColumnVisibility;
	item: SchoolPlanItemDto;
}) {
	switch (colKey) {
		case "kraArea":
			return <span className="text-default-700">{item.kraArea || "—"}</span>;
		case "specificProgram":
			return <span>{item.specificProgram || "—"}</span>;
		case "programActivity":
			return <span className="font-medium">{item.programActivity || "—"}</span>;
		case "purpose":
			return (
				<span className="text-default-500 text-xs">{item.purpose || "—"}</span>
			);
		case "performanceIndicator":
			return (
				<span className="text-default-500 text-xs">
					{item.performanceIndicator || "—"}
				</span>
			);
		case "resourceDescription":
			return (
				<span className="text-default-500 text-xs">
					{item.resourceDescription || "—"}
				</span>
			);
		case "quantity":
			return <span className="text-center block">{item.quantity || "—"}</span>;
		case "estimatedCost":
			return (
				<span className="font-mono text-right block whitespace-nowrap">
					{formatPeso(item.estimatedCost)}
				</span>
			);
		case "accountTitle":
			return <span className="text-xs">{item.accountTitle || "—"}</span>;
		case "accountCode":
			return (
				<span className="font-mono text-xs">{item.accountCode || "—"}</span>
			);
		case "category":
			return <CategoryBadge category={item.category} />;
		case "arCode":
			if (!item.arCode)
				return <span className="text-xs text-default-300 italic">pending</span>;
			return (
				<a
					href={`/projects/detail?ar=${encodeURIComponent(item.arCode)}`}
					className="font-mono text-xs text-primary hover:underline whitespace-nowrap"
					title="View AR detail"
				>
					{item.arCode}
				</a>
			);
		case "status":
			return <StatusBadge status={item.status} verified={item.isVerified} />;
		default:
			return null;
	}
}

function CategoryBadge({ category }: { category: string }) {
	const colours: Record<string, string> = {
		"Regular Expenditure": "bg-blue-50 text-blue-700",
		"Project Related Expenditure": "bg-purple-50 text-purple-700",
		"Repair and Maintenance": "bg-orange-50 text-orange-700",
		Others: "bg-gray-50 text-gray-600",
	};
	return (
		<span
			className={`px-1.5 py-0.5 rounded text-xs font-medium ${colours[category] ?? "bg-default-100 text-default-600"}`}
		>
			{category}
		</span>
	);
}

function StatusBadge({
	status,
	verified,
}: {
	status: SipStatus;
	verified: boolean;
}) {
	if (verified)
		return (
			<span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
				Verified
			</span>
		);
	if (status === SipStatus.Approved)
		return (
			<span className="px-1.5 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700">
				Approved
			</span>
		);
	return (
		<span className="px-1.5 py-0.5 rounded text-xs font-medium bg-default-100 text-default-500">
			Implemented
		</span>
	);
}
