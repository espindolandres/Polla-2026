import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Para GitHub Pages, usa el nombre exacto del repositorio.
// Ejemplo de producción: VITE_BASE_PATH=/NOMBRE_DEL_REPOSITORIO/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || (mode === 'production' ? '/NOMBRE_DEL_REPOSITORIO/' : '/'),
}));
