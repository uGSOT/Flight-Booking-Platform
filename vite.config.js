import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Honour the PORT assigned by the preview harness (falls back to 5173 locally).
    port: Number(process.env.PORT) || 5173,
  },
})
