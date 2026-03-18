import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Spinner,
	Chip,
	ScrollShadow,
} from "@heroui/react";
import { $token } from "../../store/authStore";

export default function ProcurementTable() {
	const token = useStore($token);
	const [plans, setPlans] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProcurement = async () => {
			try {
				// Adjust this URL to match your .NET routing (e.g., getting all or specific)
				const res = await fetch("http://localhost:5109/api/ProcurementPlanB", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = await res.json();
				setPlans(Array.isArray(data) ? data : [data]);
			} catch (err) {
				console.error("Failed to fetch Procurement Plan B:", err);
			} finally {
				setLoading(false);
			}
		};
		if (token) fetchProcurement();
	}, [token]);

	if (loading)
		return <Spinner label="Loading Procurement Plan B..." className="m-10" />;

	// For this example, we'll display the first plan in the list
	const activePlan = plans[0];
	if (!activePlan)
		return (
			<div className="p-10 text-default-400">
				No Procurement Plan B data found. Run the seed-bulk endpoint.
			</div>
		);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between items-end bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
				<div>
					<h2 className="text-2xl font-bold">{activePlan.sheetName}</h2>
					<p className="opacity-80 text-sm">
						Annual Procurement Plan - Common-Use Supplies and Equipment
					</p>
				</div>
				<Chip variant="flat" className="bg-white/20 text-white border-white/30">
					FY 2026
				</Chip>
			</div>

			<ScrollShadow className="h-[600px]">
				<Table
					aria-label="Procurement Plan B Table"
					isHeaderSticky
					removeWrapper
					classNames={{
						th: "bg-default-100 text-[10px] font-bold uppercase py-4 border-b border-divider",
						td: "py-3 text-small border-b border-divider/50",
					}}
				>
					<TableHeader>
						<TableColumn width={100}>TYPE</TableColumn>
						<TableColumn width={150}>CODE</TableColumn>
						<TableColumn>ITEM DESCRIPTION</TableColumn>
						<TableColumn>UNIT</TableColumn>
						<TableColumn align="end">UNIT PRICE</TableColumn>
					</TableHeader>
					<TableBody>
						{activePlan.items.map((item: any) => {
							// Logic to detect the "Category Header" rows from your .NET Seeder
							const isHeader = !item.type && item.description;

							if (isHeader) {
								return (
									<TableRow key={item.id} className="bg-default-50/50">
										<TableCell colSpan={5} className="py-2">
											<span className="text-primary font-bold tracking-widest text-xs">
												{item.description}
											</span>
										</TableCell>
									</TableRow>
								);
							}

							return (
								<TableRow
									key={item.id}
									className="hover:bg-default-50 transition-colors"
								>
									<TableCell>
										<Chip
											size="sm"
											variant="dot"
											color={item.type === "PS" ? "warning" : "default"}
										>
											{item.type}
										</Chip>
									</TableCell>
									<TableCell className="font-mono text-[11px] text-default-500">
										{item.code}
									</TableCell>
									<TableCell className="font-medium">
										{item.description}
									</TableCell>
									<TableCell>{item.unit}</TableCell>
									<TableCell className="text-right font-bold">
										₱
										{item.unitPrice?.toLocaleString(undefined, {
											minimumFractionDigits: 2,
										})}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</ScrollShadow>
		</div>
	);
}
