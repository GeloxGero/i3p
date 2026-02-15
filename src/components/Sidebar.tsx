import { Listbox, ListboxItem, Divider } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { $fileFilter, $filterOptions } from "../store/filterStore";
import { ChartIcon, TableIcon } from "../icons/Icons";

interface Props {
	pathname: string;
}

export default function Sidebar({ pathname }: Props) {
	const activeFilter = useStore($fileFilter);
	// Determine if we are on the projects/PPAs page
	const isProjectsPage = pathname === "/projects";

	return (
		<aside className="h-screen w-64 p-4 border-r border-divider flex flex-col gap-4 bg-background overflow-y-auto">
			<Listbox
				aria-label="Main Navigation"
				onAction={(key) => (window.location.href = `${key}`)}
				className="p-0 gap-2"
				itemClasses={{
					base: "px-3 rounded-lg gap-3 h-12 data-[hover=true]:bg-default-100",
					title: "text-medium font-medium",
				}}
			>
				<ListboxItem key="/" startContent={<ChartIcon />}>
					Dashboard
				</ListboxItem>

				<ListboxItem key="/projects" startContent={<TableIcon />}>
					PPAs
				</ListboxItem>
			</Listbox>

			{/* Conditional Filter List: Only shows when on the PPAs page */}
			{isProjectsPage && (
				<div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
					<Divider className="my-2" />
					<p className="px-3 text-tiny font-bold text-default-400 uppercase">
						Filters
					</p>

					<Listbox
						aria-label="File Filters"
						variant="flat"
						disallowEmptySelection
						selectionMode="single"
						selectedKeys={[activeFilter]}
						onSelectionChange={(keys) => {
							const selected = Array.from(keys)[0];
							$fileFilter.set(selected as any);
						}}
					>
						{$filterOptions.map((option) => (
							<ListboxItem key={option} className="h-10">
								{option.replace("-", " ")}
							</ListboxItem>
						))}
					</Listbox>
				</div>
			)}
		</aside>
	);
}
