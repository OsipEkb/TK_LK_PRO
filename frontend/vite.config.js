import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['highcharts', 'highcharts-react-official'],
          ui: ['lucide-react', 'recharts']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'highcharts', 'highcharts-react-official', 'lucide-react']
  }
})