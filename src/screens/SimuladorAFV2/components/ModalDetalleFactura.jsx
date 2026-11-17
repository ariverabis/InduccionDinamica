import React, { useState } from 'react';

const ModalDetalleFactura = ({ factura, onClose }) => {
  const [tabActiva, setTabActiva] = useState('articulos'); // 'articulos' | 'asientos'

  if (!factura) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border border-gray-200">
        
        {/* Cabecera */}
        <div className="p-4 bg-sky-700 text-white flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                FACTURA #{factura.numero}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${factura.estado === 'Vencida' ? 'bg-red-500 text-white' : 'bg-amber-400 text-amber-950'}`}>
                {factura.estado}
              </span>
            </div>
            <p className="text-xs font-semibold mt-1 truncate max-w-[240px]">
              {factura.clienteNombre}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Resumen Financiero */}
        <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 p-2.5 text-center text-xs">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium">Emitido</p>
            <p className="font-semibold text-gray-800">{factura.fechaEmision}</p>
          </div>
          <div className="border-x border-gray-200">
            <p className="text-[10px] text-gray-400 uppercase font-medium">Importe</p>
            <p className="font-bold text-gray-900">${factura.importeUSD.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium">Saldo</p>
            <p className={`font-bold ${factura.saldoUSD > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${factura.saldoUSD.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Selector de Pestañas: Artículos vs Asientos Contables */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setTabActiva('articulos')}
            className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
              tabActiva === 'articulos'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Artículos Facturados ({factura.articulos?.length || 0})
          </button>
          <button
            onClick={() => setTabActiva('asientos')}
            className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
              tabActiva === 'asientos'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Asientos Contables
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-3 overflow-y-auto flex-1 space-y-2 text-xs">
          {tabActiva === 'articulos' ? (
            <div className="space-y-2">
              {factura.articulos?.map((art, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-gray-200 bg-gray-50/60 hover:bg-white transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-sky-700 font-bold bg-sky-100/70 px-1.5 py-0.5 rounded">
                      {art.codigo}
                    </span>
                    <span className="font-bold text-gray-800">${art.subtotal.toFixed(2)}</span>
                  </div>
                  <p className="font-medium text-gray-800 mt-1">{art.descripcion}</p>
                  <div className="flex justify-between items-center text-[11px] text-gray-500 mt-1.5 pt-1.5 border-t border-gray-100">
                    <span>Cant: <b>{art.cantidad}</b> unid.</span>
                    <span>P. Unit: <b>${art.precioUnitario.toFixed(2)}</b></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] text-amber-900 leading-tight">
                Asiento contable originado por facturación mercantil según catálogo de cuentas BIS.
              </div>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-[11px] border-collapse">
                  <thead className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2 text-left">Cuenta</th>
                      <th className="p-2 text-right">Debe ($)</th>
                      <th className="p-2 text-right">Haber ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {factura.asientosContables?.map((asiento, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 text-gray-800 font-medium leading-tight">
                          {asiento.cuenta}
                        </td>
                        <td className="p-2 text-right font-mono font-semibold text-gray-900">
                          {asiento.debe > 0 ? `$${asiento.debe.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-2 text-right font-mono font-semibold text-gray-900">
                          {asiento.haber > 0 ? `$${asiento.haber.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold text-gray-900 border-t border-gray-200 text-[11px]">
                    <tr>
                      <td className="p-2 text-right">Totales:</td>
                      <td className="p-2 text-right font-mono text-sky-700">
                        ${factura.asientosContables?.reduce((acc, c) => acc + c.debe, 0).toFixed(2)}
                      </td>
                      <td className="p-2 text-right font-mono text-sky-700">
                        ${factura.asientosContables?.reduce((acc, c) => acc + c.haber, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Pie con botón cerrar */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleFactura;

