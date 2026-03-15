import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { node } from "@astrojs/node"; // Add this import
import tailwindcss from "@tailwindcss/vite";
import { heroui } from "@heroui/react";

export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
	},
	output: "server",
	adapter: node(), // Add this line
	integrations: [react()],
});
