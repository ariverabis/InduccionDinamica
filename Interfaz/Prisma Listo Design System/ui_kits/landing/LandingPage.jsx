const LANDING_MAX=1160;
function Rule(){return <div style={{height:1,background:'var(--gray-200)'}}></div>;}
function Wrap({children,style}){return <div style={{maxWidth:LANDING_MAX,margin:'0 auto',padding:'0 40px',...style}}>{children}</div>;}

function LandingNav(){
  const items=['Producto','Cómo funciona','Precios','Documentación'];
  return (
    <header style={{borderBottom:'1px solid var(--gray-200)',background:'var(--white)',position:'sticky',top:0,zIndex:5}}>
      <Wrap style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:96,padding:'0 40px'}}>
        <div style={{display:'flex',alignItems:'center'}}>
          <img src="../../assets/logo/logotipo.png" alt="Prisma" style={{height:64,width:'auto',display:'block'}} />
        </div>
        <nav style={{display:'flex',alignItems:'center',gap:28,fontSize:'var(--fs-body)',color:'var(--gray-600)'}}>
          {items.map(i=><a key={i} href="#" style={{color:'inherit',textDecoration:'none'}}>{i}</a>)}
        </nav>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button style={{background:'transparent',border:'none',fontFamily:'var(--font-body)',fontSize:'var(--fs-body)',fontWeight:600,color:'var(--black)',cursor:'pointer'}}>Iniciar sesión</button>
          <button style={{background:'var(--color-btn-primary-bg)',border:'1px solid var(--gray-300)',borderRadius:8,padding:'9px 18px',fontFamily:'var(--font-body)',fontSize:'var(--fs-body)',fontWeight:600,color:'var(--black)',cursor:'pointer'}}>Solicitar demo</button>
        </div>
      </Wrap>
    </header>
  );
}

