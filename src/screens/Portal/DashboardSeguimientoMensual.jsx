import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { kpiService } from '../../services/kpiService';
import { getCompanyConfig } from '../../pages/DashboardSeguimiento';
import '../../styles/prismaDesignSystem.css';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const SUBMODULES_ORDER = [
  { id: '6621ebc1-07c7-40c4-bb5f-34e711e06d53', shortName: '1. B2R Pilares', fullName: 'Modelo de negocio B2R pilares' },
  { id: 'dfa029ab-3b7c-4a2f-aded-dd6fbd7a58f7', shortName: '2. Config. Tecnologías', fullName: 'Configuración y parametrización de las tecnologías' },
  { id: '15e0eca9-aac3-402b-9c16-405a32ddf77b', shortName: '3. Catálogo y SKU', fullName: 'Manejo Operativo de Catálogo Digital y Taxonomía SKU' },
  { id: '52e9f6d3-e55f-4414-af85-f60079c72429', shortName: '4. Módulo Ventas', fullName: 'Módulo de Ventas' },
  { id: '1e6beca6-24d9-4928-b902-f1285b3e5410', shortName: '5. Práctica Televentas', fullName: 'Práctica con Televentas' },
  { id: 'b55ad4a5-f53f-4ffc-8654-7d8e78f9fd73', shortName: '6. Módulo Cobranza', fullName: 'Módulo de Cobranza' },
  { id: '916236e1-739f-4e2f-b2b8-bbf8ad4fe647', shortName: '7. Práctica Telecobranza', fullName: 'Práctica con Telecobranza' },
  { id: 'bcfc4e41-ce23-4669-99e1-5c24a8b69a0c', shortName: '8. Prácticas en Vivo', fullName: 'Prácticas' },
  { id: 'ece7960c-b1a0-4cc5-92cb-b4ad3aba9589', shortName: '9. Evaluaciones', fullName: 'Evaluaciones' },
  { id: '23d93d0e-96e0-4275-80bc-0d5797b017f1', shortName: '10. Cierre Brechas', fullName: 'Cierre de Brechas' }
];

function cleanStr(str) {
  if (!str) return '';
  return String(str).replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseStartDate(adv) {
  if (adv.fecha_ingreso && typeof adv.fecha_ingreso === 'string') {
    const parts = adv.fecha_ingreso.trim().split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return { day, month, year, dateStr: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}` };
      }
    }
  }
  if (adv.created_at) {
    const d = new Date(adv.created_at);
    const day = d.getUTCDate();
    const month = d.getUTCMonth() + 1;
    const year = d.getUTCFullYear();
    return { day, month, year, dateStr: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}` };
  }
  return { day: 1, month: 1, year: 2026, dateStr: '01/01/2026' };
}

