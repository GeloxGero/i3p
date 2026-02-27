import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Button, // Added Button
} from "@heroui/react";
import { useEffect, useState, useRef } from "react"; // Added useRef
import { $token } from "../../store/authStore";
import { useStore } from "@nanostores/react";

export default function AnnualPlanTable() {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const token = useStore($token);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const fetchData = async () => {
		try {
			const response = await fetch(
				"http://localhost:5109/api/AnnualProcurementPlan",
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const result = await response.json();

			setData(result);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [token]);

	const handleFileImport = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		setUploading(true);
		try {
			const response = await fetch(
				"http://localhost:5109/api/AnnualProcurementPlan/import",
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
					body: formData,
				},
			);

			if (response.ok) {
				alert("File imported successfully!");
				fetchData(); // Refresh table data
			} else {
				alert("Import failed.");
			}
		} catch (error) {
			console.error("Error uploading file:", error);
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
		}
	};

	if (loading) return <div>Loading Plan...</div>;

	return (
		<div className="flex flex-col gap-8">
			<div className="flex justify-end">
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileImport}
					accept=".csv, .xlsx"
					className="hidden"
				/>
				<Button
					color="primary"
					isLoading={uploading}
					onPress={() => fileInputRef.current?.click()}
				>
					{uploading ? "Importing..." : "Import File"}
				</Button>
			</div>

			{/* Map through each Plan to create a separate section/table for each */}
			{data.map((plan) => (
				<div key={plan.id} className="flex flex-col gap-2">
					<h2 className="text-xl font-bold px-2">
						{plan.sheetName || "Annual Plan"}
					</h2>

					<Table aria-label={`Table for ${plan.sheetName}`}>
						<TableHeader>
							<TableColumn>ITEM DESCRIPTION</TableColumn>
							<TableColumn>TOTAL QTY</TableColumn>
							<TableColumn>PRICE</TableColumn>
							<TableColumn>TOTAL AMOUNT</TableColumn>
						</TableHeader>
						<TableBody emptyContent={"No items found for this plan."}>
							{/* Map through the Items attached to this specific Plan */}
							{(plan.items || []).map((item: any) => (
								<TableRow key={item.id}>
									<TableCell>{item.itemDescription}</TableCell>
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
			))}
		</div>
	);
}
