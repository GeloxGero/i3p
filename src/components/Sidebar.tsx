// src/components/Sidebar.tsx

import { Chip, Divider, Listbox, ListboxItem } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { $fileFilter, $filterOptions, NAV_ITEMS } from "../store/filterStore";
import { $token } from "../store/authStore";
import { ChartIcon, TableIcon } from "../icons/Icons";

interface Props {
	pathname: string;
}

// ─── Nav icons ────────────────────────────────────────────────────────────────

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

// ─── Main nav items ───────────────────────────────────────────────────────────
// Comment out any entry below to hide it from the sidebar navigation.

const MAIN_NAV = [
	{ key: "/", label: "Dashboard", icon: <ChartIcon /> },
	{ key: "/projects", label: "PPAs", icon: <TableIcon /> },
	{ key: "/match", label: "Match", icon: <LinkIcon /> },
	// { key: "/reports", label: "Reports", icon: <ReportIcon /> },
] as const;

// ─────────────────────────────────────────────────────────────────────────────

export default function Sidebar({ pathname }: Props) {
	const activeFilter = useStore($fileFilter);
	const token = useStore($token);
	const isProjectsPage = pathname === "/projects";
	const isMatchPage = pathname === "/match";

	const [pendingCount, setPendingCount] = useState<number | null>(null);

	useEffect(() => {
		if (!token) return;
		fetch("http://localhost:5109/api/PlanCrossReference/pending", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((r) => r.json())
			.then((data: unknown[]) => setPendingCount(data.length))
			.catch(() => setPendingCount(null));
	}, [token]);

	return (
		<aside className="h-screen w-64 p-4 border-r border-divider flex flex-col gap-4 bg-background overflow-y-auto">
			{/* ── Main navigation ── */}
			<Listbox
				aria-label="Main Navigation"
				onAction={(key) => (window.location.href = `${key}`)}
				className="p-0 gap-2"
				itemClasses={{
					base: "px-3 rounded-lg gap-3 h-12 data-[hover=true]:bg-default-100",
					title: "text-medium font-medium",
				}}
			>
				{
					//Match Logic Here
					MAIN_NAV.map(({ key, label, icon }) => (
						<ListboxItem
							key={key}
							startContent={icon}
							endContent={
								// Match badge
								key === "/match" &&
								pendingCount !== null &&
								pendingCount > 0 ? (
									// <Chip
									// 	size="sm"
									// 	color="warning"
									// 	variant="solid"
									// 	className="h-5 min-w-5 text-[10px] font-bold px-1"
									// >
									// 	{pendingCount > 99 ? "99+" : pendingCount}
									// </Chip>

									//this is temporary and should be removed and above code to be
									//unncommented
									<span></span>
								) : undefined
							}
							classNames={
								{
									// base:
									// 	key === "/match" && isMatchPage
									// 		? "px-3 rounded-lg gap-3 h-12 bg-primary/10 text-primary"
									// 		: undefined,
									//this is temporary and should be removed and above code to be
									//unncommented
								}
							}
						>
							{label}
						</ListboxItem>
					))
				}
			</Listbox>

			{/* ── PPAs sub-filters (shown only on /projects) ── */}
			{isProjectsPage && (
				<div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
					<Divider className="my-2" />
					<p className="px-3 text-tiny font-bold text-default-400 uppercase">
						Filters
					</p>

					{/* $filterOptions is derived from NAV_ITEMS in filterStore.ts.
              Comment items out there to remove them from both here and ProjectTable. */}
					<Listbox
						aria-label="File Filters"
						variant="flat"
						disallowEmptySelection
						selectionMode="single"
						selectedKeys={[activeFilter]}
						onSelectionChange={(keys) => {
							const selected = Array.from(keys)[0];
							$fileFilter.set(selected as string);
						}}
					>
						{($filterOptions as string[]).map((key) => {
							const label = NAV_ITEMS.find((n) => n.key === key)?.label ?? key;
							return (
								<ListboxItem key={key} className="h-10">
									{label}
								</ListboxItem>
							);
						})}
					</Listbox>
				</div>
			)}
		</aside>
	);
}
