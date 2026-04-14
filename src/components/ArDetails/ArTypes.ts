
export interface ArItem {
	id: number;
	arCode: string;
	date: string;
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
	isVerified: boolean;
	status: number;
}

export interface ListItem {
	id: number;
	description: string;
	quantity: number;
	unitCost: number;
	totalCost: number;
	createdAt: string;
}

export interface ArDetailResponse {
	item: ArItem;
	listItems: ListItem[];
	totalListCost: number;
	remainingBudget: number;
}