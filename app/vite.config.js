import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Cualquier llamada a /api/... la redirige a http://localhost:3000/api/v1/...
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
    },
    // Para hostear en local
    host: true,
    port: 5173,
    strictPort: false,
    // Para hostear desde ngrok
    allowedHosts: [
      '.ngrok.io',
      '.ngrok-free.app'
    ]
  },
});
