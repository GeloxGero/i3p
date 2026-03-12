import { Listbox, ListboxItem, Divider, Chip } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { $fileFilter, $filterOptions } from "../store/filterStore";
import { ChartIcon, TableIcon } from "../icons/Icons";
import { useEffect, useState } from "react";
import { $token } from "../store/authStore";

interface Props {
	pathname: string;
}

// Simple link-match icon
function LinkIcon() {
	return (
		<svg
			aria-hidden
			fill="none"
			height="20"
			width="20"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={1.8}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
		</svg>
	);
}

export default function Sidebar({ pathname }: Props) {
	const activeFilter = useStore($fileFilter);
	const token = useStore($token);
	const isProjectsPage = pathname === "/projects";

	const [pendingCount, setPendingCount] = useState<number | null>(null);

	// Fetch the global pending-review count for the badge
	useEffect(() => {
		if (!token) return;
		fetch("http://localhost:5109/api/PlanCrossReference/pending", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((r) => r.json())
			.then((data: unknown[]) => setPendingCount(data.length))
			.catch(() => setPendingCount(null));
	}, [token]);

	const isMatchPage = pathname === "/match";

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

				{/* Match page nav item with live pending badge */}
				<ListboxItem
					key="/match"
					startContent={<LinkIcon />}
					endContent={
						pendingCount !== null && pendingCount > 0 ? (
							<Chip
								size="sm"
								color="warning"
								variant="solid"
								className="h-5 min-w-5 text-[10px] font-bold px-1"
							>
								{pendingCount > 99 ? "99+" : pendingCount}
							</Chip>
						) : undefined
					}
					classNames={{
						base: isMatchPage
							? "px-3 rounded-lg gap-3 h-12 bg-primary/10 text-primary"
							: undefined,
					}}
				>
					Match
				</ListboxItem>
			</Listbox>

			{/* Conditional filter list — PPAs page only */}
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
