import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// ── Local File Scanner Plugin (dev-only) ──────────────────────
// Exposes a /api/scan endpoint that uses Node.js fs to read a
// local project directory's package.json. Only active during
// `vite dev` — ignored entirely on production builds.
const localScannerPlugin = () => ({
  name: 'local-scanner-plugin',
  apply: 'serve', // ← only applies during dev server, never during build
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url.startsWith('/api/scan')) {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const targetPath = url.searchParams.get('path')

        if (!targetPath) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'No path provided' }))
          return
        }

        try {
          const pkgPath = path.join(targetPath, 'package.json')
          if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

            // Map dependencies to known skill IDs
            const deps = { ...pkg.dependencies, ...pkg.devDependencies }
            const skills = []
            if (deps.react) skills.push('react')
            if (deps.typescript) skills.push('ts')
            if (deps.tailwindcss) skills.push('css')
            if (deps.next) skills.push('next')
            if (deps['@nestjs/core']) skills.push('node')
            if (deps.vite) skills.push('vite')
            if (deps.prisma || deps['@prisma/client']) skills.push('postgres')
            if (deps.python) skills.push('python')

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              name: pkg.name || path.basename(targetPath),
              description: pkg.description || '',
              skills: skills.join(', '),
              success: true
            }))
          } else {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'package.json not found in target path' }))
          }
        } catch (error) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: error.message }))
        }
        return
      }
      next()
    })
  }
})

export default defineConfig({
  plugins: [react(), localScannerPlugin()],
  server: {
    proxy: {
      // In dev, /hoq-api/* → http://localhost:4000/*
      // This is stripped automatically on production builds (no server proxy on Vercel)
      '/hoq-api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hoq-api/, ''),
      },
    },
  },
})
