import type { MonthSheet } from "../types";
import { fmt } from "../utils";

function MonthFilterBar({
	sheets,
	activeMonth,
	onSelect,
}: {
	sheets: MonthSheet[];
	activeMonth: string;
	onSelect: (m: string) => void;
}) {
	return (
		<div className="sticky bottom-0 z-50 bg-background/90 backdrop-blur-md border-t border-default-200 px-3 sm:px-6 py-2.5 shrink-0">
			<div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
				{sheets.map((sheet) => {
					const isActive = sheet.month === activeMonth;
					return (
						<button
							key={sheet.month}
							onClick={() => onSelect(sheet.month)}
							className={[
								"flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0",
								isActive
									? "bg-primary text-white shadow"
									: "bg-default-100 text-default-600 hover:bg-default-200",
							].join(" ")}
						>
							{sheet.month.slice(0, 3)}
							{sheet.grandTotal > 0 && (
								<span
									className={[
										"text-[10px] px-1 py-0.5 rounded-full",
										isActive
											? "bg-white/20 text-white"
											: "bg-default-200 text-default-500",
									].join(" ")}
								>
									₱{(sheet.grandTotal / 1000).toFixed(0)}k
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function MonthTabBar({
	sheets,
	activeMonth,
	onSelect,
}: {
	sheets: MonthSheet[];
	activeMonth: string;
	onSelect: (m: string) => void;
}) {
	const planTotal = sheets.reduce((sum, s) => sum + s.grandTotal, 0);
	return (
		<div className="flex gap-1.5 pb-2 border-b border-default-200 overflow-x-auto scrollbar-hide">
			<button
				onClick={() => onSelect("TOTAL")}
				className={[
					"flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0",
					activeMonth === "TOTAL"
						? "bg-default-800 text-white shadow"
						: "bg-default-100 text-default-600 hover:bg-default-200",
				].join(" ")}
			>
				Total
				{planTotal > 0 && (
					<span
						className={[
							"text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full",
							activeMonth === "TOTAL"
								? "bg-white/20 text-white"
								: "bg-default-200 text-default-500",
						].join(" ")}
					>
						₱{(planTotal / 1_000_000).toFixed(2)}M
					</span>
				)}
			</button>
			{sheets.map((sheet) => {
				const isActive = sheet.month === activeMonth;
				return (
					<button
						key={sheet.month}
						onClick={() => onSelect(sheet.month)}
						className={[
							"flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0",
							isActive
								? "bg-primary text-white shadow"
								: "bg-default-100 text-default-600 hover:bg-default-200",
						].join(" ")}
					>
						{/* Show abbreviated month on narrow screens */}
						<span className="sm:hidden">{sheet.month.slice(0, 3)}</span>
						<span className="hidden sm:inline">{sheet.month}</span>
						{sheet.grandTotal > 0 && (
							<span
								className={[
									"text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full",
									isActive
										? "bg-white/20 text-white"
										: "bg-default-200 text-default-500",
								].join(" ")}
							>
								₱{(sheet.grandTotal / 1000).toFixed(0)}k
							</span>
						)}
					</button>
				);
			})}
		</div>
	);
}

function TotalView({
	sheets,
	annualBudget,
}: {
	sheets: MonthSheet[];
	annualBudget?: number | null;
}) {
	const planTotal = sheets.reduce((sum, s) => sum + s.grandTotal, 0);
	const budget = annualBudget ?? null;
	const remaining = budget != null ? budget - planTotal : null;
	const utilPct =
		budget != null && budget > 0
			? Math.min((planTotal / budget) * 100, 100)
			: null;
	const overBudget = budget != null && planTotal > budget;
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between bg-default-800 text-white rounded-2xl px-4 sm:px-6 py-4 sm:py-5 flex-wrap gap-3">
				<div>
					<p className="text-xs uppercase tracking-widest text-white/50 mb-1">
						Annual Total Expenditure
					</p>
					<p className="text-2xl sm:text-3xl font-bold">{fmt(planTotal)}</p>
				</div>
				<div className="text-right">
					<p className="text-xs text-white/50 uppercase tracking-wide mb-1">
						Months with data
					</p>
					<p className="text-xl sm:text-2xl font-semibold">
						{sheets.filter((s) => s.grandTotal > 0).length} / {sheets.length}
					</p>
				</div>
			</div>

			{budget != null && (
				<div
					className={[
						"rounded-2xl border px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4",
						overBudget
							? "bg-danger-50 border-danger-200"
							: "bg-primary/5 border-primary/20",
					].join(" ")}
				>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
						<div className="flex flex-col">
							<span className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								Expenditure
							</span>
							<span className="text-lg sm:text-2xl font-bold text-primary">
								{fmt(planTotal)}
							</span>
						</div>
						<div className="flex flex-col text-right sm:text-right">
							<span className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								Budget
							</span>
							<span className="text-lg sm:text-2xl font-bold text-default-700">
								{fmt(budget)}
							</span>
						</div>
						<div className="flex flex-col col-span-2 sm:col-span-1 sm:text-right">
							<span className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								{overBudget ? "Over Budget" : "Remaining"}
							</span>
							<span
								className={`text-lg sm:text-2xl font-bold ${overBudget ? "text-danger-600" : "text-success-600"}`}
							>
								{overBudget ? "+" : ""}
								{fmt(Math.abs(remaining!))}
							</span>
						</div>
					</div>
					<div className="flex flex-col gap-1.5">
						<div className="flex justify-between text-xs text-default-500">
							<span>
								{overBudget
									? "Over budget"
									: `${utilPct!.toFixed(1)}% utilised`}
							</span>
							<span>
								{fmt(planTotal)} of {fmt(budget)}
							</span>
						</div>
						<div className="h-2 bg-default-100 rounded-full overflow-hidden">
							<div
								className={`h-full rounded-full transition-all ${overBudget ? "bg-danger-500" : "bg-primary"}`}
								style={{ width: `${Math.min(utilPct ?? 0, 100)}%` }}
							/>
						</div>
					</div>
				</div>
			)}

			<div className="rounded-xl border border-default-200 overflow-hidden">
				<table className="w-full text-sm">
					<thead>
						<tr className="bg-default-50 border-b border-default-200">
							<th className="text-left px-3 sm:px-4 py-3 font-semibold text-default-600 uppercase text-xs tracking-wide">
								Month
							</th>
							<th className="text-right px-3 sm:px-4 py-3 font-semibold text-default-600 uppercase text-xs tracking-wide">
								Expenditure
							</th>
							<th className="px-3 sm:px-4 py-3 w-32 sm:w-52 hidden sm:table-cell" />
						</tr>
					</thead>
					<tbody>
						{sheets.map((sheet) => {
							const pct =
								planTotal > 0 ? (sheet.grandTotal / planTotal) * 100 : 0;
							const hasData = sheet.grandTotal > 0;
							return (
								<tr
									key={sheet.month}
									className={[
										"border-b border-default-100 hover:bg-default-50/60 transition-colors",
										!hasData ? "opacity-40" : "",
									].join(" ")}
								>
									<td className="px-3 sm:px-4 py-2.5">
										<span
											className={hasData ? "font-medium" : "text-default-400"}
										>
											{sheet.month}
										</span>
									</td>
									<td className="px-3 sm:px-4 py-2.5 text-right font-semibold tabular-nums">
										{hasData ? (
											<span className="text-primary">
												{fmt(sheet.grandTotal)}
											</span>
										) : (
											<span className="text-default-300 font-normal">—</span>
										)}
									</td>
									<td className="px-3 sm:px-4 py-2.5 hidden sm:table-cell">
										{hasData && (
											<div className="flex items-center gap-2">
												<div className="flex-1 h-1.5 bg-default-100 rounded-full overflow-hidden">
													<div
														className="h-full bg-primary rounded-full"
														style={{ width: `${pct}%` }}
													/>
												</div>
												<span className="text-xs text-default-400 w-10 text-right tabular-nums">
													{pct.toFixed(1)}%
												</span>
											</div>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
					<tfoot>
						<tr className="bg-default-100 border-t-2 border-default-300">
							<td className="px-3 sm:px-4 py-3 font-bold text-default-700 uppercase text-xs tracking-wide">
								TOTAL
							</td>
							<td className="px-3 sm:px-4 py-3 text-right font-bold text-base sm:text-lg text-primary tabular-nums">
								{fmt(planTotal)}
							</td>
							<td className="hidden sm:table-cell px-4 py-3" />
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
}

export { MonthTabBar, TotalView, MonthFilterBar };
