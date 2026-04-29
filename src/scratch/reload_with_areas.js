
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const newModules = [
  { area: "AFV VENTAS", tema: "Interpretación del estatus administrativo del cliente (límite de crédito, Grupo Precio)", duracion: "30 min" },
  { area: "AFV VENTAS", tema: "Creación de nuevo pedido y cotización en AFV", duracion: "40 min" },
  { area: "AFV VENTAS", tema: "Búsqueda de productos en AFV y catálogo digital", duracion: "20 min" },
  { area: "AFV VENTAS", tema: "Manejo de escenarios con listas de precios", duracion: "30 min" },
  
  { area: "COBRANZA", tema: "Interpretación del estado de cuenta y avalúo de deudores", duracion: "40 min" },
  { area: "COBRANZA", tema: "Precarga y cálculo asociado a las retenciones de IVA", duracion: "30 min" },
  { area: "COBRANZA", tema: "Generación de recibos de cobro en AFV", duracion: "30 min" },
  
  { area: "CATÁLOGO DIGITAL", tema: "Uso del catálogo para ubicar artículos", duracion: "20 min" },
  { area: "CATÁLOGO DIGITAL", tema: "Flujo de trabajo pedidos clientes vs vendedor", duracion: "30 min" },
  { area: "CATÁLOGO DIGITAL", tema: "Diferencia entre versión cliente y versión vendedor", duracion: "15 min" },
  { area: "CATÁLOGO DIGITAL", tema: "Manejo de solicitudes y cotizaciones en ambas versiones", duracion: "30 min" },
  
  { area: "SKU APP", tema: "Uso de la app como herramienta de aprendizaje SKU", duracion: "40 min" },
  { area: "SKU APP", tema: "Reconocimiento de la estructura de códigos SKU", duracion: "20 min" },
  { area: "SKU APP", tema: "Identificación rápida de categorías y subcategorías", duracion: "20 min" },
  { area: "SKU APP", tema: "Demostración de aprendizaje de mínimo 20 SKUs", duracion: "60 min" },
  { area: "SKU APP", tema: "Superación de desafíos (mínimo 2 niveles)", duracion: "45 min" },
  { area: "SKU APP", tema: "Revisión de resultados emitidos por SKU App", duracion: "15 min" }
];

// Temas administrativos que deben ser internos
const adminModules = [
  { area: "ADMINISTRATIVO", tema: "Análisis de currículum de cada asesor", duracion: "30 min", interno: true },
  { area: "ADMINISTRATIVO", tema: "Entrevista técnica inicial", duracion: "45 min", interno: true },
  { area: "ADMINISTRATIVO", tema: "Evaluación diagnóstica final", duracion: "30 min", interno: true }
];

async function reload() {
  console.log('🧹 Limpiando temas anteriores...');
  await supabase.schema('portal_afv').from('submodulos_finales').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { data: deptos } = await supabase.schema('portal_afv').from('departamentos').select('id').ilike('nombre', '%Desarrollo%').limit(1);
  const deptoId = deptos?.[0]?.id;

  if (!deptoId) {
    console.error('❌ No se encontró el departamento Desarrollo.');
    return;
  }

  const allModules = [...newModules, ...adminModules];
  const payload = allModules.map(m => ({
    nombre_tarea: m.tema,
    area_tecnica: m.area,
    duracion_horas: m.duracion,
    id_departamento: deptoId,
    es_interno: m.interno || false
  }));

  const { error } = await supabase.schema('portal_afv').from('submodulos_finales').insert(payload);

  if (error) {
    console.error('❌ Error al cargar:', error.message);
  } else {
    console.log(`🎉 ¡Éxito! Se cargaron ${payload.length} temas nuevos organizados por área.`);
  }
}

reload();
