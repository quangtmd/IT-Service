
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Fix: Import process to provide types for process.cwd()
import process from 'process';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

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
        plugins: [react()],
        resolve: {
            alias: {
                // Fix: Replace __dirname with process.cwd() for ES module compatibility
                '@': path.resolve(process.cwd(), '.'),
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