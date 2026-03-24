// components/addItemModal.tsx
//
// Modal for manually adding a single implementation item to an existing plan.
// The month is pre-filled from the currently active tab but is changeable.
//
// ADVISORY WARNINGS (non-blocking)
// ─────────────────────────────────
// • Over-budget: cost would push the plan past the annual budget ceiling.
// • Duplicate activity: same activity name already exists in the chosen month.
//
// Neither warning prevents submission — per spec they are informational only.
//
// STATE POLICY
// ────────────
// All state is local to this modal.  When the user confirms, we POST directly
// to the API and then call onItemAdded() so the parent can re-fetch the detail.

import { useState, useMemo } from "react";
import {
	MONTH_ORDER,
	CATEGORY_ORDER,
	monthIndex,
	type MonthName,
} from "./constants";
import { buildDateString } from "./utils";
import type { ExpenditureCategory } from "./types";

const BASE = "/api/SchoolImplementation";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
	planId: number;
	year: number;
	activeMonth: MonthName | null;
	annualBudget?: number | null;
	currentTotal?: number;
	existingActivities?: { month: string; activity: string }[];
	onClose: () => void;
	onItemAdded: () => void;
}

// ─── Form shape ───────────────────────────────────────────────────────────────

interface FormState {
	kra: string;
	sipProgram: string;
	activity: string;
	purpose: string;
	indicator: string;
	resources: string;
	quantity: string;
	estimatedCost: string;
	accountTitle: string;
	accountCode: string;
	expenditureType: ExpenditureCategory;
}

