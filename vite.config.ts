import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  base: '/s1/',
  build: {
    sourcemap: false,
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animation: ['framer-motion'],
          chart: [],
          ui: ['lucide-react', '@radix-ui/react-tabs', 'sonner'],
        },
      },
    },
  },
  esbuild: {
    logOverride: { 'duplicate-attribute': 'silent' },
    drop: ['console', 'debugger'],
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
})
