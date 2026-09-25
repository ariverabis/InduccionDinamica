Diálogo modal de confirmación: una decisión corta con scrim gris translúcido, superficie blanca y dos botones alineados a la derecha.

```jsx
<Dialog
  title="¿Publicar esta página?"
  confirmLabel="Publicar"
  cancelLabel="Cancelar"
  onConfirm={publish}
  onCancel={close}
>
  Queda disponible en su URL actual. Puede despublicarla en cualquier momento y nada más del sitio cambia.
</Dialog>
```

- `inline` fija el scrim dentro del contenedor padre en vez del viewport — úsalo sólo en especímenes.
- El botón de confirmación es `Button variant="primary"` (gris oscuro sobre blanco); nunca un acento de color.
- El scrim usa `--color-scrim`; la superficie es blanca con `--shadow-dialog` y borde de 1px, nunca negra.
- Un solo botón: pasa `cancelLabel={null}`.
