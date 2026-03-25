// src/components/ProjectsPage.tsx
//
// Top-level React component rendered at /projects.
//
// LAYOUT (top → bottom)
// ──────────────────────
//   1. Page header + Download Template button
//   2. Year selector  (button group, current year highlighted by default)
//   3. Import button  (opens ImportModal → DuplicateResolver → commit)
//   4. Month tabs     (Total | Jan | Feb | … — only months with data)
//   5. Table / Card view  (with skeletal loading)
//   6. Toast notifications
//
// STATE POLICY
// ────────────
// All domain state (plans, detail, loading flags) lives here.
// Child components receive props + callbacks only — they never fetch.
// All useEffect hooks are in this file.

import { useState, useEffect, useMemo, useCallback } from "react";
import SchoolPlanTable from "./TableViews/SchoolPlanTable/SchoolPlanTable";
import Toast from "./Toast";
import TemplateModal from "./TableViews/SchoolPlanTable/components/TemplateModal";

// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
	const [templateModalOpen, setTemplateModalOpen] = useState(false);
	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);

	const showToast = useCallback(
		(message: string, type: "success" | "error" = "success") => {
			setToast({ message, type });
			setTimeout(() => setToast(null), 4000);
		},
		[],
	);

	return (
		<div className="flex flex-col gap-0 min-h-screen bg-background">
			{/* ── Page header ─────────────────────────────────────────────── */}
			<div className="flex items-center justify-between px-6 py-4 border-b border-default-100">
				<div>
					<h1 className="text-xl font-bold text-default-900">
						School Implementation Plans
					</h1>
					<p className="text-sm text-default-400 mt-0.5">
						Manage, import, and track implementation items by year and month.
					</p>
				</div>

				{/* Download Template */}
				<button
					onClick={() => setTemplateModalOpen(true)}
					className="flex items-center gap-2 px-4 py-2 rounded-lg border border-default-200 text-sm text-default-600 hover:bg-default-50 transition-colors"
				>
					<DownloadIcon />
					Download Template
				</button>
			</div>

			{/* ── Main table (owns all year/month/import state) ────────────── */}
			<div className="flex-1 px-6 py-4">
				<SchoolPlanTable onToast={showToast} />
			</div>

			{/* ── Template download modal ──────────────────────────────────── */}
			{templateModalOpen && (
				<TemplateModal onClose={() => setTemplateModalOpen(false)} />
			)}

			{/* ── Toast ───────────────────────────────────────────────────── */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
		</div>
	);
}

const DownloadIcon = () => (
	<svg
		width="15"
		height="15"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		viewBox="0 0 24 24"
	>
		<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
	</svg>
);
