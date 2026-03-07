import React, { useEffect, useState, useMemo } from "react";
import { useStore } from "@nanostores/react";
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Spinner,
	ScrollShadow,
	Select,
	SelectItem,
} from "@heroui/react";
import { $token } from "../../store/authStore";

const MONTHS = [
	{ key: "All", label: "All Months" },
	{ key: "1", label: "January" },
	{ key: "2", label: "February" },
	{ key: "3", label: "March" },
	{ key: "4", label: "April" },
	{ key: "5", label: "May" },
	{ key: "6", label: "June" },
	{ key: "7", label: "July" },
	{ key: "8", label: "August" },
	{ key: "9", label: "September" },
	{ key: "10", label: "October" },
	{ key: "11", label: "November" },
	{ key: "12", label: "December" },
];

export default function SchoolPlanTable() {
	const token = useStore($token);
	const [allPlans, setAllPlans] = useState<any[]>([]); // Store ALL plans from API
	const [loading, setLoading] = useState(true);

	// Filter states
	const [selectedYear, setSelectedYear] = useState("");
	const [selectedMonth, setSelectedMonth] = useState("All");

	useEffect(() => {
		const fetchPlan = async () => {
			try {
				const res = await fetch(
					"http://localhost:5109/api/SchoolImplementation",
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				const data = await res.json();
				const plansArray = Array.isArray(data) ? data : [data];

				setAllPlans(plansArray);

				// Default to the most recent year if data exists
				if (plansArray.length > 0) {
					setSelectedYear(plansArray[0].year.toString());
				}
			} catch (err) {
				console.error("Fetch error:", err);
			} finally {
				setLoading(false);
			}
		};
		if (token) fetchPlan();
	}, [token]);

	// 1. Get the plan for the selected year and filter its items by month
	const filteredPlan = useMemo(() => {
		if (!allPlans.length || !selectedYear) return null;

		// Find the specific year's plan
		const planForYear = allPlans.find(
			(p) => p.year.toString() === selectedYear,
		);
		if (!planForYear) return null;

		// If "All Months" is selected, return the whole plan
		if (selectedMonth === "All") return planForYear;

		// Otherwise, filter the child items based on their Date string
		const filteredItems = planForYear.items.filter((item: any) => {
			if (!item.date) return false;
			const dateObj = new Date(item.date);
			const itemMonth = (dateObj.getMonth() + 1).toString(); // JS months are 0-indexed
			return itemMonth === selectedMonth;
		});

		// Return a temporary plan object with the filtered items
		return {
			...planForYear,
			items: filteredItems,
		};
	}, [allPlans, selectedYear, selectedMonth]);

	// 2. Group the filtered items by KRA
	const groupedData = useMemo(() => {
		if (!filteredPlan?.items) return [];
		const groups = filteredPlan.items.reduce((acc: any, item: any) => {
			const key = item.expenditureType || "Unassigned Expense Type";
			if (!acc[key]) acc[key] = [];
			acc[key].push(item);
			return acc;
		}, {});
		return Object.entries(groups);
	}, [filteredPlan]);

	if (loading)
		return <Spinner label="Loading School Plan..." className="m-10" />;

	if (allPlans.length === 0)
		return (
			<div className="p-10 text-default-400">No implementation data found.</div>
		);

	// Calculate total dynamically based on filtered items
	const grandTotal =
		filteredPlan?.items.reduce(
			(sum: number, i: any) => sum + (i.estimatedCost || 0),
			0,
		) || 0;

	return (
		<div className="flex flex-col gap-4">
			{/* Header & Filters */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-default-50 rounded-xl border border-divider gap-4">
				<div>
					<h2 className="text-xl font-bold text-primary-700">
						{filteredPlan?.sheetName || "Implementation Plan"}
					</h2>
					<p className="text-tiny text-default-500 uppercase tracking-tighter">
						School Implementation Plan Ledger
					</p>
				</div>

				<div className="flex items-center gap-3">
					<Select
						label="Year"
						size="sm"
						className="w-32"
						selectedKeys={selectedYear ? [selectedYear] : []}
						onChange={(e) => setSelectedYear(e.target.value)}
					>
						{allPlans.map((p: any) => (
							<SelectItem key={p.year.toString()}>
								{p.year.toString()}
							</SelectItem>
						))}
					</Select>

					<Select
						label="Month"
						size="sm"
						className="w-40"
						selectedKeys={[selectedMonth]}
						onChange={(e) => setSelectedMonth(e.target.value)}
					>
						{MONTHS.map((m) => (
							<SelectItem key={m.key}>{m.label}</SelectItem>
						))}
					</Select>

					<div className="text-right ml-4">
						<p className="text-tiny text-default-400">Total Filtered Cost</p>
						<p className="text-xl font-mono font-bold">
							₱
							{grandTotal.toLocaleString(undefined, {
								minimumFractionDigits: 2,
							})}
						</p>
					</div>
				</div>
			</div>

			{/* Table Area */}
			{filteredPlan?.items.length === 0 ? (
				<div className="p-10 text-center text-default-400 border border-dashed border-divider rounded-xl">
					No activities found for the selected month.
				</div>
			) : (
				<ScrollShadow className="h-[70vh]">
					<Table
						aria-label="School Implementation Table"
						isHeaderSticky
						removeWrapper
						classNames={{
							th: "bg-default-100 text-[10px] uppercase py-3 border-divider",
							td: "text-[12px] border-b border-divider/50",
						}}
					>
						<TableHeader>
							<TableColumn>PROGRAM/ACTIVITY</TableColumn>
							<TableColumn>DATE</TableColumn>
							<TableColumn>INDICATOR</TableColumn>
							<TableColumn>ACCOUNT TITLE</TableColumn>
							<TableColumn>PURPOSE</TableColumn>
							<TableColumn align="center">QTY</TableColumn>
							<TableColumn align="end">EST. COST</TableColumn>
							<TableColumn>ACCOUNT CODE</TableColumn>
						</TableHeader>
						<TableBody>
							{groupedData.flatMap(([expType, items]: any) => [
								// 1. KRA Section Header
								<TableRow key={`header-${expType}`}>
									<TableCell colSpan={8} className="bg-danger-50 py-1">
										<span className="text-danger-700 font-bold text-[11px] uppercase">
											{expType}
										</span>
									</TableCell>
								</TableRow>,

								// 2. Individual Item Rows
								...items.map((item: any) => (
									<TableRow key={item.id} className="hover:bg-default-50/50">
										<TableCell>
											<div className="flex flex-col">
												<span className="font-bold text-default-700">
													{item.sipProgram}
												</span>
												<span className="text-default-500 italic">
													{item.accountTitle}
												</span>
												{/* Optional: Add KRA here since it's no longer the header */}
												<span className="text-[10px] text-default-400">
													{item.kra}
												</span>
											</div>
										</TableCell>
										<TableCell className="text-default-500">
											{item.date
												? new Date(item.date).toLocaleDateString()
												: "N/A"}
										</TableCell>
										<TableCell className="max-w-[200px] text-default-500">
											{item.indicator}
										</TableCell>
										<TableCell>{item.accountTitle}</TableCell>
										<TableCell>{item.purpose}</TableCell>
										<TableCell>{item.quantity}</TableCell>
										<TableCell className="font-mono font-semibold">
											₱
											{item.estimatedCost?.toLocaleString(undefined, {
												minimumFractionDigits: 2,
											})}
										</TableCell>
										<TableCell className="text-tiny font-mono text-default-400">
											{item.accountCode}
										</TableCell>
									</TableRow>
								)),

								// 3. Subtotal for this Expenditure Type
								<TableRow key={`subtotal-${expType}`}>
									<TableCell
										colSpan={7}
										className="text-right text-tiny italic text-default-400 bg-default-50/30"
									>
										Subtotal for {expType}
									</TableCell>
									<TableCell className="bg-default-50/30 font-bold border-t-2 border-divider">
										₱
										{items
											.reduce(
												(s: number, i: any) => s + (i.estimatedCost || 0),
												0,
											)
											.toLocaleString(undefined, { minimumFractionDigits: 2 })}
									</TableCell>
								</TableRow>,
							])}
						</TableBody>
					</Table>
				</ScrollShadow>
			)}
		</div>
	);
}
