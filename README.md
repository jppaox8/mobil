# mobil

Arabella Chic — tienda de calzado femenino. Sitio estático en React (cargado en
el navegador vía Babel standalone), sin paso de build.

## Estructura

- `*.html` — páginas (home, botines, stilletos, detalle de producto, contacto).
- `js/utils.js` — lógica de negocio compartida y pura (precio, carrito,
  filtros, validación del formulario). Se usa tanto en el navegador
  (`window.ArabellaUtils`) como en los tests.
- `js/app.js`, `js/botines.js`, `js/stillettos.js`, `js/botas.js`,
  `js/contacto.js` — componentes React de cada página, que consumen `utils.js`.
- `data/shoes.json` — catálogo de productos.

## Tests

Los tests unitarios cubren la lógica de negocio de `js/utils.js` con Jest.

```bash
npm install
npm test            # ejecuta la suite
npm run test:coverage
```
