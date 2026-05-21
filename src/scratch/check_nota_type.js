import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { 
    sql: `
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_schema = 'portal_afv' AND table_name = 'notas_por_submodulo';
    `
  });

  if (error) {
    console.error('Error running SQL:', error);
  } else {
    console.log('Column details for notas_por_submodulo:', data);
  }
}

run();
