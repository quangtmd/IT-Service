
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:3001', // Changed from localhost to 127.0.0.1
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        preview: {
            port: 3000,
            host: true, 
            allowedHosts: ['.onrender.com'],
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:3001', // Changed from localhost to 127.0.0.1
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            }
        },
        define: {
            'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
            // Ensure the variable is always stringified, even if it's undefined (becomes empty string)
            'process.env.VITE_BACKEND_API_BASE_URL': JSON.stringify(env.VITE_BACKEND_API_BASE_URL || '')
        }
    }
});
