import React, { useState } from 'react';

const GmailShareView = ({
  cliente,
  pagoInfo, // { facturasCount, montoPagado, fechaPago, facturas }
  onVolver,
  onEnviarExitoso
}) => {
  const [destinatarioSeleccionado, setDestinatarioSeleccionado] = useState('arivera@mayoreo.biz');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const numeroRecibo = '00043';
  const fechaHoy = pagoInfo?.fechaPago || '17-11-2026';
  const montoCobrado = (pagoInfo?.montoPagado || 10.00).toFixed(2).replace('.', ',');

  const asunto = `Zona: ${cliente?.zona || 'Z075'} - Recibo: ${numeroRecibo} - Fecha: ${fechaHoy} - Cliente: 25-50-266 - Monto: ${montoCobrado}`;

  const handleEnviar = () => {
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      setTimeout(() => {
        onEnviarExitoso();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1b1c1e] text-gray-200 overflow-y-auto">
      
      {/* Barra Superior Gmail Dark Theme (Exacto a Imagen 11.jpeg) */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-gray-800 shrink-0 bg-[#1b1c1e]">
        <button
          onClick={onVolver}
          className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <button className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Botón Enviar (Avión de papel) */}
          <button
            id="btn-gmail-enviar"
            onClick={handleEnviar}
            disabled={enviando || enviado}
            className="text-sky-400 hover:text-sky-300 p-1.5 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Enviar recibo"
          >
            <svg className="w-5 h-5 transform rotate-45 -translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>

          <button className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notificación de Envío */}
      {enviando && (
        <div className="bg-sky-600 text-white text-xs font-bold text-center py-2 animate-pulse">
          Enviando recibo y soportes adjuntos...
        </div>
      )}
      {enviado && (
        <div className="bg-emerald-600 text-white text-xs font-bold text-center py-2 animate-fadeIn">
          Recibo enviado exitosamente por correo electrónico.
        </div>
      )}

      {/* Campos de Correo */}
      <div className="p-3.5 space-y-3 text-xs flex-1">

        {/* Remitente */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 w-10 font-medium">De</span>
            <span className="text-gray-200 font-mono text-[11px]">coachafvmayoreo@gmail.com</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Destinatario */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 w-10 font-medium">Para</span>
            <span className="text-sky-300 font-mono text-[11px] truncate">{destinatarioSeleccionado}</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Sugerencias de Contactos (Exacto a Imagen 11.jpeg) */}
        <div className="space-y-1.5 py-1">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span>Sugerencias</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto py-1">
            {/* Contacto 1 */}
            <button
              onClick={() => setDestinatarioSeleccionado('scardi@gmail.com')}
              className="flex flex-col items-center gap-1 group text-center shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-blue-900 border border-blue-500/40 text-blue-200 font-bold flex items-center justify-center text-xs">
                RB
              </div>
              <span className="text-[9px] text-gray-300 leading-tight">RiveraBi</span>
              <span className="text-[8px] text-gray-500 font-mono">scardi@g...</span>
            </button>

            {/* Contacto 2 */}
            <button
              onClick={() => setDestinatarioSeleccionado('coach01@mayoreo.biz')}
              className="flex flex-col items-center gap-1 group text-center shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center text-xs">
                C
              </div>
              <span className="text-[9px] text-gray-300 leading-tight">Coach 01</span>
              <span className="text-[8px] text-gray-500 font-mono">Mayoreo</span>
            </button>

            {/* Contacto 3 (Activo) */}
            <button
              onClick={() => setDestinatarioSeleccionado('arivera@mayoreo.biz')}
              className="flex flex-col items-center gap-1 group text-center shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs shadow-md">
                <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-[9px] text-gray-300 leading-tight">arivera@</span>
              <span className="text-[8px] text-gray-500 font-mono">mayoreo.biz</span>
            </button>
          </div>
        </div>

        {/* Asunto (Exacto a Imagen 11.jpeg) */}
        <div className="border-b border-gray-800 pb-2">
          <p className="text-xs text-gray-100 font-medium leading-relaxed font-mono">
            {asunto}
          </p>
        </div>

        {/* Cuerpo del Mensaje (Exacto a Imagen 11.jpeg) */}
        <div className="space-y-3 py-2 text-xs text-gray-300 leading-relaxed font-sans">
          <p>
            <b>Cliente:</b> {cliente?.codigo || '2550266'} - {cliente?.nombre || 'COMERCIALIZADORA & FERRETERIA UNIVERSO, C.A'}
          </p>
          <p>
            <b>Fecha de Emisión:</b> {fechaHoy}
          </p>
          <p>
            <b>Monto Total Cobrado:</b> $ {montoCobrado}
          </p>
          <p>
            <b>Facturas Afectadas:</b> {pagoInfo?.facturasCount || 1}
          </p>

          <p className="font-mono text-sky-400 font-bold pt-1">
            07087080 - $ 9,52
          </p>

          <p className="text-gray-400 pt-2 text-[11px]">
            Adjunto encontrará el soporte del recibo de cobro registrado.
          </p>
        </div>

        {/* Adjunto de Soporte PDF (Exacto a Imagen 11.jpeg) */}
        <div className="pt-3">
          <div className="bg-[#2c2d30] border border-gray-700 rounded-xl p-3 flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="bg-red-700 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">
                PDF
              </span>
              <div>
                <p className="text-gray-200 font-mono text-[11px] font-semibold truncate max-w-[170px]">
                  {cliente?.codigo || '2550266'}-recibo:...111700043.pdf
                </p>
                <p className="text-[9px] text-gray-400">143 KB</p>
              </div>
            </div>

            <button className="text-gray-400 hover:text-white p-1">
              ✕
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default GmailShareView;
