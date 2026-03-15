import { useEffect, useState, useCallback, useRef } from "react";
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
import { $currentArCode } from "../store/tableStore";

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

const API = "https://i3p-server-1.onrender.com";

function fmt(n: number | null | undefined) {
	if (n == null) return "—";
	return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

// ─── Image Viewer Modal ───────────────────────────────────────────────────────

function ImageViewerModal({
	item,
	isOpen,
	onClose,
	token,
	onVerified,
}: {
	item: ArAppItem | null;
	isOpen: boolean;
	onClose: () => void;
	token: string | null;
	onVerified: () => void;
}) {
	const [verifying, setVerifying] = useState(false);
	const [imgError, setImgError] = useState(false);

	// Reset error state when item changes
	useEffect(() => {
		setImgError(false);
	}, [item]);

	if (!item) return null;

	const photoUrl =
		"https://res.cloudinary.com/dlzobzben/image/upload/asfehas_wrc8kx.png";
	//const photoUrl = item.photoPath ? `${API}/${item.photoPath}` : null;

	// Build a direct download URL — append ?download=1 so the server sends
	// Content-Disposition: attachment if it supports it, otherwise it just opens.
	const downloadUrl = photoUrl;
	const filename = item.photoPath?.split("/").pop() ?? "receipt";

	const verify = async () => {
		setVerifying(true);
		try {
			await fetch(
				`https://i3p-server-1.onrender.com/api/Ar/verify-photo/${item.id}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ verifiedBy: "admin" }),
				},
			);
			onVerified();
			onClose();
		} finally {
			setVerifying(false);
		}
	};

	const downloadFile = () => {
		if (!downloadUrl) return;
		const a = document.createElement("a");
		a.href = downloadUrl;
		a.download = filename;
		a.target = "_blank";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onClose}
			size="3xl"
			scrollBehavior="inside"
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-0.5">
					<div className="flex items-center gap-2">
						<span>Photo Evidence</span>
						{item.isPhotoVerified && (
							<Chip size="sm" color="success" variant="flat">
								Verified ✓
							</Chip>
						)}
					</div>
					<span className="text-sm font-normal text-default-500 truncate">
						{item.itemDescription ?? "APP Item"}
					</span>
				</ModalHeader>

				<ModalBody className="px-6 pb-2">
					{/* ── Image / PDF display ── */}
					{!photoUrl ? (
						<div className="flex flex-col items-center justify-center h-64 bg-default-50 rounded-xl border border-dashed border-default-200 text-default-400">
							<svg
								aria-hidden
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={1.5}
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mb-3 opacity-40"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" />
								<circle cx="8.5" cy="8.5" r="1.5" />
								<polyline points="21 15 16 10 5 21" />
							</svg>
							<span className="text-sm">No photo uploaded</span>
						</div>
					) : item.photoPath?.toLowerCase().endsWith(".pdf") ? (
						// PDF — embed viewer
						<div className="w-full h-[500px] rounded-xl overflow-hidden border border-default-200">
							<iframe
								src={photoUrl}
								className="w-full h-full"
								title="Receipt PDF"
							/>
						</div>
					) : imgError ? (
						<div className="flex flex-col items-center justify-center h-64 bg-danger-50 rounded-xl border border-danger-200 text-danger-500 gap-2">
							<span className="text-sm font-medium">Could not load image</span>
							<Button
								size="sm"
								variant="flat"
								color="primary"
								onPress={downloadFile}
							>
								Download instead
							</Button>
						</div>
					) : (
						// Image — show full-size with zoom-on-hover feel
						<div className="relative w-full rounded-xl overflow-hidden border border-default-200 bg-default-50 flex items-center justify-center min-h-[300px]">
							<img
								src={photoUrl}
								alt={`Receipt for ${item.itemDescription}`}
								className="max-w-full max-h-[520px] object-contain"
								onError={() => setImgError(true)}
							/>
							{/* Overlay download button */}
							<a
								href={photoUrl}
								download={filename}
								target="_blank"
								rel="noreferrer"
								className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium hover:bg-black/80 transition-colors backdrop-blur-sm"
							>
								<svg
									aria-hidden
									width="13"
									height="13"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="7 10 12 15 17 10" />
									<line x1="12" y1="15" x2="12" y2="3" />
								</svg>
								Download
							</a>
						</div>
					)}

					{/* ── Item details ── */}
					<div className="grid grid-cols-2 gap-3 mt-4 text-sm">
						<div className="bg-default-50 rounded-xl p-3 flex flex-col gap-0.5">
							<span className="text-xs text-default-400 uppercase tracking-wide">
								Unit Price
							</span>
							<span className="font-semibold">{fmt(item.price)}</span>
						</div>
						<div className="bg-default-50 rounded-xl p-3 flex flex-col gap-0.5">
							<span className="text-xs text-default-400 uppercase tracking-wide">
								Total Amount
							</span>
							<span className="font-semibold text-primary">
								{fmt(item.totalAmount)}
							</span>
						</div>
						<div className="bg-default-50 rounded-xl p-3 flex flex-col gap-0.5">
							<span className="text-xs text-default-400 uppercase tracking-wide">
								Quantity
							</span>
							<span className="font-semibold">
								{item.totalQuantity ?? "—"} {item.unitOfMeasure ?? ""}
							</span>
						</div>
						<div className="bg-default-50 rounded-xl p-3 flex flex-col gap-0.5">
							<span className="text-xs text-default-400 uppercase tracking-wide">
								Verification
							</span>
							{item.isPhotoVerified ? (
								<span className="text-success-600 font-semibold text-xs">
									✓ Verified by {item.verifiedBy ?? "admin"}
									{item.verifiedAt &&
										` on ${new Date(item.verifiedAt).toLocaleDateString("en-PH")}`}
								</span>
							) : (
								<span className="text-warning-600 font-semibold text-xs">
									Pending review
								</span>
							)}
						</div>
					</div>
				</ModalBody>

				<ModalFooter>
					{/* Download button always available */}
					{photoUrl && (
						<Button
							variant="flat"
							onPress={downloadFile}
							startContent={
								<svg
									aria-hidden
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="7 10 12 15 17 10" />
									<line x1="12" y1="15" x2="12" y2="3" />
								</svg>
							}
						>
							Download
						</Button>
					)}
					<Button variant="flat" onPress={onClose}>
						Close
					</Button>
					{/* Verify button — only shown when photo exists and not yet verified */}
					{photoUrl && !item.isPhotoVerified && (
						<Button color="success" isLoading={verifying} onPress={verify}>
							✓ Mark as Verified
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

// ─── Photo Cell ───────────────────────────────────────────────────────────────

function PhotoCell({
	item,
	token,
	onRefresh,
	onViewPhoto,
}: {
	item: ArAppItem;
	token: string | null;
	onRefresh: () => void;
	onViewPhoto: (item: ArAppItem) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);

	const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploading(true);
		const fd = new FormData();
		fd.append("photo", file);
		await fetch(`https://i3p-server-1.onrender.com/api/Ar/photo/${item.id}`, {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: fd,
		});
		setUploading(false);
		onRefresh();
		e.target.value = "";
	};

	if (item.isPhotoVerified) {
		return (
			<div className="flex items-center gap-1.5 flex-wrap">
				<Chip size="sm" color="success" variant="flat">
					✓ Verified
				</Chip>
				<button
					onClick={() => onViewPhoto(item)}
					className="text-xs text-primary underline hover:text-primary-600 transition-colors"
				>
					View photo
				</button>
			</div>
		);
	}

	if (item.photoPath) {
		return (
			<div className="flex items-center gap-2 flex-wrap">
				<button
					onClick={() => onViewPhoto(item)}
					className="text-xs text-primary underline hover:text-primary-600 transition-colors font-medium"
				>
					View photo ↗
				</button>
				<Chip size="sm" color="warning" variant="flat">
					Pending review
				</Chip>
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
	const set = (k: keyof typeof form) => (v: string) =>
		setForm((f) => ({ ...f, [k]: v }));
	const totalPreview = Number(form.totalQuantity) * Number(form.price) || null;
	const save = async () => {
		setSaving(true);
		try {
			await fetch(
				`https://i3p-server-1.onrender.com/api/Ar/add-item/${sipItemId}`,
				{
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
				},
			);
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
							Total:{" "}
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

interface ArDetailPageProps {
	arCode?: string | Record<string, string | undefined>;
}

export default function ArDetailPage({
	arCode: arCodeProp,
}: ArDetailPageProps) {
	const token = useStore($token);
	const arCode = useStore($currentArCode);

	const [detail, setDetail] = useState<ArDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	// Add item modal
	const {
		isOpen: addOpen,
		onOpen: openAdd,
		onClose: closeAdd,
	} = useDisclosure();
	// Image viewer modal
	const {
		isOpen: imgOpen,
		onOpen: openImg,
		onClose: closeImg,
	} = useDisclosure();
	const [viewingItem, setViewingItem] = useState<ArAppItem | null>(null);

	const fetchDetail = useCallback(async () => {
		if (!arCode) return;
		const cleanArCode = arCode.includes("/")
			? arCode.split("/").pop()!
			: arCode;
		setLoading(true);
		try {
			const res = await fetch(
				`https://i3p-server-1.onrender.com/api/Ar/${encodeURIComponent(cleanArCode)}`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
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
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		if (code) {
			$currentArCode.set(code);
		}
		fetchDetail();
	}, [fetchDetail]);

	const handleViewPhoto = (item: ArAppItem) => {
		setViewingItem(item);
		openImg();
	};

	if (loading || !arCode)
		return (
			<div className="flex justify-center items-center h-64">
				<Spinner label="Loading AR details…" />
			</div>
		);

	if (notFound || !detail)
		return (
			<div className="p-10 text-center">
				<p className="text-default-400 text-lg mb-2">AR code not found</p>
				<p className="font-mono text-default-600 font-bold">{arCode}</p>
				<Button variant="flat" className="mt-4" onPress={() => history.back()}>
					← Go back
				</Button>
			</div>
		);

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
			{/* Back */}
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

			{/* Summary card */}
			<div className="bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 flex flex-col gap-5">
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
					<div className="flex gap-6 items-start">
						<div className="text-right">
							<p className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								Program Estimated Cost
							</p>
							<p className="text-2xl font-bold text-default-700">
								{fmt(detail.estimatedCost)}
							</p>
						</div>
						<div className="text-right">
							<p className="text-xs text-default-400 uppercase tracking-wide mb-0.5">
								Current Total Cost
							</p>
							<p className="text-2xl font-bold text-primary">
								{fmt(detail.totalAppCost)}
							</p>
							{costDelta != null && (
								<p
									className={`text-xs font-semibold mt-0.5 ${costDelta > 0 ? "text-danger-500" : "text-success-600"}`}
								>
									{costDelta > 0 ? "+" : ""}
									{fmt(costDelta)} vs estimate
								</p>
							)}
						</div>
					</div>
				</div>
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

			{/* APP Items table */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between flex-wrap gap-2">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold">Linked APP Items</h2>
						<Chip size="sm" variant="flat">
							{detail.appItems.length}
						</Chip>
					</div>
					<Button color="primary" size="sm" onPress={openAdd}>
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
						<TableColumn className="w-52">Photo / Status</TableColumn>
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
										onViewPhoto={handleViewPhoto}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

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
										className={`text-sm font-semibold ${costDelta > 0 ? "text-danger-500" : "text-success-600"}`}
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

			{/* Add Item Modal */}
			<AddItemModal
				sipItemId={detail.sipItemId}
				arCode={detail.arCode}
				isOpen={addOpen}
				onClose={closeAdd}
				onAdded={fetchDetail}
				token={token}
			/>

			{/* Image Viewer Modal */}
			<ImageViewerModal
				item={viewingItem}
				isOpen={imgOpen}
				onClose={closeImg}
				token={token}
				onVerified={fetchDetail}
			/>
		</div>
	);
}
