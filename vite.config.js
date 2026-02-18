import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'vite-plugin-handlebars';

// Настройка путей (нужна для правильной работы плагина)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // Корень проекта для сборщика
  root: 'src', 

  // ПОДКЛЮЧАЕМ ПЛАГИН ДЛЯ СБОРКИ HTML
  plugins: [
    handlebars({
      // Указываем папку, где лежат наши файлы header.html, footer.html и т.д.
      partialDirectory: resolve(__dirname, 'src/partials'),
    }),
  ],

  // Настройки CSS (SCSS)
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', 
      },
    },
  },
  
  // Настройки локального сервера
  server: {
    port: 5173,
    open: true,
    cors: true,
  },
  
  // Настройки финальной сборки
  build: {
    outDir: '../dist', 
    emptyOutDir: true,
    minify: 'terser',
  }
});