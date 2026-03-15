import { atom } from "nanostores";

export type ExpenseClass = "All" | "MOOE" | "PS" | "CO";
export const $expenseFilter = atom<ExpenseClass>("All");

export const $currentArCode = atom<string | null>(null);
