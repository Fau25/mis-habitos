import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

// Versión automática (fecha + hora de la compilación): va a la app (Ajustes) y al CACHE del service worker
const ahora = new Date()
const VERSION = `${ahora.toISOString().slice(0, 10).replaceAll('-', '')}.${String(ahora.getUTCHours()).padStart(2, '0')}${String(ahora.getUTCMinutes()).padStart(2, '0')}`

// Tras compilar: CSP con el hash del script en línea y CACHE del sw.js = versión (ya no hay que subirlo a mano)
const remate = () => ({
  name: 'remate',
  apply: 'build',
  enforce: 'post',
  closeBundle() {
    const p = 'dist/index.html'
    let html = readFileSync(p, 'utf8')
    const hashes = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].filter((m) => m[1].trim())
      .map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`)
    const csp = `default-src 'self'; script-src 'self' ${hashes.join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; manifest-src 'self'; worker-src 'self' blob:; base-uri 'none'; form-action 'none'; object-src 'none'`
    html = html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`)
    writeFileSync(p, html)
    writeFileSync('dist/sw.js', readFileSync('dist/sw.js', 'utf8').replace('__CACHE__', `habitos-${VERSION}`))
  },
})

export default defineConfig({
  base: './',
  define: { __VERSION__: JSON.stringify(VERSION) },
  plugins: [react(), tailwindcss(), viteSingleFile(), remate()],
  build: { assetsInlineLimit: 100000000 },
})
