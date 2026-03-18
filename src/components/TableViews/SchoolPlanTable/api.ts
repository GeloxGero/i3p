import { apiRequest } from "../../../api/TokenService"; // adjust path as needed
import type { SchoolPlan, SchoolPlanHeader } from "./types";

export const SchoolPlanApi = {
	/** Get list of plan years/headers */
	getHeaders: async (token: string | null): Promise<SchoolPlanHeader[]> => {
		return apiRequest("api/SchoolImplementation", {}, token);
	},

	/** Get full details of a specific plan */
	getById: async (id: string, token: string | null): Promise<SchoolPlan> => {
		return apiRequest(`api/SchoolImplementation/${id}`, {}, token);
	},

	/** Import an Excel file */
	importExcel: async (file: File, token: string | null) => {
		const formData = new FormData();
		formData.append("file", file);

		return apiRequest(
			"api/SchoolImplementation/import",
			{
				method: "POST",
				body: formData,
				// Note: Don't set Content-Type header; fetch sets it automatically for FormData
			},
			token,
		);
	},

	/** Developer Tool: Seed fake links */
	seedFakeLinks: async (
		itemId: string | number | undefined,
		token: string | null,
	) => {
		return apiRequest(
			`api/Ar/seed-fake-links/${itemId}`,
			{
				method: "POST",
			},
			token,
		);
	},
};
