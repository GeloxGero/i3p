// components/importModal.tsx
//
// Two-step import modal:
//   1. User selects a year (button group) and picks an Excel file
//   2. On submit, the file is parsed client-side and candidates are handed
//      back to the parent via onCandidatesReady — nothing is saved yet.
//
// WHY YEAR-FIRST?
// ───────────────
// The year chosen here becomes the authoritative year for every item parsed
// from the file.  Files sometimes contain an ambiguous or missing year in
// the title cell; making the user confirm it upfront prevents silent
// misclassification of items into the wrong plan.

import { useState, useRef } from "react";
import type { CandidateItemDto } from "../types";
import { MONTH_ORDER } from "../constants";

// ─── Template column layout (mirrors backend TemplateSections) ────────────────
// Each section starts at a 1-based Excel column number.
// Within a section the offsets are fixed (0 = KRA, 1 = SIP, … 7 = Cost, etc.)
const SECTIONS: { category: string; startCol: number }[] = [
	{ category: "Regular Expenditure", startCol: 1 },
	{ category: "Project Related Expenditure", startCol: 12 },
	{ category: "Repair and Maintenance", startCol: 23 },
	{ category: "Others", startCol: 34 },
];

const OFF_KRA = 0;
const OFF_SIP = 1;
const OFF_PPA = 2;
const OFF_PURPOSE = 3;
const OFF_PERF_IND = 4;
const OFF_RES_DESC = 5;
const OFF_QTY = 6;
const OFF_COST = 7;
const OFF_ACC_TITLE = 8;
const OFF_ACC_CODE = 9;

const DATA_START_ROW = 5; // first data row (1-based)

interface Props {
	currentYear: number;
	onCandidatesReady: (year: number, candidates: CandidateItemDto[]) => void;
	onClose: () => void;
}

