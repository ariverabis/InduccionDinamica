const { createClient } = require('@supabase/supabase-js');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const SUPABASE_URL = 'https://rreqcrmdyrgevdugzurx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Submódulos de inducción en orden pedagógico
const SUBMODULES_ORDER = [
  { id: '6621ebc1-07c7-40c4-bb5f-34e711e06d53', shortName: '1. Modelo B2R Pilares' },
  { id: 'dfa029ab-3b7c-4a2f-aded-dd6fbd7a58f7', shortName: '2. Configuración y Tecnologías' },
  { id: '15e0eca9-aac3-402b-9c16-405a32ddf77b', shortName: '3. Catálogo Digital y SKU' },
  { id: '52e9f6d3-e55f-4414-af85-f60079c72429', shortName: '4. Módulo de Ventas' },
  { id: '1e6beca6-24d9-4928-b902-f1285b3e5410', shortName: '5. Práctica Televentas' },
  { id: 'b55ad4a5-f53f-4ffc-8654-7d8e78f9fd73', shortName: '6. Módulo de Cobranza' },
  { id: '916236e1-739f-4e2f-b2b8-bbf8ad4fe647', shortName: '7. Práctica Telecobranza' },
  { id: 'bcfc4e41-ce23-4669-99e1-5c24a8b69a0c', shortName: '8. Prácticas en Vivo' },
  { id: 'ece7960c-b1a0-4cc5-92cb-b4ad3aba9589', shortName: '9. Evaluaciones Teóricas' },
  { id: '23d93d0e-96e0-4275-80bc-0d5797b017f1', shortName: '10. Cierre de Brechas' }
];

function cleanString(str) {
  if (!str) return '';
  return String(str).replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseStartDate(adv) {
  if (adv.fecha_ingreso && typeof adv.fecha_ingreso === 'string') {
    const clean = adv.fecha_ingreso.trim();
    const parts = clean.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return { day, month, year, dateStr: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}` };
      }
    }
  }
  if (adv.created_at) {
    const d = new Date(adv.created_at);
    const day = d.getUTCDate();
    const month = d.getUTCMonth() + 1;
    const year = d.getUTCFullYear();
    return { day, month, year, dateStr: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}` };
  }
  return { day: 1, month: 1, year: 2026, dateStr: '01/01/2026' };
}

function formatObservacion(raw) {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const p = JSON.parse(trimmed);
      const parts = [];
      if (p.observacion_global) parts.push(p.observacion_global);
      if (p.observaciones_adicionales) parts.push(p.observaciones_adicionales);
      if (p.imagen_personal?.observaciones) parts.push('Imagen: ' + p.imagen_personal.observaciones);
      if (p.cualidades_generales?.detalle) parts.push('Cualidades: ' + p.cualidades_generales.detalle);
      if (Array.isArray(p.cualidades_generales?.tags) && p.cualidades_generales.tags.length > 0) {
        parts.push('Tags: ' + p.cualidades_generales.tags.join(', '));
      }
      return parts.join(' | ') || raw;
    } catch(e) {
      return raw;
    }
  }
  return cleanString(raw);
}

