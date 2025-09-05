
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production)
  // Loads all environment variables from .env files without VITE_ prefix filtering
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: './', // Ensures all asset paths are relative, good for subfolder deployment
    define: {
      // Expose VITE_API_KEY from .env file (or build environment)
      // as process.env.API_KEY in client-side code.
      // JSON.stringify is important. If env.VITE_API_KEY is undefined, this correctly
      // results in the literal value `undefined` in the code, making checks like `!process.env.API_KEY` work correctly.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
      // Fallback to an empty string is acceptable here because the app logic checks for a falsy value to use mock data.
      'process.env.BACKEND_API_BASE_URL': JSON.stringify(env.VITE_BACKEND_API_BASE_URL || '')
    }
  };
});