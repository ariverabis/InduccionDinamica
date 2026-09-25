Control segmentado para elegir entre 2–4 vistas o modos mutuamente excluyentes, en una sola fila unida.

```jsx
<SegmentedControl
  label="Vista"
  options={[{value:'grid',label:'Cuadrícula',icon:<Icon name={12} size={16} />},{value:'list',label:'Lista'},{value:'board',label:'Tablero'}]}
  value={vista}
  onChange={setVista}
/>
```

- El segmento activo se marca con fondo `--gray-300` y peso 600, nunca con color de acento.
- Hover en los inactivos: `--gray-50`. Separadores de 1px con `--color-border-strong`.
- Más de cuatro opciones o etiquetas largas: usa `Select` o `Tabs`.
