import SchoolPlanTable from "./SchoolPlanTable";

interface SchoolPlanItem {
	id?: number;
	kraArea: string;
	specificProgram: string;
	programActivity: string;
	purpose: string;
	performanceIndicator: string;
	resourceDescription: string;
	quantity: number | string;
	estimatedCost: number;
	accountTitle: string;
	accountCode: string;
	category: string;
	arCode?: string | null;
	isVerified?: boolean;
	status?: "Implemented" | "Verified" | string | number;
}

type TableRowData = SchoolPlanItem & {
	_rowKey: string;
	_isSubtotal?: true;
	_subtotalValue?: number;
};

interface MonthSheet {
	month: string;
	hasSip: boolean;
	items: SchoolPlanItem[];
	subTotals: Record<string, number>;
	grandTotal: number;
}

interface SchoolPlanHeader {
	id: string;
	year: number;
	school: string;
	totalEstimatedCost: number;
	annualBudget: number | null;
}

interface SchoolPlan {
	id: string;
	year: number;
	school: string;
	annualBudget: number | null;
	months: MonthSheet[];
}

interface ColDef {
	uid: string;
	label: string;
	className?: string;
}

interface SectionDef {
	category: string;
	startCol: number;
}

export type {
	SchoolPlanItem,
	TableRowData,
	MonthSheet,
	SchoolPlanHeader,
	SchoolPlan,
	ColDef,
	SectionDef,
};
