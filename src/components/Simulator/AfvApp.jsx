import React from 'react';

export const AfvConfig = ({ theme, empresaSeleccionada, setPantalla, nivelSeleccionado, setNivelSeleccionado, mostrarComboNivel, setMostrarComboNivel, nombreVendedor, procesoActivo, setProcesoActivo }) => {
  return (
    <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col overflow-hidden">
      <div className="p-3 flex items-center justify-between shadow-md border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
        <span className="font-bold text-[11px] uppercase tracking-wider">016a - Configuración - {empresaSeleccionada}</span>
        <span className="text-xl leading-none">⋮</span>
      </div>

      <div className="p-5 flex-1 space-y-5">
        <div className="border-b-2 border-[#009bba] pb-1">
          <label className="text-[10px] font-bold text-[#009bba]">Nombre del Vendedor</label>
          <p className="text-xs font-semibold text-gray-700 mt-1">{nombreVendedor || 'Alberto Gonzalez'}</p>
        </div>

        {/* Solo mostrar el selector si estamos en modo 'todos' */}
        {import.meta.env.VITE_APP_MODE === 'todos' && (
          <div className="border-b-2 border-[#009bba] pb-1">
            <label className="text-[10px] font-bold text-[#009bba]">Proceso Seleccionado</label>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => setProcesoActivo('ventas')}
                className={`flex-1 py-1.5 rounded text-[9px] font-bold transition-colors ${procesoActivo === 'ventas' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                VENTAS
              </button>
              <button 
                onClick={() => setProcesoActivo('cobranza')}
                className={`flex-1 py-1.5 rounded text-[9px] font-bold transition-colors ${procesoActivo === 'cobranza' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                COBRANZA
              </button>
            </div>
          </div>
        )}

        <div className="border-b-2 border-gray-300 pb-1 relative">
          <label className="text-[10px] font-bold text-gray-500">Zona de Venta</label>
          <select className="w-full bg-transparent text-xs font-semibold text-gray-800 outline-none appearance-none mt-1">
            <option>Z072 - ZONA 72</option>
          </select>
          <div className="absolute right-0 bottom-2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-500"></div>
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <div>
            <p className="text-[9px] font-bold text-[#009bba] mb-1">Fecha:</p>
            <p className="text-[10px] font-semibold text-gray-600">22-02-2026</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#009bba] mb-1">Hora:</p>
            <p className="text-[10px] font-semibold text-gray-600">08:30 AM</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex gap-4 bg-white border-t border-gray-100">
        <button onClick={() => setPantalla('menu')} className="flex-1 bg-blue-600 py-3 rounded text-[12px] font-bold text-white shadow-md active:bg-blue-700">INICIAR SIMULACIÓN DE VENTAS</button>
      </div>
    </div>
  );
};

export const AfvMenu = ({ 
    theme, 
    empresaSeleccionada, 
    setPantalla, 
    mostrarSubmenu, 
    setMostrarSubmenu,
    runDemoCatalogo,
    runDemoGestionVentas,
    runDemoCobranzaBs,
    runDemoCobranza,
    runDemoRetencion,
    wrapDemo,
    procesoActivo
}) => {
  const todasLasOpciones = [
    { label: 'PEDIDOS DEL CATÁLOGO', action: () => setPantalla('pedidos_catalogo'), demoFn: runDemoCatalogo, tipo: 'ventas' },
    { label: 'GESTIÓN DE VENTAS', action: () => setPantalla('clientes'), demoFn: runDemoGestionVentas, tipo: 'ventas' },
    { label: 'COBRANZA EN BS', action: () => setPantalla('recibo_cliente'), demoFn: runDemoCobranzaBs, tipo: 'cobranza' },
    { label: 'COBRANZA EN DÓLARES', action: () => setPantalla('recibo_cliente'), demoFn: runDemoCobranza, tipo: 'cobranza' },
    { label: 'RETENCIONES DE IVA', action: () => setPantalla('retencion_list'), demoFn: runDemoRetencion, tipo: 'cobranza' }
  ];

  const opcionesFiltradas = procesoActivo === 'todos' 
    ? todasLasOpciones 
    : todasLasOpciones.filter(op => op.tipo === procesoActivo);

  const tituloMenu = procesoActivo === 'cobranza' ? '073 - Cobranza menú' : '073 - Ventas menú';

  return (
    <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
      <div className="p-3 flex items-center justify-between shadow-md border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
        <div className="flex items-center gap-2">
          <button onClick={() => setPantalla('config')} className="text-lg leading-none">← </button>
          <span className="font-bold text-[11px] uppercase tracking-wider">{tituloMenu} - {empresaSeleccionada}</span>
        </div>
        <span onClick={() => setMostrarSubmenu(!mostrarSubmenu)} className="text-xl leading-none cursor-pointer">⋮</span>
      </div>

      {mostrarSubmenu && (
        <div className="absolute right-2 top-12 bg-white shadow-2xl rounded border border-gray-200 z-50 w-48 overflow-hidden">
          {(import.meta.env.VITE_APP_MODE === 'todos' || import.meta.env.VITE_APP_MODE === 'ventas') && (
            <button onClick={() => { setMostrarSubmenu(false); setPantalla('menu'); }} className="w-full text-left px-4 py-3 text-[13px] font-semibold text-gray-700 hover:bg-gray-100 border-b border-gray-100">Ventas</button>
          )}
          {(import.meta.env.VITE_APP_MODE === 'todos' || import.meta.env.VITE_APP_MODE === 'cobranza') && (
            <button onClick={() => { setMostrarSubmenu(false); setPantalla('recibo_cliente'); }} className="w-full text-left px-4 py-3 text-[13px] font-semibold text-gray-700 hover:bg-gray-100">Cobranza</button>
          )}
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1 overflow-y-auto bg-gray-50">
        {opcionesFiltradas.map(opcion => (
          <div key={opcion.label} className="flex gap-2 w-full">
            <button
              onClick={opcion.action}
              className="flex-1 bg-[#ccc] py-3.5 rounded text-[11px] font-bold text-gray-800 shadow-sm active:bg-gray-400"
            >
              {opcion.label}
            </button>
            {opcion.demoFn && (
              <button
                onClick={wrapDemo(opcion.demoFn)}
                className="bg-red-600 text-white font-bold text-[10px] px-2 rounded shadow-sm hover:bg-red-500 active:bg-red-700 transition-colors flex items-center justify-center shrink-0 w-10"
              >
                Run
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
