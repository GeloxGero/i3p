import { map, atom } from "nanostores";

export interface UserProfile {
	name: string;
	email: string;
	authority: number;
	photo: string | null;
}

export const $token = atom<string | null>(
	typeof window !== "undefined" ? localStorage.getItem("token") : null
);
export const $userProfile = atom<UserProfile | null>(null);
export const $isAuthLoading = atom(false);
export const $authError = atom<string | null>(null);

// Action to clear errors
export const clearError = () => $authError.set(null);

// Action to log out
export const logout = () => {
	localStorage.removeItem("token");
	$token.set(null);
	$userProfile.set(null);
	window.location.href = "/login";
};

// // Action to simulate login
// export async function loginUser(email: string) {
// 	$isAuthLoading.set(true);

// 	// Simulate API delay
// 	await new Promise((resolve) => setTimeout(resolve, 1500));

// 	$user.set({ email, name: email.split("@")[0] });
// 	$isAuthLoading.set(false);

// 	// Redirect using standard browser logic
// 	window.location.href = "/dashboard";
// }
