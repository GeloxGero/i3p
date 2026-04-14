import { atom } from "nanostores";

const isDev = import.meta.env.DEV;

//currently needs to use ngrok for local development for testing
export const $serverApi = atom<string>(
	isDev
		? import.meta.env.PUBLIC_SERVER_API_LOCALHOST
		: import.meta.env.PUBLIC_SERVER_API_HOSTED,
);
