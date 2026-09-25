Campo de texto multilínea con la etiqueta encima, para notas y descripciones libres.

```jsx
<Textarea label="Notas" rows={3} placeholder="Instrucciones para el despacho" value={notas} onChange={setNotas} />
```

- Mismo borde, radio y estado de foco que `Input`; el cuerpo va a 16px porque es contenido que el usuario lee y escribe.
- `resize: vertical` únicamente; nunca horizontal.
- Deshabilitado: fondo `--gray-50` y texto apagado.
