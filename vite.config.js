// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://walrus-app-lqhsg.ondigitalocean.app:4500',
        // target: 'http://192.168.178.42:4500', // Adjust this to your backend's actual address and port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});