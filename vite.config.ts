import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 800, // increase warning limit to 800kb
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;

            // Large framework/runtime
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';

            // UI / animations
            if (id.includes('motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-icons';

            // Utilities & date handling
            if (id.includes('date-fns')) return 'vendor-date-fns';

            // Validation, forms, query
            if (id.includes('zod')) return 'vendor-zod';
            if (id.includes('@hookform')) return 'vendor-hookform';
            if (id.includes('@tanstack/react-query') || id.includes('react-query')) return 'vendor-react-query';

            // Supabase / networking
            if (id.includes('@supabase') || id.includes('supabase-js')) return 'vendor-supabase';

            // PDF / reporting
            if (id.includes('jspdf') || id.includes('jspdf-autotable')) return 'vendor-jspdf';

            // Fall back: group common deps but avoid a single huge vendor bundle
            if (id.includes('node_modules')) {
              const pkgName = id.toString().split('node_modules/')[1]?.split('/')[0];
              if (pkgName) return `vendor.${pkgName}`;
            }

            return undefined;
          }
        }
      }
    }
  };
});
