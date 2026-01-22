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
} from "@heroui/react";
import { $expenseFilter, type ExpenseClass } from "../store/tableStore";

const columns = [
	{ name: "EXPENSE CLASS", uid: "class" },
	{ name: "DBM GROUPING", uid: "grouping" },
	{ name: "EXPENSE ITEM", uid: "item" },
	{ name: "QUANTITY", uid: "qty" },
	{ name: "UNIT COST", uid: "unitCost" },
	{ name: "TOTAL AMOUNT", uid: "total" },
	{ name: "MANNER OF RELEASE", uid: "release" },
];

export default function ProjectTable() {
	const filter = useStore($expenseFilter);
	const [mounted, setMounted] = useState(false);
	const [data, setData] = useState<any[]>([]);

	// 1. Only run this in the browser
	useEffect(() => {
		const generatedData = Array.from({ length: 50 }).map((_, i) => ({
			id: i,
			class: i % 5 === 0 ? "PS" : "MOOE",
			grouping: i % 2 === 0 ? "Training & Scholarship" : "Supplies & Materials",
			item: i % 2 === 0 ? "Snacks for Execom Meeting" : "Supplies for BUG",
			qty: 1,
			unitCost: (Math.random() * 10000 + 2000).toFixed(2),
			total: (Math.random() * 25000 + 5000).toFixed(2),
			release: "Direct Payment",
		}));

		setData(generatedData);
		setMounted(true);
	}, []);

	const filteredData = useMemo(() => {
		return filter === "All" ? data : data.filter((d) => d.class === filter);
	}, [filter, data]);

	// 2. Return a placeholder or null during Server-Side Rendering
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
					{(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
				</TableHeader>
				<TableBody items={filteredData} emptyContent={"No rows to display."}>
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
							<TableCell className="text-small">{item.item}</TableCell>
							<TableCell>{item.qty}</TableCell>
							<TableCell>₱{item.unitCost}</TableCell>
							<TableCell>
								<div className="bg-success-500 text-white px-2 py-1 rounded text-center font-bold">
									₱{item.total}
								</div>
							</TableCell>
							<TableCell className="text-tiny italic">{item.release}</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
