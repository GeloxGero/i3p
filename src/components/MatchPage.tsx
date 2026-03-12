import { useEffect, useState, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
	Button,
	Chip,
	Select,
	SelectItem,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Textarea,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
	Tooltip,
} from "@heroui/react";
import { $token } from "../store/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type CrossRefStatus =
	| "Unmatched"
	| "PendingReview"
	| "Verified"
	| "Rejected"
	| "Orphaned";

// numeric enum values returned by the API
const STATUS_MAP: Record<number, CrossRefStatus> = {
	0: "Unmatched",
	1: "PendingReview",
	2: "Verified",
	3: "Rejected",
	4: "Orphaned",
};

interface CrossRefRow {
	id: number;
	year: number;
	status: number; // numeric enum
	isOrphaned: boolean;
	matchScore: number;
	appItemId: number | null;
	appItemDescription: string | null;
	appItemPrice: number;
	implementationItemId: number | null;
	sipItemActivity: string | null;
	sipItemCost: number | null;
	adminNote: string | null;
	detectedAt: string;
	reviewedAt: string | null;
	reviewedBy: string | null;
}

interface Summary {
	year: number;
	totalAppItems: number;
	unmatched: number;
	pendingReview: number;
	verified: number;
	rejected: number;
	orphaned: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE = "http://localhost:5109/api/PlanCrossReference";

function statusLabel(n: number): CrossRefStatus {
	return STATUS_MAP[n] ?? "Unmatched";
}

function StatusChip({ status }: { status: number }) {
	const label = statusLabel(status);
	const colorMap: Record<
		CrossRefStatus,
		"warning" | "success" | "danger" | "default" | "primary"
	> = {
		Unmatched: "default",
		PendingReview: "warning",
		Verified: "success",
		Rejected: "danger",
		Orphaned: "default",
	};
	return (
		<Chip size="sm" color={colorMap[label]} variant="flat">
			{label}
		</Chip>
	);
}

function fmt(n: number | null | undefined) {
	if (n == null) return "—";
	return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

// ─── Review Modal ─────────────────────────────────────────────────────────────

function ReviewModal({
	row,
	action,
	isOpen,
	onClose,
	onDone,
	token,
}: {
	row: CrossRefRow | null;
	action: "verify" | "reject";
	isOpen: boolean;
	onClose: () => void;
	onDone: () => void;
	token: string | null;
}) {
	const [note, setNote] = useState("");
	const [loading, setLoading] = useState(false);

	const submit = async () => {
		if (!row) return;
		setLoading(true);
		try {
			await fetch(`${BASE}/review/${row.id}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ action, adminNote: note, reviewedBy: "admin" }),
			});
			onDone();
			onClose();
		} finally {
			setLoading(false);
			setNote("");
		}
	};

	return (
		<Modal isOpen={isOpen} onOpenChange={onClose} size="md">
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					<span
						className={action === "verify" ? "text-success" : "text-danger"}
					>
						{action === "verify" ? "✓ Verify Match" : "✗ Reject Match"}
					</span>
					<span className="text-sm font-normal text-default-500">
						{row?.appItemDescription ?? "APP Item"} ↔{" "}
						{row?.sipItemActivity ?? "SIP Item"}
					</span>
				</ModalHeader>
				<ModalBody>
					<div className="flex flex-col gap-3 text-sm">
						<div className="grid grid-cols-2 gap-2 bg-default-50 rounded-xl p-3">
							<div>
								<p className="text-xs text-default-400">APP Price</p>
								<p className="font-semibold">{fmt(row?.appItemPrice)}</p>
							</div>
							<div>
								<p className="text-xs text-default-400">SIP Cost</p>
								<p className="font-semibold">{fmt(row?.sipItemCost)}</p>
							</div>
							<div>
								<p className="text-xs text-default-400">Match Score</p>
								<p className="font-semibold">
									{row ? `${(row.matchScore * 100).toFixed(1)}%` : "—"}
								</p>
							</div>
						</div>
						<Textarea
							label="Admin note (optional)"
							placeholder="Reason for this decision…"
							value={note}
							onValueChange={setNote}
							minRows={2}
						/>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="flat" onPress={onClose}>
						Cancel
					</Button>
					<Button
						color={action === "verify" ? "success" : "danger"}
						isLoading={loading}
						onPress={submit}
					>
						{action === "verify" ? "Confirm Verify" : "Confirm Reject"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MatchPage() {
	const token = useStore($token);

	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

	const [year, setYear] = useState<number>(currentYear);
	const [rows, setRows] = useState<CrossRefRow[]>([]);
	const [summary, setSummary] = useState<Summary | null>(null);
	const [loading, setLoading] = useState(false);
	const [running, setRunning] = useState(false);

	// Review modal state
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [activeRow, setActiveRow] = useState<CrossRefRow | null>(null);
	const [reviewAction, setReviewAction] = useState<"verify" | "reject">(
		"verify",
	);

	const headers = { Authorization: `Bearer ${token}` };

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const [rowsRes, summaryRes] = await Promise.all([
				fetch(`${BASE}/${year}`, { headers }),
				fetch(`${BASE}/summary/${year}`, { headers }),
			]);
			const [rowsData, summaryData] = await Promise.all([
				rowsRes.json(),
				summaryRes.json(),
			]);
			setRows(rowsData);
			setSummary(summaryData);
		} finally {
			setLoading(false);
		}
	}, [year, token]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const runMatch = async () => {
		setRunning(true);
		try {
			await fetch(`${BASE}/match/${year}`, {
				method: "POST",
				headers,
			});
			await fetchData();
		} finally {
			setRunning(false);
		}
	};

	const openReview = (row: CrossRefRow, action: "verify" | "reject") => {
		setActiveRow(row);
		setReviewAction(action);
		onOpen();
	};

	// Split rows into the two tables
	const pendingRows = rows.filter(
		(r) =>
			statusLabel(r.status) === "PendingReview" ||
			statusLabel(r.status) === "Verified",
	);
	const unmatchedRows = rows.filter(
		(r) =>
			statusLabel(r.status) === "Unmatched" ||
			statusLabel(r.status) === "Rejected" ||
			statusLabel(r.status) === "Orphaned",
	);

	return (
		<div className="flex flex-col gap-8 p-6">
			{/* ── Header bar ── */}
			<div className="flex flex-wrap gap-4 items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Cross-Reference Matching</h1>
					<p className="text-default-500 text-sm mt-0.5">
						Match Annual Procurement Plan items against School Implementation
						Plan items by cost.
					</p>
				</div>

				<div className="flex gap-3 items-center">
					<Select
						label="Fiscal Year"
						className="w-36"
						selectedKeys={[String(year)]}
						onSelectionChange={(keys) => setYear(Number(Array.from(keys)[0]))}
						size="sm"
					>
						{yearOptions.map((y) => (
							<SelectItem key={String(y)}>{String(y)}</SelectItem>
						))}
					</Select>

					<Button
						color="primary"
						size="sm"
						isLoading={running}
						onPress={runMatch}
					>
						{running ? "Running…" : "Run Matching"}
					</Button>
				</div>
			</div>

			{/* ── Summary chips ── */}
			{summary && (
				<div className="flex flex-wrap gap-2">
					{[
						{
							label: "Total APP Items",
							value: summary.totalAppItems,
							color: "default" as const,
						},
						{
							label: "Pending Review",
							value: summary.pendingReview,
							color: "warning" as const,
						},
						{
							label: "Verified",
							value: summary.verified,
							color: "success" as const,
						},
						{
							label: "Unmatched",
							value: summary.unmatched,
							color: "default" as const,
						},
						{
							label: "Rejected",
							value: summary.rejected,
							color: "danger" as const,
						},
						{
							label: "Orphaned",
							value: summary.orphaned,
							color: "default" as const,
						},
					].map(({ label, value, color }) => (
						<div
							key={label}
							className="flex flex-col items-center bg-default-50 border border-default-200 rounded-xl px-4 py-2 min-w-[90px]"
						>
							<span className="text-xl font-bold">{value}</span>
							<Chip
								size="sm"
								color={color}
								variant="flat"
								className="mt-1 text-[10px]"
							>
								{label}
							</Chip>
						</div>
					))}
				</div>
			)}

			{loading ? (
				<div className="flex justify-center py-16">
					<Spinner label="Loading cross-references…" />
				</div>
			) : (
				<>
					{/* ── TABLE 1: Pending / Verified matches ── */}
					<section className="flex flex-col gap-3">
						<div className="flex items-center gap-2">
							<h2 className="text-lg font-semibold">Matched Items</h2>
							<Chip size="sm" color="warning" variant="flat">
								{pendingRows.length} rows
							</Chip>
							<span className="text-xs text-default-400">
								Pending review and verified matches — confirm or reject each
								link below.
							</span>
						</div>

						<Table aria-label="Matched items" removeWrapper>
							<TableHeader>
								<TableColumn className="w-8">#</TableColumn>
								<TableColumn>APP Item</TableColumn>
								<TableColumn className="text-right w-32">APP Price</TableColumn>
								<TableColumn>SIP Activity</TableColumn>
								<TableColumn className="text-right w-32">SIP Cost</TableColumn>
								<TableColumn className="w-24 text-right">Score</TableColumn>
								<TableColumn className="w-32">Status</TableColumn>
								<TableColumn className="w-40 text-center">Actions</TableColumn>
							</TableHeader>
							<TableBody emptyContent="No matched items yet. Run matching to find candidates.">
								{pendingRows.map((row, idx) => (
									<TableRow key={row.id}>
										<TableCell className="text-default-400 text-xs">
											{idx + 1}
										</TableCell>
										<TableCell>
											<span className="text-sm leading-tight">
												{row.appItemDescription ?? "—"}
											</span>
											{row.isOrphaned && (
												<Chip
													size="sm"
													color="default"
													variant="flat"
													className="ml-1 text-[10px]"
												>
													orphaned
												</Chip>
											)}
										</TableCell>
										<TableCell className="text-right font-medium">
											{fmt(row.appItemPrice)}
										</TableCell>
										<TableCell>
											<span className="text-sm leading-tight">
												{row.sipItemActivity ?? "—"}
											</span>
										</TableCell>
										<TableCell className="text-right font-medium">
											{fmt(row.sipItemCost)}
										</TableCell>
										<TableCell className="text-right">
											<span
												className={[
													"text-sm font-semibold",
													row.matchScore === 1
														? "text-success-600"
														: "text-warning-600",
												].join(" ")}
											>
												{(row.matchScore * 100).toFixed(1)}%
											</span>
										</TableCell>
										<TableCell>
											<StatusChip status={row.status} />
										</TableCell>
										<TableCell>
											{statusLabel(row.status) === "PendingReview" ? (
												<div className="flex gap-1 justify-center">
													<Tooltip content="Verify this match">
														<Button
															size="sm"
															color="success"
															variant="flat"
															isIconOnly
															onPress={() => openReview(row, "verify")}
														>
															✓
														</Button>
													</Tooltip>
													<Tooltip content="Reject this match">
														<Button
															size="sm"
															color="danger"
															variant="flat"
															isIconOnly
															onPress={() => openReview(row, "reject")}
														>
															✗
														</Button>
													</Tooltip>
												</div>
											) : (
												<div className="flex gap-1 justify-center">
													<Tooltip content={row.adminNote ?? "No note"}>
														<span className="text-xs text-default-400 cursor-help">
															{row.reviewedBy ?? "—"}
														</span>
													</Tooltip>
												</div>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</section>

					{/* ── TABLE 2: Unmatched / Rejected / Orphaned ── */}
					<section className="flex flex-col gap-3">
						<div className="flex items-center gap-2">
							<h2 className="text-lg font-semibold">Unmatched Items</h2>
							<Chip size="sm" color="default" variant="flat">
								{unmatchedRows.length} rows
							</Chip>
							<span className="text-xs text-default-400">
								APP items with no SIP cost match, rejected candidates, and
								orphaned links.
							</span>
						</div>

						<Table aria-label="Unmatched items" removeWrapper>
							<TableHeader>
								<TableColumn className="w-8">#</TableColumn>
								<TableColumn>APP Item</TableColumn>
								<TableColumn className="text-right w-32">APP Price</TableColumn>
								<TableColumn className="w-32">Status</TableColumn>
								<TableColumn>Note</TableColumn>
								<TableColumn>Detected</TableColumn>
							</TableHeader>
							<TableBody emptyContent="No unmatched items for this year.">
								{unmatchedRows.map((row, idx) => (
									<TableRow key={row.id}>
										<TableCell className="text-default-400 text-xs">
											{idx + 1}
										</TableCell>
										<TableCell>
											<span className="text-sm leading-tight">
												{row.appItemDescription ?? "—"}
											</span>
										</TableCell>
										<TableCell className="text-right font-medium">
											{fmt(row.appItemPrice)}
										</TableCell>
										<TableCell>
											<StatusChip status={row.status} />
										</TableCell>
										<TableCell>
											<span className="text-xs text-default-400">
												{row.adminNote ?? "—"}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-xs text-default-400">
												{new Date(row.detectedAt).toLocaleDateString("en-PH")}
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</section>
				</>
			)}

			{/* ── Review modal ── */}
			<ReviewModal
				row={activeRow}
				action={reviewAction}
				isOpen={isOpen}
				onClose={onClose}
				onDone={fetchData}
				token={token}
			/>
		</div>
	);
}
