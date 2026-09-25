import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkOliver() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', '%outrera%');
    
  console.log("Perfil en Supabase:", data);

  const { data: originalData, error: originalError } = await supabase
    .schema('portal_afv')
    .from('usuarios')
    .select('*')
    .ilike('usuario', '%outrera%');
    
  console.log("Datos originales en portal_afv:", originalData);
}

checkOliver();
