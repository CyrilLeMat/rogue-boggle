import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base relative : fonctionne en local et sous /rogue-boggle/ sur GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    // le dictionnaire (4,7 Mo de JSON) est volontairement dans le bundle
    chunkSizeWarningLimit: 6000,
  },
})
