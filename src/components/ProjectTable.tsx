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
