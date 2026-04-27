import React from 'react';

export const AfvCollections = ({ 
  theme, 
  empresaSeleccionada, 
  setPantalla, 
  pantalla,
  formaPago,
  setFormaPago,
  mostrarFormaPagoCombo,
  setMostrarFormaPagoCombo,
  mostrarModalRecibo,
  setMostrarModalRecibo,
  mostrarSoporte,
  setMostrarSoporte,
  mostrarLupa,
  setMostrarLupa
}) => {
  return (
    <>
      {/* PANTALLA: RECIBO CLIENTE */}
      {pantalla === 'recibo_cliente' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">f</span>
              </div>
              <span className="text-[13px] font-normal font-sans">080 - Recibo Cliente - {empresaSeleccionada}</span>
            </div>
            <button onClick={() => setPantalla('menu')} className="text-xl leading-none">←</button>
          </div>
          
          <div className="flex-1 flex flex-col p-2 bg-gray-100 overflow-hidden">
             <div className="bg-[#d3d3d3] py-2 px-2 mb-2 border border-gray-300">
                <span className="text-[12px] font-bold text-gray-800 font-sans">FM IMPORT PARTS, C.A. - 2535</span>
             </div>
             
             <div className="flex-1 border border-gray-400 bg-white overflow-hidden flex flex-col">
                <div className="bg-[#a6a6a6] text-white font-bold text-[11px] grid grid-cols-4 py-1 text-center">
                   <div className="border-r border-gray-300">Doc</div>
                   <div className="border-r border-gray-300">Número</div>
                   <div className="border-r border-gray-300">Saldo</div>
                   <div>Abono</div>
                </div>
                <div className="flex-1">
                   <div className="grid grid-cols-4 text-[11px] font-bold text-black border-b border-gray-200 py-2 px-1 bg-[#00b0f0]">
                      <div>FAC</div>
                      <div>102553</div>
                      <div className="text-right">452.20</div>
                      <div className="text-right">452.20</div>
                   </div>
                </div>
             </div>

             <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
                   <span>Total Abono (USD):</span>
                   <div className="w-32 bg-[#b3b3b3] text-right px-2">452.20</div>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
                   <span>Diferencia (USD):</span>
                   <div className="w-32 bg-[#b3b3b3] text-right px-2">0.00</div>
                </div>
             </div>

             <div className="mt-4 flex gap-2">
                <button onClick={() => setPantalla('formas_pago_recibo')} className="flex-1 bg-[#e6e6e6] py-2 text-[12px] font-bold border border-gray-400 shadow-sm">FORMAS PAGO</button>
                <button onClick={() => setMostrarModalRecibo(true)} className="flex-1 bg-[#e6e6e6] py-2 text-[12px] font-bold border border-gray-400 shadow-sm">FINALIZAR</button>
             </div>
          </div>

          {mostrarModalRecibo && (
            <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
               <div className="bg-[#f0f0f0] w-full rounded shadow-2xl overflow-hidden">
                  <div className="p-3 border-b-2 border-blue-500 text-blue-500 font-bold">Confirmación</div>
                  <div className="p-4 text-sm text-gray-800">¿Desea guardar y cerrar el recibo?</div>
                  <div className="flex border-t border-gray-300">
                     <button onClick={() => setMostrarModalRecibo(false)} className="flex-1 py-3 hover:bg-gray-200 border-r border-gray-300">No</button>
                     <button onClick={() => { setMostrarModalRecibo(false); setPantalla('menu'); }} className="flex-1 py-3 hover:bg-gray-200">Si</button>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}

      {/* PANTALLA: FORMAS PAGO RECIBO */}
      {pantalla === 'formas_pago_recibo' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
            <span className="text-[13px] font-bold">Formas de Pago</span>
            <button onClick={() => setPantalla('recibo_cliente')} className="text-xl leading-none">←</button>
          </div>
          <div className="flex-1 p-4 bg-gray-50">
             <div className="space-y-3">
                <button onClick={() => setPantalla('deposito_bancario')} className="w-full bg-white p-4 rounded-xl shadow-md border border-gray-200 flex justify-between items-center">
                   <span className="font-bold text-gray-700">Depósito / Transferencia</span>
                   <span className="text-blue-500">→</span>
                </button>
                <button className="w-full bg-white p-4 rounded-xl shadow-md border border-gray-200 flex justify-between items-center opacity-60">
                   <span className="font-bold text-gray-700">Efectivo</span>
                   <span className="text-gray-400">→</span>
                </button>
             </div>
          </div>
        </div>
      )}

      {/* PANTALLA: DEPOSITO BANCARIO */}
      {pantalla === 'deposito_bancario' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
             <span className="text-[13px] font-bold">Depósito Bancario</span>
             <button onClick={() => setPantalla('formas_pago_recibo')} className="text-xl leading-none">←</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
             <div className="space-y-4">
                <div>
                   <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase">Banco</label>
                   <select className="w-full border-b-2 border-gray-300 py-1 outline-none text-sm font-bold">
                      <option>BANCO MERCANTIL</option>
                      <option>BANCO PROVINCIAL</option>
                   </select>
                </div>
                <div>
                   <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase">Referencia</label>
                   <input type="text" className="w-full border-b-2 border-gray-300 py-1 outline-none text-sm font-bold" defaultValue="00125488" />
                </div>
                <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase">Monto</label>
                      <input type="text" className="w-full border-b-2 border-gray-300 py-1 outline-none text-sm font-bold" defaultValue="452.20" />
                   </div>
                   <button onClick={() => setMostrarSoporte(true)} className="bg-blue-600 text-white px-4 py-1 rounded text-[10px] font-bold shadow-lg flex flex-col items-center justify-center">
                      <span>VER</span>
                      <span>SOPORTE</span>
                   </button>
                </div>
                <button onClick={() => setPantalla('recibo_cliente')} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg mt-6">ACEPTAR PAGO</button>
             </div>
          </div>
        </div>
      )}
      {/* PANTALLA: RECIBO MENU */}
      {pantalla === 'recibo_menu' && (
        <div className="flex-1 bg-[#f0f0f0] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8] shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-gray-800">f</span>
              </div>
              <span className="text-[13px] font-bold text-black font-sans uppercase">044 - Menú Cobranza</span>
            </div>
            <div className="text-[14px] font-bold">⋮</div>
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between bg-[#c0c0c0] px-3 py-1.5 shadow-inner">
              <span className="text-[12px] font-bold text-gray-800 font-sans truncate">{empresaSeleccionada === 'Beval' ? 'AGRO FERRETERIA CAMPANARIO C.A.' : 'GRUPO ISO HOME, C.A'}</span>
              <button onClick={() => setPantalla('recibo_cliente')} className="w-6 h-6 bg-[#f0f0f0] rounded-full flex items-center justify-center border-2 border-gray-400">←</button>
            </div>
            <div className="flex-1 flex flex-col items-center pt-8 gap-3.5 px-6">
              <button className="w-full bg-[#e6e6e6] text-black font-bold py-1.5 border border-white shadow-sm">ESTADO DE CUENTA</button>
              <button className="w-full bg-[#e6e6e6] text-black font-bold py-1.5 border border-white shadow-sm">ANÁLISIS DE DEUDORES</button>
              <button onClick={() => setPantalla('retencion_list')} className="w-full bg-[#e6e6e6] text-black font-bold py-1.5 border border-white shadow-sm">RETENCIONES DE IVA</button>
              <button onClick={() => setPantalla('recibo_index')} className="w-full bg-[#e6e6e6] text-black font-bold py-1.5 border border-white shadow-sm">RECIBOS DE COBRO</button>
            </div>
            <div className="mt-auto pb-2 text-center text-[8px] text-gray-500">© 2014 Wholesale World</div>
          </div>
        </div>
      )}

      {/* PANTALLA: RECIBO INDEX (Simulated for flow) */}
      {pantalla === 'recibo_index' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
           <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <span className="text-sm font-bold">045 - Recibos de Cobro</span>
              <button onClick={() => setPantalla('recibo_menu')} className="text-xl">←</button>
           </div>
           <div className="flex-1 p-4 flex flex-col gap-4">
              <button onClick={() => setPantalla('recibo_cliente')} className="bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg">NUEVO RECIBO</button>
              <div className="flex-1 border border-gray-300 rounded bg-gray-50 p-2 text-center text-gray-400 italic text-sm">
                 No hay recibos pendientes de envío
              </div>
           </div>
        </div>
      )}
    </>
  );
};
