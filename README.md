# Hábitos

App de seguimiento de hábitos diarios: https://fau25.github.io/mis-habitos/

- En la raíz está la app ya compilada (un solo `index.html`, manifest, `sw.js` e iconos).
- En `codigo/` está el código fuente (React + Tailwind) y sus pruebas. Para publicar un cambio: `npm install` y `npm run build` en `codigo/`, y copiar `dist/*` a la raíz. La versión (y el `CACHE` del service worker) se ponen solos.
- Las pruebas pasan solas en GitHub Actions (`.github/workflows/pruebas.yml`) en cada cambio de `codigo/`.
- Los datos se guardan en el navegador (localStorage) con copias automáticas diarias y exportar/importar en Ajustes; no hay datos ni claves en el repo.

## Sincronización (12 nov 2026)
Opcional, en Ajustes › Sincronización: con un script de Google propio (`codigo/sincronizacion/Code.gs`, sin contraseña en el repo) los hábitos se guardan en Drive («Hábitos»: datos.json + copias diarias) y se comparten entre dispositivos. Cada hábito y cada día marcado se sincronizan por separado (marcar en dos dispositivos a la vez no pisa nada). Pruebas: `node codigo/sincronizacion/prueba.cjs` y `tests/app.test.py` (33).
