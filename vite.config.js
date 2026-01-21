
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures all asset paths are relative, good for subfolder deployment
  define: {
    // Defensively check for both API_KEY and VITE_API_KEY from the build environment.
    // This makes the configuration more robust regardless of how the user names the variable.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.VITE_API_KEY),
    
    // The backend URL is no longer needed in a backend-less architecture.
  }
});