import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $token } from "../store/authStore";
import { $fileFilter } from "../store/filterStore";
import AnnualPlanTable from "./Tables/AnnualPlanTable";
import SchoolPlanTable from "./Tables/SchoolPlanTable";

export default function ProjectTable() {
	const filter = useStore($fileFilter);
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	const tableMap: Record<string, React.ComponentType<any>> = {
		"Item Procurement List": AnnualPlanTable,
		"General Expenditure Summary": SchoolPlanTable,
	};
	const SelectedTable = tableMap[filter] ?? SchoolPlanTable;

	if (!mounted) return <div className="p-4 opacity-0">Loading...</div>;

	return (
		// px-3 sm:px-6 gives tight gutters on phones, more room on tablets
		<div className="px-3 sm:px-6 py-4 pb-2">
			<h1 className="text-xl sm:text-2xl font-bold mb-4">{filter}</h1>
			<SelectedTable />
		</div>
	);
}
