import React, { useState } from 'react';

const InicioCarteraView = ({
  clientes,
  saldoDepositoPendiente,
  onSeleccionarCliente,
  onIrADepositar
}) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [tabEstado, setTabEstado] = useState('Todos'); // 'Todos' | 'Críticos' | 'Alerta' | 'Sanos'
  const [zonaFiltro, setZonaFiltro] = useState('Todas');
  const [mostrarBadgeOrden, setMostrarBadgeOrden] = useState(true);

  // Filtrado de clientes
  const clientesFiltrados = clientes.filter(c => {
    const coincideTexto = c.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      c.codigo.includes(filtroTexto);

    let coincideEstado = true;
    if (tabEstado === 'Críticos') coincideEstado = c.estadoRiesgo === 'CRITICOS';
    else if (tabEstado === 'Alerta') coincideEstado = c.estadoRiesgo === 'ALERTA';
    else if (tabEstado === 'Sanos') coincideEstado = c.estadoRiesgo === 'SANOS';

    const coincideZona = zonaFiltro === 'Todas' || c.zona === zonaFiltro;

    return coincideTexto && coincideEstado && coincideZona;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-20 text-slate-800">

      {/* Barra de Búsqueda y Filtros Superiores */}
      <div className="bg-white p-3.5 border-b border-gray-200 space-y-2.5 sticky top-0 z-20 shadow-xs">

        {/* Buscador */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar cliente por nombre o có..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300/80 rounded-xl py-2 pl-9 pr-8 text-xs placeholder:text-gray-400 focus:outline-none focus:border-sky-600 focus:bg-white transition-all"
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
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
        </div>

        {/* Fila de Filtros de Zona y Orden */}
        <div className="flex gap-2 items-center text-xs">
          <div className="flex-1 relative">
            <select
              value={zonaFiltro}
              onChange={(e) => setZonaFiltro(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl py-1.5 px-3 text-xs text-gray-700 appearance-none focus:outline-none focus:border-sky-600"
            >
              <option value="Todas">Zona: Todas</option>
              <option value="Z075">Zona: Z075</option>
            </select>
            <span className="absolute right-2.5 top-2 pointer-events-none text-gray-400 text-[10px]">▼</span>
          </div>

          <button className="flex items-center gap-1 bg-white border border-gray-300 rounded-xl py-1.5 px-3 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
            <span className="text-[10px]">⇅</span>
            <span>Ordenar</span>
          </button>
        </div>

        {/* Pestañas de Estado de Riesgo */}
        <div className="flex gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'Todos', label: 'Todos', dot: null },
            { id: 'Críticos', label: 'Críticos', dot: 'bg-red-500' },
            { id: 'Alerta', label: 'Alerta', dot: 'bg-amber-400' },
            { id: 'Sanos', label: 'Sanos', dot: 'bg-emerald-500' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTabEstado(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${tabEstado === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`}></span>}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badge de Orden Activo */}
        {mostrarBadgeOrden && (
          <div className="flex items-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-gray-300 bg-white text-[10px] text-gray-600 font-medium">
              <span>Ordenar: Saldo vencido ↓</span>
              <button
                onClick={() => setMostrarBadgeOrden(false)}
                className="hover:text-gray-900 ml-1 font-bold"
              >
                ✕
              </button>
            </span>
          </div>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Banner de Depósito Pendiente (Exacto a la captura) */}
        {saldoDepositoPendiente > 0 && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-xs animate-fadeIn">
            <div className="flex items-start gap-2">
              <span className="text-sky-600 text-base mt-0.5">ℹ️</span>
              <p className="text-[11px] text-slate-700 leading-tight">
                Tienes pendiente registrar el depósito por un valor total de <b className="text-sky-950 font-bold">${saldoDepositoPendiente.toFixed(2)}</b>.
              </p>
            </div>
            <button
              onClick={onIrADepositar}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 transition-colors shadow-xs"
            >
              Depositar
            </button>
          </div>
        )}

        {/* Lista de Tarjetas de Clientes */}
        {clientesFiltrados.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            No se encontraron clientes con el criterio seleccionado.
          </div>
        ) : (
          clientesFiltrados.map(cli => {
            const esAlerta = cli.estadoRiesgo === 'ALERTA';
            const esCritico = cli.estadoRiesgo === 'CRITICOS';

            return (
              <div
                key={cli.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:border-sky-300 transition-all flex flex-col"
              >
                {/* Borde lateral de acento de riesgo */}
                <div className="flex border-l-4" style={{ borderColor: esCritico ? '#ef4444' : esAlerta ? '#f59e0b' : '#10b981' }}>
                  <div className="p-3.5 flex-1">

                    {/* Encabezado Cliente */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 leading-tight">
                          {cli.nombre}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                          {cli.codigo} {cli.zona}
                        </p>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${esCritico
                          ? 'bg-red-100 text-red-700'
                          : esAlerta
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                        {cli.estadoRiesgo}
                      </span>
                    </div>

                    {/* Bloque Financiero: Saldo Total vs Saldo Vencido */}
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs border border-gray-100 rounded-xl overflow-hidden">
                      <div className="p-2 bg-gray-50/70 border-r border-gray-100">
                        <p className="text-[9px] text-gray-400 font-semibold uppercase">SALDO TOTAL</p>
                        <p className="font-bold text-gray-900 mt-0.5">
                          ${cli.saldoTotal.toFixed(2)}
                        </p>
                      </div>

                      <div className={`p-2 ${cli.saldoVencido > 0 ? 'bg-red-50/70' : 'bg-gray-50/70'}`}>
                        <p className={`text-[9px] font-semibold uppercase ${cli.saldoVencido > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          SALDO VENCIDO
                        </p>
                        <p className={`font-bold mt-0.5 ${cli.saldoVencido > 0 ? 'text-red-700' : 'text-gray-800'}`}>
                          ${cli.saldoVencido.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Nota Fiscal de Retención */}
                    <div className="text-center my-2.5">
                      <span className="text-[10px] text-gray-400 tracking-wider font-semibold uppercase">
                        {cli.esAgenteRetencion ? 'ES AGENTE DE RETENCIÓN' : 'NO ES AGENTE DE RETENCIÓN'}
                      </span>
                    </div>

                    {/* Botón Acción Principal */}
                    <button
                      onClick={() => onSeleccionarCliente(cli)}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Gestionar cobro</span>
                      <span>→</span>
                    </button>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default InicioCarteraView;

