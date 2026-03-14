import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
	Navbar,
	NavbarBrand,
	NavbarContent,
	Avatar,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import { $token, $userProfile } from "../store/authStore";

export const AcmeLogo = () => (
	<svg fill="none" height="32" viewBox="0 0 32 32" width="32">
		<path
			clipRule="evenodd"
			d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
			fill="currentColor"
			fillRule="evenodd"
		/>
	</svg>
);

export default function Nav() {
	const token = useStore($token);
	const profile = useStore($userProfile);
	const [mounted, setMounted] = useState(false);

	// Avoid SSR mismatch — only render user-specific UI after hydration
	useEffect(() => {
		setMounted(true);
	}, []);

	// Fetch profile on mount if we have a token but no cached profile yet
	useEffect(() => {
		if (!token || profile) return;
		fetch("http://localhost:5109/api/user/GetProfile", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (data) $userProfile.set(data);
			})
			.catch(() => {});
	}, [token]);

	const displayName = profile?.name ?? "";

	const handleLogout = () => {
		$token.set(null);
		$userProfile.set(null);
		window.location.href = "/login";
	};

	return (
		<Navbar
			shouldHideOnScroll
			maxWidth="full"
			className="h-16 border-b border-divider"
		>
			<NavbarBrand>
				<a href="/" className="flex items-center gap-1.5">
					<AcmeLogo />
					<p className="font-bold text-inherit">i3P</p>
				</a>
			</NavbarBrand>

			<NavbarContent justify="end">
				{mounted && (
					<Dropdown>
						<DropdownTrigger>
							<Avatar
								name={displayName || undefined}
								showFallback
								className="hover:cursor-pointer w-8 h-8 text-sm"
							/>
						</DropdownTrigger>
						<DropdownMenu aria-label="User menu">
							{/* Identity header — read-only, not a nav item */}
							{profile != null ? (
								<DropdownItem
									key="user-info"
									isReadOnly
									className="opacity-100 cursor-default data-[hover=true]:bg-transparent"
									textValue={profile.name}
								>
									<div className="flex flex-col gap-0.5 py-0.5">
										<span className="text-sm font-semibold text-default-800 truncate">
											{profile.name}
										</span>
										<span className="text-xs text-default-400 truncate">
											{profile.email}
										</span>
									</div>
								</DropdownItem>
							) : (
								<DropdownItem
									key="user-info"
									isReadOnly
									className="opacity-100 cursor-default"
									textValue="Loading"
								>
									<span className="text-xs text-default-400">Loading…</span>
								</DropdownItem>
							)}

							<DropdownItem key="profile" href="/profile">
								My Profile
							</DropdownItem>

							<DropdownItem
								key="logout"
								className="text-danger"
								color="danger"
								onPress={handleLogout}
							>
								Sign Out
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				)}
			</NavbarContent>
		</Navbar>
	);
}
