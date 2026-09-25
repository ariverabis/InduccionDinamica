import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA0MjE1NywiZXhwIjoyMDg4NjE4MTU3fQ.arnbwLY-WGHMPdGykLdrCmf_rE7c1V7JSJN7FKdsTzU';

// Cliente para leer los usuarios viejos (tiene permisos)
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Cliente administrador para crear las cuentas en Auth
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function migrarUsuarios() {
  console.log("Iniciando migración...");

  // 1. Obtener todos los usuarios de tu tabla vieja usando el cliente Anon
  const { data: usuarios, error: fetchError } = await supabaseAnon
    .schema('portal_afv')
    .from('usuarios')
    .select('*');

  if (fetchError) {
    console.error("Error obteniendo usuarios viejos:", fetchError);
    return;
  }

  console.log(`Se encontraron ${usuarios.length} usuarios para migrar.`);

  for (const u of usuarios) {
    console.log(`Migrando usuario: ${u.usuario}...`);

    // 2. Crear el usuario usando la API oficial (esto genera todas las identidades correctamente)
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: u.usuario,
      password: 'Mayoreo2026*', // Clave estándar
      email_confirm: true,
      user_metadata: { full_name: u.nombre }
    });

    if (createError) {
      if (createError.message.includes('already exists')) {
        console.log(`  -> El usuario ${u.usuario} ya existe en Supabase Auth, saltando.`);
      } else {
        console.error(`  -> Error creando ${u.usuario}:`, createError.message);
      }
    } else {
      console.log(`  -> Usuario creado en Auth con éxito. ID: ${authData.user.id}`);

      // 3. Crear el perfil en la nueva tabla (si lo necesitas para el dashboard)
      const assignedRole = u.rol === 'admin' ? 'Administrador' : 'Supervisor';

      await supabaseAdmin.from('profiles').upsert({
        id: authData.user.id,
        email: u.usuario,
        full_name: u.nombre,
        role: assignedRole
      });
    }
  }

  console.log("¡Migración completada!");
}

migrarUsuarios();
