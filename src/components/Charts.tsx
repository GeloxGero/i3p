import { useEffect, useState, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
	Spinner,
	useDisclosure,
	Chip,
} from "@heroui/react";
import { $token } from "../store/authStore";

// ─── Chart.js Imports ─────────────────────────────────────────────────────────
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip as ChartTooltip,
	Legend as ChartLegend,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { apiRequest } from "../api/TokenService";

ChartJS.register(
	ArcElement,
	ChartTooltip,
	ChartLegend,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
);

// ─── Types & Constants ────────────────────────────────────────────────────────

interface PlanHeader {
	id: number;
	year: number;
	school: string;
	totalEstimatedCost: number;
	annualBudget: number | null;
}

interface MonthSheet {
	month: string;
	grandTotal: number;
	subTotals: Record<string, number>;
}

interface PlanDetail {
	id: number;
	year: number;
	school: string;
	totalEstimatedCost: number;
	annualBudget: number | null;
	months: MonthSheet[];
}

const CATEGORY_COLORS: Record<string, string> = {
	"Regular Expenditure": "#3b82f6",
	"Project Related Expenditure": "#22c55e",
	"Repair and Maintenance": "#f59e0b",
	Others: "#a855f7",
};

const MONTH_SHORT = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
const BUDGET_COLOR = "#64748b";
const SPENT_COLOR = "#3b82f6";

function fmt(n: number) {
	return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}
