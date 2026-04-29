
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const modules = [
  { fase: "Pre-onboarding", tema: "Análisis de currículum de cada asesor", tiempo: 30 },
  { fase: "Pre-onboarding", tema: "Recopilación de datos básicos (teléfono, correo)", tiempo: 15 },
  { fase: "Pre-onboarding", tema: "Creación de grupos de WhatsApp", tiempo: 15 },
  { fase: "Pre-onboarding", tema: "Envío de correo de bienvenida con cronograma", tiempo: 20 },
  { fase: "Pre-onboarding", tema: "Envío de accesos a AFV, SDS, Catálogo, SKUs", tiempo: 20 },
  { fase: "Pre-onboarding", tema: "Envío de materiales de estudio, guías y manuales", tiempo: 15 },
  { fase: "Pre-onboarding", tema: "Envío de instrucciones de instalación y revisión", tiempo: 15 },
  { fase: "Pre-onboarding", tema: "Envío de glosario de términos", tiempo: 10 },
  { fase: "Pre-onboarding", tema: "Aplicación de evaluación diagnóstica (antes del ingreso)", tiempo: 30 },
  { fase: "Módulo 1: Configuración", tema: "Comprensión del modelo de negocio y pilares", tiempo: 30 },
  { fase: "Módulo 1: Configuración", tema: "Comprensión de expectativas del rol", tiempo: 20 },
  { fase: "Módulo 1: Configuración", tema: "Descarga correcta de las aplicaciones", tiempo: 20 },
  { fase: "Módulo 1: Configuración", tema: "Parametrización de dirección IP del servidor", tiempo: 15 },
  { fase: "Módulo 1: Configuración", tema: "Configuración de usuario y contraseña", tiempo: 15 },
  { fase: "Módulo 1: Configuración", tema: "Inicio de sesión y verificación de operatividad", tiempo: 30 },
  { fase: "Módulo 1: Catálogo/SKU", tema: "Uso de listas de productos genéricas", tiempo: 15 },
  { fase: "Módulo 1: Catálogo/SKU", tema: "Uso de listas de favoritos", tiempo: 10 },
  { fase: "Módulo 1: Catálogo/SKU", tema: "Diferencia entre versión cliente y vendedor", tiempo: 15 },
  { fase: "Módulo 1: Catálogo/SKU", tema: "Uso de filtros por categoría y subcategoría", tiempo: 15 },
  { fase: "Módulo 1: Catálogo/SKU", tema: "Creación de cotizaciones desde el catálogo", tiempo: 20 },
  { fase: "Módulo 1: Catálogo/SKU", tema: "Creación de pedidos desde el catálogo", tiempo: 20 },
  { fase: "Módulo 1: Catálogo/SKU", tema: "Identificación del código SKU único", tiempo: 10 },
  { fase: "Módulo 1: Catálogo/SKU", tema: "Lectura de descripción técnica del SKU", tiempo: 10 },
  { fase: "Módulo 2: Ventas", tema: "Interpretación del límite de crédito del cliente", tiempo: 20 },
  { fase: "Módulo 2: Ventas", tema: "Verificación de crédito antes de montar pedido", tiempo: 20 },
  { fase: "Módulo 2: Ventas", tema: "Uso correcto del Botón B", tiempo: 20 },
  { fase: "Módulo 2: Ventas", tema: "Uso del grupo \"Todas\" en búsqueda y filtros", tiempo: 15 },
  { fase: "Módulo 2: Ventas", tema: "Uso del catálogo digital (imágenes y datos)", tiempo: 20 },
  { fase: "Módulo 2: Ventas", tema: "Gestión de \"Pedidos del Catálogo\" en AFV", tiempo: 20 },
  { fase: "Módulo 2: Ventas", tema: "Búsqueda y selección de clientes en AFV", tiempo: 15 },
  { fase: "Módulo 2: Ventas", tema: "Creación de nuevo pedido en AFV", tiempo: 20 },
  { fase: "Módulo 2: Ventas", tema: "Búsqueda de productos en AFV", tiempo: 15 },
  { fase: "Módulo 2: Ventas", tema: "Manejo de listas de precios", tiempo: 20 },
  { fase: "Módulo 2: Ventas", tema: "Identificación y aplicación de promociones", tiempo: 20 },
  { fase: "Módulo 2: Ventas", tema: "Regla de oro del empaque comercial (múltiplo)", tiempo: 30 },
  { fase: "Módulo 3: Práctica", tema: "Resolución de pedidos reales (Televentas)", tiempo: 60 },
  { fase: "Módulo 3: Práctica", tema: "Gestión de dudas sobre AFV en ambiente real", tiempo: 60 },
  { fase: "Módulo 3: Práctica", tema: "Desempeño autónomo sin asistencia", tiempo: 60 },
  { fase: "Módulo 4: Cobranza", tema: "Lectura e interpretación del estado de cuenta", tiempo: 40 },
  { fase: "Módulo 4: Cobranza", tema: "Análisis de deudores en AFV", tiempo: 40 },
  { fase: "Módulo 4: Cobranza", tema: "Manejo de retenciones de IVA", tiempo: 40 },
  { fase: "Módulo 4: Cobranza", tema: "Generación de recibos de cobro en AFV", tiempo: 40 },
  { fase: "Módulo 4: Cobranza", tema: "Visita previa a analista de crédito y cobro", tiempo: 30 },
  { fase: "Módulo 5: Práctica Cobro", tema: "Resolución de cobros reales (Telecobranza)", tiempo: 60 },
  { fase: "Módulo 5: Práctica Cobro**", tema: "Gestión de dudas sobre cobranza en AFV", tiempo: 60 },
  { fase: "Módulo 5: Práctica Cobro**", tema: "Aplicación autónoma del flujo de cobranza", tiempo: 60 },
  { fase: "Módulo 6: IA", tema: "Concepto de IA aplicada al trabajo del asesor", tiempo: 30 },
  { fase: "Módulo 6: IA", tema: "Uso de herramientas de IA para ventas", tiempo: 30 },
  { fase: "Módulo 6: IA", tema: "Uso de IA para consultas de productos/rutas", tiempo: 30 },
  { fase: "Módulo 7: Evaluación", tema: "Cuestionario del glosario de términos", tiempo: 30 },
  { fase: "Módulo 7: Evaluación", tema: "Cuestionario de SKUs", tiempo: 30 },
  { fase: "Módulo 7: Evaluación", tema: "Ejercicios de role play (simulación ventas)", tiempo: 30 },
  { fase: "Módulo 7: Evaluación", tema: "Reaplicación de evaluación diagnóstica", tiempo: 30 },
  { fase: "Módulo 7: Evaluación", tema: "Comparativo diagnóstico inicial vs final", tiempo: 15 },
  { fase: "Módulo 8: Cierre", tema: "Identificación de oportunidades de mejora", tiempo: 40 },
  { fase: "Módulo 8: Cierre", tema: "Sesión de feedback (retroalimentación)", tiempo: 40 },
  { fase: "Módulo 8: Cierre", tema: "Sesión de feedforward (acciones futuras)", tiempo: 40 },
  { fase: "Módulo 8: Cierre", tema: "Plan de acción individual de cierre de brechas", tiempo: 40 }
];

