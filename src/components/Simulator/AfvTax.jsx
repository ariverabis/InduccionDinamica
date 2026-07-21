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
  setRetencionesLista,
  facturasSeleccionadas,
  setFacturasSeleccionadas,
  montosEditables,
  setMontosEditables,
  subPantalla,
  setSubPantalla,
  montoRetencionEditado,
  setMontoRetencionEditado,
  mostrarConfirmacion,
  setMostrarConfirmacion
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
      {/* PANTALLA: LISTA DE RETENCIONES (061) */}
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
                  {empresaSeleccionada === 'Beval' ? 'AGRO FERRETERIA CAMPANARIO C.A. - 2503001' : 'ALTAMIRA FERRE-INDUSTRIAL - 2131133'}
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
                 <div className="flex bg-[#d9d9d9] text-black font-bold text-[12px] border-t border-gray-400">
                   <div className="w-12 py-1.5 border-r border-gray-200"></div>
                   <div className="flex-1 text-center py-1.5 border-r border-gray-200">Total:</div>
                   <div className="flex-1 text-center py-1.5">
                     {retencionesLista.reduce((sum, r) => sum + parseFloat(String(r.monto).replace(',', '.')) || 0, 0).toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                   </div>
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

      {/* PANTALLA: FORMULARIO DE RETENCION (097) */}
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
                <div className="p-1 space-y-1.5 border-b border-gray-300">
                   {/* Fila 1 */}
                    <div className="flex items-center gap-1">
                       <label className="text-[10px] text-gray-500 w-[50px]">RIF:</label>
                       <div className="flex-1 bg-[#c0c0c0] px-1 py-0.5 text-[11px] font-bold text-black border-b border-gray-400">J312193697</div>
                       <button onClick={() => {
                        const calculatedBase = (totalUSD / 1.16);
                        const calculatedImpuesto = calculatedBase * 0.16;
                        const calculatedRet = calculatedImpuesto * 0.75;
                        setMontoRetencionEditado(calculatedRet.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                        setSubPantalla('detalle');
                      }} className="bg-[#e0e0e0] px-2 py-0.5 text-[9px] font-bold border border-gray-300 rounded">FIN</button>
                       <button onClick={() => setRetencionTipo('')} className="bg-[#c0c0c0] w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center font-bold text-white shadow-inner text-[10px]">←</button>
                    </div>
                    {/* Fila 2 */}
                    <div className="flex items-center gap-1">
                       <label className="text-[10px] text-gray-500 w-[70px]">Razón Social:</label>
                       <div className="flex-1 bg-[#c0c0c0] px-1 py-0.5 text-[11px] text-black border-b border-gray-400 truncate">ALTAMIRA FERRE-INDUSTRIAL -</div>
                    </div>
                    {/* Fila 3 */}
                    <div className="flex items-center gap-1">
                       <label className="text-[10px] text-gray-500 w-[70px]">Fecha Comp:</label>
                       <input type="date" value={retencionFecha} onChange={(e) => setRetencionFecha(e.target.value)} className="flex-1 bg-transparent border-b border-black py-0.5 text-[11px] font-bold outline-none text-black" />
                    </div>
                    {/* Fila 4 */}
                    <div className="flex items-center gap-1">
                       <label className="text-[10px] text-gray-500 w-[70px]">Comprobante:</label>
                       <input type="text" value={retencionPeriodo} onChange={(e) => setRetencionPeriodo(e.target.value)} className="w-[70px] bg-[#c0c0c0] px-1 py-0.5 text-[11px] font-bold text-black border-b border-gray-400 outline-none" placeholder="Período" />
                       <input type="text" value={retencionSecuencia} onChange={(e) => setRetencionSecuencia(e.target.value)} className="flex-1 bg-transparent border-b-2 border-blue-600 px-1 py-0.5 text-[11px] font-bold outline-none text-black" placeholder="Secuencia" />
                    </div>
                 </div>

                 {/* TABLA DE FACTURAS */}
                 <div className="flex-1 flex flex-col min-h-0 bg-white">
                    <div className="flex bg-[#a0a0a0] text-white text-[9px] font-bold border-b-2 border-gray-400 mt-1 mx-1">
                       <div className="w-[30px] py-0.5 border-r border-gray-300"></div>
                       <div className="w-[40px] text-center py-0.5 border-r border-gray-300">Tipo</div>
                       <div className="flex-1 text-center py-0.5 border-r border-gray-300">No. Fiscal</div>
                       <div className="w-[70px] text-center py-0.5">Monto (USD)</div>
                    </div>
                    <div className="flex-1 overflow-y-auto mx-1 border-x border-b border-gray-300">
                       {facturasDisponibles.map((f, idx) => {
                          const isSelected = facturasSeleccionadas.includes(f.id);
                          return (
                            <div key={f.id} onClick={() => handleSelectFactura(f.id)} className={`flex items-center text-[10px] border-b border-gray-200 cursor-pointer ${isSelected ? 'bg-[#00b0f0] text-white' : 'text-black'}`}>
                               <div className="w-[30px] flex justify-center py-1 border-r border-gray-200">
                                  <input type="checkbox" checked={isSelected} onChange={() => {}} className="w-3 h-3 cursor-pointer" />
                               </div>
                               <div className="w-[40px] font-bold text-center py-1 border-r border-gray-200">FAC</div>
                               <div className="flex-1 font-bold text-center py-1 border-r border-gray-200">{f.id}</div>
                               <div className="w-[70px] font-bold text-right pr-1 py-0.5 flex items-center justify-end">
                                 {isSelected ? (
                                   <div
                                     onClick={(e) => { 
                                       e.stopPropagation(); 
                                       setMontoRetencionEditado(getMontoStr(f));
                                       setSubPantalla('keypad'); 
                                     }}
                                     className="w-full bg-white text-black text-right border border-gray-400 px-0.5 py-0.5 rounded text-[10px] cursor-pointer"
                                   >
                                     {getMontoStr(f)}
                                   </div>
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
                 <div className="p-1 space-y-1.5 border-t border-gray-300">
                    <div className="flex items-center gap-1.5">
                       <input type="checkbox" id="selectAll" checked={facturasSeleccionadas.length === facturasDisponibles.length && facturasDisponibles.length > 0} onChange={handleSelectAll} className="w-3.5 h-3.5" />
                       <label htmlFor="selectAll" className="text-[10px] text-gray-700">Seleccionar todo</label>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                       <label className="text-[10px] text-gray-500 w-[70px]">Monto VES:</label>
                       <div className="flex-1 bg-[#c0c0c0] px-1.5 py-1 text-[12px] font-bold text-black border-b border-gray-400">{totalVES}</div>
                    </div>
                 </div>
               </div>
             )}
           </div>
         </div>
       )}

      {/* OVERLAY: 098 - Detalle Retencion */}
      {subPantalla === 'detalle' && (
        <div className="absolute inset-0 bg-[#f0f0f0] mt-8 rounded-t-2xl flex flex-col z-40 overflow-hidden font-sans text-xs">
          <div className="bg-[#00b0f0] p-2 flex items-center justify-between text-black border-b border-gray-200">
            <span className="font-bold text-[11px] text-black">098 - Detalle Retencion</span>
            <button onClick={() => setSubPantalla('')} className="text-gray-600 hover:text-black font-bold text-[14px] w-6 h-6 rounded-full flex items-center justify-center bg-white border border-gray-300">✕</button>
          </div>
          <div className="flex-1 p-3 space-y-1.5 bg-[#f4f4f4] overflow-y-auto">
            <div className="flex items-center gap-2">
              <span className="w-24 text-gray-500 text-[10px]">Comprobante:</span>
              <div className="flex-1 bg-[#c0c0c0] px-2 py-0.5 text-[10px] font-bold text-black border border-gray-300 rounded shadow-sm">
                {retencionPeriodo + (retencionSecuencia ? retencionSecuencia.padStart(8, '0') : '00000000')}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-gray-500 text-[10px]">Tipo Doc:</span>
              <div className="flex-1 bg-[#c0c0c0] px-2 py-0.5 text-[10px] font-bold text-black border border-gray-300 rounded shadow-sm text-right">FAC</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-gray-500 text-[10px]">Nro. Doc:</span>
              <div className="flex-1 bg-[#c0c0c0] px-2 py-0.5 text-[10px] font-bold text-black border border-gray-300 rounded shadow-sm text-right">
                {facturasSeleccionadas[0] || '06980336'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-gray-500 text-[10px]">Nro. Control:</span>
              <div className="flex-1 bg-[#c0c0c0] h-5 px-2 py-0.5 text-[10px] font-bold text-black border border-gray-300 rounded shadow-sm"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-gray-500 text-[10px]">Alicuota (%):</span>
              <div className="flex-1 bg-[#c0c0c0] px-2 py-0.5 text-[10px] font-bold text-black border border-gray-300 rounded shadow-sm">
                16,00% Ret: 75.0%
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-gray-500 text-[10px]">Base:</span>
              <div className="flex-1 bg-[#c0c0c0] px-2 py-0.5 text-[10px] font-bold text-black border border-gray-300 rounded shadow-sm text-right">
                {(totalUSD / 1.16).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-gray-500 text-[10px]">Impuesto:</span>
              <div className="flex-1 bg-[#c0c0c0] px-2 py-0.5 text-[10px] font-bold text-black border border-gray-300 rounded shadow-sm text-right">
                {((totalUSD / 1.16) * 0.16).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-gray-500 text-[10px]">Retención:</span>
              <div onClick={() => setSubPantalla('keypad')} className="flex-1 bg-white border border-blue-400 px-2 py-0.5 text-[11px] font-bold text-black rounded shadow-inner text-right cursor-pointer">
                {montoRetencionEditado}
              </div>
            </div>

            <div className="flex gap-4 pt-4 justify-center">
              <button onClick={() => setMostrarConfirmacion(true)} className="bg-[#e0e0e0] border border-gray-400 px-4 py-1 text-[10px] font-bold shadow rounded">OK</button>
              <button onClick={() => setSubPantalla('')} className="bg-[#e0e0e0] border border-gray-400 px-4 py-1 text-[10px] font-bold shadow rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY: KEYPAD (Introduzca el número) - popup compacto estilo retencion9.jpg */}
      {subPantalla === 'keypad' && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white w-full max-w-[240px] rounded-lg shadow-2xl overflow-hidden">
            {/* Título y campo de monto */}
            <div className="px-4 pt-4 pb-2">
              <span className="text-[13px] font-bold text-black block">Introduzca el número:</span>
              <div className="text-[15px] font-bold text-right text-black mt-2 pr-1 pb-1 border-b-2 border-gray-400">
                {montoRetencionEditado || '0'}
              </div>
            </div>

            {/* Keypad Grid - fondo oscuro como la imagen */}
            <div className="mx-3 mb-2 p-2 bg-[#555] rounded-lg">
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, ',', 0].map((num) => (
                  <button 
                    key={num} 
                    onClick={() => {
                      if (num === ',') {
                        if (!montoRetencionEditado.includes(',')) {
                          setMontoRetencionEditado(montoRetencionEditado + ',');
                        }
                      } else {
                        setMontoRetencionEditado(montoRetencionEditado + num);
                      }
                    }} 
                    className="bg-[#d0d0d0] hover:bg-[#bbb] active:bg-[#aaa] py-2 rounded-md text-[13px] font-bold text-gray-700 shadow-sm border border-gray-400"
                  >
                    {num}
                  </button>
                ))}
                <button 
                  onClick={() => setMontoRetencionEditado(montoRetencionEditado.slice(0, -1))}
                  className="bg-[#d0d0d0] hover:bg-[#bbb] active:bg-[#aaa] py-2 rounded-md text-[13px] font-bold text-gray-700 shadow-sm border border-gray-400"
                >
                  &lt;-
                </button>
              </div>
            </div>

            {/* Botones ACEPTAR / CANCELAR */}
            <div className="flex gap-3 px-3 pb-3">
              <button 
                onClick={() => {
                  if (facturasSeleccionadas.length > 0) {
                    setMontosEditables(prev => ({ ...prev, [facturasSeleccionadas[0]]: montoRetencionEditado }));
                  }
                  setSubPantalla('');
                }}
                className="flex-1 bg-[#e8e8e8] border border-gray-400 py-2 rounded text-[11px] font-bold shadow text-black hover:bg-[#ddd]"
              >
                ACEPTAR
              </button>
              <button 
                onClick={() => setSubPantalla('')}
                className="flex-1 bg-[#e8e8e8] border border-gray-400 py-2 rounded text-[11px] font-bold shadow text-black hover:bg-[#ddd]"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG: Confirmación Grabar */}
      {mostrarConfirmacion && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-6 font-sans">
           <div className="bg-[#f0f0f0] w-full max-w-[240px] rounded shadow-2xl overflow-hidden">
              <div className="p-2.5 border-b border-gray-300 text-gray-800 font-bold text-[11px] flex items-center gap-1">
                 Confirmación
              </div>
              <div className="p-4 text-[10px] text-gray-800 leading-relaxed text-center">
                 ¿Confirma que desea grabar la retención?
              </div>
              <div className="flex border-t border-gray-300 bg-white text-[10px] font-bold">
                 <button 
                    onClick={() => setMostrarConfirmacion(false)} 
                    className="flex-1 py-2 hover:bg-gray-100 border-r border-gray-300 text-blue-600"
                 >
                    NO
                 </button>
                 <button 
                    onClick={() => {
                      setRetencionesLista([...retencionesLista, { 
                        comprobante: retencionPeriodo + (retencionSecuencia ? retencionSecuencia.padStart(8, '0') : '00000000'), 
                        fecha: retencionFecha, 
                        monto: montoRetencionEditado 
                      }]);
                      setMostrarConfirmacion(false);
                      setSubPantalla('');
                      setPantalla('retencion_list');
                      setRetencionTipo('');
                    }} 
                    className="flex-1 py-2 hover:bg-gray-100 text-blue-600"
                 >
                    SI
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};
