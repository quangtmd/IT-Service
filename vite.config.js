
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        server: {
            port: 3000,
            host: '0.0.0.0',
            proxy: {
              '/api': {
                target: 'http://127.0.0.1:3001',
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
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            }
        },
        define: {
            'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
            // Removed explicit definition of VITE_BACKEND_API_BASE_URL to let Vite handle it
        }
    };
});
