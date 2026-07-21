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
  setMostrarLupa,
  facturaSeleccionada,
  setFacturaSeleccionada,
  mostrarModalFormasPagoRecibo,
  setMostrarModalFormasPagoRecibo,
  formaPagoReciboSeleccionada,
  setFormaPagoReciboSeleccionada,
  montoResta,
  setMontoResta,
  montoAbono,
  setMontoAbono,
  mostrarModalDeposito,
  setMostrarModalDeposito,
  montoDeposito,
  setMontoDeposito,
  referenciaDeposito,
  setReferenciaDeposito,
  mostrarComboBanco,
  setMostrarComboBanco,
  bancoDeposito,
  setBancoDeposito,
  fechaDeposito,
  setFechaDeposito,
  mostrarLupaMontos,
  setMostrarLupaMontos,
  imgCalculadora,
  setImgCalculadora,
  mostrarCalculadora,
  setMostrarCalculadora
}) => {
  return (
    <>
      {/* PANTALLA: RECIBO CLIENTE */}
      {pantalla === 'recibo_cliente' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
          {/* Top Bar */}
          <div className="bg-[#00b0f0] p-2 flex items-center justify-between text-black border-b border-[#0092c8] shadow-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[7px] font-bold text-gray-800 font-sans">f</span>
              </div>
              <span className="text-[10px] font-bold font-sans text-black">088 - Clientes</span>
            </div>
            <button className="text-[12px] font-bold">⋮</button>
          </div>

          <div className="flex-1 flex flex-col p-1.5 bg-gray-100 overflow-hidden">
             {/* Ruta */}
             <div className="flex items-center mb-1 gap-1">
                <span className="text-[9px] font-bold text-gray-700 w-[35px]">Ruta:</span>
                <select className="flex-1 bg-transparent border border-gray-300 text-[9px] py-0.5 px-0.5 font-sans text-gray-600 outline-none">
                  <option>--- Todas ---</option>
                </select>
                <button onClick={() => setPantalla('menu')} className="bg-[#c0c0c0] w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center font-bold text-white shadow-inner text-[9px] ml-0.5">←</button>
             </div>

             {/* Cliente Search */}
             <div className="flex items-center mb-1 gap-1">
                <span className="text-[9px] font-bold text-gray-700 w-[35px]">Cliente:</span>
                <div className="flex-1 bg-[#c0c0c0] px-1 py-0.5 text-[10px] font-bold text-black border-b border-gray-400">2131133</div>
                <button className="bg-[#e0e0e0] border border-gray-300 px-0.5 py-0.5 text-[8px] font-bold">O.P.</button>
                <button className="bg-[#e0e0e0] border border-gray-300 px-0.5 py-0.5 text-[8px] font-bold">B.</button>
                <button className="bg-[#e0e0e0] border border-gray-300 px-0.5 py-0.5 text-[8px] font-bold">CONSUL.</button>
             </div>

             {/* Client List */}
             <div className="flex-1 border border-gray-400 bg-white overflow-y-auto">
                <div className="bg-white border-b border-gray-300 px-1 py-0.5 text-[9px] font-bold text-black">
                   ALTAMIRA FERRE-INDUSTRIAL - 2131133
                </div>
                
                <div className="divide-y divide-gray-200">
                   <div className="px-1.5 py-1 text-[9px] font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer">
                      A-40, C.A - 2565065
                   </div>
                   <div onClick={() => setPantalla('recibo_menu')} className="px-1.5 py-1 text-[9px] font-bold text-white bg-[#00b0f0] cursor-pointer shadow-sm">
                      ALTAMIRA FERRE-INDUSTRIAL - 2131133
                   </div>
                   {[
                      'BIKE MARKET REPUESTOS & ACCESORIOS, C.A. - 2531304',
                      'BIUKOR MARKET, C.A -',
                      'BLOQUERA CONSTRUCCIONES Y MATERIALES COFALCA, C.A. -',
                      'COLORMAR C.A. - 2541013',
                      'COMERCIAL EL SAMAN 2007, C.A. - 2532008',
                      'COMERCIALIZADORA M.A.J.G, C.A -',
                      'COMERCIALIZADORA Y SUPLIDORA POVINSTAR ASIA, C.A - 25',
                      'CONCRETERA Y FERRETERIA DON JULIO SANCHEZ C.A. - 2565',
                      'DISMARKET EXPRESS, C.A -',
                      'DISTORMAR C.A - 2541132',
                      'DISTRIBUIDORA S.C GUACARA, C.A. - 2531122',
                      'EMPACADURAS INDUSTRIALES DEL CENTRO, C.A -',
                      'EMPRENDIMIENTO DORIS DURAN -',
                      'FERRE CHURRO 2025, C.A -',
                      'FERRE COMERC DE LA CHIQ C.A - 2531019'
                   ].map((cli, idx) => (
                      <div key={idx} onClick={() => setPantalla('recibo_menu')} className="px-1.5 py-1 text-[9px] font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer">
                         {cli}
                      </div>
                   ))}
                </div>
             </div>

             {/* Keyboard visual mockup */}
             <div className="mt-1 flex flex-col gap-0.5 bg-gray-200 p-1 rounded">
                <div className="flex justify-center gap-0.5">
                   {'ABCDEFGHIJKLM'.split('').map(letter => (
                      <span key={letter} className="bg-white border border-gray-300 w-4 py-0.5 text-[7px] font-bold text-gray-700 rounded shadow-sm text-center select-none">
                         {letter}
                      </span>
                   ))}
                </div>
                <div className="flex justify-center gap-0.5">
                   {'NOPQRSTUVWXYZ'.split('').map(letter => (
                      <span key={letter} className="bg-white border border-gray-300 w-4 py-0.5 text-[7px] font-bold text-gray-700 rounded shadow-sm text-center select-none">
                         {letter}
                      </span>
                   ))}
                </div>
             </div>
          </div>
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
              <span className="text-[12px] font-bold text-gray-800 font-sans truncate">{empresaSeleccionada === 'Beval' ? 'AGRO FERRETERIA CAMPANARIO C.A.' : 'ALTAMIRA FERRE-INDUSTRIAL -'}</span>
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
              <button onClick={() => { setPantalla('recibo_sel_factura'); setMostrarModalFormasPagoRecibo(true); }} className="bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg">NUEVO RECIBO</button>
              <div className="flex-1 border border-gray-300 rounded bg-gray-50 p-2 text-center text-gray-400 italic text-sm">
                 No hay recibos pendientes de envío
              </div>
           </div>
        </div>
      )}

      {/* PANTALLA: SELECCION DE FACTURAS */}
      {pantalla === 'recibo_sel_factura' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
           <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <button onClick={() => setPantalla('recibo_index')} className="text-lg leading-none">← </button>
                <span className="text-[13px] font-bold">046 - Selección de Facturas</span>
              </div>
              <button onClick={() => setPantalla('recibo_incluidas')} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold shadow">Incluir</button>
           </div>
           <div className="flex-1 p-2 bg-gray-100 flex flex-col">
              <div className="bg-white border border-gray-300 p-2 text-xs font-bold text-gray-700 flex justify-between items-center mb-2">
                 <span>Forma de Pago: {formaPagoReciboSeleccionada || 'NINGUNA'}</span>
                 <button onClick={() => setMostrarModalFormasPagoRecibo(true)} className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px]">Cambiar</button>
              </div>
              <div className="flex-1 bg-white border border-gray-300 overflow-y-auto">
                 <div className="flex bg-gray-300 text-xs font-bold p-2 border-b border-gray-400">
                    <div className="w-8">Inc.</div>
                    <div className="flex-1">Documento</div>
                    <div className="flex-1 text-right">Saldo</div>
                 </div>
                 <div className="flex items-center p-2 border-b border-gray-200 text-xs">
                    <div className="w-8 flex justify-center">
                       <input type="checkbox" checked={facturaSeleccionada} onChange={(e) => setFacturaSeleccionada(e.target.checked)} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 font-bold">FAC 102553</div>
                    <div className="flex-1 text-right font-mono">43,59</div>
                 </div>
                 <div className="flex items-center p-2 border-b border-gray-200 text-xs opacity-50">
                    <div className="w-8 flex justify-center"><input type="checkbox" className="w-4 h-4" /></div>
                    <div className="flex-1 font-bold">FAC 101999</div>
                    <div className="flex-1 text-right font-mono">120,00</div>
                 </div>
              </div>
           </div>

           {mostrarModalFormasPagoRecibo && (
             <div className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80%]">
                   <div className="p-3 border-b border-gray-200 font-bold text-sm bg-gray-50 flex justify-between">
                     <span>Seleccione Forma de Pago</span>
                     <button onClick={() => setMostrarModalFormasPagoRecibo(false)} className="text-gray-500 font-bold">X</button>
                   </div>
                   <div className="p-4 flex flex-col gap-3 overflow-y-auto">
                     <button onClick={() => { setFormaPagoReciboSeleccionada('EFECTIVO $'); setMostrarModalFormasPagoRecibo(false); }} className="w-full text-left p-3 border border-gray-300 rounded hover:bg-blue-50 text-xs font-bold text-gray-700">Efectivo $</button>
                     <button onClick={() => { setFormaPagoReciboSeleccionada('DEPOSITO $'); setMostrarModalFormasPagoRecibo(false); }} className="w-full text-left p-3 border border-gray-300 rounded hover:bg-blue-50 text-xs font-bold text-gray-700">Depósito en tránsito ($)</button>
                     <button onClick={() => { setFormaPagoReciboSeleccionada('TRANSFERENCIA BS'); setMostrarModalFormasPagoRecibo(false); }} className="w-full text-left p-3 border border-gray-300 rounded hover:bg-blue-50 text-xs font-bold text-gray-700">Transferencia en Bs</button>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

      {/* PANTALLA: FACTURAS INCLUIDAS */}
      {pantalla === 'recibo_incluidas' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
           <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <span className="text-[13px] font-bold">047 - Inclusión de Abonos</span>
              <button onClick={() => setPantalla('recibo_sel_factura')} className="text-lg leading-none">← </button>
           </div>
           <div className="flex-1 p-2 bg-gray-100 flex flex-col">
              <div onClick={() => setPantalla('recibo_abono')} className="bg-blue-500 text-white font-bold p-3 rounded shadow-md text-sm text-center mb-4 cursor-pointer relative">
                 Monto Abono: {montoAbono} {formaPagoReciboSeleccionada.includes('BS') ? 'Bs' : 'USD'}
                 <span className="absolute right-3 top-3 text-xs bg-white/20 px-2 py-0.5 rounded">Editar</span>
              </div>
              <div className="flex-1 bg-white border border-gray-300 overflow-y-auto mb-4 relative">
                 <div className="flex bg-gray-200 text-[10px] font-bold p-2 border-b border-gray-300">
                    <div className="flex-1">Doc</div>
                    <div className="flex-1 text-center">Saldo</div>
                    <div className="flex-1 text-right">Abono</div>
                 </div>
                 {facturaSeleccionada && (
                   <div className="flex items-center p-2 border-b border-gray-100 text-[11px] font-mono font-bold text-gray-700">
                      <div className="flex-1">FAC 102553</div>
                      <div className="flex-1 text-center">43,59</div>
                      <div className="flex-1 text-right text-blue-600">{montoAbono}</div>
                   </div>
                 )}
                 <button onClick={() => setMostrarModalDeposito(true)} className="absolute bottom-4 right-4 w-12 h-12 bg-green-500 text-white rounded-full shadow-xl flex items-center justify-center text-3xl font-light hover:scale-105 transition-transform">+</button>
              </div>
              <div className="bg-gray-800 text-white p-3 rounded text-xs flex justify-between font-bold">
                 <span>Resta por Aplicar:</span>
                 <span className="text-yellow-400">{montoResta}</span>
              </div>
           </div>

           {/* LUPA Y CALCULADORA OVERLAYS */}
           {mostrarLupaMontos && (
              <div className="absolute inset-x-0 bottom-0 h-48 bg-black/80 z-40 flex items-center justify-center pointer-events-none">
                 <div className="bg-white p-4 rounded-xl shadow-2xl border-4 border-yellow-400 scale-125 transform">
                    <p className="text-xs font-bold text-gray-500 text-center mb-2">MONTOS DETALLADOS</p>
                    <div className="flex justify-between gap-4 font-mono font-bold text-sm">
                       <div className="text-red-600">Bs: 2.158,35</div>
                       <div className="text-green-600">$: 43,59</div>
                    </div>
                 </div>
              </div>
           )}

           {mostrarCalculadora && (
              <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-8">
                 <div className="bg-white rounded-xl shadow-2xl p-2 max-w-[80%] border-4 border-blue-400 relative">
                    <div className="text-center text-xs font-bold text-gray-500 mb-2">Calculadora</div>
                    <div className="bg-gray-100 p-3 rounded font-mono font-bold text-right text-lg border border-gray-300">
                       {imgCalculadora.includes('calc1') ? '49.51480' : '43.39'}
                    </div>
                    <div className="grid grid-cols-4 gap-1 mt-2">
                       {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(key => (
                         <div key={key} className="bg-gray-200 p-2 text-center font-bold rounded text-sm">{key}</div>
                       ))}
                    </div>
                 </div>
              </div>
           )}

           {/* MODAL DE DEPOSITO */}
           {mostrarModalDeposito && (
             <div className="absolute inset-0 bg-black/80 z-50 flex items-end justify-center">
                <div className="bg-gray-100 w-full rounded-t-3xl shadow-2xl overflow-hidden flex flex-col h-[90%]">
                   <div className="p-3 border-b border-gray-300 font-bold text-sm bg-white flex justify-between items-center shadow-sm">
                     <span className="text-blue-600">Registro de Pago</span>
                     <button onClick={() => setMostrarModalDeposito(false)} className="text-gray-500 font-bold text-xl px-2">✕</button>
                   </div>
                   <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
                      <div>
                         <label className="text-[10px] font-bold text-gray-500">MONTO ({formaPagoReciboSeleccionada})</label>
                         <input type="text" value={montoDeposito} onChange={(e) => setMontoDeposito(e.target.value)} className="w-full bg-white border-b-2 border-gray-300 py-2 font-mono font-bold text-sm outline-none px-2 rounded-t" />
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-gray-500">REFERENCIA / RECIBO</label>
                         <input type="text" value={referenciaDeposito} onChange={(e) => setReferenciaDeposito(e.target.value)} className="w-full bg-white border-b-2 border-gray-300 py-2 font-mono font-bold text-sm outline-none px-2 rounded-t" />
                      </div>
                      <div className="relative">
                         <label className="text-[10px] font-bold text-gray-500">BANCO RECEPTOR</label>
                         <div onClick={() => setMostrarComboBanco(!mostrarComboBanco)} className="w-full bg-white border-b-2 border-gray-300 py-2 font-bold text-xs outline-none px-2 rounded-t cursor-pointer flex justify-between">
                            <span>{bancoDeposito || 'Seleccione Banco'}</span>
                            <span className="text-gray-400">▼</span>
                         </div>
                         {mostrarComboBanco && (
                           <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 z-10 max-h-40 overflow-y-auto">
                              {['Banco Mercantil', 'Banco Provincial', 'Banesco', 'Banco de Venezuela'].map(b => (
                                <div key={b} onClick={() => { setBancoDeposito(b); setMostrarComboBanco(false); }} className="p-2 text-xs hover:bg-blue-50 border-b border-gray-100">{b}</div>
                              ))}
                           </div>
                         )}
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-gray-500">FECHA DEPÓSITO</label>
                         <input type="date" value={fechaDeposito} onChange={(e) => setFechaDeposito(e.target.value)} className="w-full bg-white border-b-2 border-gray-300 py-2 font-mono font-bold text-sm outline-none px-2 rounded-t" />
                      </div>
                      
                      <button onClick={() => { setMostrarModalDeposito(false); setPantalla('recibo_pagado'); }} className="mt-4 w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md">CONFIRMAR PAGO</button>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

      {/* PANTALLA: MODIFICAR ABONO */}
      {pantalla === 'recibo_abono' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
           <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <span className="text-[13px] font-bold">Modificar Abono</span>
              <button onClick={() => setPantalla('recibo_incluidas')} className="text-lg leading-none">← </button>
           </div>
           <div className="flex-1 p-6 bg-gray-100 flex flex-col items-center">
              <label className="text-sm font-bold text-gray-600 mb-2">Nuevo Monto de Abono</label>
              <input type="text" value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} className="w-full text-center text-3xl font-mono font-bold py-4 rounded-xl shadow-inner bg-white text-blue-600 border border-gray-200 outline-none" autoFocus />
              <button onClick={() => setPantalla('recibo_incluidas')} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg mt-8">GUARDAR CAMBIO</button>
           </div>
        </div>
      )}

      {/* PANTALLA: RECIBO PAGADO */}
      {pantalla === 'recibo_pagado' && (
        <div className="flex-1 bg-gray-100 mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
           <div className="p-2.5 flex items-center justify-center border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <span className="text-[13px] font-bold">048 - Cierre de Recibo</span>
           </div>
           <div className="flex-1 p-6 flex flex-col items-center justify-center gap-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-4xl shadow-inner">
                ✓
              </div>
              <p className="text-sm font-bold text-gray-700 text-center">Pagos validados exitosamente. Diferencia: 0.00</p>
              <button onClick={() => setPantalla('recibo_listo')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md uppercase">Finalizar Recibo</button>
           </div>
        </div>
      )}

      {/* PANTALLA: RECIBO LISTO */}
      {pantalla === 'recibo_listo' && (
        <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
           <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <span className="text-[13px] font-bold">Recibo Emitido</span>
              <button onClick={() => setPantalla('recibo_index')} className="text-lg leading-none">✕</button>
           </div>
           <div className="flex-1 p-6 bg-blue-50 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 text-blue-600 text-5xl">📄</div>
              <h3 className="font-bold text-lg text-gray-800">Recibo RC-9923 Generado</h3>
              <p className="text-xs text-gray-500 text-center">El recibo ha sido guardado y sincronizado con el servidor central.</p>
              <button onClick={() => setPantalla('recibo_index')} className="mt-8 px-8 bg-gray-800 text-white font-bold py-2 rounded shadow-md">Volver al Menú</button>
           </div>
        </div>
      )}
    </>
  );
};
