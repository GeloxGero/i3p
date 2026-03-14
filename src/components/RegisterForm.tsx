import React, { useState, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { $isAuthLoading, $authError } from "../store/authStore";

export default function RegisterForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPass, setShowPass] = useState(false);
	const isLoading = useStore($isAuthLoading);
	const error = useStore($authError);

	const passwordsMatch = useMemo(
		() => !confirmPassword || password === confirmPassword,
		[password, confirmPassword],
	);

	// Password strength
	const strength = useMemo(() => {
		if (!password) return 0;
		let s = 0;
		if (password.length >= 8) s++;
		if (/[A-Z]/.test(password)) s++;
		if (/[0-9]/.test(password)) s++;
		if (/[^A-Za-z0-9]/.test(password)) s++;
		return s;
	}, [password]);
	const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
	const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][
		strength
	];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!passwordsMatch) {
			$authError.set("Passwords do not match");
			return;
		}
		$isAuthLoading.set(true);
		$authError.set(null);
		try {
			const res = await fetch("http://localhost:5109/api/user/CreateUser", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					Name: name,
					Email: email,
					PasswordHash: password,
					Authority: 0,
					Photo: null,
				}),
			});
			if (!res.ok) {
				const data = await res.json();
				$authError.set(data.message || "Registration failed");
			} else {
				window.location.href = "/login";
			}
		} catch {
			$authError.set("Connection to server failed.");
		} finally {
			$isAuthLoading.set(false);
		}
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4"
			style={{
				backgroundImage:
					"radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)",
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

			<div className="relative w-full max-w-[420px]">
				<div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/20 via-transparent to-transparent pointer-events-none" />
				<div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
					<div className="flex items-center gap-3 mb-8">
						<div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
							<svg
								aria-hidden
								width="18"
								height="18"
								viewBox="0 0 32 32"
								fill="none"
							>
								<path
									clipRule="evenodd"
									d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
									fill="#60a5fa"
									fillRule="evenodd"
								/>
							</svg>
						</div>
						<span className="text-white font-semibold tracking-tight text-lg">
							i3P Ledger
						</span>
					</div>

					<h1
						className="text-2xl font-bold text-white mb-1"
						style={{ fontFamily: "'Georgia', serif" }}
					>
						Create account
					</h1>
					<p className="text-sm text-white/40 mb-8">
						Join the school implementation ledger
					</p>

					{error && (
						<div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
							<svg
								aria-hidden
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="12" cy="12" r="10" />
								<line x1="12" y1="8" x2="12" y2="12" />
								<line x1="12" y1="16" x2="12.01" y2="16" />
							</svg>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						{/* Full name */}
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-white/50 uppercase tracking-widest">
								Full Name
							</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								disabled={isLoading}
								placeholder="Juan dela Cruz"
								className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
							/>
						</div>

						{/* Email */}
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-white/50 uppercase tracking-widest">
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
								placeholder="you@school.edu.ph"
								className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
							/>
						</div>

						{/* Password */}
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-white/50 uppercase tracking-widest">
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
									className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowPass((v) => !v)}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
								>
									{showPass ? (
										<svg
											aria-hidden
											width="16"
											height="16"
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
											aria-hidden
											width="16"
											height="16"
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
							{/* Strength bar */}
							{password && (
								<div className="flex items-center gap-2 mt-1">
									<div className="flex gap-1 flex-1">
										{[1, 2, 3, 4].map((i) => (
											<div
												key={i}
												className="h-1 flex-1 rounded-full transition-all duration-300"
												style={{
													background:
														i <= strength
															? strengthColor
															: "rgba(255,255,255,0.08)",
												}}
											/>
										))}
									</div>
									<span
										className="text-xs font-medium transition-colors"
										style={{ color: strengthColor }}
									>
										{strengthLabel}
									</span>
								</div>
							)}
						</div>

						{/* Confirm password */}
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-white/50 uppercase tracking-widest">
								Confirm Password
							</label>
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								disabled={isLoading}
								placeholder="••••••••"
								className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-white placeholder-white/20 text-sm outline-none transition-all
									${!passwordsMatch ? "border-red-500/40 focus:border-red-500/60" : "border-white/[0.08] focus:border-blue-500/50 focus:bg-white/[0.06]"}`}
							/>
							{!passwordsMatch && confirmPassword && (
								<span className="text-xs text-red-400">
									Passwords do not match
								</span>
							)}
						</div>

						<button
							type="submit"
							disabled={
								isLoading || !passwordsMatch || !password || !email || !name
							}
							className="mt-2 w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
						>
							{isLoading ? (
								<span className="flex items-center justify-center gap-2">
									<svg
										className="animate-spin"
										aria-hidden
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth={2.5}
									>
										<path d="M21 12a9 9 0 1 1-6.219-8.56" />
									</svg>
									Creating account…
								</span>
							) : (
								"Sign Up"
							)}
						</button>
					</form>

					<p className="text-center mt-6 text-xs text-white/30">
						Already have an account?{" "}
						<a
							href="/login"
							className="text-blue-400 hover:text-blue-300 transition-colors"
						>
							Sign in
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
