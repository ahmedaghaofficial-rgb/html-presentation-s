// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  site: 'https://syntax.academy',
  // شريط أدوات Astro مخفي — بيظهر تحت الستيج وبيدخل في كادر التصوير
  devToolbar: { enabled: false },
  build: {
    // outputs /01-chatgpt-moment.html instead of /01-chatgpt-moment/index.html
    format: 'file',
  },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
        '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
        '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      },
    },
  },
});
