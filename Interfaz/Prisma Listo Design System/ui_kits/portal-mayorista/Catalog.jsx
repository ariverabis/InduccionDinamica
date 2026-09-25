const { Card, Button, Tag, Select, Icon, Badge } = window.PrismaDesignSystem_5fbffe;

function Catalog({ onAdd }) {
  const products = [
    ['Tornillo autorroscante 8×1½','Ferretera Nacional','Caja 500 u.','$18,40',300],
    ['Cemento gris 42,5 kg','Constructora Sur','Saco','$9,90',290],
    ['Detergente en polvo 5 kg','Limpieza Total','Bulto 4 u.','$22,00',140],
    ['Harina de maíz 1 kg','Alimentos Polar','Bulto 20 u.','$27,60',175],
    ['Papel bond carta','Papelera Central','Resma 500 h.','$4,80',120],
    ['Guantes de nitrilo talla M','Segura Industrial','Caja 100 u.','$11,20',45],
  ];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'var(--space-5)'}}>
      <div style={{display:'flex',gap:16,alignItems:'flex-end'}}>
        <div style={{width:200}}><Select label="Rubro" options={['Todos los rubros','Ferretería','Alimentos','Limpieza','Papelería']} /></div>
        <div style={{width:200}}><Select label="Proveedor" options={['Todos','Ferretera Nacional','Alimentos Polar']} /></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}><Tag>Precio actualizado hoy</Tag><Tag>Sin mínimo</Tag></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--space-4)'}}>
        {products.map(([n,prov,unit,price,ic]) => (
          <Card key={n}>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{height:88,background:'var(--gray-50)',borderRadius:'var(--radius-md)',display:'grid',placeItems:'center'}}><Icon name={ic} size={32} /></div>
              <div><div style={{fontSize:'var(--fs-body)',fontWeight:600,lineHeight:1.3}}>{n}</div><div style={{fontSize:'var(--fs-caption)',color:'var(--color-text-muted)',marginTop:2}}>{prov} · {unit}</div></div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'var(--fs-h3)',fontWeight:700}}>{price}</span>
                <Button size="sm" onClick={onAdd}>Agregar</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
window.Catalog = Catalog;
