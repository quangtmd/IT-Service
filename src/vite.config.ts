
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, path.resolve(__dirname, '..'), ''); // Load env from project root if config is in src, or just path.resolve('.')

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
        build: {
            rollupOptions: {
                external: ['@google/genai'],
                output: {
                    globals: {
                        '@google/genai': 'GoogleGenAI'
                    }
                }
            }
        },
        plugins: [react()],
        resolve: {
            alias: {
                // Ensure @ maps to the src directory relative to this config file
                // If vite.config.ts is in src/, then it's just __dirname
                // If vite.config.ts is in root, it's path.resolve(__dirname, './src')
                // Based on previous file listing, vite.config.ts seemed to be in root, 
                // but one listing showed src/vite.config.ts. 
                // Assuming standard Vite structure where config is at root:
                '@': path.resolve(__dirname, './src'),
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
