
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'submodulos_finales', schema_name: 'portal_afv' });
  // If rpc doesn't exist, we'll try a simple select
  const { data: sample, error: sampleError } = await supabase.schema('portal_afv').from('submodulos_finales').select('*').limit(1);
  if (sampleError) console.error('Sample Error:', sampleError);
  else console.log('Sample Row keys:', Object.keys(sample[0] || {}));

  const { data: userSample, error: userSampleError } = await supabase.schema('portal_afv').from('usuarios').select('*').limit(1);
  if (userSampleError) console.error('User Sample Error:', userSampleError);
  else console.log('User Sample Row keys:', Object.keys(userSample[0] || {}));
}

checkSchema();
