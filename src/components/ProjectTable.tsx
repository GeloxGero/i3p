import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  User,
  Tooltip
} from "@heroui/react";

// 1. Define the columns
const columns = [
  { name: "PROJECT ID", uid: "id" },
  { name: "CLIENT", uid: "client" },
  { name: "STATUS", uid: "status" },
  { name: "AMOUNT", uid: "amount" },
  { name: "DATE", uid: "date" },
];

// 2. Generate 50 items of mock data
const rows = Array.from({ length: 50 }).map((_, i) => ({
  id: `PPA-2026-${100 + i}`,
  client: `Client Name ${i + 1}`,
  status: i % 3 === 0 ? "Paid" : i % 3 === 1 ? "Pending" : "Overdue",
  amount: `$${(Math.random() * 1000 + 100).toFixed(2)}`,
  date: "2026-01-10",
}));

const statusColorMap: Record<string, "success" | "warning" | "danger"> = {
  Paid: "success",
  Pending: "warning",
  Overdue: "danger",
};

export default function ProjectTable() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold">Financial Overview</h2>
      </div>
      
      <Table 
        aria-label="Example 50 item table"
        // Prop: Makes the headers stay fixed while the 50 rows scroll
        isHeaderSticky 
        classNames={{
          base: "max-h-[700px] overflow-y-auto",
          table: "min-w-[600px]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "amount" ? "end" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={rows}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold text-default-600">{item.id}</TableCell>
              <TableCell>{item.client}</TableCell>
              <TableCell>
                <Chip className="capitalize" color={statusColorMap[item.status]} size="sm" variant="flat">
                  {item.status}
                </Chip>
              </TableCell>
              <TableCell className="font-mono">{item.amount}</TableCell>
              <TableCell className="text-default-400 text-small">{item.date}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}