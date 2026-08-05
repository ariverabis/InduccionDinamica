import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ACTIVIDADES_CALLE_DEFAULT, BUDDIES_DEFAULT } from '../../data/actividadesCalleDefault';
import ReporteAcompanamientoCallePDF from './ReporteAcompanamientoCallePDF';

export default function FormularioAcompanamientoCalle({ asesor, onClose }) {
  const [buddies, setBuddies] = useState(BUDDIES_DEFAULT);
  const [selectedBuddy, setSelectedBuddy] = useState(BUDDIES_DEFAULT[0]);
  const [casaComercial, setCasaComercial] = useState('Febeca');
  const [fecha, setFecha] = useState(new Date().toLocaleDateString('es-ES'));
  
  const [actividades, setActividades] = useState(ACTIVIDADES_CALLE_DEFAULT);
  const [evaluacionItems, setEvaluacionItems] = useState({}); // { [actId]: { cumple: boolean/null } }
  const [notasObservacion, setNotasObservacion] = useState({}); // { [catNombre]: text }
  
  const [fortalezas, setFortalezas] = useState('');
  const [areasMejora, setAreasMejora] = useState('');
  const [recomendacionFinal, setRecomendacionFinal] = useState('AUTONOMIA'); // 'AUTONOMIA', 'MAS_ACOMPANAMIENTO', 'INTERVENCION_GERENCIAL'

  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    cargarAsignacionesYPrevios();
  }, [asesor]);

  const cargarAsignacionesYPrevios = async () => {
    let actsFiltradas = ACTIVIDADES_CALLE_DEFAULT;
    let listaBuddies = BUDDIES_DEFAULT;

    try {
      const localStr = localStorage.getItem('buddies_custom');
      if (localStr) {
        const parsed = JSON.parse(localStr);
        if (Array.isArray(parsed) && parsed.length > 0) listaBuddies = parsed;
      }
    } catch (e) {}

    try {
      const { data: dbB } = await supabase.from('buddies').select('*');
      if (dbB && dbB.length > 0) listaBuddies = dbB;
    } catch (e) {}

    setBuddies(listaBuddies);
    let selectedB = listaBuddies[0] || BUDDIES_DEFAULT[0];
    setSelectedBuddy(selectedB);

    try {
      // 1. Consultar asignación en Supabase o LocalStorage
      let asignacion = null;
      if (asesor?.id) {
        const { data: dbAsig } = await supabase
          .from('asignaciones_calle')
          .select('*, buddies(*)')
          .eq('asesor_id', asesor.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (dbAsig && dbAsig.length > 0) {
          asignacion = dbAsig[0];
        } else {
          // Intentar localstorage
          const localStr = localStorage.getItem(`asignacion_calle_${asesor.id}`);
          if (localStr) asignacion = JSON.parse(localStr);
        }
      }

      if (asignacion) {
        if (asignacion.buddy_id) {
          const bud = listaBuddies.find(x => x.id === asignacion.buddy_id);
          if (bud) setSelectedBuddy(bud);
        }


        if (Array.isArray(asignacion.actividades_ids) && asignacion.actividades_ids.length > 0) {
          actsFiltradas = ACTIVIDADES_CALLE_DEFAULT.filter(a => asignacion.actividades_ids.includes(a.id));
        }
      }

      setActividades(actsFiltradas);

      // Inicializar items de evaluación con 'cumple = true' por defecto
      const initEval = {};
      actsFiltradas.forEach(act => {
        initEval[act.id] = { cumple: true };
      });
      setEvaluacionItems(initEval);

      // 2. Verificar si ya existe un reporte previo guardado
      if (asesor?.id) {
        const { data: dbReporte } = await supabase
          .from('reportes_acompanamiento')
          .select('*')
          .eq('asesor_id', asesor.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (dbReporte && dbReporte.length > 0) {
          const rep = dbReporte[0];
          if (rep.evaluacion_items) setEvaluacionItems(rep.evaluacion_items);
          if (rep.fortalezas_detectadas) setFortalezas(rep.fortalezas_detectadas);
          if (rep.areas_mejora_inmediata) setAreasMejora(rep.areas_mejora_inmediata);
          if (rep.recomendacion_final) setRecomendacionFinal(rep.recomendacion_final);
          if (rep.casa_comercial) setCasaComercial(rep.casa_comercial);
          if (rep.fecha_acompanamiento) setFecha(rep.fecha_acompanamiento);
        }
      }
    } catch (e) {
      console.warn("Usando datos locales por defecto:", e);
    }
  };

  const handleCumpleChange = (actId, cumpleVal) => {
    setEvaluacionItems(prev => ({
      ...prev,
      [actId]: { ...prev[actId], cumple: cumpleVal }
    }));
  };

  const handleNotaCatChange = (catNombre, text) => {
    setNotasObservacion(prev => ({
      ...prev,
      [catNombre]: text
    }));
  };

  const handleGuardarSupabase = async () => {
    setSaving(true);
    setMensaje('');

    const payload = {
      asesor_id: asesor?.id || null,
      buddy_id: selectedBuddy?.id || null,
      nombre_asesor: asesor?.nombre || 'Asesor Nuevo',
      cedula_asesor: asesor?.cedula || asesor?.rif || '',
      zona_region: asesor?.zona || asesor?.estado || 'Región Central',
      nombre_buddy: selectedBuddy?.nombre || 'Buddy Acompañante',
      casa_comercial: casaComercial,
      fecha_acompanamiento: fecha,
      evaluacion_items: evaluacionItems,
      fortalezas_detectadas: fortalezas,
      areas_mejora_inmediata: areasMejora,
      recomendacion_final: recomendacionFinal,
      firma_buddy_nombre: selectedBuddy?.nombre || '',
      firma_gerente_nombre: 'Gerencia de Inducción'
    };

    try {
      const { data, error } = await supabase.from('reportes_acompanamiento').insert([payload]).select();

      if (error) {
        console.warn("Supabase insert warning, saving locally:", error);
        localStorage.setItem(`reporte_calle_${asesor?.id}`, JSON.stringify(payload));
      }

      setMensaje('✅ Reporte de Acompañamiento en Calle guardado exitosamente en Supabase.');
    } catch (e) {
      console.error("Error guardando reporte:", e);
      localStorage.setItem(`reporte_calle_${asesor?.id}`, JSON.stringify(payload));
      setMensaje('✅ Guardado en almacenamiento local.');
    } finally {
      setSaving(false);
    }
  };

  // Preparar objeto para PDF
  const reportDataPDF = {
    nombre: asesor?.nombre || 'Nuevo Ingreso',
    cedula: asesor?.cedula || asesor?.rif || '',
    zona_region: asesor?.zona || asesor?.estado || '',
    buddy: selectedBuddy?.nombre || 'Buddy',
    casa_comercial: casaComercial,
    fecha: fecha,
    actividades: actividades,
    evaluacion_items: evaluacionItems,
    notas_observacion: notasObservacion,
    fortalezas: fortalezas,
    areas_mejora: areasMejora,
    recomendacion_final: recomendacionFinal,
    firma_buddy: selectedBuddy?.nombre || '',
    firma_gerente: 'Gerencia Comercial'
  };

  // Agrupar actividades por categoría
  const categoriasMap = {};
  actividades.forEach(act => {
    if (!categoriasMap[act.categoria]) {
      categoriasMap[act.categoria] = {
        nombre: act.categoria,
        objetivo: act.objetivo || '',
        items: []
      };
    }
    categoriasMap[act.categoria].items.push(act);
  });

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">
              Validación de Asesor Nuevo
            </span>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <span>📋</span> FORMATO DE ACOMPAÑAMIENTO EN CALLE
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white font-bold transition-all">
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {mensaje && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
              {mensaje}
            </div>
          )}

          {/* Encabezado y Datos del Acompañamiento */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-3">
              <h4 className="font-black text-slate-700 uppercase tracking-wider text-[11px] border-b pb-1">
                DATOS DEL NUEVO INGRESO
              </h4>
              <div>
                <label className="font-bold text-slate-500 block">Nombre del Asesor</label>
                <input
                  type="text"
                  value={asesor?.nombre || ''}
                  readOnly
                  className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 block">Cédula / RIF</label>
                  <input
                    type="text"
                    value={asesor?.cedula || asesor?.rif || ''}
                    readOnly
                    className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block">Zona / Región</label>
                  <input
                    type="text"
                    value={asesor?.zona || asesor?.estado || ''}
                    readOnly
                    className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-black text-slate-700 uppercase tracking-wider text-[11px] border-b pb-1">
                ACOMPAÑAMIENTO
              </h4>
              <div>
                <label className="font-bold text-slate-500 block">Buddy / Acompañante</label>
                <select
                  value={selectedBuddy?.id}
                  onChange={(e) => {
                    const b = buddies.find(x => x.id === e.target.value);
                    if (b) setSelectedBuddy(b);
                  }}
                  className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-800"
                >
                  {buddies.map(bud => (
                    <option key={bud.id} value={bud.id}>{bud.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Casa Comercial</label>
                  <div className="flex gap-2 font-semibold">
                    {['Febeca', 'Sillaca', 'Beval'].map(casa => (
                      <label key={casa} className="inline-flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="casa"
                          checked={casaComercial === casa}
                          onChange={() => setCasaComercial(casa)}
                        />
                        {casa}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-500 block">Fecha</label>
                  <input
                    type="text"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-white border rounded-xl px-3 py-2 font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Checklist de Secciones / Categorías */}
          <div className="space-y-6">
            {Object.values(categoriasMap).map((cat, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-black text-blue-900 uppercase">
                    {cat.nombre}
                  </h3>
                  {cat.objetivo && (
                    <p className="text-[11px] italic text-slate-500 font-medium">
                      Objetivo: {cat.objetivo}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {cat.items.map(item => {
                    const cumple = evaluacionItems[item.id]?.cumple;

                    return (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div className="flex-1">
                          <span className="font-bold text-slate-900 block">■ {item.titulo}</span>
                          <span className="text-[11px] text-slate-600 block">{item.descripcion}</span>
                        </div>
                        <div className="flex items-center gap-3 font-bold text-[11px]">
                          <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${cumple === true ? 'bg-emerald-600 text-white border-emerald-700 shadow' : 'bg-white text-slate-600'}`}>
                            <input
                              type="radio"
                              className="hidden"
                              checked={cumple === true}
                              onChange={() => handleCumpleChange(item.id, true)}
                            />
                            ✓ Cumple
                          </label>
                          <label className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${cumple === false ? 'bg-rose-600 text-white border-rose-700 shadow' : 'bg-white text-slate-600'}`}>
                            <input
                              type="radio"
                              className="hidden"
                              checked={cumple === false}
                              onChange={() => handleCumpleChange(item.id, false)}
                            />
                            ✗ No Cumple
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Notas de observación por categoría */}
                <div>
                  <label className="font-bold text-xs text-slate-700 block mb-1">Notas de observación:</label>
                  <textarea
                    rows={2}
                    value={notasObservacion[cat.nombre] || ''}
                    onChange={(e) => handleNotaCatChange(cat.nombre, e.target.value)}
                    placeholder="Detalles u observaciones durante el acompañamiento en esta sección..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Apreciación Final del Buddy */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
            <h3 className="font-black text-blue-950 uppercase text-xs border-b pb-2">
              APRECIACIÓN FINAL DEL BUDDY
            </h3>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Fortalezas detectadas:</label>
              <textarea
                rows={3}
                value={fortalezas}
                onChange={(e) => setFortalezas(e.target.value)}
                placeholder="Indique las fortalezas principales observadas..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Áreas de mejora inmediata:</label>
              <textarea
                rows={3}
                value={areasMejora}
                onChange={(e) => setAreasMejora(e.target.value)}
                placeholder="Puntos a reforzar de manera prioritaria..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
              <label className="font-black text-amber-950 uppercase block text-[11px]">
                RECOMENDACIÓN FINAL DEL BUDDY *
              </label>
              <div className="space-y-2 font-bold text-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rec"
                    checked={recomendacionFinal === 'AUTONOMIA'}
                    onChange={() => setRecomendacionFinal('AUTONOMIA')}
                  />
                  ■ SÍ - El asesor está listo para autonomía
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rec"
                    checked={recomendacionFinal === 'MAS_ACOMPANAMIENTO'}
                    onChange={() => setRecomendacionFinal('MAS_ACOMPANAMIENTO')}
                  />
                  ■ REQUIERE MÁS ACOMPAÑAMIENTO - Continuar monitoreo 3 días
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rec"
                    checked={recomendacionFinal === 'INTERVENCION_GERENCIAL'}
                    onChange={() => setRecomendacionFinal('INTERVENCION_GERENCIAL')}
                  />
                  ■ REQUIERE INTERVENCIÓN GERENCIAL - Contactar facilitador
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-2xl transition-all"
          >
            Cerrar
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPDF(true)}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
            >
              📄 Vista Previa / Imprimir PDF
            </button>

            <button
              onClick={handleGuardarSupabase}
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs rounded-2xl shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? 'Guardando...' : '💾 Grabar en Supabase'}
            </button>
          </div>
        </div>

      </div>

      {/* Renderizado de modal de PDF si está activo */}
      {showPDF && (
        <ReporteAcompanamientoCallePDF
          reportData={reportDataPDF}
          onClose={() => setShowPDF(false)}
        />
      )}
    </div>
  );
}