export default function ImportModal({
	currentYear,
	onCandidatesReady,
	onClose,
}: Props) {
	// Offer the current year and the two previous years as quick-select buttons,
	// plus a manual text input for anything older.
	const quickYears = [currentYear, currentYear - 1, currentYear - 2];

	const [selectedYear, setSelectedYear] = useState<number>(currentYear);
	const [customYear, setCustomYear] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [parsing, setParsing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileRef = useRef<HTMLInputElement>(null);

	const effectiveYear = customYear ? Number(customYear) : selectedYear;

	// ─── Client-side Excel parsing ────────────────────────────────────────────
	// We parse the workbook in the browser using the SheetJS (xlsx) library that
	// is already bundled in the project.  This avoids a round-trip upload just to
	// check headers and turns the rows into CandidateItemDtos without touching the
	// database.
	//
	// WHY CLIENT-SIDE?
	// ─────────────────
	// Parsing on the client lets us show the duplicate-check UI immediately —
	// before any data is written — without a separate "preview" endpoint.  The
	// parsed candidates are then sent to POST /check-duplicates (read-only) and
	// only committed via POST /resolve-duplicates after the user approves.
	const parseFile = async (
		xlFile: File,
		year: number,
	): Promise<CandidateItemDto[]> => {
		// Dynamically import SheetJS so it doesn't bloat the initial bundle.
		const XLSX = await import("xlsx");
		const arrayBuffer = await xlFile.arrayBuffer();
		const workbook = XLSX.read(arrayBuffer, { type: "array" });

		const candidates: CandidateItemDto[] = [];

		for (const sheetName of workbook.SheetNames) {
			const normalised = sheetName.trim();
			const monthIndex = MONTH_ORDER.findIndex(
				(m) => m.toLowerCase() === normalised.toLowerCase(),
			);
			if (monthIndex === -1) continue; // not a month sheet

			const ws = workbook.Sheets[sheetName];
			const rows = XLSX.utils.sheet_to_json<string[]>(ws, {
				header: 1,
				defval: "",
			});

			// Validate headers on row 4 (index 3)
			const headerRow: string[] = (rows[3] as string[]) ?? [];
			const joined = headerRow.map((c) => String(c).toLowerCase()).join(" ");
			if (
				!joined.includes("key result area") ||
				!joined.includes("estimated")
			) {
				throw new Error(
					`Sheet "${sheetName}" does not match the official SIP template. ` +
						"Please use the template available via the Templates button.",
				);
			}

			const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;

			for (let r = DATA_START_ROW - 1; r < rows.length; r++) {
				const row = rows[r] as string[];

				for (const { category, startCol } of SECTIONS) {
					const col = startCol - 1; // convert to 0-based

					const kra = String(row[col + OFF_KRA] ?? "").trim();
					const ppa = String(row[col + OFF_PPA] ?? "").trim();

					if (!kra && !ppa) continue;
					if (kra.toUpperCase() === "NONE" || ppa.toUpperCase() === "NONE")
						continue;
					if (
						/sub-?total|total budget/i.test(ppa) ||
						/sub-?total|total budget/i.test(kra)
					)
						continue;

					const costRaw = String(row[col + OFF_COST] ?? "").replace(
						/[₱,\s]/g,
						"",
					);
					const cost = parseFloat(costRaw) || 0;
					const sip = String(row[col + OFF_SIP] ?? "").trim();

					if (!ppa && cost === 0) continue;

					candidates.push({
						date: dateStr,
						kra,
						sipProgram: sip || "Unimplemented",
						activity: ppa,
						purpose: String(row[col + OFF_PURPOSE] ?? "").trim() || null,
						indicator: String(row[col + OFF_PERF_IND] ?? "").trim() || null,
						resources: String(row[col + OFF_RES_DESC] ?? "").trim() || null,
						quantity: String(row[col + OFF_QTY] ?? "").trim() || null,
						estimatedCost: cost,
						accountTitle: String(row[col + OFF_ACC_TITLE] ?? "").trim() || null,
						accountCode: String(row[col + OFF_ACC_CODE] ?? "").trim() || null,
						expenditureType: category,
					});
				}
			}
		}

		return candidates;
	};

	const handleSubmit = async () => {
		if (!file) {
			setError("Please select a file.");
			return;
		}
		if (!effectiveYear || effectiveYear < 2000 || effectiveYear > 2100) {
			setError("Please enter a valid year (2000–2100).");
			return;
		}

		setError(null);
		setParsing(true);
		try {
			const candidates = await parseFile(file, effectiveYear);
			if (candidates.length === 0) {
				setError(
					"No data rows found. Make sure the file matches the official SIP template " +
						"and contains at least one data row.",
				);
				return;
			}
			onCandidatesReady(effectiveYear, candidates);
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Failed to parse file.");
		} finally {
			setParsing(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-background rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
				{/* Header */}
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">
						Import School Implementation Plan
					</h2>
					<button
						onClick={onClose}
						className="text-default-400 hover:text-default-700 text-xl leading-none"
					>
						×
					</button>
				</div>

				{/* Step 1 — Year selection (required before file) */}
				<div className="flex flex-col gap-2">
					<label className="text-sm font-medium text-default-700">
						Step 1 — Select the plan year
						<span className="text-red-500 ml-0.5">*</span>
					</label>
					<div className="flex gap-2 flex-wrap">
						{quickYears.map((y) => (
							<button
								key={y}
								type="button"
								onClick={() => {
									setSelectedYear(y);
									setCustomYear("");
								}}
								className={[
									"px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors",
									!customYear && selectedYear === y
										? "bg-primary text-white border-primary"
										: "border-default-200 hover:border-primary text-default-600",
								].join(" ")}
							>
								{y}
							</button>
						))}
					</div>
					<div className="flex items-center gap-2 mt-1">
						<span className="text-xs text-default-400">Other year:</span>
						<input
							type="number"
							placeholder="e.g. 2021"
							value={customYear}
							onChange={(e) => setCustomYear(e.target.value)}
							className="border border-default-200 rounded px-2 py-1 text-sm w-28 focus:outline-none focus:border-primary"
						/>
					</div>
				</div>

				{/* Step 2 — File picker */}
				<div className="flex flex-col gap-2">
					<label className="text-sm font-medium text-default-700">
						Step 2 — Choose an Excel file (.xlsx)
						<span className="text-red-500 ml-0.5">*</span>
					</label>
					<div
						onClick={() => fileRef.current?.click()}
						className="border-2 border-dashed border-default-200 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
					>
						{file ? (
							<p className="text-sm text-default-700 font-medium">
								{file.name}
							</p>
						) : (
							<p className="text-sm text-default-400">
								Click to browse, or drag & drop here
							</p>
						)}
					</div>
					<input
						ref={fileRef}
						type="file"
						accept=".xlsx,.xls"
						className="hidden"
						onChange={(e) => setFile(e.target.files?.[0] ?? null)}
					/>
				</div>

				{/* Error */}
				{error && (
					<p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">
						{error}
					</p>
				)}

				{/* Actions */}
				<div className="flex justify-end gap-2 pt-1">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded-lg text-sm text-default-600 hover:bg-default-100"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={parsing || !file}
						className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-white disabled:opacity-50 hover:bg-primary/90 transition-colors"
					>
						{parsing ? "Parsing…" : "Continue →"}
					</button>
				</div>
			</div>
		</div>
	);
}
