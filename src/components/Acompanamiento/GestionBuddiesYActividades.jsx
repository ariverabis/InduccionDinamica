import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACTIVIDADES_CALLE_DEFAULT, BUDDIES_DEFAULT } from '../../data/actividadesCalleDefault';

export default function GestionBuddiesYActividades({ onClose }) {
  const [activeTab, setActiveTab] = useState('buddies'); // 'buddies' | 'actividades'
  const [buddies, setBuddies] = useState(BUDDIES_DEFAULT);
  const [actividades, setActividades] = useState(ACTIVIDADES_CALLE_DEFAULT);
  const [mensaje, setMensaje] = useState('');

  // Form states para nuevo Buddy
  const [nuevoBuddy, setNuevoBuddy] = useState({ nombre: '', cedula: '', casa_comercial: 'Febeca', cargo: 'Buddy / Facilitador' });

  // Form states para nueva Actividad
  const [nuevaActividad, setNuevaActividad] = useState({
    categoria: '1. DOMINIO TÉCNICO Y ECOSISTEMA DIGITAL (AFV/SDS)',
    titulo: '',
    descripcion: '',
    objetivo: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    let listaBase = BUDDIES_DEFAULT;
    
    // Cargar locales de respaldo primero
    try {
      const localStr = localStorage.getItem('buddies_custom');
      if (localStr) {
        const parsed = JSON.parse(localStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          listaBase = parsed;
        }
      }
    } catch (e) { console.warn("Error leyendo buddies_custom local:", e); }

    try {
      const { data: dbB, error: errB } = await supabase.from('buddies').select('*');
      if (!errB && dbB && dbB.length > 0) {
        setBuddies(dbB);
        localStorage.setItem('buddies_custom', JSON.stringify(dbB));
      } else {
        setBuddies(listaBase);
      }

      const { data: dbA, error: errA } = await supabase.from('actividades_calle').select('*');
      if (!errA && dbA && dbA.length > 0) {
        setActividades(dbA);
      }
    } catch (e) {
      console.warn("Usando catálogo por defecto / local:", e);
      setBuddies(listaBase);
    }
  };

  const handleEliminarBuddy = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el Buddy "${nombre}"?`)) return;

    try {
      const { error } = await supabase.from('buddies').delete().eq('id', id);
      if (error) console.warn("Supabase delete warning:", error);
    } catch (e) {
      console.warn("Error eliminando Buddy en DB:", e);
    }

    const nuevosBuddies = buddies.filter(b => b.id !== id);
    setBuddies(nuevosBuddies);
    localStorage.setItem('buddies_custom', JSON.stringify(nuevosBuddies));
    setMensaje(`🗑️ Buddy "${nombre}" eliminado correctamente.`);
  };

  const handleAgregarBuddy = async (e) => {
    e.preventDefault();
    if (!nuevoBuddy.nombre) return;

    const item = { ...nuevoBuddy, id: `bud-${Date.now()}` };
    try {
      const { error } = await supabase.from('buddies').insert([nuevoBuddy]);
      if (error) throw error;
      setMensaje('✅ Buddy registrado correctamente en Supabase y localmente.');
    } catch (err) {
      console.warn("Supabase insert warning:", err);
      setMensaje('✅ Buddy registrado localmente.');
    }

    const nuevosBuddies = [...buddies, item];
    setBuddies(nuevosBuddies);
    localStorage.setItem('buddies_custom', JSON.stringify(nuevosBuddies));
    setNuevoBuddy({ nombre: '', cedula: '', casa_comercial: 'Febeca', cargo: 'Buddy / Facilitador' });
  };


  const handleAgregarActividad = async (e) => {
    e.preventDefault();
    if (!nuevaActividad.titulo) return;

    const item = { ...nuevaActividad, id: `act-${Date.now()}` };
    try {
      const { error } = await supabase.from('actividades_calle').insert([nuevaActividad]);
      if (error) throw error;
      setMensaje('✅ Tema/Actividad registrada correctamente en Supabase.');
    } catch (err) {
      console.warn("Supabase insert warning:", err);
      setMensaje('✅ Tema registrado localmente.');
    }

    setActividades(prev => [...prev, item]);
    setNuevaActividad({
      categoria: '1. DOMINIO TÉCNICO Y ECOSISTEMA DIGITAL (AFV/SDS)',
      titulo: '',
      descripcion: '',
      objetivo: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[250] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block mb-1">
              Administración de Acompañamiento
            </span>
            <h2 className="text-lg font-black tracking-tight">
              ⚙️ Gestión de Buddies y Temas de Evaluación en Calle
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white font-bold transition-all">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('buddies')}
            className={`pb-3 px-4 font-black text-xs uppercase transition-all border-b-2 ${activeTab === 'buddies' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            👥 Personas Acompañantes (Buddies) ({buddies.length})
          </button>
          <button
            onClick={() => setActiveTab('actividades')}
            className={`pb-3 px-4 font-black text-xs uppercase transition-all border-b-2 ${activeTab === 'actividades' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            📚 Maestro de Temas / Criterios ({actividades.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-800">
          {mensaje && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold">
              {mensaje}
            </div>
          )}

          {activeTab === 'buddies' ? (
            <div className="space-y-6">
              {/* Form Crear Buddy */}
              <form onSubmit={handleAgregarBuddy} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                  ➕ Registrar Nuevo Buddy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre y Apellido *"
                    value={nuevoBuddy.nombre}
                    onChange={(e) => setNuevoBuddy({ ...nuevoBuddy, nombre: e.target.value })}
                    className="bg-white border rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Cédula"
                    value={nuevoBuddy.cedula}
                    onChange={(e) => setNuevoBuddy({ ...nuevoBuddy, cedula: e.target.value })}
                    className="bg-white border rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <select
                    value={nuevoBuddy.casa_comercial}
                    onChange={(e) => setNuevoBuddy({ ...nuevoBuddy, casa_comercial: e.target.value })}
                    className="bg-white border rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="Febeca">Febeca</option>
                    <option value="Sillaca">Sillaca</option>
                    <option value="Beval">Beval</option>
                  </select>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs py-2 rounded-xl shadow">
                    Guardar Buddy
                  </button>
                </div>
              </form>

              {/* Lista Buddies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {buddies.map(b => (
                  <div key={b.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:border-slate-300 transition-all">
                    <div>
                      <h5 className="font-black text-slate-900">{b.nombre}</h5>
                      <p className="text-[11px] text-slate-500 font-medium">Cédula: {b.cedula || 'N/A'} | Casa: {b.casa_comercial || 'Febeca'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-[10px]">
                        {b.cargo || 'Buddy'}
                      </span>
                      <button
                        onClick={() => handleEliminarBuddy(b.id, b.nombre)}
                        className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center font-bold text-xs"
                        title="Eliminar Buddy"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            <div className="space-y-6">
              {/* Form Crear Actividad */}
              <form onSubmit={handleAgregarActividad} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                  ➕ Registrar Nuevo Tema a Evaluar
                </h4>
                <div className="space-y-3">
                  <select
                    value={nuevaActividad.categoria}
                    onChange={(e) => setNuevaActividad({ ...nuevaActividad, categoria: e.target.value })}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="1. DOMINIO TÉCNICO Y ECOSISTEMA DIGITAL (AFV/SDS)">1. DOMINIO TÉCNICO Y ECOSISTEMA DIGITAL (AFV/SDS)</option>
                    <option value="2. GESTIÓN DE VENTAS Y SURTIDO (Modelo B2R)">2. GESTIÓN DE VENTAS Y SURTIDO (Modelo B2R)</option>
                    <option value="3. COBRANZA OPERATIVA Y GESTIÓN FISCAL">3. COBRANZA OPERATIVA Y GESTIÓN FISCAL</option>
                    <option value="4. RELACIÓN CON EL CLIENTE Y SOFT SKILLS">4. RELACIÓN CON EL CLIENTE Y SOFT SKILLS</option>
                    <option value="5. ORGANIZACIÓN, PLANIFICACIÓN Y ÉTICA">5. ORGANIZACIÓN, PLANIFICACIÓN Y ÉTICA</option>
                  </select>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Título del Tema (ej: Uso del Botón B) *"
                      value={nuevaActividad.titulo}
                      onChange={(e) => setNuevaActividad({ ...nuevaActividad, titulo: e.target.value })}
                      className="bg-white border rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Pregunta / Criterio de Evaluación *"
                      value={nuevaActividad.descripcion}
                      onChange={(e) => setNuevaActividad({ ...nuevaActividad, descripcion: e.target.value })}
                      className="bg-white border rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs rounded-xl shadow">
                      Guardar Tema
                    </button>
                  </div>
                </div>
              </form>

              {/* Lista Actividades */}
              <div className="space-y-2">
                {actividades.map((a, i) => (
                  <div key={a.id || i} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase block">{a.categoria}</span>
                    <h5 className="font-bold text-slate-900">■ {a.titulo}</h5>
                    <p className="text-[11px] text-slate-600">{a.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
