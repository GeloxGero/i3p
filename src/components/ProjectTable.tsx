import React, { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, ButtonGroup, Button } from "@heroui/react";
import { $expenseFilter, type ExpenseClass } from "../store/tableStore";

// Columns based on your provided specification
const columns = [
  { name: "EXPENSE CLASS", uid: "class" },
  { name: "DBM GROUPING", uid: "grouping" },
  { name: "EXPENSE ITEM", uid: "item" },
  { name: "QUANTITY", uid: "qty" },
  { name: "UNIT COST", uid: "unitCost" },
  { name: "TOTAL AMOUNT", uid: "total" },
  { name: "MANNER OF RELEASE", uid: "release" },
];

// Mock data generator for 50 items
const rawData = Array.from({ length: 50 }).map((_, i) => ({
  id: i,
  class: i % 5 === 0 ? "PS" : "MOOE",
  grouping: i % 2 === 0 ? "Training & Scholarship" : "Supplies & Materials",
  item: i % 2 === 0 ? "Snacks for Execom Meeting" : "Supplies for BUG",
  qty: 1,
  unitCost: (Math.random() * 10000 + 2000).toFixed(2),
  total: (Math.random() * 25000 + 5000).toFixed(2),
  release: "Direct Payment",
}));

export default function ProjectTable() {
  const filter = useStore($expenseFilter);

  const filteredData = useMemo(() => {
    return filter === "All" ? rawData : rawData.filter(d => d.class === filter);
  }, [filter]);

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
          td: "py-3"
        }}
      >
        <TableHeader columns={columns}>
          {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
        </TableHeader>
        <TableBody items={filteredData}>
          {(item) => (
            <TableRow key={item.id} className="border-b border-divider last:border-none">
              <TableCell><Chip size="sm" variant="flat">{item.class}</Chip></TableCell>
              <TableCell className="text-tiny uppercase font-medium">{item.grouping}</TableCell>
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