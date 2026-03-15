import { atom } from 'nanostores';

const isBrowser = typeof window !== "undefined";
const $token = atom(
  isBrowser ? localStorage.getItem("token") : null
);
const $userProfile = atom(null);
const $isAuthLoading = atom(false);
$token.subscribe((value) => {
  if (isBrowser) {
    if (value) localStorage.setItem("token", value);
    else localStorage.removeItem("token");
  }
});
const $authError = atom(null);

export { $isAuthLoading as $, $token as a, $userProfile as b, $authError as c };
