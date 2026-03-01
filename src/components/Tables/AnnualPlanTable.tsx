import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Button,
	Select,
	SelectItem,
	Spinner,
	select,
	Divider,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from "@heroui/react";
import { useEffect, useState, useRef } from "react";
import { $token } from "../../store/authStore";
import { useStore } from "@nanostores/react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export default function AnnualPlanTable() {
	// 1. State for the list of available years
	const [planHeaders, setPlanHeaders] = useState<any[]>([]);
	// 2. State for the currently selected plan's full data
	const [selectedPlan, setSelectedPlan] = useState<any>(null);

	const [loadingHeaders, setLoadingHeaders] = useState(true);
	const [loadingItems, setLoadingItems] = useState(false);
	const [uploading, setUploading] = useState(false);

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [previewData, setPreviewData] = useState<any[]>([]);
	const [fileToUpload, setFileToUpload] = useState<File | null>(null);

	const token = useStore($token);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const TOTAL_COLUMNS = 7;

	// Handle File Selection (Parse, then Open Modal)
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setFileToUpload(file);

		const reader = new FileReader();

		reader.onload = (e) => {
			const data = e.target?.result;

			// Read the workbook
			const workbook = XLSX.read(data, { type: "binary" });

			// Assume the first sheet is the one you want
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];

			// Convert to JSON
			const json = XLSX.utils.sheet_to_json(worksheet);
			const formattedData = json.map((row: any) => ({
				itemDescription: row["Description"] || row["Item"], // Adjust keys to match your CSV/Excel headers
				totalQuantity: row["Qty"] || row["Quantity"],
				// ... map other fields
			}));
			setPreviewData(formattedData);
			onOpen();
		};

		reader.readAsBinaryString(file);
	};

	// The actual API call moves here
	const confirmUpload = async () => {
		if (!fileToUpload) return;
		setUploading(true);
		const formData = new FormData();
		formData.append("file", fileToUpload);

		try {
			await fetch("http://localhost:5109/api/AnnualProcurementPlan/import", {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});
			await fetchPlanHeaders();
			alert("Uploaded successfully!");
			onClose();
		} catch (e) {
			alert("Upload failed.");
		} finally {
			setUploading(false);
		}
	};

	// Fetch only the list of years/plans (No items yet)
	const fetchPlanHeaders = async () => {
		try {
			const response = await fetch(
				"http://localhost:5109/api/AnnualProcurementPlan",
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const result = await response.json();
			setPlanHeaders(result);
		} finally {
			setLoadingHeaders(false);
		}
	};

	// Fetch full items only when a year is selected
	const fetchItemsForPlan = async (planId: string) => {
		setLoadingItems(true);
		try {
			const response = await fetch(
				`http://localhost:5109/api/AnnualProcurementPlan/${planId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const result = await response.json();
			setSelectedPlan(result);
		} finally {
			setLoadingItems(false);
		}
	};

	useEffect(() => {
		fetchPlanHeaders();
	}, [token]);

	// Handle Dropdown Change
	const handleSelectionChange = (keys: any) => {
		const selectedId = Array.from(keys)[0] as string;
		if (selectedId) {
			fetchItemsForPlan(selectedId);
		}
		console.log(selectedPlan);
	};

	if (loadingHeaders) return <div>Loading available years...</div>;

	return (
		<div className="flex flex-col gap-8">
			<div className="flex justify-between items-center">
				{/* YEAR DROPDOWN */}
				<Select
					label="Select Annual Plan Year"
					className="max-w-xs"
					onSelectionChange={handleSelectionChange}
				>
					{planHeaders.map((plan) => (
						<SelectItem key={plan.id}>{plan.year}</SelectItem>
					))}
				</Select>

				<div className="flex gap-2">
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						accept=".csv, .xlsx"
						className="hidden"
					/>
					<Button
						color="primary"
						onPress={() => fileInputRef.current?.click()}
						isLoading={uploading}
					>
						{uploading ? "Importing..." : "Import File"}
					</Button>
				</div>
				{/* THE MODAL */}
				<Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
					<ModalContent>
						<ModalHeader>Confirm Import Data</ModalHeader>
						<ModalBody className="max-h-[60vh] overflow-y-auto">
							<Table aria-label="Preview">
								{/* Use your standard Headers here to preview */}
								<TableHeader>
									<TableColumn>ITEM</TableColumn>
									<TableColumn>QTY</TableColumn>
									{/* ... add other columns ... */}
								</TableHeader>
								<TableBody>
									{previewData.map((row, idx) => (
										<TableRow key={idx}>
											<TableCell>{row.itemDescription}</TableCell>
											<TableCell>{row.totalQuantity}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</ModalBody>
						<ModalFooter>
							<Button color="danger" onPress={onClose}>
								Cancel
							</Button>
							<Button
								color="primary"
								isLoading={uploading}
								onPress={confirmUpload}
							>
								Confirm & Import
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			</div>

			{/* CONDITIONAL RENDERING */}
			{loadingItems ? (
				<div className="flex justify-center p-10">
					<Spinner label="Loading items..." />
				</div>
			) : selectedPlan ? (
				<div className="flex flex-col gap-2">
					<h2 className="text-2xl font-bold">Plan for {selectedPlan.year}</h2>

					<Table aria-label="Selected Plan Table">
						<TableHeader>
							<TableColumn>No.</TableColumn>
							<TableColumn>ITEM DESCRIPTION</TableColumn>
							<TableColumn>SPECIFICATION</TableColumn>
							<TableColumn>UNIT</TableColumn>
							<TableColumn>QTY</TableColumn>
							<TableColumn>PRICE</TableColumn>
							<TableColumn>TOTAL</TableColumn>
						</TableHeader>
						<TableBody emptyContent={"No items found."}>
							{(selectedPlan.items || []).map((item: any) => (
								<TableRow key={item.id}>
									<TableCell>{item.no}</TableCell>
									<TableCell>{item.itemDescription}</TableCell>
									<TableCell>{item.specification}</TableCell>
									<TableCell>{item.unitOfMeasure}</TableCell>
									<TableCell>{item.totalQuantity}</TableCell>
									<TableCell>₱{item.price?.toLocaleString()}</TableCell>
									<TableCell className="font-bold text-primary">
										₱{item.totalAmount?.toLocaleString()}
									</TableCell>
								</TableRow>
							))}

							{/* Updated Footer Row */}
							<TableRow className="bg-default-100/50" key="grand-total-row">
								{/* colSpan={5} means it takes up 5 column slots, + 1 cell for Total = 6 total slots */}
								<TableCell
									colSpan={TOTAL_COLUMNS - 1}
									className="font-bold text-right text-lg"
								>
									Grand Total
								</TableCell>
								<TableCell className="font-bold text-primary text-lg">
									₱{(selectedPlan.yearTotal ?? 0).toLocaleString()}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
			) : (
				<div className="text-gray-500 text-center p-10">
					Please select a year from the dropdown to view procurement items.
				</div>
			)}
		</div>
	);
}
