const { NavItem, Icon, Badge, Input } = window.PrismaDesignSystem_5fbffe;

function Sidebar({ view, setView }) {
  const items = [['Panel',20],['Pedidos',60],['Catálogo',120],['Comercios',33],['Facturas',175],['Ajustes',80]];
  return (
    <aside style={{width:236,flexShrink:0,background:'var(--white)',borderRight:'1px solid var(--color-border)',padding:'20px 12px',display:'flex',flexDirection:'column',gap:24,boxSizing:'border-box'}}>
      <img src="../../assets/logo/logotipo.png" alt="Prisma" style={{width:132,objectFit:'contain',marginLeft:8}} />
      <nav style={{display:'flex',flexDirection:'column',gap:2}}>
        {items.map(([l,ic]) => <NavItem key={l} label={l} icon={<Icon name={ic} size={18} />} active={view===l} onClick={()=>setView(l)} />)}
      </nav>
      <div style={{marginTop:'auto',padding:'14px 16px',borderTop:'1px solid var(--color-border)',display:'flex',alignItems:'center',gap:10}}>
        <span style={{width:32,height:32,borderRadius:'var(--radius-pill)',background:'var(--gray-300)',display:'grid',placeItems:'center',fontSize:'var(--fs-caption)',fontWeight:700}}>MT</span>
        <div style={{fontSize:'var(--fs-body)',lineHeight:1.3}}><div style={{fontWeight:600}}>María Terán</div><div style={{color:'var(--color-text-muted)',fontSize:'var(--fs-caption)'}}>Distribuidora Andina</div></div>
      </div>
    </aside>
  );
}

function Topbar({ title, cart, onCart }) {
  return (
    <header style={{height:64,flexShrink:0,borderBottom:'1px solid var(--color-border)',background:'var(--white)',display:'flex',alignItems:'center',gap:20,padding:'0 28px'}}>
      <div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-h2)',fontWeight:700}}>{title}</div>
      <div style={{width:280,marginLeft:'auto'}}><Input placeholder="Buscar producto, comercio o pedido" /></div>
      <span onClick={onCart} style={{display:'inline-flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:'var(--fs-body)',fontWeight:600}}>
        <Icon name={110} size={20} />Pedido {cart > 0 && <Badge tone="dark">{cart}</Badge>}
      </span>
    </header>
  );
}

Object.assign(window, { Sidebar, Topbar });
