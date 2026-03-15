import { Chip, Divider, Listbox, ListboxItem } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { $fileFilter, $filterOptions, NAV_ITEMS } from "../store/filterStore";
import { $token } from "../store/authStore";

interface Props {
	pathname: string;
}

// ─── Shared icon set — used in both Sidebar (desktop) and bottom nav (mobile) ──
// Export them so MainLayout.astro can re-use the same SVGs.

export function DashboardIcon({ size = 20 }: { size?: number }) {
	return (
		<svg
			aria-hidden
			fill="none"
			height={size}
			width={size}
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={1.8}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="3" width="7" height="7" rx="1" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
			<rect x="14" y="14" width="7" height="7" rx="1" />
		</svg>
	);
}

export function PPAsIcon({ size = 20 }: { size?: number }) {
	return (
		<svg
			aria-hidden
			fill="none"
			height={size}
			width={size}
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={1.8}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<line x1="16" y1="13" x2="8" y2="13" />
			<line x1="16" y1="17" x2="8" y2="17" />
			<polyline points="10 9 9 9 8 9" />
		</svg>
	);
}

export function MatchIcon({ size = 20 }: { size?: number }) {
	return (
		<svg
			aria-hidden
			fill="none"
			height={size}
			width={size}
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

export function ProfileIcon({ size = 20 }: { size?: number }) {
	return (
		<svg
			aria-hidden
			fill="none"
			height={size}
			width={size}
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={1.8}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	);
}

const MAIN_NAV = [
	{ key: "/", label: "Dashboard", icon: <DashboardIcon /> },
	{ key: "/projects", label: "PPAs", icon: <PPAsIcon /> },
	{ key: "/match", label: "Match", icon: <MatchIcon /> },
] as const;

export default function Sidebar({ pathname }: Props) {
	const activeFilter = useStore($fileFilter);
	const token = useStore($token);
	const isProjectsPage = pathname === "/projects";
	const [pendingCount, setPendingCount] = useState<number | null>(null);

	useEffect(() => {
		if (!token) return;
		fetch("https://i3p-server-1.onrender.com/api/PlanCrossReference/pending", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((r) => r.json())
			.then((d: unknown[]) => setPendingCount(d.length))
			.catch(() => setPendingCount(null));
	}, [token]);

	return (
		<aside className="h-screen w-56 p-3 border-r border-divider flex flex-col gap-3 bg-background overflow-y-auto">
			<Listbox
				aria-label="Main Navigation"
				onAction={(key) => (window.location.href = `${key}`)}
				className="p-0 gap-1"
				itemClasses={{
					base: "px-3 rounded-lg gap-3 h-11 data-[hover=true]:bg-default-100",
					title: "text-sm font-medium",
				}}
			>
				{MAIN_NAV.map(({ key, label, icon }) => (
					<ListboxItem
						key={key}
						startContent={icon}
						classNames={{
							base: pathname === key ? "bg-default-100" : undefined,
						}}
						endContent={
							key === "/match" && pendingCount && pendingCount > 0 ? (
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
					>
						{label}
					</ListboxItem>
				))}
			</Listbox>

			{isProjectsPage && (
				<div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
					<Divider className="my-1" />
					<p className="px-3 text-[10px] font-bold text-default-400 uppercase tracking-wider">
						Filters
					</p>
					<Listbox
						aria-label="File Filters"
						variant="flat"
						disallowEmptySelection
						selectionMode="single"
						selectedKeys={[activeFilter]}
						onSelectionChange={(keys) => {
							const s = Array.from(keys)[0];
							$fileFilter.set(s as string);
						}}
					>
						{($filterOptions as string[]).map((key) => {
							const label = NAV_ITEMS.find((n) => n.key === key)?.label ?? key;
							return (
								<ListboxItem key={key} className="h-9 text-sm">
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
