
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTypes() {
  const { data: sm } = await supabase.schema('portal_afv').from('submodulos_finales').select('*').limit(1);
  console.log('submodulos_finales sample:', sm[0]);
  
  const { data: nota } = await supabase.schema('portal_afv').from('notas_por_submodulo').select('*').limit(1);
  console.log('notas_por_submodulo sample:', nota[0]);
}

checkTypes();
