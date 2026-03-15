import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { heroui } from "@heroui/react";
import node from "@astrojs/node";

export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
	},
	adapter: node({
		mode: "standalone",
	}),
	output: "server",
	integrations: [react()],
	server: {
		host: true, // This maps to 0.0.0.0
		port: 10000,
	},
});
