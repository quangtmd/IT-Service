
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
      // JSON.stringify is important to ensure the value is correctly stringified.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});
