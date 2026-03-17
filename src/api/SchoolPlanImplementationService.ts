// src/api/schoolService.ts
import { apiRequest } from "./Auth";

export const schoolPlanImplementationService = {
	// GET: Fetch headers
	getHeaders: (token: string | null) =>
		apiRequest("api/SchoolImplementation", {}, token),

	// GET: Fetch plan by ID
	getPlanById: (planId: string, token: string | null) =>
		apiRequest(`api/SchoolImplementation/${planId}`, {}, token),

	// POST: Import file (FormData)
	importFile: (file: File, token: string | null) => {
		const formData = new FormData();
		formData.append("file", file);
		return apiRequest(
			"api/SchoolImplementation/import",
			{
				method: "POST",
				body: formData,
			},
			token,
		);
	},

	// POST: Add new item
	addItem: (itemData: any, token: string | null) =>
		apiRequest(
			"api/SchoolImplementation/item",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(itemData),
			},
			token,
		),

	// POST: Seed fake data
	seedFakeLinks: (itemId: string, token: string | null) =>
		apiRequest(`api/Ar/seed-fake-links/${itemId}`, { method: "POST" }, token),
};
