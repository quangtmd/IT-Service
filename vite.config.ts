import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
            host: true, 
            allowedHosts: ['.onrender.com'],
        },
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(process.cwd(), '.'),
            }
        },
        define: {
            'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
            'process.env.VITE_BACKEND_API_BASE_URL': JSON.stringify(
                mode === 'production' ? env.VITE_BACKEND_API_BASE_URL : ''
            )
        }
    }
});
