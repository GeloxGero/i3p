// components/skeletonTable.tsx
//
// Skeletal loading placeholder used while API calls are in-flight.
// Renders a fixed number of shimmer rows so the page doesn't jump
// when real data arrives.

interface Props {
	rows: number;
	cols: number;
}

export default function SkeletonTable({ rows, cols }: Props) {
	return (
		<div className="rounded-xl border border-default-200 overflow-hidden animate-pulse">
			{/* Header */}
			<div className="flex gap-3 px-4 py-3 bg-default-50 border-b border-default-200">
				{Array.from({ length: cols }).map((_, i) => (
					<div key={i} className="h-3 rounded bg-default-200 flex-1" />
				))}
			</div>

			{/* Rows */}
			{Array.from({ length: rows }).map((_, r) => (
				<div
					key={r}
					className="flex gap-3 px-4 py-3 border-b border-default-100"
					style={{ opacity: 1 - r * (0.9 / rows) }}
				>
					{Array.from({ length: cols }).map((_, c) => (
						<div
							key={c}
							className="h-3 rounded bg-default-100"
							style={{ flex: c === 2 ? 2 : 1 }}
						/>
					))}
				</div>
			))}
		</div>
	);
}
