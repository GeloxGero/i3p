// src/components/TableViews/SchoolPlanTable/components/templateModal.tsx
//
// Modal that lets the user choose which Excel template to download.
// Templates are served from GET /api/Template/{type}.
//
// Available template types (matching TemplateController routes):
//   sip  — School Implementation Plan
//   app  — Annual Procurement Plan

interface Props {
	onClose: () => void;
}

const TEMPLATES = [
	{
		key: "sip",
		label: "School Implementation Plan",
		description: "Monthly SIP template with 4 expenditure category sections.",
		icon: "📋",
	},
	{
		key: "app",
		label: "Annual Procurement Plan",
		description: "Annual procurement plan template.",
		icon: "📦",
	},
] as const;

export default function TemplateModal({ onClose }: Props) {
	const download = (key: string) => {
		// Trigger a file download by navigating to the template endpoint.
		// The backend sets Content-Disposition: attachment so the browser saves it.
		window.location.href = `/api/Template/${key}`;
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-background rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
				{/* Header */}
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold">Download Template</h2>
					<button
						onClick={onClose}
						className="text-default-400 hover:text-default-700 text-xl leading-none"
					>
						×
					</button>
				</div>

				<p className="text-sm text-default-500">
					Choose a template to download. Fill it in and import it back using the
					Import button.
				</p>

				{/* Template choices */}
				<div className="flex flex-col gap-3">
					{TEMPLATES.map((t) => (
						<button
							key={t.key}
							onClick={() => {
								download(t.key);
								onClose();
							}}
							className="flex items-center gap-4 p-4 rounded-xl border border-default-200 hover:border-primary hover:bg-primary/5 text-left transition-all group"
						>
							<span className="text-2xl">{t.icon}</span>
							<div className="flex-1">
								<p className="font-semibold text-sm text-default-800 group-hover:text-primary transition-colors">
									{t.label}
								</p>
								<p className="text-xs text-default-400 mt-0.5">
									{t.description}
								</p>
							</div>
							<DownloadIcon />
						</button>
					))}
				</div>

				<button
					onClick={onClose}
					className="text-sm text-default-400 hover:text-default-600 self-end"
				>
					Cancel
				</button>
			</div>
		</div>
	);
}

const DownloadIcon = () => (
	<svg
		width="16"
		height="16"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		viewBox="0 0 24 24"
		className="text-default-400 group-hover:text-primary transition-colors shrink-0"
	>
		<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
	</svg>
);
