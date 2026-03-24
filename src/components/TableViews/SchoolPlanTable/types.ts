// types.ts — SchoolPlanTable
// All domain types are co-located here so every other file imports from one
// place instead of re-declaring shapes in multiple components.

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum SipStatus {
	Implemented = 0,
	Approved = 1,
}

export type ExpenditureCategory =
	| "Regular Expenditure"
	| "Project Related Expenditure"
	| "Repair and Maintenance"
	| "Others";

// ─── API response shapes (mirrors backend DTOs) ───────────────────────────────

export interface SchoolPlanItemDto {
	id: number;
	kraArea: string;
	specificProgram: string;
	programActivity: string;
	purpose: string;
	performanceIndicator: string;
	resourceDescription: string;
	quantity: string;
	estimatedCost: number;
	accountTitle: string;
	accountCode: string;
	category: ExpenditureCategory;
	arCode: string | null;
	isVerified: boolean;
	status: SipStatus;
}

export interface MonthSheetDto {
	month: string;
	hasSip: boolean;
	items: SchoolPlanItemDto[];
	subTotals: Record<string, number>;
	grandTotal: number;
}

export interface SchoolImplementationDetailDto {
	id: number;
	year: number;
	school: string;
	totalEstimatedCost: number;
	annualBudget: number | null;
	months: MonthSheetDto[];
}

export interface SchoolImplementationHeaderDto {
	id: number;
	year: number;
	school: string;
	totalEstimatedCost: number;
	annualBudget: number | null;
}

// ─── Duplicate-check types ────────────────────────────────────────────────────

/** A single parsed item that has NOT been saved yet. */
export interface CandidateItemDto {
	date: string; // "yyyy-MM-dd"
	kra: string;
	sipProgram: string;
	activity: string;
	purpose: string | null;
	indicator: string | null;
	resources: string | null;
	quantity: string | null;
	estimatedCost: number;
	accountTitle: string | null;
	accountCode: string | null;
	expenditureType: string;
}

export interface DuplicatePairDto {
	incoming: CandidateItemDto;
	existing: SchoolPlanItemDto;
}

export interface CheckDuplicatesResponse {
	hasDuplicates: boolean;
	duplicates: DuplicatePairDto[];
}

export type DuplicateAction = "Merge" | "Keep" | "Delete";

export interface DuplicateResolutionDto {
	existingItemId: number;
	incoming: CandidateItemDto;
	action: DuplicateAction;
}

export interface ResolveDuplicatesRequest {
	year: number;
	resolutions: DuplicateResolutionDto[];
	nonDuplicates: CandidateItemDto[];
}

// ─── Local UI state types ─────────────────────────────────────────────────────

export type ViewMode = "table" | "card";

export interface ColumnVisibility {
	kraArea: boolean;
	specificProgram: boolean;
	programActivity: boolean;
	purpose: boolean;
	performanceIndicator: boolean;
	resourceDescription: boolean;
	quantity: boolean;
	estimatedCost: boolean;
	accountTitle: boolean;
	accountCode: boolean;
	category: boolean;
	arCode: boolean;
	status: boolean;
}
