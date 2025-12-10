import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import { resolve } from 'path';
import { homedir } from 'os';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3000,
    host: true
  },

  // API routes work in dev mode without output configuration
  // The endpoint has 'export const prerender = false' which makes it dynamic
  // For production, you may need 'output: "server"' with an adapter
  integrations: [tailwind(), react()],

  vite: {
    plugins: [tailwindcss()],
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