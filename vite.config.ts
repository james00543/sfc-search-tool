import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            proxy: {
                '/SFCAPI': {
                    target: env.VITE_API_TARGET || 'http://10.16.137.111',
                    changeOrigin: true,
                    secure: false,
                }
            }
        }
    };
})
