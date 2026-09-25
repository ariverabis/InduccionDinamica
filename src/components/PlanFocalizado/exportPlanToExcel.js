import * as XLSX from 'xlsx';

/**
 * Exporta el Plan Focalizado de Ventas a un archivo Excel con múltiples hojas.
 * @param {Object} plan - Datos completos del plan
 * @param {string} nombreAsesor - Nombre del asesor para el encabezado
 */
export function exportPlanToExcel(plan, nombreAsesor) {
  const wb = XLSX.utils.book_new();

  // ─────────────────────────────────────────────
  // Estilos de celda reutilizables (SheetJS CE)
  // Nota: SheetJS CE no soporta estilos en xlsx, se usan anchos de columna
  // ─────────────────────────────────────────────

  // ─── HOJA 1: ENCABEZADO DEL PLAN ───
  const headerData = [
    ['PLAN FOCALIZADO DE VENTAS', '', '', ''],
    ['', '', '', ''],
    ['Asesor:', nombreAsesor, '', ''],
    ['Empresa:', plan.empresa, '', ''],
    ['Nombre del Plan:', plan.nombre_plan, '', ''],
    ['Fecha del Plan:', plan.fecha_plan || '', '', ''],
    ['Período:', `${plan.fecha_inicio || ''} al ${plan.fecha_fin || ''}`, '', ''],
    ['Estado:', (plan.estado || '').toUpperCase(), '', ''],
    ['', '', '', ''],
    ['MARCAS Y CLIENTES INCLUIDOS', '', '', ''],
    ['#', 'Marca', 'Cliente', ''],
    ...(plan.marcasClientes || []).map((mc, i) => [i + 1, mc.marca, mc.cliente_nombre, '']),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(headerData);
  ws1['!cols'] = [{ wch: 22 }, { wch: 30 }, { wch: 30 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Encabezado');

  // ─── HOJA 2: PEDIDO PROPUESTO ───
  const pedidoRows = [
    ['PEDIDO PROPUESTO POR MARCA', '', '', '', ''],
    ['', '', '', '', ''],
    ['Marca', 'Cliente', 'Código', 'Artículo', 'Cantidad'],
    ...(plan.pedido || []).map(p => [
      p.marca || '',
      p.cliente_nombre || '',
      p.codigo_articulo || '',
      p.nombre_articulo || '',
      p.cantidad_propuesta || 0,
    ]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(pedidoRows);
  ws2['!cols'] = [{ wch: 20 }, { wch: 28 }, { wch: 14 }, { wch: 50 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Pedido Propuesto');

  // ─── HOJA 3: PLAN DE MARKETING ───
  const marketingRows = [
    ['PLAN DE MARKETING — MATERIAL POP', '', '', ''],
    ['', '', '', ''],
    ['Marca', 'Material', 'Cantidad', 'Observación'],
    ...(plan.marketing || []).map(m => [
      m.marca || '',
      m.tipo_material || '',
      m.cantidad || 0,
      m.observacion || '',
    ]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(marketingRows);
  ws3['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Marketing POP');

  // ─── HOJA 4: PLAN DE ASESORÍA ───
  const asesoriaRows = [
    ['PLAN DE ASESORÍA', '', '', '', ''],
    ['', '', '', '', ''],
    ['Tipo de Asesoría', 'Frecuencia', 'Horas por Sesión', 'Descripción / Actividad'],
    ...(plan.asesoria || []).map(a => [
      a.tipo_asesoria || '',
      a.frecuencia || '',
      a.duracion_horas || 0,
      a.descripcion || '',
    ]),
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(asesoriaRows);
  ws4['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Plan de Asesoría');

  // ─── HOJA 5: CONDICIONES COMERCIALES ───
  const condData = plan.condiciones || {};
  const condRows = [
    ['CONDICIONES COMERCIALES', '', ''],
    ['', '', ''],
    ['Descuento Seleccionado:', `${condData.descuento_seleccionado ?? 0}%`, ''],
    ['Propuesta de Descuento (asesor):', condData.propuesta_descuento || '—', ''],
    ['', '', ''],
    ['Días de Crédito Seleccionados:', `${condData.dias_credito_seleccionados ?? 0} días`, ''],
    ['Propuesta de Días (asesor):', condData.propuesta_dias_credito || '—', ''],
    ['', '', ''],
    ['Observaciones Generales:', condData.observaciones || '—', ''],
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(condRows);
  ws5['!cols'] = [{ wch: 35 }, { wch: 50 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws5, 'Condiciones Comerciales');

  // ─── Descargar ───
  const fileName = `Plan_Focalizado_${(plan.nombre_plan || 'Plan').replace(/\s+/g, '_')}_${plan.fecha_plan || ''}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
