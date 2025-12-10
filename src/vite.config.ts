
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Replace process.cwd() with path.resolve('.') to avoid TypeScript type issues with global process
    const env = loadEnv(mode, path.resolve('.'), '');

    return {
        plugins: [react()],
        resolve: {
            alias: {
                // If this file is in 'src/', then __dirname is '.../project/src'.
                // We want '@' to point to '.../project/src'.
                '@': path.resolve(__dirname, '.'),
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
