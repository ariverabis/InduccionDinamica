Envoltorio del set oficial de iconos Prisma. 301 glifos SVG en `assets/icons/icons.svg` como sprite (`<symbol id="icon-NN">`).

```jsx
<Icon name={20} size={24} />
```

Props:
- `name` — numero del icono (1-302; el 73 no existe)
- `size` — pixel size (default 20)
- `color` — color CSS (hereda `currentColor` del padre por default)

Los iconos son recoloreables con CSS `color` o `fill`:
```jsx
<Icon name={5} size={24} color="var(--status-bad)" />
```
