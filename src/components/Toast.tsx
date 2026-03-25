// src/components/Toast.tsx
//
// Lightweight slide-in toast notification.
// Auto-dismissed by the parent via a setTimeout; the parent also receives
// onClose so it can be dismissed early by clicking ×.

interface Props {
	message: string;
	type?: "success" | "error" | "info";
	onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: Props) {
	const colours = {
		success: "bg-green-600 text-white",
		error: "bg-red-600 text-white",
		info: "bg-default-700 text-white",
	};

	const icons = {
		success: "✓",
		error: "✕",
		info: "ℹ",
	};

	return (
		<div
			className={[
				"fixed bottom-6 right-6 z-[100] flex items-center gap-3",
				"px-4 py-3 rounded-xl shadow-xl text-sm font-medium",
				"animate-in slide-in-from-bottom-4 fade-in duration-300",
				colours[type],
			].join(" ")}
			role="alert"
		>
			<span className="text-base leading-none">{icons[type]}</span>
			<span className="flex-1 max-w-xs">{message}</span>
			<button
				onClick={onClose}
				className="opacity-70 hover:opacity-100 transition-opacity ml-2 leading-none"
				aria-label="Dismiss"
			>
				×
			</button>
		</div>
	);
}
