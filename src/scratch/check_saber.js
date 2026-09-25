import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSaber() {
  const { data: sm } = await supabase.schema('portal_afv').from('submodulos_finales').select('*, departamentos(*)').ilike('nombre_tarea', '%SABER%');
  console.log('Submodulos SABER encontrados:', sm?.length || 0);
  console.log(JSON.stringify(sm, null, 2));

  if (sm && sm.length > 0) {
    for (const s of sm) {
      const { data: notas, count: countNotas } = await supabase
        .schema('portal_afv')
        .from('notas_por_submodulo')
        .select('id, id_asesor, nota, usuarios(nombre)', { count: 'exact' })
        .eq('id_submodulo', s.id);

      console.log('\n--- Submodulo:', s.nombre_tarea);
      console.log('    ID:', s.id);
      console.log('    Notas registradas:', countNotas);
      
      // Contar itinerarios que incluyen este submodulo (via departamento)
      const { count: countItins } = await supabase
        .schema('portal_afv')
        .from('itinerarios_induccion')
        .select('*', { count: 'exact', head: true })
        .eq('id_departamento', s.id_departamento);

      console.log('    Itinerarios en mismo departamento:', countItins);
      
      if (notas && notas.length > 0) {
        console.log('    Asesores con notas en este tema:');
        notas.forEach(n => {
          console.log('      -', n.usuarios?.nombre, '| Nota:', n.nota);
        });
      }
    }
  }
}

checkSaber();
