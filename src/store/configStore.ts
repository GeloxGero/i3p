import { atom } from "nanostores";

const isDev = import.meta.env.DEV;

export const $serverApi = atom<string>(
	isDev
		? import.meta.env.PUBLIC_SERVER_API_LOCALHOST
		: import.meta.env.PUBLIC_SERVER_API_HOSTED,
);
