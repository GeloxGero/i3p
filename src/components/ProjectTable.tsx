import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { Tabs, Tab } from "@heroui/react"; // Import HeroUI Tabs
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

	// Handler to update the Nano Store when a mobile tab is clicked
	const handleFilterChange = (key: React.Key) => {
		$fileFilter.set(key as string);
	};

	return (
		<div className="px-3 sm:px-6 py-4 pb-2">
			<div className="flex flex-col gap-3 mb-4">
				{/* Title */}
				<h1 className="text-xl sm:text-2xl font-bold">{filter}</h1>

				{/* Mobile Filter Controls (Hidden on md and up) */}
				<div className="md:hidden w-full">
					<Tabs
						selectedKey={filter}
						onSelectionChange={handleFilterChange}
						aria-label="Table View Selection"
						fullWidth
						size="md"
						color="primary"
					>
						<Tab key="General Expenditure Summary" title="School Plan" />
						<Tab key="Item Procurement List" title="Annual Plan" />
					</Tabs>
				</div>
			</div>

			<SelectedTable />
		</div>
	);
}
