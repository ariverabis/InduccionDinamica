const url = 'https://rreqcrmdyrgevdugzurx.supabase.co/rest/v1/usuarios?select=usuario,clave,nombre,rol';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Accept-Profile': 'portal_afv'
  }
})
.then(res => res.json())
.then(data => {
  console.log('--- USUARIOS Y CONTRASEÑAS EN LA BASE DE DATOS ---');
  if (data && data.length) {
    data.forEach(u => {
      console.log(`Usuario: ${u.usuario} | Clave: ${u.clave} | Nombre: ${u.nombre} | Rol: ${u.rol}`);
    });
  } else {
    console.log("No se encontraron usuarios o hubo un error:", data);
  }
})
.catch(err => console.error(err));
