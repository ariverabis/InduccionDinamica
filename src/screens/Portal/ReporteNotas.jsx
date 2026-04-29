import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const ReporteNotas = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filterEmpresa, setFilterEmpresa] = useState('Todas');
  const [filterNotaMin, setFilterNotaMin] = useState(0);
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');
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
          created_at,
          email_evaluador,
          usuarios!id_asesor(nombre, empresa),
          submodulos_finales!id_submodulo(nombre_tarea, area_tecnica, departamentos(nombre))
        `)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const mapped = (results || []).map(r => ({
        id: r.id,
        nota: r.nota,
        comentario: r.comentario,
        intento: r.intento,
        fecha: r.created_at,
        email_evaluador: r.email_evaluador,
        nombre_asesor: r.usuarios?.nombre || 'Desconocido',
        empresa: r.usuarios?.empresa || '-',
        nombre_tema: r.submodulos_finales?.nombre_tarea || 'Sin nombre',
        area_tecnica: r.submodulos_finales?.area_tecnica || null,
        departamento: r.submodulos_finales?.departamentos?.nombre || '-',
      }));

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
  }, [filterEmpresa, filterNotaMin, filterFechaDesde, filterFechaHasta, sortBy, data]);

  const applyFilters = () => {
    let result = [...data];

    if (filterEmpresa !== 'Todas') {
      result = result.filter(item => item.empresa === filterEmpresa);
    }

    if (filterNotaMin > 0) {
      result = result.filter(item => (item.nota || 0) >= filterNotaMin);
    }

    if (filterFechaDesde) {
      result = result.filter(item => new Date(item.fecha) >= new Date(filterFechaDesde));
    }
    if (filterFechaHasta) {
      const hasta = new Date(filterFechaHasta);
      hasta.setHours(23, 59, 59);
      result = result.filter(item => new Date(item.fecha) <= hasta);
    }

    if (sortBy === 'fecha_desc') {
      result.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } else if (sortBy === 'nota_desc') {
      result.sort((a, b) => (b.nota || 0) - (a.nota || 0));
    } else if (sortBy === 'nombre_asc') {
      result.sort((a, b) => (a.nombre_asesor || '').localeCompare(b.nombre_asesor || ''));
    }

    setFilteredData(result);
  };

  const promedioGeneral = filteredData.length > 0
    ? (filteredData.reduce((acc, i) => acc + (i.nota || 0), 0) / filteredData.length).toFixed(1)
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

  const getNotaBadge = (nota) => {
    const n = nota || 0;
    const styles =
      n >= 80 ? 'bg-green-100 text-green-700' :
      n >= 60 ? 'bg-blue-100 text-blue-700' :
      n >= 40 ? 'bg-yellow-100 text-yellow-700' :
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
            <p className={`text-4xl font-black ${parseFloat(promedioGeneral) >= 60 ? 'text-green-600' : 'text-orange-500'}`}>{promedioGeneral}</p>
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
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Desde</label>
            <input
              type="date"
              value={filterFechaDesde}
              onChange={(e) => setFilterFechaDesde(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Hasta</label>
            <input
              type="date"
              value={filterFechaHasta}
              onChange={(e) => setFilterFechaHasta(e.target.value)}
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

        {/* TABLA */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Asesor de Ventas</th>
                <th className="px-8 py-6">Empresa</th>
                <th className="px-8 py-6">Módulo / Tema</th>
                <th className="px-8 py-6">Dpto.</th>
                <th className="px-8 py-6">Fecha</th>
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
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Intento #{item.intento || 1}</span>
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
                    <td className="px-8 py-5">
                      <span className="text-xs text-slate-500 font-bold">
                        {new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {getNotaBadge(item.nota)}
                    </td>
                    <td className="px-8 py-5 print:hidden">
                      <span className="text-[10px] text-slate-400 italic line-clamp-2 max-w-[180px]">
                        {item.comentario && !item.comentario.startsWith('{') ? item.comentario : '—'}
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
