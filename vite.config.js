import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This makes the server listen on all addresses, including your local network
    port: 5173, // or whatever port you want to use
  },
});