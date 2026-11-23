import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Prefer TypeScript files. Otherwise './App' resolves to the legacy App.jsx,
  // because Vite tries .jsx before .tsx by default.
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
});
