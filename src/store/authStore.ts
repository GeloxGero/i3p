import { map, atom } from 'nanostores';

export interface User {
  email: string;
  name: string;
}

export const $user = atom<User | null>(null);
export const $isAuthLoading = atom(false);

// Action to simulate login
export async function loginUser(email: string) {
  $isAuthLoading.set(true);
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  $user.set({ email, name: email.split('@')[0] });
  $isAuthLoading.set(false);
  
  // Redirect using standard browser logic
  window.location.href = "/dashboard";
}