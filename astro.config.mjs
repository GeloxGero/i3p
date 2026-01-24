// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { heroui } from "@heroui/react";

import react from "@astrojs/react";

export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
	},
	output: "server",
	integrations: [react()],
});
