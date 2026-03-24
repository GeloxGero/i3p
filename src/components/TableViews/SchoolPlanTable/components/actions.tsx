// components/actions.tsx
//
// Toolbar row rendered above the month navigation.
// Contains: Import, Add Item, Recalculate, View-mode toggle, Column toggles.
//
// Column visibility is controlled by PILL BUTTONS (not a dropdown) so the user
// can see and toggle all columns at a glance without opening a menu.

import { useState } from "react";
import type { ViewMode, ColumnVisibility } from "../types";
import { COLUMN_LABELS } from "../constants";

interface Props {
	viewMode: ViewMode;
	onViewModeChange: (v: ViewMode) => void;
	columns: ColumnVisibility;
	onToggleColumn: (key: keyof ColumnVisibility) => void;
	onImport: () => void;
	onAddItem: () => void;
	onRecalculate: () => void;
}

export default function ActionsBar({
	viewMode,
	onViewModeChange,
	columns,
	onToggleColumn,
	onImport,
	onAddItem,
	onRecalculate,
}: Props) {
	const [showColumns, setShowColumns] = useState(false);

	return (
		<div className="flex flex-col gap-3">
			{/* ── Top row: primary actions + view toggle ─────────────────────── */}
			<div className="flex flex-wrap items-center gap-2">
				{/* Import */}
				<button
					onClick={onImport}
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
				>
					<UploadIcon />
					Import Excel
				</button>

				{/* Add item */}
				<button
					onClick={onAddItem}
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-default-200 hover:bg-default-100 transition-colors"
				>
					<PlusIcon />
					Add Item
				</button>

				{/* Recalculate */}
				<button
					onClick={onRecalculate}
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-default-600 border border-default-200 hover:bg-default-100 transition-colors"
				>
					<RefreshIcon />
					Recalculate
				</button>

				{/* Spacer */}
				<div className="flex-1" />

				{/* Column toggle trigger */}
				<button
					onClick={() => setShowColumns((v) => !v)}
					className={[
						"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors",
						showColumns
							? "bg-default-100 border-default-300 text-default-700"
							: "border-default-200 text-default-500 hover:bg-default-50",
					].join(" ")}
				>
					<ColumnsIcon />
					Columns
				</button>

				{/* View mode: Table / Card */}
				<div className="flex rounded-lg border border-default-200 overflow-hidden">
					{(["table", "card"] as ViewMode[]).map((mode) => (
						<button
							key={mode}
							onClick={() => onViewModeChange(mode)}
							className={[
								"px-3 py-1.5 text-sm capitalize transition-colors",
								viewMode === mode
									? "bg-primary text-white"
									: "text-default-500 hover:bg-default-100",
							].join(" ")}
						>
							{mode === "table" ? <TableIcon /> : <CardIcon />}
						</button>
					))}
				</div>
			</div>

			{/* ── Column visibility pill buttons ─────────────────────────────── */}
			{showColumns && (
				<div className="flex flex-wrap gap-1.5 p-3 bg-default-50 rounded-lg border border-default-100">
					{(Object.keys(COLUMN_LABELS) as (keyof ColumnVisibility)[]).map(
						(key) => (
							<button
								key={key}
								onClick={() => onToggleColumn(key)}
								className={[
									"px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
									columns[key]
										? "bg-primary/10 text-primary border-primary/30"
										: "bg-default-100 text-default-400 border-default-200 hover:border-default-400",
								].join(" ")}
							>
								{columns[key] ? "✓ " : ""}
								{COLUMN_LABELS[key]}
							</button>
						),
					)}
				</div>
			)}
		</div>
	);
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

const UploadIcon = () => (
	<svg
		width="14"
		height="14"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		viewBox="0 0 24 24"
	>
		<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
	</svg>
);

const PlusIcon = () => (
	<svg
		width="14"
		height="14"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		viewBox="0 0 24 24"
	>
		<path d="M12 5v14M5 12h14" />
	</svg>
);

const RefreshIcon = () => (
	<svg
		width="14"
		height="14"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		viewBox="0 0 24 24"
	>
		<path d="M4 4v5h.582M20 20v-5h-.582M4.582 9A8 8 0 0120 12M19.418 15A8 8 0 014 12" />
	</svg>
);

const ColumnsIcon = () => (
	<svg
		width="14"
		height="14"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		viewBox="0 0 24 24"
	>
		<rect x="3" y="3" width="7" height="18" rx="1" />
		<rect x="14" y="3" width="7" height="18" rx="1" />
	</svg>
);

const TableIcon = () => (
	<svg
		width="14"
		height="14"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		viewBox="0 0 24 24"
	>
		<rect x="3" y="3" width="18" height="18" rx="2" />
		<path d="M3 9h18M3 15h18M9 3v18" />
	</svg>
);

const CardIcon = () => (
	<svg
		width="14"
		height="14"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		viewBox="0 0 24 24"
	>
		<rect x="3" y="3" width="7" height="7" rx="1" />
		<rect x="14" y="3" width="7" height="7" rx="1" />
		<rect x="3" y="14" width="7" height="7" rx="1" />
		<rect x="14" y="14" width="7" height="7" rx="1" />
	</svg>
);
