import { defineConfig, type Plugin } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import fs from 'node:fs';

function permissionsSyncPlugin(): Plugin {
  const cacheFile = path.resolve(__dirname, '.erp_permissions.json');
  let inMemory: Record<string, any> = {};

  try {
    if (fs.existsSync(cacheFile)) {
      inMemory = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    }
  } catch {
    // ignore
  }

  return {
    name: 'permissions-sync-plugin',
    configureServer(server) {
      server.middlewares.use('/__erp_permissions', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              inMemory = JSON.parse(body);
              fs.writeFileSync(cacheFile, JSON.stringify(inMemory, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(inMemory));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    permissionsSyncPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor-react';
            }
            if (
              id.includes('primereact') ||
              id.includes('primeicons') ||
              id.includes('lucide-react') ||
              id.includes('framer-motion')
            ) {
              return 'vendor-ui';
            }
            if (id.includes('chart.js')) {
              return 'vendor-charts';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
