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
	Divider,
} from "@heroui/react";
import { $token } from "../../store/authStore";

export default function SchoolPlanTable() {
	const token = useStore($token);
	const [plan, setPlan] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPlan = async () => {
			try {
				// Fetching the first available plan for the view
				const res = await fetch(
					"http://localhost:5109/api/SchoolImplementation",
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				const data = await res.json();
				// If the API returns a list, we'll take the first one or fetch detail
				setPlan(Array.isArray(data) ? data[0] : data);
			} catch (err) {
				console.error("Fetch error:", err);
			} finally {
				setLoading(false);
			}
		};
		if (token) fetchPlan();
	}, [token]);

	// Group items by KRA for the sectioned view
	const groupedData = useMemo(() => {
		if (!plan?.items) return [];
		const groups = plan.items.reduce((acc: any, item: any) => {
			const key = item.kra || "Unassigned KRA";
			if (!acc[key]) acc[key] = [];
			acc[key].push(item);
			return acc;
		}, {});
		return Object.entries(groups);
	}, [plan]);

	if (loading)
		return <Spinner label="Loading School Plan..." className="m-10" />;
	if (!plan)
		return (
			<div className="p-10 text-default-400">No implementation data found.</div>
		);

	const grandTotal = plan.items.reduce(
		(sum: number, i: any) => sum + (i.estimatedCost || 0),
		0,
	);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between items-center p-4 bg-default-50 rounded-xl border border-divider">
				<div>
					<h2 className="text-xl font-bold text-primary-700">
						{plan.sheetName}
					</h2>
					<p className="text-tiny text-default-500 uppercase tracking-tighter">
						School Implementation Plan Ledger
					</p>
				</div>
				<div className="text-right">
					<p className="text-tiny text-default-400">
						Total Implementation Cost
					</p>
					<p className="text-xl font-mono font-bold">
						₱{grandTotal.toLocaleString()}
					</p>
				</div>
			</div>

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
						<TableColumn>INDICATOR</TableColumn>
						<TableColumn align="center">QTY</TableColumn>
						<TableColumn align="end">EST. COST</TableColumn>
						<TableColumn>ACCOUNT CODE</TableColumn>
					</TableHeader>
					<TableBody>
						{groupedData.flatMap(([kra, items]: any) => [
							// 1. KRA Section Header
							<TableRow key={`header-${kra}`}>
								<TableCell colSpan={5} className="bg-danger-50 py-1">
									<span className="text-danger-700 font-bold text-[11px] uppercase">
										{kra}
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
												{item.activity}
											</span>
										</div>
									</TableCell>
									<TableCell className="max-w-[200px] text-default-500">
										{item.indicator}
									</TableCell>
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

							// 3. Subtotal for this KRA
							<TableRow key={`subtotal-${kra}`}>
								<TableCell
									colSpan={3}
									className="text-right text-tiny italic text-default-400 bg-default-50/30"
								>
									Subtotal for {kra}
								</TableCell>
								<TableCell className="bg-default-50/30 font-bold border-t-2 border-divider">
									₱
									{items
										.reduce(
											(s: number, i: any) => s + (i.estimatedCost || 0),
											0,
										)
										.toLocaleString()}
								</TableCell>
								<TableCell className="bg-default-50/30">asf</TableCell>
							</TableRow>,
						])}
					</TableBody>
				</Table>
			</ScrollShadow>
		</div>
	);
}
