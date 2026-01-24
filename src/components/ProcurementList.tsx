import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Card,
	CardHeader,
	Divider,
	Chip,
	Spinner,
} from "@heroui/react";
import { $token } from "../store/authStore";

interface Props {
	summaryId: string | undefined;
}

export default function ProcurementList({ summaryId }: Props) {
	const token = useStore($token);
	const [loading, setLoading] = useState(true);
	const [summary, setSummary] = useState<any>(null);

	useEffect(() => {
		const fetchDetails = async () => {
			try {
				// Fetch the single summary with .Include(s => s.Details) on the backend
				const response = await fetch(
					`http://localhost:5109/api/expenses/${summaryId}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);

				if (response.ok) {
					const data = await response.json();
					setSummary(data);
				}
			} catch (error) {
				console.error("Error fetching procurement details:", error);
			} finally {
				setLoading(false);
			}
		};

		if (summaryId && token) fetchDetails();
	}, [summaryId, token]);

	if (loading)
		return (
			<div className="flex justify-center p-10">
				<Spinner label="Loading items..." />
			</div>
		);
	if (!summary) return <p className="text-danger">Summary record not found.</p>;

	return (
		<div className="space-y-6">
			{/* Summary Info Header */}
			<Card className="bg-default-50 border-none shadow-none">
				<CardHeader className="flex justify-between items-center px-6 py-4">
					<div>
						<p className="text-tiny uppercase font-bold text-default-400">
							{summary.dbmGrouping}
						</p>
						<h1 className="text-2xl font-bold">
							{summary.expenseClass} Details
						</h1>
					</div>
					<div className="text-right">
						<p className="text-tiny text-default-400">
							Total Budget Allocation
						</p>
						<p className="text-xl font-mono font-bold text-success">
							₱{summary.totalAmount?.toLocaleString()}
						</p>
					</div>
				</CardHeader>
			</Card>

			{/* Procurement Details Table */}
			<Table aria-label="Procurement Items Table">
				<TableHeader>
					<TableColumn>ITEM DESCRIPTION</TableColumn>
					<TableColumn>UNIT</TableColumn>
					<TableColumn>QUANTITY</TableColumn>
					<TableColumn>UNIT PRICE</TableColumn>
					<TableColumn align="end">TOTAL</TableColumn>
				</TableHeader>
				<TableBody
					items={summary.details || []}
					emptyContent="No procurement items listed."
				>
					{(item: any) => (
						<TableRow key={item.id}>
							<TableCell className="font-medium">{item.description}</TableCell>
							<TableCell>{item.unit || "pcs"}</TableCell>
							<TableCell>{item.totalQty}</TableCell>
							<TableCell>₱{item.unitPrice?.toLocaleString()}</TableCell>
							<TableCell className="font-bold">
								₱{item.totalAmount?.toLocaleString()}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
