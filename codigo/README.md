# Hábitos · código fuente

React 19 + Vite + Tailwind 4 + lucide-react. Los datos se guardan en el navegador (localStorage, clave `habitos-v1`), con copias automáticas diarias (`habitos-copias`) y exportar/importar en Ajustes.

- `npm install`, luego `npm run dev` para trabajar.
- `npm run build` genera `dist/`: un solo `index.html` con todo dentro, más manifest, `sw.js` e iconos. **La versión se pone sola** (fecha y hora de la compilación): aparece en Ajustes y en el `CACHE` del service worker. La compilación añade también la CSP con el hash del script.
- Pruebas: `python3 tests/app.test.py` (Playwright; sirve `dist/` solo). Se ejecutan también en GitHub Actions en cada cambio de `codigo/`.
- Publicar: copiar `dist/*` a la raíz del repo y subir a `main`.

Código: `src/lib` (fechas, rachas, almacenamiento y copias) y `src/components` (Hoy, Habito, Estadisticas, Ajustes, Formulario).
