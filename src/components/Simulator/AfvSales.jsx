import React from 'react';

const MOCK_PRODUCTOS = [
  { cod: '0101002', old: '7110502', desc: 'Receptáculo de pvc blanco con bornes automáticos Bticino', exist: '1.245', p1: '1,25', p2: '0,86', inv: 'UNI', emp: '12', cmin: '12', dscto: '13,00' },
  { cod: '0101005', old: '7110505', desc: 'Interruptor sencillo de pvc blanco Bticino', exist: '850', p1: '2,10', p2: '1,45', inv: 'UNI', emp: '10', cmin: '10', dscto: '0,00' },
  { cod: '0101010', old: '7110510', desc: 'Tomacorriente doble de pvc blanco Bticino', exist: '2.300', p1: '3,50', p2: '2,40', inv: 'UNI', emp: '10', cmin: '10', dscto: '5,00' },
  { cod: '0205001', old: '8110201', desc: 'Canilla flexible de acero inoxidable 1/2 x 1/2 40cm', exist: '450', p1: '4,80', p2: '3,30', inv: 'UNI', emp: '5', cmin: '5', dscto: '10,00' },
  { cod: '0205002', old: '8110202', desc: 'Canilla flexible de acero inoxidable 1/2 x 1/2 60cm', exist: '320', p1: '5,50', p2: '3,80', inv: 'UNI', emp: '5', cmin: '5', dscto: '10,00' },
];

