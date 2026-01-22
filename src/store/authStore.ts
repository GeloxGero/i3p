import { atom } from "nanostores";

// Check if we are in the browser (Astro is SSR by default)
const isBrowser = typeof window !== "undefined";

export const $token = atom<string | null>(
	isBrowser ? localStorage.getItem("token") : null
);
export const $userProfile = atom<any | null>(null);
export const $isAuthLoading = atom(false);

// Subscribe to changes: whenever the token is set, save it to storage
$token.subscribe((value) => {
	if (isBrowser) {
		if (value) localStorage.setItem("token", value);
		else localStorage.removeItem("token");
	}
});

export const $authError = atom<string | null>(null);

// Action to clear errors
export const clearError = () => $authError.set(null);
