
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on the mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: './', // Ensures all asset paths are relative, good for subfolder deployment
    define: {
      // Defensively check for both API_KEY and VITE_API_KEY from the build environment.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY || env.VITE_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY),
      // Define backend URL for the frontend application
      'process.env.BACKEND_API_BASE_URL': JSON.stringify(env.VITE_BACKEND_API_BASE_URL)
    }
  }
});
