
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      // Indicamos a Rollup que estas librerías NO deben ser empaquetadas
      // porque se resolverán en el navegador mediante el importmap
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'framer-motion',
        'lucide-react',
        '@google/genai'
      ]
    }
  }
});
