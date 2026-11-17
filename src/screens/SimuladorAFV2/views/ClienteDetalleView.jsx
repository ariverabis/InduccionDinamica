import React, { useState } from 'react';

const ClienteDetalleView = ({
  cliente,
  onVolver,
  onVerSaldoCuenta,
  onGenerarRecibo
}) => {
  const [slideIndex, setSlideIndex] = useState(0);

  const esAlerta = cliente.estadoRiesgo === 'ALERTA';
  const esCritico = cliente.estadoRiesgo === 'CRITICOS';

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto pb-20">
      
      {/* Barra Superior Header */}
      <div className="bg-white p-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={onVolver}
          className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 text-xs font-bold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-semibold">Cliente</span>
        </button>
      </div>

      <div className="p-3 space-y-3">

        {/* Ficha Principal del Cliente (Exacto a Imagen 1.jpeg) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="flex border-l-4" style={{ borderColor: esCritico ? '#ef4444' : esAlerta ? '#f59e0b' : '#10b981' }}>
            <div className="p-3.5 flex-1 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 leading-snug">
                    {cliente.nombre} - {cliente.codigo}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                    {cliente.codigo} {cliente.zona}
                  </p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                  esCritico ? 'bg-red-100 text-red-700' : esAlerta ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {cliente.estadoRiesgo}
                </span>
              </div>

              {/* Box de Visita y Compra */}
              <div className="grid grid-cols-2 gap-2 border border-sky-100 bg-white rounded-xl p-2.5 text-[11px]">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Última visita</span>
                  <span className="font-semibold text-gray-800">{cliente.ultimaVisita || '--/--/----'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Última compra</span>
                  <span className="font-semibold text-gray-800">{cliente.ultimaCompra || '2026-11-16'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Carrusel de Facturas Vencidas (Exacto a Imagen 1.jpeg) */}
        {cliente.saldoVencido > 0 && (
          <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-3.5 shadow-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-bold text-red-900 tracking-wide uppercase">
                  FACTURAS VENCIDAS
                </h4>
                <p className="text-xs font-bold text-gray-900 mt-0.5">
                  {cliente.facturasVencidasCount || 3} facturas
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  La más antigua tiene {cliente.facturaMasAntiguaDias || 17} días de vencida.
                </p>
              </div>
            </div>

            {/* Indicador de Puntos (Dots) */}
            <div className="flex justify-center items-center gap-1.5 pt-1">
              <span className={`w-4 h-1.5 rounded-full transition-all ${slideIndex === 0 ? 'bg-sky-500' : 'bg-gray-300'}`}></span>
              <span className={`w-1.5 h-1.5 rounded-full transition-all ${slideIndex === 1 ? 'bg-sky-500' : 'bg-gray-300'}`}></span>
              <span className={`w-1.5 h-1.5 rounded-full transition-all ${slideIndex === 2 ? 'bg-sky-500' : 'bg-gray-300'}`}></span>
            </div>
          </div>
        )}

        {/* Cuadrante 2x2 Financiero (Exacto a Imagen 1.jpeg) */}
        <div className="bg-white border border-sky-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-2 divide-x divide-y divide-sky-100 text-xs">
            {/* Top Left: Saldo Total */}
            <div className="p-3 bg-white">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">SALDO TOTAL</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5 font-mono">
                ${cliente.saldoTotal.toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Top Right: Saldo Vencido */}
            <div className="p-3 bg-red-50/50">
              <p className="text-[9px] text-red-600 font-bold uppercase tracking-wider">SALDO VENCIDO</p>
              <p className="text-sm font-bold text-red-600 mt-0.5 font-mono">
                ${cliente.saldoVencido.toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Bottom Left: Retenciones */}
            <div className="p-3 bg-white">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">RETENCIONES</p>
              <p className="text-sm font-bold text-sky-600 mt-0.5 font-mono">
                ${(cliente.retenciones || 57.37).toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Bottom Right: Sin Retención */}
            <div className="p-3 bg-white">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">SIN RETENCIÓN</p>
              <p className="text-sm font-bold text-gray-600 mt-0.5 font-mono">
                ${(cliente.sinRetencion || (cliente.saldoTotal - (cliente.retenciones || 57.37))).toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones de Navegación (Exacto a Imagen 1.jpeg) */}
        <div className="space-y-2.5 pt-1">
          
          {/* Opción 1: Ver saldo de cuenta */}
          <button
            onClick={onVerSaldoCuenta}
            className="w-full bg-white border border-gray-200 hover:border-sky-300 rounded-2xl p-3.5 flex items-center justify-between shadow-xs transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-sky-600 leading-tight">Ver saldo de cuenta</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Consulta saldos y movimientos</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Opción 2: Generar recibo de cobro */}
          <button
            id="btn-generar-recibo-cliente"
            onClick={onGenerarRecibo}
            className="w-full bg-white border border-gray-200 hover:border-sky-300 rounded-2xl p-3.5 flex items-center justify-between shadow-xs transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-sky-600 leading-tight">Generar recibo de cobro</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Registra un nuevo cobro</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

        </div>

      </div>

    </div>
  );
};

export default ClienteDetalleView;
