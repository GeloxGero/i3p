import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { $token } from "../../store/authStore";
import { useStore } from "@nanostores/react";

export default function AnnualPlanTable() {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const token = useStore($token);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					"http://localhost:5109/api/AnnualProcurementPlan",
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				const result = await response.json();
				setData(result);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [token]);

	if (loading) return <div>Loading Plan...</div>;

	return (
		<Table aria-label="Annual Plan Data">
			<TableHeader>
				<TableColumn>ITEM DESCRIPTION</TableColumn>
				<TableColumn>TOTAL QTY</TableColumn>
				<TableColumn>PRICE</TableColumn>
				<TableColumn>TOTAL AMOUNT</TableColumn>
			</TableHeader>
			<TableBody>
				{data.map((item) => (
					<TableRow key={item.id}>
						<TableCell>{item.itemDescription}</TableCell>
						<TableCell>{item.totalQuantity}</TableCell>
						<TableCell>₱{item.price?.toLocaleString()}</TableCell>
						<TableCell className="font-bold">
							₱{item.totalAmount?.toLocaleString()}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
