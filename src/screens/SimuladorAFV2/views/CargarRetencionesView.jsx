import React, { useState } from 'react';
import { TASA_BCV } from '../data/mockCobranzasAFV2';

const CargarRetencionesView = ({
  cliente,
  facturas,
  onVolver,
  onEditarRetencion,
  onRegistrarRetencionExitosa
}) => {
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [comprobanteFiscal, setComprobanteFiscal] = useState('2026110000412');
  const [mensajeExito, setMensajeExito] = useState(false);

  const facturasCliente = facturas.filter(f => f.clienteId === cliente.id);

  const toggleSeleccion = (facturaId) => {
    setSeleccionadas(prev => 
      prev.includes(facturaId) 
        ? prev.filter(id => id !== facturaId)
        : [...prev, facturaId]
    );
  };

  // Cálculo total de retención seleccionada
  const facturasSeleccionadas = facturasCliente.filter(f => seleccionadas.includes(f.id));
  const totalRetencionUSD = facturasSeleccionadas.reduce((acc, f) => acc + (f.montoRetencionUSD || (f.montoRetencionBs / TASA_BCV)), 0);
  const totalRetencionBs = facturasSeleccionadas.reduce((acc, f) => acc + (f.montoRetencionBs || (f.montoRetencionUSD * TASA_BCV)), 0);

  const handleRegistrarPago = () => {
    if (seleccionadas.length === 0) return;
    setMensajeExito(true);
    setTimeout(() => {
      onRegistrarRetencionExitosa({
        clienteId: cliente.id,
        facturasIds: seleccionadas,
        totalUSD: totalRetencionUSD,
        totalBs: totalRetencionBs,
        comprobante: comprobanteFiscal
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 pb-36 overflow-y-auto">
      
      {/* Barra Superior con botón volver */}
      <div className="bg-white p-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={onVolver}
          className="flex items-center gap-1.5 text-sky-700 hover:text-sky-800 text-xs font-bold"
        >
          <span className="text-base">←</span>
          <span>Cargar retenciones</span>
        </button>
      </div>

      <div className="p-3 space-y-3">
        
        {/* Ficha Resumen del Cliente */}
        <div className="bg-white border-l-4 border-amber-400 rounded-2xl p-3.5 border-y border-r border-gray-200 shadow-xs">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="text-xs font-bold text-gray-900 leading-tight">
                {cliente.nombre}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                {cliente.codigo} {cliente.zona}
              </p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase shrink-0">
              {cliente.estadoRiesgo}
            </span>
          </div>
        </div>

        {/* Buscador y Ordenar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar factura..."
              className="w-full bg-white border border-gray-300 rounded-xl py-2 pl-8 pr-3 text-xs placeholder:text-gray-400 focus:outline-none focus:border-sky-600"
            />
            <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button className="flex items-center gap-1 bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-700 hover:bg-gray-50">
            <span className="text-[10px]">⇅</span>
            <span>Ordenar</span>
          </button>
        </div>

        {/* Banner Informativo Bs / USD (Exacto a la captura 3) */}
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-start gap-2 text-sky-900 text-xs shadow-xs">
          <span className="text-sky-600 font-bold mt-0.5">ℹ️</span>
          <p className="leading-tight text-[11px]">
            Los montos se presentan en Bs y su equivalente en USD.
          </p>
        </div>

        {/* Lista de Facturas para Retención */}
        <div className="space-y-3">
          {facturasCliente.map(fac => {
            const isSelected = seleccionadas.includes(fac.id);
            const montoBs = fac.montoRetencionBs || (fac.montoRetencionUSD * TASA_BCV);
            const montoUSD = fac.montoRetencionUSD || (fac.montoRetencionBs / TASA_BCV);

            return (
              <div
                key={fac.id}
                className={`bg-white border rounded-2xl p-3.5 shadow-xs transition-all ${
                  isSelected ? 'border-sky-600 ring-2 ring-sky-500/20' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Checkbox y Número de Factura */}
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSeleccion(fac.id)}
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-sm text-gray-900 font-mono">
                        {fac.numero}
                      </p>
                      <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
                        <p>Emitido: <b>{fac.fechaEmision}</b></p>
                        <p>Vence: <b>{fac.fechaVencimiento}</b></p>
                      </div>
                    </div>
                  </div>

                  {/* Monto de Retención y Botón Editar */}
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Monto retención:</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="text-right">
                        <p className="text-sky-700 font-bold text-sm font-mono leading-tight">
                          {montoBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          $ {montoUSD.toFixed(2)}
                        </p>
                      </div>

                      {/* Botón de Edición (Lápiz) */}
                      <button
                        onClick={() => onEditarRetencion(fac)}
                        className="w-7 h-7 rounded-lg border border-sky-600 text-sky-600 hover:bg-sky-50 flex items-center justify-center transition-colors shadow-xs ml-1"
                        title="Modificar monto de retención"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Barra Inferior Fija para Registrar Pago (Exacto a Screen 3) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[320px] mx-auto bg-white border-t border-gray-200 p-3 shadow-xl z-30 space-y-2">
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
            Método de pago:
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-semibold text-gray-800">
            Comprobante de retención
          </div>
        </div>

        <div className="flex justify-between items-center text-xs pt-1">
          <span className="text-gray-600 font-medium">Saldo a pagar:</span>
          <span className="font-bold text-sm text-gray-900 font-mono">
            {totalRetencionBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
          </span>
        </div>

        {mensajeExito ? (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center font-bold text-xs animate-fadeIn">
            ✓ ¡Retención precargada con éxito!
          </div>
        ) : (
          <button
            onClick={handleRegistrarPago}
            disabled={seleccionadas.length === 0}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all text-center shadow-xs ${
              seleccionadas.length > 0
                ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Registrar pago
          </button>
        )}
      </div>

    </div>
  );
};

export default CargarRetencionesView;

