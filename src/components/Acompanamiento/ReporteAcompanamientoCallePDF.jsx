import React from 'react';

// Función para abrir ventana de impresión aislada y limpia (Garantiza 0 solapamientos y 0 fugas de fondo)
export const abrirVentanaImpresionCalle = (reportData) => {
  if (!reportData) return;

  const {
    nombre = '',
    cedula = '',
    zona_region = '',
    buddy = '',
    casa_comercial = 'Febeca',
    fecha = new Date().toLocaleDateString('es-ES'),
    actividades = [],
    evaluacion_items = {},
    notas_observacion = {},
    fortalezas = '',
    areas_mejora = '',
    recomendacion_final = '',
    firma_buddy = '',
    firma_gerente = ''
  } = reportData;

  // Agrupar actividades por categoría
  const categoriasMap = {};
  actividades.forEach(act => {
    if (!categoriasMap[act.categoria]) {
      categoriasMap[act.categoria] = {
        nombre: act.categoria,
        objetivo: act.objetivo || '',
        items: []
      };
    }
    categoriasMap[act.categoria].items.push(act);
  });

  const categoriasList = Object.values(categoriasMap);

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert("Por favor permite los pop-ups en el navegador para imprimir el reporte.");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Formato de Acompañamiento en Calle - ${nombre}</title>
      <style>
        @page {
          size: letter portrait;
          margin: 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.4;
        }
        .header-title {
          text-align: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .header-title h1 {
          font-size: 18px;
          font-weight: 900;
          margin: 0 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .header-title h2 {
          font-size: 12px;
          font-weight: 700;
          color: #1e3a8a;
          margin: 0;
          text-transform: uppercase;
        }
        .info-grid {
          background-color: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }
        .info-column {
          width: 48%;
        }
        .info-column h3 {
          font-size: 10px;
          font-weight: 900;
          color: #334155;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
          margin: 0 0 8px 0;
          letter-spacing: 0.5px;
        }
        .info-row {
          margin-bottom: 6px;
        }
        .info-label {
          font-weight: 700;
          color: #475569;
        }
        .info-value {
          font-weight: 600;
          color: #0f172a;
          border-bottom: 1px dashed #94a3b8;
          padding-bottom: 1px;
          padding-left: 4px;
        }
        .radio-inline {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-right: 10px;
          font-weight: 600;
        }
        .cat-section {
          break-inside: avoid;
          page-break-inside: avoid;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 14px;
          margin-bottom: 16px;
        }
        .cat-title {
          font-size: 12px;
          font-weight: 900;
          color: #1e3a8a;
          text-transform: uppercase;
          margin: 0 0 2px 0;
        }
        .cat-objetivo {
          font-size: 10px;
          font-style: italic;
          color: #475569;
          margin: 0 0 10px 0;
        }
        .item-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 8px;
        }
        .item-check {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 11px;
          flex-shrink: 0;
        }
        .item-check-true {
          background-color: #059669;
          color: #ffffff;
        }
        .item-check-false {
          background-color: #f1f5f9;
          color: #94a3b8;
          border: 1px solid #cbd5e1;
        }
        .item-text-title {
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .item-text-desc {
          font-size: 10.5px;
          color: #334155;
          margin: 1px 0 0 0;
        }
        .obs-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 12px;
          margin-top: 10px;
          font-size: 10.5px;
        }
        .obs-title {
          font-weight: 700;
          color: #334155;
          display: block;
          margin-bottom: 2px;
        }
        .apreciacion-card {
          background-color: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .apreciacion-title {
          font-size: 12px;
          font-weight: 900;
          color: #1e3a8a;
          text-align: center;
          text-transform: uppercase;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 6px;
          margin: 0 0 14px 0;
        }
        .field-box {
          margin-bottom: 12px;
        }
        .field-label {
          font-weight: 700;
          color: #334155;
          display: block;
          margin-bottom: 4px;
        }
        .field-content {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 12px;
          font-family: monospace;
          white-space: pre-wrap;
          font-size: 10.5px;
          color: #0f172a;
        }
        .rec-box {
          background-color: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 6px;
          padding: 12px;
          margin-top: 10px;
        }
        .rec-title {
          font-size: 10px;
          font-weight: 900;
          color: #78350f;
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }
        .signatures-grid {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #cbd5e1;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .sig-col {
          width: 48%;
          text-align: center;
        }
        .sig-line {
          border-bottom: 1px solid #0f172a;
          font-weight: 700;
          padding-bottom: 4px;
          margin-bottom: 4px;
        }
        .sig-label {
          font-weight: 700;
          color: #334155;
        }
        .footer-note {
          margin-top: 24px;
          background-color: #fff1f2;
          border: 1px solid #fecdd3;
          color: #881337;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
          font-size: 9.5px;
        }
      </style>
    </head>
    <body>
      <div class="header-title">
        <h1>FORMATO DE ACOMPAÑAMIENTO EN CALLE</h1>
        <h2>CHECKLIST DEL BUDDY - VALIDACIÓN DE ASESOR NUEVO</h2>
      </div>

      <div class="info-grid">
        <div class="info-column">
          <h3>DATOS DEL NUEVO INGRESO</h3>
          <div class="info-row"><span class="info-label">Nombre: </span><span class="info-value">${nombre}</span></div>
          <div class="info-row"><span class="info-label">Cédula/RIF: </span><span class="info-value">${cedula}</span></div>
          <div class="info-row"><span class="info-label">Zona/Región: </span><span class="info-value">${zona_region}</span></div>
        </div>
        <div class="info-column">
          <h3>ACOMPAÑAMIENTO</h3>
          <div class="info-row"><span class="info-label">Buddy: </span><span class="info-value">${buddy}</span></div>
          <div class="info-row" style="margin-top: 4px;">
            <span class="info-label">Casa Comercial: </span>
            <span class="radio-inline">${casa_comercial === 'Febeca' ? '■' : '□'} Febeca</span>
            <span class="radio-inline">${casa_comercial === 'Sillaca' ? '■' : '□'} Sillaca</span>
            <span class="radio-inline">${casa_comercial === 'Beval' ? '■' : '□'} Beval</span>
          </div>
          <div class="info-row" style="margin-top: 4px;"><span class="info-label">Fecha: </span><span class="info-value">${fecha}</span></div>
        </div>
      </div>

      ${categoriasList.map(cat => `
        <div class="cat-section">
          <div class="cat-title">${cat.nombre}</div>
          ${cat.objetivo ? `<div class="cat-objetivo">Objetivo: ${cat.objetivo}</div>` : ''}
          ${cat.items.map(item => {
            const cumple = evaluacion_items[item.id]?.cumple;
            return `
              <div class="item-row">
                <div class="item-check ${cumple === true ? 'item-check-true' : 'item-check-false'}">
                  ${cumple === true ? '✓' : '—'}
                </div>
                <div>
                  <div class="item-text-title">■ ${item.titulo}</div>
                  <div class="item-text-desc">${item.descripcion}</div>
                </div>
              </div>
            `;
          }).join('')}
          <div class="obs-box">
            <span class="obs-title">Notas de observación:</span>
            ${notas_observacion[cat.nombre] || 'Sin observaciones registradas.'}
          </div>
        </div>
      `).join('')}

      <div class="apreciacion-card">
        <div class="apreciacion-title">APRECIACIÓN FINAL DEL BUDDY</div>
        <div class="field-box">
          <span class="field-label">Fortalezas detectadas:</span>
          <div class="field-content">${fortalezas || 'N/A'}</div>
        </div>
        <div class="field-box">
          <span class="field-label">Áreas de mejora inmediata:</span>
          <div class="field-content">${areas_mejora || 'N/A'}</div>
        </div>
        <div class="rec-box">
          <span class="rec-title">RECOMENDACIÓN FINAL DEL BUDDY</span>
          <div>${recomendacion_final === 'AUTONOMIA' ? '■' : '□'} <strong>SÍ</strong> - El asesor está listo para autonomía</div>
          <div>${recomendacion_final === 'MAS_ACOMPANAMIENTO' ? '■' : '□'} <strong>REQUIERE MÁS ACOMPAÑAMIENTO</strong> - Continuar monitoreo 3 días</div>
          <div>${recomendacion_final === 'INTERVENCION_GERENCIAL' ? '■' : '□'} <strong>REQUIERE INTERVENCIÓN GERENCIAL</strong> - Contactar facilitador</div>
        </div>
      </div>

      <div class="signatures-grid">
        <div class="sig-col">
          <div class="sig-line">${firma_buddy || buddy || '___________________________'}</div>
          <div class="sig-label">Firma del Buddy</div>
          <div style="font-size: 10px; color: #64748b;">Fecha: ${fecha}</div>
        </div>
        <div class="sig-col">
          <div class="sig-line">${firma_gerente || '___________________________'}</div>
          <div class="sig-label">Firma del Facilitador/Gerente</div>
          <div style="font-size: 10px; color: #64748b;">Fecha: ${fecha}</div>
        </div>
      </div>

      <div class="footer-note">
        <strong>NOTA IMPORTANTE PARA LA GERENCIA:</strong> Este checklist debe ser entregado al facilitador/gerente al finalizar el acompañamiento para ajustar los KPIs de la Rampa de Integración. Archívese en el expediente del nuevo ingreso.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export default function ReporteAcompanamientoCallePDF({ reportData, onClose, onPrint }) {
  if (!reportData) return null;

  const handleImprimir = () => {
    if (onPrint) {
      onPrint();
    } else {
      abrirVentanaImpresionCalle(reportData);
    }
  };

  const {
    nombre = '',
    cedula = '',
    zona_region = '',
    buddy = '',
    casa_comercial = 'Febeca',
    fecha = new Date().toLocaleDateString('es-ES'),
    actividades = [],
    evaluacion_items = {},
    notas_observacion = {},
    fortalezas = '',
    areas_mejora = '',
    recomendacion_final = '',
    firma_buddy = '',
    firma_gerente = ''
  } = reportData;

  const categoriasMap = {};
  actividades.forEach(act => {
    if (!categoriasMap[act.categoria]) {
      categoriasMap[act.categoria] = {
        nombre: act.categoria,
        objetivo: act.objetivo || '',
        items: []
      };
    }
    categoriasMap[act.categoria].items.push(act);
  });

  const categoriasList = Object.values(categoriasMap);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[300] overflow-y-auto p-4 md:p-8">
      {/* Barra de control superior para pantalla */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-xl">📄</span>
          <div>
            <h3 className="font-bold text-sm">Vista Previa de Reporte de Acompañamiento</h3>
            <p className="text-xs text-slate-400">Diseñado para impresión o guardado como PDF sin solapamiento</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleImprimir}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            🖨️ Imprimir / Guardar PDF Limpio
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* DOCUMENTO REPORTE (Vista Previa en Pantalla) */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 md:p-12 shadow-2xl rounded-sm font-sans">
        
        {/* Encabezado Principal */}
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase mb-1">
            FORMATO DE ACOMPAÑAMIENTO EN CALLE
          </h1>
          <h2 className="text-sm font-bold text-blue-900 tracking-wide uppercase">
            CHECKLIST DEL BUDDY - VALIDACIÓN DE ASESOR NUEVO
          </h2>
        </div>

        {/* Tabla Datos del Nuevo Ingreso y Acompañamiento */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <h3 className="font-black text-slate-700 uppercase tracking-wider mb-3 border-b pb-1 text-[11px]">
              DATOS DEL NUEVO INGRESO
            </h3>
            <div>
              <span className="font-bold text-slate-600">Nombre: </span>
              <span className="font-semibold text-slate-900 border-b border-dashed border-slate-400 pb-0.5 px-2">{nombre}</span>
            </div>
            <div>
              <span className="font-bold text-slate-600">Cédula/RIF: </span>
              <span className="font-semibold text-slate-900 border-b border-dashed border-slate-400 pb-0.5 px-2">{cedula}</span>
            </div>
            <div>
              <span className="font-bold text-slate-600">Zona/Región: </span>
              <span className="font-semibold text-slate-900 border-b border-dashed border-slate-400 pb-0.5 px-2">{zona_region}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-black text-slate-700 uppercase tracking-wider mb-3 border-b pb-1 text-[11px]">
              ACOMPAÑAMIENTO
            </h3>
            <div>
              <span className="font-bold text-slate-600">Buddy: </span>
              <span className="font-semibold text-slate-900 border-b border-dashed border-slate-400 pb-0.5 px-2">{buddy}</span>
            </div>
            <div className="flex items-center gap-4 py-1">
              <span className="font-bold text-slate-600">Casa Comercial:</span>
              <label className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                <input type="radio" checked={casa_comercial === 'Febeca'} readOnly className="rounded-sm" /> Febeca
              </label>
              <label className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                <input type="radio" checked={casa_comercial === 'Sillaca'} readOnly className="rounded-sm" /> Sillaca
              </label>
              <label className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                <input type="radio" checked={casa_comercial === 'Beval'} readOnly className="rounded-sm" /> Beval
              </label>
            </div>
            <div>
              <span className="font-bold text-slate-600">Fecha: </span>
              <span className="font-semibold text-slate-900 border-b border-dashed border-slate-400 pb-0.5 px-2">{fecha}</span>
            </div>
          </div>
        </div>

        {/* Secciones de Evaluación */}
        <div className="space-y-6 mb-8">
          {categoriasList.map((cat, idx) => (
            <div key={idx} className="border-b border-slate-200 pb-6">
              <h3 className="text-sm font-black text-blue-950 uppercase mb-1">
                {cat.nombre}
              </h3>
              {cat.objetivo && (
                <p className="text-[11px] italic text-slate-600 font-medium mb-3">
                  Objetivo: {cat.objetivo}
                </p>
              )}

              <div className="space-y-3 pl-2">
                {cat.items.map((item) => {
                  const estadoItem = evaluacion_items[item.id] || {};
                  const cumple = estadoItem.cumple; // true, false, or null

                  return (
                    <div key={item.id} className="text-xs flex items-start gap-3">
                      <div className="mt-0.5 flex gap-1.5 font-mono">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${cumple === true ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 border'}`}>
                          {cumple === true ? '■' : '□'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">
                          ■ {item.titulo}
                        </p>
                        <p className="text-[11px] text-slate-700 font-normal">
                          {item.descripcion}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notas de observación por categoría */}
              <div className="mt-4 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Notas de observación:</span>
                <p className="text-slate-800 whitespace-pre-wrap font-mono text-[11px]">
                  {notas_observacion[cat.nombre] || notas_observacion[idx] || 'Sin observaciones registradas.'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Apreciación Final del Buddy */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-6 mb-8 space-y-5 text-xs">
          <h3 className="text-sm font-black text-center text-blue-950 uppercase border-b pb-2">
            APRECIACIÓN FINAL DEL BUDDY
          </h3>

          <div>
            <span className="font-bold text-slate-800 block mb-1">Fortalezas detectadas:</span>
            <p className="p-3 bg-white border rounded text-slate-900 whitespace-pre-wrap font-mono text-[11px]">
              {fortalezas || 'N/A'}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-800 block mb-1">Áreas de mejora inmediata:</span>
            <p className="p-3 bg-white border rounded text-slate-900 whitespace-pre-wrap font-mono text-[11px]">
              {areas_mejora || 'N/A'}
            </p>
          </div>

          {/* Recomendación Final */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-2">
            <span className="font-black text-amber-950 uppercase block text-[11px] mb-1">
              RECOMENDACIÓN FINAL DEL BUDDY
            </span>
            <div className="space-y-1.5 font-semibold text-slate-900">
              <label className="flex items-center gap-2">
                <input type="radio" checked={recomendacion_final === 'AUTONOMIA'} readOnly />
                ■ SÍ - El asesor está listo para autonomía
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={recomendacion_final === 'MAS_ACOMPANAMIENTO'} readOnly />
                ■ REQUIERE MÁS ACOMPAÑAMIENTO - Continuar monitoreo 3 días
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={recomendacion_final === 'INTERVENCION_GERENCIAL'} readOnly />
                ■ REQUIERE INTERVENCIÓN GERENCIAL - Contactar facilitador
              </label>
            </div>
          </div>
        </div>

        {/* Firmas */}
        <div className="grid grid-cols-2 gap-12 text-center text-xs pt-8 border-t border-slate-300">
          <div>
            <div className="border-b border-slate-800 mb-2 pb-1 font-bold text-slate-900">
              {firma_buddy || buddy || '___________________________'}
            </div>
            <p className="font-bold text-slate-700">Firma del Buddy</p>
            <p className="text-[10px] text-slate-500 mt-1">Fecha: {fecha}</p>
          </div>
          <div>
            <div className="border-b border-slate-800 mb-2 pb-1 font-bold text-slate-900">
              {firma_gerente || '___________________________'}
            </div>
            <p className="font-bold text-slate-700">Firma del Facilitador/Gerente</p>
            <p className="text-[10px] text-slate-500 mt-1">Fecha: {fecha}</p>
          </div>
        </div>

        {/* Nota a pie de página */}
        <div className="mt-8 bg-rose-50 border border-rose-200 text-rose-900 p-3 text-[10px] rounded text-center font-medium">
          <strong>NOTA IMPORTANTE PARA LA GERENCIA:</strong> Este checklist debe ser entregado al facilitador/gerente al finalizar el acompañamiento para ajustar los KPIs de la Rampa de Integración. Archívese en el expediente del nuevo ingreso.
        </div>

      </div>
    </div>
  );
}

