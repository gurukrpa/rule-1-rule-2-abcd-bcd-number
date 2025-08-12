import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Firebase hosting serves from root domain
  root: '.',
  publicDir: 'public',
  server: {
    watch: { interval: 100, usePolling: false, ignored: ["**/*.bak", "**/.*!*", "**/.ai-backups/**", "**/.local-history/**"] },
    port: 5173,
    host: '127.0.0.1',
    strictPort: false,
    open: false,
    hmr: {
      overlay: false,
      port: 24678
    },
    // Optimize for faster loading
    cors: true,
    headers: {
      'Cache-Control': 'no-cache'
    },
    // Aggressive optimizations for speed
    fs: {
      strict: false,
      deny: [
        '**/*.md', 
        '**/*.sql', 
        '**/*.mjs', 
        '**/*.html', 
        '!**/index.html',
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/*.log',
        '**/debug_files_archive/**',
        '**/temp_docs/**',
        '**/temp_scripts/**',
        '**/*debug*.js',
        '**/*test*.js',
        '!**/src/**',
        '!**/tailwind.config.js',
        '!**/postcss.config.js',
        '!**/vite.config.js'
      ]
    },
},
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
    exclude: ['fsevents']
  },
  // Reduce bundle size in development
  esbuild: {
    target: 'es2020'
  }
});
