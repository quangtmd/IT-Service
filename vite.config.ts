
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, (process as any).cwd(), '');

    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:3001', // Use 127.0.0.1 to avoid localhost IPv6 issues
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
                    target: 'http://127.0.0.1:3001',
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
            // Ensure only specific variables are exposed if needed, 
            // but generally Vite handles VITE_ prefixed ones automatically.
            // We expose API_KEY manually because it might not be VITE_ prefixed in some environments or code usages.
            'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
        }
    }
});