const EMPTY_FORM: FormState = {
	kra: "",
	sipProgram: "",
	activity: "",
	purpose: "",
	indicator: "",
	resources: "",
	quantity: "",
	estimatedCost: "",
	accountTitle: "",
	accountCode: "",
	expenditureType: "Regular Expenditure",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddItemModal({
	planId,
	year,
	activeMonth,
	annualBudget,
	currentTotal = 0,
	existingActivities = [],
	onClose,
	onItemAdded,
}: Props) {
	// `month` is MonthName so it is always a valid entry from MONTH_ORDER.
	// We default to the currently active tab; if there is none (e.g. All tab
	// is selected), fall back to January.
	const [month, setMonth] = useState<MonthName>(activeMonth ?? MONTH_ORDER[0]);
	const [form, setForm] = useState<FormState>(EMPTY_FORM);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const cost = parseFloat(form.estimatedCost) || 0;

	// ── Advisory warnings ─────────────────────────────────────────────────────

	const overBudget = useMemo(
		() => !!annualBudget && currentTotal + cost > annualBudget,
		[annualBudget, currentTotal, cost],
	);

	const alreadyExists = useMemo(
		() =>
			!!form.activity.trim() &&
			existingActivities.some(
				(e) =>
					e.month.toLowerCase() === month.toLowerCase() &&
					e.activity.trim().toLowerCase() ===
						form.activity.trim().toLowerCase(),
			),
		[existingActivities, month, form.activity],
	);

	// ── Controlled-input helper ────────────────────────────────────────────────
	//
	// Returns an onChange handler bound to one field of the form.
	// Extracting this avoids a separate handler per field while keeping the
	// form state update in one place.
	const setField =
		(key: keyof FormState) =>
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
			>,
		) =>
			setForm((prev) => ({ ...prev, [key]: e.target.value }));

	// ── Submit ────────────────────────────────────────────────────────────────

	const handleSubmit = async () => {
		if (!form.activity.trim()) {
			setError("Activity / Programme is required.");
			return;
		}
		if (cost <= 0) {
			setError("Estimated cost must be greater than zero.");
			return;
		}

		// buildDateString uses monthIndex internally — no cast needed here.
		const dateStr = buildDateString(year, month);

		setSaving(true);
		setError(null);

		try {
			const res = await fetch(`${BASE}/item`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					date: dateStr,
					kra: form.kra || null,
					sipProgram: form.sipProgram || "Unimplemented",
					activity: form.activity,
					purpose: form.purpose || null,
					indicator: form.indicator || null,
					resources: form.resources || null,
					quantity: form.quantity || null,
					estimatedCost: cost,
					accountTitle: form.accountTitle || null,
					accountCode: form.accountCode || null,
					expenditureType: form.expenditureType,
					status: 0, // SipStatus.Implemented
				}),
			});

			if (!res.ok)
				throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
			onItemAdded();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to save item.");
			setSaving(false);
		}
	};

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-background rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[92vh]">
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-default-100 shrink-0">
					<h2 className="text-base font-semibold">Add Item — {year}</h2>
					<button
						onClick={onClose}
						aria-label="Close"
						className="text-default-400 hover:text-default-700 text-xl leading-none"
					>
						×
					</button>
				</div>

				{/* Scrollable body */}
				<div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
					{/* Warnings */}
					{overBudget && (
						<Banner variant="error">
							Adding this item would exceed the annual budget by{" "}
							<strong>
								{new Intl.NumberFormat("en-PH", {
									style: "currency",
									currency: "PHP",
								}).format(currentTotal + cost - (annualBudget ?? 0))}
							</strong>
							.
						</Banner>
					)}
					{alreadyExists && (
						<Banner variant="warn">
							An item with this activity name already exists in{" "}
							<strong>{month}</strong>.
						</Banner>
					)}

					{/* Month picker — button group (one per month, abbreviated) */}
					<Field label="Month">
						<div className="flex flex-wrap gap-1">
							{MONTH_ORDER.map((m: any) => (
								<button
									key={m}
									type="button"
									onClick={() => setMonth(m)}
									className={pill(month === m)}
								>
									{m.slice(0, 3)}
								</button>
							))}
						</div>
					</Field>

					{/* Category picker — button group */}
					<Field label="Category">
						<div className="flex flex-wrap gap-1">
							{CATEGORY_ORDER.map((cat: any) => (
								<button
									key={cat}
									type="button"
									onClick={() =>
										setForm((f) => ({ ...f, expenditureType: cat }))
									}
									className={pill(form.expenditureType === cat, "primary")}
								>
									{cat}
								</button>
							))}
						</div>
					</Field>

					{/* Activity (required) */}
					<Field label="Activity / Programme *">
						<input
							className={inputCls}
							value={form.activity}
							onChange={setField("activity")}
							placeholder="e.g. Purchase of office supplies"
						/>
					</Field>

					{/* KRA + SIP program */}
					<div className="grid grid-cols-2 gap-3">
						<Field label="KRA">
							<input
								className={inputCls}
								value={form.kra}
								onChange={setField("kra")}
								placeholder="e.g. KRA 1"
							/>
						</Field>
						<Field label="SIP Program">
							<input
								className={inputCls}
								value={form.sipProgram}
								onChange={setField("sipProgram")}
								placeholder="e.g. ADM"
							/>
						</Field>
					</div>

					{/* Cost + Quantity */}
					<div className="grid grid-cols-2 gap-3">
						<Field label="Estimated Cost (₱) *">
							<input
								className={inputCls}
								type="number"
								min={0}
								step="0.01"
								value={form.estimatedCost}
								onChange={setField("estimatedCost")}
								placeholder="0.00"
							/>
						</Field>
						<Field label="Quantity">
							<input
								className={inputCls}
								value={form.quantity}
								onChange={setField("quantity")}
								placeholder="e.g. 5"
							/>
						</Field>
					</div>

					{/* Account title + code */}
					<div className="grid grid-cols-2 gap-3">
						<Field label="Account Title">
							<input
								className={inputCls}
								value={form.accountTitle}
								onChange={setField("accountTitle")}
							/>
						</Field>
						<Field label="Account Code">
							<input
								className={inputCls}
								value={form.accountCode}
								onChange={setField("accountCode")}
							/>
						</Field>
					</div>

					{/* Purpose */}
					<Field label="Purpose / Objectives">
						<textarea
							className={`${inputCls} resize-none`}
							rows={2}
							value={form.purpose}
							onChange={setField("purpose")}
						/>
					</Field>

					{/* Performance indicator */}
					<Field label="Performance Indicator">
						<input
							className={inputCls}
							value={form.indicator}
							onChange={setField("indicator")}
						/>
					</Field>

					{/* Error banner */}
					{error && <Banner variant="error">{error}</Banner>}
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-2 px-5 py-4 border-t border-default-100 shrink-0">
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm rounded-lg text-default-600 hover:bg-default-100 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={saving}
						className="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white disabled:opacity-50 hover:bg-primary/90 transition-colors"
					>
						{saving ? "Saving…" : "Add Item"}
					</button>
				</div>
			</div>
		</div>
	);
}

// ─── Micro-components / style helpers ─────────────────────────────────────────

const inputCls =
	"w-full border border-default-200 rounded-lg px-3 py-1.5 text-sm " +
	"focus:outline-none focus:border-primary transition-colors bg-background";

/** Returns pill-button Tailwind classes for a toggle group item. */
function pill(
	active: boolean,
	accent: "default" | "primary" = "default",
): string {
	const on =
		accent === "primary"
			? "bg-primary/10 text-primary border-primary/40"
			: "bg-primary text-white border-primary";
	const off = "border-default-200 text-default-500 hover:border-default-400";
	return `px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${active ? on : off}`;
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label className="text-xs font-medium text-default-500">{label}</label>
			{children}
		</div>
	);
}

function Banner({
	variant,
	children,
}: {
	variant: "error" | "warn";
	children: React.ReactNode;
}) {
	const cls =
		variant === "error"
			? "bg-red-50 border-red-200 text-red-700"
			: "bg-amber-50 border-amber-200 text-amber-700";
	return (
		<div
			className={`border rounded-lg px-3 py-2 text-sm flex gap-2 items-start ${cls}`}
		>
			<span className="shrink-0">{variant === "error" ? "⚠" : "ℹ"}</span>
			<span>{children}</span>
		</div>
	);
}