function fmtM(n: number) {
	if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(2)}M`;
	if (n >= 1_000) return `₱${(n / 1_000).toFixed(0)}k`;
	return `₱${n.toFixed(0)}`;
}

// ─── Chart Components ────────────────────────────────────────────────────────

function BudgetGauge({ budget, spent }: { budget: number; spent: number }) {
	const over = spent > budget;
	const delta = Math.abs(spent - budget);
	const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

	const data = {
		datasets: [
			{
				data: over ? [budget, delta] : [spent, Math.max(budget - spent, 0)],
				backgroundColor: over
					? [SPENT_COLOR, "#ef4444"]
					: [SPENT_COLOR, "#e2e8f0"],
				borderWidth: 0,
				circumference: 360,
				rotation: 0,
			},
		],
	};

	const options = {
		cutout: "70%",
		plugins: {
			legend: { display: false },
			tooltip: { enabled: true },
		},
		maintainAspectRatio: false,
	};

	return (
		<div className="flex flex-col items-center gap-2">
			<div className="relative w-44 h-44">
				<Pie data={data} options={options} />
				<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
					<span
						className={`text-xl font-bold tabular-nums ${over ? "text-danger-500" : "text-default-800"}`}
					>
						{pct.toFixed(1)}%
					</span>
					<span className="text-[10px] text-default-400 uppercase tracking-wide">
						utilised
					</span>
				</div>
			</div>
			{over ? (
				<Chip size="sm" color="danger" variant="flat">
					Over by {fmt(delta)}
				</Chip>
			) : (
				<span className="text-sm text-success-600 font-semibold">
					{fmt(Math.max(budget - spent, 0))} remaining
				</span>
			)}
		</div>
	);
}

function CategoryPie({ plan }: { plan: PlanDetail }) {
	const catMap: Record<string, number> = {};
	plan.months.forEach((sheet) => {
		Object.entries(sheet.subTotals ?? {}).forEach(([cat, val]) => {
			catMap[cat] = (catMap[cat] ?? 0) + val;
		});
	});

	const entries = Object.entries(catMap).filter(([, v]) => v > 0);

	const data = {
		labels: entries.map(([name]) => name),
		datasets: [
			{
				data: entries.map(([, value]) => value),
				backgroundColor: entries.map(
					([name]) => CATEGORY_COLORS[name] ?? "#94a3b8",
				),
				borderWidth: 0,
			},
		],
	};

	const options = {
		plugins: {
			legend: {
				position: "bottom" as const,
				labels: { boxWidth: 12, font: { size: 11 } },
			},
			tooltip: {
				callbacks: {
					label: (context: any) => `${context.label}: ${fmt(context.raw)}`,
				},
			},
		},
		maintainAspectRatio: false,
	};

	return (
		<div className="h-[280px]">
			<Pie data={data} options={options} />
		</div>
	);
}

function MonthlyBar({ plan }: { plan: PlanDetail }) {
	const data = {
		labels: plan.months.map((s, i) => MONTH_SHORT[i] ?? s.month.slice(0, 3)),
		datasets: [
			{
				label: "Expenditure",
				data: plan.months.map((s) => s.grandTotal),
				backgroundColor: SPENT_COLOR,
				borderRadius: 4,
			},
		],
	};

	const options = {
		responsive: true,
		plugins: { legend: { display: false } },
		scales: {
			y: {
				ticks: { callback: (val: any) => fmtM(val), font: { size: 10 } },
				grid: { color: "#e2e8f0" },
			},
			x: { ticks: { font: { size: 10 } }, grid: { display: false } },
		},
		maintainAspectRatio: false,
	};

	return (
		<div className="h-[260px]">
			<Bar data={data} options={options} />
		</div>
	);
}

function BudgetVsActualBar({ plan }: { plan: PlanDetail }) {
	if (!plan.annualBudget) return null;
	const monthlyTarget = plan.annualBudget / 12;

	const data = {
		labels: plan.months.map((s, i) => MONTH_SHORT[i] ?? s.month.slice(0, 3)),
		datasets: [
			{
				label: "Monthly Budget",
				data: plan.months.map(() => monthlyTarget),
				backgroundColor: BUDGET_COLOR,
				borderRadius: 4,
			},
			{
				label: "Actual Spent",
				data: plan.months.map((s) => s.grandTotal),
				backgroundColor: SPENT_COLOR,
				borderRadius: 4,
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: "bottom" as const,
				labels: { boxWidth: 12, font: { size: 11 } },
			},
			tooltip: {
				callbacks: {
					label: (ctx: any) => `${ctx.dataset.label}: ${fmt(ctx.raw)}`,
				},
			},
		},
		scales: {
			y: { ticks: { callback: (val: any) => fmtM(val), font: { size: 10 } } },
			x: { ticks: { font: { size: 10 } } },
		},
		maintainAspectRatio: false,
	};

	return (
		<div className="h-[260px]">
			<Bar data={data} options={options} />
		</div>
	);
}

// ─── Set Budget Modal & Summary Cards (Unchanged Logic, simplified) ──────────

function SummaryCards({ plan }: { plan: PlanDetail }) {
	const budget = plan.annualBudget;
	const spent = plan.totalEstimatedCost;
	const remaining = budget != null ? budget - spent : null;
	const utilPct = budget != null && budget > 0 ? (spent / budget) * 100 : null;

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<div className="bg-default-50 border border-default-200 rounded-2xl p-4 flex flex-col gap-1">
				<span className="text-xs text-default-400 uppercase tracking-wide">
					Total Expenditure
				</span>
				<span className="text-xl font-bold text-primary">{fmt(spent)}</span>
			</div>
			{budget != null ? (
				<>
					<div className="bg-default-50 border border-default-200 rounded-2xl p-4 flex flex-col gap-1">
						<span className="text-xs text-default-400 uppercase tracking-wide">
							Annual Budget
						</span>
						<span className="text-xl font-bold text-default-700">
							{fmt(budget)}
						</span>
					</div>
					<div
						className={`border rounded-2xl p-4 flex flex-col gap-1 ${(remaining ?? 0) < 0 ? "bg-danger-50 border-danger-200" : "bg-success-50 border-success-200"}`}
					>
						<span className="text-xs text-default-400 uppercase tracking-wide">
							{(remaining ?? 0) < 0 ? "Over Budget" : "Remaining"}
						</span>
						<span
							className={`text-xl font-bold ${(remaining ?? 0) < 0 ? "text-danger-600" : "text-success-600"}`}
						>
							{fmt(Math.abs(remaining ?? 0))}
						</span>
					</div>
					<div className="bg-default-50 border border-default-200 rounded-2xl p-4 flex flex-col gap-1">
						<span className="text-xs text-default-400 uppercase tracking-wide">
							Utilization
						</span>
						<span
							className={`text-xl font-bold ${(utilPct ?? 0) > 100 ? "text-danger-600" : "text-default-700"}`}
						>
							{utilPct != null ? `${utilPct.toFixed(1)}%` : "—"}
						</span>
					</div>
				</>
			) : (
				<div className="col-span-3 flex items-center justify-center border border-dashed border-default-200 rounded-2xl p-4 text-sm text-default-400">
					No annual budget set — click "Set Budget" to enable comparison charts.
				</div>
			)}
		</div>
	);
}

export default function Charts() {
	const token = useStore($token);
	const [headers, setHeaders] = useState<PlanHeader[]>([]);
	const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);
	const [loadingList, setLoadingList] = useState(true);
	const [loadingPlan, setLoadingPlan] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const fetchHeaders = useCallback(async () => {
		setLoadingList(true);
		try {
			const data: PlanHeader[] = await apiRequest(
				"api/SchoolImplementation",
				{},
				token,
			);
			setHeaders(data);

			// If there's data and no plan is selected yet, load the first one
			if (data.length > 0 && !selectedPlan) {
				fetchPlan(data[0].id.toString());
			}
		} catch (error) {
			console.error("Error fetching headers:", error);
		} finally {
			setLoadingList(false);
		}
	}, [token, selectedPlan]);

	const fetchPlan = async (id: string) => {
		setLoadingPlan(true);
		try {
			setSelectedPlan(
				await apiRequest(`api/SchoolImplementation/${id}`, {}, token),
			);
		} finally {
			setLoadingPlan(false);
		}
	};

	useEffect(() => {
		fetchHeaders();
	}, [fetchHeaders]);

	const onBudgetSaved = (budget: number | null) => {
		setSelectedPlan((p) => (p ? { ...p, annualBudget: budget } : p));
		setHeaders((hs) =>
			hs.map((h) =>
				h.id === selectedPlan?.id ? { ...h, annualBudget: budget } : h,
			),
		);
	};

	if (loadingList)
		return (
			<Spinner classNames={{ label: "text-foreground mt-4" }} variant="wave" />
		);

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* ── Toolbar ── */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold">Budget Dashboard</h1>
					<p className="text-default-500 text-sm">
						Annual budget comparison and expenditure breakdown
					</p>
				</div>
				<div className="flex gap-2 items-center">
					<Select
						label="Select Plan Year"
						className="w-72"
						onSelectionChange={(keys) => {
							const id = Array.from(keys)[0] as string;
							if (id) fetchPlan(id);
						}}
					>
						{headers.map((h) => (
							<SelectItem key={h.id}>
								{h.year} — {h.school}
								{h.annualBudget != null ? ` · ${fmtM(h.annualBudget)}` : ""}
							</SelectItem>
						))}
					</Select>
					{selectedPlan && (
						<Button
							size="sm"
							color="primary"
							variant={selectedPlan.annualBudget != null ? "flat" : "solid"}
							onPress={onOpen}
						>
							{selectedPlan.annualBudget != null ? "Edit Budget" : "Set Budget"}
						</Button>
					)}
				</div>
			</div>

			{loadingPlan ? (
				<div className="flex justify-center py-20">
					<Spinner label="Loading plan data…" />
				</div>
			) : selectedPlan ? (
				<>
					<SummaryCards plan={selectedPlan} />

					{/* ── Middle row: gauge + category pie + legend ── */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{selectedPlan.annualBudget != null && (
							<div className="flex flex-col gap-3 bg-default-50 border border-default-200 rounded-2xl p-5">
								<h3 className="text-sm font-semibold text-default-600 uppercase tracking-wide">
									Budget Utilization
								</h3>
								<div className="flex justify-center">
									<BudgetGauge
										budget={selectedPlan.annualBudget}
										spent={selectedPlan.totalEstimatedCost}
									/>
								</div>
								<div className="flex justify-between text-xs text-default-400 px-2">
									<span>Budget: {fmt(selectedPlan.annualBudget)}</span>
									<span>Spent: {fmt(selectedPlan.totalEstimatedCost)}</span>
								</div>
							</div>
						)}

						<div
							className={`flex flex-col gap-3 bg-default-50 border border-default-200 rounded-2xl p-5 ${selectedPlan.annualBudget != null ? "" : "sm:col-span-2"}`}
						>
							<h3 className="text-sm font-semibold text-default-600 uppercase tracking-wide">
								Expenditure by Category
							</h3>
							<CategoryPie plan={selectedPlan} />
						</div>

						<div className="flex flex-col gap-3 bg-default-50 border border-default-200 rounded-2xl p-5">
							<h3 className="text-sm font-semibold text-default-600 uppercase tracking-wide">
								Category Totals
							</h3>
							<div className="flex flex-col gap-2.5">
								{Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
									const total = selectedPlan.months.reduce(
										(s, m) => s + (m.subTotals?.[cat] ?? 0),
										0,
									);
									const pct =
										selectedPlan.totalEstimatedCost > 0
											? (total / selectedPlan.totalEstimatedCost) * 100
											: 0;
									return (
										<div key={cat} className="flex items-center gap-2">
											<span
												className="w-2.5 h-2.5 rounded-full shrink-0"
												style={{ background: color }}
											/>
											<span className="text-xs text-default-600 flex-1 truncate">
												{cat}
											</span>
											<span className="text-xs font-semibold text-default-700 tabular-nums">
												{fmtM(total)}
											</span>
											<span className="text-xs text-default-400 w-9 text-right tabular-nums">
												{pct.toFixed(0)}%
											</span>
										</div>
									);
								})}
							</div>
						</div>
					</div>

					{/* ── Monthly bar ── */}
					<div className="bg-default-50 border border-default-200 rounded-2xl p-5 flex flex-col gap-3">
						<h3 className="text-sm font-semibold text-default-600 uppercase tracking-wide">
							Monthly Expenditure
						</h3>
						<MonthlyBar plan={selectedPlan} />
					</div>

					{/* ── Budget vs actual bar ── */}
					{selectedPlan.annualBudget != null && (
						<div className="bg-default-50 border border-default-200 rounded-2xl p-5 flex flex-col gap-3">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-semibold text-default-600 uppercase tracking-wide">
									Monthly Budget vs Actual
								</h3>
								<span className="text-xs text-default-400">
									Monthly target: {fmtM(selectedPlan.annualBudget / 12)}
								</span>
							</div>
							<BudgetVsActualBar plan={selectedPlan} />
						</div>
					)}
				</>
			) : (
				<div className="text-center text-default-400 py-20">
					Select a plan year to view charts.
				</div>
			)}

			<SetBudgetModal
				plan={selectedPlan}
				isOpen={isOpen}
				onClose={onClose}
				onSaved={onBudgetSaved}
				token={token}
			/>
		</div>
	);
}
function SetBudgetModal({
	plan,
	isOpen,
	onClose,
	onSaved,
	token,
}: {
	plan: PlanDetail | null;
	isOpen: boolean;
	onClose: () => void;
	onSaved: (b: number | null) => void;
	token: string | null;
}) {
	const [value, setValue] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		setValue(plan?.annualBudget != null ? plan.annualBudget.toString() : "");
	}, [plan, isOpen]);

	const call = async (budget: number | null) => {
		if (!plan) return;
		setSaving(true);
		try {
			const updatedPlan = await apiRequest(
				`api/SchoolImplementation/${plan.id}/budget`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ annualBudget: budget }),
				},
				token,
			);
			if (updatedPlan) {
				onSaved(budget);
				onClose();
			}
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
			<ModalContent>
				<ModalHeader className="flex flex-col gap-0.5">
					<span>Set Annual Budget</span>
					<span className="text-sm font-normal text-default-500">
						{plan?.year} — {plan?.school}
					</span>
				</ModalHeader>
				<ModalBody>
					<Input
						label="Annual Budget (₱)"
						placeholder="e.g. 5000000"
						value={value}
						onValueChange={setValue}
						type="number"
						description="Leave blank and save to remove the budget target."
					/>
					{plan?.totalEstimatedCost != null && (
						<div className="text-xs text-default-400 bg-default-50 rounded-lg p-3">
							Current total expenditure:{" "}
							<span className="font-semibold text-default-600">
								{fmt(plan.totalEstimatedCost)}
							</span>
						</div>
					)}
				</ModalBody>
				<ModalFooter className="flex gap-2">
					{plan?.annualBudget != null && (
						<Button
							variant="flat"
							color="danger"
							isLoading={saving}
							onPress={() => call(null)}
						>
							Clear
						</Button>
					)}
					<div className="flex-1" />
					<Button variant="flat" onPress={onClose}>
						Cancel
					</Button>
					<Button
						color="primary"
						isLoading={saving}
						onPress={() =>
							call(value.trim() ? parseFloat(value.replace(/,/g, "")) : null)
						}
					>
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
