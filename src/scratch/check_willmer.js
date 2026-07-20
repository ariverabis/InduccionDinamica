import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkWillmer() {
  const { data: user, error } = await supabase.schema('portal_afv').from('usuarios').select('*').ilike('nombre', '%Willmer%').single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return;
  }
  
  console.log('User found:', user.nombre, 'ID:', user.id);
  
  const { data: itins } = await supabase.schema('portal_afv').from('itinerarios_induccion').select('*').eq('id_asesor', user.id);
  const maxIntento = Math.max(...itins.map(i => i.intento || 1));
  const activeItin = itins.filter(i => i.intento === maxIntento);
  console.log('Itinerarios count:', itins.length, 'Max Intento:', maxIntento);
  const deptoIds = activeItin.map(i => i.id_departamento);
  console.log('Active Deptos:', deptoIds);
  
  const { data: submodulosData } = await supabase.schema('portal_afv').from('submodulos').select('*');
  const submodulos = submodulosData || [];
  const subIds = submodulos.filter(sm => deptoIds.includes(sm.id_departamento)).map(sm => sm.id);
  console.log('Submodulos expected:', subIds.length, subIds);
  
  const { data: notasData } = await supabase.schema('portal_afv').from('notas_por_submodulo').select('*').eq('id_asesor', user.id);
  const notas = notasData || [];
  const notasActivas = notas.filter(n => n.intento === maxIntento && subIds.includes(n.id_submodulo));
  console.log('Notas found:', notas.length, 'Notas activas:', notasActivas.length);
  
  const missingSubIds = subIds.filter(id => !notasActivas.some(n => n.id_submodulo === id));
  if (missingSubIds.length > 0) {
      console.log('Missing submodulos:');
      missingSubIds.forEach(id => {
          const sm = submodulos.find(s => s.id === id);
          console.log(`- ${sm.nombre} (ID: ${sm.id}) in Depto: ${sm.id_departamento}`);
      });
  } else {
      console.log('No missing submodulos. Status should be completado.');
  }
}

checkWillmer();
