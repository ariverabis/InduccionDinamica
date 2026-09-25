const { Button, Input, Checkbox } = window.PrismaDesignSystem_5fbffe;

function Login({ onEnter }) {
  const [rec, setRec] = React.useState(true);
  return (
    <div style={{minHeight:'100vh',display:'grid',gridTemplateColumns:'1fr 1fr',fontFamily:'var(--font-body)'}}>
      <div style={{display:'grid',placeItems:'center',padding:48}}>
        <div style={{width:340,display:'flex',flexDirection:'column',gap:20}}>
          <img src="../../assets/logo/logotipo.png" alt="Prisma" style={{width:150,objectFit:'contain',alignSelf:'center'}} />
          <div style={{textAlign:'center'}}><div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-h1)',fontWeight:700}}>Entrar al portal</div>
          <div style={{fontSize:'var(--fs-body)',color:'var(--color-text-secondary)',marginTop:6,lineHeight:'var(--lh-body)'}}>Usa el correo con el que registraste tu comercio.</div></div>
          <Input label="Correo" placeholder="compras@eltornillo.com" />
          <Input label="Contraseña" placeholder="••••••••" />
          <Checkbox label="Mantener la sesión abierta" checked={rec} onChange={setRec} />
          <Button onClick={onEnter}>Entrar</Button>
          <div style={{fontSize:'var(--fs-caption)',color:'var(--color-text-muted)'}}>¿Olvidaste la contraseña? <a href="#" style={{color:'var(--black)'}}>Recuperarla</a></div>
        </div>
      </div>
      <div style={{background:'var(--color-surface-sunken)',borderLeft:'1px solid var(--color-border)',position:'relative',overflow:'hidden',display:'grid',placeItems:'center',padding:48}}>
        <img src="../../assets/logo/isotipo-opacidad-30.png" alt="" style={{position:'absolute',right:-80,bottom:-120,width:460}} />
        <div style={{position:'relative',color:'var(--color-text-primary)',maxWidth:380}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-display-md)',fontWeight:900,lineHeight:'var(--lh-tight)'}}>Un pedido, todos tus proveedores.</div>
          <div style={{fontSize:'var(--fs-body-lg)',marginTop:16,lineHeight:'var(--lh-body)',color:'var(--color-text-secondary)'}}>5.789 comercios ya arman su surtido en Prisma sin llamar a nadie.</div>
        </div>
      </div>
    </div>
  );
}
window.Login = Login;
