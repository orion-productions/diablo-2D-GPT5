import { defineConfig } from 'vite'

// Use relative base so the app works when served from a subpath (e.g., GitHub Pages)
export default defineConfig({
	base: './',
	server: {
		host: true,
		port: 5173,
		strictPort: false
	}
})


