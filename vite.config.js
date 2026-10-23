import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@design': path.resolve(__dirname, 'Interfaz/Prisma Listo Design System')
    }
  },
  base: process.env.VITE_BASE_PATH || '/',
}));