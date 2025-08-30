import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "./", // base: "/roademy/"
  build: {
    outDir: "dist",
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // SOLO EN DEV: Cualquier llamada a /api/... se redirige a http://localhost:3000/api/v1/...
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
    },

    // Para hostear en local
    host: true,
    port: 5173,
    strictPort: false,
  },
});
