import { supabase } from '../lib/supabase';

/**
 * Servicio para persistir y recuperar los tres indicadores mensuales por asesor:
 * - Avalúo
 * - Efectividad
 * - Alcance del Presupuesto
 * 
 * Funciona de forma resiliente:
 * 1. Intenta consultar/escribir en la tabla dedicada `portal_afv.kpis_mensuales`.
 * 2. Si dicha tabla no existe aún, usa la tabla existente `portal_afv.seguimientos`
 *    marcando la actividad como 'KPI_MENSUAL' con payload JSON en 'observacion'.
 * 3. Mantiene caché en localStorage para disponibilidad offline o inmediata.
 */

const LOCAL_STORAGE_KEY = 'portal_afv_kpis_mensuales_cache';

export const kpiService = {
  /**
   * Obtiene todos los KPIs mensuales registrados
   * Retorna un mapa: `${id_asesor}_${mes_numero}_${anio}` -> { avaluo, efectividad, alcance_presupuesto, observaciones, id }
   */
  async getAllKpis() {
    const kpiMap = {};

    // 1. Cargar desde localStorage como base rápida
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        Object.assign(kpiMap, parsed);
      }
    } catch (e) {
      console.warn('Error leyendo cache de KPIs locales:', e);
    }

    // 2. Intentar leer desde portal_afv.kpis_mensuales
    let hasDedicatedTable = false;
    try {
      const { data, error } = await supabase
        .schema('portal_afv')
        .from('kpis_mensuales')
        .select('*');

      if (!error && data) {
        hasDedicatedTable = true;
        data.forEach(item => {
          const key = `${item.id_asesor}_${item.mes_numero}_${item.anio}`;
          kpiMap[key] = {
            id: item.id,
            id_asesor: item.id_asesor,
            mes_numero: item.mes_numero,
            mes_nombre: item.mes_nombre,
            anio: item.anio,
            avaluo: item.avaluo != null ? Number(item.avaluo) : null,
            efectividad: item.efectividad != null ? Number(item.efectividad) : null,
            alcance_presupuesto: item.alcance_presupuesto != null ? Number(item.alcance_presupuesto) : null,
            observaciones: item.observaciones || '',
            updated_at: item.updated_at
          };
        });
      }
    } catch (e) {
      // Ignorar si no existe
    }

    // 3. Si no hay tabla dedicada, consultar portal_afv.seguimientos con actividad = 'KPI_MENSUAL'
    if (!hasDedicatedTable) {
      try {
        const { data, error } = await supabase
          .schema('portal_afv')
          .from('seguimientos')
          .select('*')
          .eq('actividad', 'KPI_MENSUAL');

        if (!error && data) {
          data.forEach(item => {
            if (item.observacion && item.observacion.startsWith('{')) {
              try {
                const parsed = JSON.parse(item.observacion);
                const key = `${item.id_asesor}_${parsed.mes_numero}_${parsed.anio}`;
                kpiMap[key] = {
                  id: item.id,
                  id_asesor: item.id_asesor,
                  mes_numero: parsed.mes_numero,
                  mes_nombre: parsed.mes_nombre,
                  anio: parsed.anio,
                  avaluo: parsed.avaluo != null ? Number(parsed.avaluo) : null,
                  efectividad: parsed.efectividad != null ? Number(parsed.efectividad) : null,
                  alcance_presupuesto: parsed.alcance_presupuesto != null ? Number(parsed.alcance_presupuesto) : null,
                  observaciones: parsed.observaciones || '',
                  updated_at: item.created_at
                };
              } catch (err) {}
            }
          });
        }
      } catch (e) {
        console.warn('Error leyendo seguimientos KPI:', e);
      }
    }

    // Actualizar caché local
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(kpiMap));
    } catch (e) {}

    return kpiMap;
  },

  /**
   * Guarda o actualiza los KPIs de un asesor para un mes y año específico
   */
  async saveKpi({ id_asesor, mes_numero, mes_nombre, anio, avaluo, efectividad, alcance_presupuesto, observaciones = '', usuario_email = 'admin' }) {
    const payload = {
      id_asesor,
      mes_numero: Number(mes_numero),
      mes_nombre,
      anio: Number(anio),
      avaluo: avaluo !== '' && avaluo != null ? Number(avaluo) : null,
      efectividad: efectividad !== '' && efectividad != null ? Number(efectividad) : null,
      alcance_presupuesto: alcance_presupuesto !== '' && alcance_presupuesto != null ? Number(alcance_presupuesto) : null,
      observaciones: observaciones || ''
    };

    let saved = false;

    // 1. Intentar guardar en kpis_mensuales
    try {
      const { data, error } = await supabase
        .schema('portal_afv')
        .from('kpis_mensuales')
        .upsert({
          ...payload,
          actualizado_por: usuario_email,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id_asesor,mes_numero,anio' })
        .select();

      if (!error) {
        saved = true;
      }
    } catch (e) {}

    // 2. Si falló la tabla dedicada, guardar en portal_afv.seguimientos
    if (!saved) {
      try {
        const obsJson = JSON.stringify({
          mes_numero: payload.mes_numero,
          mes_nombre: payload.mes_nombre,
          anio: payload.anio,
          avaluo: payload.avaluo,
          efectividad: payload.efectividad,
          alcance_presupuesto: payload.alcance_presupuesto,
          observaciones: payload.observaciones,
          usuario_email
        });

        // Revisar si ya existía un registro de seguimiento previo para este asesor y mes
        const fechaProgramada = `${payload.anio}-${String(payload.mes_numero).padStart(2, '0')}-01`;
        const { data: existing } = await supabase
          .schema('portal_afv')
          .from('seguimientos')
          .select('id')
          .eq('id_asesor', id_asesor)
          .eq('actividad', 'KPI_MENSUAL')
          .eq('fecha_programada', fechaProgramada)
          .limit(1);

        if (existing && existing.length > 0) {
          await supabase
            .schema('portal_afv')
            .from('seguimientos')
            .update({
              observacion: obsJson,
              estado: 'guardado'
            })
            .eq('id', existing[0].id);
        } else {
          await supabase
            .schema('portal_afv')
            .from('seguimientos')
            .insert([{
              id_asesor,
              fecha_programada: fechaProgramada,
              actividad: 'KPI_MENSUAL',
              observacion: obsJson,
              estado: 'guardado'
            }]);
        }
        saved = true;
      } catch (err) {
        console.error('Error guardando en seguimientos fallback:', err);
      }
    }

    // 3. Guardar en caché local
    try {
      const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
      const key = `${id_asesor}_${payload.mes_numero}_${payload.anio}`;
      cached[key] = {
        ...payload,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cached));
    } catch (e) {}

    return payload;
  }
};
