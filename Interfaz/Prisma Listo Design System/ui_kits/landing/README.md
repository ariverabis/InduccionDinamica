# Landing (Takt)

Página de aterrizaje de producto de una sola pantalla, en la voz de Prisma. El producto (**Takt** — horarios con precisión de reloj suizo) es inventado; sirve para mostrar cómo se ve una landing acromática del sistema.

## Archivos
- `index.html` — vista completa; incluye la barra de documentación superior.
- `DocBar.jsx` — barra de documentación: título 18px semibold negro + descripción 14px regular en `--gray-500`, botón secundario *Abrir* (radio 8px, borde a negro en hover).
- `LandingPage.jsx` — nav, hero con líneas divisorias, fila de estadísticas, filas de características, banda de fotografía en escala de grises y cierre tipo póster.

## Notas
- Paleta estrictamente acromática: sin colores de acento y sin fondos oscuros arbitrarios (`#1e1e1e`); el cierre usa `--black` puro, que es un valor del sistema.
- La descripción de origen mencionaba un "cierre tipo póster rojo"; se sustituyó por acromático para no romper la paleta.
- La fotografía es un `<image-slot>` para que se arrastre una imagen real; se fuerza `grayscale(1)`.
