import React from 'react';

export const AfvTax = ({ 
  theme, 
  empresaSeleccionada, 
  setPantalla, 
  pantalla,
  retencionesLista,
  retencionTipo,
  setRetencionTipo,
  retencionMetodo,
  setRetencionMetodo,
  mostrarComboRetencion,
  setMostrarComboRetencion,
  retencionFecha,
  setRetencionFecha,
  mostrarCalendario,
  setMostrarCalendario,
  retencionPeriodo,
  setRetencionPeriodo,
  retencionSecuencia,
  setRetencionSecuencia,
  retencionMonto,
  setRetencionMonto,
  setRetencionesLista
}) => {
  return (
    <>
      {/* PANTALLA: LISTA DE RETENCIONES */}
      {pantalla === 'retencion_list' && (
        <div className="flex-1 bg-[#f0f0f0] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="bg-[#00b0f0] p-2.5 flex items-center text-black border-b border-[#0092c8] shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden p-0.5">
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center text-white font-serif italic text-xs border border-blue-300">f</div>
              </div>
              <span className="text-[14px] text-black font-sans tracking-tight">061 - Retenciones</span>
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-[#f0f0f0]">
            <div className="flex items-center justify-between bg-[#f0f0f0] px-2 py-2 mb-1">
              <div className="bg-[#b3b3b3] px-3 py-1 flex-1 shadow-sm border border-gray-400 flex items-center h-8 text-[14px]">
                <span className="bg-[#b3b3b3] text-black font-sans font-medium uppercase truncate">
                  {empresaSeleccionada === 'Beval' ? 'AGRO FERRETERIA CAMPANARIO C.A. - 2503001' : 'GRUPO ISO HOME, C.A - 2531318'}
                </span>
              </div>
              <button onClick={() => setPantalla('recibo_menu')} className="w-8 h-8 ml-2 bg-[#e6e6e6] rounded-full flex items-center justify-center border border-gray-400">←</button>
            </div>
            <div className="flex-1 flex flex-col gap-1 pb-2">
              <div className="flex-1 mx-2 border border-black bg-white flex flex-col font-sans overflow-hidden">
                <div className="flex bg-[#a6a6a6] text-white font-bold text-[12px] border-b border-gray-400">
                  <div className="w-12 text-center py-1.5">E</div>
                  <div className="flex-1 text-center py-1.5">Comprobante</div>
                  <div className="flex-1 text-center py-1.5">Monto (USD)</div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {retencionesLista.map((ret, idx) => (
                    <div key={idx} className="flex border-b border-gray-200 text-[12px] text-black">
                      <div className="w-12 py-2 border-r border-gray-200"></div>
                      <div className="flex-1 text-center py-2 border-r border-gray-200">{ret.comprobante}</div>
                      <div className="flex-1 text-center py-2">{ret.monto}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 p-2 justify-center">
                <button className="bg-[#e6e6e6] px-6 py-1.5 border border-gray-400 text-sm">ANULAR</button>
                <button onClick={() => { setRetencionTipo(''); setPantalla('retencion_form'); }} className="bg-[#e6e6e6] px-6 py-1.5 border border-gray-400 text-sm">NUEVO</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA: FORMULARIO DE RETENCION */}
      {pantalla === 'retencion_form' && (
        <div className="flex-1 bg-[#f0f0f0] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8] shadow-sm">
             <span className="text-[14px] font-bold">097 - Retenciones</span>
             <button onClick={() => setPantalla('retencion_list')} className="text-xl">✕</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {!retencionTipo ? (
              <div className="space-y-4">
                <div className="bg-white border border-gray-300 rounded">
                  <div className="bg-gray-100 p-2 font-bold text-sm">Facturas Pendientes</div>
                  <div className="p-2 space-y-1">
                    {['06980316', '06980336', '06982446'].map(n => (
                      <div key={n} className="flex justify-between text-xs p-1 border-b">
                         <span>FAC {n}</span>
                         <span>Monto: 8,87</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                   <label className="block text-[11px] font-bold text-gray-500 mb-1">MÉTODO DE CARGA</label>
                   <div onClick={() => setMostrarComboRetencion(!mostrarComboRetencion)} className="bg-white border border-gray-400 p-2 text-sm cursor-pointer flex justify-between">
                      <span>{retencionMetodo}</span>
                      <span>▼</span>
                   </div>
                   {mostrarComboRetencion && (
                     <div className="bg-white border border-gray-400 shadow-xl mt-1">
                        {['Cargar Manual', 'Cargar Imagen', 'Cargar PDF'].map(m => (
                          <div key={m} onClick={() => { setRetencionMetodo(m); setMostrarComboRetencion(false); }} className="p-2 text-sm hover:bg-blue-100">{m}</div>
                        ))}
                     </div>
                   )}
                </div>
                <button onClick={() => { if(retencionMetodo === 'Cargar Manual') setRetencionTipo('Manual'); }} className="w-full bg-blue-600 text-white py-2 rounded font-bold">VALIDAR</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-200 p-2 rounded text-[12px]">
                   <p>RIF: J312193697</p>
                   <p>ALTAMIRA FERRE-INDUSTRIAL</p>
                </div>
                <div className="space-y-3">
                   <div>
                      <label className="text-[11px] font-bold">FECHA COMPROBANTE</label>
                      <input type="text" value={retencionFecha} readOnly onClick={() => setMostrarCalendario(true)} className="w-full border-b-2 border-gray-300 py-1 font-bold outline-none" />
                      {mostrarCalendario && (
                        <div className="bg-white border border-gray-400 p-2 absolute z-50">
                           <div onClick={() => { setRetencionFecha('27-03-2026'); setMostrarCalendario(false); }} className="p-2 bg-blue-500 text-white rounded cursor-pointer text-center">27 Mar</div>
                        </div>
                      )}
                   </div>
                   <div className="flex gap-2">
                      <div className="flex-1">
                         <label className="text-[11px] font-bold">PERIODO</label>
                         <input type="text" value={retencionPeriodo} onChange={(e) => setRetencionPeriodo(e.target.value)} className="w-full border-b-2 border-gray-300 py-1 font-bold outline-none" />
                      </div>
                      <div className="flex-1">
                         <label className="text-[11px] font-bold">SECUENCIA</label>
                         <input type="text" value={retencionSecuencia} onChange={(e) => setRetencionSecuencia(e.target.value)} className="w-full border-b-2 border-gray-300 py-1 font-bold outline-none" />
                      </div>
                   </div>
                   <div>
                      <label className="text-[11px] font-bold">MONTO RETENIDO</label>
                      <input type="text" value={retencionMonto} onChange={(e) => setRetencionMonto(e.target.value)} className="w-full border-b-2 border-gray-300 py-1 font-bold outline-none" />
                   </div>
                </div>
                <button onClick={() => {
                  setRetencionesLista([...retencionesLista, { comprobante: retencionPeriodo + retencionSecuencia, fecha: retencionFecha, monto: retencionMonto }]);
                  setPantalla('retencion_list');
                  setRetencionTipo('');
                }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg">FINALIZAR</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
