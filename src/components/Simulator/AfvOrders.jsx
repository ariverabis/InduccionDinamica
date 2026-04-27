import React from 'react';

export const AfvOrders = ({ 
  theme, 
  empresaSeleccionada, 
  setPantalla, 
  pantalla,
  mostrarModalOtorgar,
  setMostrarModalOtorgar,
  nivelSeleccionado,
  setNivelSeleccionado,
  mostrarComboNivel,
  setMostrarComboNivel
}) => {
  return (
    <>
      {/* PANTALLA 5: PEDIDOS DEL CATÁLOGO (118) */}
      {pantalla === 'pedidos_catalogo' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">AFV</span>
              </div>
              <span className="text-[13px] font-normal font-sans">118 - Pedidos del Catálogo - {empresaSeleccionada}</span>
            </div>
            <span className="text-xl leading-none">⋮</span>
          </div>

          <div className="flex-1 flex flex-col p-2 bg-white overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-[#d3d3d3] py-2 px-2 flex-1 mr-2 border border-gray-300">
                <span className="text-[13px] text-gray-800 font-sans">FM IMPORT PARTS, C.A. - 2535</span>
              </div>
              <button onClick={() => setPantalla('menu')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">←</button>
            </div>

            <div className="flex-1 border border-gray-500 flex flex-col overflow-hidden bg-white mb-2">
              <div className="grid grid-cols-3 bg-[#a6a6a6] text-white font-bold text-[12px] p-2 font-sans outline outline-1 outline-gray-400">
                <div className="border-r border-gray-400 border-opacity-30">Cliente</div>
                <div className="border-r border-gray-400 border-opacity-30 pl-2">Pedido</div>
                <div className="pl-2">Fecha</div>
              </div>
              <div className="flex-1 overflow-y-auto font-sans">
                <div className="grid grid-cols-3 bg-[#00b0f0] text-black font-bold text-[13px] px-2 py-1.5 border-b border-gray-200">
                  <div>2535249</div>
                  <div className="pl-2">1000059</div>
                  <div className="pl-2 relative -left-1">06-09-20</div>
                </div>
                {[
                  ['2531963', '1000023', '05-09-20'],
                  ['0182000', '1000016', '05-09-20'],
                  ['2535111', '4', '04-09-20']
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 bg-white text-black font-bold text-[13px] px-2 py-1.5 border-b border-gray-200">
                    <div>{row[0]}</div>
                    <div className="pl-2">{row[1]}</div>
                    <div className="pl-2 relative -left-1">{row[2]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-2 mb-1 mt-1 px-4">
              <button className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] py-1.5 px-3 text-[13px] font-sans flex-1 shadow-sm active:bg-[#d4d4d4]">Descartar</button>
              <button onClick={() => setPantalla('detalles_pedido')} className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] py-1.5 px-3 text-[13px] font-sans flex-1 shadow-sm active:bg-[#d4d4d4]">Ver Detalles</button>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 6: DETALLES DEL PEDIDO (119) */}
      {pantalla === 'detalles_pedido' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">AFV</span>
              </div>
              <span className="text-[13px] font-normal font-sans">119 - Detalle Pedido Catálogo - {empresaSeleccionada}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col p-2 bg-white overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-[#d3d3d3] py-2 px-2 flex-1 mr-2 border border-gray-300 overflow-hidden whitespace-nowrap text-ellipsis">
                <span className="text-[13px] text-gray-800 font-sans block truncate">2535249 - FM IMPORT PARTS, </span>
              </div>
              <button onClick={() => setPantalla('pedidos_catalogo')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">←</button>
            </div>
            <div className="flex-1 border border-gray-500 flex flex-col overflow-hidden bg-white mb-2">
              <div className="flex bg-[#a6a6a6] text-white font-bold text-[12px] p-2 font-sans outline outline-1 outline-gray-400">
                <div className="flex-1 border-r border-gray-400 border-opacity-30">Producto</div>
                <div className="w-12 pl-2 text-center">Can</div>
              </div>
              <div className="flex-1 overflow-y-auto font-sans">
                <div className="flex bg-[#00b0f0] text-black font-bold text-[10px] px-2 py-2 border-b border-gray-200">
                  <div className="flex-1 truncate pr-2">EXTENSION PROFESIONAL ST 2</div>
                  <div className="w-12 text-center">1.0</div>
                </div>
                {[
                  ['CINTA DE EMBALAJE TRANSPA', '6.0'],
                  ['CINTA DE EMBALAJE MARRON', '6.0']
                ].map((row, i) => (
                  <div key={i} className="flex bg-white text-black font-bold text-[10px] px-2 py-2 border-b border-gray-200">
                    <div className="flex-1 truncate pr-2">{row[0]}</div>
                    <div className="w-12 text-center">{row[1]}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mb-1 mt-1">
              <button onClick={() => setPantalla('promociones_asociativas')} className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] py-1.5 px-6 text-[13px] font-sans shadow-sm active:bg-[#d4d4d4]">Crear Cotización</button>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 7: PROMOCIONES ASOCIATIVAS (107) */}
      {pantalla === 'promociones_asociativas' && (
        <div className="flex-1 bg-gray-500 mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">AFV</span>
              </div>
              <span className="text-[13px] font-normal font-sans">107 - Promociones Asociativas - {empresaSeleccionada}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col relative">
            <div className="p-3">
              <p className="text-[14px] font-bold text-black font-sans mb-1">ARRIGO 36pzas 7% NACIONAL</p>
              <div className="border border-gray-400 mt-4">
                <div className="flex bg-[#808080] text-[#cccccc] font-bold text-[13px] p-2 border-b border-gray-500">
                  <div className="flex-1 text-center">Marca</div>
                  <div className="flex-1 text-center">Cant. P.</div>
                </div>
                <div className="flex bg-[#00b0f0] text-black font-bold text-[13px] p-2">
                  <div className="flex-1 text-center">ARRIGO 36P</div>
                  <div className="flex-1 text-center">36,00</div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-500 border-t border-gray-600">
              <button onClick={() => setMostrarModalOtorgar(true)} className="w-full bg-[#808080] text-black py-2 text-[13px] font-sans border border-gray-600 shadow-sm active:bg-gray-400">Otorgar</button>
            </div>
            {mostrarModalOtorgar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 pb-20 z-10">
                <div className="bg-[#f0f0f0] w-full rounded shadow-2xl overflow-hidden">
                  <div className="border-b-2 border-[#00b0f0] p-3 text-[#00b0f0] font-sans">Confirmación</div>
                  <div className="p-4 border-b border-gray-300 text-gray-800 text-[14px]">¿Desea otorgar 7 porciento de descuento?</div>
                  <div className="flex bg-[#f9f9f9]">
                    <button onClick={() => setMostrarModalOtorgar(false)} className="flex-1 py-3 text-[14px] border-r border-gray-300 active:bg-gray-200">No</button>
                    <button onClick={() => { setMostrarModalOtorgar(false); setPantalla('finalizar_pedido'); }} className="flex-1 py-3 text-[14px] active:bg-gray-200">Si</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANTALLA 8: FINALIZAR PEDIDO (016) */}
      {pantalla === 'finalizar_pedido' && (
        <div className="flex-1 bg-[#b3b3b3] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">AFV</span>
              </div>
              <span className="text-[13px] font-normal font-sans">016 - Finalizar Pedido - {empresaSeleccionada}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="flex items-center mb-2">
              <span className="w-[85px] text-[11px] text-gray-700">Pedido:</span>
              <div className="flex-1 bg-[#999999] text-black text-right pr-2 py-0.5 text-[13px]">62115</div>
              <button onClick={() => setPantalla('promociones_asociativas')} className="ml-2 w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white border-[3px] border-[#8a8a8a]">←</button>
            </div>
            <div className="flex items-center mb-2">
              <span className="w-[85px] text-[11px] text-gray-700">Fecha:</span>
              <div className="flex-1 bg-[#999999] text-black text-right pr-2 py-0.5 text-[13px] mr-9">14-09-2024</div>
            </div>
            <div className="flex items-center mb-2 border-b border-gray-400 pb-1 relative">
              <span className="w-[85px] text-[11px] text-gray-700">Nivel:</span>
              <div className="flex-1 flex justify-between items-center text-[12px] text-black cursor-pointer mr-9" onClick={() => setMostrarComboNivel(!mostrarComboNivel)}>
                <span>{nivelSeleccionado}</span>
                <div className="w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-gray-600"></div>
              </div>
              {mostrarComboNivel && (
                <div className="absolute top-8 left-0 right-0 bg-white border border-gray-300 shadow-xl z-50">
                  {['MAYOREOB', 'MAYOREOD'].map(nivel => (
                    <div key={nivel} className="p-3 border-b border-gray-100 active:bg-blue-100 text-[12px] text-black" onClick={() => { setNivelSeleccionado(nivel); setMostrarComboNivel(false); }}>{nivel}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
