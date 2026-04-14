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

import { apiRequest } from "../../../api/TokenService";

const BASE = "api/SchoolImplementation";

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Returns every yearly plan as a lightweight header (no items). */
export const fetchPlans = (
	token: string | null,
): Promise<SchoolImplementationHeaderDto[]> =>
	apiRequest(`${BASE}`, { method: "GET" }, token);

export const fetchPlanDetail = (
	id: number,
	token: string | null,
): Promise<SchoolImplementationDetailDto> =>
	apiRequest(`${BASE}/${id}`, { method: "GET" }, token);

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
	token: string | null,
): Promise<CheckDuplicatesResponse> =>
	apiRequest(
		`${BASE}/check-duplicates`,
		{
			method: "POST",
			body: JSON.stringify({ year, candidates }),
			headers: { "Content-Type": "application/json" },
		},
		token,
	);

/**
 * STEP 2 — commit with user-chosen resolutions.
 *
 * Sends the user's decisions (Merge / Keep / Delete) for duplicate pairs plus
 * the clean non-duplicate items that should be inserted directly.
 */
export const resolveDuplicates = (
	payload: ResolveDuplicatesRequest,
	token: string | null,
) =>
	apiRequest(
		`${BASE}/resolve-duplicates`,
		{
			method: "POST",
			body: JSON.stringify(payload),
			headers: { "Content-Type": "application/json" },
		},
		token,
	);

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
	token: string | null,
): Promise<{ candidates: CandidateItemDto[] }> => {
	const form = new FormData();
	form.append("file", file);
	form.append("year", String(year));

	// Note: Do NOT set Content-Type header for FormData; the browser needs to
	// set the boundary automatically.
	return apiRequest(
		`${BASE}/import-preview`,
		{
			method: "POST",
			body: form,
		},
		token,
	);
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const setBudget = (
	id: number,
	annualBudget: number | null,
	token: string | null,
): Promise<{ annualBudget: number | null }> =>
	apiRequest(
		`${BASE}/${id}/budget`,
		{
			method: "PUT",
			body: JSON.stringify({ annualBudget }),
			headers: { "Content-Type": "application/json" },
		},
		token,
	);

export const deleteItem = (
	itemId: number,
	token: string | null,
): Promise<{ message: string }> =>
	apiRequest(
		`${BASE}/item/${itemId}`,
		{
			method: "DELETE",
		},
		token,
	);

export const recalculate = (
	planId: number,
	token: string | null,
): Promise<{ newTotal: number }> =>
	apiRequest(
		`${BASE}/recalculate/${planId}`,
		{
			method: "POST",
		},
		token,
	);

//Remove in Prod
export const seedFakeLinks = (
	itemId: string,
	token: string | null,
): Promise<{ message: string }> =>
	apiRequest(
		`${BASE}/seed-fake-links/${itemId}`,
		{
			method: "POST",
		},
		token,
	);
