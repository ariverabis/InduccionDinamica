import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const ConsolaEvaluacion = ({ user, onBack }) => {
  const [viewMode, setViewMode] = useState('manual');
  const [asesores, setAsesores] = useState([]);
  const [departamento, setDepartamento] = useState(null);
  const [todosLosDepartamentos, setTodosLosDepartamentos] = useState([]);
  const [submodulos, setSubmodulos] = useState([]);
  const [selectedAsesor, setSelectedAsesor] = useState(null);
  const [itinerarioActual, setItinerarioActual] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState({});
  const [notasAutomaticas, setNotasAutomaticas] = useState([]);
  const [searchTermAuto, setSearchTermAuto] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_sincronizacion', direction: 'desc' });
  
  // Estados para activación de itinerario e historial
  const [showAltaModal, setShowAltaModal] = useState(false);
  const [candidatoAlta, setCandidatoAlta] = useState(null);
  const [itinerarioConfig, setItinerarioConfig] = useState([]);
  const [motivoReinicio, setMotivoReinicio] = useState('');
  const [esReintento, setEsReintento] = useState(false);
  
  const [newSubmodulo, setNewSubmodulo] = useState({ nombre: '', descripcion: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [notasGuardadas, setNotasGuardadas] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, [viewMode]);

  useEffect(() => {
    if (selectedAsesor) {
      fetchItinerarioAsesor(selectedAsesor.id);
      fetchNotasAsesor(selectedAsesor.id);
    }
  }, [selectedAsesor]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const { data: evalAuth } = await supabase.schema('portal_afv').from('evaluadores_autorizados').select('*, departamentos(*)').eq('email', user.usuario).single();
      const deptoParaCarga = evalAuth?.departamentos || (user.rol === 'admin' ? { id: null, nombre: 'Admin Global' } : null);
      setDepartamento(deptoParaCarga);
      const { data: deptos } = await supabase.schema('portal_afv').from('departamentos').select('*');
      setTodosLosDepartamentos(deptos || []);

      if (viewMode === 'manual' || viewMode === 'configuracion') {
        let queryAsesores = supabase.schema('portal_afv').from('usuarios').select('*').eq('rol', 'asesor');
        
        // Si es evaluador, solo ve asesores de SU empresa
        if (user.rol === 'evaluador' && user.empresa) {
          queryAsesores = queryAsesores.eq('empresa', user.empresa);
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

  const handleSaveNota = async (submoduloId, nota, comentario) => {
    if (!selectedAsesor || itinerarioActual.length === 0) return;
    setIsSaving(true);
    try {
      await supabase.schema('portal_afv').from('notas_por_submodulo').upsert([{
        id_asesor: selectedAsesor.id,
        id_submodulo: submoduloId,
        email_evaluador: user.usuario,
        nota: parseFloat(nota),
        comentario: comentario,
        intento: itinerarioActual[0].intento
      }], { onConflict: 'id_asesor,id_submodulo,intento' });
      setMessage('Evaluación registrada.');
      fetchNotasAsesor(selectedAsesor.id); // Refrescar para ver el cambio
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error al guardar.'); } finally { setIsSaving(false); }
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
        id_departamento: departamento.id
      }]);
      if (error) throw error;
      setMessage('Tema guardado con éxito.');
      setNewSubmodulo({ nombre: '', descripcion: '' });
      fetchInitialData(); // Para refrescar la biblioteca
    } catch (err) {
      console.error(err);
      setMessage('Error al guardar tema.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const procesarAlta = async () => {
    setIsSaving(true);
    try {
      const { data: newUser } = await supabase.schema('portal_afv').from('usuarios').upsert({
          usuario: candidatoAlta.email_contacto,
          correo: candidatoAlta.email_contacto,
          nombre: candidatoAlta.nombre_apellido,
          clave: candidatoAlta.cedula,
          rol: 'asesor',
          empresa: candidatoAlta.empresa_excel,
          foto_url: candidatoAlta.foto_url
      }, { onConflict: 'usuario' }).select().single();

      const lastIntento = await checkExistenciaCandidato(candidatoAlta.email_contacto);
      const nuevoIntentoNum = lastIntento + 1;

      const itins = itinerarioConfig.map((it, idx) => ({
        id_asesor: newUser.id,
        id_departamento: it.id_depto,
        duracion_dias: parseInt(it.dias),
        orden: idx + 1,
        intento: nuevoIntentoNum,
        motivo_reinicio: esReintento ? motivoReinicio : 'Primer ingreso'
      }));

      await supabase.schema('portal_afv').from('itinerarios_induccion').insert(itins);
      setMessage(esReintento ? 'Proceso reiniciado con éxito.' : 'Asesor activado exitosamente.');
      setShowAltaModal(false);
      setMotivoReinicio('');
      fetchInitialData();
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold text-[10px]">Cargando Sistema...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-[1600px] mx-auto">
        <header className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-950">Consola de Evaluación y Reclutamiento</h1>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setViewMode('manual')} 
                className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'manual' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
              >
                📝 Evaluación e Historial
              </button>
              
              {user.rol === 'admin' && (
                <button 
                  onClick={() => setViewMode('automatico')} 
                  className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'automatico' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  📥 Aspirantes Excel
                </button>
              )}

              {user.rol === 'admin' && (
                <button 
                  onClick={() => setViewMode('configuracion')} 
                  className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'configuracion' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  ⚙️ Biblioteca de Temas
                </button>
              )}
            </div>
          </div>
          <button onClick={onBack} className="px-8 py-3 bg-slate-900 text-white font-bold text-[9px] uppercase rounded-full shadow-lg">← Volver</button>
        </header>

        {viewMode === 'manual' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-3">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b"><h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Asesores Activos</h3></div>
                <div className="max-h-[70vh] overflow-y-auto">
                  {asesores.map(as => (
                    <div key={as.id} onClick={() => setSelectedAsesor(as)} className={`p-4 cursor-pointer border-b border-slate-50 ${selectedAsesor?.id === as.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'}`}>
                      <h3 className="text-xs font-bold text-slate-800">{as.nombre}</h3>
                      <p className="text-[8px] text-slate-400 uppercase font-black">{as.empresa}</p>
                    </div>
                  ))}
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
                    </div>
                  ) : (
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl">✈️</div>
                        <div className="relative z-10 flex justify-between items-center">
                            <div className="flex items-center gap-6">
                                {/* FOTO DE PERFIL EN EVALUACIÓN */}
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-2xl flex items-center justify-center">
                                    {selectedAsesor.foto_url ? (
                                        <img src={selectedAsesor.foto_url} alt="Perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-black text-blue-400">{selectedAsesor.nombre?.substring(0,1)}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-2xl font-black">{selectedAsesor.nombre}</h2>
                                        {user.rol === 'admin' && (
                                            <button 
                                                onClick={handleDeleteInduccion}
                                                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all"
                                            >
                                                🗑️ Borrar Historial
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                                        Inducción en Curso - Intento #{itinerarioActual[0]?.intento}
                                    </span>
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

                  {/* TEMAS POR DEPARTAMENTO */}
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
                              return (
                                <div key={sm.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-50 hover:border-blue-200 transition-all">
                                  <h4 className="text-[10px] font-black uppercase text-slate-700 mb-4">{sm.nombre_tarea}</h4>
                                  <div className="flex gap-2">
                                    <input 
                                      type="number" 
                                      className="w-16 h-10 bg-white border border-slate-200 rounded-xl text-center font-black text-xs" 
                                      placeholder="Nota" 
                                      defaultValue={notaExistente?.nota || ''}
                                      onBlur={(e) => setEvaluaciones({...evaluaciones, [sm.id]: {...evaluaciones[sm.id], nota: e.target.value}})}
                                    />
                                    <input 
                                      type="text" 
                                      className="flex-1 px-4 bg-white border border-slate-200 rounded-xl text-[9px] outline-none" 
                                      placeholder="Comentarios..." 
                                      defaultValue={notaExistente?.comentario || ''}
                                      onBlur={(e) => setEvaluaciones({...evaluaciones, [sm.id]: {...evaluaciones[sm.id], obs: e.target.value}})}
                                    />
                                    <button onClick={() => handleSaveNota(sm.id, evaluaciones[sm.id]?.nota || notaExistente?.nota, evaluaciones[sm.id]?.obs || notaExistente?.comentario)} className="px-5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase hover:bg-blue-600 transition-all">OK</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                   <th className="px-8 py-4">Empresa</th>
                   <th className="px-8 py-4 text-center">Acciones</th>
                </tr></thead>
                <tbody>
                  {notasAutomaticas.filter(n => n.nombre_apellido?.toLowerCase().includes(searchTermAuto.toLowerCase())).map((nota) => (
                    <tr key={nota.id} className="border-b border-slate-50 hover:bg-slate-50 transition-all">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                                {nota.foto_url ? (
                                    <img src={nota.foto_url} alt="Foto" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-slate-400 text-xs font-black">{nota.nombre_apellido?.substring(0,1)}</span>
                                )}
                             </div>
                             <div>
                                <p className="text-xs font-bold text-slate-800">{nota.nombre_apellido}</p>
                                <p className="text-[9px] text-slate-400 font-medium">Ced: {nota.cedula}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-4 text-[10px] font-bold text-slate-600">{nota.empresa_excel}</td>
                       <td className="px-8 py-4 text-center">
                          <button onClick={async () => {
                              setCandidatoAlta(nota);
                              await checkExistenciaCandidato(nota.email_contacto);
                              setShowAltaModal(true);
                              setItinerarioConfig([]);
                          }} className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase hover:bg-blue-700">Configurar Itinerario</button>
                       </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

        {viewMode === 'configuracion' && (
           <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-12 shadow-xl border border-slate-200">
              <h3 className="text-xl font-black mb-8">Administración Académica</h3>
              <div className="space-y-6">
                 {user.rol === 'admin' && (
                   <select className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold appearance-none" onChange={(e) => setDepartamento(todosLosDepartamentos.find(d => d.id === e.target.value))}>
                      <option value="">Seleccione Departamento destino...</option>
                      {todosLosDepartamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                   </select>
                 )}
                 <input type="text" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold" placeholder="Nombre de la Tarea..." value={newSubmodulo.nombre} onChange={(e) => setNewSubmodulo({...newSubmodulo, nombre: e.target.value})}/>
                 <input type="text" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold" placeholder="Descripción corta..." value={newSubmodulo.descripcion} onChange={(e) => setNewSubmodulo({...newSubmodulo, descripcion: e.target.value})}/>
                 <button onClick={handleAddSubmodulo} className="w-full h-14 bg-blue-600 text-white font-black uppercase rounded-2xl shadow-xl">Guardar Tema en Biblioteca Global</button>
              </div>
           </div>
        )}

        {/* MODAL ALTA VERSIÓN MEJORADA */}
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

        {message && <div className="fixed bottom-10 right-10 bg-slate-900 text-white px-10 py-5 rounded-3xl shadow-2xl animate-in slide-in-from-right font-black uppercase text-[10px] z-[200] border-2 border-slate-700">{message}</div>}
      </div>
    </div>
  );
};

export default ConsolaEvaluacion;
