import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACTIVIDADES_CALLE_DEFAULT, BUDDIES_DEFAULT } from '../../data/actividadesCalleDefault';

export default function AsignacionActividadesCalleModal({ asesor, onClose, onSaved }) {
  const [buddies, setBuddies] = useState(BUDDIES_DEFAULT);
  const [selectedBuddyId, setSelectedBuddyId] = useState('');
  const [actividades, setActividades] = useState(ACTIVIDADES_CALLE_DEFAULT);
  const [selectedActividadIds, setSelectedActividadIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [asesor]);

  const cargarDatos = async () => {
    setLoading(true);
    let listaBaseBuddies = BUDDIES_DEFAULT;
    try {
      const localStr = localStorage.getItem('buddies_custom');
      if (localStr) {
        const parsed = JSON.parse(localStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          listaBaseBuddies = parsed;
        }
      }
    } catch (e) {}

    try {
      // 1. Cargar Buddies desde Supabase (si la tabla existe)
      const { data: dbBuddies, error: errBud } = await supabase.from('buddies').select('*');
      if (!errBud && dbBuddies && dbBuddies.length > 0) {
        setBuddies(dbBuddies);
      } else {
        setBuddies(listaBaseBuddies);
      }

      // 2. Cargar Actividades desde Supabase (si existen)
      const { data: dbActs, error: errAct } = await supabase.from('actividades_calle').select('*').eq('activo', true);
      if (!errAct && dbActs && dbActs.length > 0) {
        setActividades(dbActs);
      }

      // 3. Cargar asignación existente previa para este asesor
      if (asesor?.id) {
        const { data: dbAsig, error: errAsig } = await supabase
          .from('asignaciones_calle')
          .select('*')
          .eq('asesor_id', asesor.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!errAsig && dbAsig && dbAsig.length > 0) {
          const asig = dbAsig[0];
          setSelectedBuddyId(asig.buddy_id || '');
          if (Array.isArray(asig.actividades_ids) && asig.actividades_ids.length > 0) {
            setSelectedActividadIds(asig.actividades_ids);
          } else {
            // Seleccionar todas por defecto
            setSelectedActividadIds(actividades.map(a => a.id));
          }
        } else {
          // Seleccionar todas por defecto si no hay previa
          setSelectedActividadIds(ACTIVIDADES_CALLE_DEFAULT.map(a => a.id));
        }
      }
    } catch (e) {
      console.warn("Error consultando Supabase, usando valores locales:", e);
      setSelectedActividadIds(ACTIVIDADES_CALLE_DEFAULT.map(a => a.id));
    } finally {
      setLoading(false);
    }
  };

  const toggleActividad = (id) => {
    setSelectedActividadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedActividadIds(actividades.map(a => a.id));
  };

  const deselectAll = () => {
    setSelectedActividadIds([]);
  };

  const handleGuardarAsignacion = async () => {
    if (!selectedBuddyId) {
      setMensaje('⚠️ Por favor selecciona un Buddy acompañante.');
      return;
    }
    if (selectedActividadIds.length === 0) {
      setMensaje('⚠️ Selecciona al menos una actividad o tema a evaluar en calle.');
      return;
    }

    setSaving(true);
    setMensaje('');

    try {
      const payload = {
        asesor_id: asesor.id,
        buddy_id: selectedBuddyId,
        actividades_ids: selectedActividadIds,
        fecha_asignacion: new Date().toISOString().split('T')[0],
        estado: 'pendiente'
      };

      const { data, error } = await supabase.from('asignaciones_calle').insert([payload]).select();

      if (error) {
        console.warn("No se pudo insertar en Supabase (tabla aún no migrada). Guardando en almacenamiento local.", error);
        localStorage.setItem(`asignacion_calle_${asesor.id}`, JSON.stringify(payload));
      }

      setMensaje('✅ Asignación de Acompañamiento en Calle guardada exitosamente.');
      setTimeout(() => {
        if (onSaved) onSaved(payload);
        onClose();
      }, 1200);
    } catch (e) {
      console.error("Error guardando asignación:", e);
      // Fallback local
      localStorage.setItem(`asignacion_calle_${asesor.id}`, JSON.stringify({
        asesor_id: asesor.id,
        buddy_id: selectedBuddyId,
        actividades_ids: selectedActividadIds
      }));
      setMensaje('✅ Asignación guardada localmente.');
      setTimeout(() => {
        if (onSaved) onSaved();
        onClose();
      }, 1000);
    } finally {
      setSaving(false);
    }
  };

  // Agrupar actividades por categoría
  const categoriasMap = {};
  actividades.forEach(act => {
    if (!categoriasMap[act.categoria]) {
      categoriasMap[act.categoria] = [];
    }
    categoriasMap[act.categoria].push(act);
  });

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[250] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">
              Módulo de Acompañamiento en Calle
            </span>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <span>🎯</span> Asignación de Temas y Buddy — {asesor?.nombre || 'Asesor'}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white font-bold transition-all">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">

          {mensaje && (
            <div className={`p-4 rounded-2xl text-xs font-bold ${mensaje.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
              {mensaje}
            </div>
          )}

          {/* 1. Selección de Buddy */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-black uppercase text-slate-700 tracking-wider">
              1. Seleccionar Buddy / Acompañante Asignado *
            </label>
            <select
              value={selectedBuddyId}
              onChange={(e) => setSelectedBuddyId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="">-- Seleccionar Persona Acompañante --</option>
              {buddies.map(bud => (
                <option key={bud.id} value={bud.id}>
                  {bud.nombre} ({bud.casa_comercial || 'Febeca'}) — {bud.cargo || 'Buddy'}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Seleccionar Temas / Actividades a Evaluar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase text-slate-700 tracking-wider">
                2. Actividades / Temas a Evaluar en Calle ({selectedActividadIds.length} seleccionados)
              </label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg">
                  Marcar Todos
                </button>
                <button onClick={deselectAll} className="text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Desmarcar Todos
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {Object.entries(categoriasMap).map(([catNombre, items]) => (
                <div key={catNombre} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <h4 className="text-xs font-black text-blue-900 uppercase border-b pb-2 mb-3">
                    {catNombre}
                  </h4>
                  <div className="space-y-2.5">
                    {items.map(item => {
                      const isSelected = selectedActividadIds.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          onClick={() => toggleActividad(item.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100'}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Manejado por onClick contenedor
                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-900 block">{item.titulo}</span>
                            <span className="text-[11px] text-slate-600 block">{item.descripcion}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardarAsignacion}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black uppercase tracking-wider text-xs rounded-2xl shadow-xl transition-all flex items-center gap-2"
          >
            {saving ? 'Guardando...' : '💾 Guardar Asignaciones'}
          </button>
        </div>

      </div>
    </div>
  );
}
