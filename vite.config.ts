
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Cast process to any to avoid TypeScript errors if types are missing
    const cwd = (process as any).cwd ? (process as any).cwd() : path.resolve('.');
    const env = loadEnv(mode, cwd, '');

    return {
        plugins: [react()],
        resolve: {
            alias: {
                // Map @ to the project root
                '@': path.resolve(__dirname, './'),
            },
        },
        server: {
            host: '0.0.0.0', 
            port: 3000,
            proxy: {
              '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
              },
            },
        },
        build: {
            outDir: 'dist',
            sourcemap: false,
        },
        define: {
            'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
            'process.env.VITE_BACKEND_API_BASE_URL': JSON.stringify(
                mode === 'production' ? env.VITE_BACKEND_API_BASE_URL : ''
            )
        }
    };
});