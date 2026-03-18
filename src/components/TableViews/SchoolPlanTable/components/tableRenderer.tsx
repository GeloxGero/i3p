import {
	Tooltip,
	Chip,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
} from "@heroui/react";
import type { SchoolPlanItem, MonthSheet, TableRowData } from "../types";
import { ALL_COLUMNS, CATEGORY_COLORS, CATEGORY_LABELS } from "../constants";
import { MobileItemCard } from "./cardRenderer";
import { fmt } from "../utils";

function ArCodeCell({ row }: { row: SchoolPlanItem }) {
	if (!row.arCode)
		return <span className="text-xs text-default-300 italic">—</span>;
	return (
		<Tooltip
			content={
				row.isVerified
					? "All linked APP items verified ✓"
					: "Pending photo verification — click to review"
			}
		>
			<a
				href={`/projects/detail?code=${encodeURIComponent(row.arCode)}`}
				className="inline-flex items-center gap-1.5 group"
			>
				<span className="text-xs font-mono text-primary underline underline-offset-2 group-hover:text-primary-600 transition-colors">
					{row.arCode}
				</span>
				{row.isVerified ? (
					<span className="flex items-center justify-center w-4 h-4 rounded-full bg-success text-white text-[9px] font-bold shrink-0">
						✓
					</span>
				) : (
					<span className="flex items-center justify-center w-4 h-4 rounded-full bg-warning/20 text-warning-700 text-[9px] font-bold shrink-0">
						!
					</span>
				)}
			</a>
		</Tooltip>
	);
}

function StatusCell({ row }: { row: SchoolPlanItem }) {
	return (
		<Chip
			size="sm"
			variant="flat"
			color={row.isVerified ? "success" : "warning"}
		>
			{row.isVerified ? "Verified" : "Pending Verification"}
		</Chip>
	);
}

function renderCell(row: SchoolPlanItem, uid: string): React.ReactNode {
	switch (uid) {
		case "kraArea":
			return (
				<span className="text-xs text-default-500 leading-tight">
					{row.kraArea}
				</span>
			);
		case "specificProgram":
			return row.specificProgram === "Unimplemented" ? null : (
				<span className="text-xs leading-tight">{row.specificProgram}</span>
			);
		case "programActivity":
			return (
				<span className="text-sm leading-snug">{row.programActivity}</span>
			);
		case "purpose":
			return <span className="text-xs leading-tight">{row.purpose}</span>;
		case "performanceIndicator":
			return (
				<span className="text-xs leading-tight">
					{row.performanceIndicator}
				</span>
			);
		case "resourceDescription":
			return (
				<span className="text-xs leading-tight">{row.resourceDescription}</span>
			);
		case "quantity":
			return <span className="block text-right">{row.quantity}</span>;
		case "estimatedCost":
			return (
				<span className="block text-right font-medium">
					{row.estimatedCost > 0 ? fmt(row.estimatedCost) : "—"}
				</span>
			);
		case "accountTitle":
			return <span className="text-xs">{row.accountTitle}</span>;
		case "accountCode":
			return <span className="text-xs font-mono">{row.accountCode}</span>;
		case "arCode":
			return <ArCodeCell row={row} />;
		case "status":
			return <StatusCell row={row} />;
		default:
			return null;
	}
}

function MonthTable({
	sheet,
	visibleCols,
	isMobile,
}: {
	sheet: MonthSheet;
	visibleCols: Set<string>;
	isMobile: boolean;
}) {
	const categories = Array.from(new Set(sheet.items.map((i) => i.category)));
	const activeCols = ALL_COLUMNS.filter((c) => visibleCols.has(c.uid));
	return (
		<div className="flex flex-col gap-4 pb-4">
			{categories.map((cat) => {
				const catItems = sheet.items.filter((i) => i.category === cat);
				const subtotal = sheet.subTotals[cat];
				const itemsWithArCode = catItems.filter(
					(item) => item.arCode && item.arCode.trim() !== "",
				);
				return (
					<div key={cat} className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<h3 className="text-xs sm:text-sm font-semibold text-default-600 uppercase tracking-wide">
								{cat}
							</h3>
							<Chip
								size="sm"
								color={CATEGORY_COLORS[cat] ?? "default"}
								variant="flat"
							>
								{CATEGORY_LABELS[cat] ?? cat} · {itemsWithArCode.length}
							</Chip>
						</div>

						{/* Mobile: card list */}
						{isMobile ? (
							<div className="flex flex-col gap-2">
								{itemsWithArCode.map((item, idx) => (
									<MobileItemCard key={idx} item={item} />
								))}
								{subtotal !== undefined && (
									<div className="flex items-center justify-between px-3 py-2 bg-default-100/80 rounded-xl">
										<span className="text-xs font-semibold text-default-500 uppercase tracking-wide">
											Sub-Total
										</span>
										<span className="text-sm font-bold text-primary">
											{fmt(subtotal)}
										</span>
									</div>
								)}
								{itemsWithArCode.length === 0 && (
									<p className="text-xs text-default-400 px-1">No items.</p>
								)}
							</div>
						) : (
							// Desktop/tablet: scrollable table
							<div className="overflow-x-auto -mx-0">
								<Table aria-label={`${cat} items`} removeWrapper>
									<TableHeader>
										{activeCols.map((col) => (
											<TableColumn
												key={col.uid}
												className={col.className ?? ""}
											>
												{col.label}
											</TableColumn>
										))}
									</TableHeader>
									<TableBody
										emptyContent="No items."
										items={[
											...itemsWithArCode.map(
												(item, idx) =>
													({ ...item, _rowKey: `item-${idx}` }) as TableRowData,
											),
											...(subtotal !== undefined
												? [
														{
															_rowKey: "subtotal",
															_isSubtotal: true as const,
															_subtotalValue: subtotal,
															kraArea: "",
															specificProgram: "",
															programActivity: "",
															purpose: "",
															performanceIndicator: "",
															resourceDescription: "",
															quantity: "",
															estimatedCost: 0,
															accountTitle: "",
															accountCode: "",
															category: cat,
														},
													]
												: []),
										]}
									>
										{(row: TableRowData) =>
											row._isSubtotal ? (
												<TableRow
													key={row._rowKey}
													className="bg-default-100/60 font-bold"
												>
													{activeCols.map((col) => {
														if (col.uid === "estimatedCost")
															return (
																<TableCell
																	key={col.uid}
																	className="text-right font-bold text-primary"
																>
																	₱
																	{row._subtotalValue!.toLocaleString("en-PH", {
																		minimumFractionDigits: 2,
																	})}
																</TableCell>
															);
														if (col.uid === "accountTitle")
															return (
																<TableCell
																	key={col.uid}
																	className="text-right font-semibold text-default-500"
																>
																	Sub-Total
																</TableCell>
															);
														return <TableCell key={col.uid}>{""}</TableCell>;
													})}
												</TableRow>
											) : (
												<TableRow key={row._rowKey}>
													{activeCols.map((col) => (
														<TableCell key={col.uid}>
															{renderCell(row, col.uid)}
														</TableCell>
													))}
												</TableRow>
											)
										}
									</TableBody>
								</Table>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

export { MonthTable };
