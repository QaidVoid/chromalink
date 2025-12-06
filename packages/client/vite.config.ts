import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    proxy: {
      "/socket.io": {
        target: process.env.PUBLIC_API_URL || "http://localhost:3000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
