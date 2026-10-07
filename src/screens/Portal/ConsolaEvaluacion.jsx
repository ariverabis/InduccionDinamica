import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ResumenEvaluaciones } from './ResumenEvaluaciones';
import ReporteNotas from './ReporteNotas';
import AsignacionActividadesCalleModal from '../../components/Acompanamiento/AsignacionActividadesCalleModal';
import FormularioAcompanamientoCalle from '../../components/Acompanamiento/FormularioAcompanamientoCalle';
import GestionBuddiesYActividades from '../../components/Acompanamiento/GestionBuddiesYActividades';
import CartaEvaluacionPDF from './CartaEvaluacionPDF';

const DISPONIBLE_SKILLS_TAGS = [
  { category: 'Ventas y Comercial', icon: '💼', tags: ['Ventas de Campo', 'Televentas', 'Ventas B2B', 'Ventas de Consumo Masivo', 'Negociación Comercial'] },
  { category: 'Mercadeo y Promoción', icon: '📈', tags: ['Trade Marketing', 'Estrategia de Mercadeo', 'Promociones', 'Análisis de Clientes'] },
  { category: 'Supervisión y Liderazgo', icon: '👥', tags: ['Supervisión de Personal', 'Liderazgo de Equipos', 'Gestión Comercial', 'Coaching/Capacitación'] },
  { category: 'Habilidades Blandas', icon: '🗣️', tags: ['Comunicación Asertiva', 'Proactividad', 'Resolución de Conflictos', 'Empatía', 'Trabajo Bajo Presión'] }
];

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
      console.error("Error parsing JSON for observacion_cualitativa:", e);
    }
  }

  // Fallback for legacy plain text
  return {
    ...defaultState,
    observacion_global: raw,
    imagen_personal: { ...defaultState.imagen_personal, observaciones: raw }
  };
};

// Helper para identificar si un módulo/submódulo corresponde a evaluación de SKUs
export const isSkuModule = (sm) => {
  if (!sm) return false;
  const nombre = (sm.nombre_tarea || sm.nombre || '').toLowerCase();
  const area = (sm.area_tecnica || '').toLowerCase();
  return (
    nombre.includes('cuestionario de sku') ||
    nombre.includes('cuestionario de los sku') ||
    nombre.includes('cuestionario skus') ||
    (nombre.includes('sku') && (nombre.includes('evalua') || nombre.includes('cuestionario') || nombre.includes('examen') || nombre.includes('prueba'))) ||
    (area.includes('sku') && (nombre.includes('cuestionario') || nombre.includes('evalua') || nombre.includes('examen')))
  );
};

// Sub-componente para mostrar y calificar una entrega de Roleplay
const getGoogleDriveThumbnail = (url) => {
  if (!url) return null;
  if (!url.includes('drive.google.com')) return url;
  
  let id = '';
  if (url.includes('id=')) {
    id = url.split('id=')[1].split('&')[0];
  } else if (url.includes('/file/d/')) {
    id = url.split('/file/d/')[1].split('/')[0];
  }
  
  return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
};

const parseDateForSort = (as) => {
  if (!as) return 0;
  if (as.fecha_ingreso && typeof as.fecha_ingreso === 'string') {
    const trimmed = as.fecha_ingreso.trim();
    const slashParts = trimmed.split('/');
    if (slashParts.length === 3) {
      const d = parseInt(slashParts[0], 10);
      const m = parseInt(slashParts[1], 10) - 1;
      const y = parseInt(slashParts[2], 10);
      const date = new Date(y, m, d);
      if (!isNaN(date.getTime())) return date.getTime();
    }
    const dashParts = trimmed.split('-');
    if (dashParts.length === 3) {
      if (dashParts[0].length === 4) {
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) return date.getTime();
      } else {
        const d = parseInt(dashParts[0], 10);
        const m = parseInt(dashParts[1], 10) - 1;
        const y = parseInt(dashParts[2], 10);
        const date = new Date(y, m, d);
        if (!isNaN(date.getTime())) return date.getTime();
      }
    }
    const fallbackDate = new Date(trimmed);
    if (!isNaN(fallbackDate.getTime())) return fallbackDate.getTime();
  }
  if (as.created_at) {
    const cDate = new Date(as.created_at);
    if (!isNaN(cDate.getTime())) return cDate.getTime();
  }
  return 0;
};

const getApellido = (as) => {
  if (!as) return '';
  if (as.apellido && typeof as.apellido === 'string') return as.apellido.trim();
  if (!as.nombre) return '';
  const str = as.nombre.trim();
  if (str.includes(',')) {
    return str.split(',')[0].trim();
  }
  const parts = str.split(/\s+/);
  if (parts.length > 1) {
    return parts.slice(1).join(' ');
  }
  return str;
};

const getPrimerNombre = (as) => {
  if (!as || !as.nombre) return '';
  const str = as.nombre.trim();
  if (str.includes(',')) {
    return str.split(',')[1]?.trim() || str;
  }
  const parts = str.split(/\s+/);
  return parts[0] || str;
};