export default function DashboardSeguimientoMensual({ user, onBack, standalone = false }) {
  const [loading, setLoading] = useState(true);
  const [advisors, setAdvisors] = useState([]);
  const [inductionNotes, setInductionNotes] = useState([]);
  const [monthlyEvaluations, setMonthlyEvaluations] = useState([]);
  const [kpisMap, setKpisMap] = useState({});

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('Todas');
  const [filterMesCalle, setFilterMesCalle] = useState('todos');
  const [filterMesCalendario, setFilterMesCalendario] = useState('todos');
  const [filterEstatusInd, setFilterEstatusInd] = useState('todos');
  const [filterRamo, setFilterRamo] = useState('todos');

  // Modo de visualización: 'mensual' (seguimiento mes a mes) | 'consolidado' (por asesor) | 'analitica'
  const [viewTab, setViewTab] = useState('mensual');
  // Advisor selected for detail view
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  // State to track which advisors have their month details expanded
  const [expandedAdvisors, setExpandedAdvisors] = useState([]);

  // Modal para cargar KPIs
  const [modalKpiOpen, setModalKpiOpen] = useState(false);
  const [modalData, setModalData] = useState({
    id_asesor: '',
    nombre_asesor: '',
    mes_numero: 1,
    mes_nombre: 'Enero',
    anio: 2026,
    avaluo: '',
    efectividad: '',
    alcance_presupuesto: '',
    observaciones: ''
  });
  const [savingKpi, setSavingKpi] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        { data: advData },
        { data: notesData },
        { data: evalsData },
        { data: profilesData }
      ] = await Promise.all([
        supabase.schema('portal_afv').from('usuarios').select('*').eq('rol', 'asesor').order('nombre'),
        supabase.schema('portal_afv').from('notas_por_submodulo').select('*'),
        supabase.from('evaluations').select('*'),
        supabase.from('profiles').select('*')
      ]);

      setAdvisors(advData || []);
      setInductionNotes(notesData || []);

      // Mapear evaluaciones con email de perfil
      const profileMap = new Map((profilesData || []).map(p => [p.id, p]));
      const mappedEvals = (evalsData || []).map(e => {
        let advisorId = e.advisor_id;
        const p = profileMap.get(e.advisor_id);
        if (p && p.email) {
          const matched = (advData || []).find(a => 
            (a.usuario && a.usuario.trim().toLowerCase() === p.email.trim().toLowerCase()) ||
            (a.correo && a.correo.trim().toLowerCase() === p.email.trim().toLowerCase())
          );
          if (matched) advisorId = matched.id;
        } else {
          const clean = (s) => cleanStr(s).toLowerCase();
          const matched = (advData || []).find(a => clean(a.nombre) === clean(e.advisor_name));
          if (matched) advisorId = matched.id;
        }
        return { ...e, realAdvisorId: advisorId };
      });
      setMonthlyEvaluations(mappedEvals);

      // Cargar KPIs persistidos
      const kpis = await kpiService.getAllKpis();
      setKpisMap(kpis);
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Referencia actual: Octubre 2026
  const targetYear = 2026;
  const targetMonth = 10;

  // Generar conjunto completo de filas mensuales
  const allMonthlyRows = useMemo(() => {
    const rows = [];
    if (!advisors.length) return rows;

    // Mapa de notas por asesor
    const notesByAdvisor = {};
    inductionNotes.forEach(n => {
      if (!notesByAdvisor[n.id_asesor]) notesByAdvisor[n.id_asesor] = {};
      notesByAdvisor[n.id_asesor][n.id_submodulo] = n.nota;
    });

    // Mapa de evaluaciones por `${advisorId}_${month}`
    const evalsByAdvMonth = {};
    monthlyEvaluations.forEach(e => {
      const k = `${e.realAdvisorId}_${e.month_number}`;
      if (!evalsByAdvMonth[k]) evalsByAdvMonth[k] = { Desarrollo: null, Supervisor: null, Auditoria: null, Credito_Cobranza: null, Admin_Ventas: null, Autoevaluacion: null, scores: [] };
      if (e.department && evalsByAdvMonth[k].hasOwnProperty(e.department)) {
        evalsByAdvMonth[k][e.department] = e.average_score;
      }
      if (typeof e.average_score === 'number') {
        evalsByAdvMonth[k].scores.push(e.average_score);
      }
    });

    advisors.forEach(adv => {
      const start = parseStartDate(adv);
      const advNotes = notesByAdvisor[adv.id] || {};

      // 10 notas
      const subNotes = SUBMODULES_ORDER.map(sm => advNotes[sm.id]);
      const validNotes = subNotes.filter(n => typeof n === 'number');
      const indPromedio = validNotes.length > 0
        ? parseFloat((validNotes.reduce((a, b) => a + b, 0) / validNotes.length).toFixed(2))
        : null;

      let estatusInd = 'Sin Iniciar';
      if (validNotes.length === 10) {
        estatusInd = indPromedio >= 7.5 ? 'Completada' : 'Requiere Refuerzo';
      } else if (validNotes.length > 0) {
        estatusInd = `En Proceso (${validNotes.length}/10)`;
      }

      // Generar meses desde fecha ingreso hasta Octubre 2026
      let y = start.year;
      let m = start.month;
      let mesNum = 1;
      const monthsList = [];

      while (y < targetYear || (y === targetYear && m <= targetMonth)) {
        monthsList.push({
          num: mesNum,
          year: y,
          month: m,
          label: `${MONTH_NAMES[m - 1]} ${y}`,
          monthNameOnly: MONTH_NAMES[m - 1]
        });
        mesNum++;
        m++;
        if (m > 12) { m = 1; y++; }
      }
      if (monthsList.length === 0) {
        monthsList.push({
          num: 1,
          year: start.year,
          month: start.month,
          label: `${MONTH_NAMES[start.month - 1]} ${start.year}`,
          monthNameOnly: MONTH_NAMES[start.month - 1]
        });
      }

      monthsList.forEach(period => {
        const kpiKey = `${adv.id}_${period.num}_${period.year}`;
        const kpi = kpisMap[kpiKey] || {};

        const evData = evalsByAdvMonth[`${adv.id}_${period.num}`] || { scores: [] };
        const evalPromedio = evData.scores.length > 0
          ? parseFloat((evData.scores.reduce((a, b) => a + b, 0) / evData.scores.length).toFixed(2))
          : null;

        rows.push({
          id_fila: `${adv.id}_${period.num}`,
          id_asesor: adv.id,
          cedula: cleanStr(adv.clave) || '-',
          nombre: cleanStr(adv.nombre),
          empresa: cleanStr(adv.empresa) || 'Independiente',
          ramo: cleanStr(adv.ramo) || 'General',
          zona: cleanStr(adv.zona) || 'Sin Zona',
          estado: cleanStr(adv.estado) || '-',
          telefono: cleanStr(adv.telefono) || '-',
          correo: cleanStr(adv.correo || adv.usuario),
          fecha_ingreso: start.dateStr,
          mes_numero: period.num,
          mes_label: period.label,
          mes_nombre: period.monthNameOnly,
          anio: period.year,
          // KPIs a cargar
          avaluo: kpi.avaluo != null ? kpi.avaluo : null,
          efectividad: kpi.efectividad != null ? kpi.efectividad : null,
          alcance_presupuesto: kpi.alcance_presupuesto != null ? kpi.alcance_presupuesto : null,
          kpi_observaciones: kpi.observaciones || '',
          // Evaluaciones mensuales
          eval_desarrollo: evData.Desarrollo,
          eval_supervisor: evData.Supervisor,
          eval_auditoria: evData.Auditoria,
          eval_cobranza: evData.Credito_Cobranza,
          eval_ventas: evData.Admin_Ventas,
          eval_autoeval: evData.Autoevaluacion,
          eval_promedio: evalPromedio,
          // Notas inducción
          subNotes,
          indPromedio,
          estatusInd,
          observacion_cualitativa: adv.observacion_cualitativa
        });
      });
    });

    return rows;
  }, [advisors, inductionNotes, monthlyEvaluations, kpisMap]);

  // Lista única de empresas para filtros
  const empresasList = useMemo(() => {
    const setEmp = new Set(advisors.map(a => cleanStr(a.empresa)).filter(Boolean));
    return ['Todas', ...Array.from(setEmp)];
  }, [advisors]);

  // Lista única de ramos para filtros
  const ramosList = useMemo(() => {
    const setR = new Set(advisors.map(a => cleanStr(a.ramo)).filter(Boolean));
    return ['todos', ...Array.from(setR)];
  }, [advisors]);

  // Filtrar filas mensuales
  const filteredRows = useMemo(() => {
    return allMonthlyRows.filter(row => {
      // Filtro texto libre (nombre, cédula, correo)
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchName = row.nombre.toLowerCase().includes(term);
        const matchCedula = row.cedula.toLowerCase().includes(term);
        const matchEmail = row.correo.toLowerCase().includes(term);
        const matchZona = row.zona.toLowerCase().includes(term);
        if (!matchName && !matchCedula && !matchEmail && !matchZona) return false;
      }

      // Filtro empresa
      if (filterEmpresa !== 'Todas' && row.empresa !== filterEmpresa) return false;

      // Filtro número de mes en calle
      if (filterMesCalle !== 'todos' && row.mes_numero !== parseInt(filterMesCalle, 10)) return false;

      // Filtro mes calendario
      if (filterMesCalendario !== 'todos' && !row.mes_label.toLowerCase().includes(filterMesCalendario.toLowerCase())) return false;

      // Filtro estatus inducción
      if (filterEstatusInd !== 'todos') {
        if (filterEstatusInd === 'completada' && !row.estatusInd.includes('Completada')) return false;
        if (filterEstatusInd === 'en_proceso' && !row.estatusInd.includes('En Proceso')) return false;
        if (filterEstatusInd === 'sin_iniciar' && !row.estatusInd.includes('Sin Iniciar')) return false;
      }

      // Filtro ramo
      if (filterRamo !== 'todos' && row.ramo !== filterRamo) return false;

      return true;
    });
  }, [allMonthlyRows, searchTerm, filterEmpresa, filterMesCalle, filterMesCalendario, filterEstatusInd, filterRamo]);

