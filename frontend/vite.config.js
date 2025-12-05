import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port:3000,
    open: true,
    proxy: {
      // Proxy API requests to backend
      "/api": {
        target: "http://localhost:5000", // your backend port
        changeOrigin: true,
        secure: false
      },
      // serve uploaded files through dev server as well
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: "dist",
  }
});
