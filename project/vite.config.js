import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    // Configure Rollup's output settings
    rollupOptions: {
      output: {
        // [name] uses the chunk name (often 'index' for the main entry point)
        // [ext] is the file extension (js or css)
        // This removes the [hash] placeholder
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            // Give the main CSS file a specific name without a hash
            return `assets/style.css`;
          }
          // For other assets (images, fonts), keep them clean
          return `assets/[name].[ext]`;
        },
      },
    },
  },
});