// Orden descendente por año y mes (más reciente primero)
const sortedRows = useMemo(() => {
  return [...filteredRows].sort((a, b) => {
    if (a.anio !== b.anio) return b.anio - a.anio;
    return b.mes_numero - a.mes_numero;
  });
}, [filteredRows]);

  // Resumen Consolidado por Asesor (1 fila por asesor aplicando filtros)
  const consolidatedAdvisors = useMemo(() => {
    const byAdvisor = {};
    sortedRows.forEach(r => {
      if (!byAdvisor[r.id_asesor]) {
        byAdvisor[r.id_asesor] = {
          id_asesor: r.id_asesor,
          cedula: r.cedula,
          nombre: r.nombre,
          empresa: r.empresa,
          ramo: r.ramo,
          zona: r.zona,
          telefono: r.telefono,
          correo: r.correo,
          fecha_ingreso: r.fecha_ingreso,
          indPromedio: r.indPromedio,
          estatusInd: r.estatusInd,
          subNotes: r.subNotes,
          mesesCalleCount: 0,
          avaluos: [],
          efectividades: [],
          alcances: []
        };
      }
      byAdvisor[r.id_asesor].mesesCalleCount++;
      if (r.avaluo != null) byAdvisor[r.id_asesor].avaluos.push(r.avaluo);
      if (r.efectividad != null) byAdvisor[r.id_asesor].efectividades.push(r.efectividad);
      if (r.alcance_presupuesto != null) byAdvisor[r.id_asesor].alcances.push(r.alcance_presupuesto);
    });

    return Object.values(byAdvisor).map(a => {
      const avgAvaluo = a.avaluos.length > 0 ? (a.avaluos.reduce((x, y) => x + y, 0) / a.avaluos.length) : null;
      const avgEfect = a.efectividades.length > 0 ? (a.efectividades.reduce((x, y) => x + y, 0) / a.efectividades.length) : null;
      const avgAlcance = a.alcances.length > 0 ? (a.alcances.reduce((x, y) => x + y, 0) / a.alcances.length) : null;
      return {
        ...a,
        avgAvaluo,
        avgEfect,
        avgAlcance
      };
    });
  }, [filteredRows]);

  // Tarjetas de Métricas Ejecutivas Dinámicas
  const metrics = useMemo(() => {
    const totalAsesores = new Set(filteredRows.map(r => r.id_asesor)).size;
    const totalFilas = filteredRows.length;

    // Promedio Inducción
    const validInds = filteredRows.filter(r => r.indPromedio != null).map(r => r.indPromedio);
    const avgInduccion = validInds.length > 0 ? (validInds.reduce((a, b) => a + b, 0) / validInds.length).toFixed(2) : '-';

    // KPIs cargados
    const avaluos = filteredRows.filter(r => r.avaluo != null).map(r => r.avaluo);
    const avgAvaluo = avaluos.length > 0 ? (avaluos.reduce((a, b) => a + b, 0) / avaluos.length).toLocaleString('es-VE', { maximumFractionDigits: 1 }) : '-';

    const efectividades = filteredRows.filter(r => r.efectividad != null).map(r => r.efectividad);
    const avgEfectividad = efectividades.length > 0 ? (efectividades.reduce((a, b) => a + b, 0) / efectividades.length).toFixed(1) + '%' : '-';

    const alcances = filteredRows.filter(r => r.alcance_presupuesto != null).map(r => r.alcance_presupuesto);
    const avgAlcance = alcances.length > 0 ? (alcances.reduce((a, b) => a + b, 0) / alcances.length).toFixed(1) + '%' : '-';

    return {
      totalAsesores,
      totalFilas,
      avgInduccion,
      avgAvaluo,
      avgEfectividad,
      avgAlcance,
      kpisCargadosCount: avaluos.length + efectividades.length + alcances.length
    };
  }, [filteredRows]);

  // Manejador para abrir modal de carga para una fila específica
  const handleOpenKpiModal = (row) => {
    setModalData({
      id_asesor: row.id_asesor,
      nombre_asesor: row.nombre,
      mes_numero: row.mes_numero,
      mes_nombre: row.mes_nombre,
      anio: row.anio,
      avaluo: row.avaluo != null ? row.avaluo : '',
      efectividad: row.efectividad != null ? row.efectividad : '',
      alcance_presupuesto: row.alcance_presupuesto != null ? row.alcance_presupuesto : '',
      observaciones: row.kpi_observaciones || ''
    });
    setModalKpiOpen(true);
  };

  // Guardar KPI desde el modal
  const handleSaveKpiSubmit = async (e) => {
    e.preventDefault();
    setSavingKpi(true);
    setSaveSuccessMsg('');
    try {
      await kpiService.saveKpi({
        id_asesor: modalData.id_asesor,
        mes_numero: modalData.mes_numero,
        mes_nombre: modalData.mes_nombre,
        anio: modalData.anio,
        avaluo: modalData.avaluo,
        efectividad: modalData.efectividad,
        alcance_presupuesto: modalData.alcance_presupuesto,
        observaciones: modalData.observaciones,
        usuario_email: user?.email || user?.usuario || 'admin'
      });

      // Actualizar mapa local de KPIs
      const updatedKey = `${modalData.id_asesor}_${modalData.mes_numero}_${modalData.anio}`;
      setKpisMap(prev => ({
        ...prev,
        [updatedKey]: {
          id_asesor: modalData.id_asesor,
          mes_numero: Number(modalData.mes_numero),
          mes_nombre: modalData.mes_nombre,
          anio: Number(modalData.anio),
          avaluo: modalData.avaluo !== '' ? Number(modalData.avaluo) : null,
          efectividad: modalData.efectividad !== '' ? Number(modalData.efectividad) : null,
          alcance_presupuesto: modalData.alcance_presupuesto !== '' ? Number(modalData.alcance_presupuesto) : null,
          observaciones: modalData.observaciones
        }
      }));

      setSaveSuccessMsg('✅ Indicadores guardados exitosamente.');
      setTimeout(() => {
        setModalKpiOpen(false);
        setSaveSuccessMsg('');
      }, 1200);
    } catch (err) {
      console.error('Error guardando KPI:', err);
      alert('Error al guardar los indicadores.');
    } finally {
      setSavingKpi(false);
    }
  };

  // Exportar vista actual a Excel
  const handleExportExcel = () => {
    const dataToExport = sortedRows.map(r => ({
      'Cédula': r.cedula,
      'Asesor': r.nombre,
      'Empresa': r.empresa,
      'Ramo': r.ramo,
      'Zona': r.zona,
      'Fecha Ingreso': r.fecha_ingreso,
      'N° Mes Calle': r.mes_numero,
      'Mes Calendario': r.mes_label,
      'Avalúo': r.avaluo ?? '',
      'Efectividad (%)': r.efectividad ?? '',
      'Alcance Presupuesto (%)': r.alcance_presupuesto ?? '',
      'Promedio Desempeño': r.eval_promedio ?? '',
      '1. B2R Pilares': r.subNotes[0] ?? '',
      '2. Config Tecnologías': r.subNotes[1] ?? '',
      '3. Catálogo y SKU': r.subNotes[2] ?? '',
      '4. Módulo Ventas': r.subNotes[3] ?? '',
      '5. Práctica Televentas': r.subNotes[4] ?? '',
      '6. Módulo Cobranza': r.subNotes[5] ?? '',
      '7. Práctica Telecobranza': r.subNotes[6] ?? '',
      '8. Prácticas en Vivo': r.subNotes[7] ?? '',
      '9. Evaluaciones': r.subNotes[8] ?? '',
      '10. Cierre Brechas': r.subNotes[9] ?? '',
      'Promedio Inducción': r.indPromedio ?? '',
      'Estatus Inducción': r.estatusInd,
      'Observaciones': r.kpi_observaciones || ''
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Seguimiento Filtrado');
    XLSX.writeFile(wb, `Reporte_Seguimiento_Filtrado_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-slate-600">Cargando base analítica de asesores y calificaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER PRINCIPAL */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black uppercase tracking-wider">
              Control Integral de Desempeño
            </span>
            <span className="text-xs text-slate-400 font-bold">Actualizado al mes de Octubre 2026</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard de Seguimiento Mensual y KPIs
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Análisis consolidado de calificaciones de inducción y registro de indicadores de gestión comercial mes a mes.
          </p>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              ← Volver
            </button>
          )}

          <button
            onClick={() => {
              if (advisors.length > 0) {
                setModalData({
                  id_asesor: advisors[0].id,
                  nombre_asesor: advisors[0].nombre,
                  mes_numero: 1,
                  mes_nombre: 'Enero',
                  anio: 2026,
                  avaluo: '',
                  efectividad: '',
                  alcance_presupuesto: '',
                  observaciones: ''
                });
                setModalKpiOpen(true);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-black text-xs hover:bg-amber-600 shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <span>➕</span> Cargar Indicadores (KPIs)
          </button>

          <button
            onClick={handleExportExcel}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <span>📥</span> Exportar Excel
          </button>

          <button
            onClick={fetchData}
            title="Recargar datos de la base de datos"
            className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            🔄
          </button>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS ANALÍTICAS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Asesores Filtrados</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics.totalAsesores}</p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">de 46 en fuerza de venta</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Meses en Calle</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{metrics.totalFilas}</p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">periodos evaluados</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Promedio Inducción</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{metrics.avgInduccion}</p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">escala sobre 10 pts</p>
        </div>

        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">Promedio Avalúo</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{metrics.avgAvaluo}</p>
          <p className="text-[10px] text-amber-700 font-bold mt-1">valor comercial cargado</p>
        </div>

        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">Promedio Efectividad</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{metrics.avgEfectividad}</p>
          <p className="text-[10px] text-amber-700 font-bold mt-1">conversión en ruta</p>
        </div>

        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">Alcance Presupuesto</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{metrics.avgAlcance}</p>
          <p className="text-[10px] text-amber-700 font-bold mt-1">cumplimiento meta</p>
        </div>
      </div>

      {/* SECCIÓN DE FILTROS AVANZADOS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900">🔍 Filtros y Criterios de Búsqueda</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {filteredRows.length} registros encontrados
            </span>
          </div>

          {/* SELECTOR DE VISTA */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewTab('mensual')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewTab === 'mensual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              📑 Vista Mensual en Calle ({filteredRows.length})
            </button>
            <button
              onClick={() => setViewTab('consolidado')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewTab === 'consolidado' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              👥 Consolidado por Asesor ({consolidatedAdvisors.length})
            </button>
          </div>
        </div>

        {/* INPUTS DE FILTRO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Búsqueda por Asesor */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
              Buscar Asesor / Cédula
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, cédula o zona..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filtro por Casas / Empresa */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
              Casas Comerciales (Empresa)
            </label>
            <select
              value={filterEmpresa}
              onChange={(e) => setFilterEmpresa(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
            >
              {empresasList.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          {/* Filtro por N° Mes en Calle */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
              N° Mes en Calle
            </label>
            <select
              value={filterMesCalle}
              onChange={(e) => setFilterMesCalle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="todos">Todos los meses en calle</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>Mes {n} de gestión</option>
              ))}
            </select>
          </div>

          {/* Filtro por Mes Calendario */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
              Mes Calendario
            </label>
            <select
              value={filterMesCalendario}
              onChange={(e) => setFilterMesCalendario(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="todos">Todos los meses calendario</option>
              {MONTH_NAMES.slice(0, 10).map(m => (
                <option key={m} value={m}>{m} 2026</option>
              ))}
            </select>
          </div>

          {/* Filtro por Estatus Inducción */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
              Estatus Inducción
            </label>
            <select
              value={filterEstatusInd}
              onChange={(e) => setFilterEstatusInd(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="todos">Todos los estatus</option>
              <option value="completada">Completada / Aprobada</option>
              <option value="en_proceso">En Proceso</option>
              <option value="sin_iniciar">Sin Iniciar</option>
            </select>
          </div>
        </div>

        {/* BOTÓN LIMPIAR FILTROS */}
        {(searchTerm || filterEmpresa !== 'Todas' || filterMesCalle !== 'todos' || filterMesCalendario !== 'todos' || filterEstatusInd !== 'todos' || filterRamo !== 'todos') && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterEmpresa('Todas');
                setFilterMesCalle('todos');
                setFilterMesCalendario('todos');
                setFilterEstatusInd('todos');
                setFilterRamo('todos');
              }}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              ✕ Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* TABLA PRINCIPAL: VISTA MENSUAL EN CALLE */}
      {viewTab === 'mensual' && (
        <div className="rounded-3xl border border-slate-200 shadow-sm overflow-hidden" style={{backgroundColor: 'var(--color-surface)'}}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              {/* SUPER HEADER CON CATEGORÍAS POR COLOR */}
              <thead>
                <tr className="border-b border-slate-200 text-white font-black text-[10px] uppercase tracking-wider">
                  <th colSpan="5" className="bg-slate-900 px-4 py-2 text-center border-r border-slate-800">
                    Datos del Asesor y Asignación
                  </th>
                  <th colSpan="2" className="bg-sky-700 px-4 py-2 text-center border-r border-sky-800">
                    Periodo en Calle
                  </th>
                  <th colSpan="3" className="bg-amber-600 px-4 py-2 text-center border-r border-amber-700">
                    Indicadores Comerciales (KPIs a Cargar)
                  </th>
                  <th colSpan="2" className="bg-emerald-700 px-4 py-2 text-center border-r border-emerald-800">
                    Desempeño Mensual
                  </th>
                  <th colSpan="11" className="bg-indigo-700 px-4 py-2 text-center border-r border-indigo-800">
                    Calificaciones Proceso de Inducción (10 Instrumentos)
                  </th>
                  <th className="bg-slate-800 px-4 py-2 text-center">Acciones</th>
                </tr>

                {/* HEADER DE COLUMNAS ESPECÍFICAS */}
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-tight">
                  <th className="px-3 py-3 border-r border-slate-200">Cédula</th>
                  <th className="px-3 py-3 border-r border-slate-200 min-w-[200px]">Nombre Asesor</th>
                  <th className="px-3 py-3 border-r border-slate-200">Casa / Empresa</th>
                  <th className="px-3 py-3 border-r border-slate-200">Zona</th>
                  <th className="px-3 py-3 border-r border-slate-200">Ingreso</th>

                  <th className="px-3 py-3 border-r border-slate-200 text-center bg-sky-50/50">N° Mes</th>
                  <th className="px-3 py-3 border-r border-slate-200 min-w-[120px] bg-sky-50/50">Mes Calendario</th>

                  <th className="px-3 py-3 border-r border-slate-200 text-right bg-amber-50 font-black text-amber-900">Avalúo</th>
                  <th className="px-3 py-3 border-r border-slate-200 text-right bg-amber-50 font-black text-amber-900">Efectividad</th>
                  <th className="px-3 py-3 border-r border-slate-200 text-right bg-amber-50 font-black text-amber-900">Alcance Presup.</th>

                  <th className="px-3 py-3 border-r border-slate-200 text-right bg-emerald-50">Prom. Desemp.</th>
                  <th className="px-3 py-3 border-r border-slate-200 text-center bg-emerald-50">Eval. Depto</th>

                  {SUBMODULES_ORDER.map(sm => (
                    <th key={sm.id} title={sm.fullName} className="px-2 py-3 border-r border-slate-200 text-right bg-indigo-50/40 text-[9px] min-w-[70px]">
                      {sm.shortName.split('.')[0]}
                    </th>
                  ))}
                  <th className="px-3 py-3 border-r border-slate-200 text-right bg-indigo-100 font-black text-indigo-900">Prom. Ind.</th>

                  <th className="px-3 py-3 text-center">Acción</th>
                </tr>
              </thead>

              {/* FILAS DE DATOS */}
              <tbody className="divide-y divide-slate-100">
                {consolidatedAdvisors.length === 0 ? (
                  <tr>
                    <td colSpan="25" className="p-12 text-center text-slate-400 font-bold text-sm">
                      No se encontraron asesores con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  consolidatedAdvisors.map((r, index) => {
                    const empConfig = getCompanyConfig(r.empresa);
                    const isEven = index % 2 === 0;

                    return (<>
                      <tr key={r.id_asesor} className={`cursor-pointer hover:bg-blue-50/40 transition-colors ${isEven ? 'bg-white' : 'bg-slate-50/40'}`} onClick={() => {
                        // Toggle expanded state for this advisor
                        setExpandedAdvisors(prev =>
                          prev.includes(r.id_asesor)
                            ? prev.filter(id => id !== r.id_asesor)
                            : [...prev, r.id_asesor]
                        );
                      }}>
                        {/* Identificación */}
                        <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600 border-r border-slate-100">{r.cedula}</td>
                        <td className="px-3 py-2.5 font-bold text-slate-900 border-r border-slate-100">{r.nombre}</td>
                        <td className="px-3 py-2.5 border-r border-slate-100">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block"
                            style={{ backgroundColor: empConfig.bgHex, color: empConfig.textHex, border: `1px solid ${empConfig.borderHex}` }}
                          >
                            {empConfig.name}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 text-[11px] border-r border-slate-100">{r.zona}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-[11px] border-r border-slate-100">{r.fecha_ingreso}</td>

                        {/* Periodo */}
                        <td className="px-3 py-2.5 text-center font-bold text-sky-800 bg-sky-50/30 border-r border-slate-100">
                          Mes {r.mes_numero}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-700 bg-sky-50/30 border-r border-slate-100">
                          {r.mes_label}
                        </td>

                        {/* KPIs a Llenar (Resaltados en amarillo/ámbar) */}
                        <td className="px-3 py-2.5 text-right font-black border-r border-amber-200/60 bg-amber-50/50">
                          {r.avaluo != null ? (
                            <span className="text-amber-900 font-mono">{r.avaluo.toLocaleString()}</span>
                          ) : (
                            <button
                              onClick={() => handleOpenKpiModal(r)}
                              className="text-[10px] text-amber-600 font-bold hover:underline"
                            >
                              + Cargar
                            </button>
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-right font-black border-r border-amber-200/60 bg-amber-50/50">
                          {r.efectividad != null ? (
                            <span className="text-amber-900">{r.efectividad}%</span>
                          ) : (
                            <button
                              onClick={() => handleOpenKpiModal(r)}
                              className="text-[10px] text-amber-600 font-bold hover:underline"
                            >
                              + Cargar
                            </button>
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-right font-black border-r border-amber-200/60 bg-amber-50/50">
                          {r.alcance_presupuesto != null ? (
                            <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                              r.alcance_presupuesto >= 100 ? 'bg-emerald-100 text-emerald-800' :
                              r.alcance_presupuesto >= 80 ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {r.alcance_presupuesto}%
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenKpiModal(r)}
                              className="text-[10px] text-amber-600 font-bold hover:underline"
                            >
                              + Cargar
                            </button>
                          )}
                        </td>

                        {/* Desempeño mensual */}
                        <td className="px-3 py-2.5 text-right font-black text-emerald-800 bg-emerald-50/30 border-r border-slate-100">
                          {r.eval_promedio != null ? r.eval_promedio : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-center text-slate-500 bg-emerald-50/30 border-r border-slate-100 text-[10px]">
                          {r.eval_desarrollo != null ? `Des: ${r.eval_desarrollo}` : '-'}
                        </td>

                        {/* Notas individuales de inducción */}
                        {r.subNotes.map((nota, i) => (
                          <td key={i} className="px-2 py-2.5 text-right font-mono text-[10px] border-r border-slate-100 text-slate-700">
                            {nota != null ? nota : '-'}
                          </td>
                        ))}

                        {/* Promedio Inducción */}
                        <td className="px-3 py-2.5 text-right font-black border-r border-slate-100 bg-indigo-50/40">
                          {r.indPromedio != null ? (
                            <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                              r.indPromedio >= 8 ? 'text-emerald-700' :
                              r.indPromedio >= 6 ? 'text-blue-700' : 'text-amber-700'
                            }`}>
                              {r.indPromedio}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Botón de acción */}
                        <td className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => handleOpenKpiModal(r)}
                            title="Editar o cargar indicadores de este mes"
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors text-xs"
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                      {expandedAdvisors.includes(r.id_asesor) && (
                        <tr>
                          <td colSpan="25" className="bg-slate-100 p-2">
                            <div className="text-sm font-medium text-slate-700 mb-1">
                              Meses evaluados para {r.nombre}:
                            </div>
                            <ul className="list-disc list-inside space-y-1">
                              {allMonthlyRows
                                .filter(m => m.id_asesor === r.id_asesor)
                                .map((m, idx) => (
                                  <li key={idx}>
                                    {m.mes_label}: Avalúo {m.avaluo ?? '-'}, Efectividad {m.efectividad ?? '-'}%, Alcance {m.alcance_presupuesto ?? '-'}%
                                  </li>
                                ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    
                  </>);
})
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLA: RESUMEN CONSOLIDADO POR ASESOR */}
      {viewTab === 'consolidado' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                  <th className="px-3 py-3 border-r border-slate-800" style={{color: 'var(--color-text-primary)'}}>Cédula</th>
                  <th className="px-3 py-3 border-r border-slate-800 min-w-[220px]">Asesor</th>
                  <th className="px-3 py-3 border-r border-slate-800">Empresa</th>
                  <th className="px-3 py-3 border-r border-slate-800">Zona</th>
                  <th className="px-3 py-3 border-r border-slate-800 text-center">Fecha Ingreso</th>
                  <th className="px-3 py-3 border-r border-slate-800 text-center" style={{color: 'var(--color-text-primary)'}}>Meses Calle</th>
                  <th className="px-3 py-3 border-r border-slate-800 text-right" style={{backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-text-on-dark)'}}>Prom. Inducción</th>
                  <th className="px-3 py-3 border-r border-slate-800 text-center">Estatus Ind.</th>
                  <th className="px-3 py-3 border-r border-slate-800 text-right bg-amber-900">Prom. Avalúo</th>
                  <th className="px-3 py-3 border-r border-slate-800 text-right bg-amber-900">Prom. Efectividad</th>
                  <th className="px-3 py-3 text-right bg-amber-900">Prom. Alcance Presupuesto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consolidatedAdvisors.map((adv, idx) => {
                  const empConfig = getCompanyConfig(adv.empresa);
                  const isEven = idx % 2 === 0;

                  return (
                    <tr key={adv.id_asesor} className={`hover:bg-slate-50 transition-colors ${isEven ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <td className="px-3 py-3 font-mono text-slate-600 border-r border-slate-100">{adv.cedula}</td>
                      <td className="px-3 py-3 font-bold text-slate-900 border-r border-slate-100">{adv.nombre}</td>
                      <td className="px-3 py-3 border-r border-slate-100">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block"
                          style={{ backgroundColor: empConfig.bgHex, color: empConfig.textHex, border: `1px solid ${empConfig.borderHex}` }}
                        >
                          {empConfig.name}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 border-r border-slate-100">{adv.zona}</td>
                      <td className="px-3 py-3 text-center text-slate-500 border-r border-slate-100">{adv.fecha_ingreso}</td>
                      <td className="px-3 py-3 text-center font-bold text-blue-700 border-r border-slate-100">
                        {adv.mesesCalleCount} meses
                      </td>
                      <td className="px-3 py-3 text-right font-black text-indigo-700 border-r border-slate-100 bg-indigo-50/30">
                        {adv.indPromedio != null ? adv.indPromedio : '-'}
                      </td>
                      <td className="px-3 py-3 text-center border-r border-slate-100">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          adv.estatusInd.includes('Completada') ? 'bg-emerald-100 text-emerald-800' :
                          adv.estatusInd.includes('En Proceso') ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {adv.estatusInd}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-amber-900 bg-amber-50/30 border-r border-slate-100">
                        {adv.avgAvaluo != null ? adv.avgAvaluo.toLocaleString('es-VE', { maximumFractionDigits: 1 }) : '-'}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-amber-900 bg-amber-50/30 border-r border-slate-100">
                        {adv.avgEfect != null ? adv.avgEfect.toFixed(1) + '%' : '-'}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-amber-900 bg-amber-50/30">
                        {adv.avgAlcance != null ? adv.avgAlcance.toFixed(1) + '%' : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL PARA CARGAR INDICADORES MES A MES */}
      {modalKpiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Carga Mensual de Gestión
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Cargar Indicadores del Asesor
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Registre los tres indicadores para el periodo de evaluación seleccionado.
                </p>
              </div>
              <button
                onClick={() => setModalKpiOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 text-center animate-in fade-in">
                {saveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveKpiSubmit} className="space-y-4">
              {/* Selector de Asesor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asesor Comercial
                </label>
                <select
                  value={modalData.id_asesor}
                  onChange={(e) => {
                    const sel = advisors.find(a => a.id === e.target.value);
                    setModalData(prev => ({
                      ...prev,
                      id_asesor: e.target.value,
                      nombre_asesor: sel ? sel.nombre : ''
                    }));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {advisors.map(adv => (
                    <option key={adv.id} value={adv.id}>{adv.nombre} ({adv.empresa})</option>
                  ))}
                </select>
              </div>

              {/* Selector de Mes y Año */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    N° de Mes en Calle
                  </label>
                  <select
                    value={modalData.mes_numero}
                    onChange={(e) => {
                      const num = parseInt(e.target.value, 10);
                      setModalData(prev => ({
                        ...prev,
                        mes_numero: num,
                        mes_nombre: MONTH_NAMES[Math.min(num - 1, 11)]
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                      <option key={n} value={n}>Mes {n} de gestión</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mes Calendario / Año
                  </label>
                  <select
                    value={modalData.mes_nombre}
                    onChange={(e) => setModalData(prev => ({ ...prev, mes_nombre: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {MONTH_NAMES.map(m => (
                      <option key={m} value={m}>{m} 2026</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Input 1: Avalúo */}
              <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/70 space-y-1">
                <label className="block text-xs font-black text-amber-900 uppercase tracking-wide">
                  1. Avalúo
                </label>
                <input
                  type="number"
                  step="any"
                  value={modalData.avaluo}
                  onChange={(e) => setModalData(prev => ({ ...prev, avaluo: e.target.value }))}
                  placeholder="Ingrese el monto o valor del avalúo..."
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-amber-700">Monto valorado o tasación asignada al asesor en el periodo.</p>
              </div>

              {/* Input 2: Efectividad */}
              <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/70 space-y-1">
                <label className="block text-xs font-black text-amber-900 uppercase tracking-wide">
                  2. Efectividad (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={modalData.efectividad}
                  onChange={(e) => setModalData(prev => ({ ...prev, efectividad: e.target.value }))}
                  placeholder="Porcentaje de efectividad (ej: 85.5)..."
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-amber-700">Porcentaje de clientes visitados vs con compra efectiva.</p>
              </div>

              {/* Input 3: Alcance del Presupuesto */}
              <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/70 space-y-1">
                <label className="block text-xs font-black text-amber-900 uppercase tracking-wide">
                  3. Alcance del Presupuesto (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={modalData.alcance_presupuesto}
                  onChange={(e) => setModalData(prev => ({ ...prev, alcance_presupuesto: e.target.value }))}
                  placeholder="Porcentaje de cumplimiento de ventas (ej: 102.4)..."
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-amber-700">Porcentaje de ventas logradas sobre la cuota mensual.</p>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones / Comentarios Adicionales
                </label>
                <textarea
                  rows={2}
                  value={modalData.observaciones}
                  onChange={(e) => setModalData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Notas sobre el desempeño del mes, incidencias o acuerdos..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Botones de acción del modal */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalKpiOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingKpi}
                  className="px-6 py-2 rounded-xl text-xs font-black bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition-all disabled:opacity-50"
                >
                  {savingKpi ? 'Guardando...' : 'Guardar Indicadores'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
