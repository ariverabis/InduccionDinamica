import React, { useState } from 'react';

const HistorialView = ({
  facturas,
  recibos,
  retenciones,
  depositos,
  onVerDetalleFactura
}) => {
  const [tabActiva, setTabActiva] = useState('Facturas'); // 'Facturas' | 'Recibos' | 'Retenciones' | 'Anexos'
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('06/11/2026 - 12/11/2026');

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 pb-20 overflow-y-auto">
      
      {/* Barra Superior */}
      <div className="bg-white p-3.5 border-b border-gray-200 space-y-2.5 sticky top-0 z-20 shadow-xs">
        
        {/* Buscador */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar cliente o documento"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl py-2 pl-9 pr-8 text-xs placeholder:text-gray-400 focus:outline-none focus:border-sky-600 focus:bg-white"
          />
          <svg className="w-3.5 h-3.5 absolute left-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button className="absolute right-2.5 text-gray-400 hover:text-gray-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
            </svg>
          </button>
        </div>

        {/* Filtro de Rango de Fechas y Exportar (Exacto a Screen 4) */}
        <div className="flex items-center gap-2">
          {filtroFecha && (
            <div className="flex-1 flex items-center justify-between px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-[11px] font-semibold">
              <span>{filtroFecha}</span>
              <button 
                onClick={() => setFiltroFecha(null)} 
                className="hover:text-sky-950 font-bold ml-2 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <button 
            className="p-2 border border-gray-300 bg-white rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-xs"
            title="Descargar reporte del historial"
            onClick={() => alert('Generando exportación de historial en formato compatible Excel...')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>

        {/* 4 Pestañas de Historial: Facturas, Recibos, Retenciones, Anexos */}
        <div className="flex border-b border-gray-200 pt-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'Facturas', label: 'Facturas' },
            { id: 'Recibos', label: 'Recibos' },
            { id: 'Retenciones', label: 'Retenciones' },
            { id: 'Anexos', label: 'Anexos' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex-1 py-2 text-xs font-bold text-center border-b-2 whitespace-nowrap transition-colors ${
                tabActiva === tab.id
                  ? 'border-sky-600 text-sky-700 bg-sky-50/60 rounded-t-lg'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      <div className="p-3 space-y-3">
        
        {/* PESTAÑA 1: FACTURAS (Exacto a Screen 4) */}
        {tabActiva === 'Facturas' && (
          <div className="space-y-3">
            {facturas.map(fac => (
              <div 
                key={fac.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs border-l-4 border-l-sky-500 p-3.5 space-y-2.5 hover:border-sky-300 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm text-gray-900 font-mono">
                      {fac.numero}
                    </span>
                    <p className="text-[11px] font-semibold text-gray-600 mt-0.5">
                      {fac.clienteNombre} - {fac.clienteCodigo}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                    {fac.estado}
                  </span>
                </div>

                {/* Fechas */}
                <div className="text-[11px] border-t border-gray-100 pt-2 space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Fechas</p>
                  <div className="grid grid-cols-3 text-gray-700 gap-1">
                    <div>
                      <span className="text-gray-400 block text-[9px]">Emitido:</span>
                      <span className="font-medium">{fac.fechaEmision}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px]">Vence:</span>
                      <span className="font-medium">{fac.fechaVencimiento}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px]">Venc. Plazo:</span>
                      <span className="font-medium">{fac.fechaVencPlazo}</span>
                    </div>
                  </div>
                </div>

                {/* Importe y Saldo */}
                <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-2">
                  <span className="text-gray-600">Importe: <b>${fac.importeUSD.toFixed(2)}</b></span>
                  <span className="text-sky-700 font-bold font-mono">Saldo: ${fac.saldoUSD.toFixed(2)}</span>
                </div>

                {/* Botón Detalle Factura (Abre desglose de artículos y asientos contables) */}
                <button
                  onClick={() => onVerDetalleFactura(fac)}
                  className="w-full py-2 bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Detalle de factura</span>
                  <span>&gt;</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA 2: RECIBOS DE COBRO */}
        {tabActiva === 'Recibos' && (
          <div className="space-y-3">
            {recibos.map(rec => (
              <div key={rec.id} className="bg-white rounded-2xl border border-gray-200 p-3.5 space-y-2 shadow-xs border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-xs text-gray-900 font-mono">{rec.numeroRecibo}</span>
                    <p className="text-[11px] font-medium text-gray-600 mt-0.5">{rec.clienteNombre}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    Procesado
                  </span>
                </div>
                <div className="grid grid-cols-2 text-xs border-y border-gray-100 py-1.5 my-1">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Monto en Divisas:</span>
                    <span className="font-bold text-emerald-700">${rec.montoUSD.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Equivalente Bs:</span>
                    <span className="font-mono text-gray-700">{rec.montoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 flex justify-between">
                  <span>Método: <b>{rec.metodo}</b></span>
                  <span>Ref: <b>{rec.referencia}</b></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA 3: RETENCIONES PRECARGADAS */}
        {tabActiva === 'Retenciones' && (
          <div className="space-y-3">
            {retenciones.map(ret => (
              <div key={ret.id} className="bg-white rounded-2xl border border-gray-200 p-3.5 space-y-2 shadow-xs border-l-4 border-l-purple-500">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-xs text-gray-900 font-mono">COMP. #{ret.numeroComprobante}</span>
                    <p className="text-[11px] font-medium text-gray-600 mt-0.5">{ret.clienteNombre}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase">
                    {ret.porcentaje}
                  </span>
                </div>
                <div className="grid grid-cols-2 text-xs border-y border-gray-100 py-1.5">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Retenido USD:</span>
                    <span className="font-bold text-purple-700">${ret.montoRetenidoUSD.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Retenido Bs:</span>
                    <span className="font-mono text-gray-700">{ret.montoRetenidoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">Factura afectada: <b>#{ret.facturaAfectada}</b> | Período: <b>{ret.periodoFiscal}</b></p>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA 4: ANEXOS Y DEPÓSITOS */}
        {tabActiva === 'Anexos' && (
          <div className="space-y-3">
            {depositos.map(dep => (
              <div key={dep.id} className="bg-white rounded-2xl border border-gray-200 p-3.5 space-y-2 shadow-xs border-l-4 border-l-amber-500">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-xs text-gray-900 font-mono">{dep.numeroRelacion}</span>
                    <p className="text-[11px] font-semibold text-gray-700 mt-0.5">{dep.bancoReceptor}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                    Depositado
                  </span>
                </div>
                <div className="grid grid-cols-2 text-xs border-y border-gray-100 py-1.5">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Total Depositado:</span>
                    <span className="font-bold text-emerald-700">${dep.montoUSD.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Planilla / Ref:</span>
                    <span className="font-mono text-gray-700">{dep.numeroPlanilla}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">Fecha: <b>{dep.fechaDeposito}</b> | {dep.estatus}</p>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default HistorialView;

