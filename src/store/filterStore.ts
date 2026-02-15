import { atom } from "nanostores";

export type FileFilter =
	| "Expenditure"
	| "Procurement"
	| "Annual-Plan"
	| "PPMP"
	| "School-Plan";
export const $fileFilter = atom<FileFilter>("School-Plan");

export const $filterOptions = [
	"Expenditure",
	"Procurement",
	"Annual-Plan",
	"PPMP",
	"School-Plan",
];
