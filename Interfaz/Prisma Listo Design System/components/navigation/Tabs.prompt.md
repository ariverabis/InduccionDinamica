Pestañas subrayadas: la activa lleva subrayado negro de 2px y semibold; las demás, texto secundario.

```jsx
<Tabs tabs={['General','Pedidos','Facturas']} active={t} onChange={setT} />
```

El subrayado inactivo es transparente de 2px para que no se mueva el texto.
