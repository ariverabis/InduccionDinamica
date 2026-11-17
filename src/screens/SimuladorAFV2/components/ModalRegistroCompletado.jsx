import React from 'react';

const ModalRegistroCompletado = ({
  pagoInfo, // { facturasCount, montoPagado, fechaPago }
  onCerrar
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden p-6 text-center space-y-4 border border-gray-100 animate-slideUp">
        
        {/* Círculo Verde con Check (Exacto a Imagen 10.jpeg) */}
        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
          <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Título de Confirmación */}
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          ¡Registro completado!
        </h3>

        {/* Cuadro de Resumen de Pago */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5 text-xs text-left">
          <div className="flex justify-between items-center text-gray-600">
            <span>Facturas pagadas:</span>
            <span className="font-bold text-gray-900 font-mono text-sm">
              {pagoInfo?.facturasCount || 1}
            </span>
          </div>

          <div className="flex justify-between items-center text-gray-600 border-t border-gray-200/60 pt-2">
            <span>Monto pagado:</span>
            <span className="font-bold text-emerald-600 font-mono text-sm">
              $ {(pagoInfo?.montoPagado || 10.00).toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="flex justify-between items-center text-gray-600 border-t border-gray-200/60 pt-2">
            <span>Fecha de pago:</span>
            <span className="font-bold text-gray-900 font-mono">
              {pagoInfo?.fechaPago || '17/11/2026'}
            </span>
          </div>
        </div>

        {/* Botón Cerrar (Dispara la pantalla de Gmail) */}
        <button
          id="btn-cerrar-registro-completado"
          onClick={onCerrar}
          className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          Cerrar
        </button>

      </div>
    </div>
  );
};

export default ModalRegistroCompletado;
