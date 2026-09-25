# Prisma — Design System

Prisma es una marca de **distribución mayorista B2B en Latinoamérica** (Venezuela, Colombia, Costa Rica). El producto central es el **Portal Mayorista**: un comercio (ferretería, abasto, papelería, depósito) entra, ve su panel, arma un pedido con las listas de precios de varios proveedores y lo confirma. Todo el sistema está en **español latinoamericano**.

La identidad es deliberadamente **acromática**: blanco, negro y una escala de grises. No hay color de acento cromático. El único gesto de marca es el isotipo — una **S/∞ continua** en gris y negro que remata en el punto de una **P** minúscula.

## Fuentes recibidas

| Fuente | Ruta / enlace | Qué se extrajo |
| --- | --- | --- |
| Carpeta local `components/` | montada por el usuario (solo lectura) | Inventario completo de primitivos: 12 componentes en 5 grupos. Portados textualmente. |
| Carpeta local `tokens/` | montada por el usuario | `colors.css`, `typography.css`, `spacing.css`, `fonts.css`. Valores copiados sin redondear. |
| Carpeta local `prisma/` | montada por el usuario | `_ds_manifest.json` de una versión anterior de este mismo sistema — usado para confirmar nombres, subtítulos de fichas y agrupaciones. |
| Fuentes tipográficas | `uploads/MyriadPro-{Light,Regular,Semibold,Bold,Black}.otf` | 5 pesos de Myriad Pro → `assets/fonts/` |
| Logotipos | `uploads/{logotipo,isotipo}*.png` (4 variantes cada uno) | → `assets/logo/` |
| Íconos | `uploads/icon-*.png` (301 archivos) | Set oficial completo → `assets/icons/` |

No se entregó Figma, repositorio de GitHub, sitio web ni deck. **No existe código del producto real**: el UI kit reproduce tokens, densidad y tipografía de Prisma, pero su contenido es de muestra (ver `ui_kits/portal-mayorista/README.md`).

---

## CONTENT FUNDAMENTALS

**Idioma.** Español latinoamericano, sin voseo. Nunca se mezcla inglés en la interfaz: es "Ajustes", no "Settings"; "Pedido", no "Order".

**Persona.** Se habla al cliente en **lenguaje formal (usted)**, y de Prisma en tercera persona o en plural implícito — nunca "nosotros creemos que…". Ejemplos reales del sistema:

- `Use el correo con el que registró su negocio.`
- `Conecte su negocio con los mayoristas que ya le surten y arme un pedido en minutos.`
- `Avisarme por WhatsApp cuando salga a ruta` ← la casilla habla en primera persona, porque es el usuario quien elige.

**Casing.** *Sentence case* en todo: títulos, botones, etiquetas de campo, encabezados de tabla. No hay Title Case ni MAYÚSCULAS salvo en microetiquetas de 11px con `letter-spacing:.08em` (encabezados de tabla, rótulos de grupo de íconos).

**Botones.** Verbo en infinitivo, una o dos palabras: `Guardar`, `Cancelar`, `Entrar`, `Confirmar pedido`, `Revisar listas`, `Ver más`. Nunca "¡Empieza ahora!" ni signos de exclamación.

**Cifras.** Coma decimal y punto de miles al uso local: `$18,40`, `1.324 pedidos`, `5.789 comercios`. Los deltas van en texto apagado y con signo tipográfico: `+8% vs. junio`, `−3% vs. junio`.

**Estados.** Palabra llana dentro de una cápsula: `Activo`, `Al día`, `Preparando`, `En ruta`, `Entregado`, `Pendiente`. Nunca se colorea el estado (no hay verde ni rojo en la marca): se distingue por relleno gris vs. borde negro.

**Vacíos y límites.** Se dicen con franqueza, sin humor ni ilustración: `Esta vista no está definida en las fuentes entregadas.`

**Emoji: no.** Cero emoji, en producto y en materiales. La expresividad la carga el peso tipográfico (Black 900), no los símbolos.

**Vibra.** Operativa y sobria. Es una herramienta de trabajo para alguien que compra mercancía todos los días: densidad alta, cero celebración, cero jerga de startup. Cuando hay una promesa de marca es corta y concreta: `Un pedido, todos tus proveedores.` / `Mayoreo sin fricción`.

---

## VISUAL FOUNDATIONS

**Paleta.** Acromática y total: `--white #ffffff` como superficie, `--black #000000` como texto no como fondo dramático, y una rampa de 9 grises (`--gray-50 #f9fafb` → `--gray-800 #2b2b2b`). El **gris de marca es `--gray-300 #c6c6c6`** (`--color-brand-accent`): es el relleno del botón primario, del estado activo de navegación y de las cápsulas de estado. Pueden usarse amarillo, rojo y verde en tonos sobrios no vibrantes cuando se quiera resaltar acciones (bien, regular, malo).

