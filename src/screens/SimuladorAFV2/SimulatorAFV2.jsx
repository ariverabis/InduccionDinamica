import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CLIENTES_MOCK, 
  FACTURAS_MOCK, 
  RECIBOS_MOCK, 
  RETENCIONES_MOCK, 
  DEPOSITOS_MOCK, 
  TASA_BCV 
} from './data/mockCobranzasAFV2';

import InicioCarteraView from './views/InicioCarteraView';
import ClienteDetalleView from './views/ClienteDetalleView';
import SaldoCuentaView from './views/SaldoCuentaView';
import CargarRetencionesView from './views/CargarRetencionesView';
import HistorialView from './views/HistorialView';
import GenerarReciboView from './views/GenerarReciboView';
import RegistrarDepositoView from './views/RegistrarDepositoView';
import GmailShareView from './views/GmailShareView';

import ModalMetodoPago from './components/ModalMetodoPago';
import ModalDetalleFactura from './components/ModalDetalleFactura';
import ModalGenerarEstado from './components/ModalGenerarEstado';
import ModalEditarRetencion from './components/ModalEditarRetencion';
import { GhostCursor } from '../../components/Simulator/Overlays';
import { useGhostDemosAFV2 } from './hooks/useGhostDemosAFV2';

const SimulatorAFV2 = () => {
  const navigate = useNavigate();

  // Estados principales
  const [clientes, setClientes] = useState(CLIENTES_MOCK);
  const [facturas, setFacturas] = useState(FACTURAS_MOCK);
  const [recibos, setRecibos] = useState(RECIBOS_MOCK);
  const [retenciones, setRetenciones] = useState(RETENCIONES_MOCK);
  const [depositos, setDepositos] = useState(DEPOSITOS_MOCK);

  // Navegación interna de la app móvil
  const [tabInferior, setTabInferior] = useState('inicio'); // 'inicio' | 'historial' | 'perfil'
  const [vistaActual, setVistaActual] = useState('cartera'); // 'cartera' | 'cliente_detalle' | 'saldo_cuenta' | 'cargar_retenciones' | 'generar_recibo' | 'depositar' | 'gmail_share'
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Método de pago activo para el recibo
  const [mostrarModalMetodos, setMostrarModalMetodos] = useState(false);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState({
    id: 'dep_transito_usd',
    nombre: 'Deposito En Transito (USD)',
    moneda: 'USD',
    descuento: 13
  });
  const [pagoInfoActual, setPagoInfoActual] = useState(null);

  // Saldo de depósito pendiente (Banner en inicio - Exacto a Imagen 2.jpeg: $1.985,00)
  const [saldoDepositoPendiente, setSaldoDepositoPendiente] = useState(1985.00);

  // Modales
  const [facturaDetalle, setFacturaDetalle] = useState(null);
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
  const [facturaEditandoRetencion, setFacturaEditandoRetencion] = useState(null);

  // --- GHOST CURSOR Y DEMOS GUIADAS ---
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false });
  const [isClicking, setIsClicking] = useState(false);
  const [narracionTexto, setNarracionTexto] = useState('');

  const {
    demoActiva,
    isPaused,
    stopAllDemos,
    togglePause,
    runDemoRecibo,
    runDemoRetencion,
    runDemoDeposito,
    runDemoHistorial,
    runDemoEstadosCuenta
  } = useGhostDemosAFV2({
    setCursorPos,
    setIsClicking,
    setNarracionTexto,
    setVistaActual,
    setTabInferior,
    setClienteSeleccionado,
    clientes,
    facturas,
    setFacturaDetalle,
    setMostrarModalEstado,
    setFacturaEditandoRetencion,
    saldoDepositoPendiente,
    handleReciboGenerado: (r) => handleReciboGenerado(r),
    handleRetencionRegistrada: (ret) => handleRetencionRegistrada(ret),
    handleDepositoRegistrado: (dep) => handleDepositoRegistrado(dep),
    setMostrarModalMetodos,
    setMetodoSeleccionado,
    setPagoInfoActual
  });

  // Manejadores de acciones
  const handleSeleccionarCliente = (cli) => {
    setClienteSeleccionado(cli);
    setVistaActual('cliente_detalle');
  };

  const handleReciboGenerado = (nuevoRecibo) => {
    // 1. Descontar saldo de facturas
    setFacturas(prev => prev.map(f => {
      if (nuevoRecibo.facturasIds.includes(f.id)) {
        return { ...f, saldoUSD: 0, estado: 'Cancelada' };
      }
      return f;
    }));

    // 2. Agregar a recibos
    setRecibos(prev => [
      {
        id: 'rec-' + Date.now(),
        numeroRecibo: 'REC-2026-' + Math.floor(1000 + Math.random() * 9000),
        clienteId: nuevoRecibo.clienteId,
        clienteNombre: nuevoRecibo.clienteNombre,
        fecha: new Date().toLocaleDateString('es-VE'),
        montoUSD: nuevoRecibo.montoUSD,
        montoBs: nuevoRecibo.montoBs,
        tasaCambio: nuevoRecibo.tasaCambio,
        metodo: nuevoRecibo.metodo,
        referencia: nuevoRecibo.referencia,
        facturasCanceladas: nuevoRecibo.facturasIds.map(id => `#${id}`)
      },
      ...prev
    ]);

    // 3. Si cobró en efectivo divisas, incrementar el saldo pendiente de depositar
    if (nuevoRecibo.metodo === 'Efectivo Divisas') {
      setSaldoDepositoPendiente(prev => prev + nuevoRecibo.montoUSD);
    }

    setVistaActual('saldo_cuenta');
  };

  const handleRetencionRegistrada = (datos) => {
    // Descontar montos de retención
    setFacturas(prev => prev.map(f => {
      if (datos.facturasIds.includes(f.id)) {
        const nuevoSaldo = Math.max(0, f.saldoUSD - (f.montoRetencionUSD || 0));
        return { 
          ...f, 
          saldoUSD: nuevoSaldo,
          estado: nuevoSaldo === 0 ? 'Cancelada' : f.estado
        };
      }
      return f;
    }));

    // Agregar comprobante a retenciones
    setRetenciones(prev => [
      {
        id: 'ret-' + Date.now(),
        numeroComprobante: datos.comprobante,
        clienteId: clienteSeleccionado.id,
        clienteNombre: clienteSeleccionado.nombre,
        fecha: new Date().toLocaleDateString('es-VE'),
        periodoFiscal: '2026-11',
        porcentaje: '75%',
        montoRetenidoUSD: datos.totalUSD,
        montoRetenidoBs: datos.totalBs,
        facturaAfectada: datos.facturasIds.join(', '),
        estatus: 'Precargada en AFV 2.0'
      },
      ...prev
    ]);

    setVistaActual('saldo_cuenta');
  };

  const handleDepositoRegistrado = (datos) => {
    // Agregar a la lista de anexos / depósitos
    setDepositos(prev => [
      {
        id: 'dep-' + Date.now(),
        numeroRelacion: 'ANX-DEP-' + Math.floor(1000 + Math.random() * 9000),
        bancoReceptor: datos.bancoReceptor,
        bancoEmisor: datos.bancoEmisor,
        numeroPlanilla: datos.numeroPlanilla,
        fechaDeposito: datos.fechaDeposito,
        montoUSD: datos.montoUSD,
        montoBs: datos.montoBs,
        recibosAsociados: ['Cobranza semanal'],
        estatus: 'En tránsito a conciliación'
      },
      ...prev
    ]);

    // Disminuir o limpiar saldo pendiente en mano
    setSaldoDepositoPendiente(prev => Math.max(0, prev - datos.montoUSD));
    setVistaActual('cartera');
  };

  const handleGuardarRetencionModificada = (facturaActualizada) => {
    setFacturas(prev => prev.map(f => f.id === facturaActualizada.id ? facturaActualizada : f));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4 font-sans select-none">
      
      {/* Barra Externa de Control del Simulador */}
      <header className="w-full max-w-sm flex items-center justify-between mb-2 text-white px-2">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-bold bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors shadow-sm"
        >
          <span>←</span>
          <span>Volver al Portal</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] bg-sky-500/20 text-sky-400 border border-sky-400/30 px-2 py-0.5 rounded-full font-bold">
            AFV 2.0 COBRANZAS
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Tasa BCV: Bs. {TASA_BCV.toFixed(2)}</p>
        </div>
      </header>

      {/* Barra de Control de Demos Guiadas (Ghost Cursor) */}
      <div className="w-full max-w-sm mb-3 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-bold text-[11px] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>Modo Guiado (Demostración):</span>
          </span>
          {demoActiva && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={togglePause}
                className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-400/40 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 transition-colors"
              >
                {isPaused ? '▶ Reanudar' : '⏸ Pausar'}
              </button>
              <button
                onClick={stopAllDemos}
                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition-colors"
              >
                ✕ Detener
              </button>
            </div>
          )}
        </div>

        {/* Botones de Demos Guiadas por Proceso */}
        <div className="grid grid-cols-5 gap-1 text-[9px] font-bold">
          <button
            onClick={runDemoRecibo}
            disabled={demoActiva !== null}
            className={`p-1.5 rounded-lg border text-center transition-all ${
              demoActiva === 'Recibo de Cobro'
                ? 'bg-sky-600 text-white border-sky-400 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 disabled:opacity-40'
            }`}
            title="Demo: Generar Recibo de Cobro"
          >
            1. Recibo
          </button>

          <button
            onClick={runDemoRetencion}
            disabled={demoActiva !== null}
            className={`p-1.5 rounded-lg border text-center transition-all ${
              demoActiva === 'Carga de Retención'
                ? 'bg-sky-600 text-white border-sky-400 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 disabled:opacity-40'
            }`}
            title="Demo: Cargar Retención de IVA"
          >
            2. Retención
          </button>

          <button
            onClick={runDemoDeposito}
            disabled={demoActiva !== null}
            className={`p-1.5 rounded-lg border text-center transition-all ${
              demoActiva === 'Relación de Depósito'
                ? 'bg-sky-600 text-white border-sky-400 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 disabled:opacity-40'
            }`}
            title="Demo: Registrar Relación de Depósito"
          >
            3. Depósito
          </button>

          <button
            onClick={runDemoHistorial}
            disabled={demoActiva !== null}
            className={`p-1.5 rounded-lg border text-center transition-all ${
              demoActiva === 'Historial y Asientos'
                ? 'bg-sky-600 text-white border-sky-400 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 disabled:opacity-40'
            }`}
            title="Demo: Consultar Historial y Asientos Contables"
          >
            4. Historial
          </button>

          <button
            onClick={runDemoEstadosCuenta}
            disabled={demoActiva !== null}
            className={`p-1.5 rounded-lg border text-center transition-all ${
              demoActiva === 'Estados de Cuenta'
                ? 'bg-sky-600 text-white border-sky-400 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 disabled:opacity-40'
            }`}
            title="Demo: Generar los 2 Estados de Cuenta"
          >
            5. Estados
          </button>
        </div>
      </div>

      {/* Carcasa Smartphone Moderna (320px x 680px) */}
      <div className="w-[320px] h-[670px] bg-white rounded-[2.8rem] border-[8px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] relative flex flex-col overflow-hidden ring-1 ring-white/10">
        
        {/* Cursor Fantasma Animado */}
        <GhostCursor cursorPos={cursorPos} isClicking={isClicking} />

        {/* Globo Flotante de Narración Explicativa */}
        {cursorPos.visible && narracionTexto && (
          <div className="absolute top-10 left-3 right-3 z-[990] bg-slate-900/95 text-white p-3 rounded-2xl text-[11px] font-semibold text-center border border-sky-400 shadow-2xl backdrop-blur-sm animate-bounce">
            <span className="text-sky-400 font-bold block text-[10px] uppercase tracking-wider mb-0.5">
              Demostración Guiada
            </span>
            {narracionTexto}
          </div>
        )}
        
        {/* Notch / Barra de Estado Superior */}
        <div className="h-7 bg-white flex items-center justify-between px-6 pt-1 text-[11px] font-bold text-slate-800 shrink-0 z-30 select-none">
          <span>4:48</span>
          <div className="w-16 h-3.5 bg-black rounded-full mx-auto"></div>
          <div className="flex items-center gap-1 text-[10px]">
            <span>5G</span>
            <span>82%</span>
          </div>
        </div>

        {/* Encabezado Corporativo AFV 2.0 Cobranza (Exacto a las capturas) */}
        {tabInferior !== 'historial' && vistaActual === 'cartera' && (
          <div className="bg-white px-4 py-2 flex items-center gap-2 border-b border-gray-100 shrink-0 z-20">
            {/* Logo de Cobranza (Ícono estilizado f azul) */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center font-serif shadow-xs">
                f
              </span>
              <span className="text-base font-bold text-sky-600 tracking-tight">Cobranza</span>
            </div>
          </div>
        )}

        {/* Área Central de Vistas (Scrollable) */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {tabInferior === 'historial' ? (
            <HistorialView
              facturas={facturas}
              recibos={recibos}
              retenciones={retenciones}
              depositos={depositos}
              onVerDetalleFactura={(fac) => setFacturaDetalle(fac)}
            />
          ) : tabInferior === 'perfil' ? (
            <div className="p-6 text-center text-xs text-gray-500 space-y-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-700 font-bold text-xl flex items-center justify-center mx-auto shadow-inner">
                AV
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Asesor de Ventas y Cobranza</p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">Zona Asignada: Z075</p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-left space-y-1.5 text-[11px]">
                <p><b>Ruta:</b> Valencia - Naguanagua</p>
                <p><b>Estatus:</b> Habilitado para gestión de cobro</p>
                <p><b>Cartera Activa:</b> {clientes.length} comercios</p>
              </div>
            </div>
          ) : (
            // Vistas del Flujo de Inicio
            <>
              {vistaActual === 'cartera' && (
                <InicioCarteraView
                  clientes={clientes}
                  saldoDepositoPendiente={saldoDepositoPendiente}
                  onSeleccionarCliente={handleSeleccionarCliente}
                  onIrADepositar={() => setVistaActual('depositar')}
                />
              )}

              {vistaActual === 'cliente_detalle' && clienteSeleccionado && (
                <ClienteDetalleView
                  cliente={clienteSeleccionado}
                  onVolver={() => setVistaActual('cartera')}
                  onVerSaldoCuenta={() => setVistaActual('saldo_cuenta')}
                  onGenerarRecibo={() => setMostrarModalMetodos(true)}
                />
              )}

              {vistaActual === 'saldo_cuenta' && clienteSeleccionado && (
                <SaldoCuentaView
                  cliente={clienteSeleccionado}
                  facturas={facturas}
                  onVolver={() => setVistaActual('cartera')}
                  onGenerarRecibo={() => setMostrarModalMetodos(true)}
                  onCargarRetenciones={() => setVistaActual('cargar_retenciones')}
                  onVerDetalleFactura={(fac) => setFacturaDetalle(fac)}
                  onAbrirModalEstado={() => setMostrarModalEstado(true)}
                />
              )}

              {vistaActual === 'cargar_retenciones' && clienteSeleccionado && (
                <CargarRetencionesView
                  cliente={clienteSeleccionado}
                  facturas={facturas}
                  onVolver={() => setVistaActual('saldo_cuenta')}
                  onEditarRetencion={(fac) => setFacturaEditandoRetencion(fac)}
                  onRegistrarRetencionExitosa={handleRetencionRegistrada}
                />
              )}

              {vistaActual === 'generar_recibo' && clienteSeleccionado && (
                <GenerarReciboView
                  cliente={clienteSeleccionado}
                  facturas={facturas}
                  metodoInicial={metodoSeleccionado}
                  onVolver={() => setVistaActual('cliente_detalle')}
                  onAbrirModalMetodos={() => setMostrarModalMetodos(true)}
                  onAbrirGmailShare={(info) => {
                    setPagoInfoActual(info);
                    setVistaActual('gmail_share');
                  }}
                  onReciboCompletado={handleReciboGenerado}
                />
              )}

              {vistaActual === 'gmail_share' && clienteSeleccionado && (
                <GmailShareView
                  cliente={clienteSeleccionado}
                  pagoInfo={pagoInfoActual}
                  onVolver={() => setVistaActual('cartera')}
                  onEnviarExitoso={() => {
                    setVistaActual('cartera');
                  }}
                />
              )}

              {vistaActual === 'depositar' && (
                <RegistrarDepositoView
                  montoSugerido={saldoDepositoPendiente}
                  onVolver={() => setVistaActual('cartera')}
                  onDepositoRegistradoExitosamente={handleDepositoRegistrado}
                />
              )}
            </>
          )}
        </div>

        {/* Barra de Navegación Inferior Móvil (INICIO - HISTORIAL - PERFIL) - Oculta en pantalla de Gmail */}
        {vistaActual !== 'gmail_share' && (
          <nav className="h-14 bg-white border-t border-gray-200 flex items-center justify-around px-2 shrink-0 z-30 shadow-md">
            <button
              onClick={() => { setTabInferior('inicio'); setVistaActual('cartera'); }}
              className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-colors ${
                tabInferior === 'inicio' ? 'text-sky-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>INICIO</span>
            </button>

            <button
              onClick={() => setTabInferior('historial')}
              className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-colors ${
                tabInferior === 'historial' ? 'text-sky-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>HISTORIAL</span>
            </button>

            <button
              onClick={() => setTabInferior('perfil')}
              className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-colors ${
                tabInferior === 'perfil' ? 'text-sky-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>PERFIL</span>
            </button>
          </nav>
        )}

        {/* Barra de navegación de gestos (Home indicator Android) */}
        <div className="h-4 bg-white flex justify-center items-center pb-1">
          <div className="w-24 h-1 bg-gray-300 rounded-full"></div>
        </div>

      </div>

      {/* Modales Compartidos */}
      {mostrarModalMetodos && (
        <ModalMetodoPago
          onSelectMetodo={(m) => {
            setMetodoSeleccionado(m);
            setMostrarModalMetodos(false);
            setVistaActual('generar_recibo');
          }}
          onClose={() => setMostrarModalMetodos(false)}
        />
      )}

      {facturaDetalle && (
        <ModalDetalleFactura
          factura={facturaDetalle}
          onClose={() => setFacturaDetalle(null)}
        />
      )}

      {mostrarModalEstado && clienteSeleccionado && (
        <ModalGenerarEstado
          cliente={clienteSeleccionado}
          facturas={facturas}
          onClose={() => setMostrarModalEstado(false)}
        />
      )}

      {facturaEditandoRetencion && (
        <ModalEditarRetencion
          factura={facturaEditandoRetencion}
          onGuardar={handleGuardarRetencionModificada}
          onClose={() => setFacturaEditandoRetencion(null)}
        />
      )}

    </div>
  );
};

export default SimulatorAFV2;

