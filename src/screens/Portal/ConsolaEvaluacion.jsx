import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ReporteNotas from './ReporteNotas';

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
  
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w800` : url;
};

const EvidenciaCard = ({ evidencia, onSave, onDelete, isSaving }) => {
  const [nota, setNota] = useState(evidencia.nota_ejercicio ?? '');
  const [feedback, setFeedback] = useState(evidencia.feedback_evaluador ?? '');
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
          <input
            type="number" min="0" max="100" value={nota}
            onChange={(e) => setNota(Math.min(100, Math.max(0, e.target.value)))}
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
          onClick={() => onSave(evidencia.id, nota, feedback)}
          disabled={isSaving || nota === ''}
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

const ConsolaEvaluacion = ({ user, onBack }) => {
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
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_sincronizacion', direction: 'desc' });
  
  // Estados para activación de itinerario e historial
  const [showAltaModal, setShowAltaModal] = useState(false);
  const [candidatoAlta, setCandidatoAlta] = useState(null);
  const [itinerarioConfig, setItinerarioConfig] = useState([]);
  const [motivoReinicio, setMotivoReinicio] = useState('');
  const [esReintento, setEsReintento] = useState(false);
  
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
    requiere_seguimiento: false 
  });
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
  const [isEditingSub, setIsEditingSub] = useState(null); // ID del submodulo en edición

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
      setObservacionGlobal(selectedAsesor.observacion_cualitativa || '');
      setRecomendaciones(selectedAsesor.recomendaciones || '');
      fetchSeguimientos(selectedAsesor.id);
      fetchIncidencias(selectedAsesor.id);
      setActiveSubTab('evaluacion');
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

  const handleSaveNotaRoleplay = async (evidenciaId, nota, feedback) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.schema('portal_afv').from('ejercicios_evidencias').update({
        nota_ejercicio: parseFloat(nota),
        feedback_evaluador: feedback
      }).eq('id', evidenciaId);
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

  const handleSaveObservacionGlobal = async () => {
    if (!selectedAsesor) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .schema('portal_afv')
        .from('usuarios')
        .update({ observacion_cualitativa: observacionGlobal })
        .eq('id', selectedAsesor.id);

      if (error) throw error;

      setMessage('✅ Observación global guardada con éxito.');
      
      setAsesores(prev => prev.map(as => 
        as.id === selectedAsesor.id 
          ? { ...as, observacion_cualitativa: observacionGlobal } 
          : as
      ));
      
      setSelectedAsesor(prev => ({ ...prev, observacion_cualitativa: observacionGlobal }));
    } catch (err) {
      console.error(err);
      setMessage('❌ Error al guardar la observación.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
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
          descripcion: newIncidencia.descripcion,
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
        requiere_seguimiento: false 
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

  const handleGeneratePDF = () => {
    if (!selectedAsesor) return;

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
      return temasDepto.map(sm => {
        const notaExistente = notasGuardadas.find(n => n.id_submodulo === sm.id);
        const nota = notaExistente?.nota || 0;
        if (notaExistente) {
          sumGrades += nota;
          countedSubmodules++;
        }

        let detalleTexto = '';
        if (notaExistente?.comentario?.startsWith('{')) {
          try {
            const parsed = JSON.parse(notaExistente.comentario);
            if (parsed.detalle_evaluacion) {
              detalleTexto = Object.entries(parsed.detalle_evaluacion)
                .map(([act, d]) => `${act}: ${d.nota}%`)
                .join(', ');
            } else if (parsed.texto) {
              detalleTexto = parsed.texto;
            }
          } catch (e) {
            detalleTexto = notaExistente.comentario;
          }
        } else {
          detalleTexto = notaExistente?.comentario || 'Sin observaciones.';
        }

        return `
          <tr>
            <td><strong>${it.departamentos?.nombre || 'Depto'}</strong></td>
            <td>${sm.nombre_tarea}</td>
            <td class="text-center font-bold">${notaExistente ? `${nota}%` : 'N/A'}</td>
            <td>${detalleTexto || '-'}</td>
          </tr>
        `;
      }).join('');
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

    const incidencesRows = incidencias.map(inc => `
      <tr>
        <td class="font-mono">${inc.fecha_reporte}</td>
        <td class="text-danger font-bold">${inc.descripcion}</td>
        <td>${inc.observacion || '-'}</td>
        <td>${inc.recomendaciones || '-'}</td>
        <td class="text-center">
          <span class="badge ${inc.estado_seguimiento === 'resuelto' ? 'badge-success' : 'badge-danger'}">
            ${inc.estado_seguimiento === 'resuelto' ? 'Resuelto' : inc.estado_seguimiento === 'pendiente' ? 'Pendiente' : 'No Aplica'}
          </span>
        </td>
      </tr>
    `).join('');

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
            grid-template-cols: repeat(3, 1fr);
            gap: 15px;
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
            grid-template-cols: 1fr 1fr;
            gap: 20px;
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
        <div class="grid-profile">
          <div class="profile-item">
            <span class="profile-label">Asesor Evaluado</span>
            <span class="profile-value">${selectedAsesor.nombre}</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">Correo Personal</span>
            <span class="profile-value">${selectedAsesor.correo || selectedAsesor.usuario}</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">Correo Corporativo</span>
            <span class="profile-value">${selectedAsesor.correo_corporativo || 'Sin asignar'}</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">Empresa / Ramo</span>
            <span class="profile-value">${selectedAsesor.empresa || 'Febeca'} / ${selectedAsesor.ramo || 'Sin ramo'}</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">Zona / Ubicación</span>
            <span class="profile-value">${selectedAsesor.zona || 'N/A'} - ${selectedAsesor.estado || ''}</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">Teléfono</span>
            <span class="profile-value">${selectedAsesor.telefono || 'Sin teléfono'}</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">Fecha de Ingreso</span>
            <span class="profile-value">${selectedAsesor.fecha_ingreso || 'N/A'}</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">Estatus General</span>
            <span class="profile-value">${getAsesorStatus(selectedAsesor).label}</span>
          </div>
        </div>

        <div class="section-title">2. Rendimiento Académico y Avance de Itinerario</div>
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 25%;">Departamento</th>
              <th style="width: 30%;">Tema / Evaluación</th>
              <th style="width: 15%;" class="text-center">Calificación</th>
              <th style="width: 30%;">Detalle / Feedback</th>
            </tr>
          </thead>
          <tbody>
            ${gradesTableRows || '<tr><td colspan="4" class="text-center">No hay registros de calificaciones guardadas.</td></tr>'}
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-card">
            <div class="summary-label">Promedio de Inducción</div>
            <div class="summary-val">${generalAverage}%</div>
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

        <div class="section-title">5. Conclusión y Recomendaciones Finales</div>
        <div class="grid-feedback">
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
            }, 300);
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
        `).eq('rol', 'asesor').order('nombre', { ascending: true });
        
        // Si es evaluador, solo ve asesores de SU empresa
        if (user.rol === 'evaluador' && user.empresa) {
          queryAsesores = queryAsesores.ilike('empresa', user.empresa.trim());
        }
        
        const { data: listaAsesores } = await queryAsesores;
        setAsesores(listaAsesores || []);

        // Si es administrador, carga TODOS los temas para poder ver cualquier itinerario
        let queryTemas = supabase.schema('portal_afv').from('submodulos_finales').select('*');
        if (user.rol === 'evaluador' && deptoParaCarga?.id) {
          queryTemas = queryTemas.eq('id_departamento', deptoParaCarga.id);
        }
        
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

  const checkExistenciaCandidato = async (email) => {
    const { data } = await supabase.schema('portal_afv').from('usuarios').select('id').eq('usuario', email).single();
    if (data) {
        setEsReintento(true);
        // Obtener último intento para saber cuál sigue
        const { data: itins } = await supabase.schema('portal_afv').from('itinerarios_induccion').select('intento').eq('id_asesor', data.id).order('intento', { ascending: false }).limit(1);
        return itins && itins.length > 0 ? itins[0].intento : 0;
    }
    setEsReintento(false);
    return 0;
  };

  const calcularNotaFinal = (sm, evalState, notaExistente) => {
    if (!sm.contenido || sm.contenido.length === 0) {
      return { nota: parseFloat(evalState?.nota !== undefined ? evalState.nota : notaExistente?.nota) || 0, detalle: null, obs: evalState?.obs !== undefined ? evalState.obs : notaExistente?.comentario };
    }
    let notaTotal = 0;
    const detalle = {};
    let parsedExistente = null;
    if (notaExistente?.comentario?.startsWith('{')) {
      try { parsedExistente = JSON.parse(notaExistente.comentario); } catch(e){}
    }
    
    sm.contenido.forEach((act, idx) => {
       let notaItem = 0;
       if (evalState?.notas && evalState.notas[idx] !== undefined) {
          notaItem = parseFloat(evalState.notas[idx]) || 0;
       } else if (parsedExistente?.detalle_evaluacion?.[act.actividad]) {
          notaItem = parseFloat(parsedExistente.detalle_evaluacion[act.actividad].nota) || 0;
       }
       const peso = parseFloat(act.peso) || 0;
       notaTotal += (notaItem * (peso / 100));
       detalle[act.actividad] = { nota: notaItem, peso: peso };
    });
    
    const obsFinal = evalState?.obs !== undefined ? evalState.obs : (parsedExistente?.texto || notaExistente?.comentario || '');
    return { nota: parseFloat(notaTotal.toFixed(2)), detalle, obs: obsFinal };
  };

  const handleSaveNota = async (sm, evalState, notaExistente) => {
    if (!selectedAsesor || itinerarioActual.length === 0) return;
    setIsSaving(true);
    
    const { nota, detalle, obs } = calcularNotaFinal(sm, evalState, notaExistente);
    let comentarioFinal = obs;
    if (detalle) {
      comentarioFinal = JSON.stringify({ texto: obs, detalle_evaluacion: detalle });
    }

    const payload = {
      id_asesor: selectedAsesor.id,
      id_submodulo: sm.id,
      email_evaluador: user.usuario,
      nota: nota,
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
    
    // Validamos que ninguna nota pase de 100
    const notasInvalidas = Object.keys(evaluaciones).some(id => {
       const evalItem = evaluaciones[id];
       if (evalItem.notas) return evalItem.notas.some(n => parseFloat(n) > 100);
       return parseFloat(evalItem.nota) > 100;
    });
    if (notasInvalidas) {
      setMessage('⚠️ Hay notas mayores a 100. Por favor rertifíquelas.');
      setTimeout(() => setMessage(''), 4000);
      return;
    }

    // Filtramos y calculamos payloads
    const payloads = Object.keys(evaluaciones).map(id => {
        const sm = submodulos.find(s => s.id == id);
        if(!sm) return null;
        const notaExistente = notasGuardadas.find(n => n.id_submodulo === sm.id);
        const { nota, detalle, obs } = calcularNotaFinal(sm, evaluaciones[id], notaExistente);
        
        let comentarioFinal = obs;
        if (detalle) comentarioFinal = JSON.stringify({ texto: obs, detalle_evaluacion: detalle });

        return {
          id_asesor: selectedAsesor.id,
          id_submodulo: id,
          email_evaluador: user.usuario,
          nota: nota,
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
    if (!newSubmodulo.nombre) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.schema('portal_afv').from('submodulos_finales').update({
        nombre_tarea: newSubmodulo.nombre,
        descripcion: newSubmodulo.descripcion,
        duracion_horas: newSubmodulo.horas,
        es_interno: newSubmodulo.es_interno,
        contenido: newSubmodulo.contenido,
        recursos: newSubmodulo.recursos
      }).eq('id', isEditingSub);
      
      if (error) throw error;
      setMessage('Tema actualizado con éxito.');
      setNewSubmodulo({ nombre: '', descripcion: '', horas: '', es_interno: false });
      setIsEditingSub(null);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      setMessage('Error al actualizar tema.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
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
    `).eq('rol', 'asesor').order('nombre', { ascending: true });
    setResponsables(evData || []);
    setTodosLosEvaluadores(evUsers || []);
    setAsesores(asUsers || []);
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
      return { label: 'Completado', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
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
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      if (editType === 'usuario') {
        const { error } = await supabase.schema('portal_afv').from('usuarios').update({
          nombre: editData.nombre,
          correo: editData.correo,
          correo_corporativo: editData.correo_corporativo,
          empresa: editData.empresa,
          ramo: editData.ramo,
          estado: editData.estado,
          zona: editData.zona,
          telefono: editData.telefono,
          fecha_ingreso: editData.fecha_ingreso
        }).eq('id', editData.id);

        if (error) throw error;
        setMessage('✅ Datos del asesor actualizados.');
        if (selectedAsesor?.id === editData.id) {
          setSelectedAsesor({ ...selectedAsesor, ...editData });
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

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold text-[10px]">Cargando Sistema...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-[1600px] mx-auto">
        <header className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-950">Consola de Evaluación y Reclutamiento</h1>
            <div className="flex gap-4 mt-6">
             <button onClick={() => setViewMode('manual')} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'manual' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}>
                👥 Evaluaciones
             </button>
             <button onClick={() => setViewMode('mi-academia')} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'mi-academia' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}>
                📚 Mi Academia
             </button>
             <button onClick={() => setViewMode('automatico')} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'automatico' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}>
                📥 Aspirantes Excel
             </button>
             {user.rol === 'admin' && (
               <>
                <button onClick={() => setViewMode('configuracion')} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'configuracion' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}>
                    ⚙️ Biblioteca Temas
                </button>
                <button onClick={() => setViewMode('escenarios')} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'escenarios' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}>
                    🎭 Gestionar Escenarios
                </button>
                <button onClick={() => setViewMode('reportes')} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'reportes' ? 'bg-slate-950 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}>
                    📈 Reporte de Notas
                </button>
                <button onClick={() => { setViewMode('responsables'); fetchResponsables(); }} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'responsables' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}>
                    👨‍💼 Responsables
                </button>
                <button onClick={() => { setViewMode('departamentos'); fetchDepartamentos(); }} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'departamentos' ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}>
                    🏢 Departamentos
                </button>
               </>
             )}
            </div>
          </div>
          <button onClick={onBack} className="px-8 py-3 bg-slate-900 text-white font-bold text-[9px] uppercase rounded-full shadow-lg">← Volver</button>
        </header>

        {viewMode === 'manual' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-3">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col max-h-[80vh]">
                <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Asesores Activos</h3>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[8px] font-black">
                    {asesores.length}
                  </span>
                </div>
                
                {/* BUSCADOR DE ASESORES */}
                <div className="p-3 border-b bg-white">
                  <input
                    type="text"
                    placeholder="🔍 Buscar asesor..."
                    value={searchTermAsesores}
                    onChange={(e) => setSearchTermAsesores(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="overflow-y-auto flex-1">
                  {asesores
                    .filter(as => as.nombre?.toLowerCase().includes(searchTermAsesores.toLowerCase()))
                    .map(as => {
                      const status = getAsesorStatus(as);
                      return (
                        <div 
                          key={as.id} 
                          onClick={() => setSelectedAsesor(as)} 
                          className={`p-4 cursor-pointer border-b border-slate-100 transition-all ${selectedAsesor?.id === as.id ? 'bg-blue-50 border-l-4 border-l-blue-600 shadow-sm' : 'hover:bg-slate-50'}`}
                        >
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <h3 className="text-xs font-bold text-slate-800 leading-tight flex-1">{as.nombre}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider border shrink-0 ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            <span>{as.empresa || 'Independiente'}</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono text-[7px] border border-slate-200">
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
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl">✈️</div>
                        <div className="relative z-10 flex justify-between items-center">
                            <div className="flex items-center gap-6">
                                {/* FOTO DE PERFIL EN EVALUACIÓN */}
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-2xl flex items-center justify-center">
                                    {selectedAsesor.foto_url ? (
                                        <a href={selectedAsesor.foto_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                                            <img 
                                              src={getGoogleDriveThumbnail(selectedAsesor.foto_url)} 
                                              alt="Perfil" 
                                              className="w-full h-full object-cover transition-opacity" 
                                              onError={(e) => {
                                                  e.target.style.display = 'none';
                                                  if(e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                                              }}
                                            />
                                            <div className="absolute inset-0 items-center justify-center text-2xl font-black text-blue-400 bg-slate-800" style={{ display: 'none' }}>
                                                {selectedAsesor.nombre?.substring(0,1)}
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300" title="Ver Foto Original">
                                                <span className="text-xl">🔗</span>
                                            </div>
                                        </a>
                                    ) : (
                                        <span className="text-2xl font-black text-blue-400">{selectedAsesor.nombre?.substring(0,1)}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-2xl font-black">{selectedAsesor.nombre}</h2>
                                        <button 
                                            onClick={handleGeneratePDF}
                                            className="bg-white/10 hover:bg-white text-white hover:text-slate-950 border border-white/20 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 cursor-pointer"
                                        >
                                            📄 Emitir Reporte PDF
                                        </button>
                                        {user.rol === 'admin' && (
                                            <>
                                              <button 
                                                  onClick={() => handleOpenEdit(selectedAsesor, 'usuario')}
                                                  className="bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all"
                                              >
                                                  ✏️ Editar Datos
                                              </button>
                                              <button 
                                                  onClick={handleDesactivarAsesor}
                                                  className="bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all"
                                              >
                                                  ⛔ Desactivar Asesor
                                              </button>
                                              <button 
                                                  onClick={handleDeleteInduccion}
                                                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all"
                                              >
                                                  🗑️ Borrar Historial
                                              </button>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">
                                        Inducción en Curso - Intento #{itinerarioActual[0]?.intento}
                                    </span>
                                    <div className="flex gap-4 text-[9px] text-slate-400 font-medium uppercase tracking-widest flex-wrap mt-2">
                                       <span>📧 Personal: {selectedAsesor.correo || selectedAsesor.usuario}</span>
                                       <span>🏢 Corp: {selectedAsesor.correo_corporativo ? (
                                         <span className="text-emerald-400 font-bold">{selectedAsesor.correo_corporativo}</span>
                                       ) : (
                                         <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">⚠️ Sin Correo Corp</span>
                                       )}</span>
                                       <span>📍 {selectedAsesor.zona || 'Zona no definida'}</span>
                                       <span>📱 {selectedAsesor.telefono || 'Sin teléfono'}</span>
                                       <span>📅 Ingreso: {selectedAsesor.fecha_ingreso || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {itinerarioActual.map((it, idx) => (
                                    <div key={it.id} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black" title={it.departamentos?.nombre}>
                                        {idx + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  )}

                  {/* NAVEGACIÓN DE PESTAÑAS (TABS) */}
                  <div className="flex gap-4 border-b border-slate-200 pb-2 mb-6 mt-4">
                    <button 
                      onClick={() => setActiveSubTab('evaluacion')}
                      className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${activeSubTab === 'evaluacion' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      👥 Evaluaciones del Itinerario
                    </button>
                    <button 
                      onClick={() => setActiveSubTab('seguimiento')}
                      className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${activeSubTab === 'seguimiento' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      📈 Seguimiento y Feedback
                    </button>
                    <button 
                      onClick={() => setActiveSubTab('incidencias')}
                      className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${activeSubTab === 'incidencias' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      ⚠️ Bitácora de Eventualidades ({incidencias.length})
                    </button>
                  </div>

                  {activeSubTab === 'evaluacion' && (
                    <div className="space-y-6">
                      {/* TEMAS POR DEPARTAMENTO */}
                      {itinerarioActual.length > 0 && (
                         <div className="flex justify-end mb-6">
                            <button 
                               onClick={handleSaveAllNotas} 
                               disabled={isSaving}
                               className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95"
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
                            <h3 className="text-xs font-black uppercase text-slate-800 mb-6 border-b pb-4">{it.departamentos?.nombre}</h3>
                            
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
                                        <h4 className="text-[10px] font-black uppercase text-slate-700">{sm.nombre_tarea}</h4>
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
                                                    <span className="text-[9px] text-slate-500 font-bold flex-1 truncate" title={act.actividad}>{act.actividad} <span className="text-blue-500">({act.peso}%)</span></span>
                                                    <input 
                                                      type="number" 
                                                      className="w-14 h-8 bg-white border border-slate-200 rounded-lg text-center font-black text-[10px]" 
                                                      placeholder="Nota" 
                                                      max="100"
                                                      defaultValue={notaInicial}
                                                      onBlur={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        const currentEval = evaluaciones[sm.id] || { notas: [] };
                                                        const newNotas = [...(currentEval.notas || [])];
                                                        newNotas[idx] = val;
                                                        setEvaluaciones({...evaluaciones, [sm.id]: {...currentEval, notas: newNotas}});
                                                      }}
                                                    />
                                                </div>
                                              );
                                           })
                                        ) : (
                                           <div className="flex gap-2">
                                              <input 
                                                type="number" 
                                                className="w-16 h-10 bg-white border border-slate-200 rounded-xl text-center font-black text-xs" 
                                                placeholder="Nota" 
                                                max="100"
                                                defaultValue={notaExistente?.nota || ''}
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
                                                if (notaExistente?.comentario?.startsWith('{')) {
                                                   try { return JSON.parse(notaExistente.comentario).texto || ''; } catch(e){}
                                                }
                                                return notaExistente?.comentario || '';
                                            })()}
                                            onBlur={(e) => setEvaluaciones({...evaluaciones, [sm.id]: {...evaluaciones[sm.id], obs: e.target.value}})}
                                          />
                                          <button onClick={() => handleSaveNota(sm, evaluaciones[sm.id], notaExistente)} className="px-5 h-10 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase hover:bg-blue-600 transition-all">OK</button>
                                        </div>
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
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                              className="w-full h-36 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none"
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
                              className="w-full h-36 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none"
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
                    <div className="space-y-6">
                      {/* FORMULARIO DE REPORTE */}
                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black uppercase text-slate-800 border-b pb-4 mb-6">⚠️ Registrar Nueva Eventualidad o Inconveniente en Calle</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Fecha del Suceso</label>
                            <input 
                              type="date"
                              value={newIncidencia.fecha_reporte}
                              onChange={(e) => setNewIncidencia({...newIncidencia, fecha_reporte: e.target.value})}
                              className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none"
                            />
                          </div>
                          <div className="flex items-center h-14 md:mt-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={newIncidencia.requiere_seguimiento}
                                onChange={(e) => setNewIncidencia({...newIncidencia, requiere_seguimiento: e.target.checked})}
                                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                              />
                              <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">⚠️ ¿Requiere Seguimiento Preventivo / Plan Especial?</span>
                            </label>
                          </div>
                          <div className="col-span-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Descripción del Inconveniente / Mala Práctica</label>
                            <textarea 
                              placeholder="Ej. Incumplimiento de horario de ruta o reporte incorrecto de visitas..."
                              value={newIncidencia.descripcion}
                              onChange={(e) => setNewIncidencia({...newIncidencia, descripcion: e.target.value})}
                              className="w-full h-20 bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Observaciones / Análisis del Evaluador</label>
                            <textarea 
                              placeholder="Ej. Se conversó con el supervisor de zona..."
                              value={newIncidencia.observacion}
                              onChange={(e) => setNewIncidencia({...newIncidencia, observacion: e.target.value})}
                              className="w-full h-20 bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <div>
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
                            {incidencias.map((inc) => (
                              <div key={inc.id} className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-7xl">🚨</div>
                                
                                <div className="flex justify-between items-start flex-wrap gap-2 mb-4 border-b border-rose-100/50 pb-3">
                                  <div>
                                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[8px] font-bold">📅 SUCESO: {inc.fecha_reporte}</span>
                                  </div>
                                  
                                  {inc.requiere_seguimiento ? (
                                    <div className="flex gap-2 items-center">
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
                                    </div>
                                  ) : (
                                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[8px] font-bold uppercase">No requiere seguimiento</span>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs mt-2">
                                  <div className="bg-white p-4 rounded-xl border border-rose-100/30">
                                    <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Descripción del Incidente:</p>
                                    <p className="text-slate-700 leading-relaxed font-semibold">{inc.descripcion}</p>
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
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
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
                  {notasAutomaticas.filter(n => n.nombre_apellido?.toLowerCase().includes(searchTermAuto.toLowerCase())).map((nota) => (
                    <tr key={nota.id} className="border-b border-slate-50 hover:bg-slate-50 transition-all">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                                 {nota.foto_url ? (
                                    <a href={nota.foto_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                                        <img 
                                          src={getGoogleDriveThumbnail(nota.foto_url)} 
                                          alt="Foto" 
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
                                await checkExistenciaCandidato(nota.email_contacto);
                                setShowAltaModal(true);
                                setItinerarioConfig([]);
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
                    <div className="col-span-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Fecha de Ingreso</label>
                        <input 
                          type="text" 
                          value={editData.fecha_ingreso || ''} 
                          placeholder="Ej: 01/01/2024"
                          onChange={(e) => setEditData({ ...editData, fecha_ingreso: e.target.value })}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
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

        {message && <div className="fixed bottom-10 right-10 bg-slate-900 text-white px-10 py-5 rounded-3xl shadow-2xl animate-in slide-in-from-right font-black uppercase text-[10px] z-[200] border-2 border-slate-700">{message}</div>}
      </div>
    </div>
  );
};

export default ConsolaEvaluacion;
