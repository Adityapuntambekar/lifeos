import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { attachSpace } from './server/space'

export default defineConfig({ plugins: [react(), {name:'lifeos-space',configureServer(server){if(server.httpServer){const close=attachSpace(server.httpServer as Parameters<typeof attachSpace>[0]);server.httpServer.once('close',close)}}}] })
