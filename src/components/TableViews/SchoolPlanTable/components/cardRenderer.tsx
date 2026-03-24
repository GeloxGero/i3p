// components/cardRenderer.tsx
//
// Mobile-first card view for the active month sheet.
// Each item is rendered as a card.  Verified / Approved status is shown
// prominently so staff can quickly scan implementation progress.
//
// This component intentionally renders a FLAT list of cards (no table) so
// it works well at narrow widths and touch screens.

import type { MonthSheetDto, SchoolPlanItemDto } from "../types";
import { SipStatus } from "../types";
import { formatPeso } from "../utils";

interface Props {
	sheet: MonthSheetDto;
	onDeleteItem: (id: number) => void;
}

export default function CardRenderer({ sheet, onDeleteItem }: Props) {
	if (sheet.items.length === 0) {
		return (
			<div className="text-center py-12 text-default-400 text-sm">
				No items for {sheet.month}.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{/* Grand total banner */}
			<div className="flex justify-between items-center bg-primary/5 rounded-xl px-4 py-3 border border-primary/10">
				<span className="text-sm font-medium text-default-700">
					{sheet.month} — Grand Total
				</span>
				<span className="text-base font-bold text-primary">
					{formatPeso(sheet.grandTotal)}
				</span>
			</div>

			{/* Cards */}
			{sheet.items.map((item) => (
				<ItemCard
					key={item.id}
					item={item}
					onDelete={() => onDeleteItem(item.id)}
				/>
			))}
		</div>
	);
}

function ItemCard({
	item,
	onDelete,
}: {
	item: SchoolPlanItemDto;
	onDelete: () => void;
}) {
	const statusLabel = item.isVerified
		? "Verified"
		: item.status === SipStatus.Approved
			? "Approved"
			: "Implemented";

	const statusColour = item.isVerified
		? "bg-green-100 text-green-700"
		: item.status === SipStatus.Approved
			? "bg-sky-100 text-sky-700"
			: "bg-default-100 text-default-500";

	const categoryColour: Record<string, string> = {
		"Regular Expenditure": "border-l-blue-400",
		"Project Related Expenditure": "border-l-purple-400",
		"Repair and Maintenance": "border-l-orange-400",
		Others: "border-l-gray-300",
	};

	return (
		<div
			className={[
				"relative bg-background border border-default-200 rounded-xl p-4",
				"border-l-4",
				categoryColour[item.category] ?? "border-l-default-300",
			].join(" ")}
		>
			{/* Delete button */}
			<button
				onClick={onDelete}
				className="absolute top-3 right-3 text-default-300 hover:text-red-500 transition-colors text-lg leading-none"
				title="Remove item"
			>
				×
			</button>

			{/* Status badge */}
			<span
				className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${statusColour}`}
			>
				{statusLabel}
			</span>

			{/* Activity (primary label) */}
			<p className="font-semibold text-default-800 pr-6 leading-snug">
				{item.programActivity || "—"}
			</p>

			{/* KRA + Program */}
			<p className="text-xs text-default-400 mt-0.5">
				{[item.kraArea, item.specificProgram].filter(Boolean).join(" · ")}
			</p>

			{/* Cost + Quantity row */}
			<div className="flex justify-between items-end mt-3">
				<span className="text-lg font-bold text-primary font-mono">
					{formatPeso(item.estimatedCost)}
				</span>
				<div className="text-right text-xs text-default-400">
					{item.quantity && <p>Qty: {item.quantity}</p>}
					{item.arCode && <p className="font-mono">{item.arCode}</p>}
				</div>
			</div>

			{/* Account info */}
			{(item.accountTitle || item.accountCode) && (
				<p className="text-xs text-default-400 mt-2 border-t border-default-100 pt-1">
					{item.accountTitle}
					{item.accountCode ? ` · ${item.accountCode}` : ""}
				</p>
			)}
		</div>
	);
}
