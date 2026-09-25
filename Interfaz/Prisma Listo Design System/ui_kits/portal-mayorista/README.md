# UI kit — Portal Mayorista

Recreación del portal B2B de Prisma: el comercio entra, revisa su panel, arma el pedido desde el catálogo y lo confirma.

## Archivos
- `index.html` — app navegable (Panel · Catálogo · Pedidos; las demás entradas del menú quedan explícitamente vacías).
- `login.html` — pantalla de entrada aislada.
- `Shell.jsx` — `Sidebar` (logotipo + `NavItem`) y `Topbar` (título + buscador + carrito).
- `Dashboard.jsx` — 4 KPI en `Card`, `Tabs`, tabla de pedidos recientes, listas por revisar, rubros con `Tag`.
- `Catalog.jsx` — grilla de 3 columnas de productos con ícono, proveedor, unidad, precio y `Button` de agregar.
- `Orders.jsx` — lista maestra + detalle de renglones + bloque de entrega (`Radio`, `Checkbox`, `Switch`).
- `Login.jsx` — formulario a la izquierda, panel negro con isotipo al 30% a la derecha.

## Reglas seguidas
- Todo primitivo viene de `window.PrismaDesignSystem_*` — no se re-implementa `Button`, `Card`, etc.
- Fondo de página `--gray-50`; superficies blancas con borde de 1px y `--shadow-card`.
- Estado se comunica con `Badge` (gris = en proceso, borde negro = cerrado), nunca con verde/rojo.

## Límite conocido
No se entregó código ni Figma del producto real: la estructura, densidad, tokens y tipografía son de Prisma, pero el contenido (nombres de comercios, cifras, renglones) es de muestra. Confirmar layout real antes de usar como referencia pixel a pixel.