function LandingHero(){
  return (
    <section style={{background:'var(--white)'}}>
      <Wrap style={{padding:'88px 40px 64px'}}>
        <div style={{fontFamily:'var(--font-cond)',fontSize:'var(--fs-caption)',letterSpacing:'.14em',color:'var(--gray-500)',marginBottom:24}}>Planificación operativa</div>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-display-xl)',lineHeight:'var(--lh-tight)',fontWeight:700,margin:0,maxWidth:820,textWrap:'pretty'}}>Horarios con precisión de reloj suizo</h1>
        <p style={{fontSize:'var(--fs-body-lg)',lineHeight:'var(--lh-body)',color:'var(--gray-600)',maxWidth:560,margin:'24px 0 32px',textWrap:'pretty'}}>Takt ordena turnos, rutas y entregas en una sola línea de tiempo. Cambias una hora y el resto del plan se recalcula solo.</p>
        <div style={{display:'flex',gap:12,marginBottom:56}}>
          <button style={{background:'var(--color-btn-primary-bg)',border:'1px solid var(--gray-300)',borderRadius:8,padding:'12px 24px',fontFamily:'var(--font-body)',fontSize:'var(--fs-body-lg)',fontWeight:600,color:'var(--black)',cursor:'pointer'}}>Empezar ahora</button>
          <button style={{background:'var(--white)',border:'1px solid var(--gray-300)',borderRadius:8,padding:'12px 24px',fontFamily:'var(--font-body)',fontSize:'var(--fs-body-lg)',fontWeight:600,color:'var(--black)',cursor:'pointer'}}>Ver el plan de ejemplo</button>
        </div>
        <Rule/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderBottom:'1px solid var(--gray-200)'}}>
          {[['0,4 s','recálculo del plan completo'],['1.240','turnos coordinados al día'],['98,6 %','entregas dentro de ventana'],['14','centros de distribución']].map(([n,l])=>(
            <div key={n} style={{padding:'28px 24px 28px 0'}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-h1)',fontWeight:700,lineHeight:1}}>{n}</div>
              <div style={{fontSize:'var(--fs-body)',color:'var(--gray-500)',marginTop:8,lineHeight:'var(--lh-body)'}}>{l}</div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

function FeatureRows(){
  const rows=[
    ['01','Una sola línea de tiempo','Turnos, rutas y ventanas de entrega viven en el mismo eje. Nada se planifica en hojas aparte.'],
    ['02','Recálculo inmediato','Mueves un bloque y Takt propaga el cambio a todo lo que depende de él, con el conflicto marcado antes de publicarlo.'],
    ['03','Reglas propias','Descansos, topes de horas y capacidad por centro se definen una vez y se aplican en cada plan.'],
    ['04','Historial auditable','Cada versión del plan queda firmada, comparable y reversible.']
  ];
  return (
    <section style={{background:'var(--white)'}}>
      <Wrap style={{padding:'72px 40px'}}>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-display-md)',fontWeight:700,margin:'0 0 40px',lineHeight:'var(--lh-heading)'}}>Cómo funciona</h2>
        <div>
          {rows.map(([n,t,d])=>(
            <div key={n} style={{display:'grid',gridTemplateColumns:'64px 300px 1fr',gap:32,alignItems:'start',padding:'28px 0',borderTop:'1px solid var(--gray-200)'}}>
              <div style={{fontFamily:'var(--font-cond)',fontSize:'var(--fs-body)',color:'var(--gray-400)',paddingTop:4}}>{n}</div>
              <div style={{fontSize:'var(--fs-h3)',fontWeight:600}}>{t}</div>
              <div style={{fontSize:'var(--fs-body)',color:'var(--gray-600)',lineHeight:'var(--lh-body)',maxWidth:560,textWrap:'pretty'}}>{d}</div>
            </div>
          ))}
          <Rule/>
        </div>
      </Wrap>
    </section>
  );
}

function PhotoBand(){
  return (
    <section style={{background:'var(--gray-50)',borderTop:'1px solid var(--gray-200)',borderBottom:'1px solid var(--gray-200)'}}>
      <Wrap style={{padding:'72px 40px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}}>
        <div style={{position:'relative',height:360,filter:'grayscale(1)'}}>
          <image-slot id="landing-photo" shape="rounded" radius="12" placeholder="Foto del centro de distribución (blanco y negro)"></image-slot>
        </div>
        <div>
          <div style={{fontFamily:'var(--font-cond)',fontSize:'var(--fs-caption)',letterSpacing:'.14em',color:'var(--gray-500)',marginBottom:16}}>En operación</div>
          <h3 style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-h1)',fontWeight:700,margin:'0 0 16px',lineHeight:'var(--lh-heading)',textWrap:'pretty'}}>Diseñado con los equipos que trabajan de noche</h3>
          <p style={{fontSize:'var(--fs-body)',color:'var(--gray-600)',lineHeight:'var(--lh-body)',margin:0,maxWidth:460,textWrap:'pretty'}}>Cada pantalla se probó en piso, con luz baja y guantes puestos. Por eso los controles son grandes, el contraste es alto y la información cabe en una mirada.</p>
        </div>
      </Wrap>
    </section>
  );
}

function PosterClose(){
  return (
    <section style={{background:'var(--gray-100)',color:'var(--color-text-primary)'}}>
      <Wrap style={{padding:'96px 40px'}}>
        <div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-display-lg)',fontWeight:700,lineHeight:'var(--lh-tight)',maxWidth:760,textWrap:'pretty'}}>Empieza el próximo turno con el plan ya resuelto.</div>
        <div style={{display:'flex',gap:12,marginTop:36}}>
          <button style={{background:'var(--white)',border:'1px solid var(--gray-300)',borderRadius:8,padding:'12px 24px',fontFamily:'var(--font-body)',fontSize:'var(--fs-body-lg)',fontWeight:600,color:'var(--black)',cursor:'pointer'}}>Solicitar demo</button>
          <button style={{background:'transparent',border:'1px solid var(--gray-400)',borderRadius:8,padding:'12px 24px',fontFamily:'var(--font-body)',fontSize:'var(--fs-body-lg)',fontWeight:600,color:'var(--black)',cursor:'pointer'}}>Hablar con el equipo</button>
        </div>
      </Wrap>
      <Wrap style={{padding:'0 40px 48px'}}>
        <div style={{borderTop:'1px solid var(--gray-300)',paddingTop:24,display:'flex',justifyContent:'space-between',fontSize:'var(--fs-body)',color:'var(--gray-600)'}}>
          <span>Takt · un producto de ejemplo del sistema Prisma</span>
          <span>2026</span>
        </div>
      </Wrap>
    </section>
  );
}

function LandingPage(){
  return (
    <div style={{fontFamily:'var(--font-body)',color:'var(--color-text-primary)',background:'var(--white)'}}>
      <LandingNav/><LandingHero/><FeatureRows/><PhotoBand/><PosterClose/>
    </div>
  );
}
Object.assign(window,{LandingPage,LandingNav,LandingHero,FeatureRows,PhotoBand,PosterClose});
