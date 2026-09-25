import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ModalReporteSeguimiento from '../components/Reportes/ModalReporteSeguimiento';
import ModalPlantillasDrive from '../components/Reportes/ModalPlantillasDrive';

// Helper para parsear fechas de ingreso (DD/MM/YYYY o YYYY-MM-DD) o created_at
const parseDateForSort = (as) => {
  if (as.fecha_ingreso && typeof as.fecha_ingreso === 'string') {
    const trimmed = as.fecha_ingreso.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        let y = parseInt(parts[2], 10);
        if (y < 100) y += 2000;
        const date = new Date(y, m, d);
        if (!isNaN(date.getTime())) return date.getTime();
      }
    } else if (trimmed.includes('-')) {
      const dashParts = trimmed.split('-');
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

// Helper para obtener primer nombre
const getPrimerNombre = (as) => {
  const str = (as.name || as.full_name || '').trim();
  if (str.includes(',')) {
    return str.split(',')[1]?.trim() || str;
  }
  const parts = str.split(/\s+/);
  return parts[0] || str;
};

// Helper para obtener apellido
const getApellido = (as) => {
  const str = (as.name || as.full_name || '').trim();
  if (str.includes(',')) {
    return str.split(',')[0].trim();
  }
  const parts = str.split(/\s+/);
  if (parts.length > 1) {
    return parts.slice(1).join(' ');
  }
  return str;
};

// Helper para calcular estatus del asesor (Completado, En Curso, Sin Itinerario)
const getAsesorStatus = (as, submodulos = []) => {
  if (!as) return { label: 'Sin Itinerario', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  const itins = as.itinerarios_induccion || [];
  if (itins.length === 0) {
    return { label: 'Sin Itinerario', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  }

  const maxIntento = Math.max(...itins.map(i => i.intento || 1));
  const activeItin = itins.filter(i => i.intento === maxIntento);
  const deptoIds = activeItin.map(i => i.id_departamento);

  const subIds = (submodulos || [])
    .filter(sm => deptoIds.includes(sm.id_departamento))
    .map(sm => sm.id);

  if (subIds.length === 0) {
    return { label: 'En Curso', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  }

  const notasActivas = (as.notas_por_submodulo || []).filter(n => n.intento === maxIntento && subIds.includes(n.id_submodulo));

  if (notasActivas.length >= subIds.length) {
    return { label: 'Completado', color: 'bg-red-50 text-red-700 border-red-200' };
  }

  return { label: 'En Curso', color: 'bg-blue-50 text-blue-700 border-blue-200' };
};

// Configuración de Identidad y Colores Corporativos de Empresas:
// - Sillaca: Magenta (#c40062)
// - Febeca: Azul (#005596)
// - Beval: Verde Manzana (#6a9d2d)
export const getCompanyConfig = (empresaRaw) => {
  const emp = (empresaRaw || '').trim();
  const lower = emp.toLowerCase();

  if (lower.includes('sillaca')) {
    return {
      name: 'Sillaca',
      color: '#c40062', // Magenta
      bgHex: '#fdf2f8',
      borderHex: '#fbcfe8',
      textHex: '#9d004e',
      dotColor: '#c40062'
    };
  }
  if (lower.includes('febeca')) {
    return {
      name: 'Febeca',
      color: '#005596', // Azul
      bgHex: '#eff6ff',
      borderHex: '#bfdbfe',
      textHex: '#004377',
      dotColor: '#005596'
    };
  }
  if (lower.includes('beval')) {
    return {
      name: 'Beval',
      color: '#6a9d2d', // Verde Manzana
      bgHex: '#f7fee7',
      borderHex: '#d9f99d',
      textHex: '#3f6717',
      dotColor: '#6a9d2d'
    };
  }
  if (lower.includes('cofersa')) {
    return {
      name: 'Cofersa',
      color: '#0078ae',
      bgHex: '#f0f9ff',
      borderHex: '#bae6fd',
      textHex: '#02628e',
      dotColor: '#0078ae'
    };
  }
  if (lower.includes('mundial')) {
    return {
      name: 'Mundial de Partes',
      color: '#74a431',
      bgHex: '#f0fdf4',
      borderHex: '#bbf7d0',
      textHex: '#355e14',
      dotColor: '#74a431'
    };
  }

  return {
    name: emp || 'Independiente',
    color: '#64748b',
    bgHex: '#f8fafc',
    borderHex: '#e2e8f0',
    textHex: '#475569',
    dotColor: '#64748b'
  };
};

export const BuildingIcon = ({ color = "currentColor", className = "w-3.5 h-3.5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    style={{ color }}
  >
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9zM7 13h2v2H7v-2zm4 0h2v2h-2v-2z" clipRule="evenodd" />
  </svg>
);

export default function DashboardSeguimiento() {
  const { profile } = useAuth();
  const portalUser = JSON.parse(localStorage.getItem('portalUser') || 'null');
  const activeRole = profile?.role || (portalUser?.rol === 'admin' ? 'Administrador' : (portalUser?.rol === 'evaluador' ? 'Desarrollo' : portalUser?.rol));
  const activeName = profile?.full_name || portalUser?.nombre || 'Usuario';
  const navigate = useNavigate();

  const [evaluations, setEvaluations] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportAdvisor, setReportAdvisor] = useState(null);
  const [actionPlansByAdvisor, setActionPlansByAdvisor] = useState({});
  const [showDriveTemplates, setShowDriveTemplates] = useState(false);

  // Estados para búsqueda, filtro y ordenamiento
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterCompany, setFilterCompany] = useState('todas');
  const [sortKey, setSortKey] = useState('fecha');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    fetchEvaluations();
  }, [profile]);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      // 1. Obtener todos los usuarios con rol Asesor
      const { data: advisorsData, error: advisorsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Asesor')
        .order('full_name', { ascending: true });

      if (advisorsError) throw advisorsError;

      // 2. Obtener datos de portal_afv para calcular itinerarios y empresas
      const { data: afvUsers } = await supabase
        .schema('portal_afv')
        .from('usuarios')
        .select('*, itinerarios_induccion(*), notas_por_submodulo(*)');

      const { data: submodulosData } = await supabase
        .schema('portal_afv')
        .from('submodulos_finales')
        .select('*');

      // Enriquecer asesores con empresa, fecha de ingreso y estatus de inducción
      const enrichedAdvisors = (advisorsData || []).map(p => {
        const afv = (afvUsers || []).find(a => 
          (a.usuario && a.usuario.toLowerCase().trim() === p.email.toLowerCase().trim()) ||
          (a.correo && a.correo.toLowerCase().trim() === p.email.toLowerCase().trim()) ||
          (a.correo_corporativo && a.correo_corporativo.toLowerCase().trim() === p.email.toLowerCase().trim()) ||
          (a.nombre && a.nombre.toLowerCase().trim() === (p.full_name || '').toLowerCase().trim())
        );
        const st = getAsesorStatus(afv, submodulosData || []);
        return {
          ...p,
          empresa: afv?.empresa || 'Independiente',
          status: st,
          fecha_ingreso: afv?.fecha_ingreso || p.created_at
        };
      });

      setAdvisors(enrichedAdvisors);

      // 3. Obtener evaluaciones
      let query = supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeRole === 'Asesor') {
        query = query.eq('advisor_id', profile?.id || portalUser?.id);
      }

      const { data: evalData, error: evalError } = await query;
      if (evalError) throw evalError;
      setEvaluations(evalData || []);

      // 4. Obtener conteo de compromisos/planes de acción por asesor
      try {
        const { data: plansData } = await supabase
          .from('planes_accion_asesor')
          .select('advisor_id, estado');
        if (plansData) {
          const plansMap = {};
          plansData.forEach(p => {
            if (!plansMap[p.advisor_id]) plansMap[p.advisor_id] = { total: 0, cumplidos: 0, pendientes: 0 };
            plansMap[p.advisor_id].total++;
            if (p.estado === 'Cumplido') plansMap[p.advisor_id].cumplidos++;
            else plansMap[p.advisor_id].pendientes++;
          });
          setActionPlansByAdvisor(plansMap);
        }
      } catch (e) {
        // Silencioso si no hay tabla o datos
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group evaluations by Advisor and then by Month
  const getGroupedData = () => {
    const grouped = {};
    
    // Primero, poblamos la lista con todos los Asesores base enriquecidos
    advisors.forEach(adv => {
      grouped[adv.id] = { 
        id: adv.id, 
        name: adv.full_name || adv.email, 
        email: adv.email,
        empresa: adv.empresa || 'Independiente',
        status: adv.status,
        fecha_ingreso: adv.fecha_ingreso,
        created_at: adv.created_at,
        months: {} 
      };
    });

    // Luego insertamos las evaluaciones
    evaluations.forEach(ev => {
      if (!grouped[ev.advisor_id]) {
        grouped[ev.advisor_id] = { 
          id: ev.advisor_id, 
          name: ev.advisor_name, 
          empresa: 'Independiente',
          status: { label: 'Sin Itinerario', color: 'bg-slate-100 text-slate-600 border-slate-200' },
          months: {} 
        };
      }
      if (!grouped[ev.advisor_id].months[ev.month_number]) {
        grouped[ev.advisor_id].months[ev.month_number] = { depts: [], totalScore: 0 };
      }
      
      grouped[ev.advisor_id].months[ev.month_number].depts.push(ev);
      grouped[ev.advisor_id].months[ev.month_number].totalScore += Number(ev.average_score);
    });

    // Calcular promedios globales
    Object.values(grouped).forEach(advisor => {
      Object.keys(advisor.months).forEach(month => {
        const monthData = advisor.months[month];
        monthData.globalAvg = (monthData.totalScore / monthData.depts.length).toFixed(2);
      });
    });

    // Si es Asesor, filtrar para que solo se vea él mismo
    let finalArray = Object.values(grouped);
    if (activeRole === 'Asesor') {
      const currentId = profile?.id || portalUser?.id;
      finalArray = finalArray.filter(a => a.id === currentId);
    }

    return finalArray;
  };

  const groupedData = getGroupedData();

  // Filtrado y Ordenamiento idéntico al de la Consola de Evaluaciones
  const filteredAndSortedData = groupedData
    .filter(adv => {
      if (filterCompany === 'todas') return true;
      const compConf = getCompanyConfig(adv.empresa);
      return compConf.name.toLowerCase().includes(filterCompany.toLowerCase());
    })
    .filter(adv => {
      const s = adv.status?.label;
      if (filterStatus === 'completado') return s === 'Completado';
      if (filterStatus === 'en_curso') return s === 'En Curso';
      if (filterStatus === 'sin_itinerario') return s === 'Sin Itinerario';
      return true;
    })
    .filter(adv => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return (
        (adv.name || '').toLowerCase().includes(term) ||
        (adv.empresa || '').toLowerCase().includes(term) ||
        (adv.email || '').toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortKey === 'nombre') {
        const valA = getPrimerNombre(a).toLowerCase();
        const valB = getPrimerNombre(b).toLowerCase();
        const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'apellido') {
        const valA = getApellido(a).toLowerCase();
        const valB = getApellido(b).toLowerCase();
        const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'empresa') {
        const valA = (a.empresa || 'Independiente').toLowerCase();
        const valB = (b.empresa || 'Independiente').toLowerCase();
        const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
        if (cmp !== 0) return sortDir === 'asc' ? cmp : -cmp;
        return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'es', { sensitivity: 'base' });
      }
      // Default: 'fecha'
      const dateA = parseDateForSort(a);
      const dateB = parseDateForSort(b);
      return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const getSemaforoColor = (score) => {
    if (score >= 4.0) return 'bg-gray-900 text-white';
    if (score >= 3.0) return 'bg-gray-400 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Panel de control</p>
            <h1 className="text-xl font-bold text-gray-900">Dashboard de Seguimiento</h1>
            <p className="text-sm text-gray-500 mt-1">{activeName} — {activeRole}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDriveTemplates(true)}
              className="text-xs text-gray-600 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
            >
              Plantillas Drive / BDF
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-xs text-gray-600 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
            >
              ← Volver al Portal
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 py-12 text-center">Cargando datos de asesores y evaluaciones...</p>
        ) : (
          <div className="border border-gray-200 rounded overflow-hidden">

            {/* Encabezado */}
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Semáforo de Asesores</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Promedio global mensualizado (Negro: ≥ 4.0 | Gris: 3.0–3.9 | Claro: &lt; 3.0)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { key: 'febeca', name: 'Febeca' },
                  { key: 'sillaca', name: 'Sillaca' },
                  { key: 'beval', name: 'Beval' }
                ].map(item => {
                  const count = groupedData.filter(a => getCompanyConfig(a.empresa).name.toLowerCase() === item.key).length;
                  const isSelected = filterCompany.toLowerCase() === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFilterCompany(prev => prev === item.key ? 'todas' : item.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs border transition-colors cursor-pointer ${isSelected ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                    >
                      <span>{item.name}:</span>
                      <span className="font-bold">{count}</span>
                    </button>
                  );
                })}
                <span className="text-xs text-gray-400 border border-gray-200 px-3 py-1 rounded">
                  Total: {groupedData.length} | Mostrando: {filteredAndSortedData.length}
                </span>
              </div>
            </div>

            {/* Barra de filtros */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="w-full md:w-72 relative">
                <input
                  type="text"
                  placeholder="Buscar asesor, empresa o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded text-xs outline-none focus:border-gray-400 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
                <select
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700 outline-none focus:border-gray-400 cursor-pointer"
                >
                  <option value="todas">Todas las empresas</option>
                  <option value="febeca">Febeca</option>
                  <option value="sillaca">Sillaca</option>
                  <option value="beval">Beval</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700 outline-none focus:border-gray-400 cursor-pointer"
                >
                  <option value="todos">Todos los estados ({groupedData.length})</option>
                  <option value="completado">Completados ({groupedData.filter(a => a.status?.label === 'Completado').length})</option>
                  <option value="en_curso">En curso ({groupedData.filter(a => a.status?.label === 'En Curso').length})</option>
                  <option value="sin_itinerario">Sin itinerario ({groupedData.filter(a => a.status?.label === 'Sin Itinerario').length})</option>
                </select>

                <select
                  value={sortKey}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    setSortKey(newKey);
                    setSortDir(newKey === 'fecha' ? 'desc' : 'asc');
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700 outline-none focus:border-gray-400 cursor-pointer"
                >
                  <option value="fecha">Orden: Fecha</option>
                  <option value="nombre">Orden: Nombre</option>
                  <option value="apellido">Orden: Apellido</option>
                  <option value="empresa">Orden: Empresa</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
                </button>

                {(searchTerm || filterStatus !== 'todos' || filterCompany !== 'todas') && (
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(''); setFilterStatus('todos'); setFilterCompany('todas'); }}
                    className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[260px]">
                      Asesor
                    </th>
                    <th className="py-3 px-5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[130px]">
                      Estado
                    </th>
                    {[1, 2, 3, 4, 5, 6].map(m => (
                      <th key={m} className={`py-3 px-5 text-center text-xs font-semibold uppercase tracking-wider ${m===3||m===6 ? 'text-gray-900 bg-gray-100' : 'text-gray-500'}`}>
                        Mes {m} {m===3 ? '(Trim.)' : m===6 ? '(Sem.)' : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAndSortedData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-400">
                        <p className="text-sm">No se encontraron asesores con los filtros seleccionados.</p>
                        {(searchTerm || filterStatus !== 'todos' || filterCompany !== 'todas') && (
                          <button
                            onClick={() => { setSearchTerm(''); setFilterStatus('todos'); setFilterCompany('todas'); }}
                            className="mt-2 text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2"
                          >
                            Restablecer filtros
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedData.map((advisor) => (
                      <tr key={advisor.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-5 min-w-[260px]">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-gray-900 truncate" title={advisor.name}>
                              {advisor.name}
                            </span>
                            <div className="flex items-center gap-2 text-xs flex-wrap">
                              <span className="text-gray-500 border border-gray-200 px-2 py-0.5 rounded">
                                {advisor.empresa || 'Independiente'}
                              </span>
                              {advisor.fecha_ingreso && (
                                <span className="text-gray-400">{advisor.fecha_ingreso}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <button
                                onClick={() => setReportAdvisor(advisor)}
                                className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2 transition-colors"
                              >
                                Ficha / Plan PDF →
                              </button>
                              {actionPlansByAdvisor[advisor.id]?.total > 0 && (
                                <span className="text-xs text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">
                                  {actionPlansByAdvisor[advisor.id].pendientes} pend.
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-5 text-right whitespace-nowrap min-w-[130px]">
                          <div className="flex justify-end">
                            {(() => {
                              const label = advisor.status?.label || 'Sin Itinerario';
                              let cls = 'bg-gray-100 text-gray-500 border-gray-200';
                              if (label === 'Completado') cls = 'bg-gray-900 text-white border-gray-900';
                              if (label === 'En Curso') cls = 'bg-gray-300 text-gray-700 border-gray-300';
                              return (
                                <span className={`inline-flex items-center justify-center min-w-[100px] px-3 py-1 rounded text-xs font-semibold border ${cls}`}>
                                  {label}
                                </span>
                              );
                            })()}
                          </div>
                        </td>

                        {[1, 2, 3, 4, 5, 6].map(m => {
                          const mData = advisor.months[m];
                          return (
                            <td key={m} className={`py-3 px-5 text-center ${m===3||m===6 ? 'bg-gray-50' : ''}`}>
                              {mData ? (
                                <div className="flex flex-col items-center gap-1">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${getSemaforoColor(mData.globalAvg)}`}>
                                    {mData.globalAvg}
                                  </div>
                                  <span className="text-xs text-gray-400">{mData.depts.length}/6</span>
                                </div>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                              {activeRole !== 'Asesor' && (
                                <Link
                                  to={`/evaluacion/${advisor.id}/mes/${m}`}
                                  className="mt-1.5 inline-block text-xs text-gray-400 hover:text-gray-900 underline underline-offset-2 transition-colors"
                                >
                                  Evaluar
                                </Link>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leyenda */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border border-gray-200 rounded p-3 flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-900 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Sólido / Referente (4.0–5.0)</p>
              <p className="text-xs text-gray-500 mt-0.5">Cumple con consistencia sin supervisión.</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded p-3 flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Competente (3.0–3.9)</p>
              <p className="text-xs text-gray-500 mt-0.5">Estándar mínimo aceptable.</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded p-3 flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-200 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">No cumple (1.0–2.9)</p>
              <p className="text-xs text-gray-500 mt-0.5">Requiere refuerzo. Errores frecuentes.</p>
            </div>
          </div>
        </div>

        {/* Modals */}
        {reportAdvisor && (
          <ModalReporteSeguimiento
            advisor={reportAdvisor}
            onClose={() => setReportAdvisor(null)}
            evaluatorName={activeName}
          />
        )}
        {showDriveTemplates && (
          <ModalPlantillasDrive
            onClose={() => setShowDriveTemplates(false)}
          />
        )}
      </div>
    </div>
  );
}

