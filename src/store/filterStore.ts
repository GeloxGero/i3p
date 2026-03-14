// src/store/filterStore.ts
// ─────────────────────────────────────────────────────────────────────────────
// To show/hide a filter option in both the Sidebar and ProjectTable,
// simply comment or uncomment entries in NAV_ITEMS below.
// ─────────────────────────────────────────────────────────────────────────────

import { atom } from "nanostores";

export const NAV_ITEMS = [
	{ key: "General Expenditure Summary", label: "General Expenditure Summary" },
	{ key: "Item Procurement List", label: "Detailed Expenditure List" },
	// { key: "Expenditure",              label: "Expenditure"               },
	// { key: "PPMP",                     label: "PPMP"                      },
	// { key: "Procurement",              label: "Procurement"               },
] as const;

export type FilterKey = (typeof NAV_ITEMS)[number]["key"];

// The keys array is what the Sidebar iterates over for its filter list
export const $filterOptions: readonly string[] = NAV_ITEMS.map((n) => n.key);

// Active filter atom — defaults to the first enabled item
export const $fileFilter = atom<string>(NAV_ITEMS[0].key);
