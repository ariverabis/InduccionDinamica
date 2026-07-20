import React, { useState } from 'react';

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
  setRetencionesLista,
  facturasSeleccionadas,
  setFacturasSeleccionadas,
  montosEditables,
  setMontosEditables
}) => {
  const facturasDisponibles = [
    { id: '06980316', monto: 8.87 },
    { id: '06980336', monto: 63.87 },
    { id: '06982446', monto: 1.79 },
    { id: '06982447', monto: 2.84 },
    { id: '06982589', monto: 1.99 },
    { id: '06984423', monto: 4.41 },
    { id: '06985798', monto: 22.31 },
    { id: '06987571', monto: 2.97 },
    { id: '06987584', monto: 0.65 },
    { id: '06989077', monto: 9.27 },
    { id: '06990475', monto: 6.05 }
  ];

  const handleMontoChange = (id, nuevoMonto) => {
    setMontosEditables(prev => ({ ...prev, [id]: nuevoMonto }));
  };

  const getMontoActual = (f) => {
    if (montosEditables[f.id] !== undefined) {
      let val = String(montosEditables[f.id]).replace(',', '.');
      let num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    }
    return f.monto;
  };

  const getMontoStr = (f) => {
    return montosEditables[f.id] !== undefined ? montosEditables[f.id] : f.monto.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setFacturasSeleccionadas(facturasDisponibles.map(f => f.id));
    } else {
      setFacturasSeleccionadas([]);
    }
  };

  const handleSelectFactura = (id) => {
    setFacturasSeleccionadas(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const totalUSD = facturasDisponibles.filter(f => facturasSeleccionadas.includes(f.id)).reduce((sum, f) => sum + getMontoActual(f), 0);
  const totalVES = (totalUSD * 46.28).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Simulated rate

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
              <div className="flex flex-col h-full bg-white">
                {/* ENCABEZADO TIPO ret1.jpeg */}
                <div className="p-2 space-y-3 border-b border-gray-300">
                   {/* Fila 1 */}
                   <div className="flex items-center gap-2">
                      <label className="text-[14px] text-gray-500 w-[70px]">RIF:</label>
                      <div className="flex-1 bg-[#c0c0c0] px-2 py-1 text-[16px] font-bold text-black border-b border-gray-400">J312193697</div>
                      <button onClick={() => {
                        setRetencionesLista([...retencionesLista, { comprobante: retencionPeriodo + retencionSecuencia, fecha: retencionFecha, monto: totalUSD.toFixed(2) }]);
                        setPantalla('retencion_list');
                        setRetencionTipo('');
                      }} className="bg-[#e0e0e0] px-3 py-1 text-[12px] font-bold border border-gray-300 rounded">FIN</button>
                      <button onClick={() => setRetencionTipo('')} className="bg-[#c0c0c0] w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center font-bold text-white shadow-inner">←</button>
                   </div>
                   {/* Fila 2 */}
                   <div className="flex items-center gap-2">
                      <label className="text-[14px] text-gray-500 w-[90px]">Razón Social:</label>
                      <div className="flex-1 bg-[#c0c0c0] px-2 py-1 text-[16px] text-black border-b border-gray-400 truncate">ALTAMIRA FERRE-INDUSTRIAL -</div>
                   </div>
                   {/* Fila 3 */}
                   <div className="flex items-center gap-2">
                      <label className="text-[14px] text-gray-500 w-[90px]">Fecha Comp:</label>
                      <input type="date" value={retencionFecha} onChange={(e) => setRetencionFecha(e.target.value)} className="flex-1 bg-transparent border-b border-black py-1 text-[16px] font-bold outline-none text-black" />
                   </div>
                   {/* Fila 4 */}
                   <div className="flex items-center gap-2">
                      <label className="text-[14px] text-gray-500 w-[90px]">Comprobante:</label>
                      <input type="text" value={retencionPeriodo} onChange={(e) => setRetencionPeriodo(e.target.value)} className="w-[100px] bg-[#c0c0c0] px-2 py-1 text-[16px] font-bold text-black border-b border-gray-400 outline-none" placeholder="Período" />
                      <input type="text" value={retencionSecuencia} onChange={(e) => setRetencionSecuencia(e.target.value)} className="flex-1 bg-transparent border-b-2 border-blue-600 px-2 py-1 text-[16px] font-bold outline-none text-black" placeholder="Secuencia" />
                   </div>
                </div>

                {/* TABLA DE FACTURAS */}
                <div className="flex-1 flex flex-col min-h-0 bg-white">
                   <div className="flex bg-[#a0a0a0] text-white text-[12px] font-bold border-b-2 border-gray-400 mt-2 mx-1">
                      <div className="w-[40px] py-1 border-r border-gray-300"></div>
                      <div className="w-[50px] text-center py-1 border-r border-gray-300">Tipo</div>
                      <div className="flex-1 text-center py-1 border-r border-gray-300">No. Fiscal</div>
                      <div className="w-[90px] text-center py-1">Monto (USD)</div>
                   </div>
                   <div className="flex-1 overflow-y-auto mx-1 border-x border-b border-gray-300">
                      {facturasDisponibles.map((f, idx) => {
                         const isSelected = facturasSeleccionadas.includes(f.id);
                         return (
                           <div key={f.id} onClick={() => handleSelectFactura(f.id)} className={`flex items-center text-[13px] border-b border-gray-200 cursor-pointer ${isSelected ? 'bg-[#00b0f0] text-white' : 'text-black'}`}>
                              <div className="w-[40px] flex justify-center py-2 border-r border-gray-200">
                                 <input type="checkbox" checked={isSelected} onChange={() => {}} className="w-4 h-4 cursor-pointer" />
                              </div>
                              <div className="w-[50px] font-bold text-center py-2 border-r border-gray-200">FAC</div>
                              <div className="flex-1 font-bold text-center py-2 border-r border-gray-200">{f.id}</div>
                              <div className="w-[90px] font-bold text-right pr-2 py-1 flex items-center justify-end">
                                {isSelected ? (
                                  <input 
                                    type="text" 
                                    value={getMontoStr(f)} 
                                    onChange={(e) => handleMontoChange(f.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full bg-white text-black text-right border border-gray-400 px-1 py-1 rounded outline-none"
                                  />
                                ) : (
                                  f.monto.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                                )}
                              </div>
                           </div>
                         );
                      })}
                   </div>
                </div>

                {/* FOOTER */}
                <div className="p-2 space-y-2 border-t border-gray-300">
                   <div className="flex items-center gap-2">
                      <input type="checkbox" id="selectAll" checked={facturasSeleccionadas.length === facturasDisponibles.length && facturasDisponibles.length > 0} onChange={handleSelectAll} className="w-4 h-4" />
                      <label htmlFor="selectAll" className="text-[14px] text-gray-700">Seleccionar todo</label>
                   </div>
                   <div className="flex items-center gap-2 mt-2">
                      <label className="text-[14px] text-gray-500 w-[90px]">Monto VES:</label>
                      <div className="flex-1 bg-[#c0c0c0] px-2 py-2 text-[18px] font-bold text-black border-b border-gray-400">{totalVES}</div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
