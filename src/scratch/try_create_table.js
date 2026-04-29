
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function tryCreateTable() {
  console.log('Attempting to create table submodulos_respuestas...');
  // Usually this is not allowed via the anon/service key without specialized RPCs
  const { error } = await supabase.rpc('exec_sql', { 
    sql: `
      CREATE TABLE IF NOT EXISTS portal_afv.submodulos_respuestas (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        id_asesor uuid REFERENCES portal_afv.usuarios(id),
        id_submodulo uuid REFERENCES portal_afv.submodulos_finales(id),
        speech text,
        archivos jsonb,
        fecha_entrega timestamp with time zone DEFAULT now(),
        nota numeric,
        feedback text
      );
    `
  });

  if (error) {
    console.log('Failed to create table via RPC exec_sql:', error.message);
  } else {
    console.log('Success! Table created.');
  }
}

tryCreateTable();
