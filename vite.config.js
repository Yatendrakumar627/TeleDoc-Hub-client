import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  const apiBaseUrl = (env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5000';
  const devPort = Number(env.VITE_DEV_SERVER_PORT) || 5173;

  const server = {
    port: devPort,
    host: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
    hmr: {
      host: 'localhost',
      port: devPort,
    },
  };

  // Only proxy when the API base is a relative path such as "/api".
  // A full URL (e.g. https://api.example.com/api) is called directly.
  if (apiBaseUrl.startsWith('/')) {
    server.proxy = {
      [apiBaseUrl]: {
        target: proxyTarget,
        changeOrigin: true,
      },
    };
  }

  return {
    plugins: [react()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@mantine/core', '@mantine/hooks'],
    },
    server,
  };
});
