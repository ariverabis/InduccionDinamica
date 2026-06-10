import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';

const parseObservacionCualitativa = (raw) => {
  const defaultState = {
    observacion_global: '',
    imagen_personal: { afeitado: '', vestimenta: '', cabello: '', lenguaje: '', actitud: '', observaciones: '' },
    cualidades_generales: { tags: [], detalle: '' }
  };

  if (!raw) return defaultState;

  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        observacion_global: parsed.observacion_global || parsed.observaciones_adicionales || '',
        imagen_personal: { ...defaultState.imagen_personal, ...parsed.imagen_personal },
        cualidades_generales: {
          tags: Array.isArray(parsed.cualidades_generales?.tags) ? parsed.cualidades_generales.tags : [],
          detalle: parsed.cualidades_generales?.detalle || (typeof parsed.cualidades_generales === 'string' ? parsed.cualidades_generales : '')
        }
      };
    } catch (e) {
      console.error("Error parsing JSON in ReporteNotas:", e);
    }
  }

  return {
    ...defaultState,
    observacion_global: raw,
    imagen_personal: { ...defaultState.imagen_personal, observaciones: raw }
  };
};

const ReporteNotas = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filterEmpresa, setFilterEmpresa] = useState('Todas');
  const [filterNotaMin, setFilterNotaMin] = useState(0);
  const [filterAsesor, setFilterAsesor] = useState('');
  const [sortBy, setSortBy] = useState('fecha_desc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Traemos todas las notas reales de submodulos con datos del asesor y del tema
      const { data: results, error: err } = await supabase
        .schema('portal_afv')
        .from('notas_por_submodulo')
        .select(`
          id,
          nota,
          comentario,
          intento,
          fecha,
          email_evaluador,
          no_presento,
          usuarios!id_asesor(nombre, empresa, fecha_ingreso, created_at, observacion_cualitativa),
          submodulos_finales!id_submodulo(nombre_tarea, area_tecnica, departamentos(nombre))
        `)
        .order('fecha', { ascending: false });

      if (err) throw err;

      const mapped = (results || []).map(r => {
        let ts = 0;
        let dateStr = '';
        if (r.usuarios?.fecha_ingreso) {
          const parts = r.usuarios.fecha_ingreso.trim().split('/');
          if (parts.length === 3) {
            ts = new Date(parts[2] + '-' + parts[1] + '-' + parts[0] + 'T00:00:00').getTime();
            dateStr = new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
          }
        }
        if (!ts && r.usuarios?.created_at) {
          ts = new Date(r.usuarios.created_at).getTime();
          dateStr = new Date(r.usuarios.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        }

        let no_presento = r.no_presento;
        // Fallback for older records where no_presento might only exist inside the JSON comentario
        if (!no_presento && r.comentario && r.comentario.startsWith('{')) {
          try {
            const p = JSON.parse(r.comentario);
            if (p.no_presento === true) {
              no_presento = true;
            }
          } catch(e) {}
        }

        return {
          id: r.id,
          nota: r.nota,
          comentario: r.comentario,
          intento: r.intento,
          fecha: r.fecha,
          no_presento: no_presento,
          fecha_ts: ts,
          fecha_str: dateStr,
          email_evaluador: r.email_evaluador,
          nombre_asesor: r.usuarios?.nombre || 'Desconocido',
          empresa: r.usuarios?.empresa || '-',
          nombre_tema: r.submodulos_finales?.nombre_tarea || 'Sin nombre',
          area_tecnica: r.submodulos_finales?.area_tecnica || null,
          departamento: r.submodulos_finales?.departamentos?.nombre || '-',
          observacion_cualitativa: r.usuarios?.observacion_cualitativa || '',
        };
      });

      setData(mapped);
      setFilteredData(mapped);
    } catch (err) {
      console.error('Error fetching reporte notas:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filterEmpresa, filterNotaMin, filterAsesor, sortBy, data]);

  const applyFilters = () => {
    let result = [...data];

    if (filterEmpresa !== 'Todas') {
      result = result.filter(item => item.empresa === filterEmpresa);
    }

    if (filterNotaMin > 0) {
      result = result.filter(item => (item.nota || 0) >= filterNotaMin);
    }

    if (filterAsesor.trim() !== '') {
      result = result.filter(item => (item.nombre_asesor || '').toLowerCase().includes(filterAsesor.toLowerCase()));
    }

    if (sortBy === 'fecha_desc') {
      result.sort((a, b) => (b.fecha_ts || 0) - (a.fecha_ts || 0));
    } else if (sortBy === 'nota_desc') {
      result.sort((a, b) => (b.nota || 0) - (a.nota || 0));
    } else if (sortBy === 'nombre_asc') {
      result.sort((a, b) => (a.nombre_asesor || '').localeCompare(b.nombre_asesor || ''));
    }

    setFilteredData(result);
  };

  const notasCalculables = filteredData.filter(i => !i.no_presento);
  const promedioGeneral = notasCalculables.length > 0
    ? (notasCalculables.reduce((acc, i) => acc + (i.nota || 0), 0) / notasCalculables.length).toFixed(1)
    : 'N/A';

  const getAreaBadge = (area) => {
    if (!area) return null;
    const styles =
      area.includes('VENTAS') ? 'bg-blue-100 text-blue-700' :
      area.includes('COBRANZA') ? 'bg-green-100 text-green-700' :
      area.includes('CATÁLOGO') ? 'bg-purple-100 text-purple-700' :
      area.includes('SKU') ? 'bg-orange-100 text-orange-700' :
      'bg-slate-100 text-slate-600';
    return <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider ${styles}`}>{area}</span>;
  };

  const getNotaBadge = (nota, noPresento) => {
    if (noPresento) {
      return (
        <span className="px-6 py-2 rounded-full text-sm font-black bg-amber-100 text-amber-800">
          NP
        </span>
      );
    }
    const n = nota || 0;
    const styles =
      n >= 8 ? 'bg-green-100 text-green-700' :
      n >= 6 ? 'bg-blue-100 text-blue-700' :
      n >= 4 ? 'bg-yellow-100 text-yellow-700' :
      'bg-orange-100 text-orange-700';
    return (
      <span className={`px-6 py-2 rounded-full text-sm font-black ${styles}`}>
        {n}
      </span>
    );
  };

  if (isLoading) return (
    <div className="p-20 text-center animate-pulse text-slate-400 font-bold text-[10px]">
      Generando Reporte Ejecutivo...
    </div>
  );

  if (error) return (
    <div className="p-20 text-center text-red-400 font-bold text-sm">
      Error al cargar datos: {error}
      <br />
      <button onClick={fetchData} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">
        Reintentar
      </button>
    </div>
  );

  const uniqueAsesores = Array.from(new Set(filteredData.map(i => i.nombre_asesor)));
  const isSingleAsesor = uniqueAsesores.length === 1;
  const singleAsesorData = isSingleAsesor ? filteredData[0] : null;
  const qualData = singleAsesorData ? parseObservacionCualitativa(singleAsesorData.observacion_cualitativa) : null;

  const handleExportExcel = () => {
    const exportData = filteredData.map(item => {
      let detalle_actividades = '';
      let observacion = '';

      if (item.comentario) {
        if (item.comentario.startsWith('{')) {
          try {
            const p = JSON.parse(item.comentario);
            // Detalle por actividad: "Actividad1: 8/10, Actividad2: NP"
            if (p.detalle_evaluacion) {
              detalle_actividades = Object.entries(p.detalle_evaluacion)
                .map(([actividad, v]) => `${actividad}: ${v.np ? 'NP' : (v.nota ?? 0) + '/10'}`)
                .join(' | ');
            }
            // Texto de observación libre
            if (p.texto) {
              observacion = p.texto;
            }
          } catch(e) {
            observacion = item.comentario;
          }
        } else {
          // Texto plano (registros muy viejos)
          observacion = item.comentario;
        }
      }

      return {
        'Asesor de Ventas': item.nombre_asesor,
        'Empresa': item.empresa,
        'Módulo / Tema': item.nombre_tema,
        'Área Técnica': item.area_tecnica || '-',
        'Departamento': item.departamento,
        'Intento': item.intento || 1,
        'Nota Final': item.no_presento ? 'No presentó' : (item.nota ?? '-'),
        'No Presentó': item.no_presento ? 'Sí' : 'No',
        'Detalle por Actividad': detalle_actividades || '-',
        'Observación del Evaluador': observacion || '-',
        'Evaluador': item.email_evaluador || '-',
        'Fecha Registro': item.fecha_str || '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Ajustar ancho de columnas automáticamente
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...exportData.map(r => String(r[key] || '').length), 10)
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte de Notas");
    
    const fileName = `Reporte_Notas_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans print:p-0 print:bg-white">
      <div className="max-w-6xl mx-auto">

        {/* HEADER IMPRESIÓN */}
        <div className="hidden print:block mb-10 border-b-2 border-slate-900 pb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Reporte de Calificaciones Academia AFV</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Documento de Control de Gestión — Confidencial</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">Generado el:</p>
              <p className="text-sm font-bold text-slate-900">
                {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* HEADER PANTALLA */}
        <header className="flex justify-between items-center mb-8 print:hidden">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Centro de Reportes Ejecutivos</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Notas reales de evaluación por módulo de inducción
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleExportExcel} className="px-8 py-4 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg">
              📊 Exportar Excel
            </button>
            <button onClick={() => window.print()} className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg">
              🖨️ Imprimir / PDF
            </button>
            <button onClick={onBack} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
              ← Volver
            </button>
          </div>
        </header>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-3 gap-6 mb-8 print:hidden">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Evaluaciones</p>
            <p className="text-4xl font-black text-slate-900">{filteredData.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Promedio General</p>
            <p className={`text-4xl font-black ${parseFloat(promedioGeneral) >= 6 ? 'text-green-600' : 'text-orange-500'}`}>{promedioGeneral}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Asesores Evaluados</p>
            <p className="text-4xl font-black text-indigo-600">
              {new Set(filteredData.map(i => i.nombre_asesor)).size}
            </p>
          </div>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8 grid grid-cols-1 md:grid-cols-5 gap-6 print:hidden">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Empresa / Marca</label>
            <select
              value={filterEmpresa}
              onChange={(e) => setFilterEmpresa(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            >
              <option>Todas</option>
              <option>Febeca</option>
              <option>Beval</option>
              <option>Sillaca</option>
              <option>Cofersa</option>
              <option>Mundial de Partes</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Nota Mínima</label>
            <input
              type="number"
              value={filterNotaMin}
              onChange={(e) => setFilterNotaMin(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Asesor de Ventas</label>
            <input
              type="text"
              value={filterAsesor}
              onChange={(e) => setFilterAsesor(e.target.value)}
              placeholder="Escribe el nombre del asesor..."
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            >
              <option value="fecha_desc">Más recientes primero</option>
              <option value="nota_desc">Mejores notas primero</option>
              <option value="nombre_asc">Nombre (A-Z)</option>
            </select>
          </div>
        </div>

        {isSingleAsesor && qualData && (
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 print:mb-6 print:border-slate-300">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 border-b pb-3 mb-4 flex items-center gap-2">
                💼 Habilidades y Experiencia del Asesor
              </h3>
              {qualData.cualidades_generales.tags && qualData.cualidades_generales.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {qualData.cualidades_generales.tags.map(tag => {
                    let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
                    const tagLower = tag.toLowerCase();
                    if (tagLower.includes('ventas') || tagLower.includes('negociación') || tagLower.includes('televentas')) {
                      bgClass = 'bg-blue-50 text-blue-700 border-blue-100';
                    } else if (tagLower.includes('mercadeo') || tagLower.includes('marketing') || tagLower.includes('promoción')) {
                      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    } else if (tagLower.includes('supervisión') || tagLower.includes('liderazgo') || tagLower.includes('coaching') || tagLower.includes('gestión')) {
                      bgClass = 'bg-purple-50 text-purple-700 border-purple-100';
                    } else {
                      bgClass = 'bg-amber-50 text-amber-700 border-amber-100';
                    }
                    return (
                      <span key={tag} className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-wider ${bgClass}`}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic mb-2">Sin competencias destacadas registradas.</p>
              )}
              {qualData.cualidades_generales.detail && (
                <p className="text-[11px] text-slate-600 leading-relaxed italic border-t pt-3">
                  "{qualData.cualidades_generales.detail}"
                </p>
              )}
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 border-b pb-3 mb-4 flex items-center gap-2">
                📝 Observación Cualitativa Global
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
                {qualData.observacion_global || 'Sin observaciones globales registradas.'}
              </p>
            </div>
          </div>
        )}

        {/* TABLA */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Asesor de Ventas</th>
                <th className="px-8 py-6">Empresa</th>
                <th className="px-8 py-6">Módulo / Tema</th>
                <th className="px-8 py-6">Dpto.</th>
                <th className="px-8 py-6 text-center">Nota</th>
                <th className="px-8 py-6 print:hidden">Comentario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-24 text-center text-slate-300 font-bold uppercase text-xs tracking-widest">
                    No se encontraron evaluaciones con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{item.nombre_asesor}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                          Intento #{item.intento || 1} {item.fecha_str ? `• Registro: ${item.fecha_str}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{item.empresa}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-slate-700">{item.nombre_tema}</span>
                        {getAreaBadge(item.area_tecnica)}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold text-slate-500">{item.departamento}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {getNotaBadge(item.nota, item.no_presento)}
                    </td>
                    <td className="px-8 py-5 print:hidden">
                      <span className="text-[10px] text-slate-400 italic line-clamp-2 max-w-[180px]" title={(() => {
                           if (!item.comentario) return '';
                           if (item.comentario.startsWith('{')) {
                             try {
                               const p = JSON.parse(item.comentario);
                               let txt = '';
                               if (p.detalle_evaluacion) {
                                 txt = Object.entries(p.detalle_evaluacion).map(([k,v]) => `${k}: ${v.np ? 'NP' : (v.nota||0)+'/10'}`).join(', ');
                               }
                               if (p.texto) txt += (txt ? ' | ' : '') + p.texto;
                               return txt;
                             } catch(e) { return item.comentario; }
                           }
                           return item.comentario;
                        })()}>
                        {(() => {
                           if (!item.comentario) return '—';
                           if (item.comentario.startsWith('{')) {
                             try {
                               const p = JSON.parse(item.comentario);
                               let txt = '';
                               if (p.detalle_evaluacion) {
                                 txt = Object.entries(p.detalle_evaluacion).map(([k,v]) => `${k}: ${v.np ? 'NP' : (v.nota||0)+'/10'}`).join(', ');
                               }
                               if (p.texto) txt += (txt ? ' | ' : '') + p.texto;
                               return txt || '—';
                             } catch(e) { return item.comentario; }
                           }
                           return item.comentario;
                        })()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* FOOTER TABLA */}
          <div className="p-10 bg-slate-50 flex justify-between items-center border-t border-slate-100">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Mostrando {filteredData.length} registros de {data.length} totales
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-100 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Excelente (≥ 80)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-100 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aprobado (60-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-yellow-100 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Regular (40-59)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-orange-100 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Refuerzo (&lt; 40)</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-10 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] hidden print:block">
          Academia de Formación AFV — Reporte de Gestión Académica
        </footer>
      </div>
    </div>
  );
};

export default ReporteNotas;