**Tipografía.** Myriad Pro, una sola familia. `--font-body` para todo el contenido; `--font-display`/`--font-cond` para titulares. Escala de 9 pasos: 64 / 48 / 36 / 28 / 22 / 18 / 16 / 14 / 12px. Interlineado 1.1 en display, 1.25 en encabezados, 1.5 en cuerpo. Pesos 300 / 400 / 600 / 700 / 900. **Sin cursivas** (no se subieron los archivos itálicos y la marca no las usa). El semibold 600 hace casi todo el trabajo de jerarquía en UI; el Black 900 se reserva para display grande.

**Reglas de uso de los tres tamaños de lectura** (obligatorias en todo el sistema):
- **Body Large — 16px (`--fs-body-lg`).** Tamaño por defecto de prácticamente todo el contenido que el usuario debe leer; 16px es hoy el estándar de lectura cómoda. Ej.: «Consulte sus pedidos en tiempo real y realice nuevas compras cuando lo necesite.»
- **Body — 14px (`--fs-body`).** Sólo información secundaria que acompaña al contenido principal. Ej.: «Última actualización: hace 5 minutos.» / «Disponible únicamente para clientes registrados.»
- **Caption — 12px (`--fs-caption`).** Nunca para párrafos. Únicamente ayudas, etiquetas, leyendas, copyright y fechas. Ej.: «* Los precios pueden variar sin previo aviso.»

**Espaciado.** Escala 4/8pt: 4, 8, 12, 16, 24, 32, 48, 64, 96px. Las tarjetas llevan 24px de padding y 12px entre bloques internos; las páginas 32px de margen. Hay **mucho aire**: la densidad de datos se logra con tipografía pequeña, no apretando el espaciado.

**Fondos.** Planos, siempre. Página `--gray-50`, superficies `--white`, y `--medium gray`completo para paneles de énfasis (mitad derecha del login). **No hay gradientes, texturas, patrones repetidos ni fotografía**. El único elemento gráfico de fondo permitido es el isotipo al 30% de opacidad, anclado a una esquina y sangrado fuera del borde — nunca detrás de un bloque de texto.

**Bordes.** 1px, `--gray-200` en reposo (`--color-border`) y `--gray-300` en controles de formulario (`--color-border-strong`). Nunca bordes de color ni bordes gruesos, y nunca un borde de acento en un solo lado.

**Radios.** Dos valores y nada más: **8px** en todo rectángulo (tarjeta, botón, campo, tag) y **999px (pill)** en cápsulas, casillas, radios, interruptores y avatares. `--radius-sm` y `--radius-md` valen los dos 8px a propósito: no hay escalonado de radios.

**Sombras.** Casi inexistentes. `--shadow-card: 0 1px 3px rgba(0,0,0,.08)` es un susurro que solo separa la tarjeta blanca del fondo `--gray-50`; `--shadow-dialog: 0 8px 24px rgba(0,0,0,.12)` es la única sombra elevada. No hay sombras internas, ni sombras de color, ni apilar borde + sombra fuerte.

**Tarjetas.** Blanco, borde de 1px `--gray-200`, radio 8px, `--shadow-card`, 24px de padding. Título de 16px semibold con 12px de separación del contenido. La cifra grande de un KPI va a 32px bold; su nota, a 12px `--color-text-muted`.

**Hover.** Cambio de color, nunca de tamaño. Botón primario: gris → **gris oscuro puro** con texto blanco (la inversión total es la firma de interacción de Prisma). Botón secundario: el borde pasa a negro. Ghost: el texto baja a `--color-text-secondary`. Fila de navegación: fondo `--gray-50`.

**Press.** Solo **opacidad 0.7**. Sin `scale()`, sin desplazamiento vertical, sin sombra que colapsa.

**Foco.** Anillo de 2px `--gray-400` con `outline-offset:1px` sobre el campo, y el borde sube de `--gray-300` a `--gray-400`.

**Deshabilitado.** Fondo `rgba(198,198,198,.4)` (el gris de marca al 40%) con texto `--gray-500`; el cursor vuelve a `default`, no a `not-allowed`.

**Animación.** Mínima y funcional. `--transition-fast: 150ms ease` para hover / press / foco; `--transition-base: 200ms ease` para aparición de paneles. Solo se animan `background`, `color`, `border-color`, `opacity` y una traslación corta (el pulgar del `Switch`, 18px). **Sin rebotes, sin resortes, sin animación de entrada al cargar, sin parallax.**

**Transparencia y desenfoque.** La transparencia aparece en exactamente tres lugares: press (70%), deshabilitado (40%) y marca de agua (30%). **No se usa `backdrop-filter` ni vidrio esmerilado** en ninguna parte.

