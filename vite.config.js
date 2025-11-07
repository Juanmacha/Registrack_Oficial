import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ✅ SOLUCIÓN TEMPORAL: Proxy para evitar CORS en desarrollo
  // ⚠️ NOTA: Esta es una solución temporal. El backend DEBE configurar CORS correctamente.
  // Ver: SOLUCION_ERROR_CORS_URGENTE.md
  server: {
    proxy: {
      '/api': {
        target: 'https://api-registrack-2.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ [Vite Proxy] Error en proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 [Vite Proxy] Redirigiendo:', req.method, req.url, '→', proxyReq.path);
          });
        }
      }
    }
  }
})
