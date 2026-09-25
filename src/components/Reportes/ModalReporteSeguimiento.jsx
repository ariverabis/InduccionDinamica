import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { generarPdfSeguimiento } from '../../utils/reporteSeguimientoPdf';
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
      alert("Error al generar el PDF: " + err.message);
    } finally {
      setGeneratingPdf(false);
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
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📄</span>
            <div>
              <h2 className="text-base font-bold">Ficha Ejecutiva de Seguimiento y Plan de Acción</h2>
              <p className="text-xs text-slate-400">Reporte On-Demand individual con rúbrica y compromisos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDescargarPdf}
              disabled={generatingPdf}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              📥 {generatingPdf ? 'Generando PDF...' : 'Descargar PDF Formal'}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg text-lg transition"
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

          {/* Sección 1: Desglose por Dimensiones */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                1. Desglose de Rúbricas por Dimensión (Mes {selectedMonth})
              </h4>
            </div>

            <div className="divide-y divide-slate-100">
              {DIMENSIONS.map(dim => {
                const ev = evaluations.find(e => e.department === dim.key);
                const score = ev ? Number(ev.average_score).toFixed(2) : null;

                return (
                  <div key={dim.key} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50">
                    <div className="md:w-1/2">
                      <p className="text-sm font-bold text-slate-900">{dim.label}</p>
                      {ev?.comments && (
                        <p className="text-xs text-slate-500 italic mt-0.5">"{ev.comments}"</p>
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
