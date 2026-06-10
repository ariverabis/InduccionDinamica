import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file manually since dotenv is not necessarily installed
const envPath = path.resolve(process.cwd(), '.env');
const envStr = fs.readFileSync(envPath, 'utf8');
const env = {};
envStr.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase
    .schema('portal_afv')
    .from('notas_por_submodulo')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns:', Object.keys(data[0] || {}));
  }
}

check();
