import React, { useState } from 'react';

const SaldoCuentaView = ({
  cliente,
  facturas,
  onVolver,
  onGenerarRecibo,
  onCargarRetenciones,
  onVerDetalleFactura,
  onAbrirModalEstado
}) => {
  const [tabFiltro, setTabFiltro] = useState('Todos'); // 'Todos' | 'Vencidas' | 'No vencidas'
  const [busqueda, setBusqueda] = useState('');

  const facturasCliente = facturas.filter(f => f.clienteId === cliente.id);

  const facturasFiltradas = facturasCliente.filter(f => {
    const coincideTexto = f.numero.includes(busqueda);
    if (!coincideTexto) return false;

    if (tabFiltro === 'Vencidas') return f.estado === 'Vencida';
    if (tabFiltro === 'No vencidas') return f.estado !== 'Vencida';
    return true;
  });

  const saldoTotalPorPagar = facturasCliente.reduce((acc, f) => acc + f.saldoUSD, 0);

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 pb-24 overflow-y-auto">
      
      {/* Barra Superior con botón volver */}
      <div className="bg-white p-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={onVolver}
          className="flex items-center gap-1.5 text-sky-700 hover:text-sky-800 text-xs font-bold"
        >
          <span className="text-base">←</span>
          <span>Saldo de cuenta</span>
        </button>

        {cliente.esAgenteRetencion && (
          <button
            onClick={onCargarRetenciones}
            className="text-[10px] bg-sky-50 border border-sky-300 text-sky-800 font-bold px-2 py-1 rounded-lg hover:bg-sky-100 transition-colors"
          >
            Cargar retenciones →
          </button>
        )}
      </div>

      <div className="p-3 space-y-3">
        
        {/* Ficha Resumen del Cliente (Exacto a la captura) */}
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
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
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

        {/* Pestañas de Filtro: Todos, Vencidas, No vencidas */}
        <div className="flex gap-1.5 border-b border-gray-200 pb-2">
          {[
            { id: 'Todos', label: 'Todos', dot: null },
            { id: 'Vencidas', label: 'Vencidas', dot: 'bg-red-500' },
            { id: 'No vencidas', label: 'No vencidas', dot: 'bg-emerald-500' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabFiltro(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                tabFiltro === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`}></span>}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listado de Facturas (Cards exactas a Screen 2) */}
        <div className="space-y-3">
          {facturasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No hay facturas en esta categoría.
            </div>
          ) : (
            facturasFiltradas.map(fac => {
              const esVencida = fac.estado === 'Vencida';

              return (
                <div
                  key={fac.id}
                  className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-xs space-y-2.5 hover:border-sky-300 transition-all"
                >
                  {/* Encabezado de Factura */}
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-900 font-mono">
                      {fac.numero}
                    </span>
                    <button
                      onClick={() => onVerDetalleFactura(fac)}
                      className="text-gray-400 hover:text-sky-600 p-1"
                      title="Ver detalle"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>

                  {esVencida && (
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                        Vencida
                      </span>
                    </div>
                  )}

                  {/* Datos de Fechas e Importes */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Emitido: <b>{fac.fechaEmision}</b></span>
                      <span className="text-gray-700">Importe: <b>${fac.importeUSD.toFixed(2)}</b></span>
                    </div>

                    <div className="flex justify-between">
                      <span className={esVencida ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        Vence: <b>{fac.fechaVencimiento}</b>
                      </span>
                      <span className={esVencida ? 'text-red-700 font-bold' : 'text-gray-900 font-bold'}>
                        Saldo: <b>${fac.saldoUSD.toFixed(2)}</b>
                      </span>
                    </div>
                  </div>

                  {/* Botón Detalle */}
                  <button
                    onClick={() => onVerDetalleFactura(fac)}
                    className="w-full py-2 border border-sky-600 text-sky-700 hover:bg-sky-50 rounded-xl text-xs font-bold transition-colors"
                  >
                    Detalle
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Barra Inferior Flotante de Acciones (Exacto a la captura 2) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[320px] mx-auto bg-white border-t border-gray-200 p-3 shadow-lg z-30 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600 font-medium">Saldo total por pagar:</span>
          <span className="text-emerald-600 font-bold text-sm font-mono">
            $ {saldoTotalPorPagar.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onGenerarRecibo}
            className="py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors text-center shadow-xs"
          >
            Generar recibo
          </button>

          <button
            onClick={onAbrirModalEstado}
            className="py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors text-center shadow-xs"
          >
            Generar Estado
          </button>
        </div>
      </div>

    </div>
  );
};

export default SaldoCuentaView;

