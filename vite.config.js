// vite.config.js
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import postcssUrl from 'postcss-url';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './',

  assetsInclude: ['**/*.hbs'],
  plugins: [
    handlebars({
      partialDirectory: './src/partials', // если используешь partials
    }),
  ],

  server: {
    fs: { allow: ['.'] },
    watch: { usePolling: true },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {},
    },
    postcss: {
      plugins: [
        postcssUrl({
          url: (asset) => {
            // Если путь начинается с /images/, превращаем /images/foo → ../images/foo
            if (asset.url.startsWith('/images/')) {
              return asset.url.replace(/^\//, '../');
            }
            // аналогично для icons, fonts, favicons
            if (asset.url.startsWith('/icons/')) {
              return asset.url.replace(/^\//, '../');
            }
            if (asset.url.startsWith('/fonts/')) {
              return asset.url.replace(/^\//, '../');
            }
            if (asset.url.startsWith('/favicons/')) {
              return asset.url.replace(/^\//, '../');
            }
            return asset.url;
          },
        }),
      ],
    },
  },

  resolve: {
    alias: {
      '@styles': resolve(__dirname, 'src/styles'),
      '@scripts': resolve(__dirname, 'src/scripts'),
      '@partials': resolve(__dirname, 'src/partials'),
    },
  },
});
