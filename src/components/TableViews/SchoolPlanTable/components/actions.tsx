import {
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	Button,
	DropdownItem,
} from "@heroui/react";
import { ALL_COLUMNS } from "../constants";
//temporary file
//actions files are a mix of component renderers and util functions

function ColumnChooser({
	visibleCols,
	onChange,
}: {
	visibleCols: Set<string>;
	onChange: (k: Set<string>) => void;
}) {
	return (
		<Dropdown closeOnSelect={false}>
			<DropdownTrigger>
				<Button variant="flat" size="sm">
					Columns
				</Button>
			</DropdownTrigger>
			<DropdownMenu
				disallowEmptySelection
				aria-label="Toggle columns"
				selectionMode="multiple"
				selectedKeys={visibleCols}
				onSelectionChange={(k) => onChange(new Set(k as Set<string>))}
			>
				{ALL_COLUMNS.map((col) => (
					<DropdownItem key={col.uid}>{col.label}</DropdownItem>
				))}
			</DropdownMenu>
		</Dropdown>
	);
}

function TemplateDownloadDropdown() {
	const handleDownload = (url: string, filename: string) => {
		const link = document.createElement("a");
		link.href = url;
		// Setting the download attribute suggests the filename to the browser
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const templates = {
		app: {
			url: "https://res.cloudinary.com/dlzobzben/raw/upload/v1773595856/AnnualProcurementPlan_Template_tep3fq.xlsx",
			name: "Annual_Procurement_Plan_Template.xlsx",
		},
		apc: {
			url: "https://res.cloudinary.com/dlzobzben/raw/upload/v1773595856/SchoolImplementationPlan_Template_vn7ijg.xlsx",
			name: "School_Implementation_Plan_Template.xlsx",
		},
	};

	return (
		<Dropdown>
			<DropdownTrigger>
				<Button variant="flat" size="sm">
					Download Templates
				</Button>
			</DropdownTrigger>
			<DropdownMenu
				aria-label="Download Excel templates"
				onAction={(key) => {
					const selection = templates[key as keyof typeof templates];
					if (selection) {
						handleDownload(selection.url, selection.name);
					}
				}}
			>
				<DropdownItem key="app">Download Annual Procurement Plan</DropdownItem>
				<DropdownItem key="apc">
					Download School Implementation Plan
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}

export { TemplateDownloadDropdown, ColumnChooser };
