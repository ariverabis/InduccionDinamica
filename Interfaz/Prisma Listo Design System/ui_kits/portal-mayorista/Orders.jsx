const { Card, Badge, Button, Checkbox, Switch, Radio, Icon } = window.PrismaDesignSystem_5fbffe;

function Orders() {
  const [sel, setSel] = React.useState('#10428');
  const [notify, setNotify] = React.useState(true);
  const [entrega, setEntrega] = React.useState('domicilio');
  const list = [['#10428','Ferretería El Tornillo','En ruta','$1,240'],['#10427','Abastos La Vega','Preparando','$389'],['#10425','Depósito San Martín','Entregado','$2,915'],['#10424','Comercial Los Andes','Entregado','$742']];
  const lines = [['Tornillo autorroscante 8×1½','4 cajas','$73,60'],['Cemento gris 42,5 kg','20 sacos','$198,00'],['Guantes de nitrilo talla M','6 cajas','$67,20']];
  return (
    <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:'var(--space-4)',alignItems:'start'}}>
      <Card title="Pedidos">
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {list.map(([id,name,st,total]) => (
            <div key={id} onClick={()=>setSel(id)} style={{padding:'12px',borderRadius:'var(--radius-md)',cursor:'pointer',background:sel===id?'var(--gray-50)':'transparent',border:sel===id?'1px solid var(--color-border-strong)':'1px solid transparent'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'var(--fs-body)',fontWeight:600}}><span>{id}</span><span>{total}</span></div>
              <div style={{fontSize:'var(--fs-caption)',color:'var(--color-text-secondary)',margin:'4px 0 8px'}}>{name}</div>
              <Badge tone={st==='Entregado'?'dark':'neutral'}>{st}</Badge>
            </div>
          ))}
        </div>
      </Card>
      <div style={{display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
        <Card title={'Pedido ' + sel}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'var(--fs-body)'}}>
            <tbody>{lines.map(([n,q,t]) => (
              <tr key={n}>
                <td style={{padding:'10px 0',borderBottom:'1px solid var(--color-border)'}}>{n}</td>
                <td style={{padding:'10px 0',borderBottom:'1px solid var(--color-border)',color:'var(--color-text-secondary)'}}>{q}</td>
                <td style={{padding:'10px 0',borderBottom:'1px solid var(--color-border)',textAlign:'right',fontWeight:600}}>{t}</td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{display:'flex',justifyContent:'flex-end',gap:24,marginTop:16,fontSize:'var(--fs-body-lg)'}}>
            <span style={{color:'var(--color-text-secondary)'}}>Total</span><span style={{fontWeight:700}}>$338,80</span>
          </div>
        </Card>
        <Card title="Entrega">
          <div style={{display:'flex',flexDirection:'column',gap:14,fontSize:'var(--fs-body)'}}>
            <div style={{display:'flex',gap:24}}>
              <Radio label="Envío a domicilio" checked={entrega==='domicilio'} onChange={()=>setEntrega('domicilio')} />
              <Radio label="Retiro en depósito" checked={entrega==='retiro'} onChange={()=>setEntrega('retiro')} />
            </div>
            <Checkbox label="Aceptar entregas parciales" checked onChange={()=>{}} />
            <div style={{display:'flex',alignItems:'center',gap:10}}><Switch checked={notify} onChange={setNotify} />Avisarme por WhatsApp cuando salga a ruta</div>
            <div style={{display:'flex',gap:10}}><Button>Confirmar pedido</Button><Button variant="secondary">Guardar borrador</Button><Button variant="ghost">Descargar PDF</Button></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
window.Orders = Orders;
