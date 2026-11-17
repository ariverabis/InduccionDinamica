import React, { useState } from 'react';
import { TASA_BCV } from '../data/mockCobranzasAFV2';

const GenerarReciboView = ({
  cliente,
  facturas,
  onVolver,
  onReciboGeneradoExitosamente
}) => {
  const facturasCliente = facturas.filter(f => f.clienteId === cliente.id);
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState(facturasCliente.map(f => f.id));
  const [metodoPago, setMetodoPago] = useState('Transferencia Bancaria');
  const [bancoDestino, setBancoDestino] = useState('Banesco Banco Universal');
  const [referencia, setReferencia] = useState('TRF-' + Math.floor(100000 + Math.random() * 900000));
  const [procesando, setProcesando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  const toggleFactura = (id) => {
    setFacturasSeleccionadas(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const facturasPagar = facturasCliente.filter(f => facturasSeleccionadas.includes(f.id));
  const totalUSD = facturasPagar.reduce((acc, f) => acc + f.saldoUSD, 0);
  const totalBs = totalUSD * TASA_BCV;

  const handleConfirmarRecibo = () => {
    if (facturasSeleccionadas.length === 0) return;
    setProcesando(true);

    setTimeout(() => {
      setProcesando(false);
      setMensajeExito(true);

      setTimeout(() => {
        onReciboGeneradoExitosamente({
          clienteId: cliente.id,
          clienteNombre: cliente.nombre,
          facturasIds: facturasSeleccionadas,
          montoUSD: totalUSD,
          montoBs: totalBs,
          metodo: metodoPago,
          referencia: referencia,
          tasaCambio: TASA_BCV
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
          <span>Generar Recibo de Cobro</span>
        </button>
      </div>

      <div className="p-3 space-y-3 text-xs">
        
        {/* Cliente */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-xs">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Cliente:</p>
          <p className="font-bold text-gray-900 text-xs">{cliente.nombre}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{cliente.codigo} | {cliente.rif}</p>
        </div>

        {/* Facturas a Cancelar */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-xs space-y-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Seleccionar Facturas a Cancelar:
          </p>
          <div className="space-y-2">
            {facturasCliente.map(fac => {
              const isSelected = facturasSeleccionadas.includes(fac.id);
              return (
                <div
                  key={fac.id}
                  onClick={() => toggleFactura(fac.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected ? 'border-sky-600 bg-sky-50/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-sky-600 pointer-events-none"
                    />
                    <div>
                      <p className="font-bold text-gray-900 font-mono text-xs">#{fac.numero}</p>
                      <p className="text-[10px] text-gray-400">Vence: {fac.fechaVencimiento}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sky-700 font-mono">${fac.saldoUSD.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Datos del Pago */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-xs space-y-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Instrumento de Pago:
          </p>

          <div>
            <label className="text-[10px] text-gray-500 block mb-1 font-semibold">Método de Cobro:</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-sky-600"
            >
              <option value="Transferencia Bancaria">Transferencia Bancaria (VES)</option>
              <option value="Efectivo Divisas">Efectivo Divisas ($ USD)</option>
              <option value="Depósito Bancario">Depósito Bancario Directo</option>
              <option value="Pago Móvil">Pago Móvil Interbancario</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 block mb-1 font-semibold">Banco Destino:</label>
            <select
              value={bancoDestino}
              onChange={(e) => setBancoDestino(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-sky-600"
            >
              <option value="Banesco Banco Universal">Banesco Banco Universal</option>
              <option value="Banco Mercantil">Banco Mercantil</option>
              <option value="Banco Provincial (BBVA)">Banco Provincial (BBVA)</option>
              <option value="BNC (Banco Nacional de Crédito)">BNC (Banco Nacional de Crédito)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 block mb-1 font-semibold">N° Referencia / Comprobante:</label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 font-mono text-xs font-bold focus:outline-none focus:border-sky-600"
            />
          </div>

          {/* Tasa y montos */}
          <div className="p-2.5 bg-gray-100 rounded-xl text-center space-y-1">
            <p className="text-[10px] text-gray-500">Tasa Oficial del Día: <b>Bs. {TASA_BCV.toFixed(2)}</b></p>
            <div className="flex justify-between items-center text-xs font-bold text-gray-800 pt-1 border-t border-gray-200">
              <span>Total a cobrar:</span>
              <span className="text-emerald-700 text-sm font-mono">${totalUSD.toFixed(2)}</span>
            </div>
            <p className="text-right text-[11px] font-mono text-gray-600">
              ({totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.)
            </p>
          </div>
        </div>

      </div>

      {/* Barra de Emisión Fija */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[320px] mx-auto bg-white border-t border-gray-200 p-3 shadow-xl z-30">
        {mensajeExito ? (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center font-bold text-xs animate-fadeIn">
            ✓ ¡Recibo emitido con éxito!
          </div>
        ) : (
          <button
            onClick={handleConfirmarRecibo}
            disabled={facturasSeleccionadas.length === 0 || procesando}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all text-center shadow-xs ${
              facturasSeleccionadas.length > 0 && !procesando
                ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {procesando ? 'Procesando Recibo...' : `Emitir Recibo ($${totalUSD.toFixed(2)})`}
          </button>
        )}
      </div>

    </div>
  );
};

export default GenerarReciboView;