**Layout.** Barra lateral fija de 236px con el logotipo arriba y la ficha de usuario abajo (`margin-top:auto`); barra superior fija de 64px con título a la izquierda y buscador + carrito a la derecha; contenido en grilla de 3 o 4 columnas con 16px de gap. Ni la lateral ni la superior se colapsan en el kit entregado.

**Imágenes.** No hay fotografía en el sistema. Cuando hace falta un espacio de producto se usa un bloque `--gray-50` con un ícono de línea centrado. Si en el futuro entra fotografía, la vibra correcta es **fría, desaturada, casi blanco y negro** — nunca cálida ni con grano.

**Gradientes de protección.** No existen: como no hay imágenes de fondo, el texto blanco solo vive sobre negro plano.

---

## ICONOGRAPHY

- **Set propio, no una libreria.** Prisma trae un set oficial de **301 glifos** como SVG sprite en `assets/icons/icons.svg`. Cada icono es un `<symbol id="icon-NN">` direccionable individualmente.
- **Formato: SVG vectorial en sprite**, trazo fino (~1.5px equivalente), sin relleno, terminaciones redondeadas. Recoloreable con `color` / `currentColor` o con CSS `fill`.
- **Tamaños de uso:** 16 / 18 / 20 / 24px en interfaz; 32px en bloques de producto; 48px solo en vacíos. El default del componente `Icon` es 20px.
- **Acceso:** usar el componente `Icon` (`<Icon name={20} size={24} />`), donde `name` es el numero del icono (1-302, sin 73). Prop opcional `color` para color CSS. Para inline: `<svg><use href="assets/icons/icons.svg#icon-20"/></svg>`.
- **No se usa ninguna libreria CDN** (Lucide, Heroicons, Font Awesome). La unica excepcion es la palomita del `Checkbox`, un SVG inline de 12px con `stroke-width:1.75`, que ya viene en el componente.

---
## Index

### Raíz

- `styles.css` — único punto de entrada de CSS (solo `@import`).
- `readme.md` — este documento.
- `SKILL.md` — envoltorio para usar el sistema como Agent Skill.
- `thumbnail.html` — mosaico del sistema.

### `tokens/`

`fonts.css` (5 `@font-face` de Myriad Pro) · `colors.css` (rampa + alias semánticos) · `typography.css` (familias, escala, pesos, interlineados) · `spacing.css` (escala, radios, bordes, sombras, transiciones).

### `assets/`

`fonts/` (5 .otf) · `logo/` (logotipo e isotipo × estándar, alto contraste, invertido, 30%) · `icons/` (301 PNG).

### Components — 12 primitivos, 5 grupos

- `components/forms/` — **Button**, **Input**, **Textarea**, **Select**, **SegmentedControl**, **Checkbox**, **Radio**, **Switch**
- `components/feedback/` — **Badge**, **Tag**
- `components/navigation/` — **Tabs**, **NavItem**
- `components/surfaces/` — **Card**
- `components/overlays/` — **Dialog**
- `components/media/` — **Icon**

Cada uno trae `.jsx`, `.d.ts` y `.prompt.md`; cada carpeta trae su ficha `@dsCard`. Este inventario es exactamente el de la carpeta `components/` entregada: **no se agregó ningún primitivo** (no hay Dialog, Toast, Tooltip ni Avatar porque la fuente no los define).

**Colores de estado** — `--status-good` #388e3c, `--status-regular` #f57f17, `--status-bad` #d32f2f. Tonos sobrios, no vibrantes; se usan **solo** en texto, punto indicador o borde sutil de cápsulas de estado ("Operativo", "En revisión", "Crítico"), nunca como relleno de superficies ni fondo de lámina. La paleta base sigue siendo estrictamente gris.

### `guidelines/` — 19 fichas de fundamentos

Brand (isotipo/logotipo, fondos, tamaño mínimo y aire, marca de agua, variantes, trazo de íconos) · Colors (marca, rampa, alias semánticos, tokens de botón) · Type (display, cuerpo, pesos, escala, condensada) · Spacing (escala, radio y sombra, espaciado en uso, movimiento).

### `ui_kits/portal-mayorista/`

`index.html` (app navegable: Panel · Catálogo · Pedidos) y `login.html`, con `Shell.jsx`, `Dashboard.jsx`, `Catalog.jsx`, `Orders.jsx`, `Login.jsx`. Ver el README de esa carpeta.

---

## Pendientes conocidos

1. **Myriad Pro Cond no está subida.** `--font-display` y `--font-cond` apuntan a "Myriad Pro Cond"; hoy caen a Myriad Pro. **No se sustituyó por una fuente de Google a propósito** — hace falta el .otf real.
2. **Sin itálicas.** Los tokens no las declaran y los componentes no las usan; si la marca las necesita, faltan 5 archivos.
3. **Sin código ni Figma del producto.** El UI kit es fiel en tokens y densidad, no una recreación pixel a pixel.
4. **Sin plantilla de slides.** No se entregó ningún deck, así que no se inventaron slides.
