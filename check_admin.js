import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAdmin() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', '%arivera%');
    
  console.log("Perfil de arivera en Supabase:", data);
  
  const { data: allEvals } = await supabase.from('evaluations').select('*');
  console.log("Todas las evaluaciones:", allEvals);
}

checkAdmin();
