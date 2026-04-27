import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const ReporteNotas = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de Filtros
  const [filterEmpresa, setFilterEmpresa] = useState('Todas');
  const [filterNotaMin, setFilterNotaMin] = useState(0);
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');
  const [sortBy, setSortBy] = useState('fecha_desc'); // fecha_desc, nota_desc, nombre_asc

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: results, error } = await supabase
        .schema('portal_afv')
        .from('ejercicios_evidencias')
        .select(`
          id, 
          nota_ejercicio, 
          feedback_evaluador, 
          fecha_entrega, 
          usuarios(nombre, empresa), 
          maestro_escenarios(titulo_escenario, numero_escenario)
        `)
        .order('fecha_entrega', { ascending: false });

      if (error) throw error;
      setData(results || []);
      setFilteredData(results || []);
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filterEmpresa, filterNotaMin, filterFechaDesde, filterFechaHasta, sortBy, data]);

  const applyFilters = () => {
    let result = [...data];

    // Filtro Empresa
    if (filterEmpresa !== 'Todas') {
      result = result.filter(item => item.usuarios?.empresa === filterEmpresa);
    }

    // Filtro Nota Mínima
    if (filterNotaMin > 0) {
      result = result.filter(item => (item.nota_ejercicio || 0) >= filterNotaMin);
    }

    // Filtro Fechas
    if (filterFechaDesde) {
      result = result.filter(item => new Date(item.fecha_entrega) >= new Date(filterFechaDesde));
    }
    if (filterFechaHasta) {
      const hasta = new Date(filterFechaHasta);
      hasta.setHours(23, 59, 59);
      result = result.filter(item => new Date(item.fecha_entrega) <= hasta);
    }

    // Ordenamiento
    if (sortBy === 'fecha_desc') {
      result.sort((a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega));
    } else if (sortBy === 'nota_desc') {
      result.sort((a, b) => (b.nota_ejercicio || 0) - (a.nota_ejercicio || 0));
    } else if (sortBy === 'nombre_asc') {
      result.sort((a, b) => (a.usuarios?.nombre || '').localeCompare(b.usuarios?.nombre || ''));
    }

    setFilteredData(result);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold text-[10px]">Generando Reporte Ejecutivo...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans print:p-0 print:bg-white">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER EXCLUSIVO PARA IMPRESIÓN */}
        <div className="hidden print:block mb-10 border-b-2 border-slate-900 pb-6">
           <div className="flex justify-between items-end">
              <div>
                 <h1 className="text-3xl font-black text-slate-900">Reporte de Calificaciones Academia AFV</h1>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Documento de Control de Gestión — Confidencial</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase">Generado el:</p>
                 <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
           </div>
        </div>

        <header className="flex justify-between items-center mb-8 print:hidden">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Centro de Reportes Ejecutivos</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Análisis de rendimiento por criterios</p>
          </div>
          <div className="flex gap-3">
             <button onClick={handlePrint} className="px-6 py-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2">
                🖨️ Imprimir / PDF
             </button>
             <button onClick={onBack} className="px-6 py-3 bg-white border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
                ← Volver
             </button>
          </div>
        </header>

        {/* BARRA DE FILTROS */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 grid grid-cols-1 md:grid-cols-5 gap-6 print:hidden">
           <div>
              <label className="text-[8px] font-black text-slate-400 uppercase mb-2 block">Empresa / Marca</label>
              <select 
                value={filterEmpresa} 
                onChange={(e) => setFilterEmpresa(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-400"
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
              <label className="text-[8px] font-black text-slate-400 uppercase mb-2 block">Nota Mínima</label>
              <input 
                type="number" 
                value={filterNotaMin} 
                onChange={(e) => setFilterNotaMin(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-400"
              />
           </div>
           <div>
              <label className="text-[8px] font-black text-slate-400 uppercase mb-2 block">Desde</label>
              <input 
                type="date" 
                value={filterFechaDesde} 
                onChange={(e) => setFilterFechaDesde(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-400"
              />
           </div>
           <div>
              <label className="text-[8px] font-black text-slate-400 uppercase mb-2 block">Hasta</label>
              <input 
                type="date" 
                value={filterFechaHasta} 
                onChange={(e) => setFilterFechaHasta(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-400"
              />
           </div>
           <div>
              <label className="text-[8px] font-black text-slate-400 uppercase mb-2 block">Ordenar por</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-400"
              >
                 <option value="fecha_desc">Más recientes primero</option>
                 <option value="nota_desc">Mejores notas primero</option>
                 <option value="nombre_asc">Nombre (A-Z)</option>
              </select>
           </div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
           <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                 <tr>
                    <th className="px-8 py-5">Asesor de Ventas</th>
                    <th className="px-8 py-5">Empresa</th>
                    <th className="px-8 py-5">Desafío / Escenario</th>
                    <th className="px-8 py-5">Fecha</th>
                    <th className="px-8 py-5 text-center">Nota</th>
                    <th className="px-8 py-5 print:hidden">Acción</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredData.length === 0 ? (
                   <tr>
                      <td colSpan="6" className="px-8 py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">No se encontraron resultados con los filtros aplicados</td>
                   </tr>
                 ) : (
                   filteredData.map((item) => (
                     <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-5">
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900">{item.usuarios?.nombre || 'Desconocido'}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Asesor Comercial</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{item.usuarios?.empresa || '-'}</span>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-700">#{item.maestro_escenarios?.numero_escenario} — {item.maestro_escenarios?.titulo_escenario || 'Roleplay'}</span>
                              <span className="text-[9px] text-slate-400 italic line-clamp-1">{item.feedback_evaluador || 'Sin feedback'}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-[10px] text-slate-500 font-bold">
                              {new Date(item.fecha_entrega).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={`px-4 py-1.5 rounded-full text-xs font-black ${
                              (item.nota_ejercicio || 0) >= 18 ? 'bg-green-100 text-green-700' :
                              (item.nota_ejercicio || 0) >= 15 ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                           }`}>
                              {item.nota_ejercicio || 'N/A'}
                           </span>
                        </td>
                        <td className="px-8 py-5 print:hidden">
                           <button 
                             onClick={() => alert(`Feedback: ${item.feedback_evaluador || 'Sin comentarios'}`)}
                             className="w-8 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all"
                           >👁️</button>
                        </td>
                     </tr>
                   ))
                 )}
              </tbody>
           </table>
           
           <div className="p-8 bg-slate-50 flex justify-between items-center border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 Mostrando {filteredData.length} registros de {data.length} totales
              </p>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-100 rounded-full"></span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Excelente (18-20)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-100 rounded-full"></span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Aprobado (15-17)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-100 rounded-full"></span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Refuerzo (&lt; 15)</span>
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
