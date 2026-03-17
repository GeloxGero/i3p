import { $serverApi } from "../store/configStore";

export async function apiRequest(
	endpoint: string,
	options: RequestInit = {},
	token: string | null,
) {
	const baseUrl = $serverApi.get();
	const headers = new Headers(options.headers);

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(`${baseUrl}${endpoint}`, {
		...options,
		headers,
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(errorText || "API Request failed");
	}

	return response.json();
}
