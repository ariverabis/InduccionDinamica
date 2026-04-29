
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNull() {
  const { data: user } = await supabase.schema('portal_afv').from('usuarios').select('id').limit(1).single();
  const { error } = await supabase.schema('portal_afv').from('ejercicios_evidencias').insert({
    id_asesor: user.id,
    id_escenario: null, // Test if it allows NULL
    speech_ventas: 'Null test'
  });

  if (error) {
    console.log('NULL id_escenario NOT allowed:', error.message);
  } else {
    console.log('NULL id_escenario is allowed!');
    await supabase.schema('portal_afv').from('ejercicios_evidencias').delete().eq('speech_ventas', 'Null test');
  }
}

testNull();
