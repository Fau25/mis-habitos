# Hábitos · seguimiento de hábitos diarios (PWA)

React 19 + Tailwind 4 + Lucide, y los datos se guardan en localStorage.

- `npm install` y luego `npm run dev` para trabajar; `npm run build` genera `dist/` (un solo `index.html` con todo dentro, más el manifest, sw.js y los iconos).
- En cada cambio, subir `CACHE` en `public/sw.js` (`habitos-vNN`).
- Código: `src/lib` (fechas, rachas, almacenamiento) y `src/components` (Hoy, Habito, Progreso, Formulario, Estadisticas, MapaCalor).
