import { useEffect, useState, useRef, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
	Button,
	Chip,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
	Input,
	Tooltip,
	Progress,
} from "@heroui/react";
import { $token } from "../store/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArAppItem {
	id: number;
	arCode: string | null;
	itemDescription: string | null;
	specification: string | null;
	unitOfMeasure: string | null;
	totalQuantity: number | null;
	price: number | null;
	totalAmount: number | null;
	photoPath: string | null;
	isPhotoVerified: boolean;
	verifiedAt: string | null;
	verifiedBy: string | null;
}

interface ArDetail {
	arCode: string;
	sipItemId: number;
	activity: string | null;
	kra: string | null;
	category: string | null;
	estimatedCost: number | null;
	sipIsVerified: boolean;
	appItems: ArAppItem[];
	totalAppCost: number;
	verifiedCount: number;
	totalCount: number;
}

const API = "http://localhost:5109";

function fmt(n: number | null | undefined) {
	if (n == null) return "—";
	return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

// ─── Photo Cell ───────────────────────────────────────────────────────────────

function PhotoCell({
	item,
	token,
	onRefresh,
}: {
	item: ArAppItem;
	token: string | null;
	onRefresh: () => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [verifying, setVerifying] = useState(false);

	const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploading(true);
		const fd = new FormData();
		fd.append("photo", file);
		await fetch(`${API}/api/Ar/photo/${item.id}`, {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: fd,
		});
		setUploading(false);
		onRefresh();
		e.target.value = "";
	};

	const verify = async () => {
		setVerifying(true);
		await fetch(`${API}/api/Ar/verify-photo/${item.id}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ verifiedBy: "admin" }),
		});
		setVerifying(false);
		onRefresh();
	};

	if (item.isPhotoVerified) {
		return (
			<div className="flex items-center gap-1.5 flex-wrap">
				<Chip size="sm" color="success" variant="flat">
					✓ Verified
				</Chip>
				{item.verifiedBy && (
					<span className="text-xs text-default-400">{item.verifiedBy}</span>
				)}
			</div>
		);
	}

	if (item.photoPath) {
		return (
			<div className="flex items-center gap-2 flex-wrap">
				<a
					href={`${API}/${item.photoPath}`}
					target="_blank"
					rel="noreferrer"
					className="text-xs text-primary underline hover:text-primary-600"
				>
					View photo ↗
				</a>
				<Button
					size="sm"
					color="success"
					variant="flat"
					isLoading={verifying}
					onPress={verify}
				>
					Verify
				</Button>
			</div>
		);
	}

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept="image/*,.pdf"
				className="hidden"
				onChange={upload}
			/>
			<Button
				size="sm"
				variant="flat"
				isLoading={uploading}
				onPress={() => inputRef.current?.click()}
			>
				Upload photo
			</Button>
		</>
	);
}

// ─── Add Item Modal ───────────────────────────────────────────────────────────

function AddItemModal({
	sipItemId,
	arCode,
	isOpen,
	onClose,
	onAdded,
	token,
}: {
	sipItemId: number;
	arCode: string;
	isOpen: boolean;
	onClose: () => void;
	onAdded: () => void;
	token: string | null;
}) {
	const blank = {
		itemDescription: "",
		specification: "",
		unitOfMeasure: "",
		totalQuantity: "",
		price: "",
	};
	const [form, setForm] = useState(blank);
	const [saving, setSaving] = useState(false);

	const set = (key: keyof typeof form) => (v: string) =>
		setForm((f) => ({ ...f, [key]: v }));

	const totalPreview = Number(form.totalQuantity) * Number(form.price) || null;

	const save = async () => {
		setSaving(true);
		try {
			await fetch(`${API}/api/Ar/add-item/${sipItemId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					itemDescription: form.itemDescription,
					specification: form.specification,
					unitOfMeasure: form.unitOfMeasure,
					totalQuantity: Number(form.totalQuantity) || null,
					price: Number(form.price) || null,
				}),
			});
			setForm(blank);
			onAdded();
			onClose();
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onOpenChange={onClose} size="lg">
			<ModalContent>
				<ModalHeader>
					<div className="flex flex-col gap-0.5">
						<span>Add APP Item</span>
						<span className="text-sm font-normal text-default-500 font-mono">
							{arCode}
						</span>
					</div>
				</ModalHeader>
				<ModalBody>
					<div className="grid grid-cols-2 gap-3">
						<Input
							label="Item Description"
							value={form.itemDescription}
							onValueChange={set("itemDescription")}
							className="col-span-2"
						/>
						<Input
							label="Specification"
							value={form.specification}
							onValueChange={set("specification")}
							className="col-span-2"
						/>
						<Input
							label="Unit of Measure"
							value={form.unitOfMeasure}
							onValueChange={set("unitOfMeasure")}
						/>
						<Input
							label="Total Quantity"
							value={form.totalQuantity}
							onValueChange={set("totalQuantity")}
							type="number"
						/>
						<Input
							label="Price (₱)"
							value={form.price}
							onValueChange={set("price")}
							type="number"
						/>
						<div className="flex items-center gap-2 text-sm text-default-500">
							Total:
							<span className="font-semibold text-default-800">
								{fmt(totalPreview)}
							</span>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="flat" onPress={onClose}>
						Cancel
					</Button>
					<Button
						color="primary"
						isLoading={saving}
						onPress={save}
						isDisabled={!form.itemDescription || !form.price}
					>
						Add Item
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ArDetailPage() {
	const token = useStore($token);

	// Read AR code from URL path: /ar/AR-2026-XXXXXX
	const arCode =
		typeof window !== "undefined"
			? decodeURIComponent(window.location.pathname.split("/ar/")[1] ?? "")
			: "";

	const [detail, setDetail] = useState<ArDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	const { isOpen, onOpen, onClose } = useDisclosure();

	const fetchDetail = useCallback(async () => {
		if (!arCode) return;
		setLoading(true);
		try {
			const res = await fetch(`${API}/api/Ar/${encodeURIComponent(arCode)}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.status === 404) {
				setNotFound(true);
				return;
			}
			setDetail(await res.json());
			setNotFound(false);
		} finally {
			setLoading(false);
		}
	}, [arCode, token]);

	useEffect(() => {
		fetchDetail();
	}, [fetchDetail]);

	// ── Loading / not found states ─────────────────────────────────────────────
	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Spinner label="Loading AR details…" />
			</div>
		);
	}

	if (notFound || !detail) {
		return (
			<div className="p-10 text-center">
				<p className="text-default-400 text-lg mb-2">AR code not found</p>
				<p className="font-mono text-default-600 font-bold">{arCode}</p>
				<Button variant="flat" className="mt-4" onPress={() => history.back()}>
					← Go back
				</Button>
			</div>
		);
	}

	const verificationPct =
		detail.totalCount > 0
			? Math.round((detail.verifiedCount / detail.totalCount) * 100)
			: 0;

	const costDelta =
		detail.estimatedCost != null
			? detail.totalAppCost - detail.estimatedCost
			: null;

	return (
		<div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
			{/* ── Back ── */}
			<button
				onClick={() => history.back()}
				className="flex items-center gap-1.5 text-sm text-default-400 hover:text-primary w-fit transition-colors"
			>
				<svg
					aria-hidden
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="m15 18-6-6 6-6" />
				</svg>
				Back to School Implementation Plan
			</button>

			{/* ── Summary card ── */}
			<div className="bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 flex flex-col gap-5">
				{/* Top row: AR code + verification chip */}
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="font-mono text-xl font-bold text-primary tracking-wide">
								{detail.arCode}
							</span>
							{detail.sipIsVerified ? (
								<Chip color="success" size="sm" variant="solid">
									All Items Verified ✓
								</Chip>
							) : (
								<Chip color="warning" size="sm" variant="flat">
									Pending Verification
								</Chip>
							)}
						</div>
						<p className="text-default-700 font-medium text-base">
							{detail.activity ?? "—"}
						</p>
						<p className="text-default-400 text-sm">
							{[detail.kra, detail.category].filter(Boolean).join(" · ")}
						</p>
					</div>

					{/* Cost comparison */}
					<div className="flex gap-6 items-start">
						<div className="text-right">
							<p className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								SIP Estimated Cost
							</p>
							<p className="text-2xl font-bold text-default-700">
								{fmt(detail.estimatedCost)}
							</p>
						</div>
						<div className="text-right">
							<p className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								Total APP Cost
							</p>
							<p className="text-2xl font-bold text-primary">
								{fmt(detail.totalAppCost)}
							</p>
							{costDelta != null && (
								<p
									className={[
										"text-xs font-semibold mt-0.5",
										costDelta > 0 ? "text-danger-500" : "text-success-600",
									].join(" ")}
								>
									{costDelta > 0 ? "+" : ""}
									{fmt(costDelta)} vs estimate
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Verification progress bar */}
				<div className="flex flex-col gap-1.5">
					<div className="flex justify-between text-xs text-default-500">
						<span>Photo Verification Progress</span>
						<span>
							{detail.verifiedCount} / {detail.totalCount} items verified
						</span>
					</div>
					<Progress
						value={verificationPct}
						color={
							verificationPct === 100
								? "success"
								: verificationPct > 0
									? "warning"
									: "default"
						}
						size="sm"
						className="w-full"
					/>
				</div>
			</div>

			{/* ── APP Items table ── */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between flex-wrap gap-2">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold">Linked APP Items</h2>
						<Chip size="sm" variant="flat">
							{detail.appItems.length}
						</Chip>
					</div>
					<Button color="primary" size="sm" onPress={onOpen}>
						+ Add Item
					</Button>
				</div>

				<Table aria-label="Linked APP items" removeWrapper>
					<TableHeader>
						<TableColumn className="w-8">#</TableColumn>
						<TableColumn>Item Description</TableColumn>
						<TableColumn>Specification</TableColumn>
						<TableColumn className="w-20">UOM</TableColumn>
						<TableColumn className="text-right w-14">Qty</TableColumn>
						<TableColumn className="text-right w-28">Price</TableColumn>
						<TableColumn className="text-right w-32">Total</TableColumn>
						<TableColumn className="w-48">Photo / Status</TableColumn>
					</TableHeader>
					<TableBody
						emptyContent={
							<div className="py-8 text-default-400 text-center">
								<p>No APP items linked yet.</p>
								<p className="text-xs mt-1">
									Use "+ Add Item" above, or seed fake items for testing.
								</p>
							</div>
						}
					>
						{detail.appItems.map((item, idx) => (
							<TableRow
								key={item.id}
								className={item.isPhotoVerified ? "bg-success-50/40" : ""}
							>
								<TableCell className="text-default-400 text-xs">
									{idx + 1}
								</TableCell>
								<TableCell>
									<span className="text-sm font-medium leading-snug">
										{item.itemDescription ?? "—"}
									</span>
								</TableCell>
								<TableCell>
									<span className="text-xs text-default-500 leading-snug">
										{item.specification ?? "—"}
									</span>
								</TableCell>
								<TableCell>
									<span className="text-xs">{item.unitOfMeasure ?? "—"}</span>
								</TableCell>
								<TableCell className="text-right text-sm">
									{item.totalQuantity ?? "—"}
								</TableCell>
								<TableCell className="text-right font-medium">
									{fmt(item.price)}
								</TableCell>
								<TableCell className="text-right font-bold">
									{fmt(item.totalAmount)}
								</TableCell>
								<TableCell>
									<PhotoCell
										item={item}
										token={token}
										onRefresh={fetchDetail}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				{/* Totals footer */}
				{detail.appItems.length > 0 && (
					<div className="flex justify-end mt-1">
						<div className="flex items-center gap-6 bg-default-50 border border-default-200 rounded-xl px-5 py-3">
							<span className="text-sm text-default-500">Total APP Cost</span>
							<span className="text-xl font-bold text-primary">
								{fmt(detail.totalAppCost)}
							</span>
							{costDelta != null && (
								<>
									<span className="text-sm text-default-400 border-l border-default-200 pl-6">
										vs SIP Estimate
									</span>
									<span
										className={[
											"text-sm font-semibold",
											costDelta > 0 ? "text-danger-500" : "text-success-600",
										].join(" ")}
									>
										{costDelta > 0 ? "+" : ""}
										{fmt(costDelta)}
									</span>
								</>
							)}
						</div>
					</div>
				)}
			</div>

			{/* ── Add Item Modal ── */}
			<AddItemModal
				sipItemId={detail.sipItemId}
				arCode={detail.arCode}
				isOpen={isOpen}
				onClose={onClose}
				onAdded={fetchDetail}
				token={token}
			/>
		</div>
	);
}
