import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Sub-path the app is served from. Empty for local dev and Vercel-style hosting.
  // The Pages workflow sets VITE_BASE=/BugBountyBoard/.
  base: process.env.VITE_BASE || '/',
  // Prefer TypeScript files. Otherwise './App' resolves to the legacy App.jsx,
  // because Vite tries .jsx before .tsx by default.
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
});
