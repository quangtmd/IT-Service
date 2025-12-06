import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // FIX: Cast process to any to resolve TypeScript error regarding 'cwd'.
    const env = loadEnv(mode, (process as any).cwd(), '');

    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
            proxy: {
                '/api': {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                },
            },
        },
        preview: {
            host: true, // This is equivalent to --host, allows network access
            // Allow requests from Render's preview domains to prevent host header errors.
            allowedHosts: ['.onrender.com'],
        },
        build: {
            rollupOptions: {
                external: ['@google/genai'],
            }
        },
        plugins: [react()],
        resolve: {
            alias: {
                // FIX: Replace __dirname with process.cwd() for ES module compatibility
                // Cast process to any to resolve TypeScript error regarding 'cwd'.
                '@': path.resolve((process as any).cwd(), '.'),
            }
        },
        define: {
            'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
            // Use an empty string for dev (relying on proxy) and the env var for prod
            'process.env.VITE_BACKEND_API_BASE_URL': JSON.stringify(
                mode === 'production' ? env.VITE_BACKEND_API_BASE_URL : ''
            )
        }
    }
});