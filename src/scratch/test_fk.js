
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  // Try to insert a row with a submodulo ID in id_escenario to see if it's a FK
  const { data: sub } = await supabase.schema('portal_afv').from('submodulos_finales').select('id').limit(1).single();
  const { data: user } = await supabase.schema('portal_afv').from('usuarios').select('id').eq('rol', 'asesor').limit(1).single();

  if (!sub || !user) {
    console.error('No submodulo or user found for test');
    return;
  }

  console.log('Testing insert into ejercicios_evidencias with submodulo ID:', sub.id);
  const { data, error } = await supabase.schema('portal_afv').from('ejercicios_evidencias').insert({
    id_asesor: user.id,
    id_escenario: sub.id, // Trying to put submodulo ID here
    speech_ventas: 'Test speech'
  });

  if (error) {
    console.log('Insert failed (likely FK constraint):', error.message);
  } else {
    console.log('Insert succeeded! id_escenario is not a strict FK to maestro_escenarios or it accepts other IDs.');
    // Clean up
    await supabase.schema('portal_afv').from('ejercicios_evidencias').delete().eq('speech_ventas', 'Test speech');
  }
}

test();
