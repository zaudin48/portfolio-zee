import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base so this works no matter what the GitHub repo is named
// (username.github.io/anything/) without any path configuration.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
