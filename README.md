# Hábitos

App de seguimiento de hábitos diarios: https://fau25.github.io/mis-habitos/

- En la raíz está la app ya compilada (un solo `index.html`, manifest, `sw.js` e iconos).
- En `codigo/` está el código fuente (React + Tailwind). Para publicar un cambio: `npm install` y `npm run build`, copiar `dist/*` a la raíz y subir `CACHE` en `sw.js`.
- Los datos se guardan en el navegador (localStorage); no hay datos ni claves en el repo.
