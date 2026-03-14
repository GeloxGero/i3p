// src/components/Toast.tsx
// Lightweight toast notification system — no external dependency needed.
// Usage:
//   import { toast } from "../components/toast";
//   toast.success("Imported 283 items successfully");
//   toast.error("Import failed: …");
//   toast.info("Processing…");

import { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
	id: number;
	type: ToastType;
	title: string;
	message?: string;
}

let _addToast: ((t: Omit<ToastItem, "id">) => void) | null = null;
let _counter = 0;

// ── Singleton container mounted once ──────────────────────────────────────────

function ToastContainer() {
	const [items, setItems] = useState<ToastItem[]>([]);

	const add = useCallback((t: Omit<ToastItem, "id">) => {
		const id = ++_counter;
		setItems((prev) => [...prev, { ...t, id }]);
		setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4000);
	}, []);

	useEffect(() => {
		_addToast = add;
		return () => {
			_addToast = null;
		};
	}, [add]);

	const dismiss = (id: number) =>
		setItems((prev) => prev.filter((i) => i.id !== id));

	const COLORS: Record<
		ToastType,
		{ bg: string; border: string; icon: string; text: string }
	> = {
		success: {
			bg: "bg-[#0f1a0f]",
			border: "border-green-700/60",
			icon: "text-green-400",
			text: "text-green-300",
		},
		error: {
			bg: "bg-[#1a0f0f]",
			border: "border-red-700/60",
			icon: "text-red-400",
			text: "text-red-300",
		},
		warning: {
			bg: "bg-[#1a160f]",
			border: "border-amber-700/60",
			icon: "text-amber-400",
			text: "text-amber-300",
		},
		info: {
			bg: "bg-[#0f131a]",
			border: "border-blue-700/60",
			icon: "text-blue-400",
			text: "text-blue-300",
		},
	};

	const ICONS: Record<ToastType, React.ReactNode> = {
		success: (
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={2.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
		),
		error: (
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={2.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="15" y1="9" x2="9" y2="15" />
				<line x1="9" y1="9" x2="15" y2="15" />
			</svg>
		),
		warning: (
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={2.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
		),
		info: (
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={2.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="8" x2="12" y2="12" />
				<line x1="12" y1="16" x2="12.01" y2="16" />
			</svg>
		),
	};

	if (!items.length) return null;

	return (
		<div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full sm:max-w-xs">
			{items.map((item) => {
				const c = COLORS[item.type];
				return (
					<div
						key={item.id}
						className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${c.bg} ${c.border} shadow-2xl backdrop-blur-xl pointer-events-auto
							animate-in slide-in-from-bottom-2 fade-in duration-200`}
					>
						<span className={`shrink-0 mt-0.5 ${c.icon}`}>
							{ICONS[item.type]}
						</span>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-white leading-snug">
								{item.title}
							</p>
							{item.message && (
								<p className={`text-xs mt-0.5 leading-snug ${c.text}`}>
									{item.message}
								</p>
							)}
						</div>
						<button
							onClick={() => dismiss(item.id)}
							className="shrink-0 text-white/30 hover:text-white/70 transition-colors mt-0.5"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
				);
			})}
		</div>
	);
}

// ── Bootstrap on first call ───────────────────────────────────────────────────

function ensureMounted() {
	if (typeof window === "undefined") return;
	if (document.getElementById("toast-root")) return;
	const el = document.createElement("div");
	el.id = "toast-root";
	document.body.appendChild(el);
	createRoot(el).render(<ToastContainer />);
}

function show(type: ToastType, title: string, message?: string) {
	ensureMounted();
	// Small delay to ensure container is mounted
	setTimeout(() => {
		if (_addToast) _addToast({ type, title, message });
	}, 50);
}

export const toast = {
	success: (title: string, message?: string) => show("success", title, message),
	error: (title: string, message?: string) => show("error", title, message),
	info: (title: string, message?: string) => show("info", title, message),
	warning: (title: string, message?: string) => show("warning", title, message),
};
