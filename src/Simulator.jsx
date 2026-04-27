import React, { useState, useRef } from 'react'
import { supabase } from './lib/supabase'
import { PRODUCTOS_FEBECA, PRODUCTOS_BEVAL } from './data/productosMocks';
import { useGhostDemos } from './hooks/useGhostDemos';

// Módulos internos modularizados
import PhoneShell from './components/Simulator/PhoneShell';
import Overlays from './components/Simulator/Overlays';
import Desktop from './components/Simulator/Desktop';
import { AfvConfig, AfvMenu } from './components/Simulator/AfvApp';
import { AfvOrders } from './components/Simulator/AfvOrders';
import { AfvSales } from './components/Simulator/AfvSales';
import { AfvCollections } from './components/Simulator/AfvCollections';
import { AfvTax } from './components/Simulator/AfvTax';

function App() {
  // Manejador de pantallas: 'inicio', 'escritorio', 'config', 'menu'
  const [pantalla, setPantalla] = useState('inicio');
  
  // 🏠 REQUISITO: Cargar la empresa seleccionada desde el Portal
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(() => {
    return localStorage.getItem('selectedCompany') || 'Febeca';
  });

  const [mostrarSubmenu, setMostrarSubmenu] = useState(false);
  const [mostrarFormaPagoCombo, setMostrarFormaPagoCombo] = useState(false);
  const [formaPago, setFormaPago] = useState('TRANSFERENCIA USD 1..');
  const [mostrarModalRecibo, setMostrarModalRecibo] = useState(false);
  const [mostrarModalNegociacion, setMostrarModalNegociacion] = useState(false);
  const [mostrarModalCierra1, setMostrarModalCierra1] = useState(false);
  const [mostrarModalCierra2, setMostrarModalCierra2] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('--Seleccione--');
  const [mostrarComboGrupo, setMostrarComboGrupo] = useState(false);
  const [cantidadProducto, setCantidadProducto] = useState('1');
  const [nivelSeleccionado, setNivelSeleccionado] = useState('MAYOREOD');
  const [mostrarComboNivel, setMostrarComboNivel] = useState(false);
  const [modalCierraGV1, setModalCierraGV1] = useState(false);
  const [modalCierraGV2, setModalCierraGV2] = useState(false);

  // --- ESTILOS DINAMICOS POR EMPRESA ---
  const getCompanyStyle = () => {
    switch (empresaSeleccionada) {
      case 'Beval':
      case 'Mundial de Partes':
        return { bg: '#c4d600', border: '#a2b000', text: 'black' };
      case 'Sillaca':
        return { bg: '#E4006B', border: '#b00052', text: 'white' };
      case 'Febeca':
      case 'Cofersa':
      default:
        return { bg: '#00b0f0', border: '#0092c8', text: 'black' };
    }
  };
  const theme = getCompanyStyle();

  // --- OBSERVACIONES PEDIDO (pantalla 016 +) ---
  const [mostrarObservaciones, setMostrarObservaciones] = useState(false);
  const [observacionTipo, setObservacionTipo] = useState('');
  const [observacionTexto, setObservacionTexto] = useState('');

  // --- CALCULADORA AFV (P1 / P2) ---
  const [mostrarAfvCalc, setMostrarAfvCalc] = useState(false);
  const [afvCalcPrecio, setAfvCalcPrecio] = useState('0,00');
  const [afvCalcNombre, setAfvCalcNombre] = useState('P1');
  const [afvDctoComercial, setAfvDctoComercial] = useState('');
  const [afvDctoFP, setAfvDctoFP] = useState('');

  // --- COBRANZA STATES ---
  const [montoAbono, setMontoAbono] = useState('84,46');
  const [montoDeposito, setMontoDeposito] = useState('40');
  const [referenciaDeposito, setReferenciaDeposito] = useState('');
  const [bancoDeposito, setBancoDeposito] = useState('');
  const [fechaDeposito, setFechaDeposito] = useState('');
  const [mostrarComboBanco, setMostrarComboBanco] = useState(false);
  const [mostrarModalDeposito, setMostrarModalDeposito] = useState(false);
  const [montoResta, setMontoResta] = useState('84,46');
  const [mostrarModalFormasPagoRecibo, setMostrarModalFormasPagoRecibo] = useState(false);
  const [formaPagoReciboSeleccionada, setFormaPagoReciboSeleccionada] = useState('PAGO GENERICO');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(false);
  const [narracionTexto, setNarracionTexto] = useState('');

  // --- CATALOGO DIGITAL STATES ---
  const [mostrarMenuCatalog, setMostrarMenuCatalog] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState('02-03-2026 08:30 AM');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // --- NUEVOS ESTADOS PARA CATÁLOGO DIGITAL ---
  const [usuarioActivo, setUsuarioActivo] = useState({
    nombre: 'Invitado',
    rol: 'vendedor', // 'vendedor' o 'cliente'
    empresa: 'Febeca'
  });
  const [favoritos, setFavoritos] = useState([]); // Array de SKUs
  const [listasPersonalizadas, setListasPersonalizadas] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [subclientes, setSubclientes] = useState([
    { id: 1, nombre: 'Ferretería El Martillo', rif: 'J-1234567-8' }
  ]);
  const [subclienteSeleccionado, setSubclienteSeleccionado] = useState(null);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [mostrarCotizaciones, setMostrarCotizaciones] = useState(false);
  const [subPantallaCatalog, setSubPantallaCatalog] = useState('inicio'); // 'inicio', 'busqueda', 'detalle'
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('TODOS');
  const [mostrarMenuCategorias, setMostrarMenuCategorias] = useState(false);

  // Datos de ejemplo para productos (para que la búsqueda funcione mientras conectamos Supabase)
  const [productosBusqueda, setProductosBusqueda] = useState([
    { sku: 'MACHETE-01', nombre: 'MACHETE 22 PULGADAS PULIDO', precio: 12.50, imagen: '🔪', marca: 'EMTOP', categoria: 'AGRÍCOLA Y JARDINERÍA' },
    { sku: 'LLAVE-IMP', nombre: 'LLAVE DE IMPACTO 1/2', precio: 381.83, imagen: '🔧', marca: 'TOTAL', categoria: 'HERRAMIENTAS' },
    { sku: 'CAVA-46L', nombre: 'CAVA ARCTIC 46L AZUL', precio: 118.61, imagen: '📦', marca: 'ARCTIC', categoria: 'HOGAR' },
    { sku: 'TALADRO-1/2', nombre: 'TALADRO PERCUTOR 1/2 600W', precio: 45.00, imagen: '🔨', marca: 'TOTAL', categoria: 'HERRAMIENTAS' },
    { sku: 'BROCA-SED', nombre: 'SET DE BROCAS PARA METAL 13PCS', precio: 8.90, imagen: '🔩', marca: 'EMTOP', categoria: 'FERRETERÍA' },
    { sku: 'BOMB-LED', nombre: 'BOMBILLO LED 12W LUZ BLANCA', precio: 1.50, imagen: '💡', marca: 'SYLVANIA', categoria: 'ILUMINACIÓN' },
    { sku: 'PINT-CAU', nombre: 'PINTURA CAUCHO BLANCO MATE 1GAL', precio: 14.20, imagen: '🎨', marca: 'FLAMUKO', categoria: 'PINTURAS' }
  ]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const saying = useRef(null); const [busquedaCatalog, setBusquedaCatalog] = useState('');
  const [cantidadMachete, setCantidadMachete] = useState('0');
  const [errorMachete, setErrorMachete] = useState('');

  // --- GHOST MOUSE STATE ---
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false });
  const [isClicking, setIsClicking] = useState(false);

  // --- OVERLAYS BS ---
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [stopRequested, setStopRequested] = useState(false);
  const stopRequestedRef = useRef(false);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [imgCalculadora, setImgCalculadora] = useState('calc1.png');
  const [mostrarSoporte, setMostrarSoporte] = useState(false);
  const [mostrarLupa, setMostrarLupa] = useState(false);
  const [mostrarLupaMontos, setMostrarLupaMontos] = useState(false);

  // --- LOGIN AFV FEBECA ---
  const [loginUsername, setloginUsername] = useState('admin');
  const [loginPassword, setloginPassword] = useState('1111');
  const [loginError, setloginError] = useState('');

  // --- RETENCION STATES ---
  const [mostrarRetencionImg, setMostrarRetencionImg] = useState(false);
  const [retencionImgSrc, setRetencionImgSrc] = useState('');
  const [retencionFecha, setRetencionFecha] = useState('');
  const [retencionPeriodo, setRetencionPeriodo] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [retencionSecuencia, setRetencionSecuencia] = useState('');
  const [retencionComprobante, setRetencionComprobante] = useState('');
  const [mostrarDetalleRetencion, setMostrarDetalleRetencion] = useState(false);
  const [mostrarComboRetencion, setMostrarComboRetencion] = useState(false);
  const [retencionMonto, setRetencionMonto] = useState('870,30');
  const [mostrarRetencionCombo, setMostrarRetencionCombo] = useState(false);
  const [retencionesLista, setRetencionesLista] = useState([]);
  const [retencionTipo, setRetencionTipo] = useState('');
  const [retencionMetodo, setRetencionMetodo] = useState('--Seleccione--');
  const [invoiceChecked, setInvoiceChecked] = useState(false);
  const [mostrarModalOtorgar, setMostrarModalOtorgar] = useState(false);
  const [condicionPedido, setCondicionPedido] = useState('0% de descuento a 30');

  // --- BUSQUEDA PRODUCTOS ---
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [mostrarBuscaNombre, setMostrarBuscaNombre] = useState(false);
  const [productoActivoIndex, setProductoActivoIndex] = useState(0);
  const [mostrarDatosBotonB, setMostrarDatosBotonB] = useState(false);

  const MOCK_PRODUCTOS = empresaSeleccionada === 'Beval' ? PRODUCTOS_BEVAL : PRODUCTOS_FEBECA;

  // Filter by code only (main input)
  // Filter by name or old code (B. button modal)
  const productosFiltrados = (() => {
    if (busquedaNombre.trim()) {
      // Name / old code search mode
      return MOCK_PRODUCTOS.filter(p =>
        p.desc.toLowerCase().includes(busquedaNombre.toLowerCase()) ||
        p.old.toLowerCase().includes(busquedaNombre.toLowerCase())
      );
    }
    if (busquedaProducto.trim()) {
      // Code-only search mode
      return MOCK_PRODUCTOS.filter(p => p.cod.includes(busquedaProducto.trim()));
    }
    return MOCK_PRODUCTOS;
  })();

  const productoActivo = productosFiltrados[productoActivoIndex] || productosFiltrados[0] || null;

  

  const {
    stopAllDemos, wrapDemo, triggerClick, decir, runDemoCatalogo,
    runDemoGestionVentas, runDemo080, runDemoCobranza, runDemoCobranzaBs,
    runDemoRetencion, runDemoDigitalCatalog
  } = useGhostDemos({
    stopRequestedRef, setStopRequested, setCursorPos, setNarracionTexto, setIsPaused,
    isPausedRef, setIsClicking, setPantalla, setMostrarModalOtorgar,
    setMostrarComboNivel, setNivelSeleccionado, setCondicionPedido,
    setMostrarModalNegociacion, setMostrarModalCierra1, setMostrarModalCierra2,
    setGrupoSeleccionado, setCantidadProducto, setModalCierraGV1, setModalCierraGV2,
    setBusquedaProducto, setBusquedaNombre, setProductoActivoIndex,
    setMostrarBuscaNombre, setMostrarAfvCalc, setAfvCalcPrecio, setAfvCalcNombre,
    setAfvDctoComercial, setAfvDctoFP, setMostrarSubmenu, setFacturaSeleccionada,
    setMostrarModalFormasPagoRecibo, setFormaPagoReciboSeleccionada, setMontoResta,
    setMontoAbono, setMostrarModalDeposito, setMontoDeposito, setReferenciaDeposito,
    setMostrarComboBanco, setBancoDeposito, setFechaDeposito, setMostrarLupaMontos,
    setImgCalculadora, setMostrarCalculadora, setMostrarSoporte, setMostrarLupa,
    setInvoiceChecked, setMostrarDetalleRetencion, setRetencionMonto, setRetencionFecha,
    setRetencionPeriodo, setRetencionSecuencia, setRetencionTipo, setRetencionMetodo,
    setMostrarComboRetencion, setMostrarCalendario, setRetencionesLista, MOCK_PRODUCTOS
  });



  return (
    <PhoneShell theme={theme}>
        {/* PANTALLA 0: INICIO DE SESIÓN */}
        {pantalla === 'inicio' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
            <p className="text-gray-400 text-[10px] tracking-widest mb-12 uppercase">Samsung Enterprise</p>
            <button
              onClick={() => setPantalla('escritorio')}
              title="Haga clic aquí para ingresar al sistema AFV"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
            >
              INICIAR SESIÓN
            </button>
          </div>
        )}

        {/* PANTALLA 1: ESCRITORIO */}
        {pantalla === 'escritorio' && (
          <Desktop 
            setPantalla={setPantalla}
            empresaSeleccionada={empresaSeleccionada}
            setEmpresaSeleccionada={setEmpresaSeleccionada}
            setloginUsername={setloginUsername}
            setloginPassword={setloginPassword}
            setloginError={setloginError}
            setSubPantallaCatalog={setSubPantallaCatalog}
          />
        )}

        {/* PANTALLA: CATALOGO DIGITAL (Modularizado) */}
        {pantalla === 'catalogo' && (
          <CatalogApp 
            theme={theme}
            empresaSeleccionada={empresaSeleccionada}
            carrito={carrito}
            setCarrito={setCarrito}
            setPantalla={setPantalla}
            subPantallaCatalog={subPantallaCatalog}
            setSubPantallaCatalog={setSubPantallaCatalog}
            busquedaCatalog={busquedaCatalog}
            setBusquedaCatalog={setBusquedaCatalog}
            productosBusqueda={productosBusqueda}
            productoSeleccionado={productoSeleccionado}
            setProductoSeleccionado={setProductoSeleccionado}
            setMostrarMenuCategorias={setMostrarMenuCategorias}
            categoriaSeleccionada={categoriaSeleccionada}
            setCategoriaSeleccionada={setCategoriaSeleccionada}
          />
        )}

        {/* PANTALLA: SDS APP (Modularizado) */}
        {pantalla === 'sds' && (
          <SdsApp 
            theme={theme}
            empresaSeleccionada={empresaSeleccionada}
            setPantalla={setPantalla}
          />
        )}

        {/* El login redundante ha sido eliminado por solicitud del usuario */}

        {/* PANTALLA 2: CONFIGURACIÓN */}
        {pantalla === 'config' && (
          <AfvConfig 
            theme={theme}
            empresaSeleccionada={empresaSeleccionada}
            setPantalla={setPantalla}
            nivelSeleccionado={nivelSeleccionado}
            setNivelSeleccionado={setNivelSeleccionado}
            mostrarComboNivel={mostrarComboNivel}
            setMostrarComboNivel={setMostrarComboNivel}
            nombreVendedor={(() => {
              const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
              return user.full_name || user.username;
            })()}
          />
        )}

        {/* PANTALLA 3: MENÚ VENTAS */}
        {pantalla === 'menu' && (
          <AfvMenu 
            theme={theme}
            empresaSeleccionada={empresaSeleccionada}
            setPantalla={setPantalla}
            mostrarSubmenu={mostrarSubmenu}
            setMostrarSubmenu={setMostrarSubmenu}
            runDemoCatalogo={runDemoCatalogo}
            runDemoGestionVentas={runDemoGestionVentas}
            runDemoCobranzaBs={runDemoCobranzaBs}
            runDemoCobranza={runDemoCobranza}
            runDemoRetencion={runDemoRetencion}
            wrapDemo={wrapDemo}
          />
        )}
        {/* PROCESO DE PEDIDOS (Modularizado) */}
        <AfvOrders 
          theme={theme}
          empresaSeleccionada={empresaSeleccionada}
          setPantalla={setPantalla}
          pantalla={pantalla}
          mostrarModalOtorgar={mostrarModalOtorgar}
          setMostrarModalOtorgar={setMostrarModalOtorgar}
          nivelSeleccionado={nivelSeleccionado}
          setNivelSeleccionado={setNivelSeleccionado}
          mostrarComboNivel={mostrarComboNivel}
          setMostrarComboNivel={setMostrarComboNivel}
        />

        {/* PROCESO DE GESTIÓN DE VENTAS (Modularizado) */}
        <AfvSales 
          theme={theme}
          empresaSeleccionada={empresaSeleccionada}
          pantalla={pantalla}
          setPantalla={setPantalla}
          grupoSeleccionado={grupoSeleccionado}
          setGrupoSeleccionado={setGrupoSeleccionado}
          mostrarComboGrupo={mostrarComboGrupo}
          setMostrarComboGrupo={setMostrarComboGrupo}
          busquedaProducto={busquedaProducto}
          setBusquedaProducto={setBusquedaProducto}
          busquedaNombre={busquedaNombre}
          setBusquedaNombre={setBusquedaNombre}
          productoActivoIndex={productoActivoIndex}
          setProductoActivoIndex={setProductoActivoIndex}
          mostrarDatosBotonB={mostrarDatosBotonB}
          setMostrarDatosBotonB={setMostrarDatosBotonB}
          mostrarBuscaNombre={mostrarBuscaNombre}
          setMostrarBuscaNombre={setMostrarBuscaNombre}
          cantidadProducto={cantidadProducto}
          setCantidadProducto={setCantidadProducto}
          nivelSeleccionado={nivelSeleccionado}
          setNivelSeleccionado={setNivelSeleccionado}
          mostrarComboNivel={mostrarComboNivel}
          setMostrarComboNivel={setMostrarComboNivel}
          mostrarObservaciones={mostrarObservaciones}
          setMostrarObservaciones={setMostrarObservaciones}
          observacionTipo={observacionTipo}
          setObservacionTipo={setObservacionTipo}
          observacionTexto={observacionTexto}
          setObservacionTexto={setObservacionTexto}
          modalCierraGV1={modalCierraGV1}
          setModalCierraGV1={setModalCierraGV1}
          modalCierraGV2={modalCierraGV2}
          setModalCierraGV2={setModalCierraGV2}
          setAfvCalcPrecio={setAfvCalcPrecio}
          setAfvCalcNombre={setAfvCalcNombre}
          setAfvDctoComercial={setAfvDctoComercial}
          setAfvDctoFP={setAfvDctoFP}
          setMostrarAfvCalc={setMostrarAfvCalc}
        />

        {/* PROCESO DE COBRANZAS (Modularizado) */}
        <AfvCollections 
          theme={theme}
          empresaSeleccionada={empresaSeleccionada}
          setPantalla={setPantalla}
          pantalla={pantalla}
          formaPago={formaPago}
          setFormaPago={setFormaPago}
          mostrarFormaPagoCombo={mostrarFormaPagoCombo}
          setMostrarFormaPagoCombo={setMostrarFormaPagoCombo}
          mostrarModalRecibo={mostrarModalRecibo}
          setMostrarModalRecibo={setMostrarModalRecibo}
          mostrarSoporte={mostrarSoporte}
          setMostrarSoporte={setMostrarSoporte}
          mostrarLupa={mostrarLupa}
          setMostrarLupa={setMostrarLupa}
        />

        {/* PROCESO DE RETENCIONES (Modularizado) */}
        <AfvTax 
          theme={theme}
          empresaSeleccionada={empresaSeleccionada}
          setPantalla={setPantalla}
          pantalla={pantalla}
          retencionesLista={retencionesLista}
          retencionTipo={retencionTipo}
          setRetencionTipo={setRetencionTipo}
          retencionMetodo={retencionMetodo}
          setRetencionMetodo={setRetencionMetodo}
          mostrarComboRetencion={mostrarComboRetencion}
          setMostrarComboRetencion={setMostrarComboRetencion}
          retencionFecha={retencionFecha}
          setRetencionFecha={setRetencionFecha}
          mostrarCalendario={mostrarCalendario}
          setMostrarCalendario={setMostrarCalendario}
          retencionPeriodo={retencionPeriodo}
          setRetencionPeriodo={setRetencionPeriodo}
          retencionSecuencia={retencionSecuencia}
          setRetencionSecuencia={setRetencionSecuencia}
          retencionMonto={retencionMonto}
          setRetencionMonto={setRetencionMonto}
          setRetencionesLista={setRetencionesLista}
        />

        {/* BARRA SAMSUNG DE NAVEGACIÓN */}
        <div className="h-12 bg-white flex items-center justify-center gap-14 border-t border-gray-100">
          <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-sm"></div>
          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
          <div className="w-3.5 h-3.5 border-2 border-gray-300 rotate-45 border-t-0 border-l-0"></div>
        </div>

        {/* NARRATOR BUBBLE */}
        {cursorPos.visible && narracionTexto && (
          <div
            className="absolute z-[110] bg-black/80 text-white p-3 rounded-lg text-[11px] font-bold text-center border border-blue-400 shadow-xl animate-bounce"
            style={{
              left: '50%',
              bottom: '100px',
              transform: 'translateX(-50%)',
              maxWidth: '80%'
            }}
          >
            {narracionTexto}
          </div>
        )}



        {/* CONTROLES DE SIMULACIÓN (PAUSE / STOP) */}
        {cursorPos.visible && (
          <div className="absolute top-10 right-4 z-[120] flex flex-col gap-2 scale-75 origin-top-right">
            <button
              onClick={() => {
                const nextVal = !isPaused;
                setIsPaused(nextVal);
                isPausedRef.current = nextVal;
              }}
              className={`${isPaused ? 'bg-green-600' : 'bg-yellow-600'} text-white font-bold p-2 rounded-lg shadow-lg border border-white/50 w-24 active:scale-95 transition-all text-xs flex items-center justify-center gap-1`}
            >
              <span className="text-sm">{isPaused ? '▶' : '⏸'}</span>
              {isPaused ? 'REANUDAR' : 'PAUSAR'}
            </button>
            <button
              onClick={stopAllDemos}
              className="bg-red-700 text-white font-bold p-2 rounded-lg shadow-lg border border-white/50 w-24 active:scale-95 transition-all text-xs flex items-center justify-center gap-1"
            >
              <span className="text-sm">⏹</span>
              DETENER
            </button>
          </div>
        )}

        {/* OVERLAY CALCULADORA AFV (084 - Consulta de Precios) */}
        {mostrarAfvCalc && (() => {
          // Parse price: "15.500,00" -> 15500.00
          const precioBase = parseFloat(afvCalcPrecio.replace(/\./g, '').replace(',', '.')) || 0;
          const dctoPromoNum = parseFloat(afvDctoComercial) || 0;
          // Payment method discount percentages
          const fpDescuentos = {
            '': 0,
            'DEPOSITO USD 13%': 13,
            'DEPOSITO EN TRANSITO USD 13%': 13,
            'TRANSFERENCIA VES 0%': 0,
            'TRANSFERENCIA INTERNACIONAL USD 15%': 15,
          };
          const dctoFPNum = fpDescuentos[afvDctoFP] || 0;
          const precioSinIVA = precioBase * (1 - dctoPromoNum / 100) * (1 - dctoFPNum / 100);
          const precioConIVA = precioSinIVA * 1.16;
          const fmt = (n) => n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          return (
            <div className="absolute inset-0 bg-black/50 z-[300] flex items-center justify-center">
              <div className="w-[300px] bg-[#f0f0f0] shadow-2xl flex flex-col font-sans overflow-hidden border border-gray-400">
                {/* Header €” blue bar */}
                <div className="bg-[#00b0f0] px-2 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-300">
                      <span className="text-[9px] font-black text-gray-800 italic">f</span>
                    </div>
                    <span className="text-[13px] font-bold text-black font-sans">084 - Consulta de Precios</span>
                  </div>
                  <button
                    onClick={() => setMostrarAfvCalc(false)}
                    className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm border border-gray-400 shadow-sm active:bg-gray-400"
                  >✕</button>
                </div>

                {/* Top section: table + tipo precio */}
                <div className="flex bg-white border-b border-gray-300">
                  {/* Das / Descuento table */}
                  <div className="flex-1 border-r border-gray-300">
                    <div className="flex bg-[#595959] text-white text-[10px] font-bold">
                      <div className="flex-1 text-center py-1 border-r border-gray-500">Das</div>
                      <div className="flex-1 text-center py-1">Descuento</div>
                    </div>
                    {/* Row 1 €” normal (not highlighted) */}
                    <div className="flex text-[11px] font-sans border-b border-gray-200">
                      <div className="flex-1 text-center py-1 border-r border-gray-200 text-gray-700">0,00</div>
                      <div className="flex-1 text-center py-1 text-gray-700">{fmt(dctoPromoNum)}</div>
                    </div>
                    {/* Row 2 €” highlighted blue (active) */}
                    <div className="flex text-[11px] font-bold bg-[#00b0f0]">
                      <div className="flex-1 text-center py-1 border-r border-[#0092c8]">30,00</div>
                      <div className="flex-1 text-center py-1">{fmt(dctoFPNum)}</div>
                    </div>
                    {/* Empty rows to fill space */}
                    <div className="h-16 bg-white"></div>
                  </div>

                  {/* Tipo Precio + back arrow */}
                  <div className="w-[110px] flex flex-col items-start justify-start p-2 gap-2">
                    <span className="text-[10px] text-gray-600 font-sans">Tipo Precio:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="tipoPrecio" defaultChecked className="accent-[#00b0f0]" />
                      <span className="text-[11px] font-sans text-black">{afvCalcNombre === 'P1' ? 'Normal' : 'Unitario'}</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="tipoPrecio" className="accent-[#00b0f0]" />
                      <span className="text-[11px] font-sans text-black">{afvCalcNombre === 'P1' ? 'Unitario' : 'Normal'}</span>
                    </label>
                  </div>
                </div>

                {/* Price fields section */}
                <div className="flex flex-col bg-[#f0f0f0] px-2 py-1 gap-0.5">

                  {/* Precio del Artculo */}
                  <div className="flex items-center gap-1 py-1 border-b border-gray-300">
                    <span className="text-[10px] text-gray-700 font-sans w-[110px] shrink-0">Precio del Artculo:</span>
                    <div className="flex-1 bg-[#b3b3b3] text-black text-[12px] font-bold px-2 py-0.5 text-right">{afvCalcPrecio}</div>
                    <span className="text-[10px] text-gray-600 ml-1 w-8 text-right">USD</span>
                  </div>

                  {/* Dscto. Empaque */}
                  <div className="flex items-center gap-1 py-1 border-b border-gray-300">
                    <span className="text-[10px] text-gray-700 font-sans w-[110px] shrink-0">Dscto. Empaque:</span>
                    <div className="flex-1 bg-[#b3b3b3] text-black text-[12px] font-bold px-2 py-0.5 text-right">0,00</div>
                    <span className="text-[10px] text-gray-600 ml-1 w-8 text-right">(%)</span>
                  </div>

                  {/* Dscto. Autorizado */}
                  <div className="flex items-center gap-1 py-1 border-b border-gray-300">
                    <span className="text-[10px] text-gray-700 font-sans w-[110px] shrink-0">Dscto. Autorizado:</span>
                    <div className="flex-1 bg-[#b3b3b3] text-gray-500 text-[12px] px-2 py-0.5 text-right">0</div>
                    <span className="text-[10px] text-gray-600 ml-1 w-8 text-right">(%)</span>
                  </div>

                  {/* Dscto. Promoción (dropdown) */}
                  <div className="flex items-center gap-1 py-1 border-b border-gray-300">
                    <span className="text-[10px] text-gray-700 font-sans w-[110px] shrink-0">Dscto. Promocin:</span>
                    <select
                      value={afvDctoComercial}
                      onChange={(e) => setAfvDctoComercial(e.target.value)}
                      className="flex-1 bg-white border border-gray-400 text-[11px] font-bold px-1 py-0.5 outline-none text-black appearance-none"
                    >
                      <option value="0">0,00</option>
                      <option value="1">1,00</option>
                      <option value="2">2,00</option>
                      <option value="3">3,00</option>
                      <option value="4">4,00</option>
                      <option value="5">5,00</option>
                      <option value="7">7,00</option>
                      <option value="10">10,00</option>
                      <option value="12">12,00</option>
                      <option value="15">15,00</option>
                    </select>
                    <span className="text-[10px] text-gray-600 ml-1 w-8 text-right">(%)</span>
                  </div>

                  {/* Otro Dscto. */}
                  <div className="flex items-center gap-1 py-1 border-b border-gray-300">
                    <span className="text-[10px] text-gray-700 font-sans w-[110px] shrink-0">Otro Dscto.</span>
                    <div className="flex-1 border-b border-gray-400 h-4"></div>
                    <span className="text-[10px] text-gray-600 ml-1 w-8 text-right">(%)</span>
                  </div>

                  {/* Forma Pago */}
                  <div className="flex items-center gap-1 py-1 border-b border-gray-300">
                    <span className="text-[10px] text-gray-700 font-sans w-[110px] shrink-0">Forma Pago:</span>
                    <select
                      value={afvDctoFP}
                      onChange={(e) => setAfvDctoFP(e.target.value)}
                      className="flex-1 bg-white border border-gray-400 text-[9px] font-bold px-1 py-0.5 outline-none text-black"
                    >
                      <option value="">SELECCIONE FORMA DE PAGO</option>
                      <option value="DEPOSITO USD 13%">DEPOSITO USD 13%</option>
                      <option value="DEPOSITO EN TRANSITO USD 13%">DEPOSITO EN TRANSITO USD 13%</option>
                      <option value="TRANSFERENCIA VES 0%">TRANSFERENCIA VES 0%</option>
                      <option value="TRANSFERENCIA INTERNACIONAL USD 15%">TRANSFERENCIA INTERNACIONAL USD 15%</option>
                    </select>
                    <span className="text-[10px] text-gray-600 ml-1 w-8 text-right">(%)</span>
                  </div>

                  {/* Precio sin IVA */}
                  <div className="flex items-center gap-1 py-1.5 border-b border-gray-300 mt-1">
                    <span className="text-[11px] text-gray-800 font-bold font-sans w-[110px] shrink-0">Precio sin IVA:</span>
                    <div className="flex-1 bg-[#b3b3b3] text-black text-[13px] font-bold px-2 py-0.5 text-right">{fmt(precioSinIVA)}</div>
                    <span className="text-[10px] text-gray-600 ml-1 w-8 text-right font-bold">USD</span>
                  </div>

                  {/* Precio con IVA */}
                  <div className="flex items-center gap-1 py-1.5">
                    <span className="text-[11px] text-gray-800 font-bold font-sans w-[110px] shrink-0">Precio con IVA:</span>
                    <div className="flex-1 bg-[#b3b3b3] text-black text-[13px] font-bold px-2 py-0.5 text-right">{fmt(precioConIVA)}</div>
                    <span className="text-[10px] text-gray-600 ml-1 w-8 text-right font-bold">USD</span>
                  </div>
                </div>

                {/* Footer note */}
                <div className="bg-gray-200 px-2 py-1 text-center">
                  <span className="text-[8px] text-gray-500 font-sans">Esta calculadora no modifica el pedido en curso</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* OVERLAY CALCULADORA (cobranza) */}
        {/* PANTALLA: RETENCION DEMO OVERLAY */}
        {mostrarRetencionImg && (
          <div className="absolute inset-0 bg-black/80 z-[400] flex items-center justify-center animate-in fade-in duration-300">
            <div className="relative w-[90%] max-h-[90%] shadow-2xl rounded-lg overflow-hidden border-2 border-white/20 bg-white">
              <div className="absolute top-0 left-0 right-0 bg-blue-600/90 text-white p-2 text-[10px] font-bold z-10 flex justify-between items-center backdrop-blur-sm">
                <span>SIMULACI\u00D3N PRECARGA RETENCI\u00D3N</span>
                <button
                  onClick={() => setMostrarRetencionImg(false)}
                  className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                >✕</button>
              </div>
              <div className="relative">
                <img src={retencionImgSrc} alt="Retencion" className="w-full h-auto" />

                {/* Elementos dinmicos sobre la imagen para simular interaccin */}
                {retencionImgSrc === 'retencion4.jpeg' && (
                  <div className="absolute top-[68%] left-[45%] bg-white px-2 py-0.5 border border-blue-500 text-[10px] font-bold shadow-md animate-pulse">
                    {retencionFecha}
                  </div>
                )}
                {retencionImgSrc === 'retencion5.jpeg' && (
                  <div className="absolute top-[75%] left-[45%] bg-white px-2 py-0.5 border border-blue-500 text-[10px] font-bold shadow-md animate-pulse">
                    {retencionComprobante}
                  </div>
                )}
                {(retencionImgSrc === 'retencion6.jpeg' || retencionImgSrc === 'retencion7.jpeg' || retencionImgSrc === 'retencion8.jpeg' || retencionImgSrc === 'retencion9.jpeg') && (
                  <div className="absolute top-[88%] left-[65%] bg-yellow-100 px-2 py-0.5 border border-red-500 text-[10px] font-bold shadow-md">
                    {retencionMonto}
                  </div>
                )}

                {mostrarRetencionCombo && (
                  <div className="absolute top-[50%] left-[45%] bg-white border border-gray-400 shadow-xl z-20 w-32 rounded-sm overflow-hidden animate-in slide-in-from-top-2">
                    <div className="px-2 py-1.5 text-[9px] text-gray-500 font-sans border-b border-gray-100">--Seleccione--</div>
                    <div className="px-2 py-1.5 text-[9px] text-white font-bold font-sans bg-blue-500">Carga Manual</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overlays (Cursor, Calculadora, etc.) */}
        <Overlays 
            cursorPos={cursorPos} 
            isClicking={isClicking} 
            mostrarCalculadora={mostrarCalculadora} 
            setMostrarCalculadora={setMostrarCalculadora}
            imgCalculadora={imgCalculadora}
            mostrarSoporte={mostrarSoporte}
            setMostrarSoporte={setMostrarSoporte}
            mostrarLupa={mostrarLupa}
        />
    </PhoneShell>
  );
}

export default App;