export const AfvSales = ({
  theme,
  empresaSeleccionada,
  pantalla,
  setPantalla,
  grupoSeleccionado,
  setGrupoSeleccionado,
  mostrarComboGrupo,
  setMostrarComboGrupo,
  busquedaProducto,
  setBusquedaProducto,
  busquedaNombre,
  setBusquedaNombre,
  productoActivoIndex,
  setProductoActivoIndex,
  mostrarDatosBotonB,
  setMostrarDatosBotonB,
  mostrarBuscaNombre,
  setMostrarBuscaNombre,
  cantidadProducto,
  setCantidadProducto,
  nivelSeleccionado,
  setNivelSeleccionado,
  mostrarComboNivel,
  setMostrarComboNivel,
  mostrarObservaciones,
  setMostrarObservaciones,
  observacionTipo,
  setObservacionTipo,
  observacionTexto,
  setObservacionTexto,
  modalCierraGV1,
  setModalCierraGV1,
  modalCierraGV2,
  setModalCierraGV2,
  setAfvCalcPrecio,
  setAfvCalcNombre,
  setAfvDctoComercial,
  setAfvDctoFP,
  setMostrarAfvCalc
}) => {
  
  // Logic from Simulator.jsx
  const productosFiltrados = MOCK_PRODUCTOS.filter(p => 
    p.cod.includes(busquedaProducto) || p.desc.toLowerCase().includes(busquedaProducto.toLowerCase())
  );
  
  const productoActivo = productosFiltrados[productoActivoIndex] || productosFiltrados[0];

  return (
    <>
      {/* PANTALLA 9: CONSULTA DE PEDIDOS (023) */}
      {pantalla === 'consulta_pedidos' && (
        <div className="flex-1 bg-gray-100 mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">AFV</span>
              </div>
              <span className="text-[13px] font-normal font-sans">023 - Consulta de Pedidos - {empresaSeleccionada}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-2 bg-white overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-[#d3d3d3] py-2 px-2 flex-1 mr-2 border border-gray-300 text-ellipsis overflow-hidden">
                <span className="text-[13px] text-gray-800 font-sans whitespace-nowrap">FM IMPORT PARTS, C.A. - 2535</span>
              </div>
              <button onClick={() => setPantalla('menu')} title="Regresar al menú principal" className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">
                ← 
              </button>
            </div>

            <div className="flex-1 border border-gray-500 flex flex-col overflow-hidden bg-white mb-2">
              <div className="flex bg-[#a6a6a6] text-white font-bold text-[12px] p-2 font-sans outline outline-1 outline-gray-400">
                <div className="w-6 border-r border-gray-400 border-opacity-30 text-center">S</div>
                <div className="flex-1 border-r border-gray-400 border-opacity-30 pl-2">Pedido Origen</div>
                <div className="flex-1 pl-2 text-right pr-2">Pedido</div>
              </div>
              <div className="flex-1 overflow-y-auto font-sans">
                <div className="flex bg-[#00b0f0] text-black font-bold text-[13px] px-2 py-1.5 border-b border-gray-200 items-center">
                  <div className="w-6 text-center">A</div>
                  <div className="flex-1 pl-2">62115</div>
                  <div className="flex-1 text-right pr-2">62115</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 mb-1 mt-1">
              <button title="Anular el pedido seleccionado" className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] py-1.5 px-3 text-[13px] font-sans shadow-sm active:bg-[#d4d4d4]">
                Anular
              </button>
              <button onClick={() => setPantalla('escritorio')} title="Volver al escritorio y crear un nuevo pedido" className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] py-1.5 px-3 text-[13px] font-sans shadow-sm active:bg-[#d4d4d4]">
                Nuevo
              </button>
              <button title="Enviar por correo electrónico el resumen del pedido al cliente" className="bg-[#e6e6e6] text-gray-500 border border-[#a6a6a6] py-1.5 px-3 text-[10px] font-sans shadow-sm">
                Enviar Email
              </button>
            </div>

            <div className="text-[7.5px] text-gray-500 font-sans mt-1">
              © Copyright Wholesale World Information Systems LTD, 2014
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 10: CLIENTES (088 / 112) */}
      {pantalla === 'clientes' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">f</span>
              </div>
              <span className="text-[13px] font-normal font-sans">112 - Clientes - {empresaSeleccionada}</span>
            </div>
            <button onClick={() => setPantalla('menu')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm">
              ← 
            </button>
          </div>
          <div className="flex-1 flex flex-col p-2 bg-gray-100 overflow-hidden">
            <div className="flex items-center mb-2 gap-2">
              <span className="text-[12px] font-bold text-gray-700 font-sans">Ruta:</span>
              <select className="flex-1 bg-transparent text-[12px] font-sans text-gray-600 outline-none">
                <option>--- Todas ---</option>
              </select>
            </div>
            <div className="flex items-center mb-2 gap-2">
              <span className="text-[12px] font-bold text-gray-700 font-sans">Cliente:</span>
              <input type="text" placeholder="Buscar..." className="bg-white border border-gray-400 text-black font-sans text-[13px] px-2 py-1 flex-1 outline-none" />
              <button className="bg-[#e6e6e6] text-[#333] border border-gray-400 px-2 py-1 text-[11px] font-bold shadow-sm">B.</button>
            </div>
            <div className="flex-1 border border-gray-400 bg-white overflow-y-auto">
              <div onClick={() => setPantalla('gestion_ventas')} className="bg-[#00b0f0] text-black font-bold text-[11px] px-2 py-2 font-sans border-b border-gray-300 cursor-pointer">
                {empresaSeleccionada === 'Beval' ? 'AGRO FERRETERIA CAMPANARIO C.A. - 2503001' : 'GRUPO ISO HOME, C.A - 2531318'}
              </div>
              {[
                'EMPACADURAS INDUSTRIALES DEL CI - 2531976',
                'GRUPO TRIFERCA, C.A - 2580160',
                'HIPER HIERRO, C.A - 2531151',
                'INVERSIONES C MIGUEL A C.A - 2525053'
              ].map((cli, i) => (
                <div key={i} onClick={() => setPantalla('gestion_ventas')} className="bg-white text-black font-bold text-[10px] px-2 py-2.5 font-sans border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                  {cli}
                </div>
              ))}
            </div>

            {/* Botón teclado dummy */}
            <div className="mt-2 text-center bg-gray-300 py-2 text-[10px] text-gray-600 font-sans rounded border border-gray-400 flex flex-wrap justify-center gap-1 opacity-70">
              {'ABCDEFGHIJKLM'.split('').map(letter => <span key={letter} className="w-5 h-6 bg-white flex items-center justify-center shadow-sm">{letter}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 11: GESTIÓN DE VENTAS (028) */}
      {pantalla === 'gestion_ventas' && (
        <div className="flex-1 bg-gray-100 mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">f</span>
              </div>
              <span className="text-[13px] font-normal font-sans">028 - Gestión de Ventas - {empresaSeleccionada}</span>
            </div>
            <span className="text-xl leading-none">⋮</span>
          </div>

          <div className="p-2 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-[#d3d3d3] py-2 px-2 flex-1 mr-2 border border-gray-300 text-ellipsis overflow-hidden">
                <span className="text-[12px] font-bold text-gray-800 font-sans whitespace-nowrap">{empresaSeleccionada === 'Beval' ? 'AGRO FERRETERIA CAMPANARIO C.A. - 2503001' : 'GRUPO ISO HOME, C.A - 2531318'}</span>
              </div>
              <button onClick={() => setPantalla('clientes')} title="Regresar a Clientes" className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">
                ← 
              </button>
            </div>

            <div className="mb-4">
              <span className="text-[11px] text-gray-700 font-sans">Código Cliente: {empresaSeleccionada === 'Beval' ? '2503001' : '2531976'}</span>
            </div>

            <div className="flex flex-col gap-3 items-center flex-1">
              <button onClick={() => setPantalla('detalle_pedido_nuevo')} className="bg-[#e6e6e6] text-black font-bold font-sans text-[12px] py-2 w-3/4 border border-gray-300 shadow-sm active:bg-[#d4d4d4]">
                NUEVO PEDIDO
              </button>
              <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[12px] py-2 w-3/4 border border-gray-300 shadow-sm active:bg-[#d4d4d4]">
                CONSULTAR PEDIDOS
              </button>
              <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[12px] py-2 w-3/4 border border-gray-300 shadow-sm active:bg-[#d4d4d4]">
                NUEVA COTIZACIÓN
              </button>
              <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[12px] py-2 w-3/4 border border-gray-300 shadow-sm active:bg-[#d4d4d4]">
                CONSULTAR COTIZACIONES
              </button>
            </div>

            <div className="border-t border-gray-300 pt-2 flex flex-col gap-1 pb-1">
              <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 font-sans">
                <span>Límite de Crédito:</span>
                <span>5.000,00</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 font-sans">
                <span>Crédito Disponible:</span>
                <span>5.000,00</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 font-sans">
                <span>A la Fecha:</span>
                <span>06-12-2025</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 font-sans">
                <span>Grupo cliente</span>
                <span>MAYOREOB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 12: DETALLE PEDIDO NUEVO (021) */}
      {pantalla === 'detalle_pedido_nuevo' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">f</span>
              </div>
              <span className="text-[13px] font-normal font-sans">021 - Detalle Pedido - {empresaSeleccionada}</span>
            </div>
            <span className="text-xl leading-none">⋮</span>
          </div>

          <div className="p-1 flex flex-col flex-1 bg-gray-100">
            <div className="flex items-center mb-1">
              <div className="bg-[#d3d3d3] py-1.5 px-2 flex-1 border border-gray-300 text-ellipsis overflow-hidden">
                <span className="text-[11px] font-bold text-gray-800 font-sans whitespace-nowrap">{empresaSeleccionada === 'Beval' ? 'AGRO FERRETERIA CAMPANARIO C.A. - 2503001..' : 'GRUPO ISO HOME, C.A - 2531318..'}</span>
              </div>
              <div className="flex gap-1 ml-1">
                <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[10px] px-2 py-0 border border-gray-400 shadow-sm active:bg-gray-300">FIN</button>
                <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[10px] px-2 py-0 border border-gray-400 shadow-sm active:bg-gray-300">X</button>
                <button onClick={() => setPantalla('gestion_ventas')} className="w-6 h-6 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[2px] border-[#999999] shadow-sm flex-shrink-0">
                  ← 
                </button>
              </div>
            </div>

            <div className="mb-1">
              <p className="text-[9px] text-gray-500 font-sans leading-tight">
                0101002 - Receptáculo de pvc blanco con bornes<br />
                automáticos Bticino - 7110502
              </p>
            </div>

            <div className="flex-1 border border-gray-400 bg-white flex flex-col">
              <div className="bg-[#a6a6a6] text-white font-bold text-[11px] text-center py-1 border-b border-gray-400">
                Producto
              </div>
              <div className="flex-1 bg-white"></div>
            </div>

            <div className="flex flex-col gap-1 mt-2 mb-2">
              <div className="flex items-center justify-end">
                <span className="text-[11px] font-bold text-gray-700 font-sans mr-2">Subtotal (USD):</span>
                <div className="bg-[#b3b3b3] w-32 h-5"></div>
              </div>
              <div className="flex items-center justify-end">
                <span className="text-[11px] font-bold text-gray-700 font-sans mr-2">Renglones:</span>
                <div className="bg-[#b3b3b3] w-32 h-5"></div>
              </div>
            </div>

            <div className="flex gap-1 justify-between py-1">
              <button className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">PROM.</button>
              <button onClick={() => setPantalla('productos_busqueda')} className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">BUSCAR</button>
              <button className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">OTROS</button>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 13: PRODUCTOS (034) */}
      {pantalla === 'productos_busqueda' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">f</span>
              </div>
              <span className="text-[13px] font-normal font-sans">034 - Productos - {empresaSeleccionada}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-gray-100 p-3 pt-6 relative">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[14px] font-bold text-gray-800 font-sans">Artículo</span>
              <button onClick={() => setPantalla('detalle_pedido_nuevo')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">
                ← 
              </button>
            </div>

            <div className="flex items-center mb-4">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans">Código:</span>
              <input type="text" className="flex-1 bg-transparent border-b border-gray-400 text-black font-sans text-[12px] px-1 outline-none font-bold" />
            </div>

            <div className="flex items-center mb-4">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans">Nombre:</span>
              <input type="text" className="flex-1 bg-transparent border-b border-gray-400 text-black font-sans text-[12px] px-1 outline-none font-bold" />
            </div>

            <div className="flex items-center mb-4">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans">Referencia:</span>
              <input type="text" className="flex-1 bg-transparent border-b border-gray-400 text-black font-sans text-[12px] px-1 outline-none font-bold" />
            </div>

            <div className="flex items-center mb-5 mt-2">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans">Marca:</span>
              <select className="flex-1 bg-transparent border-b border-gray-400 text-gray-700 font-sans text-[11px] px-1 outline-none appearance-none cursor-pointer">
                <option>--Seleccione--</option>
                <option>Marca 1</option>
              </select>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-gray-600 border-r-[4px] border-r-transparent ml-[-12px] pointer-events-none"></div>
            </div>

            <div className="flex items-center mb-5">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans">Categoría:</span>
              <select className="flex-1 bg-transparent border-b border-gray-400 text-gray-700 font-sans text-[11px] px-1 outline-none appearance-none cursor-pointer">
                <option>--Seleccione--</option>
                <option>Categoria 1</option>
              </select>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-gray-600 border-r-[4px] border-r-transparent ml-[-12px] pointer-events-none"></div>
            </div>

            <div className="flex items-center mb-5">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans">Sub-Categoría:</span>
              <select className="flex-1 bg-transparent border-b border-gray-400 text-gray-700 font-sans text-[11px] px-1 outline-none appearance-none cursor-pointer">
                <option>--Seleccione--</option>
                <option>Sub Cat 1</option>
              </select>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-gray-600 border-r-[4px] border-r-transparent ml-[-12px] pointer-events-none"></div>
            </div>

            <div className="flex items-center mb-6 relative">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans">Grupo:</span>
              <select value={grupoSeleccionado} onChange={(e) => setGrupoSeleccionado(e.target.value)} className={`flex-1 bg-transparent border-b border-gray-400 font-sans text-[11px] px-1 outline-none appearance-none cursor-pointer ${grupoSeleccionado === 'Todas' ? 'text-black font-bold' : 'text-gray-700'}`}>
                <option>--Seleccione--</option>
                <option>Todas</option>
              </select>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-gray-600 border-r-[4px] border-r-transparent ml-[-12px] pointer-events-none"></div>

              {/* Dropdown visual simulado */}
              {mostrarComboGrupo && (
                <div className="absolute left-[85px] top-5 bg-white border border-gray-400 shadow-lg z-50 w-[calc(100%-97px)] rounded-sm overflow-hidden">
                  <div className="px-2 py-2 text-[11px] text-gray-500 font-sans border-b border-gray-200 bg-gray-50">--Seleccione--</div>
                  <div onClick={() => { setGrupoSeleccionado('Todas'); setMostrarComboGrupo(false); }} className="px-2 py-2 text-[11px] text-black font-bold font-sans bg-[#00b0f0] cursor-pointer">Todas</div>
                </div>
              )}
            </div>

            <div className="border-t-[2px] border-gray-800 pt-3 flex justify-between gap-10 px-2 mt-auto pb-4">
              <button onClick={() => { setGrupoSeleccionado('--Seleccione--'); }} className="bg-[#e6e6e6] text-black font-sans font-bold text-[11px] py-1.5 flex-1 shadow-sm border border-[#a6a6a6] active:bg-[#d4d4d4]">
                Limpiar
              </button>
              <button onClick={() => setPantalla('resultados_busqueda')} className="bg-[#e6e6e6] text-black font-sans font-bold text-[11px] py-1.5 flex-1 shadow-sm border border-[#a6a6a6] active:bg-[#d4d4d4]">
                Buscar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 14: 080 - Resultados Búsqueda */}
      {pantalla === 'resultados_busqueda' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden font-sans">
          <div className="p-2 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <span className="text-xl font-black italic drop-shadow-md">f</span>
                </div>
              </div>
              <span className="text-[15px] font-normal tracking-wide">080 - Productos - {empresaSeleccionada}</span>
            </div>
            <span className="text-xl leading-none cursor-pointer px-2">⋮</span>
          </div>

          <div className="flex-1 flex flex-col bg-[#eeeeee] overflow-hidden">
            <div className="bg-[#f0f0f0] px-3 py-1.5 border-b border-gray-300 min-h-[32px] flex items-center">
              <span className="text-[12px] text-gray-600 font-bold truncate">
                {productoActivo ? productoActivo.desc : "Seleccione un producto"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white/50 border-b border-gray-300">
              <span className="text-[14px] font-bold text-gray-800">Buscar</span>
              <div className="flex-1 flex flex-col pt-1">
                <input
                  type="text"
                  value={busquedaProducto}
                  inputMode="numeric"
                  onChange={(e) => {
                    setBusquedaProducto(e.target.value);
                    setBusquedaNombre('');
                    setProductoActivoIndex(0);
                  }}
                  className="w-full bg-transparent text-black font-sans text-[14px] px-1 outline-none border-b border-gray-500 focus:border-blue-600"
                />
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => setMostrarDatosBotonB(true)}
                  className="bg-[#dadada] text-black border border-gray-400 px-3 py-0.5 text-[11px] font-bold shadow-sm active:bg-gray-400"
                >B.</button>
                <button className="bg-[#dadada] text-black border border-gray-400 px-3 py-0.5 text-[11px] font-bold shadow-sm">SUB</button>
                <button className="bg-[#dadada] text-black border border-gray-400 px-3 py-0.5 text-[11px] font-bold shadow-sm">ASOC.</button>
              </div>
            </div>

            <div className="m-2 border border-black bg-white flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                {productosFiltrados.map((prod, i) => (
                  <div
                    key={i}
                    onClick={() => setProductoActivoIndex(i)}
                    className={`flex items-center py-1.5 px-1.5 border-b border-gray-200 cursor-pointer ${i === productoActivoIndex ? 'bg-[#00a2e8] text-white' : 'bg-white text-black'}`}
                  >
                    <div className={`w-4 h-4 border border-black mr-2 flex items-center justify-center shrink-0 ${i === productoActivoIndex ? 'bg-[#00a2e8]' : 'bg-white'}`}>
                      {i === productoActivoIndex && <div className="w-2 h-2 bg-white"></div>}
                    </div>
                    <span className={`text-[12px] font-bold w-16 shrink-0 ${i === productoActivoIndex ? 'text-white' : 'text-gray-800'}`}>
                      {prod.cod}
                    </span>
                    <span className={`text-[12px] font-bold truncate flex-1 ${i === productoActivoIndex ? 'text-white' : 'text-black'}`}>
                      {prod.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#f0f0f0] p-3 border-t border-gray-400 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] italic text-gray-500 font-medium">P1</span>
                  <div
                    onClick={() => { setAfvCalcPrecio(productoActivo?.p1); setAfvCalcNombre('P1'); setAfvDctoComercial(productoActivo?.dscto !== '0,00' ? productoActivo.dscto : '0'); setAfvDctoFP(''); setMostrarAfvCalc(true); }}
                    className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-end px-2 text-[13px] font-bold text-gray-800 border border-gray-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] cursor-pointer active:bg-blue-200"
                  >
                    {productoActivo?.p1}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] italic text-gray-500 font-medium">P2</span>
                  <div
                    onClick={() => { setAfvCalcPrecio(productoActivo?.p2); setAfvCalcNombre('P2'); setAfvDctoComercial(productoActivo?.dscto !== '0,00' ? productoActivo.dscto : '0'); setAfvDctoFP(''); setMostrarAfvCalc(true); }}
                    className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-end px-2 text-[13px] font-bold text-gray-800 border border-gray-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] cursor-pointer active:bg-blue-200"
                  >
                    {productoActivo?.p2}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12">U. Inv.:</span>
                  <div className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-center text-[12px] font-bold border border-gray-400">
                    {productoActivo?.inv}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12">Emp. C.:</span>
                  <div className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-center text-[12px] font-bold border border-gray-400">
                    {productoActivo?.emp}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12">C. Min.:</span>
                  <div className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-center text-[12px] font-bold border border-gray-400">
                    {productoActivo?.cmin}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12">Dscto.:</span>
                  <div className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-center text-[12px] font-bold border border-gray-400">
                    {productoActivo?.dscto}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] w-12">Exist.</span>
                <div className="w-1/2 bg-[#c0c0c0] h-7 flex items-center justify-end px-2 text-[12px] font-bold border border-gray-400">
                  {productoActivo?.exist}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] w-12">Cant.:</span>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={cantidadProducto}
                    onChange={(e) => setCantidadProducto(e.target.value)}
                    className="flex-1 bg-white border-b border-gray-600 h-7 text-center text-[14px] outline-none focus:border-blue-600"
                  />
                  <button
                    onClick={() => setPantalla('detalle_pedido_con_producto')}
                    className="bg-[#dadada] text-black font-bold h-7 px-10 text-[12px] border border-gray-400 shadow-sm active:bg-gray-400 flex items-center justify-center"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute top-[85%] right-4">
              <button onClick={() => setPantalla('productos_busqueda')} className="w-8 h-8 bg-gray-400/80 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-500 border-2 border-white/50">
                ← 
              </button>
            </div>
          </div>

          {/* Modal: Buscar por Nombre */}
          {mostrarBuscaNombre && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="w-[280px] bg-white shadow-2xl flex flex-col overflow-hidden border border-gray-400">
                <div className="bg-[#00a2e8] px-2 py-1.5 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <span className="text-[7px] font-black text-gray-800 italic">f</span>
                    </div>
                    <span className="text-[12px] font-bold font-sans">080 - Buscar por Nombre</span>
                  </div>
                  <button onClick={() => setMostrarBuscaNombre(false)} className="text-white font-bold text-lg leading-none">✕</button>
                </div>
                <div className="p-3 flex flex-col gap-3">
                  <div>
                    <label className="text-[9px] text-gray-500 font-bold block mb-1 uppercase">Nombre o Código antiguo</label>
                    <input
                      autoFocus
                      type="text"
                      value={busquedaNombre}
                      onChange={(e) => setBusquedaNombre(e.target.value)}
                      className="w-full border-b-2 border-[#00a2e8] text-[13px] font-sans px-1 py-1 outline-none bg-transparent text-black"
                      placeholder="Ej: canilla flexible"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setBusquedaNombre(''); setMostrarBuscaNombre(false); }} className="bg-gray-200 text-gray-700 font-bold px-4 py-1 text-[11px] border border-gray-400">Limpiar</button>
                    <button onClick={() => setMostrarBuscaNombre(false)} className="bg-[#00a2e8] text-white font-bold px-4 py-1 text-[11px] border border-[#008cc9]">Buscar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Datos Botón B */}
          {mostrarDatosBotonB && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[60]" onClick={() => setMostrarDatosBotonB(false)}>
              <div className="relative w-[95%] h-[80%] flex items-center justify-center">
                <img src="datosbotonb.jpeg" alt="Datos Botón B" className="max-w-full max-h-full object-contain rounded shadow-2xl" />
                <button onClick={() => setMostrarDatosBotonB(false)} className="absolute top-0 right-0 translate-x-2 -translate-y-2 w-8 h-8 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-white font-bold text-lg">✕</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PANTALLA 15: Detalle Pedido CON producto */}
      {pantalla === 'detalle_pedido_con_producto' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">f</span>
              </div>
              <span className="text-[13px] font-normal text-black font-sans">021 - Detalle Pedido</span>
            </div>
            <span className="text-xl leading-none text-gray-700">⋮</span>
          </div>

          <div className="p-1 flex flex-col flex-1 bg-gray-100">
            <div className="flex items-center mb-1">
              <div className="bg-[#d3d3d3] py-1.5 px-2 flex-1 border border-gray-300 text-ellipsis overflow-hidden">
                <span className="text-[11px] font-bold text-gray-800 font-sans whitespace-nowrap">GRUPO ISO HOME, C.A - 2531318</span>
              </div>
              <div className="flex gap-1 ml-1">
                <button onClick={() => setPantalla('finalizar_pedido_gv')} className="bg-[#e6e6e6] text-black font-bold font-sans text-[10px] px-2 py-0 border border-gray-400 shadow-sm active:bg-gray-300">FIN</button>
                <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[10px] px-2 py-0 border border-gray-400 shadow-sm active:bg-gray-300">X</button>
                <button onClick={() => setPantalla('gestion_ventas')} className="w-6 h-6 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[2px] border-[#999999] shadow-sm flex-shrink-0">
                  ← 
                </button>
              </div>
            </div>

            <div className="mb-1">
              <p className="text-[9px] text-gray-500 font-sans leading-tight">
                0101002 - Receptáculo de pvc blanco con bornes<br />
                automáticos Bticino - 7110502
              </p>
            </div>

            <div className="flex-1 border border-gray-400 bg-white flex flex-col">
              <div className="bg-[#a6a6a6] text-white font-bold text-[11px] text-center py-1 border-b border-gray-400">
                Producto
              </div>
              <div className="bg-[#00b0f0] text-black text-[10px] font-sans p-1.5 border-b border-gray-300">
                <span className="font-bold">Receptáculo de pvc blanco con bornes automáticos Btic...</span>
                <span className="ml-2">x{cantidadProducto || '12'}</span>
              </div>
              <div className="flex-1 bg-white"></div>
            </div>

            <div className="flex flex-col gap-1 mt-2 mb-2">
              <div className="flex items-center justify-end">
                <span className="text-[11px] font-bold text-gray-700 font-sans mr-2">Subtotal (USD):</span>
                <div className="bg-[#b3b3b3] w-32 h-5 flex items-center justify-end pr-2">
                  <span className="text-[11px] font-bold text-black font-sans">10,34</span>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <span className="text-[11px] font-bold text-gray-700 font-sans mr-2">Renglones:</span>
                <div className="bg-[#b3b3b3] w-32 h-5 flex items-center justify-end pr-2">
                  <span className="text-[11px] font-bold text-black font-sans">1</span>
                </div>
              </div>
            </div>

            <div className="flex gap-1 justify-between py-1">
              <button className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">PROM.</button>
              <button onClick={() => setPantalla('resultados_busqueda')} className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">BUSCAR</button>
              <button className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">OTROS</button>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 16: Finalizar Pedido GV */}
      {pantalla === 'finalizar_pedido_gv' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">f</span>
              </div>
              <span className="text-[13px] font-normal text-black font-sans">016 - Finalizar Pedido</span>
            </div>
            <span className="text-xl leading-none text-gray-700">⋮</span>
          </div>

          <div className="flex-1 flex flex-col p-3 bg-gray-100 overflow-y-auto relative">
            <div className="flex items-center mb-2">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans">Pedido:</span>
              <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[12px] px-2 py-1 text-right font-bold">60063</div>
              <button onClick={() => setPantalla('detalle_pedido_con_producto')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm ml-2">
                ← 
              </button>
            </div>

            <div className="flex items-center mb-2">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans">Fecha:</span>
              <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[12px] px-2 py-1 text-right">09-02-2026</div>
            </div>

            <div className="flex items-center mb-2 relative">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans">Nivel:</span>
              <div onClick={() => setMostrarComboNivel(!mostrarComboNivel)} className="flex-1 bg-white border border-gray-400 text-black font-sans text-[12px] px-2 py-1 flex justify-between items-center cursor-pointer">
                <span className="font-bold">{nivelSeleccionado}</span>
                <span className="text-gray-500">▼</span>
              </div>
              {mostrarComboNivel && (
                <div className="absolute left-[85px] top-7 bg-white border border-gray-400 shadow-lg z-50 w-[calc(100%-85px)] rounded-sm overflow-hidden">
                  <div onClick={() => { setNivelSeleccionado('MAYOREOD'); setMostrarComboNivel(false); }} className={`px-2 py-2 text-[11px] font-sans border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${nivelSeleccionado === 'MAYOREOD' ? 'bg-[#00b0f0] font-bold' : ''}`}>MAYOREOD</div>
                  <div onClick={() => { setNivelSeleccionado('MAYOREOB'); setMostrarComboNivel(false); }} className={`px-2 py-2 text-[11px] font-sans cursor-pointer hover:bg-gray-100 ${nivelSeleccionado === 'MAYOREOB' ? 'bg-[#00b0f0] font-bold' : ''}`}>MAYOREOB</div>
                </div>
              )}
            </div>

            <div className="flex items-center mb-2">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans">Condición:</span>
              <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[11px] px-2 py-1">
                {nivelSeleccionado === 'MAYOREOB' ? '10% hasta 7 dias' : ''}
              </div>
            </div>

            <div className="flex items-center mb-2">
              <span className="w-[85px] text-[11px] text-gray-700 font-sans font-bold">Total (USD):</span>
              <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[14px] px-2 py-1 text-right font-bold">52,10</div>
              <button onClick={() => setModalCierraGV1(true)} className="bg-[#e6e6e6] text-black font-bold font-sans text-[11px] px-3 py-1 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4] ml-2">FIN</button>
            </div>

            <div className="flex items-center">
              <span className="text-[11px] font-bold text-gray-700 font-sans">Observaciones:</span>
              <span className="flex-1 text-[10px] font-bold text-blue-700 font-sans ml-2 truncate">{observacionTipo}</span>
              <button onClick={() => setMostrarObservaciones(true)} className="w-6 h-6 bg-[#e6e6e6] border border-gray-400 text-black font-bold text-[14px] leading-none flex items-center justify-center">+</button>
            </div>

            {/* Modal Observaciones */}
            {mostrarObservaciones && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-2xl w-[280px] overflow-hidden border border-gray-300">
                  <div className="bg-[#00b0f0] px-3 py-2 flex items-center justify-between">
                    <span className="text-[12px] font-bold text-black font-sans">016 - Toma de Observación</span>
                    <button onClick={() => setMostrarObservaciones(false)} className="text-black font-bold text-lg leading-none">✕</button>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <select
                      value={observacionTipo}
                      onChange={(e) => { setObservacionTipo(e.target.value); setObservacionTexto(e.target.value); }}
                      className="w-full border border-gray-400 text-[12px] font-bold px-2 py-1.5 outline-none bg-white text-black"
                    >
                      <option value="">-- Seleccione --</option>
                      <option value="Negociación Especial">Negociación Especial</option>
                      <option value="Pedido Urgente">Pedido Urgente</option>
                    </select>
                    <textarea value={observacionTexto} onChange={(e) => setObservacionTexto(e.target.value)} rows={3} className="w-full border border-gray-400 text-[11px] px-2 py-1 outline-none resize-none font-sans" />
                    <div className="flex gap-2 justify-end pt-1">
                      <button onClick={() => setMostrarObservaciones(false)} className="bg-[#00b0f0] text-black font-bold px-4 py-1.5 border border-[#0092c8] text-[11px]">Aceptar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Confirmación 1 */}
          {modalCierraGV1 && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 mt-8">
              <div className="bg-white rounded-lg shadow-2xl w-[260px] overflow-hidden">
                <div className="p-4">
                  <p className="text-[12px] text-gray-700 font-sans leading-relaxed">
                    El monto de su pedido es 52,10 $ con un descuento de 0% en el monto del flete. ¿Desea añadir más articulos al pedido?
                  </p>
                </div>
                <div className="flex border-t border-gray-200">
                  <button onClick={() => { setModalCierraGV1(false); setModalCierraGV2(true); }} className="flex-1 py-3 text-[13px] font-bold text-gray-600 font-sans hover:bg-gray-100 border-r border-gray-200">No</button>
                  <button onClick={() => setModalCierraGV1(false)} className="flex-1 py-3 text-[13px] font-bold text-gray-600 font-sans hover:bg-gray-100">Si</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Confirmación 2 */}
          {modalCierraGV2 && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 mt-8">
              <div className="bg-white rounded-lg shadow-2xl w-[260px] overflow-hidden">
                <div className="p-4">
                  <p className="text-[12px] text-gray-700 font-sans leading-relaxed">¿Desea guardar y cerrar el pedido 60063?</p>
                </div>
                <div className="flex border-t border-gray-200">
                  <button onClick={() => setModalCierraGV2(false)} className="flex-1 py-3 text-[13px] font-bold text-gray-600 font-sans hover:bg-gray-100 border-r border-gray-200">No</button>
                  <button onClick={() => { setModalCierraGV2(false); setPantalla('pedido_cerrado_gv'); }} className="flex-1 py-3 text-[13px] font-bold text-gray-600 font-sans hover:bg-gray-100">Si</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PANTALLA: Pedido Cerrado Confirmation */}
      {pantalla === 'pedido_cerrado_gv' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
            <span className="text-[13px] font-normal font-sans">016 - Finalizar Pedido</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mb-4 shadow-lg">✓</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">¡Pedido Guardado!</h2>
            <p className="text-sm text-gray-600 mb-6">El pedido número <span className="font-bold">60063</span> ha sido registrado exitosamente.</p>
            <button onClick={() => setPantalla('menu')} className="bg-[#00b0f0] text-black font-bold px-8 py-3 rounded shadow-md active:bg-[#0092c8] transition-colors">Volver al Menú</button>
          </div>
        </div>
      )}
    </>
  );
};
