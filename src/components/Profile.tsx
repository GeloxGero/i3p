import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $token, $userProfile } from "../store/authStore";

const AUTHORITY_LABEL: Record<number, string> = {
	0: "Normal User",
	1: "Administrator",
};
const AUTHORITY_COLOR: Record<number, string> = { 0: "#22c55e", 1: "#f59e0b" };

export default function Profile() {
	const token = useStore($token);
	const [mounted, setMounted] = useState(false);
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<any>(null);
	const [loggingOut, setLoggingOut] = useState(false);

	useEffect(() => {
		if (!mounted) return;

		// Access localStorage directly if the store feels "empty" on first tick
		const activeToken = token || localStorage.getItem("token");

		if (!activeToken) {
			console.log("No token found in store or storage");
			window.location.href = "/login";
			return;
		}

		(async () => {
			try {
				const res = await fetch("http://localhost:5109/api/user/GetProfile", {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (res.ok) {
					const d = await res.json();
					setProfile(d);
					$userProfile.set(d);
				} else {
					$token.set(null);
					window.location.href = "/login";
				}
			} catch {
			} finally {
				setLoading(false);
			}
		})();
	}, [token, mounted]);

	const handleLogout = async () => {
		setLoggingOut(true);
		await new Promise((r) => setTimeout(r, 400));
		$token.set(null);
		window.location.href = "/login";
	};

	// Skeleton
	if (!mounted || loading)
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
				<div className="w-full max-w-sm p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-pulse flex flex-col items-center gap-5">
					<div className="w-24 h-24 rounded-full bg-white/[0.06]" />
					<div className="h-5 w-40 rounded-lg bg-white/[0.06]" />
					<div className="h-4 w-56 rounded-lg bg-white/[0.06]" />
					<div className="h-10 w-full rounded-xl bg-white/[0.06]" />
				</div>
			</div>
		);

	const initials =
		profile?.name
			?.split(" ")
			.map((w: string) => w[0])
			.join("")
			.slice(0, 2)
			.toUpperCase() ?? "?";
	const authority = profile?.authority ?? 0;

	return (
		<div
			className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4"
			style={{
				backgroundImage:
					"radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)",
			}}
		>
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					backgroundImage:
						"linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			<div className="relative w-full max-w-sm">
				<div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-transparent pointer-events-none" />
				<div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl shadow-2xl overflow-hidden">
					{/* Top accent bar */}
					<div
						className="h-1 w-full"
						style={{
							background: `linear-gradient(90deg, transparent, ${AUTHORITY_COLOR[authority]}, transparent)`,
						}}
					/>

					<div className="p-8 flex flex-col items-center gap-6">
						{/* Avatar */}
						<div className="relative">
							{profile?.photo ? (
								<img
									src={profile.photo}
									alt={profile.name}
									className="w-24 h-24 rounded-full object-cover border-2 border-white/10"
								/>
							) : (
								<div
									className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-white/10"
									style={{
										background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
									}}
								>
									{initials}
								</div>
							)}
							{/* Online dot */}
							<span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#0f1117]" />
						</div>

						{/* Name & email */}
						<div className="text-center">
							<h1
								className="text-xl font-bold text-white mb-1"
								style={{ fontFamily: "'Georgia', serif" }}
							>
								{profile?.name}
							</h1>
							<p className="text-sm text-white/40">{profile?.email}</p>
						</div>

						{/* Role badge */}
						<span
							className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border"
							style={{
								color: AUTHORITY_COLOR[authority],
								borderColor: `${AUTHORITY_COLOR[authority]}33`,
								background: `${AUTHORITY_COLOR[authority]}11`,
							}}
						>
							{AUTHORITY_LABEL[authority] ?? "User"}
						</span>

						{/* Details */}
						<div className="w-full divide-y divide-white/[0.05] rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
							<div className="flex items-center justify-between px-4 py-3">
								<span className="text-xs text-white/40">Account Type</span>
								<span className="text-xs font-medium text-white/80">
									Standard Ledger
								</span>
							</div>
							<div className="flex items-center justify-between px-4 py-3">
								<span className="text-xs text-white/40">Status</span>
								<span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
									<span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
									Active
								</span>
							</div>
							<div className="flex items-center justify-between px-4 py-3">
								<span className="text-xs text-white/40">Member since</span>
								<span className="text-xs font-medium text-white/80">
									{profile?.dateCreated
										? new Date(profile.dateCreated).toLocaleDateString(
												"en-PH",
												{ year: "numeric", month: "short" },
											)
										: "—"}
								</span>
							</div>
						</div>

						{/* Actions */}
						<div className="w-full flex flex-col gap-2">
							<a
								href="/"
								className="w-full py-2.5 rounded-xl border border-white/[0.08] text-white/70 text-sm font-medium text-center hover:border-white/20 hover:text-white transition-all"
							>
								← Back to Dashboard
							</a>
							<button
								onClick={handleLogout}
								disabled={loggingOut}
								className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 hover:border-red-500/30 transition-all disabled:opacity-60"
							>
								{loggingOut ? "Signing out…" : "Sign Out"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
