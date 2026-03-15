import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $isAuthLoading, $token, $userProfile } from "../store/authStore";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPass, setShowPass] = useState(false);
	const [err, setErr] = useState("");
	const isLoading = useStore($isAuthLoading);

	useEffect(() => {
		const t = $token.get();
		if (!t) return;
		fetch("https://i3p-server-1.onrender.com/api/user/GetProfile", {
			headers: { Authorization: `Bearer ${t}` },
		})
			.then((r) => {
				if (r.ok) window.location.href = "/";
				else {
					$token.set(null);
					$userProfile.set(null);
				}
			})
			.catch(() => {});
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		$isAuthLoading.set(true);
		setErr("");
		try {
			const res = await fetch(
				"https://i3p-server-1.onrender.com/api/user/Login",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				},
			);
			const data = await res.json();
			if (res.ok) {
				$token.set(data.token);
				$userProfile.set(data.user);
				window.location.href = "/";
			} else setErr("Invalid email or password");
		} catch {
			setErr("Cannot connect to server");
		} finally {
			$isAuthLoading.set(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#111111] px-4">
			{/* Noise texture */}
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.015]"
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
				}}
			/>

			<div className="relative w-full max-w-[380px]">
				{/* Card */}
				<div className="rounded-2xl border border-white/[0.08] bg-[#191919] p-8 shadow-2xl">
					{/* Brand */}
					<div className="flex items-center gap-2.5 mb-8">
						<div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
							<svg
								aria-hidden
								width="16"
								height="16"
								viewBox="0 0 32 32"
								fill="none"
							>
								<path
									clipRule="evenodd"
									d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
									fill="white"
									fillRule="evenodd"
								/>
							</svg>
						</div>
						<span className="text-white font-medium tracking-tight">
							i3P Ledger
						</span>
					</div>

					<h1 className="text-xl font-semibold text-white mb-1">Sign in</h1>
					<p className="text-sm text-white/40 mb-7">
						Access the school implementation ledger
					</p>

					{err && (
						<div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm mb-5">
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								strokeLinecap="round"
								strokeLinejoin="round"
								className="shrink-0 text-white/40"
							>
								<circle cx="12" cy="12" r="10" />
								<line x1="12" y1="8" x2="12" y2="12" />
								<line x1="12" y1="16" x2="12.01" y2="16" />
							</svg>
							{err}
						</div>
					)}

					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-white/40 uppercase tracking-wider">
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
								placeholder="you@school.edu.ph"
								className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 text-sm outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-white/40 uppercase tracking-wider">
								Password
							</label>
							<div className="relative">
								<input
									type={showPass ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isLoading}
									placeholder="••••••••"
									className="w-full px-3.5 py-2.5 pr-11 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/20 text-sm outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowPass((v) => !v)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
								>
									{showPass ? (
										<svg
											width="15"
											height="15"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth={2}
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
											<line x1="1" y1="1" x2="23" y2="23" />
										</svg>
									) : (
										<svg
											width="15"
											height="15"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth={2}
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading || !email || !password}
							className="mt-1 w-full py-2.5 rounded-lg bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed text-[#111] text-sm font-semibold transition-all"
						>
							{isLoading ? (
								<span className="flex items-center justify-center gap-2">
									<svg
										className="animate-spin"
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth={2.5}
									>
										<path d="M21 12a9 9 0 1 1-6.219-8.56" />
									</svg>
									Signing in…
								</span>
							) : (
								"Sign In"
							)}
						</button>
					</form>

					<div className="flex items-center justify-between mt-6 text-xs text-white/25">
						<a href="#" className="hover:text-white/50 transition-colors">
							Forgot password?
						</a>
						<a
							href="/register"
							className="hover:text-white/50 transition-colors"
						>
							Create account →
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