async function main() {
  console.log('Obteniendo datos de Supabase...');
  const [
    { data: advisorsRaw, error: errAdv },
    { data: notesRaw, error: errNotes },
    { data: evalsRaw, error: errEvals },
    { data: profilesRaw, error: errProfiles }
  ] = await Promise.all([
    supabase.schema('portal_afv').from('usuarios').select('*').eq('rol', 'asesor').order('nombre'),
    supabase.schema('portal_afv').from('notas_por_submodulo').select('*, submodulos_finales(*)').order('fecha', { ascending: true }),
    supabase.from('evaluations').select('*').order('created_at', { ascending: true }),
    supabase.from('profiles').select('*')
  ]);

  if (errAdv) { console.error('Error advisors:', errAdv); return; }
  if (errNotes) { console.error('Error notes:', errNotes); return; }

  const advisors = advisorsRaw || [];
  const notes = notesRaw || [];
  const evals = evalsRaw || [];
  const profiles = profilesRaw || [];

  console.log(`Cargados: ${advisors.length} asesores, ${notes.length} notas de inducción, ${evals.length} evaluaciones mensuales.`);

  // Mapa de perfiles
  const profileMap = new Map(profiles.map(p => [p.id, p]));

  // Función para asociar evaluación con asesor
  function findAdvisorForEval(e) {
    let match = advisors.find(a => a.id === e.advisor_id);
    if (match) return match;

    const p = profileMap.get(e.advisor_id);
    if (p && p.email) {
      match = advisors.find(a => 
        (a.usuario && a.usuario.trim().toLowerCase() === p.email.trim().toLowerCase()) ||
        (a.correo && a.correo.trim().toLowerCase() === p.email.trim().toLowerCase())
      );
      if (match) return match;
    }

    const clean = (str) => cleanString(str).toLowerCase();
    const evalName = clean(e.advisor_name);
    match = advisors.find(a => clean(a.nombre) === evalName || clean(a.nombre).includes(evalName) || evalName.includes(clean(a.nombre)));
    return match;
  }

  // Agrupar evaluaciones por advisorId y month_number
  // Map: `${advisor.id}_${month_number}` -> { Desarrollo, Supervisor, Auditoria, Credito_Cobranza, Admin_Ventas, Autoevaluacion, list: [] }
  const monthlyEvalsMap = new Map();
  for (const e of evals) {
    const adv = findAdvisorForEval(e);
    if (adv) {
      const key = `${adv.id}_${e.month_number}`;
      if (!monthlyEvalsMap.has(key)) {
        monthlyEvalsMap.set(key, {
          Desarrollo: null,
          Supervisor: null,
          Auditoria: null,
          Credito_Cobranza: null,
          Admin_Ventas: null,
          Autoevaluacion: null,
          scores: []
        });
      }
      const record = monthlyEvalsMap.get(key);
      if (e.department && record.hasOwnProperty(e.department)) {
        record[e.department] = e.average_score;
      }
      if (typeof e.average_score === 'number') {
        record.scores.push(e.average_score);
      }
    }
  }

  // Agrupar notas de inducción por advisorId
  // Map: advisorId -> Map(submoduleId -> nota)
  const advisorInductionMap = new Map();
  for (const n of notes) {
    if (!advisorInductionMap.has(n.id_asesor)) {
      advisorInductionMap.set(n.id_asesor, new Map());
    }
    const userSubMap = advisorInductionMap.get(n.id_asesor);
    userSubMap.set(n.id_submodulo, n.nota);
  }

  // Fecha actual de referencia: Octubre 2026
  const targetYear = 2026;
  const targetMonth = 10; // Octubre

  // Crear Workbook con ExcelJS
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema Portal AFV - Inducción y Desempeño';
  workbook.lastModifiedBy = 'Gestión Comercial y Talento Humano';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Estilos reutilizables
  const fontTitle = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  const fontGroupHeader = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  const fontColHeader = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
  const fontData = { name: 'Segoe UI', size: 9 };
  const fontDataBold = { name: 'Segoe UI', size: 9, bold: true };
  const fontEditable = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF92400E' } };

  const borderThin = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  const borderEditable = {
    top: { style: 'thin', color: { argb: 'FFF59E0B' } },
    bottom: { style: 'thin', color: { argb: 'FFF59E0B' } },
    left: { style: 'thin', color: { argb: 'FFF59E0B' } },
    right: { style: 'thin', color: { argb: 'FFF59E0B' } }
  };

  // =========================================================================
  // HOJA 1: SEGUIMIENTO MENSUAL (La hoja principal solicitada)
  // Cada asesor tiene una fila por cada mes transcurrido desde salida a calle
  // =========================================================================
  const wsMensual = workbook.addWorksheet('Seguimiento Mensual en Calle', {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 2 }]
  });

  // Definición de Columnas de Hoja 1
  const colsHoja1 = [
    // Identificación
    { key: 'cedula', label: 'Cédula / ID', group: 'DATOS DE IDENTIFICACIÓN Y ASIGNACIÓN', groupColor: 'FF1E293B', width: 14, align: 'center' },
    { key: 'nombre', label: 'Nombre Completo del Asesor', group: 'DATOS DE IDENTIFICACIÓN Y ASIGNACIÓN', groupColor: 'FF1E293B', width: 32, align: 'left' },
    { key: 'empresa', label: 'Empresa', group: 'DATOS DE IDENTIFICACIÓN Y ASIGNACIÓN', groupColor: 'FF1E293B', width: 14, align: 'center' },
    { key: 'ramo', label: 'Ramo Comercial', group: 'DATOS DE IDENTIFICACIÓN Y ASIGNACIÓN', groupColor: 'FF1E293B', width: 22, align: 'left' },
    { key: 'zona', label: 'Zona', group: 'DATOS DE IDENTIFICACIÓN Y ASIGNACIÓN', groupColor: 'FF1E293B', width: 16, align: 'left' },
    { key: 'estado', label: 'Estado', group: 'DATOS DE IDENTIFICACIÓN Y ASIGNACIÓN', groupColor: 'FF1E293B', width: 16, align: 'left' },
    { key: 'telefono', label: 'Teléfono', group: 'DATOS DE IDENTIFICACIÓN Y ASIGNACIÓN', groupColor: 'FF1E293B', width: 16, align: 'center' },
    { key: 'correo', label: 'Correo Electrónico', group: 'DATOS DE IDENTIFICACIÓN Y ASIGNACIÓN', groupColor: 'FF1E293B', width: 28, align: 'left' },
    { key: 'fecha_ingreso', label: 'Fecha Salida Calle (Ingreso)', group: 'DATOS DE IDENTIFICACIÓN Y ASIGNACIÓN', groupColor: 'FF1E293B', width: 18, align: 'center' },
    
    // Periodo
    { key: 'mes_num', label: 'N° Mes Calle', group: 'PERIODO EN CALLE', groupColor: 'FF0284C7', width: 14, align: 'center' },
    { key: 'mes_label', label: 'Mes Calendario', group: 'PERIODO EN CALLE', groupColor: 'FF0284C7', width: 16, align: 'center' },
    { key: 'anio', label: 'Año', group: 'PERIODO EN CALLE', groupColor: 'FF0284C7', width: 10, align: 'center' },

    // CAMPOS ADICIONALES A LLENAR
    { key: 'avaluo', label: 'Avalúo', group: 'MÉTRICAS A LLENAR (KPIs)', groupColor: 'FFD97706', width: 16, align: 'center', editable: true },
    { key: 'efectividad', label: 'Efectividad', group: 'MÉTRICAS A LLENAR (KPIs)', groupColor: 'FFD97706', width: 16, align: 'center', editable: true },
    { key: 'alcance_presupuesto', label: 'Alcance del Presupuesto', group: 'MÉTRICAS A LLENAR (KPIs)', groupColor: 'FFD97706', width: 24, align: 'center', editable: true },

    // Evaluaciones Mensuales de Desempeño
    { key: 'ev_desarrollo', label: 'Eval. Desarrollo', group: 'EVALUACIÓN MENSUAL DE DESEMPEÑO', groupColor: 'FF059669', width: 16, align: 'right', format: '0.00' },
    { key: 'ev_supervisor', label: 'Eval. Supervisor', group: 'EVALUACIÓN MENSUAL DE DESEMPEÑO', groupColor: 'FF059669', width: 16, align: 'right', format: '0.00' },
    { key: 'ev_auditoria', label: 'Eval. Auditoría', group: 'EVALUACIÓN MENSUAL DE DESEMPEÑO', groupColor: 'FF059669', width: 16, align: 'right', format: '0.00' },
    { key: 'ev_cobranza', label: 'Eval. Crédito y Cobranza', group: 'EVALUACIÓN MENSUAL DE DESEMPEÑO', groupColor: 'FF059669', width: 22, align: 'right', format: '0.00' },
    { key: 'ev_ventas', label: 'Eval. Admin Ventas', group: 'EVALUACIÓN MENSUAL DE DESEMPEÑO', groupColor: 'FF059669', width: 18, align: 'right', format: '0.00' },
    { key: 'ev_autoeval', label: 'Autoevaluación', group: 'EVALUACIÓN MENSUAL DE DESEMPEÑO', groupColor: 'FF059669', width: 16, align: 'right', format: '0.00' },
    { key: 'ev_promedio', label: 'Promedio Desempeño Mes', group: 'EVALUACIÓN MENSUAL DE DESEMPEÑO', groupColor: 'FF059669', width: 22, align: 'right', format: '0.00' },

    // Notas de Inducción (Instrumentos)
    { key: 'sm_1', label: '1. Modelo B2R Pilares', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_2', label: '2. Configuración Tecnologías', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 22, align: 'right', format: '0.00' },
    { key: 'sm_3', label: '3. Catálogo y SKU', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_4', label: '4. Módulo de Ventas', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_5', label: '5. Práctica Televentas', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_6', label: '6. Módulo Cobranza', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_7', label: '7. Práctica Telecobranza', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_8', label: '8. Prácticas en Vivo', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_9', label: '9. Evaluaciones Teóricas', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_10', label: '10. Cierre de Brechas', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 18, align: 'right', format: '0.00' },
    { key: 'ind_promedio', label: 'Promedio Inducción', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 18, align: 'right', format: '0.00' },
    { key: 'ind_estatus', label: 'Estatus Inducción', group: 'NOTAS INSTRUMENTOS DE INDUCCIÓN', groupColor: 'FF4338CA', width: 18, align: 'center' },

    // Observaciones
    { key: 'observaciones_global', label: 'Observación Cualitativa General', group: 'OBSERVACIONES Y FEEDBACK', groupColor: 'FF475569', width: 35, align: 'left' },
    { key: 'observaciones_mes', label: 'Observaciones del Periodo', group: 'OBSERVACIONES Y FEEDBACK', groupColor: 'FF475569', width: 25, align: 'left' }
  ];

  // Configurar anchos de columna
  wsMensual.columns = colsHoja1.map(c => ({ width: c.width }));

  // Fila 1: Grupos de encabezados (Super Headers)
  const rowGroup = wsMensual.getRow(1);
  rowGroup.height = 24;

  // Fila 2: Nombres específicos de columnas
  const rowCol = wsMensual.getRow(2);
  rowCol.height = 32;

  // Llenar Fila 1 y Fila 2 con formato
  colsHoja1.forEach((col, idx) => {
    const colNum = idx + 1;
    const cellGroup = rowGroup.getCell(colNum);
    cellGroup.value = col.group;
    cellGroup.font = fontGroupHeader;
    cellGroup.alignment = { vertical: 'middle', horizontal: 'center' };
    cellGroup.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: col.groupColor } };
    cellGroup.border = borderThin;

    const cellCol = rowCol.getCell(colNum);
    cellCol.value = col.label;
    cellCol.font = fontColHeader;
    cellCol.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    // Color de encabezado de columna
    const headerColor = col.editable ? 'FFB45309' : col.groupColor;
    cellCol.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } };
    cellCol.border = borderThin;
  });

  // Fusionar celdas de grupos en Fila 1
  let startCol = 1;
  while (startCol <= colsHoja1.length) {
    const currentGroup = colsHoja1[startCol - 1].group;
    let endCol = startCol;
    while (endCol < colsHoja1.length && colsHoja1[endCol].group === currentGroup) {
      endCol++;
    }
    if (endCol > startCol) {
      wsMensual.mergeCells(1, startCol, 1, endCol);
    }
    startCol = endCol + 1;
  }

  // Generar filas de datos para Hoja 1
  let rowIndex = 3;
  let totalGeneratedRows = 0;

  for (const adv of advisors) {
    const start = parseStartDate(adv);
    const userSubMap = advisorInductionMap.get(adv.id) || new Map();

    // Calcular notas de inducción
    const subNotes = SUBMODULES_ORDER.map(sm => userSubMap.get(sm.id));
    const validNotes = subNotes.filter(n => typeof n === 'number');
    const indPromedio = validNotes.length > 0
      ? parseFloat((validNotes.reduce((a, b) => a + b, 0) / validNotes.length).toFixed(2))
      : null;

    let estatusInd = 'Sin Iniciar';
    if (validNotes.length === 10) {
      estatusInd = indPromedio >= 7.5 ? 'Completada' : 'Brecha / Requiere Refuerzo';
    } else if (validNotes.length > 0) {
      estatusInd = `En Proceso (${validNotes.length}/10)`;
    }

    // Generar lista de meses desde ingreso hasta Octubre 2026
    const monthsList = [];
    let y = start.year;
    let m = start.month;
    let mIdx = 1;

    while (y < targetYear || (y === targetYear && m <= targetMonth)) {
      monthsList.push({
        num: mIdx,
        year: y,
        month: m,
        label: `${MONTH_NAMES[m - 1]} ${y}`
      });
      mIdx++;
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
    if (monthsList.length === 0) {
      monthsList.push({
        num: 1,
        year: start.year,
        month: start.month,
        label: `${MONTH_NAMES[start.month - 1]} ${start.year}`
      });
    }

    const obsText = formatObservacion(adv.observacion_cualitativa);

    for (const period of monthsList) {
      const evalData = monthlyEvalsMap.get(`${adv.id}_${period.num}`) || {
        Desarrollo: null,
        Supervisor: null,
        Auditoria: null,
        Credito_Cobranza: null,
        Admin_Ventas: null,
        Autoevaluacion: null,
        scores: []
      };

      const evalPromedio = evalData.scores.length > 0
        ? parseFloat((evalData.scores.reduce((a, b) => a + b, 0) / evalData.scores.length).toFixed(2))
        : null;

      const isEven = (rowIndex % 2 === 0);
      const rowBg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

      const rowValues = [
        cleanString(adv.clave),
        cleanString(adv.nombre),
        cleanString(adv.empresa),
        cleanString(adv.ramo) || 'General',
        cleanString(adv.zona) || 'No asignada',
        cleanString(adv.estado) || '-',
        cleanString(adv.telefono) || '-',
        cleanString(adv.correo || adv.usuario),
        start.dateStr,
        period.num,
        period.label,
        period.year,
        null, // Avalúo (editable por usuario)
        null, // Efectividad (editable por usuario)
        null, // Alcance del Presupuesto (editable por usuario)
        evalData.Desarrollo,
        evalData.Supervisor,
        evalData.Auditoria,
        evalData.Credito_Cobranza,
        evalData.Admin_Ventas,
        evalData.Autoevaluacion,
        evalPromedio,
        subNotes[0] ?? null,
        subNotes[1] ?? null,
        subNotes[2] ?? null,
        subNotes[3] ?? null,
        subNotes[4] ?? null,
        subNotes[5] ?? null,
        subNotes[6] ?? null,
        subNotes[7] ?? null,
        subNotes[8] ?? null,
        subNotes[9] ?? null,
        indPromedio,
        estatusInd,
        obsText,
        '' // Observaciones del periodo
      ];

      const r = wsMensual.addRow(rowValues);
      r.height = 20;

      // Formato celda por celda
      colsHoja1.forEach((col, idx) => {
        const cell = r.getCell(idx + 1);
        cell.font = col.editable ? fontEditable : fontData;
        cell.alignment = { vertical: 'middle', horizontal: col.align };

        if (col.editable) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Suave dorado
          cell.border = borderEditable;
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
          cell.border = borderThin;
        }

        if (col.format && typeof cell.value === 'number') {
          cell.numFmt = col.format;
        }
      });

      rowIndex++;
      totalGeneratedRows++;
    }
  }

  // Activar autofiltro en Hoja 1
  wsMensual.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: rowIndex - 1, column: colsHoja1.length }
  };

  console.log(`Hoja 1 generada con ${totalGeneratedRows} filas.`);

  // =========================================================================
  // HOJA 2: RESUMEN CONSOLIDADO POR ASESOR (1 fila por asesor, 46 asesores)
  // =========================================================================
  const wsConsolidado = workbook.addWorksheet('Resumen Consolidado Asesores', {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }]
  });

  const colsHoja2 = [
    { key: 'cedula', label: 'Cédula / ID', width: 14, align: 'center' },
    { key: 'nombre', label: 'Nombre Completo del Asesor', width: 32, align: 'left' },
    { key: 'empresa', label: 'Empresa', width: 14, align: 'center' },
    { key: 'ramo', label: 'Ramo Comercial', width: 22, align: 'left' },
    { key: 'zona', label: 'Zona', width: 16, align: 'left' },
    { key: 'estado', label: 'Estado', width: 16, align: 'left' },
    { key: 'telefono', label: 'Teléfono', width: 16, align: 'center' },
    { key: 'correo', label: 'Correo', width: 28, align: 'left' },
    { key: 'fecha_ingreso', label: 'Fecha Salida Calle', width: 18, align: 'center' },
    { key: 'meses_calle', label: 'Meses en Calle Transcurridos', width: 22, align: 'center' },
    { key: 'ind_promedio', label: 'Promedio General Inducción', width: 22, align: 'right', format: '0.00' },
    { key: 'ind_estatus', label: 'Estatus Inducción', width: 20, align: 'center' },
    { key: 'sm_1', label: '1. Modelo B2R Pilares', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_2', label: '2. Configuración Tecnologías', width: 22, align: 'right', format: '0.00' },
    { key: 'sm_3', label: '3. Catálogo y SKU', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_4', label: '4. Módulo de Ventas', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_5', label: '5. Práctica Televentas', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_6', label: '6. Módulo Cobranza', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_7', label: '7. Práctica Telecobranza', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_8', label: '8. Prácticas en Vivo', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_9', label: '9. Evaluaciones Teóricas', width: 18, align: 'right', format: '0.00' },
    { key: 'sm_10', label: '10. Cierre de Brechas', width: 18, align: 'right', format: '0.00' },
    { key: 'evals_count', label: 'Evaluaciones Mensuales Registradas', width: 24, align: 'center' },
    { key: 'evals_promedio', label: 'Promedio Desempeño Mensual', width: 24, align: 'right', format: '0.00' },
    { key: 'observaciones', label: 'Observación Cualitativa / Feedback General', width: 45, align: 'left' }
  ];

  wsConsolidado.columns = colsHoja2.map(c => ({ width: c.width }));
  const rHeader2 = wsConsolidado.getRow(1);
  rHeader2.height = 30;

  colsHoja2.forEach((col, idx) => {
    const cell = rHeader2.getCell(idx + 1);
    cell.value = col.label;
    cell.font = fontColHeader;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // Azul Corporativo Marino
    cell.border = borderThin;
  });

  let rIdx2 = 2;
  for (const adv of advisors) {
    const start = parseStartDate(adv);
    const userSubMap = advisorInductionMap.get(adv.id) || new Map();
    const subNotes = SUBMODULES_ORDER.map(sm => userSubMap.get(sm.id));
    const validNotes = subNotes.filter(n => typeof n === 'number');
    const indPromedio = validNotes.length > 0
      ? parseFloat((validNotes.reduce((a, b) => a + b, 0) / validNotes.length).toFixed(2))
      : null;

    let estatusInd = 'Sin Iniciar';
    if (validNotes.length === 10) {
      estatusInd = indPromedio >= 7.5 ? 'Completada' : 'Brecha / Requiere Refuerzo';
    } else if (validNotes.length > 0) {
      estatusInd = `En Proceso (${validNotes.length}/10)`;
    }

    // Calcular meses transcurridos
    let y = start.year;
    let m = start.month;
    let monthsCount = 0;
    while (y < targetYear || (y === targetYear && m <= targetMonth)) {
      monthsCount++;
      m++;
      if (m > 12) { m = 1; y++; }
    }
    if (monthsCount === 0) monthsCount = 1;

    // Evaluaciones mensuales acumuladas
    const allEvalScores = [];
    for (let i = 1; i <= 12; i++) {
      const eData = monthlyEvalsMap.get(`${adv.id}_${i}`);
      if (eData && eData.scores.length > 0) {
        allEvalScores.push(...eData.scores);
      }
    }
    const evalPromedioGeneral = allEvalScores.length > 0
      ? parseFloat((allEvalScores.reduce((a, b) => a + b, 0) / allEvalScores.length).toFixed(2))
      : null;

    const rowVal = [
      cleanString(adv.clave),
      cleanString(adv.nombre),
      cleanString(adv.empresa),
      cleanString(adv.ramo) || 'General',
      cleanString(adv.zona) || 'No asignada',
      cleanString(adv.estado) || '-',
      cleanString(adv.telefono) || '-',
      cleanString(adv.correo || adv.usuario),
      start.dateStr,
      monthsCount,
      indPromedio,
      estatusInd,
      subNotes[0] ?? null,
      subNotes[1] ?? null,
      subNotes[2] ?? null,
      subNotes[3] ?? null,
      subNotes[4] ?? null,
      subNotes[5] ?? null,
      subNotes[6] ?? null,
      subNotes[7] ?? null,
      subNotes[8] ?? null,
      subNotes[9] ?? null,
      allEvalScores.length,
      evalPromedioGeneral,
      formatObservacion(adv.observacion_cualitativa)
    ];

    const r = wsConsolidado.addRow(rowVal);
    r.height = 20;
    const isEven = (rIdx2 % 2 === 0);
    const rowBg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

    colsHoja2.forEach((col, idx) => {
      const cell = r.getCell(idx + 1);
      cell.font = fontData;
      cell.alignment = { vertical: 'middle', horizontal: col.align };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = borderThin;
      if (col.format && typeof cell.value === 'number') {
        cell.numFmt = col.format;
      }
    });

    rIdx2++;
  }

  wsConsolidado.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: rIdx2 - 1, column: colsHoja2.length }
  };

  // =========================================================================
  // HOJA 3: DETALLE NOTAS INDUCCIÓN (Todas las 291 notas individuales)
  // =========================================================================
  const wsDetalleNotas = workbook.addWorksheet('Detalle Evaluaciones Inducción', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  });

  const colsHoja3 = [
    { label: 'Cédula Asesor', width: 14, align: 'center' },
    { label: 'Nombre del Asesor', width: 30, align: 'left' },
    { label: 'Empresa', width: 14, align: 'center' },
    { label: 'Submódulo / Instrumento Evaluado', width: 35, align: 'left' },
    { label: 'Calificación (Nota)', width: 18, align: 'right', format: '0.00' },
    { label: 'Intento', width: 10, align: 'center' },
    { label: 'Fecha Evaluación', width: 18, align: 'center' },
    { label: 'Evaluador', width: 22, align: 'left' },
    { label: 'Detalle / Comentarios del Instrumento', width: 50, align: 'left' }
  ];

  wsDetalleNotas.columns = colsHoja3.map(c => ({ width: c.width }));
  const rHeader3 = wsDetalleNotas.getRow(1);
  rHeader3.height = 30;

  colsHoja3.forEach((col, idx) => {
    const cell = rHeader3.getCell(idx + 1);
    cell.value = col.label;
    cell.font = fontColHeader;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' } }; // Índigo
    cell.border = borderThin;
  });

  const advisorById = new Map(advisors.map(a => [a.id, a]));
  let rIdx3 = 2;

  for (const n of notes) {
    const adv = advisorById.get(n.id_asesor);
    const nombre = adv ? cleanString(adv.nombre) : 'Desconocido';
    const cedula = adv ? cleanString(adv.clave) : '-';
    const empresa = adv ? cleanString(adv.empresa) : '-';
    const tarea = n.submodulos_finales?.nombre_tarea || 'Submódulo';

    let fechaStr = '-';
    if (n.fecha) {
      const d = new Date(n.fecha);
      fechaStr = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
    }

    let detalle = '';
    if (n.comentario) {
      if (n.comentario.startsWith('{')) {
        try {
          const p = JSON.parse(n.comentario);
          if (p.texto) detalle += p.texto + ' ';
          if (p.detalle_evaluacion) {
            const items = Object.entries(p.detalle_evaluacion)
              .map(([k, v]) => `${cleanString(k)}: ${v.nota} pts`)
              .join(' | ');
            detalle += `[Detalle: ${items}]`;
          }
        } catch(e) {
          detalle = n.comentario;
        }
      } else {
        detalle = n.comentario;
      }
    }

    const rowVal = [
      cedula,
      nombre,
      empresa,
      tarea,
      n.nota,
      n.intento || 1,
      fechaStr,
      cleanString(n.email_evaluador),
      detalle.trim()
    ];

    const r = wsDetalleNotas.addRow(rowVal);
    r.height = 20;
    const isEven = (rIdx3 % 2 === 0);
    const rowBg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

    colsHoja3.forEach((col, idx) => {
      const cell = r.getCell(idx + 1);
      cell.font = fontData;
      cell.alignment = { vertical: 'middle', horizontal: col.align };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = borderThin;
      if (col.format && typeof cell.value === 'number') {
        cell.numFmt = col.format;
      }
    });

    rIdx3++;
  }

  wsDetalleNotas.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: rIdx3 - 1, column: colsHoja3.length }
  };

  // Guardar archivo Excel
  const outFileName = 'Informe_General_Asesores_y_Notas.xlsx';
  const outPath = path.join(__dirname, outFileName);
  await workbook.xlsx.writeFile(outPath);

  console.log(`\n======================================================`);
  console.log(`¡Éxito! Archivo Excel generado satisfactoriamente:`);
  console.log(`Ruta: ${outPath}`);
  console.log(`Total de filas en Seguimiento Mensual: ${totalGeneratedRows}`);
  console.log(`Total de asesores consolidados: ${advisors.length}`);
  console.log(`Total de notas de inducción detalladas: ${notes.length}`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error('Error fatal generando el reporte:', err);
  process.exit(1);
});
