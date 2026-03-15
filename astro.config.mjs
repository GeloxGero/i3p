import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { heroui } from "@heroui/react";

export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
	},
	output: "static",
	integrations: [react()],
	server: {
		host: true, // This maps to 0.0.0.0
		port: 10000,
	},
});
