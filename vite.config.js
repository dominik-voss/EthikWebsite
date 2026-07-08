// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/EthikWebsite/',
  server: {
    allowedHosts: ['rehire-simmering-user.ngrok-free.dev']
  }
})