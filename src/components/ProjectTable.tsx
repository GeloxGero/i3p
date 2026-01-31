import React, { useMemo, useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Skeleton,
	Select,
	SelectItem,
} from "@heroui/react";
import { $token } from "../store/authStore";

const columns = [
	{ name: "Key Result Area based on OPCRF", uid: "key_result_area" },
	{ name: "Programs/Projects/Activities", uid: "programs_projects_activities" },
	{ name: "Purpose / Objectives", uid: "objectives" },
	{ name: "Performance Indicator", uid: "performance_indicator" },
	{ name: "Description", uid: "description" },
	{ name: "Quantity", uid: "quantity" },
	{ name: "Estimated Cost", uid: "estimated_cost" },
	{ name: "Account Title", uid: "account_title" },
	{ name: "Account Code", uid: "account_code" },
];

const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export default function ProjectTable() {
	const token = useStore($token);
	const [mounted, setMounted] = useState(false);
	const [data, setData] = useState<any[]>([]);
	const [selectedMonth, setSelectedMonth] = useState<string>("January");

	useEffect(() => {
		setMounted(true);
		const loadExpenses = async () => {
			try {
				const response = await fetch(
					"http://localhost:5109/api/expenses/GetSummaries",
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				if (response.ok) {
					const result = await response.json();
					setData(result);
				}
			} catch (error) {
				console.error("Error loading expenses:", error);
			}
		};
		if (mounted) loadExpenses();
	}, [mounted, token]);

	// Grouping logic based on Expense Type
	const groupedData = useMemo(() => {
		// Here you would normally filter by month property if your API returns it
		// For now, we group the existing data by expense_type
		const groups: Record<string, any[]> = {};

		data.forEach((item) => {
			const type = item.expense_type || "Regular Expenditure";
			if (!groups[type]) groups[type] = [];
			groups[type].push(item);
		});
		return Object.entries(groups);
	}, [data, selectedMonth]);

	if (!mounted) return <Skeleton className="h-96 w-full rounded-xl" />;

	const grandTotal = data.reduce(
		(sum, item) => sum + (item.estimated_cost || 0),
		0,
	);

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex justify-between items-center mb-2">
				<h2 className="text-xl font-bold">Expenditure Ledger</h2>
				<Select
					label="Select Month"
					className="max-w-xs"
					selectedKeys={[selectedMonth]}
					onChange={(e) => setSelectedMonth(e.target.value)}
				>
					{months.map((m) => (
						<SelectItem key={m}>{m}</SelectItem>
					))}
				</Select>
			</div>

			<Table
				aria-label="Monthly Expenditure Table"
				removeWrapper
				classNames={{
					th: "bg-white text-black border border-slate-300 text-[10px] uppercase text-center font-bold px-1",
					td: "border border-slate-300 text-[11px] p-2",
					table: "border-collapse border border-slate-400",
				}}
			>
				<TableHeader columns={columns}>
					{(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
				</TableHeader>
				<TableBody>
					{groupedData.flatMap(([type, items]) => [
						// 1. Section Header: ONLY one cell with colSpan={9}
						<TableRow key={`header-${type}`}>
							<TableCell
								colSpan={9}
								className="bg-danger-200 font-bold text-danger-800 text-center uppercase"
							>
								{type}
							</TableCell>
						</TableRow>,

						// 2. Data Rows (no changes needed here)
						...items.map((item) => (
							<TableRow
								key={item.id}
								className={
									item.key_result_area?.includes("KRA 2") ? "bg-yellow-100" : ""
								}
							>
								<TableCell className="font-bold">
									{item.key_result_area}
								</TableCell>
								<TableCell>{item.programs_projects_activities}</TableCell>
								<TableCell className="italic">{item.objectives}</TableCell>
								<TableCell>{item.performance_indicator}</TableCell>
								<TableCell>{item.description}</TableCell>
								<TableCell className="text-center">{item.quantity}</TableCell>
								<TableCell className="text-right font-mono">
									₱
									{item.estimated_cost?.toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</TableCell>
								<TableCell>{item.account_title}</TableCell>
								<TableCell className="font-mono text-[10px]">
									{item.account_code}
								</TableCell>
							</TableRow>
						)),

						// 3. Subtotal Row: Two cells total (6 + 3 = 9 columns)
						<TableRow key={`subtotal-${type}`}>
							<TableCell
								colSpan={6}
								className="bg-blue-100 font-bold text-right px-4 italic text-tiny"
							>
								Subtotal
							</TableCell>
							<TableCell
								colSpan={3}
								className="bg-blue-100 font-bold text-left font-mono"
							>
								₱
								{items
									.reduce((s, i) => s + (i.estimated_cost || 0), 0)
									.toLocaleString(undefined, { minimumFractionDigits: 2 })}
							</TableCell>
						</TableRow>,
					])}
				</TableBody>
			</Table>

			{/* Grand Total Footer matching the image */}
			<div className="flex justify-between items-center bg-[#1a365d] text-white p-2 text-sm font-bold">
				<span>Total budget for the Month of {selectedMonth} 2026</span>
				<span>
					₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
				</span>
			</div>
		</div>
	);
}
