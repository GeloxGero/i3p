// components/duplicateResolver.tsx
//
// Modal shown after the duplicate-check step returns at least one match.
// For each duplicate pair the user chooses one of three actions:
//
//   Merge  — add quantities + costs onto the EXISTING row
//   Keep   — insert the incoming item as a NEW row with a fresh AR code
//   Delete — discard the incoming item; existing row is untouched
//
// The modal cannot be dismissed without resolving every pair (or explicitly
// cancelling the entire import).  This prevents accidental partial imports.

import { useState, useMemo } from "react";
import type {
	DuplicatePairDto,
	DuplicateResolutionDto,
	DuplicateAction,
} from "../types";
import { formatPeso } from "../utils";
import { CATEGORY_ORDER } from "../constants";

interface Props {
	year: number;
	duplicates: DuplicatePairDto[];
	onSubmit: (resolutions: DuplicateResolutionDto[]) => void;
	onClose: () => void; // cancels the whole import
}

// Per-pair action badge colours
const ACTION_STYLES: Record<DuplicateAction, string> = {
	Merge: "bg-blue-100 text-blue-700 border-blue-300",
	Keep: "bg-green-100 text-green-700 border-green-300",
	Delete: "bg-red-100 text-red-700 border-red-300",
};

const ACTION_LABELS: Record<DuplicateAction, string> = {
	Merge: "Merge (add qty + cost)",
	Keep: "Keep as new item",
	Delete: "Discard incoming",
};

export default function DuplicateResolver({
	year,
	duplicates,
	onSubmit,
	onClose,
}: Props) {
	// One decision per pair; initialised to "Keep" as a safe default.
	const [decisions, setDecisions] = useState<DuplicateAction[]>(() =>
		duplicates.map(() => "Keep"),
	);

	const allResolved = useMemo(
		() => decisions.length === duplicates.length,
		[decisions, duplicates],
	);

	const setDecision = (index: number, action: DuplicateAction) =>
		setDecisions((prev) => {
			const next = [...prev];
			next[index] = action;
			return next;
		});

	const handleSubmit = () => {
		const resolutions: DuplicateResolutionDto[] = duplicates.map((pair, i) => ({
			existingItemId: pair.existing.id,
			incoming: pair.incoming,
			action: decisions[i],
		}));
		onSubmit(resolutions);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-background rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-default-100">
					<div>
						<h2 className="text-lg font-semibold">
							Duplicate Items Found — {year}
						</h2>
						<p className="text-sm text-default-500 mt-0.5">
							{duplicates.length} item{duplicates.length !== 1 ? "s" : ""} in
							the file match{duplicates.length === 1 ? "es" : ""} existing
							records. Choose what to do with each one.
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-default-400 hover:text-default-700 text-xl leading-none ml-4"
					>
						×
					</button>
				</div>

				{/* Duplicate list — scrollable */}
				<div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-6">
					{duplicates.map((pair, i) => (
						<div
							key={i}
							className="border border-default-200 rounded-xl overflow-hidden"
						>
							{/* Pair header */}
							<div className="bg-default-50 px-4 py-2 text-xs font-semibold text-default-500 uppercase tracking-wide flex justify-between">
								<span>Duplicate #{i + 1}</span>
								<span
									className={`px-2 py-0.5 rounded-full border text-xs font-medium ${ACTION_STYLES[decisions[i]]}`}
								>
									{decisions[i]}
								</span>
							</div>

							{/* Side-by-side comparison */}
							<div className="grid grid-cols-2 divide-x divide-default-100">
								{/* Existing (DB) item */}
								<div className="p-4">
									<p className="text-xs font-semibold text-default-400 mb-2">
										EXISTING (in database)
									</p>
									<ItemSummary
										activity={pair.existing.programActivity}
										kra={pair.existing.kraArea}
										category={pair.existing.category}
										cost={pair.existing.estimatedCost}
										quantity={pair.existing.quantity}
										arCode={pair.existing.arCode}
									/>
								</div>

								{/* Incoming (from file) item */}
								<div className="p-4 bg-amber-50/40">
									<p className="text-xs font-semibold text-amber-600 mb-2">
										INCOMING (from file)
									</p>
									<ItemSummary
										activity={pair.incoming.activity}
										kra={pair.incoming.kra}
										category={pair.incoming.expenditureType}
										cost={pair.incoming.estimatedCost}
										quantity={pair.incoming.quantity ?? "—"}
									/>
								</div>
							</div>

							{/* Action selector — pill buttons */}
							<div className="px-4 py-3 bg-default-50 border-t border-default-100 flex gap-2 flex-wrap">
								{(["Merge", "Keep", "Delete"] as DuplicateAction[]).map(
									(action) => (
										<button
											key={action}
											onClick={() => setDecision(i, action)}
											className={[
												"px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
												decisions[i] === action
													? ACTION_STYLES[action] +
														" ring-2 ring-offset-1 ring-current"
													: "border-default-200 text-default-500 hover:border-default-400",
											].join(" ")}
										>
											{ACTION_LABELS[action]}
										</button>
									),
								)}
							</div>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-6 py-4 border-t border-default-100 bg-default-50">
					<p className="text-sm text-default-500">
						All {duplicates.length} pairs resolved. Non-duplicate items will be
						imported automatically.
					</p>
					<div className="flex gap-2">
						<button
							onClick={onClose}
							className="px-4 py-2 rounded-lg text-sm text-default-600 hover:bg-default-200"
						>
							Cancel Import
						</button>
						<button
							onClick={handleSubmit}
							disabled={!allResolved}
							className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-white disabled:opacity-50 hover:bg-primary/90 transition-colors"
						>
							Confirm &amp; Import
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Small presentational helper ─────────────────────────────────────────────
function ItemSummary({
	activity,
	kra,
	category,
	cost,
	quantity,
	arCode,
}: {
	activity: string;
	kra: string;
	category: string;
	cost: number;
	quantity: string;
	arCode?: string | null;
}) {
	return (
		<dl className="flex flex-col gap-1 text-sm">
			<Row label="Activity" value={activity} bold />
			<Row label="KRA" value={kra} />
			<Row label="Category" value={category} />
			<Row label="Qty" value={quantity} />
			<Row label="Cost" value={formatPeso(cost)} />
			{arCode && <Row label="AR Code" value={arCode} mono />}
		</dl>
	);
}

function Row({
	label,
	value,
	bold,
	mono,
}: {
	label: string;
	value: string;
	bold?: boolean;
	mono?: boolean;
}) {
	return (
		<div className="flex gap-1">
			<dt className="text-default-400 w-20 shrink-0">{label}</dt>
			<dd
				className={[
					bold ? "font-medium" : "",
					mono ? "font-mono text-xs" : "",
				].join(" ")}
			>
				{value || <span className="text-default-300 italic">—</span>}
			</dd>
		</div>
	);
}
