import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check the contenido of Evaluaciones submodulo to see if actividad names have quotes
async function checkEvaluacionesActividades() {
  const { data: sm } = await supabase
    .schema('portal_afv')
    .from('submodulos_finales')
    .select('*')
    .ilike('nombre_tarea', '%Evaluaciones%')
    .single();

  console.log('Submodulo "Evaluaciones" contenido:');
  console.log(JSON.stringify(sm?.contenido, null, 2));

  console.log('\n--- Keys as stored in DB:');
  (sm?.contenido || []).forEach((act, i) => {
    console.log(`  [${i}] actividad raw: ${JSON.stringify(act.actividad)}`);
    console.log(`       has leading quote: ${act.actividad.startsWith('"')}`);
  });
}

checkEvaluacionesActividades();
