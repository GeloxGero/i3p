import { atom } from "nanostores";

//only use one of the two, LOCALHOST for development, HOSTED for production
//import.meta.env.PUBLIC_SERVER_API_HOSTED
//import.meta.env.PUBLIC_SERVER_API_LOCALHOST
export const $serverApi = atom<string>(
	import.meta.env.PUBLIC_SERVER_API_LOCALHOST,
);
