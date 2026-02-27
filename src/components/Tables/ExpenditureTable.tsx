import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Select,
	SelectItem,
	Spinner,
} from "@heroui/react";
import { $token } from "../../store/authStore";

export default function ExpenditureTable() {
	const token = useStore($token);
	const [report, setReport] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [selectedMonth, setSelectedMonth] = useState("January");

	useEffect(() => {
		const fetchExpenditure = async () => {
			try {
				// Adjust URL to your .NET Controller endpoint
				const res = await fetch("http://localhost:5109/api/ExpenditureData", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = await res.json();
				// Assuming the API returns a List, we take the first one or specific one
				setReport(data[0]);
				console.log(data);
				console.log("this");
				console.log(data[0]);
			} finally {
				setLoading(false);
			}
		};
		if (token) fetchExpenditure();
	}, [token]);

	if (loading) return <Spinner label="Loading Expenditure..." />;
	if (!report) return <div>No expenditure data found.</div>;

	// Logic to group items by Expense Class (e.g., MOOE, Personnel Services)
	const groupedData = Object.entries(
		report.items.reduce((acc: any, item: any) => {
			const key = item.expenseClass || "Uncategorized";
			if (!acc[key]) acc[key] = [];
			acc[key].push(item);
			return acc;
		}, {}),
	);

	const grandTotal = report.items.reduce(
		(sum: number, i: any) => sum + (i.totalCost || 0),
		0,
	);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between items-center mb-2">
				<h2 className="text-xl font-bold">{report.sheetName}</h2>
				<Select
					label="Month"
					className="max-w-[150px]"
					selectedKeys={[selectedMonth]}
					onSelectionChange={(keys) =>
						setSelectedMonth(Array.from(keys)[0] as string)
					}
				>
					<SelectItem key="January">January</SelectItem>
					<SelectItem key="February">February</SelectItem>
					{/* Add other months */}
				</Select>
			</div>

			<Table
				aria-label="Expenditure Table"
				classNames={{
					th: "bg-default-100 text-default-800 border border-divider text-[10px] uppercase text-center",
					td: "border border-divider text-[12px] py-2",
				}}
			>
				<TableHeader>
					<TableColumn>PROGRAM/ACTIVITY</TableColumn>
					<TableColumn>OUTPUT</TableColumn>
					<TableColumn>EXPENSE ITEM</TableColumn>
					<TableColumn>QTY</TableColumn>
					<TableColumn>UNIT COST</TableColumn>
					<TableColumn>TOTAL COST</TableColumn>
				</TableHeader>
				<TableBody>
					{groupedData.flatMap(([expenseClass, items]: any) => [
						// Section Header Row
						<TableRow key={`header-${expenseClass}`}>
							<TableCell
								colSpan={6}
								className="bg-primary-50 font-bold text-primary-700 uppercase text-center"
							>
								{expenseClass}
							</TableCell>
						</TableRow>,
						// Data Rows
						...items.map((item: any) => (
							<TableRow key={item.id}>
								<TableCell className="font-medium">
									{item.specificProgram}
								</TableCell>
								<TableCell>{item.output}</TableCell>
								<TableCell>{item.expenseItem}</TableCell>
								<TableCell className="text-center">{item.quantity}</TableCell>
								<TableCell className="text-right">
									₱{item.unitCost?.toLocaleString()}
								</TableCell>
								<TableCell className="text-right font-bold">
									₱{item.totalCost?.toLocaleString()}
								</TableCell>
							</TableRow>
						)),
					])}
				</TableBody>
			</Table>

			<div className="flex justify-between items-center bg-primary-900 text-white p-4 rounded-lg font-bold">
				<span>Total for {selectedMonth}</span>
				<span className="text-xl">
					₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
				</span>
			</div>
		</div>
	);
}
