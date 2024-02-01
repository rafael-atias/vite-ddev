import { defineConfig } from 'vite'
import path from 'path'

const port = 5173;
const origin = `${process.env.DDEV_PRIMARY_URL}:${port}`;

// https://vitejs.dev/config/
export default defineConfig({
  // Add entrypoint
  build: {
    // our entry
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.js'),
    },

    // manifest
    manifest: true
  },

  // Adjust Vites dev server for DDEV
  // https://vitejs.dev/config/server-options.html
  server: {
    // respond to all network requests:
    host: '0.0.0.0',
    port: port,
    strictPort: true,
    // Defines the origin of the generated asset URLs during development
    origin: origin,
    hmr: {
      // Force the Vite client to connect via SSL
      // This will also force a "https://" URL in the public/hot file
      protocol: 'wss',
      // The host where the Vite dev server can be accessed
      // This will also force this host to be written to the public/hot file
      host: `${process.env.DDEV_HOSTNAME}`
    }
  },

})