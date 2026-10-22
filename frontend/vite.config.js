import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, forward API + socket calls to the backend (so no CORS headaches)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/socket.io': { target: 'http://localhost:5000', ws: true },
    },
  },
});
