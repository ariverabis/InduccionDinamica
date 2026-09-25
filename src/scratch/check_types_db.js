import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTypes() {
  const { data: notas } = await supabase.schema('portal_afv').from('notas_por_submodulo').select('*').limit(1);
  if (notas && notas.length > 0) {
    console.log('notas_por_submodulo.id_asesor type:', typeof notas[0].id_asesor, notas[0].id_asesor);
    console.log('notas_por_submodulo.id_submodulo type:', typeof notas[0].id_submodulo, notas[0].id_submodulo);
  }

  const { data: sub } = await supabase.schema('portal_afv').from('submodulos_finales').select('*').limit(1);
  if (sub && sub.length > 0) {
    console.log('submodulos_finales.id type:', typeof sub[0].id, sub[0].id);
  }
}

checkTypes();
