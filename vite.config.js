import { defineConfig } from "vite";
import { resolve } from "path";

// Every page has to be listed here so "npm run build" includes it
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },

  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        main: resolve(__dirname, "main.html"),
        scanner: resolve(__dirname, "scanner.html"),
        report: resolve(__dirname, "report.html"),
        alerts: resolve(__dirname, "alerts.html"),
        tips: resolve(__dirname, "tips.html"),
      },
    },
  },
});