import { MONTH_NAMES, EXPENDITURE_TYPES } from "../constants";
import { useEffect, useState } from "react";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Input,
	Select,
	ModalFooter,
	Button,
	SelectItem,
} from "@heroui/react";
function AddItemModal({
	activeMonth,
	token,
	isOpen,
	onClose,
	onAdded,
}: {
	activeMonth: string;
	token: string | null;
	isOpen: boolean;
	onClose: () => void;
	onAdded: () => void;
}) {
	const yr = new Date().getFullYear();
	const mi = MONTH_NAMES.indexOf(activeMonth);
	const initialDate =
		mi >= 0 ? `${yr}-${String(mi + 1).padStart(2, "0")}-01` : `${yr}-01-01`;
	const blank = {
		date: initialDate,
		kra: "",
		sipProgram: "",
		activity: "",
		purpose: "",
		indicator: "",
		resources: "",
		quantity: "",
		estimatedCost: "",
		accountTitle: "",
		accountCode: "",
		expenditureType: "Regular Expenditure",
		status: "Implemented" as "Implemented" | "Approved",
	};
	const [form, setForm] = useState(blank);
	const [saving, setSaving] = useState(false);
	useEffect(() => {
		const m = MONTH_NAMES.indexOf(activeMonth);
		const d =
			m >= 0 ? `${yr}-${String(m + 1).padStart(2, "0")}-01` : `${yr}-01-01`;
		setForm((f) => ({ ...f, date: d }));
	}, [activeMonth, isOpen]);
	const set = (key: keyof typeof form) => (v: string) =>
		setForm((f) => ({ ...f, [key]: v }));
	const save = async () => {
		if (!form.activity || !form.estimatedCost) return;
		setSaving(true);
		try {
			await fetch(
				`https://i3p-server-1.onrender.com/api/SchoolImplementation/item`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						date: form.date,
						kra: form.kra || null,
						sipProgram: form.sipProgram || "Unimplemented",
						activity: form.activity,
						purpose: form.purpose || null,
						indicator: form.indicator || null,
						resources: form.resources || null,
						quantity: form.quantity || null,
						estimatedCost: parseFloat(form.estimatedCost) || 0,
						accountTitle: form.accountTitle || null,
						accountCode: form.accountCode || null,
						expenditureType: form.expenditureType,
						status: form.status === "Approved" ? 1 : 0,
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
		<Modal
			isOpen={isOpen}
			onOpenChange={onClose}
			size="lg"
			scrollBehavior="inside"
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-0.5">
					<span>Add Implementation Item</span>
					<span className="text-sm font-normal text-default-500">
						An AR code will be auto-generated.
					</span>
				</ModalHeader>
				<ModalBody>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<Input
							label="Date"
							type="date"
							value={form.date}
							onValueChange={set("date")}
							className="col-span-1 sm:col-span-2"
						/>
						<Select
							label="Expenditure Type"
							className="col-span-1 sm:col-span-2"
							selectedKeys={[form.expenditureType]}
							onSelectionChange={(k) =>
								set("expenditureType")(Array.from(k)[0] as string)
							}
						>
							{EXPENDITURE_TYPES.map((t) => (
								<SelectItem key={t}>{t}</SelectItem>
							))}
						</Select>
						<Input
							label="KRA"
							value={form.kra}
							onValueChange={set("kra")}
							className="col-span-1 sm:col-span-2"
						/>
						<Input
							label="Specific Program (SiP)"
							value={form.sipProgram}
							onValueChange={set("sipProgram")}
						/>
						<Input
							label="Activity / PPA"
							value={form.activity}
							onValueChange={set("activity")}
							isRequired
						/>
						<Input
							label="Purpose"
							value={form.purpose}
							onValueChange={set("purpose")}
							className="col-span-1 sm:col-span-2"
						/>
						<Input
							label="Performance Indicator"
							value={form.indicator}
							onValueChange={set("indicator")}
							className="col-span-1 sm:col-span-2"
						/>
						<Input
							label="Resources"
							value={form.resources}
							onValueChange={set("resources")}
						/>
						<Input
							label="Quantity"
							value={form.quantity}
							onValueChange={set("quantity")}
						/>
						<Input
							label="Estimated Cost (₱)"
							value={form.estimatedCost}
							onValueChange={set("estimatedCost")}
							type="number"
							isRequired
						/>
						<div className="flex flex-col gap-1.5">
							<span className="text-sm text-default-600">Status</span>
							<div className="flex gap-2">
								{(["Implemented", "Approved"] as const).map((s) => (
									<button
										key={s}
										type="button"
										onClick={() => setForm((f) => ({ ...f, status: s }))}
										className={[
											"flex-1 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all",
											form.status === s
												? s === "Approved"
													? "border-success bg-success/10 text-success-700"
													: "border-warning bg-warning/10 text-warning-700"
												: "border-default-200 text-default-500 hover:border-default-300",
										].join(" ")}
									>
										{s}
									</button>
								))}
							</div>
						</div>
						<Input
							label="Account Title"
							value={form.accountTitle}
							onValueChange={set("accountTitle")}
							className="col-span-1 sm:col-span-2"
						/>
						<Input
							label="Account Code"
							value={form.accountCode}
							onValueChange={set("accountCode")}
						/>
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
						isDisabled={!form.activity || !form.estimatedCost}
					>
						Add Line Item
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export { AddItemModal };
