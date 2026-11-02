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

  // Modal para cargar/modificar KPIs
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
  const [deletingKpi, setDeletingKpi] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Auto-rellena los campos del modal al cambiar asesor o periodo si ya existen KPIs
  const handleModalAdvisorOrPeriodChange = (newAdvisorId, newMesNumero, newAnio, newMesNombre) => {
    const advId = newAdvisorId !== undefined ? newAdvisorId : modalData.id_asesor;
    const mesNum = newMesNumero !== undefined ? Number(newMesNumero) : Number(modalData.mes_numero);
    const anioNum = newAnio !== undefined ? Number(newAnio) : Number(modalData.anio);
    const mesNom = newMesNombre !== undefined ? newMesNombre : (MONTH_NAMES[Math.min(mesNum - 1, 11)] || modalData.mes_nombre);

    const advObj = advisors.find(a => a.id === advId);
    const key = `${advId}_${mesNum}_${anioNum}`;
    const existing = kpisMap[key];

    if (existing) {
      setModalData({
        id_asesor: advId,
        nombre_asesor: advObj ? advObj.nombre : (existing.nombre_asesor || ''),
        mes_numero: mesNum,
        mes_nombre: mesNom,
        anio: anioNum,
        avaluo: existing.avaluo != null ? existing.avaluo : '',
        efectividad: existing.efectividad != null ? existing.efectividad : '',
        alcance_presupuesto: existing.alcance_presupuesto != null ? existing.alcance_presupuesto : '',
        observaciones: existing.observaciones || ''
      });
    } else {
      setModalData({
        id_asesor: advId,
        nombre_asesor: advObj ? advObj.nombre : '',
        mes_numero: mesNum,
        mes_nombre: mesNom,
        anio: anioNum,
        avaluo: '',
        efectividad: '',
        alcance_presupuesto: '',
        observaciones: ''
      });
    }
  };

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

  // Manejador para abrir modal de carga/edición para una fila específica
  const handleOpenKpiModal = (row) => {
    const key = `${row.id_asesor}_${row.mes_numero}_${row.anio}`;
    const existing = kpisMap[key];

    setModalData({
      id_asesor: row.id_asesor,
      nombre_asesor: row.nombre,
      mes_numero: row.mes_numero,
      mes_nombre: row.mes_nombre || row.mes_label || MONTH_NAMES[Math.min(row.mes_numero - 1, 11)],
      anio: row.anio || 2026,
      avaluo: existing?.avaluo != null ? existing.avaluo : (row.avaluo != null ? row.avaluo : ''),
      efectividad: existing?.efectividad != null ? existing.efectividad : (row.efectividad != null ? row.efectividad : ''),
      alcance_presupuesto: existing?.alcance_presupuesto != null ? existing.alcance_presupuesto : (row.alcance_presupuesto != null ? row.alcance_presupuesto : ''),
      observaciones: existing?.observaciones || row.kpi_observaciones || ''
    });
    setSaveSuccessMsg('');
    setModalKpiOpen(true);
  };

  // Guardar o Actualizar KPI desde el modal
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

  // Eliminar KPI para el asesor y mes seleccionados
  const handleDeleteKpiSubmit = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar los indicadores de ${modalData.nombre_asesor} para el mes ${modalData.mes_numero} (${modalData.mes_nombre} ${modalData.anio})?`)) {
      return;
    }
    setDeletingKpi(true);
    setSaveSuccessMsg('');
    try {
      await kpiService.deleteKpi(modalData.id_asesor, modalData.mes_numero, modalData.anio);
      const key = `${modalData.id_asesor}_${modalData.mes_numero}_${modalData.anio}`;
      setKpisMap(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      setSaveSuccessMsg('🗑️ Indicadores eliminados exitosamente.');
      setTimeout(() => {
        setModalKpiOpen(false);
        setSaveSuccessMsg('');
      }, 1200);
    } catch (err) {
      console.error('Error eliminando KPI:', err);
      alert('Error al eliminar los indicadores.');
    } finally {
      setDeletingKpi(false);
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
                const firstAdv = advisors[0];
                handleModalAdvisorOrPeriodChange(firstAdv.id, 1, 2026, 'Enero');
                setSaveSuccessMsg('');
                setModalKpiOpen(true);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-black text-xs hover:bg-amber-600 shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <span>➕ / ✏️</span> Cargar o Modificar KPIs
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
              👥 Vista por Asesor con Meses Desplegables ({consolidatedAdvisors.length})
            </button>
            <button
              onClick={() => setViewTab('consolidado')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewTab === 'consolidado' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              📊 Resumen Consolidado ({consolidatedAdvisors.length})
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

      {/* TABLA PRINCIPAL: VISTA POR ASESOR CON MESES DESPLEGABLES */}
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
                  <th className="bg-sky-700 px-4 py-2 text-center border-r border-sky-800">
                    Periodo
                  </th>
                  <th colSpan="3" className="bg-amber-600 px-4 py-2 text-center border-r border-amber-700">
                    Promedios Indicadores (KPIs)
                  </th>
                  <th colSpan="2" className="bg-emerald-700 px-4 py-2 text-center border-r border-emerald-800">
                    Desempeño General
                  </th>
                  <th colSpan="11" className="bg-indigo-700 px-4 py-2 text-center border-r border-indigo-800">
                    Calificaciones Proceso de Inducción (10 Instrumentos)
                  </th>
                  <th className="bg-slate-800 px-4 py-2 text-center min-w-[140px]">Desarrollo Mes a Mes</th>
                </tr>

                {/* HEADER DE COLUMNAS ESPECÍFICAS */}
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-tight">
                  <th className="px-3 py-3 border-r border-slate-200">Cédula</th>
                  <th className="px-3 py-3 border-r border-slate-200 min-w-[200px]">Nombre Asesor</th>
                  <th className="px-3 py-3 border-r border-slate-200">Casa / Empresa</th>
                  <th className="px-3 py-3 border-r border-slate-200">Zona</th>
                  <th className="px-3 py-3 border-r border-slate-200">Ingreso</th>

                  <th className="px-3 py-3 border-r border-slate-200 text-center bg-sky-50/50">Meses en Calle</th>

                  <th className="px-3 py-3 border-r border-slate-200 text-right bg-amber-50 font-black text-amber-900">Prom. Avalúo</th>
                  <th className="px-3 py-3 border-r border-slate-200 text-right bg-amber-50 font-black text-amber-900">Prom. Efectividad</th>
                  <th className="px-3 py-3 border-r border-slate-200 text-right bg-amber-50 font-black text-amber-900">Prom. Alcance</th>

                  <th className="px-3 py-2 border-r border-slate-200 text-right bg-emerald-50">Prom. Ind.</th>
                  <th className="px-3 py-2 border-r border-slate-200 text-center bg-emerald-50">Estatus Ind.</th>

                  {SUBMODULES_ORDER.map(sm => (
                    <th key={sm.id} title={sm.fullName} className="px-2 py-3 border-r border-slate-200 text-right bg-indigo-50/40 text-[9px] min-w-[70px]">
                      {sm.shortName.split('.')[0]}
                    </th>
                  ))}
                  <th className="px-3 py-3 border-r border-slate-200 text-right bg-indigo-100 font-black text-indigo-900">Prom. Ind.</th>
                  <th className="px-3 py-3 text-center bg-slate-100">Acción</th>
                </tr>
              </thead>

              {/* FILAS DE DATOS POR ASESOR */}
              <tbody className="divide-y divide-slate-100">
                {consolidatedAdvisors.length === 0 ? (
                  <tr>
                    <td colSpan="24" className="p-12 text-center text-slate-400 font-bold text-sm">
                      No se encontraron asesores con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  consolidatedAdvisors.map((r, index) => {
                    const empConfig = getCompanyConfig(r.empresa);
                    const isEven = index % 2 === 0;
                    const isExpanded = expandedAdvisors.includes(r.id_asesor);
                    const monthsForAdvisor = allMonthlyRows.filter(m => m.id_asesor === r.id_asesor);

                    return (
                      <React.Fragment key={r.id_asesor}>
                        {/* Fila Resumen del Asesor (Clic para desplegar sus meses) */}
                        <tr 
                          onClick={() => {
                            setExpandedAdvisors(prev =>
                              prev.includes(r.id_asesor)
                                ? prev.filter(id => id !== r.id_asesor)
                                : [...prev, r.id_asesor]
                            );
                          }}
                          className={`hover:bg-amber-50/30 transition-colors cursor-pointer ${isExpanded ? 'bg-amber-50/40' : (isEven ? 'bg-white' : 'bg-slate-50/40')}`}
                        >
                          {/* Identificación */}
                          <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600 border-r border-slate-100">{r.cedula}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900 border-r border-slate-100">
                            <div className="flex items-center justify-between gap-2">
                              <span>{r.nombre}</span>
                              <span className="text-[10px] text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded font-bold">
                                {isExpanded ? '▲ Ocultar' : '▼ Desplegar'}
                              </span>
                            </div>
                          </td>
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

                          {/* Periodo en calle */}
                          <td className="px-3 py-2.5 text-center font-bold text-sky-800 bg-sky-50/30 border-r border-slate-100">
                            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 text-[11px] font-black">
                              {r.mesesCalleCount} meses
                            </span>
                          </td>

                          {/* Promedio Avalúo */}
                          <td className="px-3 py-2.5 text-right font-black border-r border-amber-200/60 bg-amber-50/50">
                            {r.avgAvaluo != null ? (
                              <span className="text-amber-950 font-mono">{r.avgAvaluo.toLocaleString('es-VE', { maximumFractionDigits: 1 })}</span>
                            ) : (
                              <span className="text-slate-400 font-normal">-</span>
                            )}
                          </td>

                          {/* Promedio Efectividad */}
                          <td className="px-3 py-2.5 text-right font-black border-r border-amber-200/60 bg-amber-50/50">
                            {r.avgEfect != null ? (
                              <span className="text-amber-950">{r.avgEfect.toFixed(1)}%</span>
                            ) : (
                              <span className="text-slate-400 font-normal">-</span>
                            )}
                          </td>

                          {/* Promedio Alcance */}
                          <td className="px-3 py-2.5 text-right font-black border-r border-amber-200/60 bg-amber-50/50">
                            {r.avgAlcance != null ? (
                              <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                r.avgAlcance >= 100 ? 'bg-emerald-100 text-emerald-800' :
                                r.avgAlcance >= 80 ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {r.avgAlcance.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal">-</span>
                            )}
                          </td>

                          {/* Promedio General / Estatus */}
                          <td className="px-3 py-2.5 text-right font-black text-indigo-700 bg-emerald-50/20 border-r border-slate-100">
                            {r.indPromedio != null ? r.indPromedio : '-'}
                          </td>
                          <td className="px-3 py-2.5 text-center border-r border-slate-100 bg-emerald-50/20 text-[10px]">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.estatusInd.includes('Completada') ? 'bg-emerald-100 text-emerald-800' :
                              r.estatusInd.includes('En Proceso') ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {r.estatusInd}
                            </span>
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

                          {/* Botón de acción para expandir */}
                          <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setExpandedAdvisors(prev =>
                                  prev.includes(r.id_asesor)
                                    ? prev.filter(id => id !== r.id_asesor)
                                    : [...prev, r.id_asesor]
                                );
                              }}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 mx-auto shadow-xs ${
                                isExpanded
                                  ? 'bg-amber-500 text-white border-amber-600 shadow-amber-200'
                                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                              }`}
                            >
                              <span>{isExpanded ? '▲' : '▼'}</span>
                              <span>{isExpanded ? 'Ocultar' : `Ver meses (${monthsForAdvisor.length})`}</span>
                            </button>
                          </td>
                        </tr>

                        {/* FILA EXPANDIDA: DESARROLLO DE EVALUACIONES E INDICADORES MES A MES */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="24" className="bg-slate-50/90 p-4 lg:p-6 border-b-2 border-amber-300">
                              <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-5 shadow-xs space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">📈</span>
                                    <div>
                                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                                        Desarrollo de Evaluaciones e Indicadores Mes a Mes: <span className="text-blue-700 font-bold">{r.nombre}</span>
                                      </h4>
                                      <p className="text-[11px] text-slate-500 font-medium">
                                        {monthsForAdvisor.length} periodos evaluados en calle. Haga clic en los valores o en "✏️ Modificar" para editar los indicadores.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                                        <th className="px-3 py-2.5 border-r border-slate-200 text-center bg-sky-50 text-sky-900">Periodo</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200">Mes Calendario</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200 text-right bg-amber-50/80 text-amber-900 font-black">Avalúo</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200 text-right bg-amber-50/80 text-amber-900 font-black">Efectividad</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200 text-right bg-amber-50/80 text-amber-900 font-black">Alcance Presupuesto</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200 text-right bg-emerald-50/80 text-emerald-900 font-black">Prom. Desempeño</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200 text-center bg-emerald-50/50 text-emerald-900">Eval. Depto</th>
                                        <th className="px-3 py-2.5 border-r border-slate-200">Observaciones</th>
                                        <th className="px-3 py-2.5 text-center bg-slate-200/70 font-black">Acción</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                      {monthsForAdvisor.length === 0 ? (
                                        <tr>
                                          <td colSpan="9" className="p-4 text-center text-slate-400 font-bold">
                                            No hay meses registrados aún para este asesor.
                                          </td>
                                        </tr>
                                      ) : (
                                        monthsForAdvisor.map((m, mIdx) => (
                                          <tr key={mIdx} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-3 py-2 text-center font-bold text-sky-800 bg-sky-50/40 border-r border-slate-100">
                                              Mes {m.mes_numero}
                                            </td>
                                            <td className="px-3 py-2 font-bold text-slate-800 border-r border-slate-100">
                                              {m.mes_label}
                                            </td>

                                            {/* Avalúo */}
                                            <td className="px-3 py-2 text-right font-black border-r border-amber-100 bg-amber-50/30">
                                              {m.avaluo != null ? (
                                                <div
                                                  onClick={() => handleOpenKpiModal(m)}
                                                  title="Clic para modificar Avalúo"
                                                  className="inline-flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded-lg bg-amber-100 text-amber-950 hover:bg-amber-200 transition-all font-mono font-black shadow-xs"
                                                >
                                                  <span>{Number(m.avaluo).toLocaleString()}</span>
                                                  <span className="text-[10px] text-amber-700">✏️</span>
                                                </div>
                                              ) : (
                                                <button
                                                  onClick={() => handleOpenKpiModal(m)}
                                                  className="text-[10px] text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded transition-all"
                                                >
                                                  + Cargar
                                                </button>
                                              )}
                                            </td>

                                            {/* Efectividad */}
                                            <td className="px-3 py-2 text-right font-black border-r border-amber-100 bg-amber-50/30">
                                              {m.efectividad != null ? (
                                                <div
                                                  onClick={() => handleOpenKpiModal(m)}
                                                  title="Clic para modificar Efectividad"
                                                  className="inline-flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded-lg bg-amber-100 text-amber-950 hover:bg-amber-200 transition-all font-black shadow-xs"
                                                >
                                                  <span>{m.efectividad}%</span>
                                                  <span className="text-[10px] text-amber-700">✏️</span>
                                                </div>
                                              ) : (
                                                <button
                                                  onClick={() => handleOpenKpiModal(m)}
                                                  className="text-[10px] text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded transition-all"
                                                >
                                                  + Cargar
                                                </button>
                                              )}
                                            </td>

                                            {/* Alcance Presupuesto */}
                                            <td className="px-3 py-2 text-right font-black border-r border-amber-100 bg-amber-50/30">
                                              {m.alcance_presupuesto != null ? (
                                                <div
                                                  onClick={() => handleOpenKpiModal(m)}
                                                  title="Clic para modificar Alcance del Presupuesto"
                                                  className={`inline-flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded-lg font-black transition-all shadow-xs ${
                                                    m.alcance_presupuesto >= 100 ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200' :
                                                    m.alcance_presupuesto >= 80 ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' :
                                                    'bg-red-100 text-red-900 hover:bg-red-200'
                                                  }`}
                                                >
                                                  <span>{m.alcance_presupuesto}%</span>
                                                  <span className="text-[10px]">✏️</span>
                                                </div>
                                              ) : (
                                                <button
                                                  onClick={() => handleOpenKpiModal(m)}
                                                  className="text-[10px] text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded transition-all"
                                                >
                                                  + Cargar
                                                </button>
                                              )}
                                            </td>

                                            {/* Promedio Desempeño */}
                                            <td className="px-3 py-2 text-right font-black text-emerald-800 bg-emerald-50/30 border-r border-slate-100">
                                              {m.eval_promedio != null ? m.eval_promedio : '-'}
                                            </td>

                                            {/* Eval Depto */}
                                            <td className="px-3 py-2 text-center text-slate-600 bg-emerald-50/20 border-r border-slate-100 text-[10px]">
                                              {m.eval_desarrollo != null ? `Des: ${m.eval_desarrollo}` : '-'}
                                            </td>

                                            {/* Observaciones */}
                                            <td className="px-3 py-2 text-slate-500 border-r border-slate-100 text-[11px] italic max-w-[200px] truncate" title={m.kpi_observaciones || ''}>
                                              {m.kpi_observaciones ? `"${m.kpi_observaciones}"` : '-'}
                                            </td>

                                            {/* Acción */}
                                            <td className="px-3 py-2 text-center">
                                              <button
                                                onClick={() => handleOpenKpiModal(m)}
                                                title="Modificar indicadores de este mes"
                                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-all inline-flex items-center gap-1 shadow-xs"
                                              >
                                                <span>✏️</span>
                                                <span>Modificar</span>
                                              </button>
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
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
                  <th className="px-3 py-3 text-right bg-amber-900 border-r border-slate-800">Prom. Alcance Presupuesto</th>
                  <th className="px-3 py-3 text-center bg-slate-800">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consolidatedAdvisors.map((adv, idx) => {
                  const empConfig = getCompanyConfig(adv.empresa);
                  const isEven = idx % 2 === 0;
                  const isExpanded = expandedAdvisors.includes(adv.id_asesor);

                  return (
                    <React.Fragment key={adv.id_asesor}>
                      <tr 
                        className={`hover:bg-amber-50/30 transition-colors cursor-pointer ${isEven ? 'bg-white' : 'bg-slate-50/40'}`}
                        onClick={() => {
                          setExpandedAdvisors(prev =>
                            prev.includes(adv.id_asesor)
                              ? prev.filter(id => id !== adv.id_asesor)
                              : [...prev, adv.id_asesor]
                          );
                        }}
                      >
                        <td className="px-3 py-3 font-mono text-slate-600 border-r border-slate-100">{adv.cedula}</td>
                        <td className="px-3 py-3 font-bold text-slate-900 border-r border-slate-100">
                          <div className="flex items-center justify-between gap-2">
                            <span>{adv.nombre}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {isExpanded ? '▲ Ocultar' : '▼ Ver meses'}
                            </span>
                          </div>
                        </td>
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
                        <td className="px-3 py-3 text-right font-bold text-amber-900 bg-amber-50/30 border-r border-slate-100">
                          {adv.avgAlcance != null ? adv.avgAlcance.toFixed(1) + '%' : '-'}
                        </td>
                        <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setExpandedAdvisors(prev =>
                                prev.includes(adv.id_asesor)
                                  ? prev.filter(id => id !== adv.id_asesor)
                                  : [...prev, adv.id_asesor]
                              );
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-xs"
                          >
                            {isExpanded ? 'Cerrar' : 'Ver / Editar Meses'}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan="12" className="bg-slate-50/90 p-5 border-b border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                                <span>📅</span> Historial Mensual y KPIs de <span className="text-blue-700">{adv.nombre}</span>:
                              </p>
                              <span className="text-[10px] font-bold text-slate-500">
                                Haga clic en "✏️ Modificar" en cualquier mes para actualizar sus valores.
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {allMonthlyRows
                                .filter(m => m.id_asesor === adv.id_asesor)
                                .map((m, mIdx) => {
                                  const hasKpi = m.avaluo != null || m.efectividad != null || m.alcance_presupuesto != null;
                                  return (
                                    <div 
                                      key={mIdx} 
                                      className={`p-3.5 rounded-2xl border transition-all ${
                                        hasKpi ? 'bg-white border-amber-300 shadow-xs' : 'bg-slate-100/70 border-slate-200'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100">
                                        <div>
                                          <span className="text-[10px] font-black uppercase text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full mr-1.5">
                                            Mes {m.mes_numero}
                                          </span>
                                          <span className="text-xs font-bold text-slate-800">{m.mes_label}</span>
                                        </div>
                                        <button
                                          onClick={() => handleOpenKpiModal(m)}
                                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-all flex items-center gap-1 shadow-xs"
                                        >
                                          <span>✏️</span>
                                          <span>{hasKpi ? 'Modificar' : 'Cargar'}</span>
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                                        <div className="bg-amber-50/60 p-1.5 rounded-xl border border-amber-100">
                                          <span className="block text-[9px] font-black text-amber-800 uppercase">Avalúo</span>
                                          <span className="font-mono font-bold text-slate-800">
                                            {m.avaluo != null ? Number(m.avaluo).toLocaleString() : '-'}
                                          </span>
                                        </div>
                                        <div className="bg-amber-50/60 p-1.5 rounded-xl border border-amber-100">
                                          <span className="block text-[9px] font-black text-amber-800 uppercase">Efectividad</span>
                                          <span className="font-bold text-slate-800">
                                            {m.efectividad != null ? `${m.efectividad}%` : '-'}
                                          </span>
                                        </div>
                                        <div className="bg-amber-50/60 p-1.5 rounded-xl border border-amber-100">
                                          <span className="block text-[9px] font-black text-amber-800 uppercase">Alcance</span>
                                          <span className="font-bold text-slate-800">
                                            {m.alcance_presupuesto != null ? `${m.alcance_presupuesto}%` : '-'}
                                          </span>
                                        </div>
                                      </div>

                                      {m.kpi_observaciones && (
                                        <p className="text-[10px] text-slate-500 mt-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                          "{m.kpi_observaciones}"
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL PARA CARGAR / MODIFICAR INDICADORES MES A MES */}
      {modalKpiOpen && (() => {
        const currentKey = `${modalData.id_asesor}_${modalData.mes_numero}_${modalData.anio}`;
        const isExistingKpi = Boolean(kpisMap[currentKey] && (
          kpisMap[currentKey].avaluo != null ||
          kpisMap[currentKey].efectividad != null ||
          kpisMap[currentKey].alcance_presupuesto != null
        ));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl border border-slate-100 space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isExistingKpi ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}>
                    {isExistingKpi ? '✏️ Modo Modificación de Indicadores' : '➕ Nueva Carga de Indicadores'}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {isExistingKpi ? 'Modificar Indicadores del Asesor' : 'Cargar Indicadores del Asesor'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isExistingKpi 
                      ? 'Actualice los valores registrados para este periodo o elimine el registro si es necesario.'
                      : 'Registre los tres indicadores para el periodo de evaluación seleccionado.'}
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

              {isExistingKpi && !saveSuccessMsg && (
                <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 flex items-center gap-2">
                  <span>💡</span>
                  <span>Este periodo ya cuenta con indicadores registrados. Puede modificarlos directamente y presionar "Actualizar Indicadores".</span>
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
                      handleModalAdvisorOrPeriodChange(e.target.value, modalData.mes_numero, modalData.anio, modalData.mes_nombre);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    {advisors.map(adv => (
                      <option key={adv.id} value={adv.id}>{adv.nombre} ({adv.empresa})</option>
                    ))}
                  </select>
                </div>

                {/* Selector de Mes y Año */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      N° de Mes
                    </label>
                    <select
                      value={modalData.mes_numero}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10);
                        handleModalAdvisorOrPeriodChange(modalData.id_asesor, num, modalData.anio, MONTH_NAMES[Math.min(num - 1, 11)]);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                        <option key={n} value={n}>Mes {n}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mes Calendario
                    </label>
                    <select
                      value={modalData.mes_nombre}
                      onChange={(e) => {
                        handleModalAdvisorOrPeriodChange(modalData.id_asesor, modalData.mes_numero, modalData.anio, e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {MONTH_NAMES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Año
                    </label>
                    <select
                      value={modalData.anio}
                      onChange={(e) => {
                        const year = parseInt(e.target.value, 10);
                        handleModalAdvisorOrPeriodChange(modalData.id_asesor, modalData.mes_numero, year, modalData.mes_nombre);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {[2025, 2026, 2027].map(y => (
                        <option key={y} value={y}>{y}</option>
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
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    {isExistingKpi && (
                      <button
                        type="button"
                        disabled={deletingKpi || savingKpi}
                        onClick={handleDeleteKpiSubmit}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <span>🗑️</span>
                        <span>{deletingKpi ? 'Eliminando...' : 'Eliminar Registro'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalKpiOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingKpi || deletingKpi}
                      className={`px-6 py-2 rounded-xl text-xs font-black text-white shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 ${
                        isExistingKpi 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-amber-500 hover:bg-amber-600'
                      }`}
                    >
                      <span>{isExistingKpi ? '💾' : '➕'}</span>
                      <span>{savingKpi ? 'Guardando...' : (isExistingKpi ? 'Actualizar Indicadores' : 'Guardar Indicadores')}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
