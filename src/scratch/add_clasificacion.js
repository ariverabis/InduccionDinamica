import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Attempting to add column clasificacion to portal_afv.incidencias...');
  // Let's try executing RPC if any database execution functions exist
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE portal_afv.incidencias ADD COLUMN IF NOT EXISTS clasificacion VARCHAR(100);'
  });
  if (error) {
    console.error('Failed via exec_sql RPC:', error.message);
  } else {
    console.log('Success! Column added.');
  }
}

run();
