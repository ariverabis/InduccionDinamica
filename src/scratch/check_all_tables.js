
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  // Since we can't easily list tables in Supabase via the client without admin rights or specific extensions, 
  // let's try to query common names we've seen or might exist.
  const tables = [
    'departamentos',
    'usuarios',
    'submodulos_finales',
    'itinerarios_induccion',
    'notas_por_submodulo',
    'ejercicios_evidencias',
    'maestro_escenarios',
    'evaluadores_autorizados',
    'import_respuestas_excel'
  ];

  for (const table of tables) {
    const { data, error } = await supabase.schema('portal_afv').from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table}: NOT ACCESSIBLE or NOT FOUND (${error.message})`);
    } else {
      console.log(`Table ${table}: OK. Columns:`, Object.keys(data[0] || {}));
    }
  }
}

check();
