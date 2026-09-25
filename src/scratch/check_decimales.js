import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDecimales() {
  const { data: notas } = await supabase
    .schema('portal_afv')
    .from('notas_por_submodulo')
    .select('id, nota, id_asesor, usuarios(nombre), submodulos_finales(nombre_tarea)')
    .not('nota', 'is', null);

  const conDecimales = notas.filter(n => {
    const nota = parseFloat(n.nota);
    return nota % 1 !== 0;
  });

  // Agrupar por asesor
  const porAsesor = {};
  conDecimales.forEach(n => {
    const nombre = n.usuarios?.nombre || 'Desconocido';
    if (!porAsesor[nombre]) porAsesor[nombre] = [];
    porAsesor[nombre].push({
      tema: n.submodulos_finales?.nombre_tarea || 'Sin tema',
      nota: n.nota
    });
  });

  console.log('=== ASESORES CON NOTAS DECIMALES ===\n');
  let totalAsesores = 0;
  for (const [nombre, items] of Object.entries(porAsesor).sort()) {
    totalAsesores++;
    console.log(`👤 ${nombre}`);
    items.forEach(i => {
      console.log(`   - ${i.tema}: ${i.nota}`);
    });
    console.log();
  }
  console.log(`Total asesores afectados: ${totalAsesores}`);
  console.log(`Total notas decimales: ${conDecimales.length}`);
}

checkDecimales();
