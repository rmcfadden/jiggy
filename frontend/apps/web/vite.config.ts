/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { proxy: { '/api': 'http://localhost:3000' } },
  test: { environment: 'jsdom', server: { deps: { inline: [/@tanstack/] } } },
})
