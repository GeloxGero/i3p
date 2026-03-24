// api.ts — SchoolPlanTable
//
// All HTTP calls are isolated here so components never import `fetch` directly.
// This makes it trivial to swap the base-URL, add auth headers, or mock in tests
// without touching any React component.

import type {
	SchoolImplementationHeaderDto,
	SchoolImplementationDetailDto,
	CheckDuplicatesResponse,
	CandidateItemDto,
	ResolveDuplicatesRequest,
} from "./types";

const BASE = "/api/SchoolImplementation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Thin wrapper around fetch that:
 *  1. Attaches `Content-Type: application/json` on mutating requests.
 *  2. Throws a descriptive Error when the server returns a non-2xx status so
 *     callers can rely on try/catch instead of checking `res.ok` everywhere.
 */
async function http<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, {
		headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
		...init,
	});
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(text || `HTTP ${res.status}`);
	}
	return res.json() as Promise<T>;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Returns every yearly plan as a lightweight header (no items). */
export const fetchPlans = (): Promise<SchoolImplementationHeaderDto[]> =>
	http<SchoolImplementationHeaderDto[]>(BASE);

/** Returns one plan with all its items grouped by month. */
export const fetchPlanDetail = (
	id: number,
): Promise<SchoolImplementationDetailDto> =>
	http<SchoolImplementationDetailDto>(`${BASE}/${id}`);

// ─── Import flow ──────────────────────────────────────────────────────────────

/**
 * STEP 1 — dry-run duplicate check.
 *
 * Sends the parsed candidates and target year to the backend WITHOUT saving.
 * Returns { hasDuplicates, duplicates } so the UI can decide whether to show
 * the resolution modal or proceed straight to resolving with an empty list.
 */
export const checkDuplicates = (
	year: number,
	candidates: CandidateItemDto[],
): Promise<CheckDuplicatesResponse> =>
	http<CheckDuplicatesResponse>(`${BASE}/check-duplicates`, {
		method: "POST",
		body: JSON.stringify({ year, candidates }),
	});

/**
 * STEP 2 — commit with user-chosen resolutions.
 *
 * Sends the user's decisions (Merge / Keep / Delete) for duplicate pairs plus
 * the clean non-duplicate items that should be inserted directly.
 */
export const resolveDuplicates = (
	payload: ResolveDuplicatesRequest,
): Promise<{
	message: string;
	year: number;
	merged: number;
	kept: number;
	deleted: number;
	directInserted: number;
}> =>
	http(`${BASE}/resolve-duplicates`, {
		method: "POST",
		body: JSON.stringify(payload),
	});

/**
 * Upload a raw Excel file for parsing.
 *
 * NOTE: This endpoint now ONLY parses the file and returns candidates —
 * it does NOT save anything.  Saving happens through resolveDuplicates after
 * the user has reviewed any matches.
 *
 * The backend still accepts the file on the existing `/import` route so that
 * a future "preview before commit" flow is possible without a schema change.
 * For now the frontend ignores the 200-body and uses the returned item list
 * directly from the parsed Excel on the client side (see importModal logic).
 */
export const importExcel = (
	file: File,
	year: number,
): Promise<{ candidates: CandidateItemDto[] }> => {
	const form = new FormData();
	form.append("file", file);
	form.append("year", String(year));
	return fetch(`${BASE}/import-preview`, {
		method: "POST",
		body: form,
	}).then(async (res) => {
		if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
		return res.json();
	});
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const setBudget = (id: number, annualBudget: number | null) =>
	http<{ annualBudget: number | null }>(`${BASE}/${id}/budget`, {
		method: "PUT",
		body: JSON.stringify({ annualBudget }),
	});

export const deleteItem = (itemId: number) =>
	http<{ message: string }>(`${BASE}/item/${itemId}`, { method: "DELETE" });

export const recalculate = (planId: number) =>
	http<{ newTotal: number }>(`${BASE}/recalculate/${planId}`, {
		method: "POST",
	});
