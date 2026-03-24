// components/totalView.tsx
//
// Budget summary card shown above the month tabs.
// Shows: total estimated cost, annual budget, utilisation bar, and a
// quick-edit input for setting / clearing the budget ceiling.
//
// The default budget (DEFAULT_ANNUAL_BUDGET from constants) is used when
// no admin budget has been set so the progress bar always has something
// to render against.

import { useState } from "react";
import { formatPeso, budgetRatio, budgetColour } from "../utils";

interface Props {
	totalEstimatedCost: number;
	annualBudget: number | null;
	effectiveBudget: number; // DEFAULT_ANNUAL_BUDGET when annualBudget is null
	onSetBudget: (value: number | null) => Promise<void>;
}

export default function TotalView({
	totalEstimatedCost,
	annualBudget,
	effectiveBudget,
	onSetBudget,
}: Props) {
	const [editing, setEditing] = useState(false);
	const [input, setInput] = useState(String(annualBudget ?? ""));
	const [saving, setSaving] = useState(false);

	const ratio = budgetRatio(totalEstimatedCost, effectiveBudget);
	const colour = budgetColour(ratio);
	const pct = Math.round(ratio * 100);

	const handleSave = async () => {
		setSaving(true);
		const parsed =
			input.trim() === "" ? null : Number(input.replace(/[,₱\s]/g, ""));
		await onSetBudget(isNaN(parsed as number) ? null : parsed);
		setSaving(false);
		setEditing(false);
	};

	return (
		<div className="bg-background border border-default-200 rounded-xl p-4 flex flex-col gap-3">
			<div className="flex flex-wrap justify-between items-start gap-4">
				{/* Total spent */}
				<div>
					<p className="text-xs text-default-400 uppercase tracking-wide">
						Total Estimated Cost
					</p>
					<p className="text-2xl font-bold text-default-800 font-mono mt-0.5">
						{formatPeso(totalEstimatedCost)}
					</p>
				</div>

				{/* Annual budget */}
				<div className="text-right">
					<p className="text-xs text-default-400 uppercase tracking-wide">
						Annual Budget
					</p>
					{editing ? (
						<div className="flex items-center gap-1.5 mt-1">
							<span className="text-sm text-default-500">₱</span>
							<input
								autoFocus
								type="number"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								className="border border-default-300 rounded px-2 py-1 text-sm w-36 focus:outline-none focus:border-primary"
								placeholder="e.g. 1500000"
							/>
							<button
								onClick={handleSave}
								disabled={saving}
								className="px-2 py-1 text-xs rounded bg-primary text-white disabled:opacity-50"
							>
								{saving ? "…" : "Save"}
							</button>
							<button
								onClick={() => setEditing(false)}
								className="px-2 py-1 text-xs rounded text-default-500 hover:bg-default-100"
							>
								Cancel
							</button>
						</div>
					) : (
						<button
							onClick={() => {
								setInput(String(annualBudget ?? ""));
								setEditing(true);
							}}
							className="text-lg font-semibold text-default-600 hover:text-primary transition-colors mt-0.5 text-right"
						>
							{annualBudget ? (
								formatPeso(annualBudget)
							) : (
								<span className="text-sm text-default-300 italic">
									Not set — click to add
								</span>
							)}
						</button>
					)}
				</div>
			</div>

			{/* Utilisation bar */}
			<div>
				<div className="flex justify-between text-xs mb-1">
					<span className="text-default-400">Budget utilisation</span>
					<span className={`font-semibold ${colour}`}>{pct}%</span>
				</div>
				<div className="h-2 rounded-full bg-default-100 overflow-hidden">
					<div
						className={`h-full rounded-full transition-all duration-500 ${
							ratio >= 0.9
								? "bg-red-400"
								: ratio >= 0.75
									? "bg-yellow-400"
									: "bg-green-400"
						}`}
						style={{ width: `${Math.min(pct, 100)}%` }}
					/>
				</div>
				{!annualBudget && (
					<p className="text-xs text-default-300 mt-1 italic">
						Showing default budget of {formatPeso(effectiveBudget)}. Set a real
						budget above.
					</p>
				)}
			</div>
		</div>
	);
}
