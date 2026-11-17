import React, { useState } from 'react';
import { TASA_BCV } from '../data/mockCobranzasAFV2';

const RegistrarDepositoView = ({
  montoSugerido,
  onVolver,
  onDepositoRegistradoExitosamente
}) => {
  const [bancoReceptor, setBancoReceptor] = useState('Banesco Banco Universal (Cuenta Recaudadora)');
  const [bancoEmisor, setBancoEmisor] = useState('Depósito en Taquilla');
  const [numeroPlanilla, setNumeroPlanilla] = useState('PLN-' + Math.floor(100000 + Math.random() * 900000));
  const [montoUSD, setMontoUSD] = useState(montoSugerido.toFixed(2));
  const [procesando, setProcesando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  const montoBs = (parseFloat(montoUSD) || 0) * TASA_BCV;

  const handleConfirmarDeposito = () => {
    if (!numeroPlanilla || parseFloat(montoUSD) <= 0) return;
    setProcesando(true);

    setTimeout(() => {
      setProcesando(false);
      setMensajeExito(true);

      setTimeout(() => {
        onDepositoRegistradoExitosamente({
          bancoReceptor,
          bancoEmisor,
          numeroPlanilla,
          montoUSD: parseFloat(montoUSD),
          montoBs: montoBs,
          fechaDeposito: new Date().toLocaleDateString('es-VE')
        });
      }, 1200);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 pb-28 overflow-y-auto">
      
      {/* Barra Superior */}
      <div className="bg-white p-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={onVolver}
          className="flex items-center gap-1.5 text-sky-700 hover:text-sky-800 text-xs font-bold"
        >
          <span className="text-base">←</span>
          <span>Relación de Depósito</span>
        </button>
      </div>

      <div className="p-3 space-y-3 text-xs">
        
        {/* Banner Informativo */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-900 space-y-1">
          <p className="font-bold text-xs">Aseguramiento de Liquidez y Flujo de Caja</p>
          <p className="text-[11px] leading-relaxed">
            Registre la planilla bancaria o referencia de depósito para cerrar el ciclo de custodia de efectivo recaudado.
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-xs space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 block mb-1 font-semibold uppercase">Banco Recaudador Destino:</label>
            <select
              value={bancoReceptor}
              onChange={(e) => setBancoReceptor(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-sky-600"
            >
              <option value="Banesco Banco Universal (Cuenta Recaudadora)">Banesco Banco Universal (Cuenta Recaudadora)</option>
              <option value="Banco Mercantil (Cta Corriente)">Banco Mercantil (Cta Corriente)</option>
              <option value="Banco Provincial (Cta Recaudación)">Banco Provincial (Cta Recaudación)</option>
              <option value="BNC (Banco Nacional de Crédito)">BNC (Banco Nacional de Crédito)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 block mb-1 font-semibold uppercase">Tipo de Ingreso:</label>
            <select
              value={bancoEmisor}
              onChange={(e) => setBancoEmisor(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-sky-600"
            >
              <option value="Depósito en Taquilla">Depósito en Efectivo en Taquilla</option>
              <option value="Depósito de Cheque de Gerencia">Depósito de Cheque de Gerencia</option>
              <option value="Transferencia Conciliada">Transferencia de Tercero Conciliada</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 block mb-1 font-semibold uppercase">N° Planilla / Referencia Bancaria:</label>
            <input
              type="text"
              value={numeroPlanilla}
              onChange={(e) => setNumeroPlanilla(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-mono text-xs font-bold focus:outline-none focus:border-sky-600"
              placeholder="Ej: PLN-884910"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 block mb-1 font-semibold uppercase">Monto a Depositar ($ USD):</label>
            <input
              type="number"
              step="0.01"
              value={montoUSD}
              onChange={(e) => setMontoUSD(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-mono text-sm font-bold text-sky-700 focus:outline-none focus:border-sky-600"
            />
            <p className="text-[11px] text-gray-400 mt-1 font-mono">
              Equivalente oficial: {montoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
            </p>
          </div>
        </div>

      </div>

      {/* Barra de Guardado */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[320px] mx-auto bg-white border-t border-gray-200 p-3 shadow-xl z-30">
        {mensajeExito ? (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center font-bold text-xs animate-fadeIn">
            ✓ ¡Depósito bancario registrado con éxito!
          </div>
        ) : (
          <button
            onClick={handleConfirmarDeposito}
            disabled={!numeroPlanilla || parseFloat(montoUSD) <= 0 || procesando}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all text-center shadow-xs ${
              numeroPlanilla && parseFloat(montoUSD) > 0 && !procesando
                ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {procesando ? 'Registrando Depósito...' : `Confirmar Depósito ($${parseFloat(montoUSD || 0).toFixed(2)})`}
          </button>
        )}
      </div>

    </div>
  );
};

export default RegistrarDepositoView;

