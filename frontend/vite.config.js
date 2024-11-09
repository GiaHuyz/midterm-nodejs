import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import path from "path"

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
			},
		},
	},
	server: {
		port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:8000",
                changeOrigin: true
            },
        },
	},
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '/src'),
        },
    },
})
