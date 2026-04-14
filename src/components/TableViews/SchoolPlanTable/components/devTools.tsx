import type { SchoolPlanItemDto } from "../types";
import { useState } from "react";
import { Button } from "@heroui/react";
import { seedFakeLinks } from "../api";

function SeedFakeBanner({
	planId,
	items,
	token,
	onDone,
}: {
	planId: string;
	items: SchoolPlanItemDto[];
	token: string | null;
	onDone: () => void;
}) {
	const [loading, setLoading] = useState(false);

	async function seed() {
		if (items.length === 0) return;

		setLoading(true);
		try {
			// Use your API abstraction instead of manual fetch
			// items[0].id.toString() ensures the type matches your service

			//DANGEROUS CODE. MUST REFACTOR
			await seedFakeLinks(items[0].id!.toString(), token);

			onDone();
		} catch (error) {
			console.error("Seeding failed:", error);
			// Optional: show a toast or alert here
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex items-center gap-3 px-4 py-2.5 bg-warning-50 border border-warning-200 rounded-xl text-sm">
			<span className="text-warning-700 font-medium">
				{items.length} SIP item{items.length !== 1 ? "s" : ""} without an AR
				code.
			</span>
			<Button
				size="sm"
				color="warning"
				variant="flat"
				isLoading={loading}
				onPress={seed}
			>
				Seed fake APP items (dev)
			</Button>
			<span className="text-warning-500 text-xs">
				Generates 3 test APP items linked to the first unlinked row.
			</span>
		</div>
	);
}

export { SeedFakeBanner };
