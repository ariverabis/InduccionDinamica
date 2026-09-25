import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function recalculateSubmodulo() {
  const { data: sm } = await supabase.schema('portal_afv').from('submodulos_finales').select('*').ilike('nombre_tarea', '%parametriz%').single();
  const { data: notas } = await supabase.schema('portal_afv').from('notas_por_submodulo').select('*, usuarios(nombre)').eq('id_submodulo', sm.id);

  console.log(`Encontradas ${notas.length} notas guardadas para este tema.`);

  for (const n of notas) {
    let rawComentario = n.comentario || '';
    if (rawComentario.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawComentario);
        const detalle = parsed.detalle_evaluacion || {};
        
        // Find activity grade
        let notaActividad = null;
        for (const key of Object.keys(detalle)) {
          if (detalle[key]?.nota !== undefined && detalle[key]?.nota !== null) {
            notaActividad = parseFloat(detalle[key].nota);
          }
        }

        if (notaActividad !== null) {
          // Update detalle with peso 100
          for (const key of Object.keys(detalle)) {
            detalle[key].peso = 100;
          }
          parsed.detalle_evaluacion = detalle;

          const nuevaNota = notaActividad; // since weight is 100%
          console.log(`Actualizando ${n.usuarios?.nombre}: Nota anterior=${n.nota} -> Nueva Nota=${nuevaNota}`);

          await supabase.schema('portal_afv').from('notas_por_submodulo').update({
            nota: nuevaNota,
            comentario: JSON.stringify(parsed)
          }).eq('id', n.id);
        }
      } catch (e) {
        console.error(`Error procesando nota id ${n.id}:`, e);
      }
    }
  }

  console.log('¡Actualización de notas finalizada!');
}

recalculateSubmodulo();
