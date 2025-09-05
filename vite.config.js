
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures all asset paths are relative, good for subfolder deployment
  define: {
    // Directly use process.env provided by the build environment (e.g., Railway).
    // This is more reliable than Vite's loadEnv utility in a CI/CD context.
    // It reads the API_KEY variable directly from the build process environment.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    
    // The backend URL is likely set as VITE_BACKEND_API_BASE_URL.
    // Using process.env here makes it consistent.
    'process.env.BACKEND_API_BASE_URL': JSON.stringify(process.env.VITE_BACKEND_API_BASE_URL || '')
  }
});
