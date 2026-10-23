import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { generarPdfSeguimiento } from '../../utils/reporteSeguimientoPdf';
import { generarPdfRubricasDetallado } from '../../utils/reporteRubricasDetalladoPdf';
import { rubricaData } from '../../data/rubricaData';
import { getCompanyConfig, BuildingIcon } from '../../pages/DashboardSeguimiento';

const DIMENSIONS = [
  { key: 'Desarrollo', label: '1. Desarrollo y Formación' },
  { key: 'Supervisor', label: '2. Supervisor de Ventas' },
  { key: 'Auditoria', label: '3. Auditoría de Procesos' },
  { key: 'Credito_Cobranza', label: '4. Crédito y Cobranza' },
  { key: 'Admin_Ventas', label: '5. Administración de Ventas' },
  { key: 'Autoevaluacion', label: '6. Autoevaluación Asesor' }
];

export default function ModalReporteSeguimiento({ advisor, defaultMonth = 1, onClose, evaluatorName = 'Administrador' }) {
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [evaluations, setEvaluations] = useState([]);
  const [actionPlans, setActionPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingDetailedPdf, setGeneratingDetailedPdf] = useState(false);
  const [viewDetailMode, setViewDetailMode] = useState('detallado'); // 'detallado' | 'resumen'

  // Formulario rápido para nuevo plan de acción
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    department: 'Desarrollo',
    criterion_label: 'Cruce BDF / AFV Ventas',
    compromiso: '',
    fecha_limite: '',
    responsable: 'Supervisor / Buddy'
  });

  useEffect(() => {
    cargarDatosMes();
  }, [advisor?.id, selectedMonth]);

  const cargarDatosMes = async () => {
    if (!advisor?.id) return;
    setLoading(true);
    try {
      // 1. Cargar evaluaciones del mes para este asesor
      const { data: evalsData } = await supabase
        .from('evaluations')
        .select('*')
        .eq('advisor_id', advisor.id)
        .eq('month_number', parseInt(selectedMonth));

      setEvaluations(evalsData || []);

      // 2. Cargar planes de acción si existe la tabla
      try {
        const { data: plansData, error: plansErr } = await supabase
          .from('planes_accion_asesor')
          .select('*')
          .eq('advisor_id', advisor.id)
          .eq('month_number', parseInt(selectedMonth))
          .order('created_at', { ascending: false });

        if (!plansErr && plansData) {
          setActionPlans(plansData);
        } else {
          setActionPlans([]);
        }
      } catch (e) {
        setActionPlans([]);
      }
    } catch (err) {
      console.error("Error al cargar reporte:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCompromiso = async (e) => {
    e.preventDefault();
    if (!newPlan.compromiso.trim()) {
      alert("Por favor ingrese la descripción del compromiso.");
      return;
    }

    try {
      const payload = {
        advisor_id: advisor.id,
        advisor_name: advisor.full_name || advisor.email,
        month_number: parseInt(selectedMonth),
        department: newPlan.department,
        criterion_id: 'Plan-Mejora',
        criterion_label: newPlan.criterion_label,
        compromiso: newPlan.compromiso,
        fecha_limite: newPlan.fecha_limite || null,
        responsable: newPlan.responsable,
        estado: 'Pendiente'
      };

      const { data, error } = await supabase
        .from('planes_accion_asesor')
        .insert(payload)
        .select()
        .single();

      if (!error && data) {
        setActionPlans(prev => [data, ...prev]);
        setShowAddPlan(false);
        setNewPlan({
          department: 'Desarrollo',
          criterion_label: 'Cruce BDF / AFV Ventas',
          compromiso: '',
          fecha_limite: '',
          responsable: 'Supervisor / Buddy'
        });
        alert("¡Compromiso de mejora guardado correctamente!");
      } else {
        // Si no existe la tabla aún, permitir agregarlo temporalmente al preview
        setActionPlans(prev => [payload, ...prev]);
        setShowAddPlan(false);
        alert("Compromiso registrado en la sesión para el reporte.");
      }
    } catch (err) {
      console.error("Error guardando compromiso:", err);
    }
  };

  const handleDescargarPdf = () => {
    setGeneratingPdf(true);
    try {
      generarPdfSeguimiento({
        advisor,
        month: selectedMonth,
        evaluations,
        actionPlans,
        evaluatorName
      });
    } catch (err) {
      alert("Error al generar la Ficha: " + err.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDescargarPdfDetallado = (openInNewTab = false) => {
    setGeneratingDetailedPdf(true);
    try {
      generarPdfRubricasDetallado({
        advisor,
        month: selectedMonth,
        evaluations,
        actionPlans,
        evaluatorName,
        openInNewTab
      });
    } catch (err) {
      alert("Error al generar el Reporte Detallado: " + err.message);
    } finally {
      setGeneratingDetailedPdf(false);
    }
  };

  // Cálculo de promedios
  let sum = 0;
  let count = 0;
  evaluations.forEach(ev => {
    if (ev.average_score) {
      sum += Number(ev.average_score);
      count++;
    }
  });
  const globalAverage = count > 0 ? (sum / count).toFixed(2) : '0.00';

  const getBadgeColor = (score) => {
    const num = Number(score);
    if (num >= 4.0) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (num >= 3.0) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Barra superior de acciones */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">📄</span>
            <div>
              <h2 className="text-base font-bold">Reporte de Evaluación por Rúbricas y Seguimiento</h2>
              <p className="text-xs text-slate-400">Detalle de las 6 dimensiones, observaciones por criterio y plan de mejora</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleDescargarPdfDetallado(true)}
              disabled={generatingDetailedPdf}
              title="Abre la vista previa de impresión en una nueva pestaña (para imprimir o guardar digitalmente)"
              className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              🖨️ {generatingDetailedPdf ? 'Generando...' : 'Vista Previa / Imprimir'}
            </button>
            <button
              onClick={() => handleDescargarPdfDetallado(false)}
              disabled={generatingDetailedPdf}
              title="Descarga el PDF completo con todas las 6 dimensiones, rúbricas y observaciones detalladas"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              📥 {generatingDetailedPdf ? 'Generando...' : 'Descargar PDF Detallado'}
            </button>
            <button
              onClick={handleDescargarPdf}
              disabled={generatingPdf}
              title="Descarga la ficha ejecutiva resumida de 1-2 páginas"
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              📋 {generatingPdf ? 'Generando...' : 'Ficha Resumida'}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg text-lg transition cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Selector de Mes y Datos del Asesor */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                  Asesor Seleccionado
                </span>
                {(() => {
                  const compConf = getCompanyConfig(advisor?.empresa);
                  return (
                    <span 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shadow-2xs"
                      style={{
                        backgroundColor: compConf.bgHex,
                        borderColor: compConf.borderHex,
                        color: compConf.textHex
                      }}
                    >
                      <BuildingIcon color={compConf.color} className="w-3 h-3 shrink-0" />
                      {advisor?.empresa || compConf.name}
                    </span>
                  );
                })()}
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">{advisor?.full_name || advisor?.name || 'Asesor'}</h3>
              <p className="text-xs text-slate-500">{advisor?.email}</p>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <label className="text-xs font-bold text-slate-700">Corte a Reportar:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-sm font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map(m => (
                  <option key={m} value={m}>
                    Mes {m} {m === 3 ? '(Trimestral)' : m === 6 ? '(Semestral)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tarjeta de Resumen Ejecutivo / Semáforo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block">Promedio Global Mes {selectedMonth}</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">{globalAverage}</span>
                <span className="text-xs text-slate-400">/ 5.00</span>
              </div>
              <div className="mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeColor(globalAverage)}`}>
                  {Number(globalAverage) >= 4.0 ? 'SÓLIDO / REFERENTE' : Number(globalAverage) >= 3.0 ? 'COMPETENTE ESTÁNDAR' : 'REQUIERE REFUERZO'}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block">Dimensiones Evaluadas</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-blue-700">{evaluations.length}</span>
                <span className="text-xs text-slate-400">/ 6 Departamentos</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {evaluations.length === 6 ? '✓ Evaluación completa de ronda' : `Faltan ${6 - evaluations.length} departamentos por calificar`}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block">Compromisos de Mejora</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-amber-700">{actionPlans.length}</span>
                <span className="text-xs text-slate-400">actividades pactadas</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Seguimiento continuo de indicadores críticos
              </p>
            </div>
          </div>

          {/* Selector de Pestaña: Detalle vs Resumen */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setViewDetailMode('detallado')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewDetailMode === 'detallado'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>📝</span> Desglose de Rúbricas y Observaciones
              </button>
              <button
                type="button"
                onClick={() => setViewDetailMode('resumen')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewDetailMode === 'resumen'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>📊</span> Resumen por Dimensión
              </button>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
              Mes {selectedMonth} · 6 Dimensiones
            </span>
          </div>

          {/* Sección 1: Vista Detallada de Criterios y Observaciones */}
          {viewDetailMode === 'detallado' && (
            <div className="space-y-4">
              {DIMENSIONS.map(dim => {
                const ev = evaluations.find(e => e.department === dim.key);
                const score = ev ? Number(ev.average_score).toFixed(2) : null;
                const criterios = rubricaData[dim.key] || [];
                const scores = ev?.scores || {};
                const criteriaObs = ev?.criteria_observations || {};
                const obsCount = Object.values(criteriaObs).filter(v => v && v.trim()).length;

                return (
                  <div key={dim.key} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Encabezado de la Dimensión */}
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          {dim.label}
                        </h4>
                        <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full font-bold">
                          {obsCount} / {criterios.length} con observación
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {score ? (
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${getBadgeColor(score)}`}>
                            Promedio: {score} / 5.00
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic font-semibold">Pendiente de calificar</span>
                        )}
                      </div>
                    </div>

                    {/* Lista de Criterios con sus Observaciones */}
                    <div className="divide-y divide-slate-100 p-2">
                      {criterios.map(crit => {
                        const critScore = scores[crit.id];
                        const obs = criteriaObs[crit.id];

                        return (
                          <div key={crit.id} className="p-3 hover:bg-slate-50/60 rounded-lg transition">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[11px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {crit.id}
                                  </span>
                                  <h5 className="text-xs font-bold text-slate-900">
                                    {crit.label}
                                  </h5>
                                </div>
                              </div>

                              <div className="shrink-0">
                                {critScore !== undefined ? (
                                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getBadgeColor(critScore)}`}>
                                    {critScore === 'N/A' ? 'N/A' : `${critScore} / 5`}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">Sin nota</span>
                                )}
                              </div>
                            </div>

                            {/* Observación Cualitativa del Criterio */}
                            {obs && obs.trim() ? (
                              <div className="mt-2 bg-amber-50/80 border border-amber-200/90 rounded-md p-2.5 text-xs text-amber-950">
                                <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-800 mb-0.5">
                                  <span>✍️</span> Observación del Evaluador:
                                </div>
                                <p className="leading-relaxed pl-3 border-l-2 border-amber-400">
                                  {obs.trim()}
                                </p>
                              </div>
                            ) : (
                              <p className="mt-1 text-[10px] text-slate-400 italic">
                                Sin observación específica registrada para este criterio.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Comentario General de la Dimensión si existe */}
                    {ev?.comments && ev.comments.trim() && (
                      <div className="bg-slate-50/80 border-t border-slate-200 p-3 text-xs text-slate-700">
                        <span className="font-bold text-[10px] uppercase text-slate-500 block mb-0.5">
                          💬 Comentario Global del Departamento:
                        </span>
                        <p className="italic pl-2 border-l-2 border-slate-300">
                          "{ev.comments.trim()}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Sección 1: Vista Resumen (6 tarjetas de dimensiones) */}
          {viewDetailMode === 'resumen' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  1. Resumen de Rúbricas por Dimensión (Mes {selectedMonth})
                </h4>
              </div>

              <div className="divide-y divide-slate-100">
                {DIMENSIONS.map(dim => {
                  const ev = evaluations.find(e => e.department === dim.key);
                  const score = ev ? Number(ev.average_score).toFixed(2) : null;
                  const cCount = (rubricaData[dim.key] || []).length;
                  const obsCount = ev?.criteria_observations ? Object.values(ev.criteria_observations).filter(v => v && v.trim()).length : 0;

                  return (
                    <div key={dim.key} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50">
                      <div className="md:w-1/2">
                        <p className="text-sm font-bold text-slate-900">{dim.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {obsCount} de {cCount} criterios con observación cualitativa
                        </p>
                        {ev?.comments && (
                          <p className="text-xs text-slate-500 italic mt-1">"{ev.comments}"</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {score ? (
                          <>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getBadgeColor(score)}`}>
                              {score} / 5.00
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {Number(score) >= 4.0 ? '🟢 Sólido' : Number(score) >= 3.0 ? '🟡 Competente' : '🔴 Refuerzo'}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold italic">Pendiente de evaluación</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sección 2: Plan de Acción y Compromisos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  2. Plan de Acción y Actividades de Seguimiento
                </h4>
                <p className="text-[11px] text-slate-500">Compromisos acordados para mejorar los indicadores evaluados</p>
              </div>
              <button
                onClick={() => setShowAddPlan(!showAddPlan)}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold px-3 py-1 rounded-lg transition"
              >
                {showAddPlan ? 'Cancelar' : '➕ Añadir Compromiso'}
              </button>
            </div>

            {/* Formulario para añadir compromiso rápido */}
            {showAddPlan && (
              <form onSubmit={handleCrearCompromiso} className="p-4 bg-blue-50/50 border-b border-blue-100 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Dimensión</label>
                    <select
                      value={newPlan.department}
                      onChange={(e) => setNewPlan({...newPlan, department: e.target.value})}
                      className="w-full text-xs border rounded p-2 bg-white"
                    >
                      {DIMENSIONS.map(d => (
                        <option key={d.key} value={d.key}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Indicador Crítico</label>
                    <input
                      type="text"
                      value={newPlan.criterion_label}
                      onChange={(e) => setNewPlan({...newPlan, criterion_label: e.target.value})}
                      placeholder="Ej: Cruce BDF / Morosidad"
                      className="w-full text-xs border rounded p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Fecha Límite</label>
                    <input
                      type="date"
                      value={newPlan.fecha_limite}
                      onChange={(e) => setNewPlan({...newPlan, fecha_limite: e.target.value})}
                      className="w-full text-xs border rounded p-2 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Actividad / Acción Específica</label>
                  <textarea
                    value={newPlan.compromiso}
                    onChange={(e) => setNewPlan({...newPlan, compromiso: e.target.value})}
                    placeholder="Describa la tarea que el asesor debe realizar para mejorar este indicador..."
                    className="w-full text-xs border rounded p-2 bg-white"
                    rows="2"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
                  >
                    Guardar Compromiso
                  </button>
                </div>
              </form>
            )}

            {/* Listado de compromisos */}
            {actionPlans.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No hay compromisos de mejora registrados para este mes. Puedes registrar uno con el botón superior.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {actionPlans.map((plan, idx) => (
                  <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {plan.department}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{plan.criterion_label}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{plan.compromiso}</p>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div className="text-[11px] text-slate-500">
                        <p><strong>Límite:</strong> {plan.fecha_limite || 'Por definir'}</p>
                        <p><strong>Resp:</strong> {plan.responsable}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                        plan.estado === 'Cumplido' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        plan.estado === 'En Progreso' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {plan.estado || 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer del Modal con botón directo de descarga */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            El PDF generado incluye membrete, semáforo, rúbricas y firmas formales de compromiso.
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-white rounded-lg text-xs font-semibold"
            >
              Cerrar
            </button>
            <button
              onClick={handleDescargarPdf}
              disabled={generatingPdf}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              📥 Descargar Reporte en PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
