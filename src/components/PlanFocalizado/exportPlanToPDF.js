/**
 * Genera y abre una ventana de impresión/PDF con el resumen del Plan Focalizado.
 * Usa el API nativo del navegador — no requiere librerías adicionales.
 * @param {Object} plan - Datos completos del plan
 * @param {string} nombreAsesor - Nombre del asesor
 * @param {string} empresa - Nombre de la empresa
 */
export function exportPlanToPDF(plan, nombreAsesor, empresa) {
  const {
    nombre_plan = '',
    fecha_plan = '',
    fecha_inicio = '',
    fecha_fin = '',
    estado = 'activo',
    marcasClientes = [],
    pedido = [],
    marketing = [],
    asesoria = [],
    condiciones = {},
  } = plan;

  // ─── Colores por empresa ───
  const EMPRESA_COLORS = {
    'Febeca':            { primary: '#005596', light: '#e8f2fc' },
    'Beval':             { primary: '#6a9d2d', light: '#eef5e0' },
    'Sillaca':           { primary: '#c40062', light: '#fce8f2' },
    'Cofersa':           { primary: '#0078ae', light: '#e3f4fb' },
    'Mundial de Partes': { primary: '#74a431', light: '#eef5e0' },
  };
  const color = EMPRESA_COLORS[empresa] || { primary: '#1e293b', light: '#f1f5f9' };

  // ─── Helpers ───
  const badge = (text, bg = color.primary) =>
    `<span style="background:${bg};color:#fff;border-radius:999px;padding:2px 10px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;">${text}</span>`;

  const sectionTitle = (icon, title) => `
    <div style="display:flex;align-items:center;gap:10px;background:${color.primary};color:#fff;padding:10px 16px;border-radius:10px;margin:20px 0 10px;">
      <span style="font-size:16px;">${icon}</span>
      <span style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;">${title}</span>
    </div>`;

  const table = (headers, rows) => `
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;font-size:10px;">
      <thead>
        <tr style="background:${color.light};">
          ${headers.map(h => `<th style="padding:6px 8px;text-align:left;font-weight:900;color:${color.primary};font-size:9px;text-transform:uppercase;border-bottom:2px solid ${color.primary};">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map((row, i) => `
          <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'};">
            ${row.map(cell => `<td style="padding:5px 8px;border-bottom:1px solid #e2e8f0;color:#334155;">${cell ?? ''}</td>`).join('')}
          </tr>`).join('')}
      </tbody>
    </table>`;

  // ─── Construir HTML ───
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Plan Focalizado — ${nombre_plan}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fff; }
    .page { max-width: 800px; margin: 0 auto; padding: 32px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .card { background: ${color.light}; border-radius: 12px; padding: 14px 16px; }
    .card-label { font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: ${color.primary}; margin-bottom: 4px; }
    .card-value { font-size: 13px; font-weight: 700; color: #1e293b; }
    .asesor-block { background: ${color.primary}; color:#fff; border-radius:14px; padding:20px 24px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; }
    .empty { color:#94a3b8; font-style:italic; font-size:10px; padding:8px 0; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="asesor-block">
    <div>
      <div style="font-size:9px;font-weight:700;opacity:0.7;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">${empresa} — Plan Focalizado de Ventas</div>
      <div style="font-size:20px;font-weight:900;letter-spacing:-0.03em;">${nombre_plan || 'Sin nombre'}</div>
      <div style="font-size:10px;opacity:0.8;margin-top:4px;">Asesor: <strong>${nombreAsesor}</strong></div>
    </div>
    <div style="text-align:right;">
      ${badge(estado, estado === 'activo' ? '#10b981' : '#f59e0b')}
      <div style="font-size:10px;opacity:0.7;margin-top:8px;">Fecha: ${fecha_plan}</div>
      <div style="font-size:10px;opacity:0.7;">Período: ${fecha_inicio} → ${fecha_fin}</div>
    </div>
  </div>

  <!-- SECCIÓN 1: MARCAS Y CLIENTES -->
  ${sectionTitle('🎯', 'Marcas y Clientes')}
  ${marcasClientes.length === 0
    ? '<p class="empty">Sin marcas y clientes registrados.</p>'
    : table(
        ['#', 'Marca', 'Cliente'],
        marcasClientes.map((mc, i) => [i + 1, badge(mc.marca), mc.cliente_nombre])
      )}

  <!-- SECCIÓN 2: PEDIDO PROPUESTO -->
  ${sectionTitle('🛒', 'Pedido Propuesto')}
  ${pedido.length === 0
    ? '<p class="empty">Sin artículos seleccionados.</p>'
    : table(
        ['Marca', 'Cliente', 'Código', 'Artículo', 'Cant.'],
        pedido.map(p => [badge(p.marca || ''), p.cliente_nombre, `<code style="font-size:9px;">${p.codigo_articulo}</code>`, p.nombre_articulo, `<strong>${p.cantidad_propuesta}</strong>`])
      )}

  <!-- SECCIÓN 3: MARKETING POP -->
  ${sectionTitle('📣', 'Plan de Marketing — Material POP')}
  ${marketing.length === 0
    ? '<p class="empty">Sin material POP seleccionado.</p>'
    : table(
        ['Marca', 'Material', 'Cantidad', 'Observación'],
        marketing.map(m => [badge(m.marca || ''), m.tipo_material, `<strong>${m.cantidad}</strong>`, m.observacion || '—'])
      )}

  <!-- SECCIÓN 4: ASESORÍA -->
  ${sectionTitle('🎓', 'Plan de Asesoría')}
  ${asesoria.length === 0
    ? '<p class="empty">Sin plan de asesoría definido.</p>'
    : table(
        ['Tipo de Asesoría', 'Frecuencia', 'Horas/Sesión', 'Descripción'],
        asesoria.map(a => [a.tipo_asesoria, a.frecuencia, `${a.duracion_horas}h`, a.descripcion || '—'])
      )}

  <!-- SECCIÓN 5: CONDICIONES COMERCIALES -->
  ${sectionTitle('🏷️', 'Condiciones Comerciales')}
  <div class="grid2" style="margin-bottom:12px;">
    <div class="card">
      <div class="card-label">Descuento Seleccionado</div>
      <div class="card-value" style="color:${color.primary};font-size:22px;">${condiciones.descuento_seleccionado || 0}%</div>
      ${condiciones.propuesta_descuento ? `<div style="font-size:9px;color:#64748b;margin-top:6px;font-style:italic;">Propuesta: ${condiciones.propuesta_descuento}</div>` : ''}
    </div>
    <div class="card">
      <div class="card-label">Días de Crédito</div>
      <div class="card-value" style="color:#10b981;font-size:22px;">${condiciones.dias_credito_seleccionados || 0} días</div>
      ${condiciones.propuesta_dias_credito ? `<div style="font-size:9px;color:#64748b;margin-top:6px;font-style:italic;">Propuesta: ${condiciones.propuesta_dias_credito}</div>` : ''}
    </div>
  </div>
  ${condiciones.observaciones ? `
    <div style="background:#f8fafc;border-left:4px solid ${color.primary};padding:10px 14px;border-radius:0 8px 8px 0;font-size:10px;color:#475569;">
      <strong>Observaciones:</strong> ${condiciones.observaciones}
    </div>` : ''}

  <!-- FOOTER -->
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:8px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Portal de Formación AFV — ${empresa}</div>
    <div style="font-size:8px;color:#94a3b8;">Generado el ${new Date().toLocaleDateString('es-VE', { day:'2-digit', month:'long', year:'numeric' })}</div>
  </div>

</div>

<script>
  // Auto-print cuando se abre la ventana
  window.onload = () => { window.print(); };
</script>
</body>
</html>`;

  // Abrir en nueva ventana y disparar el diálogo de impresión/guardar PDF
  const ventana = window.open('', '_blank', 'width=900,height=700');
  ventana.document.write(html);
  ventana.document.close();
}
