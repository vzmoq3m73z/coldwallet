import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'
import {nodePolyfills} from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    vue(),
    wasm(),
    nodePolyfills({
      protocolImports: true
    })
  ],
  server: {
    port: 7779,
  },
  define: {
    global: 'globalThis'
  },
  resolve: {
    alias: {
      buffer: 'buffer'
    },
  },
  optimizeDeps: {
    include: ['buffer', 'bitcoinjs-lib', 'bip32', 'tiny-secp256k1']
  }
})