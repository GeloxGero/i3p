import React, { useMemo, useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Chip,
	ButtonGroup,
	Button,
	Skeleton,
	Tooltip,
} from "@heroui/react";
import { $expenseFilter, type ExpenseClass } from "../store/tableStore";
import { $token } from "../store/authStore";

// 1. Removed "EXPENSE ITEM" and "QUANTITY" from columns
const columns = [
	{ name: "EXPENSE CLASS", uid: "class" },
	{ name: "DBM GROUPING", uid: "grouping" },
	{ name: "UNIT COST", uid: "unitCost" },
	{ name: "TOTAL AMOUNT", uid: "total" },
	{ name: "MANNER OF RELEASE", uid: "release" },
	{ name: "ACTIONS", uid: "actions" },
];

export default function ProjectTable() {
	const filter = useStore($expenseFilter);
	const token = useStore($token);
	const [mounted, setMounted] = useState(false);
	const [data, setData] = useState<any[]>([]);

	useEffect(() => {
		setMounted(true);
		const loadExpenses = async () => {
			try {
				const response = await fetch(
					"http://localhost:5109/api/expense/GetAll",
					{
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					},
				);
				if (response.ok) {
					const result = await response.json();
					setData(result);
				}
			} catch (error) {
				console.error("Error loading expenses:", error);
			}
		};

		if (mounted) loadExpenses();
	}, [mounted, token]);

	const handleEdit = (item: any) => console.log("Edit item:", item.id);
	const handleDelete = (id: number) =>
		confirm("Delete record?") && console.log("Deleting:", id);

	const filteredData = useMemo(() => {
		if (!Array.isArray(data)) return [];
		return filter === "All" ? data : data.filter((d) => d.class === filter);
	}, [filter, data]);

	if (!mounted) {
		return (
			<div className="w-full space-y-5 p-4">
				<Skeleton className="h-12 w-full rounded-lg" />
				<Skeleton className="h-64 w-full rounded-lg" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between items-center bg-content1 p-4 rounded-t-xl border-b border-divider">
				<h2 className="text-xl font-bold">Expenditure Ledger</h2>
				<ButtonGroup variant="flat" size="sm">
					{["All", "MOOE", "PS", "CO"].map((f) => (
						<Button
							key={f}
							onPress={() => $expenseFilter.set(f as ExpenseClass)}
							color={filter === f ? "primary" : "default"}
						>
							{f}
						</Button>
					))}
				</ButtonGroup>
			</div>

			<Table
				isHeaderSticky
				aria-label="Expense Table"
				classNames={{
					base: "max-h-[600px] overflow-y-auto",
					th: "bg-default-100 text-default-800",
					td: "py-3",
				}}
			>
				<TableHeader columns={columns}>
					{(col) => (
						<TableColumn
							key={col.uid}
							align={col.uid === "actions" ? "center" : "start"}
						>
							{col.name}
						</TableColumn>
					)}
				</TableHeader>
				<TableBody
					items={filteredData}
					emptyContent={
						data.length === 0 ? "Loading..." : "No rows to display."
					}
				>
					{(item) => (
						<TableRow
							key={item.id}
							className="border-b border-divider last:border-none"
						>
							<TableCell>
								<Chip size="sm" variant="flat">
									{item.class}
								</Chip>
							</TableCell>
							<TableCell className="text-tiny uppercase font-medium">
								{item.grouping}
							</TableCell>
							{/* item and qty TableCells removed from here */}
							<TableCell>₱{item.unitCost?.toLocaleString()}</TableCell>
							<TableCell>
								<div className="bg-success-500 text-white px-2 py-1 rounded text-center font-bold">
									₱{item.total?.toLocaleString()}
								</div>
							</TableCell>
							<TableCell className="text-tiny italic">{item.release}</TableCell>
							<TableCell>
								<div className="relative flex items-center justify-center gap-2">
									<Tooltip content="Edit item">
										<Button
											isIconOnly
											size="sm"
											variant="light"
											onPress={() => handleEdit(item)}
										>
											<span className="text-default-400 text-lg">✎</span>
										</Button>
									</Tooltip>
									<Tooltip color="danger" content="Delete item">
										<Button
											isIconOnly
											size="sm"
											variant="light"
											color="danger"
											onPress={() => handleDelete(item.id)}
										>
											<span className="text-danger text-lg">🗑</span>
										</Button>
									</Tooltip>
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
