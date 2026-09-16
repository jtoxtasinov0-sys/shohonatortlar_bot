import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Telegram Mini App zamonaviy WebView'da ishlaydi — eski brauzerlar
    // uchun qo'shimcha kod kerak emas, bundle kichikroq bo'ladi.
    target: 'es2020',
    cssCodeSplit: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // React alohida faylga chiqadi va brauzer keshida uzoq saqlanadi:
        // keyingi deploylarda faqat ilova kodi qayta yuklanadi.
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },

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
