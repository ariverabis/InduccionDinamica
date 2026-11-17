import React, { useState } from 'react';

const ModalRegistrarPago = ({
  cliente,
  metodoSeleccionado,
  facturasSeleccionadasInfo, // array de { numero, baseMas25IVA, totalConDescuento, descuentoAplicado }
  totalAPagar, // e.g. 9.52
  descuentoTotal, // e.g. 1.42
  onConfirmarPago,
  onCancelar
}) => {
  const [fechaTransaccion, setFechaTransaccion] = useState('17/11/2026');
  const [montoPagar, setMontoPagar] = useState('10,00');
  const [observaciones, setObservaciones] = useState('');
  const [soporteAdjunto, setSoporteAdjunto] = useState(null); // 'camara' | 'galeria' | 'pdf'

  const montoNumerico = parseFloat(montoPagar.replace(',', '.')) || 0;
  const excedente = montoNumerico > totalAPagar ? (montoNumerico - totalAPagar) : 0;

  const handleAdjuntar = (tipo) => {
    setSoporteAdjunto({
      tipo,
      nombre: tipo === 'pdf' ? `soporte_cobranza_${cliente.codigo}.pdf` : `foto_billetes_10usd.jpg`,
      tamano: '143 KB'
    });
  };

  const handleRegistrar = () => {
    onConfirmarPago({
      cliente,
      metodo: metodoSeleccionado,
      fechaTransaccion,
      montoPagado: montoNumerico,
      totalRequerido: totalAPagar,
      excedente,
      observaciones,
      soporte: soporteAdjunto,
      facturas: facturasSeleccionadasInfo
    });
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden border border-gray-100 max-h-[92%] flex flex-col animate-slideUp">
        
        {/* Encabezado Modal (Exacto a Imagen 8.jpeg) */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-base font-bold text-gray-900">Registrar pago</h3>
          <span className="bg-sky-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {metodoSeleccionado?.moneda || 'USD'}
          </span>
        </div>

        {/* Contenido con Scroll Vertical (Exacto a Imágenes 8 y 9) */}
        <div className="p-3.5 space-y-3 overflow-y-auto text-xs flex-1">

          {/* Chip de Método de Pago Seleccionado */}
          <div className="bg-sky-50 border border-sky-100 text-sky-700 font-bold text-center py-2 px-3 rounded-xl text-xs">
            {metodoSeleccionado?.nombre || 'Deposito En Transito (USD)'}
          </div>

          {/* Tarjeta Resumen Cliente */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-1">
            <div className="flex justify-between items-start gap-1">
              <span className="font-bold text-gray-900 text-[11px] leading-tight truncate">
                {cliente.nombre} - 2...
              </span>
              <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0">
                {cliente.estadoRiesgo}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              {cliente.codigo} {cliente.zona}
            </p>
          </div>

          {/* Facturas a Pagar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-gray-600 font-bold text-[11px]">
              <span>Facturas a pagar:</span>
              <span>{facturasSeleccionadasInfo.length}</span>
            </div>
            {facturasSeleccionadasInfo.map((fac, idx) => (
              <div key={idx} className="flex justify-between text-gray-800 text-xs font-mono py-0.5">
                <span>{fac.numero}</span>
                <span className="font-bold">${fac.totalConDescuento.toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
          </div>

          {/* Descuentos Aplicados */}
          <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100">
            <span className="text-gray-600">Descuentos aplicados:</span>
            <span className="font-bold text-emerald-600 font-mono">
              $ {descuentoTotal.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Fecha de Transacción */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-600 block">Fecha de transacción</label>
            <div className="relative">
              <input
                type="text"
                value={fechaTransaccion}
                onChange={(e) => setFechaTransaccion(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:border-sky-600"
              />
              <svg className="w-4 h-4 text-sky-600 absolute right-3 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Monto a Pagar */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-600 block">Monto a pagar</label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-white focus-within:border-sky-600">
              <span className="text-gray-500 font-bold mr-2 text-sm">$</span>
              <input
                id="input-monto-a-pagar"
                type="text"
                value={montoPagar}
                onChange={(e) => setMontoPagar(e.target.value)}
                className="w-full text-right font-bold text-sky-700 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Alerta de Sobrepago Detectado (Exacto a Imagen 8 y 9) */}
          {excedente > 0 && (
            <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-3 flex items-start gap-2.5 text-amber-900 shadow-xs animate-fadeIn">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h5 className="font-bold text-amber-800 text-xs">Sobrepago detectado</h5>
                <p className="text-[10px] text-amber-700 mt-0.5 leading-snug">
                  Se generará un excedente de $ {excedente.toFixed(2).replace('.', ',')} como saldo a favor.
                </p>
              </div>
            </div>
          )}

          {/* Campo Observaciones */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-600 block">Observaciones</label>
            <input
              type="text"
              placeholder="Escribe una observación (opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-sky-600"
            />
          </div>

          {/* Adjunto de Soporte (Exacto a Imagen 9.jpeg) */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-semibold text-gray-600 block">Adjunto de soporte (Opcional):</label>
            <div className="border border-gray-200 rounded-2xl p-3 bg-white space-y-2">
              <p className="text-[10px] font-bold text-gray-700 text-center">
                Adjuntar imagen o PDF del comprobante
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="btn-adjunto-camara"
                  onClick={() => handleAdjuntar('camara')}
                  className={`border rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    soporteAdjunto?.tipo === 'camara' ? 'border-sky-600 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[9px] font-bold">Cámara</span>
                </button>

                <button
                  type="button"
                  id="btn-adjunto-galeria"
                  onClick={() => handleAdjuntar('galeria')}
                  className={`border rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    soporteAdjunto?.tipo === 'galeria' ? 'border-sky-600 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[9px] font-bold">Galería</span>
                </button>

                <button
                  type="button"
                  id="btn-adjunto-pdf"
                  onClick={() => handleAdjuntar('pdf')}
                  className={`border rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    soporteAdjunto?.tipo === 'pdf' ? 'border-sky-600 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-[9px] font-bold">PDF</span>
                </button>
              </div>

              {soporteAdjunto && (
                <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-2 flex items-center justify-between text-[10px] text-sky-800">
                  <span className="font-semibold truncate">{soporteAdjunto.nombre}</span>
                  <span className="text-gray-400 font-mono ml-2 shrink-0">{soporteAdjunto.tamano}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Botones de Acción (Exacto a Imagen 8 y 9) */}
        <div className="p-3 border-t border-gray-100 flex gap-2 shrink-0 bg-white">
          <button
            onClick={onCancelar}
            className="flex-1 py-2.5 rounded-xl border border-sky-600 text-sky-600 hover:bg-sky-50 font-bold text-xs transition-colors"
          >
            Cancelar
          </button>
          <button
            id="btn-modal-confirmar-pago"
            onClick={handleRegistrar}
            className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Registrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalRegistrarPago;
