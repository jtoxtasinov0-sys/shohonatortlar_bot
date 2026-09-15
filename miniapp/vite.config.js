import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // telefondan / ngrok orqali kirish uchun
    port: 5173,
    strictPort: true,
    allowedHosts: true, // ngrok domenlariga ruxsat
    proxy: {
      // Mini App backendga shu yo'l orqali murojaat qiladi.
      // Shu sababli ngrok uchun bitta tunnel yetarli.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
