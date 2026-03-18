import { $serverApi } from "../store/configStore";

//this file is inherited by all Apis to make sure token is always checked before any calls
//automatically concatenates the base url whether localhost or hosted from the .env file
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
