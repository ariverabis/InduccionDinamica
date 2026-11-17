import React, { useState } from 'react';
import { TASA_BCV } from '../data/mockCobranzasAFV2';

const ModalEditarRetencion = ({ factura, onGuardar, onClose }) => {
  const [montoBs, setMontoBs] = useState(factura?.montoRetencionBs || (factura?.montoRetencionUSD * TASA_BCV).toFixed(2));
  const [montoUSD, setMontoUSD] = useState(factura?.montoRetencionUSD || (montoBs / TASA_BCV).toFixed(2));
  const [porcentaje, setPorcentaje] = useState('75%');

  if (!factura) return null;

  const handleBsChange = (val) => {
    setMontoBs(val);
    const num = parseFloat(val) || 0;
    setMontoUSD((num / TASA_BCV).toFixed(2));
  };

  const handleUSDChange = (val) => {
    setMontoUSD(val);
    const num = parseFloat(val) || 0;
    setMontoBs((num * TASA_BCV).toFixed(2));
  };

  const handleAplicarPorcentaje = (pct) => {
    setPorcentaje(pct);
    const factor = pct === '100%' ? 1.0 : 0.75;
    const nuevoUSD = (factura.ivaUSD * factor).toFixed(2);
    setMontoUSD(nuevoUSD);
    setMontoBs((nuevoUSD * TASA_BCV).toFixed(2));
  };

  const handleGuardar = () => {
    onGuardar({
      ...factura,
      montoRetencionUSD: parseFloat(montoUSD) || 0,
      montoRetencionBs: parseFloat(montoBs) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        
        {/* Cabecera */}
        <div className="p-4 bg-sky-700 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
              MODIFICAR MONTO RETENCIÓN
            </span>
            <p className="text-xs font-bold mt-1">Factura #{factura.numero}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-4 space-y-4 text-xs">
          <div className="bg-sky-50 border border-sky-100 p-2.5 rounded-xl text-sky-900 text-[11px] leading-snug">
            Ajuste el valor para que coincida exactamente con el comprobante físico de retención entregado por el cliente.
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Porcentaje Legal de Retención:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAplicarPorcentaje('75%')}
                className={`py-1.5 rounded-lg border font-bold text-xs transition-colors ${
                  porcentaje === '75%'
                    ? 'border-sky-600 bg-sky-50 text-sky-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                75% Ordinario
              </button>
              <button
                type="button"
                onClick={() => handleAplicarPorcentaje('100%')}
                className={`py-1.5 rounded-lg border font-bold text-xs transition-colors ${
                  porcentaje === '100%'
                    ? 'border-sky-600 bg-sky-50 text-sky-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                100% Especial
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Monto Retenido en Bolívares (Bs.):
            </label>
            <input
              type="number"
              step="0.01"
              value={montoBs}
              onChange={(e) => handleBsChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 font-mono font-bold text-sm text-gray-900 focus:outline-none focus:border-sky-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Equivalente en Divisas ($ USD):
            </label>
            <input
              type="number"
              step="0.01"
              value={montoUSD}
              onChange={(e) => handleUSDChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-300 font-mono font-bold text-sm text-gray-900 focus:outline-none focus:border-sky-600"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Tasa referencial aplicada: <b>Bs. {TASA_BCV.toFixed(2)}</b>
            </p>
          </div>
        </div>

        {/* Pie */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Guardar Monto
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarRetencion;

