import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Button,
	Select,
	SelectItem,
	Spinner,
} from "@heroui/react";
import { useEffect, useState, useRef } from "react";
import { $token } from "../../store/authStore";
import { useStore } from "@nanostores/react";

export default function AnnualPlanTable() {
	// 1. State for the list of available years
	const [planHeaders, setPlanHeaders] = useState<any[]>([]);
	// 2. State for the currently selected plan's full data
	const [selectedPlan, setSelectedPlan] = useState<any>(null);

	const [loadingHeaders, setLoadingHeaders] = useState(true);
	const [loadingItems, setLoadingItems] = useState(false);
	const [uploading, setUploading] = useState(false);

	const token = useStore($token);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Fetch only the list of years/plans (No items yet)
	const fetchPlanHeaders = async () => {
		try {
			const response = await fetch(
				"http://localhost:5109/api/AnnualProcurementPlan",
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const result = await response.json();
			setPlanHeaders(result);
		} finally {
			setLoadingHeaders(false);
		}
	};

	// Fetch full items only when a year is selected
	const fetchItemsForPlan = async (planId: string) => {
		setLoadingItems(true);
		try {
			const response = await fetch(
				`http://localhost:5109/api/AnnualProcurementPlan/${planId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const result = await response.json();
			setSelectedPlan(result);
		} finally {
			setLoadingItems(false);
		}
	};

	useEffect(() => {
		fetchPlanHeaders();
	}, [token]);

	// Handle Dropdown Change
	const handleSelectionChange = (keys: any) => {
		const selectedId = Array.from(keys)[0] as string;
		if (selectedId) {
			fetchItemsForPlan(selectedId);
		}
	};

	if (loadingHeaders) return <div>Loading available years...</div>;

	return (
		<div className="flex flex-col gap-8">
			<div className="flex justify-between items-center">
				{/* YEAR DROPDOWN */}
				<Select
					label="Select Annual Plan Year"
					className="max-w-xs"
					onSelectionChange={handleSelectionChange}
				>
					{planHeaders.map((plan) => (
						<SelectItem key={plan.id}>{plan.year}</SelectItem>
					))}
				</Select>

				<div className="flex gap-2">
					<input
						type="file"
						ref={fileInputRef}
						onChange={(e) => {
							/* Keep your existing handleFileImport logic here */
						}}
						accept=".csv, .xlsx"
						className="hidden"
					/>
					<Button color="primary" onPress={() => fileInputRef.current?.click()}>
						Import File
					</Button>
				</div>
			</div>

			{/* CONDITIONAL RENDERING */}
			{loadingItems ? (
				<div className="flex justify-center p-10">
					<Spinner label="Loading items..." />
				</div>
			) : selectedPlan ? (
				<div className="flex flex-col gap-2">
					<h2 className="text-2xl font-bold">Plan for {selectedPlan.year}</h2>

					<Table aria-label="Selected Plan Table">
						<TableHeader>
							<TableColumn>ITEM DESCRIPTION</TableColumn>
							<TableColumn>UNIT</TableColumn>
							<TableColumn>QTY</TableColumn>
							<TableColumn>PRICE</TableColumn>
							<TableColumn>TOTAL</TableColumn>
						</TableHeader>
						<TableBody emptyContent={"No items found."}>
							{(selectedPlan.items || []).map((item: any) => (
								<TableRow key={item.id}>
									<TableCell>{item.itemDescription}</TableCell>
									<TableCell>{item.unitOfMeasure}</TableCell>
									<TableCell>{item.totalQuantity}</TableCell>
									<TableCell>₱{item.price?.toLocaleString()}</TableCell>
									<TableCell className="font-bold text-primary">
										₱{item.totalAmount?.toLocaleString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			) : (
				<div className="text-gray-500 text-center p-10">
					Please select a year from the dropdown to view procurement items.
				</div>
			)}
		</div>
	);
}
