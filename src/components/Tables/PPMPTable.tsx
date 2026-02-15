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
} from "@heroui/react";
import { $token } from "../../store/authStore";

export default function PPMPTable() {
	const token = useStore($token);
	const [ppmpData, setPpmpData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPPMP = async () => {
			try {
				// Fetching the first available PPMP for display
				const res = await fetch("http://localhost:5109/api/PPMP", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const list = await res.json();

				if (list.length > 0) {
					// Fetch the full details (including items) for the first ID
					const detailRes = await fetch(
						`http://localhost:5109/api/PPMP/${list[0].id}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						},
					);
					const detail = await detailRes.json();
					setPpmpData(detail);
				}
			} finally {
				setLoading(false);
			}
		};
		if (token) fetchPPMP();
	}, [token]);

	if (loading) return <Spinner label="Loading PPMP..." className="m-10" />;
	if (!ppmpData)
		return <div className="p-10 text-default-500">No PPMP records found.</div>;

	return (
		<div className="flex flex-col gap-6">
			<div className="bg-default-50 p-4 rounded-xl border border-divider">
				<h2 className="text-xl font-bold text-primary">{ppmpData.sheetName}</h2>
				<p className="text-small text-default-500">
					Project Procurement Management Plan
				</p>
			</div>

			<Table
				aria-label="PPMP Items Table"
				isHeaderSticky
				classNames={{
					th: "bg-default-100 text-[11px] uppercase py-3 border-b border-divider",
					td: "py-3 border-b border-divider text-small",
				}}
			>
				<TableHeader>
					<TableColumn width={120}>CODE</TableColumn>
					<TableColumn width={300}>GENERAL DESCRIPTION</TableColumn>
					<TableColumn>UNIT</TableColumn>
					<TableColumn>QUANTITY</TableColumn>
					<TableColumn>EST. BUDGET</TableColumn>
					<TableColumn>PROCUREMENT MODE</TableColumn>
				</TableHeader>
				<TableBody>
					{ppmpData.items.map((item: any) => (
						<TableRow key={item.id}>
							<TableCell className="font-mono text-primary-600 font-bold">
								{item.code}
							</TableCell>
							<TableCell>
								<div className="flex flex-col">
									<span className="font-medium">{item.generalDescription}</span>
									{/* Small visual showing schedule if it exists */}
									{item.scheduleJson && (
										<div className="flex gap-1 mt-1">
											{JSON.parse(item.scheduleJson).map(
												(qty: number, idx: number) => (
													<div
														key={idx}
														className={`w-2 h-2 rounded-full ${qty > 0 ? "bg-success" : "bg-default-200"}`}
														title={`Month ${idx + 1}: ${qty}`}
													/>
												),
											)}
										</div>
									)}
								</div>
							</TableCell>
							<TableCell>{item.units}</TableCell>
							<TableCell className="text-center font-bold">
								{item.quantity}
							</TableCell>
							<TableCell className="text-right font-mono text-success-700">
								₱
								{item.estimatedBudget?.toLocaleString(undefined, {
									minimumFractionDigits: 2,
								})}
							</TableCell>
							<TableCell>
								<Chip size="sm" variant="flat" color="secondary">
									{item.modeOfProcurement}
								</Chip>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
