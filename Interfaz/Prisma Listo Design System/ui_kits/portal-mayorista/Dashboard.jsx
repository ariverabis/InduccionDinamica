const { Card, Badge, Tag, Button, Tabs, Icon } = window.PrismaDesignSystem_5fbffe;

function Dashboard() {
  const [tab, setTab] = React.useState('Resumen');
  const kpis = [['Pedidos del mes','1,324','+8% vs. junio'],['Comercios activos','5,789','142 nuevos'],['Ticket promedio','$412','−3% vs. junio'],['En ruta hoy','86','12 con retraso']];
  const rows = [
    ['#10428','Ferretería El Tornillo','Caracas','18 renglones','$1,240','En ruta'],
    ['#10427','Abastos La Vega','Valencia','7 renglones','$389','Preparando'],
    ['#10425','Depósito San Martín','Maracay','32 renglones','$2,915','Entregado'],
    ['#10424','Comercial Los Andes','Mérida','11 renglones','$742','Entregado'],
  ];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'var(--space-5)'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'var(--space-4)'}}>
        {kpis.map(([l,v,d]) => (
          <Card key={l} title={l}>
            <div style={{fontSize:32,fontWeight:700,lineHeight:1.1}}>{v}</div>
            <div style={{fontSize:'var(--fs-caption)',color:'var(--color-text-muted)',marginTop:4}}>{d}</div>
          </Card>
        ))}
      </div>
      <Tabs tabs={['Resumen','Pedidos','Cobranza']} active={tab} onChange={setTab} />
      <div style={{display:'grid',gridTemplateColumns:'2.2fr 1fr',gap:'var(--space-4)',alignItems:'start'}}>
        <Card title="Pedidos recientes">
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'var(--fs-body)'}}>
            <thead><tr style={{textAlign:'left',color:'var(--color-text-muted)',fontSize:'var(--fs-caption)',textTransform:'uppercase',letterSpacing:'.06em'}}>
              {['Pedido','Comercio','Ciudad','Detalle','Total','Estado'].map(h => <th key={h} style={{padding:'8px 0',fontWeight:600,borderBottom:'1px solid var(--color-border)'}}>{h}</th>)}
            </tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r[0]}>
                <td style={{padding:'12px 0',borderBottom:'1px solid var(--color-border)',fontWeight:600}}>{r[0]}</td>
                <td style={{padding:'12px 0',borderBottom:'1px solid var(--color-border)'}}>{r[1]}</td>
                <td style={{padding:'12px 0',borderBottom:'1px solid var(--color-border)',color:'var(--color-text-secondary)'}}>{r[2]}</td>
                <td style={{padding:'12px 0',borderBottom:'1px solid var(--color-border)',color:'var(--color-text-secondary)'}}>{r[3]}</td>
                <td style={{padding:'12px 0',borderBottom:'1px solid var(--color-border)',fontWeight:600}}>{r[4]}</td>
                <td style={{padding:'12px 0',borderBottom:'1px solid var(--color-border)'}}><Badge tone={r[5]==='Entregado'?'dark':'neutral'}>{r[5]}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
        <div style={{display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
          <Card title="Listas por revisar">
            <div style={{display:'flex',flexDirection:'column',gap:12,fontSize:'var(--fs-body)'}}>
              {[['Alimentos Polar','ayer'],['Ferretera Nacional','hace 3 días'],['Papelera Central','hace 6 días']].map(([n,d]) => (
                <div key={n} style={{display:'flex',alignItems:'center',gap:10}}>
                  <Icon name={200} size={18} />
                  <div style={{flex:1}}><div style={{fontWeight:600}}>{n}</div><div style={{fontSize:'var(--fs-caption)',color:'var(--color-text-muted)'}}>Cargada {d}</div></div>
                </div>
              ))}
              <Button variant="secondary" size="sm">Revisar listas</Button>
            </div>
          </Card>
          <Card title="Rubros con más demanda">
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><Tag>Ferretería</Tag><Tag>Alimentos</Tag><Tag>Limpieza</Tag><Tag>Papelería</Tag><Tag>Construcción</Tag></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
window.Dashboard = Dashboard;
