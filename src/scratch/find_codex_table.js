
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  // We can try to guess table names or use a query that might fail but give us info
  const possibleTables = ['codex', 'productos', 'catalogos', 'codex_sku', 'maestro_productos'];
  
  for (const table of possibleTables) {
    const { data, error } = await supabase.schema('portal_afv').from(table).select('*').limit(1);
    if (!error) {
      console.log(`Table ${table} found! Columns:`, Object.keys(data[0] || {}));
    }
  }
}

check();
