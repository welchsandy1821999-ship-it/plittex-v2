import { defineConfig } from 'vite';
import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  // Указываем Vite, что все исходники лежат в папке src
  root: 'src',

  build: {
    // Указываем папку для готового сайта (на один уровень выше src)
    outDir: '../dist',
    emptyOutDir: true,
    
    rollupOptions: {
      input: {
        // Так как root: 'src', пути здесь указываем относительно src
        main: resolve(__dirname, 'src/index.html'),
        about: resolve(__dirname, 'src/about.html'),
        catalog: resolve(__dirname, 'src/catalog.html'),
        contacts: resolve(__dirname, 'src/contacts.html'),
        news: resolve(__dirname, 'src/news.html'),
        objects: resolve(__dirname, 'src/objects.html'),
        partners: resolve(__dirname, 'src/partners.html'),
        policy: resolve(__dirname, 'src/policy.html'),
        thanks: resolve(__dirname, 'src/thanks.html'),
        404: resolve(__dirname, 'src/404.html'),
      },
    },
  },

  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src/partials'),
    }),

    viteStaticCopy({
      targets: [
        { src: 'assets', dest: '' },
        { src: 'data', dest: '' },
        { src: 'robots.txt', dest: '' },
        { src: 'send.php', dest: '' }
      ]
    })
  ],
});