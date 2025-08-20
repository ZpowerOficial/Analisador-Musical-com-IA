import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      base: '/Analisador-Musical-com-IA/',
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY),
        'process.env.YOUTUBE_API_KEY': JSON.stringify(env.VITE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY),
        'process.env.LASTFM_API_KEY': JSON.stringify(env.VITE_LASTFM_API_KEY || process.env.LASTFM_API_KEY),
        'process.env.STANDS4_API_KEY': JSON.stringify(env.VITE_STANDS4_API_KEY || process.env.STANDS4_API_KEY),
        'process.env.GENIUS_API_KEY': JSON.stringify(env.VITE_GENIUS_API_KEY || process.env.GENIUS_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              gemini: ['@google/genai']
            }
          }
        }
      },
      server: {
        port: 5173,
        host: true
      }
    };
});
