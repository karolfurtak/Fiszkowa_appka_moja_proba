import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import node from '@astrojs/node';
import { resolve } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Get __dirname equivalent for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  server: {
    port: 3000,
    host: true
  },

  // Tailwind 4 is used via @tailwindcss/vite in vite.plugins (no @astrojs/tailwind)
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      fs: {
        // Allow access to files outside of project root (needed for Astro dev toolbar)
        // This allows access to node_modules in parent directories (e.g., user's home directory)
        allow: [
          '..',
          // Allow access to node_modules in user's home directory (Windows)
          resolve(homedir(), 'node_modules')
        ]
      }
    }
  }
});