import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'generate-manifest',
      async writeBundle() {
        const manifestTemplate = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'public/manifest.json'), 'utf-8'));
        const allowedSitesPath = path.resolve(__dirname, 'public/allowedSites.js');
        const sites = JSON.parse(fs.readFileSync(allowedSitesPath, 'utf-8'));
        
        manifestTemplate.content_scripts[0].matches = sites;
        
        fs.writeFileSync(
          path.resolve(__dirname, 'dist/manifest.json'),
          JSON.stringify(manifestTemplate, null, 2)
        );
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        contentScript: resolve(__dirname, 'public/contentScript.js'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    emptyOutDir: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