// Helper para recalcular la nota de un asesor cuando cambia la ponderación de un tema
const recalcularNotaAsesor = (notaRecord, nuevoContenido) => {
  let rawComentario = notaRecord.comentario || '';
  if (!rawComentario.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(rawComentario);
    if (parsed.no_presento) return null;
    if (parsed.evaluacion_sku) return null;

    const detalleExistente = parsed.detalle_evaluacion || {};
    let notaTotal = 0;
    let pesoTotalValido = 0;
    const nuevoDetalle = {};

    (nuevoContenido || []).forEach(act => {
      let itemExistente = detalleExistente[act.actividad];
      if (!itemExistente) {
        const cleanAct = (act.actividad || '').replace(/^["']|["']$/g, '').trim();
        for (const [k, v] of Object.entries(detalleExistente)) {
          const cleanK = k.replace(/^["']|["']$/g, '').trim();
          if (cleanK === cleanAct || cleanK.includes(cleanAct) || cleanAct.includes(cleanK)) {
            itemExistente = v;
            break;
          }
        }
      }

      let notaItem = 0;
      let isNp = false;
      if (itemExistente) {
        notaItem = itemExistente.np ? 0 : (parseFloat(itemExistente.nota) || 0);
        isNp = itemExistente.np || false;
      }

      const peso = parseFloat(act.peso) || 0;
      if (!isNp) {
        pesoTotalValido += peso;
        notaTotal += (notaItem * (peso / 100));
      }
      nuevoDetalle[act.actividad] = {
        nota: isNp ? null : notaItem,
        peso: peso,
        np: isNp
      };
    });

    parsed.detalle_evaluacion = nuevoDetalle;
    let finalGrade = 0;
    if (pesoTotalValido > 0) {
      finalGrade = parseFloat((notaTotal / (pesoTotalValido / 100)).toFixed(2));
    }
    return {
      nota: finalGrade,
      comentario: JSON.stringify(parsed)
    };
  } catch (e) {
    console.error('Error recalculando nota:', e);
    return null;
  }
};

const EvidenciaCard = ({ evidencia, onSave, onDelete, isSaving }) => {
  const [nota, setNota] = useState(evidencia.nota_ejercicio ?? '');
  const [feedback, setFeedback] = useState(evidencia.feedback_evaluador ?? '');
  const [noPresento, setNoPresento] = useState(evidencia.no_presento ?? false);
  const escNum = evidencia.maestro_escenarios?.numero_escenario;
  const fechaStr = new Date(evidencia.fecha_entrega).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' });

  return (
    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-sm">#{escNum || '?'}</span>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-tight text-slate-800">Escenario {escNum} — {evidencia.maestro_escenarios?.empresa || 'Sin empresa'}</h4>
            <p className="text-[9px] text-slate-400 font-medium">{fechaStr}</p>
          </div>
        </div>
        {evidencia.nota_ejercicio !== null && (
          <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-[9px] font-black">Nota: {evidencia.nota_ejercicio}</span>
        )}
      </div>

      {/* Speech de ventas */}
      {evidencia.speech_ventas && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Speech de Ventas</p>
          <p className="text-xs text-slate-700 leading-relaxed italic">"{evidencia.speech_ventas}"</p>
        </div>
      )}

      {/* Botones de evidencias */}
      <div className="flex gap-3 mb-4">
        {evidencia.pdf_catalogo_url && (
          <button onClick={() => window.open(evidencia.pdf_catalogo_url, '_blank')}
            className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">
            📒 PDF Catálogo
          </button>
        )}
        {evidencia.pdf_afv_url && (
          <button onClick={() => window.open(evidencia.pdf_afv_url, '_blank')}
            className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            📱 PDF AFV
          </button>
        )}
      </div>

      {/* Calificar */}
      <div className="flex gap-3 items-end">
        <div className="w-24">
          <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Nota (0-100)</label>
          <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={noPresento}
                onChange={(e) => {
                  setNoPresento(e.target.checked);
                  if (e.target.checked) setNota('');
                }}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                id={`no-presento-${evidencia.id}`}
              />
              <label htmlFor={`no-presento-${evidencia.id}`} className="text-xs font-medium text-slate-600">
                No presentó
              </label>
            </div>
            <input
              type="number"
              min="0"
              max="100"
              value={nota}
              onChange={(e) => setNota(Math.min(100, Math.max(0, e.target.value)))}
              disabled={noPresento}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center outline-none focus:ring-1 focus:ring-indigo-400"
            />
        </div>
        <div className="flex-1">
          <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Feedback</label>
          <input
            type="text" value={feedback} placeholder="Comentario para el asesor..."
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <button
          onClick={() => onSave(evidencia.id, nota, feedback, noPresento)}
          disabled={isSaving || (nota === '' && !noPresento)}
          className="h-10 px-5 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40 transition-all whitespace-nowrap"
        >
          ✅ Guardar
        </button>
        <button
          onClick={() => onDelete(evidencia.id)}
          disabled={isSaving}
          className="h-10 px-4 bg-red-50 text-red-600 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-red-100 disabled:opacity-40 transition-all whitespace-nowrap border border-red-100"
          title="Eliminar evidencia enviada"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

// Helper para calcular la fecha de inicio en calle (fecha de ingreso + 18 días)
const calcularFechaInicioCalle = (fechaIngresoStr) => {
  if (!fechaIngresoStr || typeof fechaIngresoStr !== 'string') return null;
  const trimmed = fechaIngresoStr.trim();
  let date = null;
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      let y = parseInt(parts[2], 10);
      if (y < 100) y += 2000;
      date = new Date(y, m, d);
    }
  } else if (trimmed.includes('-')) {
    const dashParts = trimmed.split('-');
    if (dashParts[0].length === 4) {
      date = new Date(trimmed);
    } else {
      const d = parseInt(dashParts[0], 10);
      const m = parseInt(dashParts[1], 10) - 1;
      const y = parseInt(dashParts[2], 10);
      date = new Date(y, m, d);
    }
  } else {
    date = new Date(trimmed);
  }
  
  if (date && !isNaN(date.getTime())) {
    date.setDate(date.getDate() + 18);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
  return null;
};

const calcularHitosEvaluacion = (fechaIngreso) => {
  if (!fechaIngreso) return null;
  const time = parseDateForSort({ fecha_ingreso: fechaIngreso });
  if (!time) return null;
  const fecha = new Date(time);
  
  const hitos = {};
  for (let i = 1; i <= 6; i++) {
    const fechaHito = new Date(fecha);
    fechaHito.setMonth(fechaHito.getMonth() + i);
    hitos[`mes${i}`] = fechaHito;
  }
  return hitos;
};

const obtenerEstadoHito = (fechaHito) => {
  const hoy = new Date();
  const diferenciaDias = (fechaHito - hoy) / (1000 * 60 * 60 * 24);
  
  if (diferenciaDias < 0) return { texto: 'Vencido', color: '#d32f2f', bg: 'rgba(211,47,47,.1)' }; 
  if (diferenciaDias <= 7) return { texto: 'Próximo', color: '#ed6c02', bg: 'rgba(237,108,2,.1)' };
  return { texto: 'A tiempo', color: '#666666', bg: '#f3f4f6' };
};

const TimelineMeses = ({ asesor }) => {
  if (!asesor?.fecha_ingreso) return null;
  
  const fechaInicioCalle = asesor.fecha_inicio_calle || calcularFechaInicioCalle(asesor.fecha_ingreso) || asesor.fecha_ingreso;
  const hitos = calcularHitosEvaluacion(fechaInicioCalle);
  if (!hitos) return null;

  let evaluacionesGuardadas = {};
  try {
    if (asesor.evaluaciones_mensuales) {
      evaluacionesGuardadas = typeof asesor.evaluaciones_mensuales === 'string' ? JSON.parse(asesor.evaluaciones_mensuales) : asesor.evaluaciones_mensuales;
    }
  } catch (e) {}

  return (
    <div style={{ marginTop: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e2e2', padding: '16px' }}>
      <h3 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#000000', marginBottom: '12px', letterSpacing: '0.05em' }}>
        Acompañamiento - Primeros 6 Meses
      </h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5, 6].map(m => {
          const completado = evaluacionesGuardadas[`mes${m}`]?.completada;
          const hitoFecha = hitos[`mes${m}`];
          const estado = completado ? { texto: 'Completado', color: '#2e7d32', bg: 'rgba(46,125,50,.1)' } : obtenerEstadoHito(hitoFecha);
          
          return (
            <div key={m} style={{ flex: 1, minWidth: '80px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#666' }}>MES {m}</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#000' }}>
                {hitoFecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
              </div>
              <div style={{ fontSize: '9px', fontWeight: '700', color: estado.color, background: estado.bg, padding: '4px 8px', borderRadius: '4px', textAlign: 'center', textTransform: 'uppercase' }}>
                {estado.texto}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ConsolaEvaluacion = ({ user, onBack, onLogout }) => {
  const [viewMode, setViewMode] = useState('manual'); // 'manual' | 'automatico' | 'escenarios' | 'reportes'
  const [asesores, setAsesores] = useState([]);
  const [departamento, setDepartamento] = useState(null);
  const [todosLosDepartamentos, setTodosLosDepartamentos] = useState([]);
  const [submodulos, setSubmodulos] = useState([]);
  const [selectedAsesor, setSelectedAsesor] = useState(null);
  const [itinerarioActual, setItinerarioActual] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState({});
  const [notasAutomaticas, setNotasAutomaticas] = useState([]);
  const [searchTermAuto, setSearchTermAuto] = useState('');
  const [searchTermAsesores, setSearchTermAsesores] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [asesorSortKey, setAsesorSortKey] = useState('fecha');
  const [asesorSortDir, setAsesorSortDir] = useState('desc');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_sincronizacion', direction: 'desc' });
  
  // Estados para activación de itinerario e historial
  const [showAltaModal, setShowAltaModal] = useState(false);
  const [candidatoAlta, setCandidatoAlta] = useState(null);
  const [itinerarioConfig, setItinerarioConfig] = useState([]);
  const [motivoReinicio, setMotivoReinicio] = useState('');
  const [esReintento, setEsReintento] = useState(false);
  
  // Estados para Módulo de Acompañamiento en Calle
  const [showAsignacionCalleModal, setShowAsignacionCalleModal] = useState(false);
  const [showFormularioCalleModal, setShowFormularioCalleModal] = useState(false);
  const [showGestionCalleModal, setShowGestionCalleModal] = useState(false);
  
  // Estado para la carta de evaluación PDF (Sede)
  const [instrumentoConfig, setInstrumentoConfig] = useState(null);
  const [showInstrumentoModal, setShowInstrumentoModal] = useState(false);
  
  const [masterEscenarios, setMasterEscenarios] = useState({});
  const [activeCompanyEscenarios, setActiveCompanyEscenarios] = useState('Febeca');
  const [newSubmodulo, setNewSubmodulo] = useState({ nombre: '', descripcion: '', horas: '', es_interno: false, contenido: [], recursos: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [notasGuardadas, setNotasGuardadas] = useState([]);
  const [observacionGlobal, setObservacionGlobal] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('evaluacion');
  const [seguimientos, setSeguimientos] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [newSeguimiento, setNewSeguimiento] = useState({ fecha_programada: '', actividad: '' });
  const [newIncidencia, setNewIncidencia] = useState({ 
    fecha_reporte: new Date().toISOString().split('T')[0], 
    descripcion: '', 
    observacion: '', 
    recomendaciones: '', 
    requiere_seguimiento: false,
    clasificacion: 'Otros'
  });
  const [editingIncidencia, setEditingIncidencia] = useState(null);
  const [evidenciasAsesor, setEvidenciasAsesor] = useState([]);
  const [deptoSeleccionado, setDeptoSeleccionado] = useState('');
  const [responsables, setResponsables] = useState([]);
  const [todosLosEvaluadores, setTodosLosEvaluadores] = useState([]);
  const [evalSeleccionado, setEvalSeleccionado] = useState('');
  const [deptoParaAsignar, setDeptoParaAsignar] = useState('');
  const [asesorParaPromover, setAsesorParaPromover] = useState('');

  // Estados para Edición de Datos
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState(null); // 'usuario' | 'candidato'
  const [editData, setEditData] = useState({});
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [isEditingSub, setIsEditingSub] = useState(null); // ID del submodulo en edición
  const [showRecalcularModal, setShowRecalcularModal] = useState(false);
  const [pendingRecalculateData, setPendingRecalculateData] = useState(null);

  // Estados para Evaluación de Imagen Personal
  const [imagenPersonal, setImagenPersonal] = useState({
    afeitado: '',
    vestimenta: '',
    cabello: '',
    lenguaje: '',
    actitud: '',
    observaciones: ''
  });

  // Estados para Perfil de Habilidades y Experiencia (Skills Profile)
  const [cualidadesGenerales, setCualidadesGenerales] = useState({
    tags: [],
    detalle: ''
  });

  // Estados para Mantenimiento de Departamentos
  const [todosDeptos, setTodosDeptos] = useState([]);
  const [newDeptoNombre, setNewDeptoNombre] = useState('');
  const [editDeptoId, setEditDeptoId] = useState(null);
  const [editDeptoNombre, setEditDeptoNombre] = useState('');

  useEffect(() => {
    if (viewMode === 'escenarios') fetchEscenarios();
  }, [viewMode, activeCompanyEscenarios]);

  const fetchEscenarios = async () => {
    const { data } = await supabase.schema('portal_afv').from('maestro_escenarios').select('*').eq('empresa', activeCompanyEscenarios);
    const map = {};
    data?.forEach(e => map[e.numero_escenario] = e.pdf_url);
    setMasterEscenarios(map);
  };

  const handleUploadEscenario = async (num, file) => {
    if (!file) return;
    setIsSaving(true);
    setMessage('Subiendo archivo...');
    try {
      const filePath = `${activeCompanyEscenarios}/escenario_${num}.pdf`;
      console.log('[UPLOAD] Subiendo a:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('escenarios_maestros')
        .upload(filePath, file, { upsert: true, contentType: 'application/pdf' });

      if (uploadError) {
        console.error('[UPLOAD ERROR]', uploadError);
        setMessage(`Error Storage: ${uploadError.message}`);
        return;
      }

      console.log('[UPLOAD OK]', uploadData);
      const { data: { publicUrl } } = supabase.storage.from('escenarios_maestros').getPublicUrl(filePath);
      console.log('[PUBLIC URL]', publicUrl);

      const { error: dbError } = await supabase.schema('portal_afv').from('maestro_escenarios').upsert({
        empresa: activeCompanyEscenarios,
        numero_escenario: num,
        pdf_url: publicUrl
      }, { onConflict: 'empresa,numero_escenario' });

      if (dbError) {
        console.error('[DB ERROR]', dbError);
        setMessage(`Error BD: ${dbError.message}`);
        return;
      }

      setMessage(`✅ Escenario ${num} de ${activeCompanyEscenarios} guardado.`);
      fetchEscenarios();
    } catch (err) {
      console.error('[CATCH ERROR]', err);
      setMessage(`Error inesperado: ${err.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [viewMode]);

  useEffect(() => {
    if (selectedAsesor) {
      fetchItinerarioAsesor(selectedAsesor.id);
      fetchNotasAsesor(selectedAsesor.id);
      fetchEvidenciasAsesor(selectedAsesor.id);
      
      const parsedData = parseObservacionCualitativa(selectedAsesor.observacion_cualitativa);
      setObservacionGlobal(parsedData.observacion_global);
      setImagenPersonal(parsedData.imagen_personal);
      setCualidadesGenerales(parsedData.cualidades_generales);
      
      setRecomendaciones(selectedAsesor.recomendaciones || '');
      fetchSeguimientos(selectedAsesor.id);
      fetchIncidencias(selectedAsesor.id);
      setActiveSubTab('evaluacion');
      
      setEvaluaciones({}); // Limpiar estado de notas no guardadas al cambiar de asesor
    }
  }, [selectedAsesor]);

  const fetchEvidenciasAsesor = async (id) => {
    console.log('🔍 [DEBUG-EVIDENCIAS] Iniciando búsqueda...');
    console.log('   -> Para Asesor ID:', id);
    console.log('   -> Usuario actual:', user.usuario, 'Rol:', user.rol);

    const { data, error } = await supabase
      .schema('portal_afv')
      .from('ejercicios_evidencias')
      .select('*')
      .eq('id_asesor', id)
      .order('fecha_entrega', { ascending: false });

    if (error) {
      console.error('❌ [DEBUG-EVIDENCIAS] Error en consulta:', error);
      setEvidenciasAsesor([]);
      return;
    }

    console.log('📊 [DEBUG-EVIDENCIAS] Datos recibidos de la DB:', data);

    if (!data || data.length === 0) {
      console.warn('⚠️ [DEBUG-EVIDENCIAS] No se encontraron registros en ejercicios_evidencias para este ID.');
      setEvidenciasAsesor([]);
      return;
    }

    // Enriquecer con datos del escenario
    try {
      console.log('🛠️ [DEBUG-EVIDENCIAS] Enriqueciendo datos con maestro_escenarios...');
      const enriched = await Promise.all(data.map(async (ev) => {
        if (!ev.id_escenario) {
          console.log(`   - Evidencia ${ev.id} no tiene id_escenario`);
          return { ...ev, maestro_escenarios: null };
        }
        
        const { data: esc, error: escError } = await supabase
          .schema('portal_afv')
          .from('maestro_escenarios')
          .select('*')
          .eq('id', ev.id_escenario)
          .single();
        
        if (escError) console.error(`   - Error cargando escenario ${ev.id_escenario}:`, escError);
        
        return { ...ev, maestro_escenarios: esc };
      }));

      console.log('✅ [DEBUG-EVIDENCIAS] Proceso completado. Evidencias enriquecidas:', enriched.length);
      setEvidenciasAsesor(enriched);
    } catch (err) {
      console.error('💥 [DEBUG-EVIDENCIAS] Error crítico en el mapeo/enriquecimiento:', err);
      setEvidenciasAsesor(data); // Al menos mostramos los datos crudos si el enriquecimiento falla
    }
  };

  const handleSaveNotaRoleplay = async (evidenciaId, nota, feedback, noPresento) => {
    setIsSaving(true);
    try {
      const payload = {
        nota_ejercicio: noPresento ? null : parseFloat(nota),
        feedback_evaluador: feedback,
        no_presento: noPresento
      };
      const { error } = await supabase.schema('portal_afv').from('ejercicios_evidencias').update(payload).eq('id', evidenciaId);
      if (error) throw error;
      setMessage('Evaluación de Roleplay guardada.');
      fetchEvidenciasAsesor(selectedAsesor.id);
    } catch (err) { console.error(err); setMessage('Error al guardar nota.'); }
    finally { setIsSaving(false); setTimeout(() => setMessage(''), 3000); }
  };

  const handleDeleteRoleplay = async (evidenciaId) => {
    if (!window.confirm('¿Estás seguro de eliminar este escenario enviado? Esta acción no se puede deshacer.')) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.schema('portal_afv').from('ejercicios_evidencias').delete().eq('id', evidenciaId);
      if (error) throw error;
      setMessage('✅ Escenario eliminado correctamente.');
      fetchEvidenciasAsesor(selectedAsesor.id);
    } catch (err) { console.error(err); setMessage('❌ Error al eliminar escenario.'); }
    finally { setIsSaving(false); setTimeout(() => setMessage(''), 3000); }
  };

  const handleSaveQualitativeData = async (key, value) => {
    if (!selectedAsesor) return;
    setIsSaving(true);
    try {
      const currentRaw = selectedAsesor.observacion_cualitativa || '';
      let baseObj = {};
      
      const trimmed = currentRaw.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          baseObj = JSON.parse(trimmed);
        } catch (e) {
          console.error(e);
        }
      } else if (currentRaw) {
        baseObj = { observacion_global: currentRaw };
      }
      
      const updatedObj = {
        ...baseObj,
        [key]: value
      };
      
      // Sync other local values to prevent wiping them out if they are not in database yet
      if (key !== 'imagen_personal') {
        updatedObj.imagen_personal = imagenPersonal;
      }
      if (key !== 'observacion_global') {
        updatedObj.observacion_global = observacionGlobal;
      }
      if (key !== 'cualidades_generales') {
        updatedObj.cualidades_generales = cualidadesGenerales;
      }
      
      const newValue = JSON.stringify(updatedObj);
      const { error } = await supabase
        .schema('portal_afv')
        .from('usuarios')
        .update({ observacion_cualitativa: newValue })
        .eq('id', selectedAsesor.id);

      if (error) throw error;

      setMessage('✅ Datos guardados correctamente.');
      
      setAsesores(prev => prev.map(as => 
        as.id === selectedAsesor.id ? { ...as, observacion_cualitativa: newValue } : as
      ));
      setSelectedAsesor(prev => ({ ...prev, observacion_cualitativa: newValue }));
      
      if (key === 'observacion_global') setObservacionGlobal(value);
      if (key === 'cualidades_generales') setCualidadesGenerales(value);
      if (key === 'imagen_personal') setImagenPersonal(value);
      
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al guardar datos.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSaveObservacionGlobal = async () => {
    await handleSaveQualitativeData('observacion_global', observacionGlobal);
  };

  const handleSaveImagenPersonal = async () => {
    await handleSaveQualitativeData('imagen_personal', imagenPersonal);
  };

  const handleSaveCualidadesGenerales = async () => {
    await handleSaveQualitativeData('cualidades_generales', cualidadesGenerales);
  };

  const fetchSeguimientos = async (asesorId) => {
    const { data, error } = await supabase
      .schema('portal_afv')
      .from('seguimientos')
      .select('*')
      .eq('id_asesor', asesorId)
      .order('fecha_programada', { ascending: true });

    if (!error) {
      setSeguimientos(data || []);
    } else {
      console.error('Error fetching seguimientos:', error);
    }
  };

  const fetchIncidencias = async (asesorId) => {
    const { data, error } = await supabase
      .schema('portal_afv')
      .from('incidencias')
      .select('*')
      .eq('id_asesor', asesorId)
      .order('fecha_reporte', { ascending: false });

    if (!error) {
      setIncidencias(data || []);
    } else {
      console.error('Error fetching incidencias:', error);
    }
  };

  const handleSaveRecomendaciones = async () => {
    if (!selectedAsesor) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .schema('portal_afv')
        .from('usuarios')
        .update({ recomendaciones })
        .eq('id', selectedAsesor.id);

      if (error) throw error;
      setMessage('✅ Recomendaciones guardadas.');
      
      setAsesores(prev => prev.map(as => 
        as.id === selectedAsesor.id 
          ? { ...as, recomendaciones } 
          : as
      ));
      setSelectedAsesor(prev => ({ ...prev, recomendaciones }));
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al guardar recomendaciones.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCreateSeguimiento = async () => {
    if (!selectedAsesor || !newSeguimiento.fecha_programada || !newSeguimiento.actividad.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .schema('portal_afv')
        .from('seguimientos')
        .insert({
          id_asesor: selectedAsesor.id,
          fecha_programada: newSeguimiento.fecha_programada,
          actividad: newSeguimiento.actividad,
          estado: 'pendiente'
        });

      if (error) throw error;
      setMessage('✅ Actividad de seguimiento programada.');
      setNewSeguimiento({ fecha_programada: '', actividad: '' });
      fetchSeguimientos(selectedAsesor.id);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al crear seguimiento.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateSeguimiento = async (segId, estado, observacion) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .schema('portal_afv')
        .from('seguimientos')
        .update({ estado, observacion })
        .eq('id', segId);

      if (error) throw error;
      setMessage('✅ Seguimiento actualizado.');
      fetchSeguimientos(selectedAsesor.id);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al actualizar.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCreateIncidencia = async () => {
    if (!selectedAsesor || !newIncidencia.descripcion.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .schema('portal_afv')
        .from('incidencias')
        .insert({
          id_asesor: selectedAsesor.id,
          fecha_reporte: newIncidencia.fecha_reporte,
          descripcion: `[${newIncidencia.clasificacion || 'Otros'}] ${newIncidencia.descripcion}`,
          observacion: newIncidencia.observacion,
          recomendaciones: newIncidencia.recomendaciones,
          requiere_seguimiento: newIncidencia.requiere_seguimiento,
          estado_seguimiento: newIncidencia.requiere_seguimiento ? 'pendiente' : 'no_aplica'
        });

      if (error) throw error;
      setMessage('✅ Eventualidad reportada.');
      setNewIncidencia({ 
        fecha_reporte: new Date().toISOString().split('T')[0], 
        descripcion: '', 
        observacion: '', 
        recomendaciones: '', 
        requiere_seguimiento: false,
        clasificacion: 'Otros'
      });
      fetchIncidencias(selectedAsesor.id);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al reportar eventualidad.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateIncidenciaEstado = async (incId, nuevoEstado) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .schema('portal_afv')
        .from('incidencias')
        .update({ estado_seguimiento: nuevoEstado })
        .eq('id', incId);

      if (error) throw error;
      setMessage('✅ Estado de eventualidad actualizado.');
      fetchIncidencias(selectedAsesor.id);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al actualizar.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteIncidencia = async (incId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta eventualidad del historial?')) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .schema('portal_afv')
        .from('incidencias')
        .delete()
        .eq('id', incId);

      if (error) throw error;
      setMessage('🗑️ Eventualidad eliminada del historial.');
      fetchIncidencias(selectedAsesor.id);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al eliminar la eventualidad.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateIncidencia = async (incId, updatedData) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .schema('portal_afv')
        .from('incidencias')
        .update({
          fecha_reporte: updatedData.fecha_reporte,
          descripcion: `[${updatedData.clasificacion || 'Otros'}] ${updatedData.descripcion}`,
          observacion: updatedData.observacion,
          recomendaciones: updatedData.recomendaciones,
          requiere_seguimiento: updatedData.requiere_seguimiento,
          estado_seguimiento: updatedData.requiere_seguimiento ? updatedData.estado_seguimiento : 'no_aplica'
        })
        .eq('id', incId);

      if (error) throw error;
      setMessage('✅ Eventualidad actualizada con éxito.');
      setEditingIncidencia(null);
      fetchIncidencias(selectedAsesor.id);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al actualizar la eventualidad.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const fetchImageAsBase64 = async (url) => {
    try {
      const response = await fetch(url, { referrerPolicy: 'no-referrer' });
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return null;
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedAsesor) return;

    const fotoSrc = selectedAsesor.foto_url ? getGoogleDriveThumbnail(selectedAsesor.foto_url) : null;

    const today = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calcular promedio académico y avance de itinerario
    let sumGrades = 0;
    let countedSubmodules = 0;

    const gradesTableRows = itinerarioActual.map((it) => {
      const temasDepto = submodulos.filter(sm => sm.id_departamento === it.id_departamento);
      const deptoNombre = it.departamentos?.nombre || 'Departamento';
      const headerRow = `
        <tr>
          <td colspan="3" style="background-color:#1e293b; color:#ffffff; font-weight:900; font-size:9px; text-transform:uppercase; letter-spacing:1.5px; padding:8px 12px; border:none;">
            📂 ${deptoNombre}
          </td>
        </tr>
      `;
      const temaRows = temasDepto.map(sm => {
        const notaExistente = notasGuardadas.find(n => n.id_submodulo === sm.id);
        let noPresento = false;
        if (notaExistente?.comentario?.startsWith('{')) {
          try { noPresento = JSON.parse(notaExistente.comentario).no_presento || false; } catch(e){}
        }
        const nota = notaExistente?.nota || 0;

        // Detectar si todos los ítems del submodulo son NP (que causaría nota=0 sin ser realmente un 0)
        let todosNp = false;
        if (notaExistente?.comentario?.startsWith('{')) {
          try {
            const parsedCom = JSON.parse(notaExistente.comentario);
            if (parsedCom.detalle_evaluacion) {
              const detalleItems = Object.values(parsedCom.detalle_evaluacion);
              todosNp = detalleItems.length > 0 && detalleItems.every(it => it.np === true);
            }
          } catch(e) {}
        }

        if (notaExistente && !noPresento && !todosNp) {
          sumGrades += nota;
          countedSubmodules++;
        }

        let detalleTexto = '';
        if (notaExistente?.comentario?.startsWith('{')) {
          try {
            const parsed = JSON.parse(notaExistente.comentario);
            
            // Detalle especial para evaluación de SKUs
            if (parsed.evaluacion_sku) {
              const { skus_evaluados, skus_aprendidos, porcentaje } = parsed.evaluacion_sku;
              const pct = porcentaje ?? (skus_evaluados > 0 ? Math.round((skus_aprendidos / skus_evaluados) * 100) : 0);
              detalleTexto = `🎯 ${skus_aprendidos}/${skus_evaluados} SKUs aprendidos (${pct}%)`;
              if (parsed.texto && parsed.texto.trim() !== '') {
                detalleTexto += ` | <strong>Obs:</strong> ${parsed.texto.trim()}`;
              }
            } else if (parsed.detalle_evaluacion) {
              // Solo mostrar actividades que tengan NP=true o nota > 0 (significativas)
              const lineas = Object.entries(parsed.detalle_evaluacion)
                .filter(([act, d]) => d.np === true || (d.nota && parseFloat(d.nota) > 0))
                .map(([act, d]) => `${act}: ${d.np ? 'NP' : (d.nota || 0) + '/10'}`);
              detalleTexto = lineas.join(' | ');
              // Solo agregar observación si tiene texto real
              if (parsed.texto && parsed.texto.trim() !== '') {
                detalleTexto += (detalleTexto ? ' | ' : '') + `<strong>Obs:</strong> ${parsed.texto.trim()}`;
              }
            } else if (parsed.texto && parsed.texto.trim() !== '') {
              // Solo texto libre, sin variables técnicas
              detalleTexto = parsed.texto.trim();
            }
            // Si no_presento global, indicarlo limpiamente
            if (parsed.no_presento && !detalleTexto) {
              detalleTexto = 'No presentó';
            }
          } catch (e) {
            // Si el JSON está corrupto, no mostrar nada en lugar de JSON crudo
            detalleTexto = '';
          }
        } else if (notaExistente?.comentario && !notaExistente.comentario.startsWith('{')) {
          // Texto plano (registros viejos sin JSON)
          detalleTexto = notaExistente.comentario;
        }


        return `
          <tr>
            <td>${sm.nombre_tarea}</td>
            <td class="text-center font-bold">${noPresento ? 'NP' : (notaExistente ? `${nota}/10` : 'N/A')}</td>
            <td>${detalleTexto || '-'}</td>
          </tr>
        `;
      }).join('');
      return headerRow + temaRows;
    }).join('');

    const generalAverage = countedSubmodules > 0 ? (sumGrades / countedSubmodules).toFixed(1) : 'N/A';

    const followupsRows = seguimientos.map(seg => `
      <tr>
        <td class="font-mono">${seg.fecha_programada}</td>
        <td><strong>${seg.actividad}</strong></td>
        <td class="text-center">
          <span class="badge ${seg.estado === 'realizado' ? 'badge-success' : 'badge-warning'}">
            ${seg.estado === 'realizado' ? 'Realizado' : 'Pendiente'}
          </span>
        </td>
        <td>${seg.observacion || 'Sin comentarios cargados.'}</td>
      </tr>
    `).join('');

    const incidencesRows = incidencias.map(inc => {
      let clasif = 'Otros';
      let descReal = inc.descripcion || '';
      if (descReal.startsWith('[')) {
        const match = descReal.match(/^\[(.*?)\]\s*(.*)$/);
        if (match) {
          clasif = match[1];
          descReal = match[2];
        }
      }
      return `
        <tr>
          <td class="font-mono">${inc.fecha_reporte}</td>
          <td>
            <span class="badge" style="background-color: ${
              clasif === 'Mala Práctica' ? '#fee2e2' :
              clasif === 'Problema Técnico' ? '#dbeafe' :
              clasif === 'Ausencia / Tardanza' ? '#f3e8ff' :
              clasif === 'Inconveniente en Calle' ? '#ffedd5' :
              clasif === 'Reclamo de Cliente' ? '#fef9c3' : '#f1f5f9'
            }; color: ${
              clasif === 'Mala Práctica' ? '#b91c1c' :
              clasif === 'Problema Técnico' ? '#1d4ed8' :
              clasif === 'Ausencia / Tardanza' ? '#7e22ce' :
              clasif === 'Inconveniente en Calle' ? '#c2410c' :
              clasif === 'Reclamo de Cliente' ? '#a16207' : '#475569'
            }; display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: 900; margin-bottom: 4px; text-transform: uppercase;">
              ${clasif}
            </span>
            <div style="font-weight: bold; color: #1e293b;">${descReal}</div>
          </td>
          <td>${inc.observacion || '-'}</td>
          <td>${inc.recomendaciones || '-'}</td>
          <td class="text-center">
            <span class="badge ${inc.estado_seguimiento === 'resuelto' ? 'badge-success' : 'badge-danger'}">
              ${inc.estado_seguimiento === 'resuelto' ? 'Resuelto' : inc.estado_seguimiento === 'pendiente' ? 'Pendiente' : 'No Aplica'}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Por favor permite las ventanas emergentes (popups) para poder emitir el reporte PDF.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte Consolidado Onboarding - ${selectedAsesor.nombre}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            color: #0f172a;
            background-color: #ffffff;
            margin: 0;
            padding: 40px;
            font-size: 11px;
            line-height: 1.5;
          }

          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .header-table td {
            border: none;
            padding: 0;
          }
          .company-title {
            font-size: 20px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0f172a;
            margin: 0;
          }
          .report-subtitle {
            font-size: 10px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 5px;
            margin-bottom: 0;
          }
          .meta-info {
            text-align: right;
            font-size: 9px;
            color: #64748b;
            font-weight: 500;
          }
          .meta-info strong {
            color: #0f172a;
          }

          .section-title {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #ffffff;
            background-color: #0f172a;
            padding: 8px 12px;
            margin-top: 25px;
            margin-bottom: 12px;
            border-radius: 4px;
          }

          .grid-profile {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 12px 40px;
            margin-bottom: 20px;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .profile-item {
            display: flex;
            flex-direction: column;
          }
          .profile-label {
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 4px;
            letter-spacing: 0.5px;
          }
          .profile-value {
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
          }

          table.report-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
          }
          table.report-table th {
            background-color: #f1f5f9;
            color: #0f172a;
            font-weight: 900;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 0.5px;
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
            text-align: left;
          }
          table.report-table td {
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
            color: #334155;
          }
          table.report-table tr:nth-child(even) {
            background-color: #f8fafc;
          }

          .text-center { text-align: center !important; }
          .text-danger { color: #e11d48 !important; }
          .font-bold { font-weight: 700; }
          .font-mono { font-family: monospace; font-size: 9px; }

          .badge {
            display: inline-block;
            padding: 2px 6px;
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            border-radius: 4px;
            letter-spacing: 0.5px;
          }
          .badge-success { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          .badge-warning { background-color: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
          .badge-danger { background-color: #ffe4e6; color: #991b1b; border: 1px solid #fecdd3; }

          .grid-feedback {
            display: grid;
            grid-template-cols: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
          }
          .feedback-card {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .feedback-title {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0f172a;
            margin-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
          }
          .feedback-content {
            font-size: 10px;
            color: #475569;
            font-style: italic;
            white-space: pre-line;
          }

          .summary-box {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
          }
          .summary-card {
            background-color: #0f172a;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 8px;
            text-align: center;
          }
          .summary-label {
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.8;
          }
          .summary-val {
            font-size: 20px;
            font-weight: 900;
            margin-top: 2px;
          }

          .signatures-section {
            margin-top: 60px;
            display: grid;
            grid-template-cols: repeat(3, 1fr);
            gap: 40px;
            page-break-inside: avoid;
          }
          .signature-box {
            text-align: center;
            border-top: 1px solid #94a3b8;
            padding-top: 10px;
          }
          .signature-title {
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            color: #64748b;
          }
          .signature-name {
            font-size: 10px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 4px;
          }

          @media print {
            body {
              padding: 0;
            }
            .section-title {
              background-color: #0f172a !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .summary-card {
              background-color: #0f172a !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .badge-success {
              background-color: #dcfce7 !important;
              color: #166534 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .badge-warning {
              background-color: #fef9c3 !important;
              color: #854d0e !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .badge-danger {
              background-color: #ffe4e6 !important;
              color: #991b1b !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .grid-profile, .feedback-card {
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        
        <table class="header-table">
          <tr>
            <td>
              <div style="display: inline-block; font-size: 20px; font-weight: 900; background-color: #0f172a; color: #ffffff; padding: 8px 18px; border-radius: 6px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
                ${selectedAsesor.empresa || 'AFV SALES'}
              </div>
              <p class="report-subtitle">Informe Consolidado de Onboarding y Seguimiento</p>
            </td>
            <td class="meta-info">
              Fecha de Emisión: <strong>${today}</strong><br>
              Generado por: <strong>${user.nombre || user.usuario || 'Evaluador Oficial'}</strong>
            </td>
          </tr>
        </table>

        <div class="section-title">1. Ficha del Asesor de Ventas</div>
        <div class="grid-profile" style="display: flex !important; align-items: center !important; gap: 30px !important; background-color: #f8fafc !important; padding: 15px !important; border-radius: 8px !important; border: 1px solid #e2e8f0 !important; margin-bottom: 20px !important; flex-direction: row !important;">
          <div style="flex-shrink: 0 !important;">
            ${fotoSrc ? 
              `<img src="${fotoSrc}" style="width:90px; height:90px; border-radius:50%; object-fit:cover; border:3px solid #0f172a;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';" /><div style="display:none; width:90px; height:90px; border-radius:50%; background:#0f172a; color:#fff; font-size:32px; font-weight:900; text-align: center; line-height: 90px;">${selectedAsesor.nombre?.charAt(0).toUpperCase() || '?'}</div>` : 
              `<div style="width:90px; height:90px; border-radius:50%; background:#0f172a; color:#fff; font-size:32px; font-weight:900; text-align: center; line-height: 90px; display: inline-block;">${selectedAsesor.nombre?.charAt(0).toUpperCase() || '?'}</div>`
            }
          </div>
          <div style="flex: 1 !important; display: flex !important; flex-direction: column !important; gap: 12px !important;">
            <div class="profile-item" style="display: flex !important; flex-direction: column !important;">
              <span class="profile-label" style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px;">Asesor Evaluado</span>
              <span class="profile-value" style="font-size: 11px; font-weight: 700; color: #0f172a;">${selectedAsesor.nombre}</span>
            </div>
            <div class="profile-item" style="display: flex !important; flex-direction: column !important;">
              <span class="profile-label" style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px;">Correo Personal</span>
              <span class="profile-value" style="font-size: 11px; font-weight: 700; color: #0f172a;">${selectedAsesor.correo || selectedAsesor.usuario}</span>
            </div>
            <div class="profile-item" style="display: flex !important; flex-direction: column !important;">
              <span class="profile-label" style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px;">Correo Corporativo</span>
              <span class="profile-value" style="font-size: 11px; font-weight: 700; color: #0f172a;">${selectedAsesor.correo_corporativo || 'Sin asignar'}</span>
            </div>
            <div class="profile-item" style="display: flex !important; flex-direction: column !important;">
              <span class="profile-label" style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px;">Empresa / Ramo</span>
              <span class="profile-value" style="font-size: 11px; font-weight: 700; color: #0f172a;">${selectedAsesor.empresa || 'Febeca'} / ${selectedAsesor.ramo || 'Sin ramo'}</span>
            </div>
          </div>
          <div style="flex: 1 !important; display: flex !important; flex-direction: column !important; gap: 12px !important;">
            <div class="profile-item" style="display: flex !important; flex-direction: column !important;">
              <span class="profile-label" style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px;">Zona / Ubicación</span>
              <span class="profile-value" style="font-size: 11px; font-weight: 700; color: #0f172a;">${selectedAsesor.zona || 'N/A'} - ${selectedAsesor.estado || ''}</span>
            </div>
            <div class="profile-item" style="display: flex !important; flex-direction: column !important;">
              <span class="profile-label" style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px;">Teléfono</span>
              <span class="profile-value" style="font-size: 11px; font-weight: 700; color: #0f172a;">${selectedAsesor.telefono || 'Sin teléfono'}</span>
            </div>
            <div class="profile-item" style="display: flex !important; flex-direction: column !important;">
              <span class="profile-label" style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px;">Fecha de Ingreso</span>
              <span class="profile-value" style="font-size: 11px; font-weight: 700; color: #0f172a;">${selectedAsesor.fecha_ingreso || 'N/A'}</span>
            </div>
            <div class="profile-item" style="display: flex !important; flex-direction: column !important;">
              <span class="profile-label" style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px;">Inicio Calle (Real)</span>
              <span class="profile-value" style="font-size: 11px; font-weight: 700; color: #0f172a;">${selectedAsesor.fecha_inicio_calle || calcularFechaInicioCalle(selectedAsesor.fecha_ingreso) || 'N/A'}</span>
            </div>
            <div class="profile-item" style="display: flex !important; flex-direction: column !important;">
              <span class="profile-label" style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px;">Estatus General</span>
              <span class="profile-value" style="font-size: 11px; font-weight: 700; color: #0f172a;">${getAsesorStatus(selectedAsesor).label}</span>
            </div>
          </div>
        </div>

        <div class="section-title">2. Rendimiento Académico y Avance de Itinerario</div>
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 40%;">Tema / Evaluación</th>
              <th style="width: 15%;" class="text-center">Calificación</th>
              <th style="width: 45%;">Detalle / Feedback</th>
            </tr>
          </thead>
          <tbody>
            ${gradesTableRows || '<tr><td colspan="3" class="text-center">No hay registros de calificaciones guardadas.</td></tr>'}
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-card">
            <div class="summary-label">Promedio de Inducción</div>
            <div class="summary-val">${generalAverage}/10</div>
          </div>
        </div>

        <div class="section-title">3. Plan de Acompañamiento y Seguimiento Comercial en Calle</div>
        ${seguimientos.length === 0 ? `<p style="font-style: italic; color: #64748b; margin-left: 10px;">No se han programado actividades de acompañamiento comercial en calle o llamadas de seguimiento para este asesor.</p>` : `
          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 15%;">Fecha</th>
                <th style="width: 35%;">Actividad / Objetivo</th>
                <th style="width: 15%;" class="text-center">Estatus</th>
                <th style="width: 35%;">Observación y Resultado Comercial</th>
              </tr>
            </thead>
            <tbody>
              ${followupsRows}
            </tbody>
          </table>
        `}

        <div class="section-title">4. Bitácora de Eventualidades e Inconvenientes Reportados</div>
        ${incidencias.length === 0 ? `<p style="font-style: italic; color: #64748b; margin-left: 10px;">El asesor no registra ningún reporte de eventualidades, incidentes o malas prácticas comerciales.</p>` : `
          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 12%;">Fecha</th>
                <th style="width: 25%;">Descripción del Inconveniente</th>
                <th style="width: 25%;">Análisis del Evaluador</th>
                <th style="width: 23%;">Medidas Correctivas / Recomendaciones</th>
                <th style="width: 15%;" class="text-center">Seguimiento</th>
              </tr>
            </thead>
            <tbody>
              ${incidencesRows}
            </tbody>
          </table>
        `}

        <div class="section-title">5. Evaluación de Imagen Personal y Presentación</div>
        ${(() => {
          const criterios = [
            { key: 'afeitado', label: 'Afeitado e Higiene Facial' },
            { key: 'vestimenta', label: 'Vestimenta y Limpieza' },
            { key: 'cabello', label: 'Cabello y Presentación General' },
            { key: 'lenguaje', label: 'Lenguaje y Comunicación Verbal' },
            { key: 'actitud', label: 'Actitud y Postura Corporal' },
          ];
          const hayDatos = criterios.some(c => imagenPersonal[c.key]);
          if (!hayDatos && !imagenPersonal.observaciones) {
            return `<p style="font-style: italic; color: #64748b; margin-left: 10px;">No se registró evaluación de imagen personal para este asesor.</p>`;
          }
          const rows = criterios.map(({ key, label }) => {
            const val = imagenPersonal[key] || 'Sin evaluar';
            const bg = val === 'Cumple' ? '#d1fae5' : val === 'Parcialmente' ? '#fef3c7' : val === 'No Cumple' ? '#fee2e2' : '#f1f5f9';
            const color = val === 'Cumple' ? '#065f46' : val === 'Parcialmente' ? '#92400e' : val === 'No Cumple' ? '#991b1b' : '#475569';
            return `<tr>
              <td><strong>${label}</strong></td>
              <td class="text-center"><span style="background:${bg}; color:${color}; padding:3px 10px; border-radius:6px; font-weight:900; font-size:9px; text-transform:uppercase;">${val}</span></td>
            </tr>`;
          }).join('');
          return `
            <table class="report-table" style="margin-bottom:10px;">
              <thead><tr><th style="width:70%;">Criterio de Presentación</th><th style="width:30%;" class="text-center">Valoración</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
            ${imagenPersonal.observaciones ? `<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; margin-top:8px; font-size:10px;"><strong>Observaciones adicionales:</strong> ${imagenPersonal.observaciones}</div>` : ''}
          `;
        })()}

        <div class="section-title">6. Conclusión y Recomendaciones Finales</div>
        <div class="grid-feedback">
          <div class="feedback-card">
            <div class="feedback-title">Perfil de Habilidades y Experiencia</div>
            <div class="feedback-content">
              ${(() => {
                const tagsList = cualidadesGenerales.tags && cualidadesGenerales.tags.length > 0 
                  ? cualidadesGenerales.tags.map(t => {
                      let bg = '#f1f5f9';
                      let color = '#475569';
                      if (DISPONIBLE_SKILLS_TAGS[0].tags.includes(t)) { bg = '#dbeafe'; color = '#1d4ed8'; }
                      else if (DISPONIBLE_SKILLS_TAGS[1].tags.includes(t)) { bg = '#d1fae5'; color = '#065f46'; }
                      else if (DISPONIBLE_SKILLS_TAGS[2].tags.includes(t)) { bg = '#f3e8ff'; color = '#7e22ce'; }
                      else if (DISPONIBLE_SKILLS_TAGS[3].tags.includes(t)) { bg = '#fef3c7'; color = '#92400e'; }
                      
                      return `<span style="background:${bg}; color:${color}; display:inline-block; padding:2px 6px; border-radius:4px; font-size:8px; font-weight:700; margin: 2px; text-transform:uppercase;">${t}</span>`;
                    }).join(' ')
                  : '<span style="color:#94a3b8; font-style:italic;">Sin competencias destacadas.</span>';
                
                const detailText = cualidadesGenerales.detalle 
                  ? `<div style="margin-top:10px; border-top:1px dashed #e2e8f0; padding-top:8px;">${cualidadesGenerales.detalle}</div>`
                  : '';
                
                return `<div>${tagsList}</div>${detailText}`;
              })()}
            </div>
          </div>
          <div class="feedback-card">
            <div class="feedback-title">Observación Cualitativa Global</div>
            <div class="feedback-content">${observacionGlobal || 'Sin observaciones globales registradas.'}</div>
          </div>
          <div class="feedback-card">
            <div class="feedback-title">Recomendaciones del Evaluador</div>
            <div class="feedback-content">${recomendaciones || 'Sin recomendaciones generales registradas.'}</div>
          </div>
        </div>

        <div class="signatures-section">
          <div class="signature-box">
            <div class="signature-name">${user.nombre || user.usuario || 'Evaluador Oficial'}</div>
            <div class="signature-title">Firma del Evaluador</div>
          </div>
          <div class="signature-box">
            <div style="height: 12px;"></div>
            <div class="signature-title">Firma de Supervisión Comercial</div>
          </div>
          <div class="signature-box">
            <div class="signature-name">${selectedAsesor.nombre}</div>
            <div class="signature-title">Firma de Conformidad del Asesor</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 800);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const { data: evalAuthList, error: evalAuthError } = await supabase
        .schema('portal_afv')
        .from('evaluadores_autorizados')
        .select('*, departamentos(*)')
        .ilike('email', user.usuario.trim());

      if (evalAuthError) console.warn('Error fetching evaluador auth:', evalAuthError);
      const evalAuth = evalAuthList && evalAuthList.length > 0 ? evalAuthList[0] : null;

      const deptoParaCarga = evalAuth?.departamentos || (user.rol === 'admin' ? { id: null, nombre: 'Admin Global' } : null);
      setDepartamento(deptoParaCarga);
      const { data: deptos } = await supabase.schema('portal_afv').from('departamentos').select('*').order('nombre', { ascending: true });
      setTodosLosDepartamentos(deptos || []);

      if (viewMode === 'manual' || viewMode === 'configuracion') {
        let queryAsesores = supabase.schema('portal_afv').from('usuarios').select(`
          *,
          itinerarios_induccion(*),
          notas_por_submodulo(*)
        `).eq('rol', 'asesor').order('created_at', { ascending: false });
        
        // Si es evaluador, solo ve asesores de SU empresa
        if (user.rol === 'evaluador' && user.empresa) {
          queryAsesores = queryAsesores.ilike('empresa', user.empresa.trim());
        }
        
        const { data: listaAsesores } = await queryAsesores;
        const sortedList = (listaAsesores || []).sort((a, b) => parseDateForSort(b) - parseDateForSort(a));
        setAsesores(sortedList);

        // Carga todos los temas para poder ver cualquier itinerario y calcular el estatus correctamente
        let queryTemas = supabase.schema('portal_afv').from('submodulos_finales').select('*');
        const { data: listaSub } = await queryTemas;
        setSubmodulos(listaSub || []);
      } else if (viewMode === 'automatico') {
        const { data: autoData } = await supabase.schema('portal_afv').from('import_respuestas_excel').select('*').order('fecha_sincronizacion', { ascending: false });
        setNotasAutomaticas(autoData || []);
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const fetchNotasAsesor = async (asesorId) => {
    const { data } = await supabase.schema('portal_afv').from('notas_por_submodulo').select('*').eq('id_asesor', asesorId);
    setNotasGuardadas(data || []);
  };

  const fetchItinerarioAsesor = async (asesorId) => {
    // Buscamos el itinerario del INTENTO MÁS RECIENTE
    const { data: itins } = await supabase.schema('portal_afv').from('itinerarios_induccion').select('intento').eq('id_asesor', asesorId).order('intento', { ascending: false }).limit(1);
    const maxIntento = itins && itins.length > 0 ? itins[0].intento : 1;

    const { data } = await supabase.schema('portal_afv').from('itinerarios_induccion').select('*, departamentos(*)').eq('id_asesor', asesorId).eq('intento', maxIntento).order('orden', { ascending: true });
    setItinerarioActual(data || []);
  };

  const checkExistenciaCandidato = async (email, shouldPopulate = false) => {
    const { data } = await supabase.schema('portal_afv').from('usuarios').select('id').eq('usuario', email).single();
    if (data) {
        setEsReintento(true);
        // Obtener último intento para saber cuál sigue
        const { data: itins } = await supabase.schema('portal_afv').from('itinerarios_induccion').select('intento').eq('id_asesor', data.id).order('intento', { ascending: false }).limit(1);
        const maxIntento = itins && itins.length > 0 ? itins[0].intento : 0;
        
        if (shouldPopulate && maxIntento > 0) {
            const { data: currentItin } = await supabase.schema('portal_afv').from('itinerarios_induccion').select('*').eq('id_asesor', data.id).eq('intento', maxIntento);
            if (currentItin) {
                setItinerarioConfig(currentItin.map(i => ({ id_depto: i.id_departamento, dias: i.duracion_dias })));
            }
        }
        
        return maxIntento;
    }
    setEsReintento(false);
    if (shouldPopulate) setItinerarioConfig([]);
    return 0;
  };

  const calcularNotaFinal = (sm, evalState, notaExistente) => {
    let parsedExistente = null;
    if (notaExistente?.comentario?.startsWith('{')) {
      try { parsedExistente = JSON.parse(notaExistente.comentario); } catch(e){}
    }

    const isSku = isSkuModule(sm) || evalState?.isSku || !!parsedExistente?.evaluacion_sku;

    // Caso Especial: Módulo o tema de SKUs sin contenido subdividido
    if (isSku && (!sm.contenido || sm.contenido.length === 0)) {
      const evaluadosVal = evalState?.skusEvaluados !== undefined
        ? evalState.skusEvaluados
        : (parsedExistente?.evaluacion_sku?.skus_evaluados ?? '');

      const aprendidosVal = evalState?.skusAprendidos !== undefined
        ? evalState.skusAprendidos
        : (parsedExistente?.evaluacion_sku?.skus_aprendidos ?? '');

      let notaCalculada = 0;
      let evaluacionSku = null;

      if (evaluadosVal !== '' && aprendidosVal !== '') {
        const numEval = Math.max(0, parseFloat(evaluadosVal) || 0);
        const numApr = Math.max(0, parseFloat(aprendidosVal) || 0);
        const pct = numEval > 0 ? Math.min(100, Math.round((numApr / numEval) * 100)) : 0;
        notaCalculada = numEval > 0 ? parseFloat(Math.min(10, (numApr / numEval) * 10).toFixed(2)) : 0;

        evaluacionSku = {
          skus_evaluados: numEval,
          skus_aprendidos: numApr,
          porcentaje: pct
        };
      } else if (evalState?.nota !== undefined) {
        notaCalculada = parseFloat(evalState.nota) || 0;
      } else if (notaExistente?.nota !== undefined && notaExistente?.nota !== null) {
        notaCalculada = parseFloat(notaExistente.nota) || 0;
      }

      const obsFinal = evalState?.obs !== undefined
        ? evalState.obs
        : (parsedExistente
            ? (parsedExistente.texto || '')
            : (notaExistente?.comentario?.startsWith('{') ? '' : (notaExistente?.comentario || '')));
      return { 
        nota: parseFloat(notaCalculada.toFixed(2)), 
        detalle: null, 
        obs: obsFinal, 
        evaluacionSku 
      };
    }

    if (!sm.contenido || sm.contenido.length === 0) {
      const defaultNota = notaExistente?.nota !== undefined && notaExistente?.nota !== null ? notaExistente.nota : 0;
      // Si ya existe un registro JSON, usar solo .texto; nunca el JSON crudo completo
      let obsFallback = '';
      if (notaExistente?.comentario) {
        if (notaExistente.comentario.startsWith('{')) {
          try { obsFallback = JSON.parse(notaExistente.comentario).texto || ''; } catch(e) {}
        } else {
          obsFallback = notaExistente.comentario;
        }
      }
      return { 
        nota: parseFloat(evalState?.nota !== undefined ? evalState.nota : defaultNota) || 0, 
        detalle: null, 
        obs: evalState?.obs !== undefined ? evalState.obs : obsFallback,
        evaluacionSku: null
      };
    }
    let notaTotal = 0;
    let pesoTotalValido = 0;
    const detalle = {};
    
    sm.contenido.forEach((act, idx) => {
       let notaItem = 0;
       let isNp = false;
       if (evalState?.notas && evalState.notas[idx] !== undefined) {
          notaItem = parseFloat(evalState.notas[idx]) || 0;
          isNp = evalState.notasNP?.[idx] || false;
       } else if (parsedExistente?.detalle_evaluacion?.[act.actividad]) {
          notaItem = parseFloat(parsedExistente.detalle_evaluacion[act.actividad].nota) || 0;
          isNp = parsedExistente.detalle_evaluacion[act.actividad].np || false;
       }
       if (evalState?.notasNP && evalState.notasNP[idx] !== undefined) {
          isNp = evalState.notasNP[idx];
       }
       if (isNp) notaItem = 0;
       
       const peso = parseFloat(act.peso) || 0;
       if (!isNp) {
         pesoTotalValido += peso;
         notaTotal += (notaItem * (peso / 100));
       }
       detalle[act.actividad] = { nota: isNp ? null : notaItem, peso: peso, np: isNp };
    });
    
    let notaFinal = 0;
    if (pesoTotalValido > 0) {
      notaFinal = parseFloat((notaTotal / (pesoTotalValido / 100)).toFixed(2));
    }
    
    const obsFinal = evalState?.obs !== undefined
      ? evalState.obs
      : (parsedExistente
          ? (parsedExistente.texto || '')
          : (notaExistente?.comentario?.startsWith('{') ? '' : (notaExistente?.comentario || '')));
    return { nota: notaFinal, detalle, obs: obsFinal, evaluacionSku: null };
  };

  const handleSaveNota = async (sm, evalState, notaExistente) => {
    if (!selectedAsesor || itinerarioActual.length === 0) return;
    
    const { nota, detalle, obs, evaluacionSku } = calcularNotaFinal(sm, evalState, notaExistente);
    if (nota > 10) {
      setMessage('⚠️ La nota no puede superar los 10 puntos.');
      setTimeout(() => setMessage(''), 4000);
      return;
    }
    
    setIsSaving(true);
    const isNoPresento = evalState?.noPresento || false;
    let comentarioObj = {
      texto: obs,
      no_presento: isNoPresento
    };
    if (detalle) {
      comentarioObj.detalle_evaluacion = detalle;
    }
    if (evaluacionSku) {
      comentarioObj.evaluacion_sku = evaluacionSku;
    }
    const comentarioFinal = JSON.stringify(comentarioObj);

    const payload = {
      id_asesor: selectedAsesor.id,
      id_submodulo: sm.id,
      email_evaluador: user.usuario,
      nota: isNoPresento ? null : nota,
      comentario: comentarioFinal,
      intento: itinerarioActual[0].intento
    };

    console.log('📤 Enviando nota a Supabase:', payload);

    try {
      const { error } = await supabase.schema('portal_afv').from('notas_por_submodulo').upsert([payload], { onConflict: 'id_asesor,id_submodulo,intento' });

      if (error) {
          console.error("Error al guardar nota:", error);
          setMessage('Error: ' + (error.message || 'No se pudo guardar'));
      } else {
          setMessage('Evaluación registrada.');
          fetchNotasAsesor(selectedAsesor.id); 
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { 
      setMessage('Error de conexión.'); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleSaveAllNotas = async () => {
    if (!selectedAsesor || itinerarioActual.length === 0) return;
    
    // Validamos que ninguna nota pase de 10
    const notasInvalidas = Object.keys(evaluaciones).some(id => {
       const evalItem = evaluaciones[id];
       if (evalItem.notas) return evalItem.notas.some(n => parseFloat(n) > 10);
       return parseFloat(evalItem.nota) > 10;
    });
    if (notasInvalidas) {
      setMessage('⚠️ Hay notas mayores a 10. Por favor rectifíquelas.');
      setTimeout(() => setMessage(''), 4000);
      return;
    }

    // Filtramos y calculamos payloads
    const payloads = Object.keys(evaluaciones).map(id => {
        const sm = submodulos.find(s => s.id == id);
        if(!sm) return null;
        const notaExistente = notasGuardadas.find(n => n.id_submodulo === sm.id);
        const { nota, detalle, obs, evaluacionSku } = calcularNotaFinal(sm, evaluaciones[id], notaExistente);
        
        const isNoPresento = evaluaciones[id]?.noPresento || false;
        let comentarioObj = {
          texto: obs,
          no_presento: isNoPresento
        };
        if (detalle) {
          comentarioObj.detalle_evaluacion = detalle;
        }
        if (evaluacionSku) {
          comentarioObj.evaluacion_sku = evaluacionSku;
        }
        const comentarioFinal = JSON.stringify(comentarioObj);

        return {
          id_asesor: selectedAsesor.id,
          id_submodulo: id,
          email_evaluador: user.usuario,
          nota: isNoPresento ? null : nota,
          comentario: comentarioFinal,
          intento: itinerarioActual[0].intento
        };
    }).filter(p => p !== null);

    if (payloads.length === 0) {
      setMessage('No hay notas nuevas para guardar.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.schema('portal_afv').from('notas_por_submodulo').upsert(payloads, { onConflict: 'id_asesor,id_submodulo,intento' });
      
      if (error) throw error;

      setMessage(`¡Éxito! Se guardaron ${payloads.length} evaluaciones.`);
      fetchNotasAsesor(selectedAsesor.id);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error al guardar las notas.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDesactivarAsesor = async () => {
    if (!selectedAsesor) return;
    if (!window.confirm('¿Estás seguro de que deseas desactivar a este asesor? Ya no aparecerá en la lista de activos.')) return;
    setIsSaving(true);
    const { error } = await supabase.schema('portal_afv').from('usuarios').update({ rol: 'inactivo' }).eq('id', selectedAsesor.id);
    if (!error) {
        setMessage('Asesor desactivado.');
        setSelectedAsesor(null);
        fetchInitialData();
    } else {
        setMessage('Error al desactivar asesor.');
    }
    setIsSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteInduccion = async () => {
    if (!selectedAsesor) return;
    if (!window.confirm(`¿ESTÁ SEGURO? Se borrará TODO el historial (notas e itinerarios) de ${selectedAsesor.nombre}. Esta acción no se puede deshacer.`)) return;
    
    setIsSaving(true);
    try {
      // 1. Borrar Notas
      await supabase.schema('portal_afv').from('notas_por_submodulo').delete().eq('id_asesor', selectedAsesor.id);
      // 2. Borrar Itinerarios
      await supabase.schema('portal_afv').from('itinerarios_induccion').delete().eq('id_asesor', selectedAsesor.id);
      
      setMessage('Todo el historial ha sido eliminado.');
      setSelectedAsesor(null);
      fetchInitialData();
    } catch (err) {
      setMessage('Error al eliminar el historial.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubmodulo = async () => {
    if (!departamento || !newSubmodulo.nombre) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.schema('portal_afv').from('submodulos_finales').insert([{
        nombre_tarea: newSubmodulo.nombre,
        descripcion: newSubmodulo.descripcion,
        duracion_horas: newSubmodulo.horas,
        id_departamento: departamento.id,
        es_interno: newSubmodulo.es_interno,
        contenido: newSubmodulo.contenido,
        recursos: newSubmodulo.recursos
      }]);
      if (error) throw error;
      setMessage('Tema guardado con éxito.');
      setNewSubmodulo({ nombre: '', descripcion: '', horas: '', es_interno: false });
      fetchInitialData();
    } catch (err) {
      console.error(err);
      setMessage('Error al guardar tema.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateSubmodulo = async () => {
    if (!newSubmodulo.nombre || !isEditingSub) return;
    setIsSaving(true);
    try {
      const subOriginal = submodulos.find(s => s.id === isEditingSub);
      
      // Comprobar si cambiaron actividades o ponderaciones
      let pesosCambiaron = false;
      if (subOriginal) {
        const oldCont = subOriginal.contenido || [];
        const newCont = newSubmodulo.contenido || [];
        if (oldCont.length !== newCont.length) {
          pesosCambiaron = true;
        } else {
          for (let i = 0; i < newCont.length; i++) {
            if (oldCont[i]?.actividad !== newCont[i]?.actividad) pesosCambiaron = true;
            if (parseFloat(oldCont[i]?.peso || 0) !== parseFloat(newCont[i]?.peso || 0)) pesosCambiaron = true;
          }
        }
      }

      if (pesosCambiaron) {
        // Verificar si hay notas asociadas a este tema
        const { data: notasAfectadas, error: fetchErr } = await supabase
          .schema('portal_afv')
          .from('notas_por_submodulo')
          .select('id, id_asesor, nota, comentario, usuarios(nombre)')
          .eq('id_submodulo', isEditingSub);

        if (!fetchErr && notasAfectadas && notasAfectadas.length > 0) {
          setPendingRecalculateData({
            submoduloId: isEditingSub,
            submoduloNombre: newSubmodulo.nombre,
            updatedData: { ...newSubmodulo },
            notasAfectadas
          });
          setShowRecalcularModal(true);
          setIsSaving(false);
          return;
        }
      }

      // Si no cambiaron pesos o no hay notas existentes, guardar directo
      await executeSaveSubmodulo(false);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al verificar tema: ' + err.message);
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const executeSaveSubmodulo = async (shouldRecalculate) => {
    setIsSaving(true);
    try {
      const targetSubId = pendingRecalculateData?.submoduloId || isEditingSub;
      const targetData = pendingRecalculateData?.updatedData || newSubmodulo;
      const notasAfectadas = pendingRecalculateData?.notasAfectadas || [];

      // 1. Actualizar el submodulo en submodulos_finales
      const { error: updateSubErr } = await supabase.schema('portal_afv').from('submodulos_finales').update({
        nombre_tarea: targetData.nombre,
        descripcion: targetData.descripcion,
        duracion_horas: targetData.horas,
        es_interno: targetData.es_interno,
        contenido: targetData.contenido,
        recursos: targetData.recursos
      }).eq('id', targetSubId);

      if (updateSubErr) throw updateSubErr;

      // 2. Si el usuario decidió recalcular todas las notas existentes
      let recalculadasCount = 0;
      if (shouldRecalculate && notasAfectadas.length > 0) {
        for (const n of notasAfectadas) {
          const resultado = recalcularNotaAsesor(n, targetData.contenido || []);
          if (resultado) {
            await supabase.schema('portal_afv').from('notas_por_submodulo').update({
              nota: resultado.nota,
              comentario: resultado.comentario
            }).eq('id', n.id);
            recalculadasCount++;
          }
        }
      }

      if (shouldRecalculate && recalculadasCount > 0) {
        setMessage(`✅ Tema guardado y ${recalculadasCount} notas recalculadas correctamente.`);
      } else {
        setMessage('✅ Tema actualizado con éxito.');
      }

      setNewSubmodulo({ nombre: '', descripcion: '', horas: '', es_interno: false, contenido: [], recursos: '' });
      setIsEditingSub(null);
      setShowRecalcularModal(false);
      setPendingRecalculateData(null);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al actualizar tema: ' + err.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleDeleteSubmodulo = async (id) => {
    if (!window.confirm('Eliminar este tema? Esta accion no se puede deshacer.')) return;
    const { error } = await supabase.schema('portal_afv').from('submodulos_finales').delete().eq('id', id);
    if (!error) { fetchInitialData(); setMessage('Tema eliminado.'); setTimeout(() => setMessage(''), 3000); }
    else { setMessage('Error al eliminar.'); setTimeout(() => setMessage(''), 3000); }
  };

  // ===== CRUD DEPARTAMENTOS =====
  const fetchDepartamentos = async () => {
    const { data } = await supabase.schema('portal_afv').from('departamentos').select('*').order('nombre', { ascending: true });
    setTodosDeptos(data || []);
  };

  const handleCreateDepto = async () => {
    if (!newDeptoNombre.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.schema('portal_afv').from('departamentos').insert([{ nombre: newDeptoNombre.trim() }]);
      if (error) throw error;
      setMessage('✅ Departamento creado.');
      setNewDeptoNombre('');
      fetchDepartamentos();
      // Refrescar la lista global también
      const { data: deptos } = await supabase.schema('portal_afv').from('departamentos').select('*').order('nombre', { ascending: true });
      setTodosLosDepartamentos(deptos || []);
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateDepto = async (id) => {
    if (!editDeptoNombre.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.schema('portal_afv').from('departamentos').update({ nombre: editDeptoNombre.trim() }).eq('id', id);
      if (error) throw error;
      setMessage('✅ Departamento actualizado.');
      setEditDeptoId(null);
      setEditDeptoNombre('');
      fetchDepartamentos();
      const { data: deptos } = await supabase.schema('portal_afv').from('departamentos').select('*').order('nombre', { ascending: true });
      setTodosLosDepartamentos(deptos || []);
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteDepto = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el departamento "${nombre}"?\n\nEsto también eliminará todos los temas (submodulos) asociados a este departamento. Esta acción no se puede deshacer.`)) return;
    setIsSaving(true);
    try {
      // Primero eliminamos los submodulos asociados
      await supabase.schema('portal_afv').from('submodulos_finales').delete().eq('id_departamento', id);
      // Luego el departamento
      const { error } = await supabase.schema('portal_afv').from('departamentos').delete().eq('id', id);
      if (error) throw error;
      setMessage('✅ Departamento eliminado.');
      fetchDepartamentos();
      const { data: deptos } = await supabase.schema('portal_afv').from('departamentos').select('*').order('nombre', { ascending: true });
      setTodosLosDepartamentos(deptos || []);
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };
  // ===== FIN CRUD DEPARTAMENTOS =====

  const fetchResponsables = async () => {
    const { data: evData } = await supabase.schema('portal_afv').from('evaluadores_autorizados').select('*, departamentos(nombre)');
    const { data: evUsers } = await supabase.schema('portal_afv').from('usuarios').select('id, nombre, usuario, empresa').eq('rol', 'evaluador').order('nombre', { ascending: true });
    const { data: asUsers } = await supabase.schema('portal_afv').from('usuarios').select(`
      *,
      itinerarios_induccion(*),
      notas_por_submodulo(*)
    `).eq('rol', 'asesor').order('created_at', { ascending: false });
    setResponsables(evData || []);
    setTodosLosEvaluadores(evUsers || []);
    const sortedAsUsers = (asUsers || []).sort((a, b) => parseDateForSort(b) - parseDateForSort(a));
    setAsesores(sortedAsUsers);
  };

  const formatInductionDate = (as) => {
    if (as.fecha_ingreso) return as.fecha_ingreso;
    if (as.created_at) {
      try {
        const date = new Date(as.created_at);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch (e) {
        return '-';
      }
    }
    return '-';
  };

  const getAsesorStatus = (as) => {
    const itins = as.itinerarios_induccion || [];
    if (itins.length === 0) {
      return { label: 'Sin Itinerario', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    }

    const maxIntento = Math.max(...itins.map(i => i.intento || 1));
    const activeItin = itins.filter(i => i.intento === maxIntento);
    const deptoIds = activeItin.map(i => i.id_departamento);

    const subIds = submodulos
      .filter(sm => deptoIds.includes(sm.id_departamento))
      .map(sm => sm.id);

    if (subIds.length === 0) {
      return { label: 'En Curso', color: 'bg-blue-50 text-blue-600 border-blue-100' };
    }

    const notasActivas = (as.notas_por_submodulo || []).filter(n => n.intento === maxIntento && subIds.includes(n.id_submodulo));

    if (notasActivas.length >= subIds.length) {
      return { label: 'Completado', color: 'bg-red-50 text-red-600 border-red-200' };
    }

    return { label: 'En Curso', color: 'bg-blue-50 text-blue-600 border-blue-100' };
  };

  const handlePromoverEvaluador = async () => {
    if (!asesorParaPromover) return;
    if (!window.confirm('¿Estás seguro de promover este asesor a evaluador? Ya no podrá acceder al portal de inducción como participante.')) return;
    setIsSaving(true);
    const { error } = await supabase.schema('portal_afv').from('usuarios').update({ rol: 'evaluador' }).eq('id', asesorParaPromover);
    if (!error) {
      setMessage('Usuario promovido a evaluador.');
      setAsesorParaPromover('');
      fetchResponsables();
    } else {
      setMessage('Error al promover usuario.');
    }
    setIsSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAsignarResponsable = async () => {
    if (!evalSeleccionado || !deptoParaAsignar) return;
    setIsSaving(true);
    const evaluador = todosLosEvaluadores.find(e => e.id === evalSeleccionado);
    if (!evaluador) { setIsSaving(false); return; }
    const { error } = await supabase.schema('portal_afv').from('evaluadores_autorizados').upsert(
      { email: evaluador.usuario, id_departamento: deptoParaAsignar, nombre_completo: evaluador.nombre },
      { onConflict: 'email,id_departamento' }
    );
    if (!error) {
      setMessage('Responsable asignado.');
      setEvalSeleccionado('');
      setDeptoParaAsignar('');
      fetchResponsables();
    } else { setMessage('Error al asignar.'); }
    setIsSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRemoverResponsable = async (email, id_departamento) => {
    if (!window.confirm('Remover este responsable del departamento?')) return;
    const { error } = await supabase.schema('portal_afv').from('evaluadores_autorizados').delete().eq('email', email).eq('id_departamento', id_departamento);
    if (!error) { fetchResponsables(); setMessage('Responsable removido.'); setTimeout(() => setMessage(''), 3000); }
  };

  const procesarAlta = async () => {
    if (!candidatoAlta) return;
    setIsSaving(true);
    try {
      const { data: newUser, error: upsertError } = await supabase.schema('portal_afv').from('usuarios').upsert({
          usuario: candidatoAlta.email_contacto,
          correo: candidatoAlta.email_contacto,
          nombre: candidatoAlta.nombre_apellido,
          clave: candidatoAlta.cedula,
          rol: 'asesor',
          empresa: candidatoAlta.empresa_excel,
          foto_url: candidatoAlta.foto_url,
          ramo: candidatoAlta.ramo,
          estado: candidatoAlta.estado,
          zona: candidatoAlta.zona,
          telefono: candidatoAlta.telefono,
          fecha_ingreso: candidatoAlta.fecha_ingreso
      }, { onConflict: 'usuario' }).select().single();

      if (upsertError || !newUser) {
          console.error("Error al crear/actualizar usuario:", upsertError);
          setMessage('Error de permisos en Base de Datos (406). Ejecute los comandos GRANT.');
          setTimeout(() => setMessage(''), 5000);
          return;
      }

      const lastIntento = await checkExistenciaCandidato(candidatoAlta.email_contacto);
      const nuevoIntentoNum = (typeof lastIntento === 'number' ? lastIntento : 0) + 1;

      const itins = itinerarioConfig.map((it, idx) => ({
        id_asesor: newUser.id,
        id_departamento: it.id_depto,
        duracion_dias: parseInt(it.dias) || 1,
        orden: idx + 1,
        intento: nuevoIntentoNum,
        motivo_reinicio: esReintento ? motivoReinicio : 'Primer ingreso'
      }));

      const { error: itinError } = await supabase.schema('portal_afv').from('itinerarios_induccion').insert(itins);
      
      if (itinError) throw itinError;

      setMessage(esReintento ? 'Proceso reiniciado con éxito.' : 'Asesor activado exitosamente.');
      setShowAltaModal(false);
      setMotivoReinicio('');
      setItinerarioConfig([]);
      fetchInitialData();
    } catch (err) { 
      console.error(err);
      setMessage('Error crítico al procesar el alta.');
    } finally { 
      setIsSaving(false); 
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleOpenEdit = (data, type) => {
    setEditType(type);
    setEditData({ ...data });
    setEditPhotoFile(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      if (editType === 'usuario') {
        let photoUrl = editData.foto_url;

        if (editPhotoFile) {
          const fileExt = editPhotoFile.name.split('.').pop();
          const fileName = `foto_perfil_${editData.id}_${Date.now()}.${fileExt}`;
          const filePath = `${editData.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('evidencias_asesores')
            .upload(filePath, editPhotoFile, { upsert: true });
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('evidencias_asesores')
            .getPublicUrl(filePath);
            
          photoUrl = publicUrl;
        }

        const { error } = await supabase.schema('portal_afv').from('usuarios').update({
          nombre: editData.nombre,
          correo: editData.correo,
          correo_corporativo: editData.correo_corporativo,
          empresa: editData.empresa,
          ramo: editData.ramo,
          estado: editData.estado,
          zona: editData.zona,
          telefono: editData.telefono,
          fecha_ingreso: editData.fecha_ingreso,
          fecha_inicio_calle: editData.fecha_inicio_calle,
          foto_url: photoUrl
        }).eq('id', editData.id);

        if (error) throw error;
        setMessage('✅ Datos del asesor actualizados.');
        if (selectedAsesor?.id === editData.id) {
          setSelectedAsesor({ ...selectedAsesor, ...editData, foto_url: photoUrl });
        }
        fetchInitialData();
      } else {
        const { error } = await supabase.schema('portal_afv').from('import_respuestas_excel').update({
          nombre_apellido: editData.nombre_apellido,
          email_contacto: editData.email_contacto,
          empresa_excel: editData.empresa_excel,
          ramo: editData.ramo,
          estado: editData.estado,
          zona: editData.zona,
          telefono: editData.telefono,
          fecha_ingreso: editData.fecha_ingreso,
          fecha_inicio_calle: editData.fecha_inicio_calle,
          cedula: editData.cedula
        }).eq('id', editData.id);

        if (error) throw error;
        setMessage('✅ Datos del aspirante actualizados.');
        const { data: autoData } = await supabase.schema('portal_afv').from('import_respuestas_excel').select('*').order('fecha_sincronizacion', { ascending: false });
        setNotasAutomaticas(autoData || []);
      }
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al actualizar los datos.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (instrumentoConfig) {
    return (
      <CartaEvaluacionPDF 
        asesor={instrumentoConfig.asesor} 
        departamento={instrumentoConfig.departamento} 
        actividades={instrumentoConfig.actividades} 
        onBack={() => setInstrumentoConfig(null)} 
      />
    );
  }

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold text-[10px]">Cargando Sistema...</div>;

  return (
    <div className="min-h-screen bg-white p-6" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="max-w-[1600px] mx-auto">
        <header className="border-b border-gray-200 pb-5 mb-6 flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Panel de administración</p>
            <h1 className="text-xl font-bold text-gray-900">Consola de Evaluación y Reclutamiento</h1>
            <div className="flex gap-2 mt-4 flex-wrap">
              <button onClick={() => setViewMode('manual')} className={`px-4 py-1.5 rounded text-xs border transition-colors ${viewMode === 'manual' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>Evaluaciones</button>
              <button onClick={() => setViewMode('mi-academia')} className={`px-4 py-1.5 rounded text-xs border transition-colors ${viewMode === 'mi-academia' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>Mi Academia</button>
              <button onClick={() => setViewMode('automatico')} className={`px-4 py-1.5 rounded text-xs border transition-colors ${viewMode === 'automatico' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>Aspirantes Excel</button>
              <button onClick={() => setViewMode('resumen')} className={`px-4 py-1.5 rounded text-xs border transition-colors ${viewMode === 'resumen' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>Resumen</button>
             {user.rol === 'admin' && (
               <>
                <button onClick={() => setViewMode('configuracion')} className={`px-4 py-1.5 rounded text-xs border transition-colors ${viewMode === 'configuracion' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>
                    Biblioteca Temas
                </button>
                <button onClick={() => setViewMode('escenarios')} className={`px-4 py-1.5 rounded text-xs border transition-colors ${viewMode === 'escenarios' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>
                    Gestionar Escenarios
                </button>
                <button onClick={() => setViewMode('reportes')} className={`px-4 py-1.5 rounded text-xs border transition-colors ${viewMode === 'reportes' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>
                    Reporte de Notas
                </button>
                <button onClick={() => setShowGestionCalleModal(true)} className="px-4 py-1.5 rounded text-xs border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
                    Gestor Acompañamiento
                </button>
                <button onClick={() => { setViewMode('responsables'); fetchResponsables(); }} className={`px-4 py-1.5 rounded text-xs border transition-colors ${viewMode === 'responsables' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>
                    Responsables
                </button>
                <button onClick={() => { setViewMode('departamentos'); fetchDepartamentos(); }} className={`px-4 py-1.5 rounded text-xs border transition-colors ${viewMode === 'departamentos' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>
                    Departamentos
                </button>
               </>
             )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="text-xs text-gray-600 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
            >
              ← Volver a Pantalla Inicial
            </button>
            {onLogout && (
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                    onLogout();
                  }
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </header>

        {viewMode === 'manual' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-3">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col max-h-[80vh]">
                <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest">Asesores Activos</h3>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[8px] font-black">
                    {asesores.filter(as => {
                      const s = getAsesorStatus(as).label;
                      if (filterStatus === 'todos') return true;
                      if (filterStatus === 'completado') return s === 'Completado';
                      if (filterStatus === 'en_curso') return s === 'En Curso';
                      if (filterStatus === 'sin_itinerario') return s === 'Sin Itinerario';
                      return true;
                    }).filter(as => (as.nombre || '').toLowerCase().includes(searchTermAsesores.toLowerCase())).length}
                  </span>
                </div>
                
                {/* BUSCADOR, FILTRO Y ORDENAMIENTO DE ASESORES */}
                <div className="p-3 border-b bg-white space-y-2">
                  <input
                    type="text"
                    placeholder="🔍 Buscar asesor o empresa..."
                    value={searchTermAsesores}
                    onChange={(e) => setSearchTermAsesores(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%2394a3b8' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                  >
                    <option value="todos">📋 Todos los estados</option>
                    <option value="completado">🔴 Inducción completada</option>
                    <option value="en_curso">🔵 En curso</option>
                    <option value="sin_itinerario">⚪ Sin itinerario</option>
                  </select>

                  <div className="flex gap-1.5 items-center pt-1 border-t border-slate-100">
                    <div className="relative flex-1">
                      <select
                        value={asesorSortKey}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          setAsesorSortKey(newKey);
                          if (newKey === 'fecha') {
                            setAsesorSortDir('desc');
                          } else {
                            setAsesorSortDir('asc');
                          }
                        }}
                        className="w-full pl-2.5 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 10 10'%3E%3Cpath fill='%2364748b' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                      >
                        <option value="fecha">📅 Orden: Fecha</option>
                        <option value="nombre">🔤 Orden: Nombre</option>
                        <option value="apellido">👤 Orden: Apellido</option>
                        <option value="empresa">🏢 Orden: Empresa</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAsesorSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 shrink-0 active:scale-95"
                      title={asesorSortDir === 'asc' ? 'Ascendente (A-Z / Antiguo a Reciente)' : 'Descendente (Z-A / Reciente a Antiguo)'}
                    >
                      {asesorSortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1">
                  {asesores
                    .filter(as => {
                      const s = getAsesorStatus(as).label;
                      if (filterStatus === 'completado') return s === 'Completado';
                      if (filterStatus === 'en_curso') return s === 'En Curso';
                      if (filterStatus === 'sin_itinerario') return s === 'Sin Itinerario';
                      return true;
                    })
                    .filter(as => {
                      const term = searchTermAsesores.toLowerCase().trim();
                      if (!term) return true;
                      return (
                        (as.nombre || '').toLowerCase().includes(term) ||
                        (as.empresa || '').toLowerCase().includes(term) ||
                        (as.usuario || '').toLowerCase().includes(term)
                      );
                    })
                    .sort((a, b) => {
                      if (asesorSortKey === 'nombre') {
                        const valA = (getPrimerNombre(a) || a.nombre || '').toLowerCase();
                        const valB = (getPrimerNombre(b) || b.nombre || '').toLowerCase();
                        const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
                        return asesorSortDir === 'asc' ? cmp : -cmp;
                      }
                      if (asesorSortKey === 'apellido') {
                        const valA = (getApellido(a) || '').toLowerCase();
                        const valB = (getApellido(b) || '').toLowerCase();
                        const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
                        return asesorSortDir === 'asc' ? cmp : -cmp;
                      }
                      if (asesorSortKey === 'empresa') {
                        const valA = (a.empresa || 'Independiente').toLowerCase();
                        const valB = (b.empresa || 'Independiente').toLowerCase();
                        const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
                        if (cmp !== 0) return asesorSortDir === 'asc' ? cmp : -cmp;
                        return (a.nombre || '').toLowerCase().localeCompare((b.nombre || '').toLowerCase(), 'es', { sensitivity: 'base' });
                      }
                      // Default 'fecha'
                      const dateA = parseDateForSort(a);
                      const dateB = parseDateForSort(b);
                      return asesorSortDir === 'asc' ? dateA - dateB : dateB - dateA;
                    })
                    .map(as => {
                      const status = getAsesorStatus(as);
                      return (
                        <div 
                          key={as.id} 
                          onClick={() => setSelectedAsesor(as)} 
                          className={`p-4 cursor-pointer border-b border-slate-100 transition-all ${selectedAsesor?.id === as.id ? 'bg-blue-50 border-l-4 border-l-blue-600 shadow-sm' : 'hover:bg-slate-50'}`}
                        >
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <h3 className="text-sm font-bold text-slate-800 leading-tight flex-1">{as.nombre}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider border shrink-0 ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            <span>{as.empresa || 'Independiente'}</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono text-[10px] border border-slate-200">
                              📅 {formatInductionDate(as)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="col-span-9">
              {!selectedAsesor ? (
                <div className="h-full bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-20 text-slate-300">
                  <p className="text-[10px] font-black uppercase tracking-widest">Seleccione un asesor para calificar el intento actual</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* INDICADOR DE ITINERARIO VACÍO O MAPA DE RUTA */}
                  {itinerarioActual.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-center">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-sm font-black text-slate-800 uppercase mb-2">Este asesor no tiene un itinerario activo</h3>
                        <p className="text-[10px] text-slate-400 font-medium mb-6 max-w-xs">Debe configurar los departamentos por los que pasará el asesor para poder evaluarlo.</p>
                        <button 
                            onClick={async () => {
                                setCandidatoAlta({ 
                                    nombre_apellido: selectedAsesor.nombre, 
                                    email_contacto: selectedAsesor.usuario,
                                    cedula: selectedAsesor.clave,
                                    empresa_excel: selectedAsesor.empresa 
                                });
                                await checkExistenciaCandidato(selectedAsesor.usuario);
                                setItinerarioConfig([]);
                                setShowAltaModal(true);
                            }}
                            className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl transition-all"
                        >
                            ⚙️ Configurar Itinerario Oficial
                        </button>
                        {user.rol === 'admin' && (
                            <button 
                                onClick={handleDesactivarAsesor}
                                className="mt-4 bg-orange-100 text-orange-600 border border-orange-200 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-200 shadow-sm transition-all"
                            >
                                ⛔ Desactivar Asesor
                            </button>
                        )}
                    </div>
                  ) : (
                    <div style={{ background: '#ffffff', borderRadius: '8px', padding: '32px', border: '1px solid #e2e2e2', boxShadow: '0 1px 3px rgba(0,0,0,.08)', position: 'relative', overflow: 'hidden', fontFamily: '"Myriad Pro", Arial, sans-serif' }}>
                        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                {/* FOTO DE PERFIL EN EVALUACIÓN */}
                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#f9fafb', border: '1px solid #e2e2e2', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {selectedAsesor.foto_url ? (
                                        <a href={selectedAsesor.foto_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
                                            <img 
                                              src={getGoogleDriveThumbnail(selectedAsesor.foto_url)} 
                                              alt="Perfil" 
                                              referrerPolicy="no-referrer"
                                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                              onError={(e) => {
                                                  e.target.style.display = 'none';
                                                  if(e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                                              }}
                                            />
                                            <div style={{ position: 'absolute', inset: 0, display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', color: '#000000', background: '#f9fafb' }}>
                                                {selectedAsesor.nombre?.substring(0,1)}
                                            </div>
                                        </a>
                                    ) : (
                                        <span style={{ fontSize: '24px', fontWeight: '900', color: '#000000' }}>{selectedAsesor.nombre?.substring(0,1)}</span>
                                    )}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#000000', margin: '0 16px 0 0' }}>{selectedAsesor.nombre}</h2>
                                        <button 
                                            onClick={handleGeneratePDF}
                                            style={{ background: '#ffffff', color: '#666666', border: '1px solid #c6c6c6', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'border-color 150ms ease, color 150ms ease', cursor: 'pointer', fontFamily: '"Myriad Pro", Arial, sans-serif' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#000000'; e.currentTarget.style.color = '#000000'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#c6c6c6'; e.currentTarget.style.color = '#666666'; }}
                                        >
                                            Emitir Reporte PDF
                                        </button>
                                        <button 
                                            onClick={() => setShowInstrumentoModal(true)}
                                            style={{ background: '#ffffff', color: '#4f46e5', border: '1px solid rgba(79,70,229,.4)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 150ms ease', cursor: 'pointer', fontFamily: '"Myriad Pro", Arial, sans-serif' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,70,229,.06)'; e.currentTarget.style.borderColor = '#4f46e5'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(79,70,229,.4)'; }}
                                        >
                                            Emitir Instrumento Sede
                                        </button>
                                        <button 
                                            onClick={() => setShowAsignacionCalleModal(true)}
                                            style={{ background: '#ffffff', color: '#666666', border: '1px solid #c6c6c6', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'border-color 150ms ease, color 150ms ease', cursor: 'pointer', fontFamily: '"Myriad Pro", Arial, sans-serif' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#000000'; e.currentTarget.style.color = '#000000'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#c6c6c6'; e.currentTarget.style.color = '#666666'; }}
                                        >
                                            Asignar Calle
                                        </button>
                                        <button 
                                            onClick={() => setShowFormularioCalleModal(true)}
                                            style={{ background: '#ffffff', color: '#666666', border: '1px solid #c6c6c6', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'border-color 150ms ease, color 150ms ease', cursor: 'pointer', fontFamily: '"Myriad Pro", Arial, sans-serif' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#000000'; e.currentTarget.style.color = '#000000'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#c6c6c6'; e.currentTarget.style.color = '#666666'; }}
                                        >
                                            Reporte Acompañamiento en Calle
                                        </button>
                                        {user.rol === 'admin' && (
                                            <>
                                              <button 
                                                  onClick={() => handleOpenEdit(selectedAsesor, 'usuario')}
                                                  style={{ background: '#ffffff', color: '#666666', border: '1px solid #c6c6c6', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'border-color 150ms ease, color 150ms ease', cursor: 'pointer', fontFamily: '"Myriad Pro", Arial, sans-serif' }}
                                                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#000000'; e.currentTarget.style.color = '#000000'; }}
                                                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#c6c6c6'; e.currentTarget.style.color = '#666666'; }}
                                              >
                                                  Editar Datos
                                              </button>
                                              <button 
                                                  onClick={handleDesactivarAsesor}
                                                  style={{ background: '#ffffff', color: '#d32f2f', border: '1px solid rgba(211,47,47,.4)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'border-color 150ms ease, background 150ms ease, color 150ms ease', cursor: 'pointer', fontFamily: '"Myriad Pro", Arial, sans-serif' }}
                                                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(211,47,47,.06)'; e.currentTarget.style.borderColor = '#d32f2f'; }}
                                                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(211,47,47,.4)'; }}
                                              >
                                                  Desactivar Asesor
                                              </button>
                                              <button 
                                                  onClick={handleDeleteInduccion}
                                                  style={{ background: '#ffffff', color: '#d32f2f', border: '1px solid rgba(211,47,47,.4)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'border-color 150ms ease, background 150ms ease, color 150ms ease', cursor: 'pointer', fontFamily: '"Myriad Pro", Arial, sans-serif' }}
                                                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(211,47,47,.06)'; e.currentTarget.style.borderColor = '#d32f2f'; }}
                                                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(211,47,47,.4)'; }}
                                              >
                                                  Borrar Historial
                                              </button>
                                            </>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#000000', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', margin: '12px 0 4px 0' }}>
                                        Inducción en Curso - Intento #{itinerarioActual[0]?.intento}
                                    </span>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666666', fontWeight: '400', flexWrap: 'wrap' }}>
                                       <span>Personal: <strong style={{ fontWeight: '600', color: '#000000' }}>{selectedAsesor.correo || selectedAsesor.usuario}</strong></span>
                                       <span>Corp: {selectedAsesor.correo_corporativo ? (
                                         <strong style={{ fontWeight: '600', color: '#000000' }}>{selectedAsesor.correo_corporativo}</strong>
                                       ) : (
                                         <span style={{ color: '#d32f2f', fontWeight: '700', background: 'rgba(211,47,47,.06)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(211,47,47,.4)', fontSize: '11px', textTransform: 'uppercase' }}>Sin Correo Corp</span>
                                       )}</span>
                                       <span>Ubicación: <strong style={{ fontWeight: '600', color: '#000000' }}>{selectedAsesor.zona || 'No definida'}</strong></span>
                                       <span>Móvil: <strong style={{ fontWeight: '600', color: '#000000' }}>{selectedAsesor.telefono || 'Sin teléfono'}</strong></span>
                                       <span>Ingreso: <strong style={{ fontWeight: '600', color: '#000000' }}>{selectedAsesor.fecha_ingreso || 'N/A'}</strong></span>
                                       <span>Inicio Calle: <strong style={{ fontWeight: '600', color: '#1976d2' }}>{selectedAsesor.fecha_inicio_calle || calcularFechaInicioCalle(selectedAsesor.fecha_ingreso) || 'N/A'}</strong></span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {itinerarioActual.map((it, idx) => (
                                    <div key={it.id} style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f9fafb', border: '1px solid #e2e2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#000000' }} title={it.departamentos?.nombre}>
                                        {idx + 1}
                                    </div>
                                ))}
                            </div>
                            <TimelineMeses asesor={selectedAsesor} />
                        </div>
                    </div>
                  )}

                  {/* NAVEGACIÓN DE PESTAÑAS — Prisma Design System */}
                  <div style={{ marginTop: '16px', marginBottom: '24px', paddingBottom: '0', display: 'flex', flexWrap: 'wrap', gap: '8px', fontFamily: '"Myriad Pro", Arial, sans-serif', borderBottom: '1px solid #e2e2e2' }}>
                    <button 
                      onClick={() => setActiveSubTab('evaluacion')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px 8px 0 0',
                        fontSize: '11px',
                        fontWeight: activeSubTab === 'evaluacion' ? '700' : '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderBottom: activeSubTab === 'evaluacion' ? '1px solid #ffffff' : '1px solid #e2e2e2',
                        background: activeSubTab === 'evaluacion' ? '#ffffff' : '#f9fafb',
                        color: activeSubTab === 'evaluacion' ? '#000000' : '#666666',
                        borderColor: activeSubTab === 'evaluacion' ? '#e2e2e2 #e2e2e2 #ffffff #e2e2e2' : '#e2e2e2',
                        boxShadow: activeSubTab === 'evaluacion' ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                        marginBottom: activeSubTab === 'evaluacion' ? '-1px' : '0',
                        fontFamily: '"Myriad Pro", Arial, sans-serif',
                      }}
                    >
                      Evaluaciones del Itinerario
                    </button>
                    <button 
                      onClick={() => setActiveSubTab('seguimiento')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px 8px 0 0',
                        fontSize: '11px',
                        fontWeight: activeSubTab === 'seguimiento' ? '700' : '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderBottom: activeSubTab === 'seguimiento' ? '1px solid #ffffff' : '1px solid #e2e2e2',
                        background: activeSubTab === 'seguimiento' ? '#ffffff' : '#f9fafb',
                        color: activeSubTab === 'seguimiento' ? '#000000' : '#666666',
                        borderColor: activeSubTab === 'seguimiento' ? '#e2e2e2 #e2e2e2 #ffffff #e2e2e2' : '#e2e2e2',
                        boxShadow: activeSubTab === 'seguimiento' ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                        marginBottom: activeSubTab === 'seguimiento' ? '-1px' : '0',
                        fontFamily: '"Myriad Pro", Arial, sans-serif',
                      }}
                    >
                      Seguimiento y Feedback
                    </button>
                    <button 
                      onClick={() => setActiveSubTab('incidencias')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px 8px 0 0',
                        fontSize: '11px',
                        fontWeight: activeSubTab === 'incidencias' ? '700' : '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderBottom: activeSubTab === 'incidencias' ? '1px solid #ffffff' : '1px solid #e2e2e2',
                        background: activeSubTab === 'incidencias' ? '#ffffff' : '#f9fafb',
                        color: activeSubTab === 'incidencias' ? '#000000' : '#666666',
                        borderColor: activeSubTab === 'incidencias' ? '#e2e2e2 #e2e2e2 #ffffff #e2e2e2' : '#e2e2e2',
                        boxShadow: activeSubTab === 'incidencias' ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                        marginBottom: activeSubTab === 'incidencias' ? '-1px' : '0',
                        fontFamily: '"Myriad Pro", Arial, sans-serif',
                      }}
                    >
                      Bitácora de Eventualidades ({incidencias.length})
                    </button>
                    <button 
                      onClick={() => setActiveSubTab('imagen_personal')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px 8px 0 0',
                        fontSize: '11px',
                        fontWeight: activeSubTab === 'imagen_personal' ? '700' : '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderBottom: activeSubTab === 'imagen_personal' ? '1px solid #ffffff' : '1px solid #e2e2e2',
                        background: activeSubTab === 'imagen_personal' ? '#ffffff' : '#f9fafb',
                        color: activeSubTab === 'imagen_personal' ? '#000000' : '#666666',
                        borderColor: activeSubTab === 'imagen_personal' ? '#e2e2e2 #e2e2e2 #ffffff #e2e2e2' : '#e2e2e2',
                        boxShadow: activeSubTab === 'imagen_personal' ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                        marginBottom: activeSubTab === 'imagen_personal' ? '-1px' : '0',
                        fontFamily: '"Myriad Pro", Arial, sans-serif',
                      }}
                    >
                      Imagen Personal
                    </button>
                  </div>

                  {activeSubTab === 'evaluacion' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Myriad Pro", Arial, sans-serif' }}>
                      {/* TEMAS POR DEPARTAMENTO */}
                      {itinerarioActual.length > 0 && (
                         <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                            <button 
                               onClick={handleSaveAllNotas} 
                               disabled={isSaving}
                               style={{ background: isSaving ? 'rgba(198,198,198,.4)' : '#c6c6c6', color: isSaving ? '#8a8a8a' : '#000000', padding: '14px 32px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', cursor: isSaving ? 'default' : 'pointer', transition: 'background 150ms ease, color 150ms ease', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,.08)', fontFamily: '"Myriad Pro", Arial, sans-serif' }}
                               onMouseEnter={e => { if (!isSaving) { e.currentTarget.style.background = '#000000'; e.currentTarget.style.color = '#ffffff'; } }}
                               onMouseLeave={e => { if (!isSaving) { e.currentTarget.style.background = '#c6c6c6'; e.currentTarget.style.color = '#000000'; } }}
                            >
                               {isSaving ? (
                                  <>
                                     <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                     Guardando Todo...
                                  </>
                               ) : '✅ Guardar Evaluación Completa'}
                            </button>
                         </div>
                      )}

                      {itinerarioActual.map(it => {
                        const temasDepto = submodulos.filter(sm => sm.id_departamento === it.id_departamento);
                        return (
                          <div key={it.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-black uppercase text-slate-800 mb-6 border-b pb-4">{it.departamentos?.nombre}</h3>
                            
                            {temasDepto.length === 0 ? (
                              <div className="py-10 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aún no hay temas cargados para este departamento</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {temasDepto.map(sm => {
                                  const notaExistente = notasGuardadas.find(n => n.id_submodulo === sm.id);
                                  let submission = null;
                                  if (notaExistente?.comentario?.startsWith('{')) {
                                    try {
                                      const parsed = JSON.parse(notaExistente.comentario);
                                      if (parsed.type === 'exercise_submission') submission = parsed;
                                    } catch (e) {}
                                  }

                                  return (
                                    <div key={sm.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-50 hover:border-blue-200 transition-all">
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-xs font-black uppercase text-slate-700">{sm.nombre_tarea}</h4>
                                        {sm.area_tecnica && (
                                          <span className={`text-[6px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                            sm.area_tecnica.includes('VENTAS') ? 'bg-blue-100 text-blue-700' :
                                            sm.area_tecnica.includes('COBRANZA') ? 'bg-green-100 text-green-700' :
                                            sm.area_tecnica.includes('CATÁLOGO') ? 'bg-purple-100 text-purple-700' :
                                            sm.area_tecnica.includes('SKU') ? 'bg-orange-100 text-orange-700' :
                                            'bg-slate-100 text-slate-600'
                                          }`}>
                                            {sm.area_tecnica}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {submission && (
                                        <div className="mb-4 space-y-2">
                                          <div className="bg-white p-3 rounded-xl border border-slate-100">
                                            <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">Propuesta del Asesor:</p>
                                            <p className="text-[10px] text-slate-600 italic leading-relaxed">"{submission.speech}"</p>
                                          </div>
                                          {submission.files && submission.files.length > 0 && (
                                            <div className="flex gap-2">
                                              {submission.files.map((f, i) => (
                                                <button key={i} onClick={() => window.open(f.url, '_blank')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
                                                  📄 Ver Soporte
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <div className="flex flex-col gap-2 w-full mt-4">
                                        <div className="flex items-center gap-2 mb-1">
                                          <input 
                                            type="checkbox" 
                                            id={`np-sm-${sm.id}`}
                                            className="h-3 w-3 accent-amber-600 cursor-pointer"
                                            checked={evaluaciones[sm.id]?.noPresento !== undefined ? evaluaciones[sm.id].noPresento : ((() => {
                                                if (notaExistente?.comentario?.startsWith('{')) {
                                                  try { return JSON.parse(notaExistente.comentario).no_presento || false; } catch(e){}
                                                }
                                                return false;
                                            })())}
                                            onChange={(e) => {
                                              setEvaluaciones({...evaluaciones, [sm.id]: {...evaluaciones[sm.id], noPresento: e.target.checked}});
                                            }}
                                          />
                                          <label htmlFor={`np-sm-${sm.id}`} className="text-[10px] font-bold text-amber-700 cursor-pointer select-none">
                                            No presentó
                                          </label>
                                        </div>
                                        {(sm.contenido && sm.contenido.length > 0) ? (
                                           sm.contenido.map((act, idx) => {
                                              let notaInicial = '';
                                              if (notaExistente?.comentario?.startsWith('{')) {
                                                try { 
                                                  const p = JSON.parse(notaExistente.comentario);
                                                  if (p.detalle_evaluacion?.[act.actividad]) notaInicial = p.detalle_evaluacion[act.actividad].nota;
                                                } catch(e){}
                                              }
                                              return (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500 font-bold flex-1 truncate" title={act.actividad}>{act.actividad} <span className="text-blue-500">({act.peso}%)</span></span>
                                                    <div className="flex items-center gap-1">
                                                      <input
                                                        type="checkbox"
                                                        id={`np-act-${sm.id}-${idx}`}
                                                        className="h-3 w-3 accent-amber-600 cursor-pointer"
                                                        checked={evaluaciones[sm.id]?.notasNP?.[idx] ?? ((() => {
                                                            try { 
                                                              if (notaExistente?.comentario?.startsWith('{')) {
                                                                const p = JSON.parse(notaExistente.comentario);
                                                                return p.detalle_evaluacion?.[act.actividad]?.np || false;
                                                              }
                                                              return false;
                                                            } catch(e){ return false; }
                                                        })())}
                                                        onChange={(e) => {
                                                            const currentEval = evaluaciones[sm.id] || { notas: [], notasNP: [] };
                                                            const newNotasNP = [...(currentEval.notasNP || [])];
                                                            newNotasNP[idx] = e.target.checked;
                                                            setEvaluaciones({...evaluaciones, [sm.id]: {...currentEval, notasNP: newNotasNP}});
                                                        }}
                                                      />
                                                      <label htmlFor={`np-act-${sm.id}-${idx}`} className="text-[8px] font-bold text-amber-700 cursor-pointer select-none">NP</label>
                                                    </div>
                                                    <input 
                                                      type="number" 
                                                      step="any"
                                                      className="w-14 h-8 bg-white border border-slate-200 rounded-lg text-center font-black text-[10px] disabled:opacity-50 disabled:bg-slate-50" 
                                                      placeholder="Nota (0-10)" 
                                                      max="10"
                                                      defaultValue={notaInicial}
                                                      disabled={(evaluaciones[sm.id]?.noPresento !== undefined ? evaluaciones[sm.id].noPresento : ((() => {
                                                          if (notaExistente?.comentario?.startsWith('{')) {
                                                            try { return JSON.parse(notaExistente.comentario).no_presento || false; } catch(e){}
                                                          }
                                                          return false;
                                                      })())) || (evaluaciones[sm.id]?.notasNP?.[idx] ?? ((() => {
                                                            try { 
                                                              if (notaExistente?.comentario?.startsWith('{')) {
                                                                const p = JSON.parse(notaExistente.comentario);
                                                                return p.detalle_evaluacion?.[act.actividad]?.np || false;
                                                              }
                                                              return false;
                                                            } catch(e){ return false; }
                                                        })()))}
                                                      onBlur={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        const currentEval = evaluaciones[sm.id] || { notas: [], notasNP: [] };
                                                        const newNotas = [...(currentEval.notas || [])];
                                                        newNotas[idx] = val;
                                                        setEvaluaciones({...evaluaciones, [sm.id]: {...currentEval, notas: newNotas}});
                                                      }}
                                                    />
                                                </div>
                                              );
                                           })
                                        ) : isSkuModule(sm) ? (
                                          /* UI ESPECIALIZADA PARA CUESTIONARIO Y EVALUACIÓN DE SKUS */
                                          (() => {
                                            let parsedSku = null;
                                            if (notaExistente?.comentario?.startsWith('{')) {
                                              try { parsedSku = JSON.parse(notaExistente.comentario).evaluacion_sku; } catch(e){}
                                            }

                                            const currentEvalState = evaluaciones[sm.id] || {};
                                            const evalVal = currentEvalState.skusEvaluados !== undefined ? currentEvalState.skusEvaluados : (parsedSku?.skus_evaluados ?? '');
                                            const aprVal = currentEvalState.skusAprendidos !== undefined ? currentEvalState.skusAprendidos : (parsedSku?.skus_aprendidos ?? '');
                                            
                                            const numEval = parseFloat(evalVal) || 0;
                                            const numApr = parseFloat(aprVal) || 0;
                                            const pct = numEval > 0 ? Math.min(100, Math.round((numApr / numEval) * 100)) : (notaExistente?.nota ? Math.round((notaExistente.nota / 10) * 100) : 0);
                                            const notaCalculada = numEval > 0 ? Math.min(10, ((numApr / numEval) * 10)).toFixed(1) : (notaExistente?.nota !== undefined && notaExistente?.nota !== null ? Number(notaExistente.nota).toFixed(1) : '0.0');

                                            const isDisabled = currentEvalState.noPresento !== undefined 
                                              ? currentEvalState.noPresento 
                                              : ((() => {
                                                  if (notaExistente?.comentario?.startsWith('{')) {
                                                    try { return JSON.parse(notaExistente.comentario).no_presento || false; } catch(e){}
                                                  }
                                                  return false;
                                                })());

                                            return (
                                              <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3.5 space-y-3">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-[9px] font-black uppercase text-orange-950 flex items-center gap-1.5">
                                                    <span>📦</span> Registro de SKUs Evaluados
                                                  </span>
                                                  <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                                                      pct >= 80 ? 'bg-emerald-100 text-emerald-800' :
                                                      pct >= 60 ? 'bg-amber-100 text-amber-800' :
                                                      'bg-rose-100 text-rose-800'
                                                    }`}>
                                                      {pct}% Efectividad
                                                    </span>
                                                    <span className="text-[10px] font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                                                      {notaCalculada}/10
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                    <label className="text-[8px] font-black uppercase text-slate-500 block mb-1">
                                                      SKUs Evaluados (Total)
                                                    </label>
                                                    <input 
                                                      type="number"
                                                      min="1"
                                                      step="1"
                                                      disabled={isDisabled}
                                                      className="w-full h-9 bg-white border border-orange-200 rounded-xl text-center font-black text-xs text-slate-800 focus:border-orange-500 focus:outline-none disabled:opacity-50 disabled:bg-slate-100"
                                                      placeholder="Ej: 50"
                                                      defaultValue={evalVal}
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        setEvaluaciones(prev => ({
                                                          ...prev,
                                                          [sm.id]: {
                                                            ...prev[sm.id],
                                                            skusEvaluados: val,
                                                            isSku: true
                                                          }
                                                        }));
                                                      }}
                                                    />
                                                  </div>
                                                  <div>
                                                    <label className="text-[8px] font-black uppercase text-slate-500 block mb-1">
                                                      SKUs Aprendidos (Aciertos)
                                                    </label>
                                                    <input 
                                                      type="number"
                                                      min="0"
                                                      step="1"
                                                      disabled={isDisabled}
                                                      className="w-full h-9 bg-white border border-orange-200 rounded-xl text-center font-black text-xs text-slate-800 focus:border-orange-500 focus:outline-none disabled:opacity-50 disabled:bg-slate-100"
                                                      placeholder="Ej: 42"
                                                      defaultValue={aprVal}
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        setEvaluaciones(prev => ({
                                                          ...prev,
                                                          [sm.id]: {
                                                            ...prev[sm.id],
                                                            skusAprendidos: val,
                                                            isSku: true
                                                          }
                                                        }));
                                                      }}
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })()
                                        ) : (
                                           <div className="flex gap-2">
                                              <input 
                                                type="number" 
                                                step="any"
                                                className="w-24 h-10 bg-white border border-slate-200 rounded-xl text-center font-black text-xs disabled:opacity-50 disabled:bg-slate-50" 
                                                placeholder="Nota (0-10)" 
                                                max="10"
                                                defaultValue={notaExistente?.nota !== undefined && notaExistente?.nota !== null ? notaExistente.nota : ''}
                                                disabled={evaluaciones[sm.id]?.noPresento !== undefined ? evaluaciones[sm.id].noPresento : ((() => {
                                                    if (notaExistente?.comentario?.startsWith('{')) {
                                                      try { return JSON.parse(notaExistente.comentario).no_presento || false; } catch(e){}
                                                    }
                                                    return false;
                                                })())}
                                                onBlur={(e) => {
                                                  const val = parseFloat(e.target.value) || 0;
                                                  setEvaluaciones({...evaluaciones, [sm.id]: {...evaluaciones[sm.id], nota: val}});
                                                }}
                                              />
                                           </div>
                                        )}
                                        <div className="flex gap-2 mt-2">
                                          <input 
                                            type="text" 
                                            className="flex-1 px-4 bg-white border border-slate-200 rounded-xl text-[9px] outline-none" 
                                            placeholder="Feedback del evaluador..." 
                                            defaultValue={(() => {
                                                if (submission) return '';
                                                if (!notaExistente?.comentario) return '';
                                                // Always try to parse as JSON first
                                                try {
                                                  const parsed = JSON.parse(notaExistente.comentario);
                                                  if (typeof parsed === 'object') return parsed.texto || '';
                                                } catch(e){}
                                                // Only show raw text if it doesn't look like JSON
                                                if (notaExistente.comentario.startsWith('{') || notaExistente.comentario.startsWith('"')) return '';
                                                return notaExistente.comentario;
                                            })()}
                                            onBlur={(e) => setEvaluaciones({...evaluaciones, [sm.id]: {...evaluaciones[sm.id], obs: e.target.value}})}
                                          />
                                          <button onClick={() => handleSaveNota(sm, evaluaciones[sm.id], notaExistente)} className="px-5 h-10 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase hover:bg-blue-600 transition-all">OK</button>
                                        </div>
                                        {notaExistente?.updated_at && (
                                          <p className="text-[8px] text-slate-400 text-right mt-1 px-1">
                                            Última modif. {new Date(notaExistente.updated_at).toLocaleString('es-CO', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* ===== SECCIÓN ROLEPLAY DIGITAL ===== */}
                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                          <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                            🎭 Entregas de Roleplay Digital
                            {evidenciasAsesor.length > 0 && (
                              <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black">{evidenciasAsesor.length}</span>
                            )}
                          </h3>
                        </div>

                        {evidenciasAsesor.length === 0 ? (
                          <div className="py-10 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin entregas de Roleplay aún</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {evidenciasAsesor.map((ev) => (
                              <EvidenciaCard
                                key={ev.id}
                                evidencia={ev}
                                onSave={handleSaveNotaRoleplay}
                                onDelete={handleDeleteRoleplay}
                                isSaving={isSaving}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'seguimiento' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* PERFIL DE HABILIDADES Y EXPERIENCIA */}
                        <div style={{ background: '#ffffff', borderRadius: '8px', padding: '24px', border: '1px solid #e2e2e2', boxShadow: '0 1px 3px rgba(0,0,0,.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: '"Myriad Pro", Arial, sans-serif' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e2e2' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#000000', margin: 0 }}>
                                  Perfil de habilidades
                                </h3>
                                <button 
                                  onClick={handleSaveCualidadesGenerales}
                                  disabled={isSaving}
                                  style={{ background: isSaving ? 'rgba(198,198,198,.4)' : '#c6c6c6', color: isSaving ? '#8a8a8a' : '#000000', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', cursor: isSaving ? 'default' : 'pointer', transition: 'background 150ms ease, color 150ms ease', fontFamily: '"Myriad Pro", Arial, sans-serif' }}
                                  onMouseEnter={e => { if (!isSaving) { e.currentTarget.style.background='#000000'; e.currentTarget.style.color='#ffffff'; } }}
                                  onMouseLeave={e => { if (!isSaving) { e.currentTarget.style.background='#c6c6c6'; e.currentTarget.style.color='#000000'; } }}
                                >
                                  Guardar
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium mb-3">
                                Selecciona las competencias clave y detalla su trayectoria laboral.
                              </p>
                              
                              {/* SECCIÓN TAGS */}
                              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-4 scrollbar-thin">
                                {DISPONIBLE_SKILLS_TAGS.map((catObj) => (
                                  <div key={catObj.category}>
                                    <p className="text-[8px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                                      <span>{catObj.icon}</span> {catObj.category}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {catObj.tags.map((tag) => {
                                        const isSelected = cualidadesGenerales.tags?.includes(tag);
                                        let activeClass = '';
                                        if (isSelected) {
                                          if (catObj.icon === '💼') activeClass = 'bg-blue-600 text-white border-blue-600 shadow-sm';
                                          else if (catObj.icon === '📈') activeClass = 'bg-emerald-600 text-white border-emerald-600 shadow-sm';
                                          else if (catObj.icon === '👥') activeClass = 'bg-purple-600 text-white border-purple-600 shadow-sm';
                                          else activeClass = 'bg-amber-600 text-white border-amber-600 shadow-sm';
                                        } else {
                                          activeClass = 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600';
                                        }
                                        return (
                                          <button
                                            key={tag}
                                            onClick={() => {
                                              const currentTags = cualidadesGenerales.tags || [];
                                              let newTags = [];
                                              if (currentTags.includes(tag)) {
                                                newTags = currentTags.filter(t => t !== tag);
                                              } else {
                                                newTags = [...currentTags, tag];
                                              }
                                              setCualidadesGenerales(prev => ({ ...prev, tags: newTags }));
                                            }}
                                            className={`px-2 py-1 rounded-lg border text-[8px] font-bold transition-all duration-200 cursor-pointer ${activeClass}`}
                                          >
                                            {tag}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <p className="text-[9px] font-black uppercase text-slate-500 mb-1">
                                📝 Trayectoria y Reseña de Experiencia
                              </p>
                              <textarea
                                value={cualidadesGenerales.detalle || ''}
                                onChange={(e) => setCualidadesGenerales(prev => ({ ...prev, detalle: e.target.value }))}
                                placeholder="Detalla su experiencia laboral (ventas, mercadeo, supervisión) y cualidades..."
                                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-medium outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* OBSERVACIÓN CUALITATIVA GLOBAL */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-4 border-b pb-4">
                              <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                                📝 Observación Cualitativa Global
                              </h3>
                              <button 
                                onClick={handleSaveObservacionGlobal}
                                disabled={isSaving}
                                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-40"
                              >
                                💾 Guardar
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mb-3">
                              Desempeño general, fortalezas y áreas de mejora durante todo el proceso.
                            </p>
                            <textarea
                              value={observacionGlobal}
                              onChange={(e) => setObservacionGlobal(e.target.value)}
                              placeholder="Ej. El asesor demuestra excelentes habilidades blandas y dominio de televentas..."
                              className="w-full h-44 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none"
                            />
                          </div>
                        </div>

                        {/* RECOMENDACIONES GENERALES */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-4 border-b pb-4">
                              <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                                💡 Recomendaciones Generales
                              </h3>
                              <button 
                                onClick={handleSaveRecomendaciones}
                                disabled={isSaving}
                                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-40"
                              >
                                💾 Guardar
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mb-3">
                              Consejos accionables y sugerencias estratégicas para el éxito del asesor.
                            </p>
                            <textarea
                              value={recomendaciones}
                              onChange={(e) => setRecomendaciones(e.target.value)}
                              placeholder="Ej. Se recomienda realizar acompañamiento en ruta durante su primer mes..."
                              className="w-full h-44 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* PLAN DE SEGUIMIENTO EN EL TIEMPO */}
                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black uppercase text-slate-800 border-b pb-4 mb-6">🗓️ Plan de Seguimiento Comercial (Llamadas / Acompañamiento en Calle)</h3>
                        
                        {/* FORMULARIO AGENDAR */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100 items-end">
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Fecha Programada</label>
                            <input 
                              type="date"
                              value={newSeguimiento.fecha_programada}
                              onChange={(e) => setNewSeguimiento({...newSeguimiento, fecha_programada: e.target.value})}
                              className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Actividad / Objetivo</label>
                            <input 
                              type="text"
                              placeholder="Ej. Llamada de feedback primera semana en calle"
                              value={newSeguimiento.actividad}
                              onChange={(e) => setNewSeguimiento({...newSeguimiento, actividad: e.target.value})}
                              className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-medium outline-none"
                            />
                          </div>
                          <button 
                            onClick={handleCreateSeguimiento}
                            disabled={isSaving || !newSeguimiento.fecha_programada || !newSeguimiento.actividad.trim()}
                            className="h-11 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md"
                          >
                            ➕ Programar Actividad
                          </button>
                        </div>

                        {/* LISTADO DE SEGUIMIENTOS */}
                        {seguimientos.length === 0 ? (
                          <p className="text-center py-8 text-xs font-bold text-slate-300 uppercase tracking-wider">No se han agendado actividades de seguimiento.</p>
                        ) : (
                          <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-6">
                            {seguimientos.map((seg) => (
                              <div key={seg.id} className="relative bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                {/* Dot on timeline */}
                                <div className={`absolute -left-[31px] top-6 w-3 h-3 rounded-full border-2 border-white ${seg.estado === 'realizado' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                
                                <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                                  <div>
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded">📅 {seg.fecha_programada}</span>
                                    <h4 className="text-xs font-black text-slate-800 uppercase mt-1">{seg.actividad}</h4>
                                  </div>
                                  <div className="flex gap-2">
                                    {seg.estado === 'pendiente' ? (
                                      <button 
                                        onClick={() => handleUpdateSeguimiento(seg.id, 'realizado', seg.observacion)}
                                        className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase hover:bg-emerald-100 transition-all"
                                      >
                                        ✓ Marcar Realizado
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleUpdateSeguimiento(seg.id, 'pendiente', seg.observacion)}
                                        className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase hover:bg-amber-100 transition-all"
                                      >
                                        ↺ Reabrir Pendiente
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Observaciones / Resultado en Calle</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      placeholder="Ej. Le fue muy bien, concretó 3 visitas pero tiene dudas en el manejo del inventario..."
                                      defaultValue={seg.observacion || ''}
                                      onBlur={(e) => seg.observacion = e.target.value}
                                      className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none"
                                    />
                                    <button 
                                      onClick={() => handleUpdateSeguimiento(seg.id, seg.estado, seg.observacion)}
                                      className="px-4 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase hover:bg-slate-800 transition-all"
                                    >
                                      Guardar Observación
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'incidencias' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Myriad Pro", Arial, sans-serif' }}>
                      {/* FORMULARIO DE REPORTE */}
                      <div style={{ background: '#ffffff', borderRadius: '8px', padding: '24px', border: '1px solid #e2e2e2', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#000000', borderBottom: '1px solid #e2e2e2', paddingBottom: '16px', marginBottom: '24px', margin: '0 0 0 0' }}>Registrar nueva eventualidad o inconveniente en calle</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px', background: '#f9fafb', padding: '24px', borderRadius: '8px', border: '1px solid #e2e2e2' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a8a8a', display: 'block', marginBottom: '6px', fontFamily: '"Myriad Pro", Arial, sans-serif' }}>Fecha del suceso</label>
                            <input 
                              type="date"
                              value={newIncidencia.fecha_reporte}
                              onChange={(e) => setNewIncidencia({...newIncidencia, fecha_reporte: e.target.value})}
                              style={{ width: '100%', height: '40px', background: '#ffffff', border: '1px solid #c6c6c6', borderRadius: '8px', padding: '0 12px', fontSize: '14px', fontWeight: '400', outline: 'none', boxSizing: 'border-box', fontFamily: '"Myriad Pro", Arial, sans-serif', color: '#000000', transition: 'border-color 150ms ease' }}
                              onFocus={e => { e.target.style.borderColor = '#a8a8a8'; }}
                              onBlur={e => { e.target.style.borderColor = '#c6c6c6'; }}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Clasificación de Eventualidad</label>
                            <select
                              value={newIncidencia.clasificacion || 'Otros'}
                              onChange={(e) => setNewIncidencia({...newIncidencia, clasificacion: e.target.value})}
                              className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none"
                            >
                              <option value="Mala Práctica">⚠️ Mala Práctica Comercial</option>
                              <option value="Problema Técnico">⚙️ Problema Técnico / AFV</option>
                              <option value="Ausencia / Tardanza">🕒 Ausencia / Tardanza Ruta</option>
                              <option value="Inconveniente en Calle">🚗 Inconveniente en Calle</option>
                              <option value="Reclamo de Cliente">💬 Reclamo de Cliente</option>
                              <option value="Otros">📦 Otros</option>
                            </select>
                          </div>
                          <div className="flex items-center h-14 md:mt-4">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={newIncidencia.requiere_seguimiento}
                                onChange={(e) => setNewIncidencia({...newIncidencia, requiere_seguimiento: e.target.checked})}
                                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                              />
                              <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">⚠️ ¿Requiere Seguimiento Preventivo?</span>
                            </label>
                          </div>
                          <div className="col-span-1 md:col-span-3">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Descripción del Inconveniente / Mala Práctica</label>
                            <textarea 
                              placeholder="Ej. Incumplimiento de horario de ruta o reporte incorrecto de visitas..."
                              value={newIncidencia.descripcion}
                              onChange={(e) => setNewIncidencia({...newIncidencia, descripcion: e.target.value})}
                              className="w-full h-20 bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <div className="col-span-1 md:col-span-1.5">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Observaciones / Análisis del Evaluador</label>
                            <textarea 
                              placeholder="Ej. Se conversó con el supervisor de zona..."
                              value={newIncidencia.observacion}
                              onChange={(e) => setNewIncidencia({...newIncidencia, observacion: e.target.value})}
                              className="w-full h-20 bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <div className="col-span-1 md:col-span-1.5">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Recomendaciones Correctivas</label>
                            <textarea 
                              placeholder="Ej. Reforzar el uso del GPS corporativo..."
                              value={newIncidencia.recomendaciones}
                              onChange={(e) => setNewIncidencia({...newIncidencia, recomendaciones: e.target.value})}
                              className="w-full h-20 bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button 
                            onClick={handleCreateIncidencia}
                            disabled={isSaving || !newIncidencia.descripcion.trim()}
                            className="bg-rose-600 text-white px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md shadow-rose-100 disabled:opacity-40"
                          >
                            🚨 Reportar Eventualidad
                          </button>
                        </div>
                      </div>

                      {/* HISTORIAL */}
                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black uppercase text-slate-800 border-b pb-4 mb-6">⚠️ Bitácora Histórica de Inconvenientes y Plan de Acción</h3>
                        
                        {incidencias.length === 0 ? (
                          <p className="text-center py-8 text-xs font-bold text-slate-300 uppercase tracking-wider">No se han registrado eventualidades en la labor del asesor.</p>
                        ) : (
                          <div className="space-y-6">
                            {incidencias.map((inc) => {
                              // Parsar clasificación y descripción
                              let clasif = 'Otros';
                              let descReal = inc.descripcion || '';
                              if (descReal.startsWith('[')) {
                                const match = descReal.match(/^\[(.*?)\]\s*(.*)$/);
                                if (match) {
                                  clasif = match[1];
                                  descReal = match[2];
                                }
                              }

                              const isEditing = editingIncidencia && editingIncidencia.id === inc.id;

                              return (
                                <div key={inc.id} className="bg-rose-50/30 p-6 rounded-[2rem] border border-rose-100 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-7xl pointer-events-none">🚨</div>

                                  {isEditing ? (
                                    <div className="space-y-4">
                                      <div className="flex justify-between items-center border-b pb-3 mb-2">
                                        <h4 className="text-[10px] font-black uppercase text-rose-700">✏️ Editar Eventualidad</h4>
                                        <span className="text-[8px] text-slate-400 font-mono">ID: {inc.id.substring(0, 8)}</span>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Fecha</label>
                                          <input 
                                            type="date"
                                            value={editingIncidencia.fecha_reporte}
                                            onChange={(e) => setEditingIncidencia({...editingIncidencia, fecha_reporte: e.target.value})}
                                            className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Clasificación</label>
                                          <select
                                            value={editingIncidencia.clasificacion}
                                            onChange={(e) => setEditingIncidencia({...editingIncidencia, clasificacion: e.target.value})}
                                            className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none"
                                          >
                                            <option value="Mala Práctica">⚠️ Mala Práctica</option>
                                            <option value="Problema Técnico">⚙️ Problema Técnico</option>
                                            <option value="Ausencia / Tardanza">🕒 Ausencia / Tardanza</option>
                                            <option value="Inconveniente en Calle">🚗 Inconveniente en Calle</option>
                                            <option value="Reclamo de Cliente">💬 Reclamo de Cliente</option>
                                            <option value="Otros">📦 Otros</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Estado de Seguimiento</label>
                                          <select
                                            value={editingIncidencia.estado_seguimiento}
                                            onChange={(e) => setEditingIncidencia({...editingIncidencia, estado_seguimiento: e.target.value})}
                                            disabled={!editingIncidencia.requiere_seguimiento}
                                            className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none disabled:opacity-40"
                                          >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="resuelto">Resuelto</option>
                                            <option value="no_aplica">No Aplica</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 cursor-pointer select-none">
                                        <input 
                                          type="checkbox"
                                          checked={editingIncidencia.requiere_seguimiento}
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            setEditingIncidencia({
                                              ...editingIncidencia, 
                                              requiere_seguimiento: checked,
                                              estado_seguimiento: checked ? 'pendiente' : 'no_aplica'
                                            });
                                          }}
                                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                                        />
                                        <span className="text-[9px] font-black uppercase text-rose-700 tracking-wider">⚠️ ¿Requiere Seguimiento Preventivo?</span>
                                      </div>

                                      <div>
                                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Descripción del Inconveniente</label>
                                        <textarea 
                                          value={editingIncidencia.descripcion}
                                          onChange={(e) => setEditingIncidencia({...editingIncidencia, descripcion: e.target.value})}
                                          className="w-full h-16 bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-1 focus:ring-rose-400"
                                        />
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Observaciones / Análisis del Evaluador</label>
                                          <textarea 
                                            value={editingIncidencia.observacion}
                                            onChange={(e) => setEditingIncidencia({...editingIncidencia, observacion: e.target.value})}
                                            className="w-full h-16 bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-1 focus:ring-rose-400"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Recomendaciones Correctivas</label>
                                          <textarea 
                                            value={editingIncidencia.recomendaciones}
                                            onChange={(e) => setEditingIncidencia({...editingIncidencia, recomendaciones: e.target.value})}
                                            className="w-full h-16 bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-1 focus:ring-rose-400"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex justify-end gap-2 pt-2">
                                        <button 
                                          onClick={() => setEditingIncidencia(null)}
                                          className="bg-slate-200 text-slate-700 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all"
                                        >
                                          Cancelar
                                        </button>
                                        <button 
                                          onClick={() => handleUpdateIncidencia(inc.id, editingIncidencia)}
                                          disabled={isSaving || !editingIncidencia.descripcion?.trim()}
                                          className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
                                        >
                                          💾 Guardar Cambios
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex justify-between items-start flex-wrap gap-2 mb-4 border-b border-rose-100/50 pb-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[8px] font-bold">📅 SUCESO: {inc.fecha_reporte}</span>
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                            clasif === 'Mala Práctica' ? 'bg-red-100 text-red-700 border border-red-200' :
                                            clasif === 'Problema Técnico' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                            clasif === 'Ausencia / Tardanza' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                            clasif === 'Inconveniente en Calle' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                            clasif === 'Reclamo de Cliente' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                          }`}>
                                            {clasif}
                                          </span>
                                        </div>
                                        
                                        <div className="flex gap-2 items-center">
                                          {inc.requiere_seguimiento ? (
                                            <>
                                              <span className="text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200 text-rose-800 border border-rose-300">
                                                Requiere Seguimiento
                                              </span>
                                              {inc.estado_seguimiento === 'pendiente' ? (
                                                <button 
                                                  onClick={() => handleUpdateIncidenciaEstado(inc.id, 'resuelto')}
                                                  className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase hover:bg-emerald-700 transition-all shadow-sm"
                                                >
                                                  ✓ Resolver Caso
                                                </button>
                                              ) : (
                                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg text-[8px] font-black uppercase">
                                                  Resuelto
                                                </span>
                                              )}
                                            </>
                                          ) : (
                                            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[8px] font-bold uppercase">No requiere seguimiento</span>
                                          )}

                                          {/* ACCIONES DE MANTENIMIENTO */}
                                          <button 
                                            onClick={() => {
                                              try {
                                                console.log("Intentando editar incidencia:", inc.id);
                                                setEditingIncidencia({
                                                  id: inc.id,
                                                  fecha_reporte: inc.fecha_reporte,
                                                  descripcion: descReal || '',
                                                  observacion: inc.observacion || '',
                                                  recomendaciones: inc.recomendaciones || '',
                                                  requiere_seguimiento: inc.requiere_seguimiento || false,
                                                  estado_seguimiento: inc.estado_seguimiento || 'pendiente',
                                                  clasificacion: clasif || 'Otros'
                                                });
                                              } catch (err) {
                                                alert("Error al abrir edición: " + err.message);
                                                console.error(err);
                                              }
                                            }}
                                            className="bg-slate-100 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg text-[10px] font-bold transition-all border border-slate-200"
                                            title="Editar Eventualidad"
                                          >
                                            ✏️
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteIncidencia(inc.id)}
                                            className="bg-slate-100 hover:bg-rose-50 text-rose-600 hover:text-rose-800 p-1.5 rounded-lg text-[10px] font-bold transition-all border border-slate-200"
                                            title="Eliminar Eventualidad"
                                          >
                                            🗑️
                                          </button>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs mt-2">
                                        <div className="bg-white p-4 rounded-xl border border-rose-100/30">
                                          <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Descripción del Incidente:</p>
                                          <p className="text-slate-700 leading-relaxed font-semibold">{descReal}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-rose-100/30">
                                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Observaciones / Análisis:</p>
                                          <p className="text-slate-600 leading-relaxed italic">{inc.observacion || 'Ninguna observación cargada.'}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-rose-100/30">
                                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Plan de Acción / Recomendaciones:</p>
                                          <p className="text-slate-600 leading-relaxed italic">{inc.recomendaciones || 'Ninguna sugerencia o recomendación registrada.'}</p>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* === PESTAÑA: IMAGEN PERSONAL === */}
                  {activeSubTab === 'imagen_personal' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Myriad Pro", Arial, sans-serif' }}>
                      <div style={{ background: '#ffffff', borderRadius: '8px', padding: '24px', border: '1px solid #e2e2e2', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#000000', borderBottom: '1px solid #e2e2e2', paddingBottom: '16px', marginBottom: '24px', margin: '0 0 0 0' }}>Evaluación de imagen personal y presentación</h3>
                        <p style={{ fontSize: '14px', color: '#666666', fontWeight: '400', marginBottom: '32px', lineHeight: '1.5' }}>Registra la evaluación de la presentación personal del asesor durante la inducción. Cada criterio se evalúa como <strong style={{ color: '#388e3c' }}>Cumple</strong>, <strong style={{ color: '#f57f17' }}>Parcialmente</strong> o <strong style={{ color: '#d32f2f' }}>No cumple</strong>.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                          {[
                            { key: 'afeitado', icon: '🪒', label: 'Afeitado e Higiene Facial', desc: 'Se presenta bien afeitado o con barba aseada y limpia' },
                            { key: 'vestimenta', icon: '👔', label: 'Vestimenta y Limpieza', desc: 'Ropa limpia, planchada y acorde al dress code corporativo' },
                            { key: 'cabello', icon: '💇', label: 'Cabello y Presentación General', desc: 'Cabello ordenado y apariencia general prolija' },
                            { key: 'lenguaje', icon: '🗣️', label: 'Lenguaje y Comunicación Verbal', desc: 'Habla con vocabulario apropiado, sin expresiones inadecuadas' },
                            { key: 'actitud', icon: '🎯', label: 'Actitud y Postura Corporal', desc: 'Actitud proactiva y postura profesional durante la inducción' },
                          ].map(({ key, icon, label, desc }) => (
                            <div key={key} style={{
                              padding: '16px',
                              borderRadius: '8px',
                              border: '1px solid',
                              borderColor: imagenPersonal[key] === 'Cumple' ? 'rgba(56,142,60,.4)' : imagenPersonal[key] === 'Parcialmente' ? 'rgba(245,127,23,.45)' : imagenPersonal[key] === 'No Cumple' ? 'rgba(211,47,47,.4)' : '#e2e2e2',
                              background: imagenPersonal[key] === 'Cumple' ? 'rgba(56,142,60,.06)' : imagenPersonal[key] === 'Parcialmente' ? 'rgba(245,127,23,.06)' : imagenPersonal[key] === 'No Cumple' ? 'rgba(211,47,47,.06)' : '#f9fafb',
                              transition: 'border-color 150ms ease, background 150ms ease',
                              fontFamily: '"Myriad Pro", Arial, sans-serif',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px 0' }}>{label}</p>
                                  <p style={{ fontSize: '12px', color: '#8a8a8a', fontWeight: '400', lineHeight: '1.5', margin: 0 }}>{desc}</p>
                                </div>
                                {imagenPersonal[key] && (
                                  <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    flexShrink: 0,
                                    color: imagenPersonal[key] === 'Cumple' ? '#388e3c' : imagenPersonal[key] === 'Parcialmente' ? '#f57f17' : '#d32f2f',
                                    border: '1px solid',
                                    borderColor: imagenPersonal[key] === 'Cumple' ? 'rgba(56,142,60,.4)' : imagenPersonal[key] === 'Parcialmente' ? 'rgba(245,127,23,.45)' : 'rgba(211,47,47,.4)',
                                    background: 'transparent',
                                  }}>{imagenPersonal[key]}</span>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {['Cumple', 'Parcialmente', 'No Cumple'].map(val => (
                                  <button
                                    key={val}
                                    onClick={() => setImagenPersonal(prev => ({ ...prev, [key]: val }))}
                                    style={{
                                      flex: 1,
                                      padding: '8px 0',
                                      borderRadius: '8px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.06em',
                                      transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
                                      cursor: 'pointer',
                                      fontFamily: '"Myriad Pro", Arial, sans-serif',
                                      border: '1px solid',
                                      background: imagenPersonal[key] === val
                                        ? val === 'Cumple' ? '#388e3c' : val === 'Parcialmente' ? '#f57f17' : '#d32f2f'
                                        : '#ffffff',
                                      color: imagenPersonal[key] === val ? '#ffffff' : '#666666',
                                      borderColor: imagenPersonal[key] === val
                                        ? val === 'Cumple' ? '#388e3c' : val === 'Parcialmente' ? '#f57f17' : '#d32f2f'
                                        : '#e2e2e2',
                                      boxShadow: imagenPersonal[key] === val ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                                    }}
                                  >
                                    {val === 'Cumple' ? '✓ Cumple' : val === 'Parcialmente' ? '~ Parcial' : '✗ No Cumple'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '24px', border: '1px solid #e2e2e2', marginBottom: '32px' }}>
                          <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a8a8a', display: 'block', marginBottom: '8px', fontFamily: '"Myriad Pro", Arial, sans-serif' }}>Observaciones adicionales de imagen personal</label>
                          <textarea
                            rows={4}
                            value={imagenPersonal.observaciones}
                            onChange={(e) => setImagenPersonal(prev => ({ ...prev, observaciones: e.target.value }))}
                            placeholder="Comentarios libres sobre la presentación personal del asesor durante la inducción..."
                            style={{ width: '100%', background: '#ffffff', border: '1px solid #c6c6c6', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', fontWeight: '400', outline: 'none', resize: 'none', lineHeight: '1.5', boxSizing: 'border-box', fontFamily: '"Myriad Pro", Arial, sans-serif', color: '#000000', transition: 'border-color 150ms ease' }}
                            onFocus={e => { e.target.style.borderColor = '#a8a8a8'; }}
                            onBlur={e => { e.target.style.borderColor = '#c6c6c6'; }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={handleSaveImagenPersonal}
                            disabled={isSaving}
                            style={{ background: isSaving ? 'rgba(198,198,198,.4)' : '#c6c6c6', color: isSaving ? '#8a8a8a' : '#000000', padding: '12px 32px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', cursor: isSaving ? 'default' : 'pointer', transition: 'background 150ms ease, color 150ms ease', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,.08)', fontFamily: '"Myriad Pro", Arial, sans-serif' }}
                            onMouseEnter={e => { if (!isSaving) { e.currentTarget.style.background = '#000000'; e.currentTarget.style.color = '#ffffff'; } }}
                            onMouseLeave={e => { if (!isSaving) { e.currentTarget.style.background = '#c6c6c6'; e.currentTarget.style.color = '#000000'; } }}
                          >
                            {isSaving ? 'Guardando...' : 'Guardar evaluación de imagen personal'}
                          </button>
                        </div>
                      </div>

                      {/* Resumen visual de la evaluación */}
                      {Object.values(imagenPersonal).some(v => v && v !== imagenPersonal.observaciones) && (
                        <div style={{ background: '#ffffff', borderRadius: '8px', padding: '24px', border: '1px solid #e2e2e2', boxShadow: '0 1px 3px rgba(0,0,0,.08)', fontFamily: '"Myriad Pro", Arial, sans-serif' }}>
                          <h4 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#000000', margin: '0 0 20px 0' }}>Resumen de criterios evaluados</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                            {[
                              { key: 'afeitado', label: 'Higiene facial' },
                              { key: 'vestimenta', label: 'Vestimenta' },
                              { key: 'cabello', label: 'Cabello' },
                              { key: 'lenguaje', label: 'Lenguaje' },
                              { key: 'actitud', label: 'Actitud' },
                            ].map(({ key, label }) => (
                              <div key={key} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '16px 8px',
                                borderRadius: '8px',
                                textAlign: 'center',
                                border: '1px solid',
                                borderColor: imagenPersonal[key] === 'Cumple' ? 'rgba(56,142,60,.4)' : imagenPersonal[key] === 'Parcialmente' ? 'rgba(245,127,23,.45)' : imagenPersonal[key] === 'No Cumple' ? 'rgba(211,47,47,.4)' : '#e2e2e2',
                                background: imagenPersonal[key] === 'Cumple' ? 'rgba(56,142,60,.06)' : imagenPersonal[key] === 'Parcialmente' ? 'rgba(245,127,23,.06)' : imagenPersonal[key] === 'No Cumple' ? 'rgba(211,47,47,.06)' : '#f9fafb',
                              }}>
                                <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4a4a4a', margin: '0 0 8px 0' }}>{label}</p>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  color: imagenPersonal[key] === 'Cumple' ? '#388e3c' : imagenPersonal[key] === 'Parcialmente' ? '#f57f17' : imagenPersonal[key] === 'No Cumple' ? '#d32f2f' : '#8a8a8a',
                                }}>{imagenPersonal[key] || 'Sin eval.'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'resumen' && selectedAsesor && (
          <ResumenEvaluaciones selectedAsesor={selectedAsesor} submodulos={submodulos} notasGuardadas={notasGuardadas} />
        )}

        {viewMode === 'automatico' && (
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden">
             <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-black text-slate-900">Validación de Aspirantes</h3>
                <input type="text" placeholder="Buscar..." className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs outline-none w-72" onChange={(e) => setSearchTermAuto(e.target.value)}/>
             </div>
             <table className="w-full text-left">
                <thead className="bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest"><tr>
                   <th className="px-8 py-4">Aspirante</th>
                   <th className="px-8 py-4">Empresa / Ramo</th>
                   <th className="px-8 py-4">Ubicación</th>
                   <th className="px-8 py-4 text-center">Acciones</th>
                </tr></thead>
                <tbody>
                  {notasAutomaticas.filter(n => (n.nombre_apellido || '').toLowerCase().includes(searchTermAuto.toLowerCase())).map((nota) => (
                    <tr key={nota.id} className="border-b border-slate-50 hover:bg-slate-50 transition-all">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                                 {nota.foto_url ? (
                                    <a href={nota.foto_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                                        <img 
                                          src={getGoogleDriveThumbnail(nota.foto_url)} 
                                          alt="Foto" 
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover transition-opacity" 
                                          onError={(e) => {
                                              e.target.style.display = 'none';
                                              if(e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                                          }}
                                        />
                                        <div className="absolute inset-0 items-center justify-center bg-slate-100 text-slate-400 text-xs font-black" style={{ display: 'none' }}>
                                            {nota.nombre_apellido?.substring(0,1)}
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300" title="Ver Foto Original">
                                            <span className="text-sm">🔗</span>
                                        </div>
                                    </a>
                                 ) : (
                                     <span className="text-slate-400 text-xs font-black">{nota.nombre_apellido?.substring(0,1)}</span>
                                 )}
                             </div>
                             <div>
                                <p className="text-xs font-bold text-slate-800">{nota.nombre_apellido}</p>
                                <p className="text-[9px] text-slate-400 font-medium">Ced: {nota.cedula} • Tel: {nota.telefono || '-'}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-4 text-[10px] text-slate-600">
                          <p className="font-bold">{nota.empresa_excel}</p>
                          <p className="text-[9px] text-slate-400 uppercase">{nota.ramo || '-'}</p>
                       </td>
                       <td className="px-8 py-4 text-[10px] text-slate-600">
                          <p className="font-bold">{nota.estado || '-'}</p>
                          <p className="text-[9px] text-slate-400 uppercase">{nota.zona || '-'}</p>
                       </td>
                       <td className="px-8 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleOpenEdit(nota, 'candidato')} className="bg-white border border-slate-200 text-slate-600 px-3 py-2.5 rounded-full text-[9px] font-black uppercase hover:bg-slate-50 transition-all">✏️</button>
                            <button onClick={async () => {
                                setCandidatoAlta(nota);
                                await checkExistenciaCandidato(nota.email_contacto, true);
                                setShowAltaModal(true);
                            }} className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase hover:bg-blue-700 transition-all">Configurar Itinerario</button>
                          </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        )}

        {viewMode === 'mi-academia' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* CABECERA DE DEPARTAMENTO */}
             <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 flex items-center justify-between overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl">📚</div>
                <div className="relative z-10">
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2 block">Departamento Autorizado</span>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{departamento?.nombre || 'General / Admin'}</h2>
                   <p className="text-sm text-slate-400 mt-2 font-medium">Usted tiene autoridad para evaluar los siguientes temas académicos.</p>
                </div>
                <div className="bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Temas Cargados</p>
                   <p className="text-2xl font-black text-slate-900">{submodulos.length}</p>
                </div>
             </div>

             {/* LISTA DE TEMAS */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {submodulos.length > 0 ? (
                  submodulos.map((sub) => (
                    <div key={sub.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                       <div className="absolute top-4 right-4 flex gap-2">
                           {sub.duracion_horas && (
                             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">⏱️ {sub.duracion_horas} Horas</span>
                           )}
                        </div>
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">📘</div>
                       <h4 className="text-xs font-black text-slate-900 mb-2 uppercase tracking-tight leading-tight">{sub.nombre_tarea}</h4>
                       <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">{sub.descripcion || 'Sin descripción detallada.'}</p>
                       <div className="h-[2px] w-12 bg-blue-100 group-hover:w-full transition-all duration-500"></div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
                     <p className="text-sm text-slate-400 font-bold uppercase tracking-widest italic">Aun no hay temas cargados en su biblioteca.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {viewMode === 'reportes' && (
          <ReporteNotas onBack={() => setViewMode('manual')} />
        )}

        {viewMode === 'departamentos' && (
          <div className="animate-in fade-in duration-500 space-y-8">
            {/* HEADER */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900">Mantenimiento de Departamentos</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Crear, renombrar y eliminar departamentos del itinerario</p>
              </div>
              <span className="text-4xl font-black text-teal-600">{todosDeptos.length}</span>
            </div>

            <div className="grid grid-cols-12 gap-8">
              {/* FORMULARIO CREAR */}
              <div className="col-span-4">
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Nuevo Departamento</h4>
                  <input
                    type="text"
                    value={newDeptoNombre}
                    onChange={(e) => setNewDeptoNombre(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateDepto()}
                    placeholder="Nombre del departamento..."
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-teal-400 transition-all mb-4"
                  />
                  <button
                    onClick={handleCreateDepto}
                    disabled={isSaving || !newDeptoNombre.trim()}
                    className="w-full py-3 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-700 disabled:opacity-40 transition-all"
                  >
                    + Crear Departamento
                  </button>
                  {message && (
                    <p className="mt-4 text-[10px] font-black text-center text-teal-600 uppercase tracking-widest">{message}</p>
                  )}
                </div>
              </div>

              {/* LISTA */}
              <div className="col-span-8">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departamentos Activos</h4>
                    <button onClick={fetchDepartamentos} className="text-[9px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-all">↺ Actualizar</button>
                  </div>
                  {todosDeptos.length === 0 ? (
                    <div className="py-20 text-center text-slate-300 font-bold text-xs uppercase tracking-widest">
                      No hay departamentos registrados
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {todosDeptos.map(d => (
                        <div key={d.id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-all group">
                          {editDeptoId === d.id ? (
                            // MODO EDICIÓN
                            <div className="flex gap-3 flex-1 mr-4">
                              <input
                                autoFocus
                                type="text"
                                value={editDeptoNombre}
                                onChange={(e) => setEditDeptoNombre(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleUpdateDepto(d.id);
                                  if (e.key === 'Escape') { setEditDeptoId(null); setEditDeptoNombre(''); }
                                }}
                                className="flex-1 h-10 px-4 bg-white border-2 border-teal-400 rounded-xl text-sm font-bold outline-none"
                              />
                              <button
                                onClick={() => handleUpdateDepto(d.id)}
                                className="px-4 h-10 bg-teal-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all"
                              >✓ Guardar</button>
                              <button
                                onClick={() => { setEditDeptoId(null); setEditDeptoNombre(''); }}
                                className="px-4 h-10 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                              >✕</button>
                            </div>
                          ) : (
                            // MODO VISTA
                            <>
                              <div>
                                <p className="text-sm font-black text-slate-900">{d.nombre}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {d.id}</p>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={() => { setEditDeptoId(d.id); setEditDeptoNombre(d.nombre); }}
                                  className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-50 hover:text-teal-700 transition-all"
                                >✏️ Editar</button>
                                <button
                                  onClick={() => handleDeleteDepto(d.id, d.nombre)}
                                  className="px-4 py-2 bg-slate-100 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                                >🗑️ Eliminar</button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ADVERTENCIA */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">⚠️ Precaución</p>
              <p className="text-xs text-amber-600 font-medium mt-1">Eliminar un departamento eliminará también todos los temas asociados y podría afectar los itinerarios de inducción activos. Use con cuidado.</p>
            </div>
          </div>
        )}

        {viewMode === 'escenarios' && (
           <div className="animate-in fade-in duration-500">
              <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-200 mb-10">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                       <h3 className="text-xl font-black text-slate-900 leading-tight">Matriz de Escenarios por Casa</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gestión centralizada de desafíos situacionales</p>
                    </div>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                       {['Febeca', 'Beval', 'Sillaca', 'Cofersa', 'Mundial de Partes'].map(casa => (
                         <button 
                           key={casa} 
                           onClick={() => setActiveCompanyEscenarios(casa)}
                           className={`px-6 py-2.5 rounded-[1.2rem] text-[9px] font-black uppercase tracking-tighter transition-all ${activeCompanyEscenarios === casa ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                         >
                            {casa}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                 {[1,2,3,4,5,6,7,8,9,10].map(num => (
                   <div key={num} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center group">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-[1.8rem] flex items-center justify-center text-2xl font-black mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {num}
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-slate-900 mb-2">Escenario {num}</h4>
                      <p className="text-[9px] text-slate-400 font-bold mb-6 italic">{activeCompanyEscenarios}</p>
                      
                      <div className="w-full flex flex-col gap-2">
                         <label className={`w-full h-10 rounded-xl flex items-center justify-center text-[8px] font-black uppercase tracking-widest cursor-pointer transition-all ${masterEscenarios[num] ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                             {masterEscenarios[num] ? '✅ ACTUALIZAR PDF' : '📁 CARGAR PDF'}
                             <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleUploadEscenario(num, e.target.files[0])} />
                         </label>
                         {masterEscenarios[num] && (
                            <button 
                              onClick={() => window.open(masterEscenarios[num], '_blank')}
                              className="w-full h-10 bg-white border border-green-100 rounded-xl text-[8px] font-black uppercase tracking-widest text-green-600 hover:bg-green-50 transition-all"
                            >
                               👁️ VER ACTUAL
                            </button>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {viewMode === 'configuracion' && (
          <div className="grid grid-cols-12 gap-8">
            {/* PANEL IZQUIERDO: FORM */}
            <div className="col-span-4">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 sticky top-6">
                <h3 className="text-lg font-black text-slate-900 mb-1">Agregar Tema</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Biblioteca Global</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Departamento</label>
                    <select
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      value={deptoSeleccionado}
                      onChange={(e) => { setDeptoSeleccionado(e.target.value); setDepartamento(todosLosDepartamentos.find(d => d.id === e.target.value)); }}
                    >
                      <option value="">Seleccione departamento...</option>
                      {todosLosDepartamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nombre del Tema</label>
                    <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="Ej: Manejo del AFV..." value={newSubmodulo.nombre} onChange={(e) => setNewSubmodulo({...newSubmodulo, nombre: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Descripción</label>
                    <textarea className="w-full h-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none" placeholder="Descripción corta..." value={newSubmodulo.descripcion} onChange={(e) => setNewSubmodulo({...newSubmodulo, descripcion: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Horas</label>
                    <input type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="Ej: 2" value={newSubmodulo.horas} onChange={(e) => setNewSubmodulo({...newSubmodulo, horas: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Recursos (Enlaces / Descargables)</label>
                    <textarea className="w-full h-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none" placeholder="- Presentación\n- Manual del AFV..." value={newSubmodulo.recursos || ''} onChange={(e) => setNewSubmodulo({...newSubmodulo, recursos: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                       Contenido Evaluado (Actividades)
                       <button onClick={() => setNewSubmodulo({...newSubmodulo, contenido: [...(newSubmodulo.contenido||[]), {actividad:'', peso:0}]})} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[8px] hover:bg-blue-200">+ Añadir</button>
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                       {(newSubmodulo.contenido || []).map((act, idx) => (
                         <div key={idx} className="flex gap-2 items-center">
                            <input type="text" placeholder="Actividad..." className="flex-1 h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px]" value={act.actividad} onChange={(e) => { const n = [...newSubmodulo.contenido]; n[idx].actividad = e.target.value; setNewSubmodulo({...newSubmodulo, contenido: n}); }} />
                            <input type="number" placeholder="Peso %" className="w-16 h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-center" value={act.peso} onChange={(e) => { const n = [...newSubmodulo.contenido]; n[idx].peso = e.target.value; setNewSubmodulo({...newSubmodulo, contenido: n}); }} />
                            <button onClick={() => { const n = [...newSubmodulo.contenido]; n.splice(idx,1); setNewSubmodulo({...newSubmodulo, contenido: n}); }} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                         </div>
                       ))}
                       {newSubmodulo.contenido?.length > 0 && (
                          <div className={`text-[9px] font-black text-right ${newSubmodulo.contenido.reduce((acc, a) => acc + (parseFloat(a.peso)||0), 0) !== 100 ? 'text-orange-500' : 'text-green-500'}`}>
                             Total Peso: {newSubmodulo.contenido.reduce((acc, a) => acc + (parseFloat(a.peso)||0), 0)}%
                          </div>
                       )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <input 
                      type="checkbox" 
                      id="es_interno"
                      checked={newSubmodulo.es_interno || false} 
                      onChange={(e) => setNewSubmodulo({...newSubmodulo, es_interno: e.target.checked})}
                      className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="es_interno" className="text-[10px] font-black text-blue-900 uppercase tracking-tight cursor-pointer">
                      Actividad Interna (Solo Tutor)
                    </label>
                  </div>
                  <button 
                    onClick={isEditingSub ? handleUpdateSubmodulo : handleAddSubmodulo} 
                    disabled={isSaving || !deptoSeleccionado || !newSubmodulo.nombre} 
                    className={`w-full h-14 ${isEditingSub ? 'bg-amber-600' : 'bg-blue-600'} text-white font-black uppercase text-sm rounded-2xl shadow-xl hover:opacity-90 transition-all disabled:opacity-40`}
                  >
                    {isSaving ? 'Procesando...' : (isEditingSub ? 'Actualizar Tema' : 'Guardar Tema')}
                  </button>
                  {isEditingSub && (
                    <button 
                      onClick={() => { setIsEditingSub(null); setNewSubmodulo({ nombre: '', descripcion: '', horas: '', es_interno: false, contenido: [], recursos: '' }); }} 
                      className="w-full h-10 text-slate-400 font-bold uppercase text-[10px] hover:text-slate-600"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* PANEL DERECHO: LISTA */}
            <div className="col-span-8">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6 border-b pb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{deptoSeleccionado ? todosLosDepartamentos.find(d => d.id === deptoSeleccionado)?.nombre : 'Todos los Temas'}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{(deptoSeleccionado ? submodulos.filter(s => s.id_departamento === deptoSeleccionado) : submodulos).length} temas</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mb-6">
                  <button onClick={() => setDeptoSeleccionado('')} className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all ${!deptoSeleccionado ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Todos</button>
                  {todosLosDepartamentos.map(d => (
                    <button key={d.id} onClick={() => { setDeptoSeleccionado(d.id); setDepartamento(d); }} className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all ${deptoSeleccionado === d.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{d.nombre}</button>
                  ))}
                </div>
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
                  {(deptoSeleccionado ? submodulos.filter(s => s.id_departamento === deptoSeleccionado) : submodulos).length === 0 ? (
                    <div className="py-20 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                      <p className="text-sm text-slate-300 font-black uppercase tracking-widest">Sin temas registrados</p>
                      <p className="text-xs text-slate-300 mt-2">Agrega uno desde el formulario</p>
                    </div>
                  ) : (
                    (deptoSeleccionado ? submodulos.filter(s => s.id_departamento === deptoSeleccionado) : submodulos).map(sub => (
                      <div key={sub.id} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 text-base">📘</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-800">
                            {sub.nombre_tarea}
                            {sub.es_interno && <span className="ml-2 text-[8px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">Interno</span>}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            {sub.duracion_horas && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{sub.duracion_horas}h</span>}
                            <span className="text-[10px] text-slate-400 truncate">{sub.descripcion || 'Sin descripcion'}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setIsEditingSub(sub.id);
                            setNewSubmodulo({
                              nombre: sub.nombre_tarea,
                              descripcion: sub.descripcion || '',
                              horas: sub.duracion_horas || '',
                              es_interno: sub.es_interno || false,
                              contenido: sub.contenido || [],
                              recursos: sub.recursos || ''
                            });
                            // Asegurar que el departamento esté seleccionado
                            setDeptoSeleccionado(sub.id_departamento);
                          }} 
                          className="w-9 h-9 bg-white border border-slate-200 text-slate-300 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                        >
                          ✏️
                        </button>
                        <button onClick={() => handleDeleteSubmodulo(sub.id)} className="w-9 h-9 bg-white border border-slate-200 text-slate-300 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0">🗑️</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'responsables' && (
          <div className="grid grid-cols-12 gap-8">
            {/* PANEL IZQUIERDO: ASIGNAR */}
            <div className="col-span-4">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 sticky top-6">
                <h3 className="text-lg font-black text-slate-900 mb-1">Asignar Responsable</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Evaluador por Departamento</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Evaluador</label>
                    <select
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                      value={evalSeleccionado}
                      onChange={(e) => setEvalSeleccionado(e.target.value)}
                    >
                      <option value="">Seleccione evaluador...</option>
                      {todosLosEvaluadores.map(e => (
                        <option key={e.id} value={e.id}>{e.nombre} — {e.empresa}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Departamento</label>
                    <select
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                      value={deptoParaAsignar}
                      onChange={(e) => setDeptoParaAsignar(e.target.value)}
                    >
                      <option value="">Seleccione departamento...</option>
                      {todosLosDepartamentos.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAsignarResponsable}
                    disabled={isSaving || !evalSeleccionado || !deptoParaAsignar}
                    className="w-full h-14 bg-emerald-600 text-white font-black uppercase text-sm rounded-2xl shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-40"
                  >
                    {isSaving ? 'Guardando...' : 'Asignar Responsable'}
                  </button>
                </div>

                {/* RESUMEN */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Estado actual</p>
                  <div className="flex justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-black text-emerald-600">{responsables.length}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Asignaciones</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-orange-500">{todosLosDepartamentos.filter(d => !responsables.find(r => r.id_departamento === d.id)).length}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Sin Responsable</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-blue-600">{todosLosEvaluadores.length}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Evaluadores</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOQUE PROMOVER A EVALUADOR */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 mt-6 sticky top-[480px]">
                <h3 className="text-lg font-black text-slate-900 mb-1">Promover Usuario</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Convertir asesor a evaluador</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Asesor (Participante)</label>
                    <select
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                      value={asesorParaPromover}
                      onChange={(e) => setAsesorParaPromover(e.target.value)}
                    >
                      <option value="">Seleccione asesor...</option>
                      {asesores.map(a => (
                        <option key={a.id} value={a.id}>{a.nombre} — {a.empresa}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handlePromoverEvaluador}
                    disabled={isSaving || !asesorParaPromover}
                    className="w-full h-14 bg-slate-900 text-white font-black uppercase text-sm rounded-2xl shadow-xl hover:bg-slate-800 transition-all disabled:opacity-40"
                  >
                    {isSaving ? 'Guardando...' : 'Promover a Evaluador'}
                  </button>
                </div>
              </div>
            </div>

            {/* PANEL DERECHO: TABLA */}
            <div className="col-span-8">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">Mapa de Responsables</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Quien da la induccion la evalua</p>
                </div>

                {/* DEPARTAMENTOS SIN RESPONSABLE */}
                {todosLosDepartamentos.filter(d => !responsables.find(r => r.id_departamento === d.id)).length > 0 && (
                  <div className="px-8 py-4 bg-orange-50 border-b border-orange-100">
                    <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2">Sin responsable asignado:</p>
                    <div className="flex gap-2 flex-wrap">
                      {todosLosDepartamentos
                        .filter(d => !responsables.find(r => r.id_departamento === d.id))
                        .map(d => (
                          <span key={d.id} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">{d.nombre}</span>
                        ))}
                    </div>
                  </div>
                )}

                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">Departamento</th>
                      <th className="px-8 py-5">Responsable</th>
                      <th className="px-8 py-5">Empresa</th>
                      <th className="px-8 py-5 text-center">Accion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {responsables.length === 0 ? (
                      <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-300 text-sm font-black uppercase tracking-widest">Sin asignaciones registradas</td></tr>
                    ) : (
                      responsables.map((r, i) => {
                        const evaluador = todosLosEvaluadores.find(e => e.usuario === r.email);
                        return (
                          <tr key={i} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-8 py-5">
                              <span className="text-sm font-black text-slate-800">{r.departamentos?.nombre || 'Sin depto'}</span>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                                  {(evaluador?.nombre || r.email).substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{evaluador?.nombre || r.nombre_completo || r.email}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{r.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-xs font-bold text-slate-500 uppercase">{evaluador?.empresa || '-'}</span>
                            </td>
                            <td className="px-8 py-5 text-center">
                              <button
                                onClick={() => handleRemoverResponsable(r.email, r.id_departamento)}
                                className="w-9 h-9 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-transparent transition-all mx-auto"
                              >🗑️</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ALTA VERSION MEJORADA */}
        {showAltaModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-6">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{esReintento ? 'Reiniciar Inducción' : 'Iniciar Nueva Inducción'}</h3>
                        <p className="text-xs font-bold text-blue-600 uppercase mt-1">{candidatoAlta?.nombre_apellido}</p>
                    </div>
                </div>

                {esReintento && (
                    <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-5 mb-6">
                        <label className="text-[9px] font-black uppercase text-orange-600 block mb-2">Motivo del Reinicio (Obligatorio)</label>
                        <textarea value={motivoReinicio} onChange={(e) => setMotivoReinicio(e.target.value)} placeholder="Ej: No cumplió con la asistencia mínima..." className="w-full h-24 bg-white border border-orange-200 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-orange-400"></textarea>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto mb-6 p-2">
                   {todosLosDepartamentos.map(d => {
                     const it = itinerarioConfig.find(i => i.id_depto === d.id);
                     return (
                       <div key={d.id} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${it ? 'border-blue-600 bg-blue-50 shadow-inner' : 'border-slate-50 hover:border-slate-200'}`} onClick={() => {
                         if(it) setItinerarioConfig(itinerarioConfig.filter(i => i.id_depto !== d.id));
                         else setItinerarioConfig([...itinerarioConfig, {id_depto: d.id, dias: 2}]);
                       }}>
                          <p className="text-[10px] font-black text-slate-700">{d.nombre}</p>
                          {it && <input type="number" placeholder="Días" value={it.dias} onClick={e => e.stopPropagation()} onChange={e => setItinerarioConfig(itinerarioConfig.map(i => i.id_depto === d.id ? {...i, dias: e.target.value} : i))} className="mt-2 w-full h-8 bg-white border border-blue-200 rounded-lg text-center text-[10px] font-black text-blue-700"/>}
                       </div>
                    );
                   })}
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setShowAltaModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase text-[10px] rounded-2xl">Cerrar</button>
                    <button onClick={procesarAlta} disabled={esReintento && !motivoReinicio} className="flex-[2] py-4 bg-blue-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl hover:bg-blue-700 disabled:opacity-50">Confirmar e Iniciar Etapa →</button>
                </div>
            </div>
          </div>
        )}

        {/* MODAL EDICION DE DATOS */}
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[101] p-6">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                          {editType === 'usuario' ? 'Editar Datos del Asesor' : 'Editar Datos del Aspirante'}
                        </h3>
                        <p className="text-xs font-bold text-blue-600 uppercase mt-1">Corrección de Información Sincronizada</p>
                    </div>
                    <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="col-span-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Nombre Completo</label>
                        <input 
                          type="text" 
                          value={editType === 'usuario' ? editData.nombre : editData.nombre_apellido} 
                          onChange={(e) => setEditData(editType === 'usuario' ? { ...editData, nombre: e.target.value } : { ...editData, nombre_apellido: e.target.value })}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className={editType === 'usuario' ? 'col-span-1' : 'col-span-2'}>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Correo Electrónico (Personal)</label>
                        <input 
                          type="email" 
                          value={editType === 'usuario' ? editData.correo : editData.email_contacto} 
                          onChange={(e) => setEditData(editType === 'usuario' ? { ...editData, correo: e.target.value } : { ...editData, email_contacto: e.target.value })}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    {editType === 'usuario' && (
                      <div className="col-span-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Correo Corporativo</label>
                          <input 
                            type="email" 
                            value={editData.correo_corporativo || ''} 
                            placeholder="ejemplo@empresa.com"
                            onChange={(e) => setEditData({ ...editData, correo_corporativo: e.target.value })}
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                          />
                      </div>
                    )}
                    {editType === 'candidato' && (
                      <div>
                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Cédula / ID</label>
                          <input 
                            type="text" 
                            value={editData.cedula} 
                            onChange={(e) => setEditData({ ...editData, cedula: e.target.value })}
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                          />
                      </div>
                    )}
                    <div className={editType === 'usuario' ? 'col-span-2' : ''}>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Empresa</label>
                        <select 
                          value={editType === 'usuario' ? editData.empresa : editData.empresa_excel} 
                          onChange={(e) => setEditData(editType === 'usuario' ? { ...editData, empresa: e.target.value } : { ...editData, empresa_excel: e.target.value })}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="Febeca">Febeca</option>
                          <option value="Beval">Beval</option>
                          <option value="Sillaca">Sillaca</option>
                          <option value="Cofersa">Cofersa</option>
                          <option value="Mundial de Partes">Mundial de Partes</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Ramo</label>
                        <input 
                          type="text" 
                          value={editData.ramo || ''} 
                          onChange={(e) => setEditData({ ...editData, ramo: e.target.value })}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Teléfono</label>
                        <input 
                          type="text" 
                          value={editData.telefono || ''} 
                          onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Estado / Ubicación</label>
                        <input 
                          type="text" 
                          value={editData.estado || ''} 
                          onChange={(e) => setEditData({ ...editData, estado: e.target.value })}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Zona</label>
                        <input 
                          type="text" 
                          value={editData.zona || ''} 
                          onChange={(e) => setEditData({ ...editData, zona: e.target.value })}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Fecha de Ingreso</label>
                        <input 
                          type="text" 
                          value={editData.fecha_ingreso || ''} 
                          placeholder="Ej: 01/01/2024"
                          onChange={(e) => setEditData({ ...editData, fecha_ingreso: e.target.value })}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Inicio en Calle (Real)</label>
                        <input 
                          type="text" 
                          value={editData.fecha_inicio_calle || ''} 
                          placeholder="Si se deja vacío: Ingreso + 18 días"
                          onChange={(e) => setEditData({ ...editData, fecha_inicio_calle: e.target.value })}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    {editType === 'usuario' && (
                      <div className="col-span-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Foto de Perfil</label>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setEditPhotoFile(e.target.files[0])}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          {editData.foto_url && !editPhotoFile && (
                            <p className="text-[9px] text-slate-500 mt-1">Ya tiene una foto subida. Seleccionar un nuevo archivo la reemplazará.</p>
                          )}
                      </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase text-[10px] rounded-2xl">Cancelar</button>
                    <button onClick={handleSaveEdit} disabled={isSaving} className="flex-[2] py-4 bg-blue-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl hover:bg-blue-700 disabled:opacity-50">
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
          </div>
        )}

        {showGestionCalleModal && (
          <GestionBuddiesYActividades onClose={() => setShowGestionCalleModal(false)} />
        )}

        {showAsignacionCalleModal && selectedAsesor && (
          <AsignacionActividadesCalleModal
            asesor={selectedAsesor}
            onClose={() => setShowAsignacionCalleModal(false)}
            onSaved={() => fetchInitialData()}
          />
        )}

        {showFormularioCalleModal && selectedAsesor && (
          <FormularioAcompanamientoCalle
            asesor={selectedAsesor}
            onClose={() => setShowFormularioCalleModal(false)}
          />
        )}

        {/* MODAL DE ADVERTENCIA Y DECISIÓN DE RECÁLCULO DE PONDERACIÓN */}
        {showRecalcularModal && pendingRecalculateData && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl font-black">
                  ⚖️
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Actualización de Ponderación (%)</h3>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Cambio en las actividades o pesos del tema</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 space-y-2">
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  Has modificado la estructura o los porcentajes de peso de: <br/>
                  <strong className="text-slate-900 text-sm">"{pendingRecalculateData.submoduloNombre}"</strong>
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Se encontraron <strong className="text-blue-600 font-black">{pendingRecalculateData.notasAfectadas.length} evaluaciones registradas</strong> en este tema con la ponderación anterior.
                </p>

                {/* Lista de asesores afectados */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2">Asesores con notas previas en este tema:</p>
                  <div className="max-h-28 overflow-y-auto flex flex-wrap gap-1.5 pr-1">
                    {pendingRecalculateData.notasAfectadas.map((n, i) => (
                      <span key={n.id || i} className="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1.5 shadow-sm">
                        <span>👤 {n.usuarios?.nombre || 'Asesor'}</span>
                        <span className="bg-slate-100 text-blue-700 px-1 rounded font-mono text-[8px] font-black">Nota: {n.nota}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => executeSaveSubmodulo(true)}
                  disabled={isSaving}
                  className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>🔄 Recalcular y actualizar todas las notas ({pendingRecalculateData.notasAfectadas.length})</span>
                </button>

                <button
                  onClick={() => executeSaveSubmodulo(false)}
                  disabled={isSaving}
                  className="w-full py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>📁 Solo guardar tema (Conservar notas históricas sin alterar)</span>
                </button>

                <button
                  onClick={() => {
                    setShowRecalcularModal(false);
                    setPendingRecalculateData(null);
                  }}
                  disabled={isSaving}
                  className="w-full py-2.5 text-slate-400 hover:text-slate-600 rounded-xl text-[10px] font-bold uppercase transition-all"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL INSTRUMENTO SEDE */}
        {showInstrumentoModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-black text-lg tracking-tight">Instrumento de Inducción</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Generar Hoja Física</p>
                </div>
                <button onClick={() => setShowInstrumentoModal(false)} className="text-white hover:bg-white/20 p-2 rounded-xl transition-all">✕</button>
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-500 font-medium mb-4">Seleccione el departamento del cual desea imprimir la hoja de evaluación para que sea llenada a mano.</p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {itinerarioActual.map(it => {
                    const depto = it.departamentos;
                    if (!depto) return null;
                    return (
                      <button
                        key={it.id}
                        onClick={() => {
                          const deptoActividades = submodulos.filter(sm => sm.id_departamento === depto.id);
                          setInstrumentoConfig({
                            asesor: selectedAsesor,
                            departamento: depto,
                            actividades: deptoActividades
                          });
                          setShowInstrumentoModal(false);
                        }}
                        className="w-full text-left p-4 border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                      >
                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-700">{depto.nombre}</h4>
                      </button>
                    );
                  })}
                </div>
                {itinerarioActual.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4 italic">El asesor no tiene itinerario configurado.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {message && <div className="fixed bottom-10 right-10 bg-slate-900 text-white px-10 py-5 rounded-3xl shadow-2xl animate-in slide-in-from-right font-black uppercase text-[10px] z-[200] border-2 border-slate-700">{message}</div>}
      </div>
    </div>
  );
};


export default ConsolaEvaluacion;
