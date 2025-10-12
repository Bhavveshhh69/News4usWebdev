import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ CRITICAL for Hostinger deployment - ensures absolute asset paths
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  server: {
    port: 3001,
    open: true,
    // Proxy API requests to the backend server
    proxy: {
      '/api': {
        target: 'http://localhost:4002',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});