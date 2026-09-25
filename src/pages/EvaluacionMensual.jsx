import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { rubricaData } from '../data/rubricaData';
import CruceBDF from '../components/CruceBDF';
import { supabase } from '../lib/supabase';
import ModalReporteSeguimiento from '../components/Reportes/ModalReporteSeguimiento';

const DIMENSIONS = [
  { key: 'Desarrollo', label: '1. Desarrollo y Formación', count: 6 },
  { key: 'Supervisor', label: '2. Supervisor de Ventas', count: 9 },
  { key: 'Auditoria', label: '3. Auditoría de Procesos', count: 12 },
  { key: 'Credito_Cobranza', label: '4. Crédito y Cobranza', count: 4 },
  { key: 'Admin_Ventas', label: '5. Administración de Ventas', count: 7 },
  { key: 'Autoevaluacion', label: '6. Autoevaluación Asesor', count: 6 }
];

export default function EvaluacionMensual() {
  const { advisorId, month } = useParams();
  const { profile } = useAuth();
  const portalUser = JSON.parse(localStorage.getItem('portalUser') || 'null');
  const activeRole = profile?.role || (portalUser?.rol === 'admin' ? 'Administrador' : (portalUser?.rol === 'evaluador' ? 'Desarrollo' : portalUser?.rol));
  const activeName = profile?.full_name || portalUser?.nombre || 'Usuario';
  const navigate = useNavigate();

  const isAdmin = activeRole === 'Administrador';
  
  // Si el usuario es Asesor, bloquear acceso a evaluar
  if (activeRole === 'Asesor') {
    return (
      <div style={{ fontFamily: '"Myriad Pro", Arial, sans-serif', padding: '48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#d32f2f', marginBottom: '16px' }}>Acceso denegado</h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>No tiene permisos para evaluar a otros asesores.</p>
        <button
          onClick={() => navigate('/dashboard-seguimiento')}
          style={{
            fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
            color: '#000', background: '#c6c6c6', border: '1px solid transparent',
            borderRadius: '8px', padding: '10px 24px', cursor: 'pointer',
            transition: 'background 150ms ease, color 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#c6c6c6'; e.currentTarget.style.color = '#000'; }}
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  // Si es Administrador, puede elegir cualquiera de las 6 dimensiones.
  // Si es un evaluador de un área específica (ej. Auditoria), se fija a su departamento.
  const initialDept = isAdmin ? 'Desarrollo' : (activeRole || 'Desarrollo');
  const [selectedDept, setSelectedDept] = useState(initialDept);

  const [advisor, setAdvisor] = useState(null);
  const [existingEvals, setExistingEvals] = useState({});
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // 1. Cargar datos del asesor evaluado
  useEffect(() => {
    async function fetchAdvisor() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', advisorId)
          .single();
        if (!error && data) {
          setAdvisor(data);
        }
      } catch (err) {
        console.error("Error al cargar asesor:", err);
      }
    }
    fetchAdvisor();
  }, [advisorId]);

  // 2. Cargar todas las evaluaciones del asesor para este mes (para ver el estatus de las 6 dimensiones)
  useEffect(() => {
    async function fetchMonthEvaluations() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('evaluations')
          .select('*')
          .eq('advisor_id', advisorId)
          .eq('month_number', parseInt(month));

        if (!error && data) {
          const evalMap = {};
          data.forEach(ev => {
            evalMap[ev.department] = ev;
          });
          setExistingEvals(evalMap);
        }
      } catch (err) {
        console.error("Error al cargar evaluaciones:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMonthEvaluations();
  }, [advisorId, month]);

  // 3. Cuando cambia el departamento seleccionado, cargar los puntajes y comentarios correspondientes
  useEffect(() => {
    const currentEval = existingEvals[selectedDept];
    if (currentEval) {
      setScores(currentEval.scores || {});
      setComments(currentEval.comments || '');
    } else {
      setScores({});
      setComments('');
    }
  }, [selectedDept, existingEvals]);

  const criteria = rubricaData[selectedDept] || [];
  const isDesarrollo = selectedDept === 'Desarrollo';

  const handleScoreChange = (id, value) => {
    setScores(prev => ({ ...prev, [id]: Number(value) }));
  };

  const calculateAverage = () => {
    const values = Object.values(scores);
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return (sum / values.length).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(scores).length < criteria.length) {
      alert(`Por favor califique los ${criteria.length} criterios de esta dimensión antes de guardar.`);
      return;
    }

    setSaving(true);
    try {
      const avg = calculateAverage();
      const payload = {
        advisor_id: advisorId,
        advisor_name: advisor?.full_name || advisor?.email || "Asesor",
        month_number: parseInt(month),
        department: selectedDept,
        scores: scores,
        comments: comments,
        average_score: avg,
        evaluator_id: profile?.id || portalUser?.id
      };

      const { data, error } = await supabase
        .from('evaluations')
        .upsert(payload, { onConflict: 'advisor_id, month_number, department' })
        .select()
        .single();

      if (error) throw error;
      
      alert(`¡Evaluación de la dimensión "${selectedDept}" guardada con éxito (Promedio: ${avg})!`);
      
      // Actualizar el mapa local de evaluaciones
      setExistingEvals(prev => ({
        ...prev,
        [selectedDept]: data || payload
      }));

    } catch (err) {
      alert(err.message || 'Error al guardar la evaluación');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: '"Myriad Pro", Arial, sans-serif',
        background: '#f9fafb',
        color: '#000',
      }}
    >
      <div className="max-w-6xl mx-auto" style={{ padding: '32px' }}>

        {/* Barra de navegación superior */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingBottom: '16px',
            marginBottom: '24px',
            borderBottom: '1px solid #e2e2e2',
          }}
        >
          <button
            onClick={() => navigate('/dashboard-seguimiento')}
            style={{
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: 600,
              color: '#000',
              background: '#fff',
              border: '1px solid #c6c6c6',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer',
              transition: 'border-color 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#000'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#c6c6c6'}
            onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
            onMouseUp={e => e.currentTarget.style.opacity = '1'}
          >
            Volver al Dashboard
          </button>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Sesión activa: <span style={{ fontWeight: 600, color: '#000' }}>{activeName}</span> ({activeRole})
          </div>
        </div>

        {/* Encabezado del Asesor y Mes */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between"
          style={{
            background: '#fff',
            border: '1px solid #e2e2e2',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,.08)',
            padding: '24px',
            marginBottom: '32px',
            gap: '16px',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#000',
                background: '#c6c6c6',
                padding: '4px 12px',
                borderRadius: '999px',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
              }}
            >
              Evaluación Mes {month} {parseInt(month) === 3 ? '(Corte trimestral)' : parseInt(month) === 6 ? '(Corte semestral)' : ''}
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#000', marginTop: '12px', lineHeight: 1.25 }}>
              {advisor?.full_name || 'Cargando asesor...'}
            </h1>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              Correo: {advisor?.email || 'N/A'}
            </p>
          </div>
          <div className="flex items-center" style={{ gap: '12px' }}>
            <div
              style={{
                background: '#f9fafb',
                border: '1px solid #e2e2e2',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'right',
              }}
            >
              <span style={{ display: 'block', fontSize: '12px', color: '#8a8a8a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Dimensiones calificadas
              </span>
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#000' }}>
                {Object.keys(existingEvals).length} / 6
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              style={{
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: 600,
                color: '#000',
                background: '#c6c6c6',
                border: '1px solid transparent',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                transition: 'background 150ms ease, color 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#c6c6c6'; e.currentTarget.style.color = '#000'; }}
              onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
              onMouseUp={e => e.currentTarget.style.opacity = '1'}
            >
              Generar ficha PDF
            </button>
          </div>
        </div>

        {/* Selector de las 6 Dimensiones / Rúbricas */}
        <div style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#8a8a8a',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              marginBottom: '12px',
            }}
          >
            {isAdmin ? 'Seleccione la dimensión a calificar:' : 'Dimensión de evaluación asignada:'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ gap: '8px' }}>
            {DIMENSIONS.map(dim => {
              const isCompleted = !!existingEvals[dim.key];
              const isSelected = selectedDept === dim.key;
              const canSelect = isAdmin || activeRole === dim.key;

              return (
                <button
                  key={dim.key}
                  type="button"
                  disabled={!canSelect}
                  onClick={() => setSelectedDept(dim.key)}
                  style={{
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #000' : '1px solid #e2e2e2',
                    background: isSelected ? '#f9fafb' : '#fff',
                    cursor: canSelect ? 'pointer' : 'default',
                    opacity: canSelect ? 1 : 0.4,
                    transition: 'border-color 150ms ease, background 150ms ease',
                  }}
                  onMouseEnter={e => { if (canSelect && !isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff'; }}
                >
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                        {dim.count} criterios
                      </span>
                      {isCompleted && (
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#000',
                            background: '#c6c6c6',
                            padding: '2px 10px',
                            borderRadius: '999px',
                          }}
                        >
                          {existingEvals[dim.key].average_score}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#000' }}>
                      {dim.label}
                    </p>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 600 }}>
                    {isCompleted ? (
                      <span style={{ color: '#388e3c' }}>Calificado</span>
                    ) : (
                      <span style={{ color: '#f57f17' }}>Pendiente</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Integración del Cruce BDF si la dimensión es Desarrollo */}
        {isDesarrollo && (
          <div style={{ marginBottom: '32px' }}>
            <CruceBDF />
          </div>
        )}

        {/* Formulario de la Rúbrica para la dimensión activa */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e2e2',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,.08)',
            padding: '24px',
          }}
        >
          <div
            className="flex flex-col md:flex-row md:items-center justify-between"
            style={{
              borderBottom: '1px solid #e2e2e2',
              paddingBottom: '16px',
              marginBottom: '24px',
              gap: '8px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#000' }}>
                Rúbrica: {DIMENSIONS.find(d => d.key === selectedDept)?.label}
              </h3>
              <p style={{ fontSize: '12px', color: '#8a8a8a', marginTop: '4px' }}>
                Escala de calificación del 1 al 5 (1: No cumple, 3: Competente, 5: Referente)
              </p>
            </div>
            {existingEvals[selectedDept] && (
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#000',
                  background: '#f9fafb',
                  border: '1px solid #e2e2e2',
                  borderRadius: '8px',
                  padding: '6px 12px',
                }}
              >
                Calificación registrada: <strong>{existingEvals[selectedDept].average_score} / 5.00</strong>
              </div>
            )}
          </div>

          {criteria.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#d32f2f', padding: '16px 0' }}>
              No hay criterios configurados para esta dimensión.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {criteria.map((item) => {
                  const currentVal = scores[item.id];
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col md:flex-row md:items-center justify-between"
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e2e2',
                        background: currentVal ? '#f9fafb' : '#fff',
                        transition: 'background 150ms ease',
                      }}
                    >
                      <div className="mb-3 md:mb-0 md:w-3/5">
                        <div className="flex items-center" style={{ gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#4a4a4a',
                              background: '#fff',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              border: '1px solid #c6c6c6',
                            }}
                          >
                            {item.id}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#000' }}>
                            {item.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center" style={{ gap: '6px' }}>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <label
                            key={num}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '14px',
                              border: scores[item.id] === num ? '1px solid #000' : '1px solid #c6c6c6',
                              background: scores[item.id] === num ? '#000' : '#fff',
                              color: scores[item.id] === num ? '#fff' : '#4a4a4a',
                              transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                            }}
                            onMouseEnter={e => { if (scores[item.id] !== num) e.currentTarget.style.background = '#f9fafb'; }}
                            onMouseLeave={e => { if (scores[item.id] !== num) e.currentTarget.style.background = '#fff'; }}
                            onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
                            onMouseUp={e => e.currentTarget.style.opacity = '1'}
                          >
                            <input
                              type="radio"
                              name={`score-${selectedDept}-${item.id}`}
                              value={num}
                              checked={scores[item.id] === num}
                              className="hidden"
                              onChange={() => handleScoreChange(item.id, num)}
                            />
                            {num}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Observaciones */}
              <div style={{ marginTop: '32px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '8px' }}>
                  Observaciones y compromisos de mejora ({selectedDept})
                </label>
                <textarea
                  style={{
                    fontFamily: 'inherit',
                    width: '100%',
                    border: '1px solid #c6c6c6',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    color: '#000',
                    outline: 'none',
                    transition: 'border-color 150ms ease',
                    resize: 'vertical',
                  }}
                  rows="4"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Escriba aquí los aspectos cualitativos, fortalezas o áreas que requieren refuerzo..."
                  onFocus={e => { e.currentTarget.style.borderColor = '#a8a8a8'; e.currentTarget.style.outline = '2px solid #a8a8a8'; e.currentTarget.style.outlineOffset = '1px'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#c6c6c6'; e.currentTarget.style.outline = 'none'; }}
                />
              </div>

              {/* Resumen y botones */}
              <div
                className="flex flex-col sm:flex-row items-center justify-between"
                style={{
                  marginTop: '32px',
                  background: '#f9fafb',
                  border: '1px solid #e2e2e2',
                  borderRadius: '8px',
                  padding: '24px',
                  gap: '16px',
                }}
              >
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>
                    Promedio de esta dimensión:
                  </span>
                  <span
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#000',
                      background: '#fff',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e2e2',
                    }}
                  >
                    {calculateAverage()} / 5.00
                  </span>
                  <span style={{ fontSize: '12px', color: '#8a8a8a' }}>
                    ({Object.keys(scores).length} de {criteria.length} calificados)
                  </span>
                </div>

                <div className="flex" style={{ gap: '8px' }}>
                  {/* Botón secondary */}
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard-seguimiento')}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#000',
                      background: '#fff',
                      border: '1px solid #c6c6c6',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      transition: 'border-color 150ms ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#000'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#c6c6c6'}
                    onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseUp={e => e.currentTarget.style.opacity = '1'}
                  >
                    Volver al Dashboard
                  </button>
                  {/* Botón primary */}
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#000',
                      background: '#c6c6c6',
                      border: '1px solid transparent',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      cursor: saving ? 'default' : 'pointer',
                      opacity: saving ? 0.4 : 1,
                      transition: 'background 150ms ease, color 150ms ease, opacity 150ms ease',
                    }}
                    onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = '#c6c6c6'; e.currentTarget.style.color = '#000'; } }}
                    onMouseDown={e => { if (!saving) e.currentTarget.style.opacity = '0.7'; }}
                    onMouseUp={e => { if (!saving) e.currentTarget.style.opacity = '1'; }}
                  >
                    {saving ? 'Guardando...' : 'Guardar evaluación'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal del Reporte en PDF */}
        {showReportModal && (
          <ModalReporteSeguimiento
            advisor={advisor}
            defaultMonth={parseInt(month)}
            onClose={() => setShowReportModal(false)}
            evaluatorName={activeName}
          />
        )}
      </div>
    </div>
  );
}
