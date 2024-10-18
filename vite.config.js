import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'development';
  const backendUrl = isProduction
    ? 'https://walrus-app-lqhsg.ondigitalocean.app/backend'
    : 'http://192.168.178.42:4500';

  return {
    plugins: [react()],
    base: '/',
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    },
    define: {
      'import.meta.env.VITE_BACKEND_HOST': JSON.stringify(backendUrl),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.js'],
      css: true,
      deps: {
        inline: ['vitest-canvas-mock'],
      },
      coverage: {
        reporter: ['text', 'json', 'html'],
      },
      mockReset: true,
    },
  };
});