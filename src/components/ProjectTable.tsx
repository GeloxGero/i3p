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
import { $fileFilter } from "../store/filterStore";
import AnnualPlanTable from "./Tables/AnnualPlanTable";
import ExpenditureTable from "./Tables/ExpenditureTable";
import PPMPTable from "./Tables/PPMPTable";
import ProcurementTable from "./Tables/ProcurementTable";
import SchoolPlanTable from "./Tables/SchoolPlanTable";

export default function ProjectTable() {
	const filter = useStore($fileFilter);
	const [mounted, setMounted] = useState(false);

	// This only runs in the browser
	useEffect(() => {
		setMounted(true);
	}, []);

	const tableMap: Record<string, React.ComponentType<any>> = {
		"Annual-Plan": AnnualPlanTable,
		Expenditure: ExpenditureTable,
		PPMP: PPMPTable,
		Procurement: ProcurementTable,
		"School-Plan": SchoolPlanTable,
	};

	const SelectedTable = tableMap[filter] || SchoolPlanTable;

	// Prevent mismatch by returning a placeholder or null during SSR
	if (!mounted) {
		return <div className="p-6 opacity-0">Loading...</div>;
	}

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">{filter.replace("-", " ")}</h1>
			<SelectedTable />
		</div>
	);
}

// <div className="flex flex-col gap-4 p-4">
// 			<div className="flex justify-between items-center mb-2">
// 				<h2 className="text-xl font-bold">Expenditure Ledger</h2>
// 				<Select
// 					label="Select Month"
// 					className="max-w-xs"
// 					selectedKeys={[selectedMonth]}
// 					onChange={(e) => setSelectedMonth(e.target.value)}
// 				>
// 					{months.map((m) => (
// 						<SelectItem key={m}>{m}</SelectItem>
// 					))}
// 				</Select>
// 			</div>

// 			<Table
// 				aria-label="Monthly Expenditure Table"
// 				removeWrapper
// 				classNames={{
// 					th: "bg-white text-black border border-slate-300 text-[10px] uppercase text-center font-bold px-1",
// 					td: "border border-slate-300 text-[11px] p-2",
// 					table: "border-collapse border border-slate-400",
// 				}}
// 			>
// 				<TableHeader columns={columns}>
// 					{(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
// 				</TableHeader>
// 				<TableBody>
// 					{groupedData.flatMap(([type, items]) => [
// 						// 1. Section Header: ONLY one cell with colSpan={9}
// 						<TableRow key={`header-${type}`}>
// 							<TableCell
// 								colSpan={9}
// 								className="bg-danger-200 font-bold text-danger-800 text-center uppercase"
// 							>
// 								{type}
// 							</TableCell>
// 						</TableRow>,

// 						// 2. Data Rows (no changes needed here)
// 						...items.map((item) => (
// 							<TableRow
// 								key={item.id}
// 								className={
// 									item.key_result_area?.includes("KRA 2") ? "bg-yellow-100" : ""
// 								}
// 							>
// 								<TableCell className="font-bold">
// 									{item.key_result_area}
// 								</TableCell>
// 								<TableCell>{item.programs_projects_activities}</TableCell>
// 								<TableCell className="italic">{item.objectives}</TableCell>
// 								<TableCell>{item.performance_indicator}</TableCell>
// 								<TableCell>{item.description}</TableCell>
// 								<TableCell className="text-center">{item.quantity}</TableCell>
// 								<TableCell className="text-right font-mono">
// 									₱
// 									{item.estimated_cost?.toLocaleString(undefined, {
// 										minimumFractionDigits: 2,
// 									})}
// 								</TableCell>
// 								<TableCell>{item.account_title}</TableCell>
// 								<TableCell className="font-mono text-[10px]">
// 									{item.account_code}
// 								</TableCell>
// 							</TableRow>
// 						)),

// 						// 3. Subtotal Row: Two cells total (6 + 3 = 9 columns)
// 						<TableRow key={`subtotal-${type}`}>
// 							<TableCell
// 								colSpan={6}
// 								className="bg-blue-100 font-bold text-right px-4 italic text-tiny"
// 							>
// 								Subtotal
// 							</TableCell>
// 							<TableCell
// 								colSpan={3}
// 								className="bg-blue-100 font-bold text-left font-mono"
// 							>
// 								₱
// 								{items
// 									.reduce((s, i) => s + (i.estimated_cost || 0), 0)
// 									.toLocaleString(undefined, { minimumFractionDigits: 2 })}
// 							</TableCell>
// 						</TableRow>,
// 					])}
// 				</TableBody>
// 			</Table>

// 			{/* Grand Total Footer matching the image */}
// 			<div className="flex justify-between items-center bg-[#1a365d] text-white p-2 text-sm font-bold">
// 				<span>Total budget for the Month of {selectedMonth} 2026</span>
// 				<span>
// 					₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
// 				</span>
// 			</div>
// 		</div>