async function seed() {
  console.log('🚀 Iniciando carga masiva...');

  // 1. Buscar Departamento "Desarrollo"
  const { data: deptos, error: deptoError } = await supabase
    .schema('portal_afv')
    .from('departamentos')
    .select('id')
    .ilike('nombre', '%Desarrollo%')
    .limit(1);

  if (deptoError || !deptos || deptos.length === 0) {
    console.error('❌ No se encontró el departamento "Desarrollo".');
    return;
  }

  const deptoId = deptos[0].id;
  console.log(`✅ Departamento Desarrollo encontrado con ID: ${deptoId}`);

  // 2. Preparar datos para inserción (Usando columnas existentes)
  const payload = modules.map(m => ({
    nombre_tarea: m.tema,
    descripcion: `${m.fase} - (${m.tiempo} min)`,
    id_departamento: deptoId
  }));

  // 3. Insertar datos
  const { error: insertError } = await supabase
    .schema('portal_afv')
    .from('submodulos_finales')
    .insert(payload);

  if (insertError) {
    console.error('❌ Error al insertar los módulos:', insertError.message);
  } else {
    console.log(`🎉 ¡Éxito! Se han cargado ${payload.length} temas en el departamento Desarrollo.`);
  }

  // 4. Actualizar usuario administrador Alvaro Rivera
  console.log('👤 Actualizando perfil de Alvaro Rivera...');
  const { error: userError } = await supabase
    .schema('portal_afv')
    .from('usuarios')
    .upsert({
      usuario: 'arivera@mayoreo.biz',
      correo: 'arivera@mayoreo.biz',
      nombre: 'Alvaro Rivera',
      clave: '11546481',
      telefono: '04244444066',
      rol: 'admin'
    }, { onConflict: 'usuario' });

  if (userError) {
    console.error('❌ Error al actualizar el perfil de Alvaro Rivera:', userError.message);
  } else {
    console.log('✅ Perfil de Alvaro Rivera actualizado.');
  }
}

seed();
