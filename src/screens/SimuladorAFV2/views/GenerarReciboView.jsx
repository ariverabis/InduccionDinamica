import React, { useState, useEffect } from 'react';
import { METODOS_PAGO_AFV2, TASA_BCV } from '../data/mockCobranzasAFV2';
import ModalRegistrarPago from '../components/ModalRegistrarPago';
import ModalRegistroCompletado from '../components/ModalRegistroCompletado';

const GenerarReciboView = ({
  cliente,
  facturas,
  metodoInicial,
  onVolver,
  onAbrirModalMetodos,
  onAbrirGmailShare,
  onReciboCompletado
}) => {
  const facturasCliente = facturas.filter(f => f.clienteId === cliente.id);

  // Método de pago activo con descuento
  const [metodoActivo, setMetodoActivo] = useState(
    metodoInicial || METODOS_PAGO_AFV2.find(m => m.id === 'dep_transito_usd') || METODOS_PAGO_AFV2[1]
  );

  // Switch Pagar Manual (Default OFF = Automático)
  const [pagarManual, setPagarManual] = useState(false);

  // Botón superior "Base + 25% IVA" (Azul = activo, Blanco = inactivo)
  const [btnBase25Activo, setBtnBase25Activo] = useState(true);

  // Botón superior "Retención" (Azul = activo, Gris = inhabilitado si no es agente)
  const esAgente = cliente.esAgenteRetencion;
  const [btnRetencionActivo, setBtnRetencionActivo] = useState(false);

  // Estado de selección por factura: { [facId]: { base: boolean, ret: boolean } }
  const [seleccionFacturas, setSeleccionFacturas] = useState({});

  // Buscador de facturas
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [mostrarModalRegistrarPago, setMostrarModalRegistrarPago] = useState(false);
  const [mostrarModalCompletado, setMostrarModalCompletado] = useState(false);
  const [resumenPagoGenerado, setResumenPagoGenerado] = useState(null);

  // Inicializar selecciones al cargar o al cambiar de cliente
  useEffect(() => {
    const inicial = {};
    facturasCliente.forEach((fac, idx) => {
      // Por defecto para el ejercicio: todas marcadas si btnBase25Activo es true
      inicial[fac.id] = {
        base: btnBase25Activo,
        ret: false
      };
    });
    setSeleccionFacturas(inicial);
  }, [facturasCliente.length]);

  // Manejar click en botón superior "Base + 25% IVA"
  const handleToggleTodoBase25 = () => {
    const nuevoEstado = !btnBase25Activo;
    setBtnBase25Activo(nuevoEstado);
    setSeleccionFacturas(prev => {
      const actualizado = { ...prev };
      facturasCliente.forEach(f => {
        actualizado[f.id] = {
          ...actualizado[f.id],
          base: nuevoEstado
        };
      });
      return actualizado;
    });
  };

  // Manejar click en botón superior "Retención"
  const handleToggleTodoRetencion = () => {
    if (!esAgente) return;
    const nuevoEstado = !btnRetencionActivo;
    setBtnRetencionActivo(nuevoEstado);
    setSeleccionFacturas(prev => {
      const actualizado = { ...prev };
      facturasCliente.forEach(f => {
        actualizado[f.id] = {
          ...actualizado[f.id],
          ret: nuevoEstado
        };
      });
      return actualizado;
    });
  };

  // Toggle individual de checkbox Base
  const handleToggleBaseItem = (facId) => {
    setSeleccionFacturas(prev => ({
      ...prev,
      [facId]: {
        ...prev[facId],
        base: !prev[facId]?.base
      }
    }));
  };

  // Toggle individual de checkbox Retención
  const handleToggleRetItem = (facId) => {
    if (!esAgente) return;
    setSeleccionFacturas(prev => ({
      ...prev,
      [facId]: {
        ...prev[facId],
        ret: !prev[facId]?.ret
      }
    }));
  };

  // Cálculo de Subtotal y Descuento
  let subtotalCalculado = 0;
  const facturasSeleccionadasInfo = [];

  facturasCliente.forEach(fac => {
    const sel = seleccionFacturas[fac.id];
    let montoFac = 0;
    if (sel?.base) {
      montoFac += (fac.baseMas25IVA || 10.94);
    }
    if (sel?.ret && esAgente) {
      montoFac += (fac.retencionMonto || 14.69);
    }

    if (montoFac > 0) {
      subtotalCalculado += montoFac;
      const descPorc = metodoActivo?.descuento || 13;
      const descuentoFac = montoFac * (descPorc / 100);
      const totalFacConDesc = montoFac - descuentoFac;

      facturasSeleccionadasInfo.push({
        id: fac.id,
        numero: fac.numero,
        montoBruto: montoFac,
        descuentoAplicado: descuentoFac,
        totalConDescuento: totalFacConDesc
      });
    }
  });

  const porcentajeDescuento = metodoActivo?.descuento || 13;
  const descuentoTotal = subtotalCalculado * (porcentajeDescuento / 100);
  const totalAPagar = Math.max(0, subtotalCalculado - descuentoTotal);

  // Proceder a Registrar Pago (Abre ModalRegistrarPago)
  const handleAbrirModalRegistro = () => {
    if (totalAPagar <= 0) return;
    setMostrarModalRegistrarPago(true);
  };

  // Confirmar Pago en el Modal
  const handleConfirmarPago = (datosPago) => {
    setMostrarModalRegistrarPago(false);
    setResumenPagoGenerado({
      facturasCount: facturasSeleccionadasInfo.length,
      montoPagado: datosPago.montoPagado || 10.00,
      fechaPago: datosPago.fechaTransaccion || '17/11/2026',
      facturas: facturasSeleccionadasInfo
    });
    setMostrarModalCompletado(true);
  };

  // Al cerrar el modal de completado -> Abrir pantalla Gmail
  const handleCerrarModalCompletado = () => {
    setMostrarModalCompletado(false);
    onAbrirGmailShare(resumenPagoGenerado);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-hidden">
      
      {/* Barra Superior Header (Exacto a Imagen 4.jpeg) */}
      <div className="bg-white p-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={onVolver}
          className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 text-xs font-bold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-semibold">Recibo de cobro</span>
        </button>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">

        {/* Ficha Cliente */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="flex border-l-4 border-amber-500">
            <div className="p-3 flex-1">
              <div className="flex justify-between items-start gap-1">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-snug">
                    {cliente.nombre} - {cliente.codigo}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                    {cliente.codigo} {cliente.zona}
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                  {cliente.estadoRiesgo}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Buscador de Facturas y Ordenar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar factura"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl py-2 pl-8 pr-3 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-sky-600"
            />
            <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button className="flex items-center gap-1 bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs text-gray-700 hover:bg-gray-50 shrink-0">
            <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Ordenar</span>
          </button>
        </div>

        {/* Botones de Selección Masiva: Base + 25% IVA & Retención (Exacto a Imagen 4, 5, 6) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Botón Base + 25% IVA */}
          <button
            id="btn-toggle-base-25"
            onClick={handleToggleTodoBase25}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
              btnBase25Activo
                ? 'bg-sky-500 border-sky-500 text-white shadow-xs'
                : 'bg-white border-sky-500 text-sky-600 hover:bg-sky-50/50'
            }`}
          >
            Base + 25% IVA
          </button>

          {/* Botón Retención (Gris e inhabilitado si no es agente de retención) */}
          <button
            id="btn-toggle-retencion"
            onClick={handleToggleTodoRetencion}
            disabled={!esAgente}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
              !esAgente
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                : btnRetencionActivo
                  ? 'bg-sky-500 border-sky-500 text-white shadow-xs'
                  : 'bg-white border-sky-500 text-sky-600 hover:bg-sky-50/50'
            }`}
          >
            Retención
          </button>
        </div>

        {/* Switch Pagar Manual (Alineado a la derecha debajo de los botones, Imagen 4) */}
        <div className="flex items-center justify-end gap-2 pt-0.5 pb-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pagarManual}
              onChange={() => setPagarManual(!pagarManual)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
          <span className="text-[11px] font-bold text-sky-600">Pagar manual</span>
        </div>

        {/* Tarjetas de Facturas (Exacto a Imagen 4, 5, 6) */}
        <div className="space-y-3">
          {facturasCliente.map((fac) => {
            const sel = seleccionFacturas[fac.id] || { base: false, ret: false };
            const baseAmount = fac.baseMas25IVA || 10.94;
            const retAmount = fac.retencionMonto || 14.69;

            return (
              <div
                key={fac.id}
                className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-xs space-y-3 hover:border-sky-300 transition-all"
              >
                {/* Header de Factura */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-gray-900 font-mono">
                        {fac.numero}
                      </span>
                      <span className="text-[8px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                        {fac.portal || 'PORTALD'}
                      </span>
                    </div>

                    {/* Chip de Forma de Pago y Descuento */}
                    <div className="mt-1">
                      <span className="inline-block bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                        {metodoActivo.descuento}% Forma de Pago
                      </span>
                    </div>
                  </div>

                  {/* Importe y Saldo */}
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">
                      Importe <span className="font-bold text-gray-900 font-mono">${fac.importeUSD.toFixed(2).replace('.', ',')}</span>
                    </p>
                    <p className="text-xs font-bold text-sky-700 font-mono mt-0.5">
                      Saldo ${fac.saldoUSD.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>

                {/* Fechas de Emisión y Vencimiento */}
                <div className="border-t border-gray-100 pt-2 space-y-1">
                  <p className="text-[10px] font-bold text-gray-800">Fechas</p>
                  <div className="grid grid-cols-3 gap-1 text-[9px] text-gray-500 font-mono">
                    <div>
                      <span className="block text-[8px] text-gray-400 font-sans">Emitido:</span>
                      {fac.fechaEmision}
                    </div>
                    <div>
                      <span className="block text-[8px] text-gray-400 font-sans">Vence:</span>
                      {fac.fechaVencimiento}
                    </div>
                    <div>
                      <span className="block text-[8px] text-gray-400 font-sans">Venc. Plazo/VPC:</span>
                      {fac.fechaVencPlazo || fac.fechaEmision}
                    </div>
                  </div>
                </div>

                {/* Sección "Selecciona que deseas pagar:" (Exacto a Imagen 4, 5, 6) */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-gray-800">
                    Selecciona que deseas pagar:
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Checkbox 1: Base + 25% IVA */}
                    <div
                      id={`chk-base-${fac.id}`}
                      onClick={() => handleToggleBaseItem(fac.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        sel.base
                          ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                          : 'border-gray-200 bg-gray-50/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={sel.base}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-sky-600 pointer-events-none accent-sky-600"
                      />
                      <div>
                        <span className="text-[9px] text-gray-500 block leading-tight font-medium">Base + 25% IVA</span>
                        <span className="text-xs font-bold text-gray-900 font-mono">$ {baseAmount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    {/* Checkbox 2: Retención (Deshabilitado si el cliente no es agente) */}
                    <div
                      id={`chk-ret-${fac.id}`}
                      onClick={() => handleToggleRetItem(fac.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                        !esAgente
                          ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                          : sel.ret
                            ? 'border-sky-500 bg-sky-50/50 shadow-xs cursor-pointer'
                            : 'border-gray-200 bg-gray-50/60 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={!esAgente}
                        checked={sel.ret}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-sky-600 pointer-events-none accent-sky-600 disabled:opacity-40"
                      />
                      <div>
                        <span className="text-[9px] text-gray-500 block leading-tight font-medium">Ret:</span>
                        <span className="text-xs font-bold text-gray-500 font-mono">$ {retAmount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acordeón Resumen de Factura */}
                <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-[10px] text-sky-600 font-semibold cursor-pointer">
                  <span>Resumen de factura</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Barra Inferior Fija de Subtotal, Método y Total (dentro del flex, no fixed) */}
      <div className="bg-white border-t border-gray-200 p-3 space-y-2 z-30 shadow-lg shrink-0">
        
        {/* Subtotal */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-medium">Subtotal:</span>
          <span className="font-bold text-gray-900 text-sm font-mono">
            $ {subtotalCalculado.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Método de Pago Selector */}
        <div className="space-y-0.5">
          <label className="text-[10px] font-semibold text-gray-500 block">Método de pago:</label>
          <div
            onClick={onAbrirModalMetodos}
            className="w-full bg-white border border-gray-300 rounded-xl p-2 flex items-center justify-between text-xs cursor-pointer hover:border-sky-500 transition-colors"
          >
            <span className="font-bold text-gray-800">{metodoActivo.nombre}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Fila Total y Botón Registrar */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 flex items-center border border-gray-300 rounded-xl px-2.5 py-2 bg-gray-50/80">
            <span className="text-gray-400 font-bold mr-1.5 text-xs">$</span>
            <span className="w-full font-mono font-bold text-gray-900 text-sm text-right">
              {totalAPagar.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            id="btn-registrar-recibo-bottom"
            onClick={handleAbrirModalRegistro}
            disabled={totalAPagar <= 0}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
              totalAPagar > 0
                ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
                : 'bg-sky-200 text-white cursor-not-allowed'
            }`}
          >
            Registrar
          </button>
        </div>

      </div>

      {/* Modal 1: Registrar Pago (Imagen 8 y 9) */}
      {mostrarModalRegistrarPago && (
        <ModalRegistrarPago
          cliente={cliente}
          metodoSeleccionado={metodoActivo}
          facturasSeleccionadasInfo={facturasSeleccionadasInfo}
          totalAPagar={totalAPagar}
          descuentoTotal={descuentoTotal}
          onConfirmarPago={handleConfirmarPago}
          onCancelar={() => setMostrarModalRegistrarPago(false)}
        />
      )}

      {/* Modal 2: Registro Completado (Imagen 10) */}
      {mostrarModalCompletado && (
        <ModalRegistroCompletado
          pagoInfo={resumenPagoGenerado}
          onCerrar={handleCerrarModalCompletado}
        />
      )}

    </div>
  );
};

export default GenerarReciboView;
