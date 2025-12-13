
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Fix: Cast process to any to avoid type error 'Property cwd does not exist on type Process'
    // This typically happens if @types/node is not fully loaded or configured for the config file context.
    const env = loadEnv(mode, (process as any).cwd(), '');

    return {
        plugins: [react()],
        resolve: {
            alias: {
                // Fix: Since vite.config.ts is in 'src', __dirname points to 'src'.
                // Map '@' to __dirname directly so '@/components' resolves to 'src/components'.
                '@': __dirname,
            },
        },
        server: {
            host: true,
            port: 3000,
            proxy: {
              '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
              },
            },
        },
        preview: {
            port: 3000,
            host: true,
            allowedHosts: true,
            proxy: {
                '/api': {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                },
            },
        },
        build: {
            outDir: '../dist', // Output to project root dist folder, since config is in src
            emptyOutDir: true,
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
