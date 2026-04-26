import React, { useState, useRef } from 'react'
import { supabase } from './lib/supabase'
import { PRODUCTOS_FEBECA, PRODUCTOS_BEVAL } from './data/productosMocks';
import { useGhostDemos } from './hooks/useGhostDemos';

function App() {
  // Manejador de pantallas: 'inicio', 'escritorio', 'config', 'menu'
  const [pantalla, setPantalla] = useState('inicio');
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('Febeca');
  const [mostrarSubmenu, setMostrarSubmenu] = useState(false);
  const [mostrarFormaPagoCombo, setMostrarFormaPagoCombo] = useState(false);
  const [formaPago, setFormaPago] = useState('TRANSFERENCIA USD 1..');
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

  // --- NUEVOS ESTADOS PARA CATÃLOGO DIGITAL ---
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div
        className="w-[320px] h-[650px] bg-black rounded-[3rem] border-[8px] border-gray-800 shadow-2xl relative overflow-hidden flex flex-col"
        style={{
          backgroundImage: 'url(preview.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div> {/* Capa sutil de brillo */}
        {/* PANTALLA 0: INICIO DE SESIÓN (La que ya tenías) */}
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

        {/* PANTALLA 1: ESCRITORIO (Corresponde a 016) */}
        {pantalla === 'escritorio' && (
          <div className="flex-1 bg-blue-800 mt-8 rounded-t-2xl p-4 relative">

            <div className="relative z-10 grid grid-cols-3 gap-6 mt-6 px-4">
              {/* === FEBECA === */}
              <div onClick={() => {
                setEmpresaSeleccionada('Febeca');
                setloginUsername('admin');
                setloginPassword('1111');
                setloginError('');
                setPantalla('login_afv');
              }} title="AFV Febeca" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="logoafv.jpeg" alt="AFV Febeca" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">AFV<br />Febeca</span>
              </div>

              <div onClick={() => { 
                setEmpresaSeleccionada('Febeca'); 
                setSubPantallaCatalog('inicio');
                setPantalla('catalogo'); 
              }} title="Catálogo Febeca" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="logocatalogofebeca.png" alt="Catálogo Febeca" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">Catálogo<br />Febeca</span>
              </div>

              <div onClick={() => { setEmpresaSeleccionada('Febeca'); setPantalla('sds'); }} title="SDS Febeca" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="logo sds febeca.jpg" alt="SDS Febeca" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">SDS<br />Febeca</span>
              </div>

              {/* === SILLACA === */}
              <div onClick={() => {
                setEmpresaSeleccionada('Sillaca');
                setloginUsername('admin');
                setloginPassword('2222');
                setloginError('');
                setPantalla('login_afv');
              }} title="AFV Sillaca" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="logoafv.jpeg" alt="AFV Sillaca" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">AFV<br />Sillaca</span>
              </div>

              <div onClick={() => { setEmpresaSeleccionada('Sillaca'); setPantalla('catalogo'); }} title="Catálogo Sillaca" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="logocatalogosillaca.png" alt="Catálogo Sillaca" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">Catálogo<br />Sillaca</span>
              </div>

              <div onClick={() => { setEmpresaSeleccionada('Sillaca'); setPantalla('sds'); }} title="SDS Sillaca" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="logo sds sillaca.jpg" alt="SDS Sillaca" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">SDS<br />Sillaca</span>
              </div>

              {/* === BEVAL === */}
              <div onClick={() => {
                setEmpresaSeleccionada('Beval');
                setloginUsername('admin');
                setloginPassword('3333');
                setloginError('');
                setPantalla('login_afv');
              }} title="AFV Beval" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="logoafv.jpeg" alt="AFV Beval" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">AFV<br />Beval</span>
              </div>

              <div onClick={() => { setEmpresaSeleccionada('Beval'); setPantalla('catalogo'); }} title="Catálogo Beval" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="logoscatalogobeval.png" alt="Catálogo Beval" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">Catálogo<br />Beval</span>
              </div>

              <div onClick={() => { setEmpresaSeleccionada('Beval'); setPantalla('sds'); }} title="SDS Beval" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="logo sds beval.jpg" alt="SDS Beval" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">SDS<br />Beval</span>
              </div>

              {/* === COFERSA === */}
              <div onClick={() => {
                setEmpresaSeleccionada('Cofersa');
                setloginUsername('admin');
                setloginPassword('4444');
                setloginError('');
                setPantalla('login_afv');
              }} title="AFV Cofersa" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="img/Cofersa.png" alt="AFV Cofersa" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">AFV<br />Cofersa</span>
              </div>

              <div onClick={() => { 
                setEmpresaSeleccionada('Cofersa'); 
                setSubPantallaCatalog('inicio');
                setPantalla('catalogo'); 
              }} title="Catálogo Cofersa" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="img/Cofersa.png" alt="Catálogo Cofersa" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">Catálogo<br />Cofersa</span>
              </div>

              <div onClick={() => { setEmpresaSeleccionada('Cofersa'); setPantalla('sds'); }} title="SDS Cofersa" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="img/Cofersa.png" alt="SDS Cofersa" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">SDS<br />Cofersa</span>
              </div>

              {/* === MUNDIAL DE PARTES === */}
              <div onClick={() => {
                setEmpresaSeleccionada('Mundial de Partes');
                setloginUsername('admin');
                setloginPassword('5555');
                setloginError('');
                setPantalla('login_afv');
              }} title="AFV Mundial" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="img/Mundial.png" alt="AFV Mundial" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">AFV<br />Mundial</span>
              </div>

              <div onClick={() => { 
                setEmpresaSeleccionada('Mundial de Partes'); 
                setSubPantallaCatalog('inicio');
                setPantalla('catalogo'); 
              }} title="Catálogo Mundial" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="img/Mundial.png" alt="Catálogo Mundial" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">Catálogo<br />Mundial</span>
              </div>

              <div onClick={() => { setEmpresaSeleccionada('Mundial de Partes'); setPantalla('sds'); }} title="SDS Mundial" className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                  <img src="img/Mundial.png" alt="SDS Mundial" className="w-full h-full object-contain rounded-xl" />
                </div>
                <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">SDS<br />Mundial</span>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA: CATALOGO DIGITAL */}
        {pantalla === 'catalogo' && (
          <div className="flex-1 bg-[#f5f5f5] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden font-sans">
            {/* CABECERA ESTILO SMARTSALES */}
            <div className="p-3 flex items-center justify-between shadow-md z-30" style={{ backgroundColor: theme.bg, color: theme.text }}>
              <div className="flex items-center gap-3">
                <button onClick={() => setMostrarMenuCategorias(true)} className="text-2xl">☰</button>
                <div className="h-8 w-24">
                  <img src={
                    empresaSeleccionada === 'Febeca' ? 'logotipofebeca.jpg' : 
                    empresaSeleccionada === 'Sillaca' ? 'logotiposillaca.jpeg' : 
                    empresaSeleccionada === 'Beval' ? 'logotipobeval.jpg' :
                    empresaSeleccionada === 'Cofersa' ? 'img/Cofersa.png' :
                    'img/Mundial.png'
                  } alt="Logo" className="h-full w-full object-contain brightness-0 invert" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-xl">🔍</button>
                <button className="text-xl relative">
                  🛒
                  {carrito.length > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center border border-white font-bold">{carrito.length}</span>
                  )}
                </button>
                <button onClick={() => setPantalla('escritorio')} className="text-xl">✕</button>
              </div>
            </div>

            {/* BUSCADOR PROMINENTE */}
            <div className="bg-white p-3 shadow-sm z-20 flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar Producto..."
                  className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 text-sm outline-none border border-gray-200"
                  value={busquedaCatalog}
                  onChange={(e) => {
                    setBusquedaCatalog(e.target.value);
                    if (e.target.value.length > 2) setSubPantallaCatalog('busqueda');
                  }}
                />
                <span className="absolute left-3 top-2.5 opacity-40">🔍</span>
              </div>
              <button className="bg-gray-800 text-white text-[10px] px-3 rounded-full font-bold uppercase tracking-tighter">Buscar por</button>
            </div>

            {/* CONTENIDO DINÁMICO SEGÚN SUBPANTALLA */}
            <div className="flex-1 overflow-y-auto pb-6">
              
              {subPantallaCatalog === 'inicio' && (
                <>
                  {/* SALUDO */}
                  <div className="p-4 bg-white mb-2">
                    <p className="text-[13px] text-gray-800 font-medium">¡Bienvenido!, <span className="font-bold">INVERSIONES ALAFV, C.A.</span></p>
                  </div>

                  {/* BANNER CARRUSEL (Simulado con imagen principal) */}
                  <div className="px-4 mb-4">
                    <div className="w-full h-40 bg-blue-100 rounded-xl overflow-hidden shadow-sm relative">
                      <img src="catalogo.jpg" className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex flex-col justify-end p-4">
                        <span className="text-white text-xs font-bold bg-blue-600 self-start px-2 py-0.5 rounded-full mb-1">PROMO</span>
                        <h3 className="text-white font-bold text-lg">Nueva Línea EMTOP</h3>
                      </div>
                    </div>
                  </div>

                  {/* MARCAS DESTACADAS */}
                  <div className="px-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Marcas Destacadas</h4>
                      <button className="text-blue-600 text-[11px] font-bold">VER TODAS</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Emtop', img: 'logo emtop horizontal.jpg' },
                        { name: 'Arctic', img: 'catalogo.jpg' } // Fallback
                      ].map(marca => (
                        <div key={marca.name} onClick={() => setSubPantallaCatalog('busqueda')} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
                          <img src={marca.img} className="h-12 w-full object-contain" />
                          <span className="text-[10px] font-bold text-gray-500">{marca.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RECIENTEMENTE VISTOS */}
                  <div className="px-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Vistos recientemente</h4>
                      <button className="text-blue-600 text-[11px] font-bold">VER TODAS</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
                      {productosBusqueda.map(prod => (
                        <div key={prod.sku} className="min-w-[140px] bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden snap-start">
                          <div className="h-28 bg-gray-50 p-4 flex items-center justify-center text-3xl">{prod.imagen}</div>
                          <div className="p-2">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">{prod.marca}</p>
                            <p className="text-[10px] text-gray-700 font-bold line-clamp-2 h-7 mb-1">{prod.nombre}</p>
                            <p className="text-blue-600 font-bold text-xs">USD {prod.precio.toFixed(2)}</p>
                            <div className="flex justify-between mt-2 pt-2 border-t border-gray-50">
                              <button className="text-gray-300">🤍</button>
                              <button onClick={() => setCarrito([...carrito, prod])} className="text-blue-600">🛒</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {subPantallaCatalog === 'busqueda' && (
                <div className="p-2 space-y-2">
                  <div className="flex justify-between items-center px-2 py-1">
                    <button onClick={() => { setSubPantallaCatalog('inicio'); setCategoriaSeleccionada('TODOS'); }} className="text-blue-600 text-xs font-bold">← Volver</button>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{categoriaSeleccionada} | {productosBusqueda.filter(p => (categoriaSeleccionada === 'TODOS' || p.categoria === categoriaSeleccionada) && p.nombre.toLowerCase().includes(busquedaCatalog.toLowerCase())).length} Resultados</span>
                  </div>
                  {productosBusqueda.filter(p => (categoriaSeleccionada === 'TODOS' || p.categoria === categoriaSeleccionada) && p.nombre.toLowerCase().includes(busquedaCatalog.toLowerCase())).map(prod => (
                    <div key={prod.sku} onClick={() => { setProductoSeleccionado(prod); setSubPantallaCatalog('detalle'); }} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 relative cursor-pointer active:bg-gray-50">
                      <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center text-4xl">{prod.imagen}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[8px] text-gray-400 font-bold tracking-tighter uppercase">{prod.marca} | {prod.sku}</p>
                            <h5 className="text-[12px] text-gray-800 font-bold leading-tight mb-1">{prod.nombre}</h5>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-[10px] text-gray-500">Disp: <span className="font-bold text-green-600">99+ UND</span></p>
                          <div className="flex justify-between items-end mt-1">
                            <p className="text-blue-600 font-black text-sm">USD {prod.precio.toFixed(2)}</p>
                            <div className="flex gap-2">
                               <button className="p-1.5 bg-gray-100 rounded-full text-gray-400 text-[10px]">🤍</button>
                               <button onClick={(e) => { e.stopPropagation(); setCarrito([...carrito, prod]); }} className="p-1.5 bg-blue-600 text-white rounded-full text-[10px]">🛒</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {subPantallaCatalog === 'detalle' && productoSeleccionado && (
                <div className="bg-white min-h-full pb-10">
                   <div className="p-4 flex items-center gap-2 border-b">
                      <button onClick={() => setSubPantallaCatalog('busqueda')} className="text-blue-600 text-lg">←</button>
                      <span className="font-bold text-sm text-gray-700">Detalles del Producto</span>
                   </div>
                   <div className="w-full h-80 bg-gray-100 p-10 flex items-center justify-center text-8xl mb-4 group relative">
                      {productoSeleccionado.imagen}
                      <button className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full shadow-md">🔍</button>
                   </div>
                   <div className="px-6">
                      <p className="text-xs font-black text-blue-600 mb-1 uppercase tracking-widest">{productoSeleccionado.marca}</p>
                      <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{productoSeleccionado.nombre}</h2>
                      <p className="text-[11px] text-gray-400 mb-6">SKU: {productoSeleccionado.sku} | CAT: {productoSeleccionado.categoria}</p>

                      <div className="flex items-center justify-between mb-8">
                         <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Precio de Lista</p>
                            <p className="text-2xl font-black text-blue-600">USD {productoSeleccionado.precio.toFixed(2)}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Existencia</p>
                             <p className="text-lg font-bold text-green-600">99+ UND</p>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <button onClick={() => setCarrito([...carrito, productoSeleccionado])} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                            <span>🛒</span> ENVIAR A PEDIDO
                         </button>
                         <button className="w-full bg-[#fbd000] text-gray-800 font-bold py-4 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
                            <span>📄</span> ENVIAR A COTIZACIÓN
                         </button>
                      </div>

                      <div className="mt-10 border-t pt-6">
                         <h4 className="font-bold text-sm mb-2 uppercase text-gray-400 tracking-wider">Descripción detallada</h4>
                         <p className="text-xs text-gray-600 leading-relaxed">
                            Este producto de la marca {productoSeleccionado.marca} cumple con los estándares de calidad más exigentes del mercado ferretero.
                            Ideal para uso profesional y doméstico intenso. Garantía limitada de fábrica incluida con la compra.
                         </p>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* OVERLAY MENÚ LATERAL (CATEGORÍAS Y OPCIONES) */}
            {mostrarMenuCategorias && (
              <div className="fixed inset-0 z-[100] flex animate-fade-in">
                {/* Fondo Oscuro con Blur */}
                <div onClick={() => setMostrarMenuCategorias(false)} className="flex-1 bg-black/40 backdrop-blur-sm"></div>
                
                {/* Menú Lateral Deslizable desde la izquierda */}
                <div className="w-80 bg-white h-full shadow-2xl flex flex-col animate-slide-in-left absolute left-0 top-0">
                  {/* Header del Menú */}
                  <div className="p-6 flex items-center gap-4 border-b shadow-sm" style={{ backgroundColor: theme.bg, color: theme.text }}>
                    <div className="w-12 h-12 bg-white rounded-full p-2 flex items-center justify-center shadow-md">
                       <img src={
                         empresaSeleccionada === 'Febeca' ? 'logotipoafv.jpeg' : 
                         empresaSeleccionada === 'Sillaca' ? 'logotiposillaca.jpeg' : 
                         empresaSeleccionada === 'Beval' ? 'logotipobeval.jpg' :
                         empresaSeleccionada === 'Cofersa' ? 'img/Cofersa.png' :
                         'img/Mundial.png'
                       } className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-base leading-none mb-1">{empresaSeleccionada}</p>
                      <p className="text-[10px] opacity-80 uppercase tracking-widest font-medium">Catálogo Digital</p>
                    </div>
                    <button onClick={() => setMostrarMenuCategorias(false)} className="ml-auto text-2xl hover:scale-110 transition-transform">✕</button>
                  </div>
                  
                  {/* Lista de Opciones Scrolleable */}
                  <div className="flex-1 overflow-y-auto py-2 bg-gray-50/50">
                    
                    {/* SECCIÓN 1: Principal */}
                    <div className="bg-white mb-2 pb-2">
                       {[
                         { icon: '🏠', label: 'Inicio', action: () => setSubPantallaCatalog('inicio') },
                         { icon: '🏢', label: 'Mi Compañía' },
                         { icon: '🔔', label: 'Notificaciones', badge: '19 nuevas' },
                         { icon: '❤️', label: 'Listas de Productos' },
                         { icon: '👍', label: 'Recomendados' },
                         { icon: '👥', label: 'Clientes' }
                       ].map((item, i) => (
                         <button key={i} onClick={() => { if(item.action) item.action(); setMostrarMenuCategorias(false); }} className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 active:bg-blue-50 transition-colors border-b border-gray-50 group">
                           <span className="text-xl w-6 text-center">{item.icon}</span>
                           <span className="text-[13px] font-semibold text-gray-700 flex-1 text-left">{item.label}</span>
                           {item.badge && <span className="text-[10px] italic text-blue-500 font-bold">{item.badge}</span>}
                         </button>
                       ))}
                    </div>

                    {/* SECCIÓN 2: Solicitudes de Cotización */}
                    <div className="px-6 py-2">
                       <h5 className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2">Solicitudes de Cotización</h5>
                    </div>
                    <div className="bg-white mb-2">
                       {[
                         { icon: '🛒', label: 'Solicitud Abierta' },
                         { icon: '📋', label: 'Solicitudes Cerradas' }
                       ].map((item, i) => (
                         <button key={i} className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 border-b border-gray-50">
                           <span className="text-lg w-6 text-center opacity-60">{item.icon}</span>
                           <span className="text-[13px] font-semibold text-gray-700 flex-1 text-left">{item.label}</span>
                         </button>
                       ))}
                    </div>

                    {/* SECCIÓN 3: Mis Cotizaciones */}
                    <div className="px-6 py-2">
                       <h5 className="text-[11px] font-black text-[#fbd000] uppercase tracking-widest mb-2">Mis Cotizaciones</h5>
                    </div>
                    <div className="bg-white mb-2">
                       {[
                         { icon: '🛒', label: 'Cotizaciones Abiertas' },
                         { icon: '📋', label: 'Cotizaciones Cerradas' }
                       ].map((item, i) => (
                         <button key={i} className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 border-b border-gray-50">
                           <span className="text-lg w-6 text-center opacity-60">{item.icon}</span>
                           <span className="text-[13px] font-semibold text-gray-700 flex-1 text-left">{item.label}</span>
                         </button>
                       ))}
                    </div>

                    {/* SECCIÓN 4: Comunicación */}
                    <div className="px-6 py-2">
                       <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Comunicación</h5>
                    </div>
                    <div className="bg-white mb-2">
                       {[
                         { icon: '✉️', label: 'Contáctanos' },
                         { icon: '🔗', label: 'Invitar Amigos' }
                       ].map((item, i) => (
                         <button key={i} className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 border-b border-gray-50">
                           <span className="text-lg w-6 text-center opacity-60">{item.icon}</span>
                           <span className="text-[13px] font-semibold text-gray-700 flex-1 text-left">{item.label}</span>
                         </button>
                       ))}
                    </div>

                    {/* SECCIÓN 5: Configuración (de menucatalogofebeca2) */}
                    <div className="px-6 py-2">
                       <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Configuración</h5>
                    </div>
                    <div className="bg-white mb-2">
                       {[
                         { icon: '👤', label: 'Mi Cuenta' },
                         { icon: '🖼️', label: 'Manejo de Imágenes' }
                       ].map((item, i) => (
                         <button key={i} className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 border-b border-gray-50">
                           <span className="text-lg w-6 text-center opacity-60">{item.icon}</span>
                           <span className="text-[13px] font-semibold text-gray-700 flex-1 text-left">{item.label}</span>
                         </button>
                       ))}
                    </div>

                    {/* SECCIÓN 6: Ayuda */}
                    <div className="px-6 py-2">
                       <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Ayuda</h5>
                    </div>
                    <div className="bg-white">
                       {[
                         { icon: '📖', label: 'Mensaje Bienvenida' },
                         { icon: '⚠️', label: 'Reportar Error' },
                         { icon: 'ℹ️', label: 'Acerca de' }
                       ].map((item, i) => (
                         <button key={i} className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 border-b border-gray-50">
                           <span className="text-lg w-6 text-center opacity-60">{item.icon}</span>
                           <span className="text-[13px] font-semibold text-gray-700 flex-1 text-left">{item.label}</span>
                         </button>
                       ))}
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANTALLA: SDS APP */}
        {pantalla === 'sds' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal font-sans">Módulo SDS - {empresaSeleccionada || 'Febeca'}</span>
              </div>
              <button onClick={() => setPantalla('escritorio')} className="text-xl leading-none">✕</button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Aplicación SDS</h2>
              <p className="text-sm text-gray-500 mb-6">Módulo en construcción.</p>
              <div className={`w-32 h-32 opacity-30 grayscale`}>
                <img src={empresaSeleccionada === 'Febeca' ? 'logo sds febeca.jpg' : empresaSeleccionada === 'Sillaca' ? 'logo sds sillaca.jpg' : 'logo sds beval.jpg'} alt="SDS" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 1.5: LOGIN AFV */}
        {pantalla === 'login_afv' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal font-sans">Login AFV - {empresaSeleccionada || 'Febeca'}</span>
              </div>
              <button onClick={() => setPantalla('escritorio')} className="text-xl leading-none">←</button>
            </div>
            <div className="flex-1 flex flex-col p-6 items-center justify-center">
              <h2 className="text-xl font-bold text-gray-800 mb-6 font-sans">Bienvenido</h2>

            <div className="w-full space-y-4 font-sans">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Usuario</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setloginUsername(e.target.value)}
                  className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-1 px-2 text-sm bg-gray-50 rounded-t"
                  placeholder="Ingrese el usuario"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setloginPassword(e.target.value)}
                  className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-1 px-2 text-sm bg-gray-50 rounded-t"
                  placeholder="Ingrese la contraseña"
                />
              </div>

              {loginError && (
                <p className="text-red-500 text-[10px] font-bold text-center mt-2">{loginError}</p>
              )}

              <button
                onClick={async () => {
                  try {
                    const { data, error } = await supabase
                      .from('usuarios')
                      .select('*')
                      .eq('username', loginUsername)
                      .eq('password', loginPassword)
                      .single();

                    if (data) {
                      setloginError('');
                      setPantalla('config');
                    } else {
                      setloginError('Usuario o contraseña incorrectos.');
                    }
                  } catch (err) {
                    setloginError('Error de conexión con la base de datos.');
                  }
                }}
                className="w-full text-white font-bold py-3 mt-4 rounded-lg shadow-md transition-colors"
                style={{ backgroundColor: theme.bg }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.border}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.bg}
              >
                INGRESAR
              </button>
            </div>
          </div>
        </div>
        )}

        {/* PANTALLA 2: CONFIGURACIÓN (Corresponde a 016a) */}
        {pantalla === 'config' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col overflow-hidden">
            <div className="p-3 flex items-center justify-between shadow-md border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <span className="font-bold text-[11px] uppercase tracking-wider">016a - Configuración - {empresaSeleccionada}</span>
              <span className="text-xl leading-none">⋮</span>
            </div>

            <div className="p-5 flex-1 space-y-5">
              <div className="border-b-2 border-[#009bba] pb-1">
                <label className="text-[10px] font-bold text-[#009bba]">Nombre del Vendedor</label>
                <p className="text-xs font-semibold text-gray-700 mt-1">Alberto Gonzalez</p>
              </div>

              <div className="border-b-2 border-gray-300 pb-1 relative">
                <label className="text-[10px] font-bold text-gray-500">Zona de Venta</label>
                <select className="w-full bg-transparent text-xs font-semibold text-gray-800 outline-none appearance-none mt-1">
                  <option>Z072 - ZONA 72</option>
                </select>
                <div className="absolute right-0 bottom-2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-500"></div>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <div>
                  <p className="text-[9px] font-bold text-[#009bba] mb-1">Fecha:</p>
                  <p className="text-[10px] font-semibold text-gray-600">22-02-2026</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-[#009bba] mb-1">Hora:</p>
                  <p className="text-[10px] font-semibold text-gray-600">08:30 AM</p>
                </div>
              </div>
            </div>

            <div className="p-4 flex gap-4 bg-white border-t border-gray-100">
              <button onClick={() => setPantalla('escritorio')} title="Regresar a la pantalla principal o salir de la configuración" className="flex-1 bg-[#ccc] py-2.5 rounded text-[11px] font-bold text-gray-700 shadow-sm active:bg-gray-400">SALIR</button>
              <button onClick={() => setPantalla('menu')} title="Guardar configuración de zona y vendedor y continuar" className="flex-1 bg-[#ccc] py-2.5 rounded text-[11px] font-bold text-gray-700 shadow-sm active:bg-gray-400">SIGUIENTE</button>
            </div>
          </div>
        )}

        {/* PANTALLA 3: MENÚ VENTAS Y SUBMENÚ (Corresponde a 107) */}
        {pantalla === 'menu' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="p-3 flex items-center justify-between shadow-md border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <button onClick={() => setPantalla('config')} className="text-lg leading-none">← </button>
                <span className="font-bold text-[11px] uppercase tracking-wider">073 - Ventas menú - {empresaSeleccionada}</span>
              </div>
              <span onClick={() => setMostrarSubmenu(!mostrarSubmenu)} className="text-xl leading-none cursor-pointer">⋮</span>
            </div>

            {/* PANTALLA 4: EL SUBMENÚ FLOTANTE */}
            {mostrarSubmenu && (
              <div className="absolute right-2 top-12 bg-white shadow-2xl rounded border border-gray-200 z-50 w-48 overflow-hidden">
                <button onClick={() => { setMostrarSubmenu(false); setPantalla('menu'); }} className="w-full text-left px-4 py-3 text-[13px] font-semibold text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                  Ventas
                </button>
                <button onClick={() => { setMostrarSubmenu(false); setPantalla('recibo_cliente'); }} className="w-full text-left px-4 py-3 text-[13px] font-semibold text-gray-700 hover:bg-gray-100">
                  Cobranza
                </button>
              </div>
            )}

            <div className="p-5 flex flex-col gap-3 flex-1 overflow-y-auto bg-gray-50">
              {[
                { label: 'PEDIDOS DEL CATÁLOGO', action: () => setPantalla('pedidos_catalogo'), demoFn: runDemoCatalogo },
                { label: 'GESTIÓN DE VENTAS', action: () => setPantalla('clientes'), demoFn: runDemoGestionVentas },
                { label: 'COBRANZA EN BS', action: () => setPantalla('recibo_cliente'), demoFn: runDemoCobranzaBs },
                { label: 'COBRANZA EN DÓLARES', action: () => setPantalla('recibo_cliente'), demoFn: runDemoCobranza },
                { label: 'RETENCIONES DE IVA', action: () => setPantalla('retencion_list'), demoFn: runDemoRetencion }
              ].map(opcion => (
                <div key={opcion.label} className="flex gap-2 w-full">
                  <button
                    onClick={!opcion.disabled ? opcion.action : undefined}
                    title={opcion.disabled ? 'Opción no disponible por ahora' : `Ir a la sección de ${opcion.label}`}
                    className={`flex-1 bg-[#ccc] py-3.5 rounded text-[11px] font-bold text-gray-800 shadow-sm transition-all ${opcion.disabled ? 'opacity-50 cursor-not-allowed' : 'active:bg-gray-400'}`}
                  >
                    {opcion.label}
                  </button>
                  {opcion.demoFn && (
                    <button
                      onClick={wrapDemo(opcion.demoFn)}
                      title="Ejecutar simulación automática (Ghost Mouse)"
                      className="bg-red-600 text-white font-bold text-[10px] px-2 rounded shadow-sm hover:bg-red-500 active:bg-red-700 transition-colors flex items-center justify-center shrink-0 w-10"
                    >
                      Run
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANTALLA 5: PEDIDOS DEL CATÃLOGO (118) */}
        {pantalla === 'pedidos_catalogo' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            {/* Cabecera Celeste Dinámica */}
            <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal font-sans">118 - Pedidos del Catálogo - {empresaSeleccionada}</span>
              </div>
              <span className="text-xl leading-none">⋮</span>
            </div>

            {/* Contenido */}
            <div className="flex-1 flex flex-col p-2 bg-white overflow-hidden">

              {/* Barra de Cliente */}
              <div className="flex items-center justify-between mb-2">
                <div className="bg-[#d3d3d3] py-2 px-2 flex-1 mr-2 border border-gray-300">
                  <span className="text-[13px] text-gray-800 font-sans">FM IMPORT PARTS, C.A. - 2535</span>
                </div>
                <button onClick={() => setPantalla('menu')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">
                  ←
                </button>
              </div>

              {/* Tabla de Pedidos */}
              <div className="flex-1 border border-gray-500 flex flex-col overflow-hidden bg-white mb-2">
                {/* Encabezado de la Tabla */}
                <div className="grid grid-cols-3 bg-[#a6a6a6] text-white font-bold text-[12px] p-2 font-sans outline outline-1 outline-gray-400">
                  <div className="border-r border-gray-400 border-opacity-30">Cliente</div>
                  <div className="border-r border-gray-400 border-opacity-30 pl-2">Pedido</div>
                  <div className="pl-2">Fecha</div>
                </div>

                {/* Filas de la Tabla */}
                <div className="flex-1 overflow-y-auto font-sans">

                  {/* Fila Seleccionada (Celeste) */}
                  <div className="grid grid-cols-3 bg-[#00b0f0] text-black font-bold text-[13px] px-2 py-1.5 border-b border-gray-200">
                    <div>2535249</div>
                    <div className="pl-2">1000059</div>
                    <div className="pl-2 relative -left-1">06-09-20</div>
                  </div>

                  {/* Filas Normales (Blancas) */}
                  {[
                    ['2531963', '1000023', '05-09-20'],
                    ['0182000', '1000016', '05-09-20'],
                    ['2535111', '4', '04-09-20'],
                    ['0182000', '1000015', '04-09-20'],
                    ['0182000', '1000014', '04-09-20']
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-3 bg-white text-black font-bold text-[13px] px-2 py-1.5 border-b border-gray-200">
                      <div>{row[0]}</div>
                      <div className="pl-2">{row[1]}</div>
                      <div className="pl-2 relative -left-1">{row[2]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones Inferiores Compartidos */}
              <div className="flex justify-center gap-2 mb-1 mt-1 px-4">
                <button title="Descartar este pedido del catálogo y eliminar la cotización" className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] py-1.5 px-3 text-[13px] font-sans flex-1 shadow-sm active:bg-[#d4d4d4]">
                  Descartar
                </button>
                <button onClick={() => setPantalla('detalles_pedido')} title="Ver el detalle de los artículos y continuar con este pedido" className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] py-1.5 px-3 text-[13px] font-sans flex-1 shadow-sm active:bg-[#d4d4d4]">
                  Ver Detalles
                </button>
              </div>

              {/* Pie de página pequeño */}
              <div className="text-[7.5px] text-gray-500 font-sans mt-1">
                © Copyright Wholesale World Information Systems LTD, 2014
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 6: DETALLES DEL PEDIDO (119) */}
        {pantalla === 'detalles_pedido' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            {/* Cabecera Celeste Dinámica */}
            <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal font-sans">119 - Detalle Pedido Catálogo - {empresaSeleccionada}</span>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 flex flex-col p-2 bg-white overflow-hidden">

              {/* Barra de Cliente (Igual que 118) */}
              <div className="flex items-center justify-between mb-2">
                <div className="bg-[#d3d3d3] py-2 px-2 flex-1 mr-2 border border-gray-300 overflow-hidden whitespace-nowrap text-ellipsis">
                  <span className="text-[13px] text-gray-800 font-sans block truncate">2535249 - FM IMPORT PARTS, </span>
                </div>
                <button onClick={() => setPantalla('pedidos_catalogo')} title="Regresar a la lista de pedidos del catálogo" className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">
                  ←
                </button>
              </div>

              {/* Sub-banner texto */}
              <div className="mb-2">
                <p className="text-[10px] text-gray-700 font-sans leading-tight">
                  0113020 - EXTENSION PROFESIONAL ST<br />
                  2X16AWG, 5 TOMAS NEGRO 10MTS. ARRIGO
                </p>
              </div>

              {/* Tabla de Productos */}
              <div className="flex-1 border border-gray-500 flex flex-col overflow-hidden bg-white mb-2">
                {/* Encabezado de la Tabla */}
                <div className="flex bg-[#a6a6a6] text-white font-bold text-[12px] p-2 font-sans outline outline-1 outline-gray-400">
                  <div className="flex-1 border-r border-gray-400 border-opacity-30">Producto</div>
                  <div className="w-12 pl-2 text-center">Can</div>
                </div>

                {/* Filas de la Tabla */}
                <div className="flex-1 overflow-y-auto font-sans">

                  {/* Fila Seleccionada (Celeste) */}
                  <div className="flex bg-[#00b0f0] text-black font-bold text-[10px] px-2 py-2 border-b border-gray-200">
                    <div className="flex-1 truncate pr-2">EXTENSION PROFESIONAL ST 2</div>
                    <div className="w-12 text-center">1.0</div>
                  </div>

                  {/* Filas Normales (Blancas) */}
                  {[
                    ['CINTA DE EMBALAJE TRANSPA', '6.0'],
                    ['CINTA DE EMBALAJE MARRON', '6.0'],
                    ['SPECTRAL BLANCO 1 GAL. QUI', '1.0'],
                    ['TEIPE ELECTRICO TEMFLEX 16', '10.0'],
                    ['BOMBILLO LED COLMENA 25 UI', '25.0']
                  ].map((row, i) => (
                    <div key={i} className="flex bg-white text-black font-bold text-[10px] px-2 py-2 border-b border-gray-200">
                      <div className="flex-1 truncate pr-2">{row[0]}</div>
                      <div className="w-12 text-center">{row[1]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón Inferior */}
              <div className="flex justify-center mb-1 mt-1">
                <button onClick={() => setPantalla('promociones_asociativas')} title="Convertir este pedido en una cotización y aplicar promociones posibles" className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] py-1.5 px-6 text-[13px] font-sans shadow-sm active:bg-[#d4d4d4]">
                  Crear Cotización
                </button>
              </div>

              {/* Pie de página pequeño */}
              <div className="text-[7.5px] text-gray-500 font-sans mt-1">
                © Copyright Wholesale World Information Systems LTD, 2014
              </div>
            </div>
          </div>
        )}
        {/* PANTALLA 7: PROMOCIONES ASOCIATIVAS (107) */}
        {pantalla === 'promociones_asociativas' && (
          <div className="flex-1 bg-gray-500 mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            {/* Cabecera Dinámica */}
            <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal font-sans">107 - Promociones Asociativas - {empresaSeleccionada}</span>
              </div>
            </div>

            {/* Contenido principal atenuado por el modal */}
            <div className="flex-1 flex flex-col relative">
              <div className="p-3">
                <p className="text-[14px] font-bold text-black font-sans mb-1">ARRIGO 36pzas 7% NACIONAL</p>
                <p className="text-[14px] font-bold text-black font-sans mb-2">Promociones Asociativas</p>

                <div className="border border-gray-400">
                  <div className="flex bg-[#808080] text-[#cccccc] font-bold text-[13px] p-2 border-b border-gray-500">
                    <div className="flex-1 text-center">Marca</div>
                    <div className="flex-1 text-center">Cant. P.</div>
                  </div>
                  <div className="flex bg-[#00b0f0] text-black font-bold text-[13px] p-2 border-b border-gray-400">
                    <div className="flex-1 text-center font-sans tracking-wide">ARRIGO 36P</div>
                    <div className="flex-1 text-center font-sans tracking-wide">36,00</div>
                  </div>
                </div>
              </div>

              {/* Panel inferior */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-500 border-t border-gray-600">
                <div className="flex items-end justify-between">
                  <div className="flex items-center border-b border-gray-600 pb-0.5 flex-1 mr-4">
                    <span className="text-[11px] font-bold text-black mr-2">Descuento (%):</span>
                    <span className="text-[14px] text-gray-800 flex-1">7</span>
                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-t-[5px] border-t-gray-800 border-r-[5px] border-r-transparent ml-1 mb-1"></div>
                  </div>
                  <button onClick={() => setMostrarModalOtorgar(true)} title="Otorgar el descuento promocional indicado" className="bg-[#808080] text-black px-4 py-1.5 text-[13px] font-sans border border-gray-600 shadow-sm active:bg-gray-400">
                    Otorgar
                  </button>
                </div>
              </div>

              {/* Modal Oscurecedor */}
              {mostrarModalOtorgar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 pb-20 z-10">
                  {/* Tarjeta Modal Confirmación */}
                  <div className="bg-[#f0f0f0] w-full rounded shadow-2xl overflow-hidden shadow-black">
                    <div className="border-b-2 border-[#00b0f0] p-3 flex items-center gap-2 bg-[#f0f0f0]">
                      <div className="opacity-60 text-[#00b0f0] text-2xl leading-none">

                      </div>
                      <span className="text-[16px] text-[#00b0f0] font-sans">Confirmación</span>
                    </div>
                    <div className="bg-[#f9f9f9] p-4 border-b border-gray-300">
                      <p className="text-[14px] text-gray-800 font-sans">
                        ¿Desea ¿Desea otorgar 7 porciento de descuento?
                      </p>
                    </div>
                    <div className="flex bg-[#f9f9f9]">
                      <button onClick={() => setMostrarModalOtorgar(false)} title="Cancelar el descuento y cerrar esta promoción" className="flex-1 py-3 text-[14px] text-gray-800 font-sans border-r border-gray-300 active:bg-gray-200">
                        No
                      </button>
                      <button onClick={() => { setMostrarModalOtorgar(false); setPantalla('finalizar_pedido'); }} title="Aceptar el descuento y avanzar al cierre del pedido" className="flex-1 py-3 text-[14px] text-gray-800 font-sans active:bg-gray-200">
                        Si
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* PANTALLA 8: FINALIZAR PEDIDO (016) */}
        {pantalla === 'finalizar_pedido' && (
          <div className="flex-1 bg-[#b3b3b3] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            {/* Cabecera Dinámica */}
            <div className="p-2.5 flex items-center border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal font-sans">016 - Finalizar Pedido - {empresaSeleccionada}</span>
              </div>
            </div>

            {/* Contenido Formulario */}
            <div className="flex-1 overflow-y-auto p-2">

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Pedido:</span>
                <div className="flex-1 bg-[#999999] text-black text-right pr-2 py-0.5 font-sans text-[13px]">62115</div>
                <button onClick={() => setPantalla('promociones_asociativas')} title="Regresar a Promociones Asociativas" className="ml-2 w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#8a8a8a] shadow-sm flex-shrink-0">
                  ←
                </button>
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Fecha:</span>
                <div className="flex-1 bg-[#999999] text-black text-right pr-2 py-0.5 font-sans text-[13px] mr-9">14-09-2024</div>
              </div>
              {/*<div className="flex items-center mb-2 border-b border-gray-400 pb-1 relative">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans shrink-0">Forma Pago:</span>
                <div
                  className="flex-1 flex justify-between items-center bg-transparent border-0 font-sans text-[12px] text-black cursor-pointer mr-9"
                  onClick={() => setMostrarFormaPagoCombo(true)}
                  title="Pulse para elegir la forma de pago"
                >
                  <span className="truncate">{formaPago}</span>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-gray-600 border-r-[6px] border-r-transparent mr-1"></div>
                </div>
              </div>
              */}
              <div className="flex items-center mb-2 border-b border-gray-400 pb-1 relative">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans shrink-0">Nivel:</span>
                <div
                  className="flex-1 flex justify-between items-center bg-transparent border-0 font-sans text-[12px] text-black cursor-pointer mr-9"
                  onClick={() => setMostrarComboNivel(!mostrarComboNivel)}
                  title="Pulse para elegir el nivel del pedido"
                >
                  <span className="truncate">{nivelSeleccionado}</span>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-gray-600 border-r-[6px] border-r-transparent mr-1"></div>
                </div>

                {/* Combo Nivel Catalogo */}
                {mostrarComboNivel && (
                  <div className="absolute top-8 left-0 right-0 bg-white border border-gray-300 shadow-xl z-50">
                    {['MAYOREOB', 'MAYOREOD'].map(nivel => (
                      <div
                        key={nivel}
                        className="p-3 border-b border-gray-100 active:bg-blue-100 text-[12px] font-sans text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNivelSeleccionado(nivel);
                          if (nivel === 'MAYOREOB') {
                            setCondicionPedido('10% hasta 7 días');
                          } else if (nivel === 'MAYOREOD') {
                            setCondicionPedido('');
                          }
                          setMostrarComboNivel(false);
                        }}
                      >
                        {nivel}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center mb-2 border-b border-gray-400 pb-1 relative">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans shrink-0">Condición:</span>
                <div className="flex-1 flex justify-between items-center text-gray-500 font-sans text-[12px] mr-9 h-[18px]">
                  <span className="truncate">{condicionPedido}</span>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-gray-400 border-r-[6px] border-r-transparent mr-1"></div>
                </div>
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Flete (USD):</span>
                <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[12px] px-2 py-1 text-right">1,22</div>
                <div className="bg-white border border-gray-400 text-black font-sans text-[11px] px-2 py-1 w-10 text-center ml-1">50</div>
                <span className="text-[10px] text-gray-500 ml-1">(%)</span>
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Subtotal ($):</span>
                <div className="flex-1 bg-[#999999] text-black text-right pr-2 py-0.5 font-sans text-[13px]">75,96</div>
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans shrink-0">IVA Ret. 12% :</span>
                <div className="bg-[#999999] text-black text-right pr-2 py-0.5 font-sans text-[13px] flex-1">9,12</div>
                <button title="Opciones adicionales de retención de impuestos" className="bg-[#cccccc] text-black px-2 py-0.5 ml-1 font-sans text-[12px] shadow-sm active:bg-[#bbbbbb]">Opc.</button>
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans shrink-0">IVA Rest. 4% :</span>
                <div className="flex-1 bg-[#999999] text-black text-right pr-2 py-0.5 font-sans text-[13px]">3,04</div>
              </div>

              <div className="flex items-center mb-3">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Total ($):</span>
                <div className="flex-1 bg-[#999999] text-black text-right pr-2 py-0.5 font-sans text-[13px]">88,11</div>
                <button onClick={() => setMostrarModalCierra1(true)} title="Iniciar proceso de guardado y cierre para este documento" className="bg-[#cccccc] text-black px-3 py-0.5 ml-1 font-sans text-[13px] font-bold shadow-sm border border-[#a6a6a6] active:bg-[#bbbbbb]">Fin</button>
              </div>

              {/* Tabla Monto Pedido */}
              <div className="border border-gray-400 mb-3">
                <div className="flex bg-[#a6a6a6] text-white font-bold text-[10px] font-sans">
                  <div className="flex-1 text-center py-1 border-r border-gray-300">Monto Pedido (USD)</div>
                  <div className="flex-1 text-center py-1">% Desc</div>
                </div>
                <div className="flex bg-[#00b0f0] text-black font-bold text-[10px] font-sans border-b border-gray-300">
                  <div className="flex-1 text-center py-1 border-r border-gray-300">0-200</div>
                  <div className="flex-1 text-center py-1">50</div>
                </div>
                <div className="flex bg-white text-black text-[10px] font-sans">
                  <div className="flex-1 text-center py-1 border-r border-gray-300">Mayor a201</div>
                  <div className="flex-1 text-center py-1">100</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2 mt-4 pt-4 border-t border-gray-400">
                <span className="text-[12px] font-bold text-black font-sans">Observaciones:</span>
                <button onClick={() => setMostrarModalNegociacion(true)} title="Haga clic para agregar una observación o negociación especial al documento" className="w-8 h-8 bg-[#cccccc] flex items-center justify-center text-black text-lg border border-[#a6a6a6] shadow-sm pb-1 active:bg-[#bbbbbb]">+</button>
              </div>
              <p className="text-[12px] text-black font-sans">Descuento por compras 2%/ clave 00112</p>
            </div>

            {/* Modal Combo Forma Pago */}
            {mostrarFormaPagoCombo && (
              <div className="absolute inset-0 bg-black bg-opacity-30 z-20 flex items-center justify-center">
                <div className="bg-[#f0f0f0] w-[85%] border-t-2 border-[#00b0f0] shadow-2xl">
                  <div className="border-b border-gray-300 p-3">
                    <p className="text-[#333] text-[14px] font-sans">SELECCIONE FORMA DE PAGO</p>
                  </div>
                  <ul className="text-[13px] font-sans text-black">
                    {['TRANSFERENCIA VES 0%', 'DEPOSITO USD 10%', 'TRANSFERENCIA USD 10%'].map(opcion => (
                      <li
                        key={opcion}
                        className="p-3 border-b border-gray-300 active:bg-gray-300 cursor-pointer"
                        onClick={() => {
                          setFormaPago(opcion);
                          setMostrarFormaPagoCombo(false);
                        }}
                      >
                        {opcion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Modal Observaciones (Negociación Especial) */}
            {mostrarModalNegociacion && (
              <div className="absolute inset-0 bg-black bg-opacity-60 z-30 flex items-center justify-center p-4">
                <div className="bg-white w-full border-t-[3px] border-[#00b0f0] shadow-2xl">
                  <div className="flex justify-between items-center p-3 border-b border-gray-300 bg-white">
                    <span className="text-[14px] text-gray-800 font-sans">022 - Observaciones del Pedido</span>
                    <button onClick={() => setMostrarModalNegociacion(false)} title="Cerrar ventana de observaciones sin guardar" className="w-6 h-6 bg-gray-400 rounded-full text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm leading-none">
                      X
                    </button>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-[14px] font-bold text-black font-sans mb-3">NEGOCIACION ESPECIAL</p>
                    <div className="flex gap-2">
                      <div className="flex-1 border-b border-gray-400 pb-1 relative">
                        <span className="text-[12px] text-gray-700 font-sans">NEGOCIACION ESPECI..</span>
                        <div className="absolute right-0 bottom-1 w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-gray-600 border-r-[6px] border-r-transparent"></div>
                      </div>
                      <button onClick={() => setMostrarModalNegociacion(false)} title="Guardar la negociación especial" className="bg-[#d9d9d9] px-3 py-1 text-black font-sans text-[12px]">OK</button>
                      <button onClick={() => setMostrarModalNegociacion(false)} title="Cerrar sin guardar" className="bg-[#d9d9d9] px-3 py-1 text-black font-sans text-[12px]">X</button>
                    </div>
                  </div>
                  <div className="p-1 px-[3px] pb-5 bg-white">
                    <div className="bg-[#00b0f0] p-2 text-black font-bold font-sans text-[13px] border border-[#00b0f0] outline outline-1 outline-inset outline-white">
                      NEGOCIACION ESPECIAL
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Cierra 1 (Añadir artículos) */}
            {mostrarModalCierra1 && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-6 z-40">
                <div className="bg-[#f0f0f0] w-full rounded shadow-2xl overflow-hidden">
                  <div className="border-b-2 border-[#00b0f0] p-3 flex items-center gap-2 bg-[#f0f0f0]">
                    <div className="opacity-60 text-[#00b0f0] text-2xl leading-none">⚠️</div>
                    <span className="text-[16px] text-[#00b0f0] font-sans">Confirmación</span>
                  </div>
                  <div className="bg-[#f9f9f9] p-4 border-b border-gray-300">
                    <p className="text-[14px] text-gray-800 font-sans leading-snug">
                      El monto de su pedido es 88,11 $ con un descuento de 0% en el monto del flete.<br />
                      ¿Desea añadir más articulos al pedido?
                    </p>
                  </div>
                  <div className="flex bg-[#f9f9f9]">
                    <button onClick={() => { setMostrarModalCierra1(false); setMostrarModalCierra2(true); }} title="No agregar más artículos y continuar al cierre" className="flex-1 py-3 text-[14px] text-gray-800 font-sans border-r border-gray-300 active:bg-gray-200">
                      No
                    </button>
                    <button onClick={() => { setMostrarModalCierra1(false); setPantalla('detalles_pedido'); }} title="Regresar al detalle matemático del pedido para añadir artículos" className="flex-1 py-3 text-[14px] text-gray-800 font-sans active:bg-gray-200">
                      Si
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Cierra 2 (Guardar y cerrar) */}
            {mostrarModalCierra2 && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-6 z-50">
                <div className="bg-[#f0f0f0] w-full rounded shadow-2xl overflow-hidden">
                  <div className="border-b-2 border-[#00b0f0] p-3 flex items-center gap-2 bg-[#f0f0f0]">
                    <div className="opacity-60 text-[#00b0f0] text-2xl leading-none">⚠️</div>
                    <span className="text-[16px] text-[#00b0f0] font-sans">Confirmación</span>
                  </div>
                  <div className="bg-[#f9f9f9] p-4 border-b border-gray-300">
                    <p className="text-[14px] text-gray-800 font-sans leading-snug">
                      ¿Desea guardar los Datos y Cerrar el Pedido?
                    </p>
                  </div>
                  <div className="flex bg-[#f9f9f9]">
                    <button onClick={() => setMostrarModalCierra2(false)} title="Cancelar y volver a la pantalla anterior" className="flex-1 py-3 text-[14px] text-gray-800 font-sans border-r border-gray-300 active:bg-gray-200">
                      No
                    </button>
                    <button onClick={() => { setMostrarModalCierra2(false); setPantalla('consulta_pedidos'); }} title="Confirmar, guardar todos los datos y cerrar exitosamente este pedido" className="flex-1 py-3 text-[14px] text-gray-800 font-sans active:bg-gray-200">
                      Si
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* PANTALLA 9: CONSULTA DE PEDIDOS (023) */}
        {pantalla === 'consulta_pedidos' && (
          <div className="flex-1 bg-gray-100 mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            {/* Cabecera Dinámica */}
            <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal font-sans">023 - Consulta de Pedidos - {empresaSeleccionada}</span>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 flex flex-col p-2 bg-white overflow-hidden">
              {/* Barra de Cliente */}
              <div className="flex items-center justify-between mb-2">
                <div className="bg-[#d3d3d3] py-2 px-2 flex-1 mr-2 border border-gray-300 text-ellipsis overflow-hidden">
                  <span className="text-[13px] text-gray-800 font-sans whitespace-nowrap">FM IMPORT PARTS, C.A. - 2535</span>
                </div>
                <button onClick={() => setPantalla('menu')} title="Regresar al menú principal" className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">
                  ←
                </button>
              </div>

              {/* Tabla de Pedidos Cerrados */}
              <div className="flex-1 border border-gray-500 flex flex-col overflow-hidden bg-white mb-2">
                <div className="flex bg-[#a6a6a6] text-white font-bold text-[12px] p-2 font-sans outline outline-1 outline-gray-400">
                  <div className="w-6 border-r border-gray-400 border-opacity-30 text-center">S</div>
                  <div className="flex-1 border-r border-gray-400 border-opacity-30 pl-2">Pedido Origen</div>
                  <div className="flex-1 pl-2 text-right pr-2">Pedido</div>
                </div>
                <div className="flex-1 overflow-y-auto font-sans">
                  <div className="flex bg-[#00b0f0] text-black font-bold text-[13px] px-2 py-1.5 border-b border-gray-200 items-center">
                    <div className="w-6 text-center">A</div>
                    <div className="flex-1 pl-2">62115</div>
                    <div className="flex-1 text-right pr-2">62115</div>
                  </div>
                </div>
              </div>

              {/* Botones Inferiores Compartidos */}
              <div className="flex justify-center gap-2 mb-1 mt-1">
                <button title="Anular el pedido seleccionado" className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] py-1.5 px-3 text-[13px] font-sans shadow-sm active:bg-[#d4d4d4]">
                  Anular
                </button>
                <button onClick={() => setPantalla('escritorio')} title="Volver al escritorio y crear un nuevo pedido" className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] py-1.5 px-3 text-[13px] font-sans shadow-sm active:bg-[#d4d4d4]">
                  Nuevo
                </button>
                <button title="Enviar por correo electrónico el resumen del pedido al cliente" className="bg-[#e6e6e6] text-gray-500 border border-[#a6a6a6] py-1.5 px-3 text-[10px] font-sans shadow-sm">
                  Enviar Email
                </button>
              </div>

              {/* Pie de página pequeño */}
              <div className="text-[7.5px] text-gray-500 font-sans mt-1">
                © Copyright Wholesale World Information Systems LTD, 2014
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 10: CLIENTES (088) */}
        {pantalla === 'clientes' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal font-sans">088 - Clientes - {empresaSeleccionada}</span>
              </div>
              <span className="text-xl leading-none">⋮</span>
            </div>
            <div className="flex-1 flex flex-col p-2 bg-gray-100 overflow-hidden">
              <div className="flex items-center mb-2 justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[12px] font-bold text-gray-700 font-sans">Ruta:</span>
                  <select className="flex-1 bg-transparent text-[12px] font-sans text-gray-600 outline-none">
                    <option>--- Todas ---</option>
                  </select>
                </div>
                <button onClick={() => setPantalla('menu')} title="Regresar al menú principal" className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm ml-2 flex-shrink-0">
                  ←
                </button>
              </div>
              <div className="flex items-center mb-2 gap-2">
                <span className="text-[12px] font-bold text-gray-700 font-sans">Cliente:</span>
                <input type="text" value={empresaSeleccionada === 'Beval' ? "2503001" : "2531318"} readOnly className="bg-[#b3b3b3] text-black font-sans text-[13px] px-2 py-1 flex-1 text-center outline-none border-b border-gray-400" />
                <button className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] px-2 py-1 text-[11px] font-sans shadow-sm hover:bg-[#d4d4d4]">O.P.</button>
                <button className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] px-2 py-1 text-[11px] font-sans shadow-sm hover:bg-[#d4d4d4]">B.</button>
              </div>

              <div className="bg-white border border-gray-400 p-1 mb-1">
                <span className="text-[12px] text-gray-800 font-sans">{empresaSeleccionada === 'Beval' ? 'AGRO FERRETERIA CAMPANARIO C.A. - 2503001' : 'GRUPO ISO HOME, C.A - 2531318'}</span>
              </div>

              <div className="flex-1 border border-gray-400 bg-white overflow-y-auto">
                <div onClick={() => setPantalla('gestion_ventas')} className="bg-[#00b0f0] text-black font-bold text-[11px] px-2 py-2 font-sans border-b border-gray-200 cursor-pointer">
                  {empresaSeleccionada === 'Beval' ? 'AGRO FERRETERIA CAMPANARIO C.A. - 2503001' : 'GRUPO ISO HOME, C.A - 2531318'}
                </div>
                {(empresaSeleccionada === 'Beval' ? [
                  'AUTO ADORNOS Y ACCESSORIOS ROJUL, CA - 2569055',
                  'AUTO PARTES MAURO 2007, C.A - 2503021',
                  'AUTO REPUESTOS CARS 2015, C,A - 2670008',
                  'AUTO REPUESTOS JHOMANSI C.A - 2503031',
                  'AUTO REPUESTOS TELDE, C.A - 2503051',
                  'AUTO REPUESTOS Y ACCESORIOS TELDE C.A. - 2775020'
                ] : [
                  'EMPACADURAS INDUSTRIALES DEL CI - 2531976',
                  'GRUPO TRIFERCA, C.A - 2580160',
                  'HIPER HIERRO, C.A - 2531151',
                  'HOGAR 245, C.A - 2503342',
                  'INVERSIONES C MIGUEL A C.A - 2525053'
                ]).map((cli, i) => (
                  <div key={i} onClick={() => setPantalla('gestion_ventas')} className="bg-white text-black font-bold text-[10px] px-2 py-2.5 font-sans border-b border-gray-200 cursor-pointer hover:bg-gray-100 active:bg-gray-200">
                    {cli}
                  </div>
                ))}
              </div>

              {/* Botón teclado dummy */}
              <div className="mt-2 text-center bg-gray-300 py-2 text-[10px] text-gray-600 font-sans rounded border border-gray-400 flex flex-wrap justify-center gap-1 opacity-70">
                {'ABCDEFGHIJKLM'.split('').map(letter => <span key={letter} className="w-5 h-6 bg-white flex items-center justify-center shadow-sm">{letter}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 11: GESTIÓN DE VENTAS (028) */}
        {pantalla === 'gestion_ventas' && (
          <div className="flex-1 bg-gray-100 mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal font-sans">028 - Gestión de Ventas - {empresaSeleccionada}</span>
              </div>
              <span className="text-xl leading-none">⋮</span>
            </div>

            <div className="p-2 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-[#d3d3d3] py-2 px-2 flex-1 mr-2 border border-gray-300 text-ellipsis overflow-hidden">
                  <span className="text-[12px] font-bold text-gray-800 font-sans whitespace-nowrap">{empresaSeleccionada === 'Beval' ? 'AGRO FERRETERIA CAMPANARIO C.A. - 2503001' : 'GRUPO ISO HOME, C.A - 2531318'}</span>
                </div>
                <button onClick={() => setPantalla('clientes')} title="Regresar a Clientes" className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">
                  ←
                </button>
              </div>

              <div className="mb-4">
                <span className="text-[11px] text-gray-700 font-sans">Código Cliente: {empresaSeleccionada === 'Beval' ? '2503001' : '2531976'}</span>
              </div>

              <div className="flex flex-col gap-3 items-center flex-1">
                <button onClick={() => setPantalla('detalle_pedido_nuevo')} className="bg-[#e6e6e6] text-black font-bold font-sans text-[12px] py-2 w-3/4 border border-gray-300 shadow-sm active:bg-[#d4d4d4]">
                  NUEVO PEDIDO
                </button>
                <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[12px] py-2 w-3/4 border border-gray-300 shadow-sm active:bg-[#d4d4d4]">
                  CONSULTAR PEDIDOS
                </button>
                <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[12px] py-2 w-3/4 border border-gray-300 shadow-sm active:bg-[#d4d4d4]">
                  NUEVA COTIZACIÓN
                </button>
                <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[12px] py-2 w-3/4 border border-gray-300 shadow-sm active:bg-[#d4d4d4]">
                  CONSULTAR COTIZACIONES
                </button>
              </div>

              <div className="border-t border-gray-300 pt-2 flex flex-col gap-1 pb-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 font-sans">
                  <span>Límite de Crédito:</span>
                  <span>5.000,00</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 font-sans">
                  <span>Crédito Disponible:</span>
                  <span>5.000,00</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 font-sans">
                  <span>A la Fecha:</span>
                  <span>06-12-2025</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 font-sans">
                  <span>Grupo cliente</span>
                  <span>MAYOREOB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 12: DETALLE PEDIDO NUEVO (021) */}
        {pantalla === 'detalle_pedido_nuevo' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal font-sans">021 - Detalle Pedido - {empresaSeleccionada}</span>
              </div>
              <span className="text-xl leading-none">⋮</span>
            </div>

            <div className="p-1 flex flex-col flex-1 bg-gray-100">
              <div className="flex items-center mb-1">
                <div className="bg-[#d3d3d3] py-1.5 px-2 flex-1 border border-gray-300 text-ellipsis overflow-hidden">
                  <span className="text-[11px] font-bold text-gray-800 font-sans whitespace-nowrap">{empresaSeleccionada === 'Beval' ? 'AGRO FERRETERIA CAMPANARIO C.A. - 2503001..' : 'GRUPO ISO HOME, C.A - 2531318..'}</span>
                </div>
                <div className="flex gap-1 ml-1">
                  <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[10px] px-2 py-0 border border-gray-400 shadow-sm active:bg-gray-300">FIN</button>
                  <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[10px] px-2 py-0 border border-gray-400 shadow-sm active:bg-gray-300">X</button>
                  <button onClick={() => setPantalla('gestion_ventas')} className="w-6 h-6 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[2px] border-[#999999] shadow-sm flex-shrink-0">
                    ←
                  </button>
                </div>
              </div>

              <div className="mb-1">
                <p className="text-[9px] text-gray-500 font-sans leading-tight">
                  0101002 - Receptáculo de pvc blanco con bornes<br />
                  automáticos Bticino - 7110502
                </p>
              </div>

              <div className="flex-1 border border-gray-400 bg-white flex flex-col">
                <div className="bg-[#a6a6a6] text-white font-bold text-[11px] text-center py-1 border-b border-gray-400">
                  Producto
                </div>
                <div className="flex-1 bg-white"></div>
              </div>

              <div className="flex flex-col gap-1 mt-2 mb-2">
                <div className="flex items-center justify-end">
                  <span className="text-[11px] font-bold text-gray-700 font-sans mr-2">Subtotal (USD):</span>
                  <div className="bg-[#b3b3b3] w-32 h-5"></div>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-[11px] font-bold text-gray-700 font-sans mr-2">Renglones:</span>
                  <div className="bg-[#b3b3b3] w-32 h-5"></div>
                </div>
              </div>

              <div className="flex gap-1 justify-between py-1">
                <button className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">PROM.</button>
                <button onClick={() => setPantalla('productos_busqueda')} className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">BUSCAR</button>
                <button className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">OTROS</button>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 13: PRODUCTOS (034) */}
        {pantalla === 'productos_busqueda' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="p-2.5 flex items-center border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal font-sans">034 - Productos - {empresaSeleccionada}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-gray-100 p-3 pt-6 relative">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[14px] font-bold text-gray-800 font-sans">Artículo</span>
                <button onClick={() => setPantalla('detalle_pedido_nuevo')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">
                  ←
                </button>
              </div>

              <div className="flex items-center mb-4">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Código:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-gray-400 text-black font-sans text-[12px] px-1 outline-none font-bold" />
              </div>

              <div className="flex items-center mb-4">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Nombre:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-gray-400 text-black font-sans text-[12px] px-1 outline-none font-bold" />
              </div>

              <div className="flex items-center mb-4">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Referencia:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-gray-400 text-black font-sans text-[12px] px-1 outline-none font-bold" />
              </div>

              <div className="flex items-center mb-5 mt-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Marca:</span>
                <select className="flex-1 bg-transparent border-b border-gray-400 text-gray-700 font-sans text-[11px] px-1 outline-none appearance-none cursor-pointer">
                  <option>--Seleccione--</option>
                  <option>Marca 1</option>
                </select>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-gray-600 border-r-[4px] border-r-transparent ml-[-12px] pointer-events-none"></div>
              </div>

              <div className="flex items-center mb-5">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Categoría:</span>
                <select className="flex-1 bg-transparent border-b border-gray-400 text-gray-700 font-sans text-[11px] px-1 outline-none appearance-none cursor-pointer">
                  <option>--Seleccione--</option>
                  <option>Categoria 1</option>
                </select>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-gray-600 border-r-[4px] border-r-transparent ml-[-12px] pointer-events-none"></div>
              </div>

              <div className="flex items-center mb-5">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Sub-Categoría:</span>
                <select className="flex-1 bg-transparent border-b border-gray-400 text-gray-700 font-sans text-[11px] px-1 outline-none appearance-none cursor-pointer">
                  <option>--Seleccione--</option>
                  <option>Sub Cat 1</option>
                </select>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-gray-600 border-r-[4px] border-r-transparent ml-[-12px] pointer-events-none"></div>
              </div>

              <div className="flex items-center mb-6 relative">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Grupo:</span>
                <select value={grupoSeleccionado} onChange={(e) => setGrupoSeleccionado(e.target.value)} className={`flex-1 bg-transparent border-b border-gray-400 font-sans text-[11px] px-1 outline-none appearance-none cursor-pointer ${grupoSeleccionado === 'Todas' ? 'text-black font-bold' : 'text-gray-700'}`}>
                  <option>--Seleccione--</option>
                  <option>Todas</option>
                </select>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-gray-600 border-r-[4px] border-r-transparent ml-[-12px] pointer-events-none"></div>

                {/* Dropdown visual simulado para Ghost Mouse */}
                {mostrarComboGrupo && (
                  <div className="absolute left-[85px] top-5 bg-white border border-gray-400 shadow-lg z-50 w-[calc(100%-97px)] rounded-sm overflow-hidden">
                    <div className="px-2 py-2 text-[11px] text-gray-500 font-sans border-b border-gray-200 bg-gray-50">--Seleccione--</div>
                    <div className="px-2 py-2 text-[11px] text-black font-bold font-sans bg-[#00b0f0] cursor-pointer">Todas</div>
                  </div>
                )}
              </div>

              <div className="border-t-[2px] border-gray-800 pt-3 flex justify-between gap-10 px-2 mt-auto pb-4">
                <button onClick={() => { setGrupoSeleccionado('--Seleccione--'); }} className="bg-[#e6e6e6] text-black font-sans font-bold text-[11px] py-1.5 flex-1 shadow-sm border border-[#a6a6a6] active:bg-[#d4d4d4]">
                  Limpiar
                </button>
                <button onClick={() => setPantalla('resultados_busqueda')} className="bg-[#e6e6e6] text-black font-sans font-bold text-[11px] py-1.5 flex-1 shadow-sm border border-[#a6a6a6] active:bg-[#d4d4d4]">
                  Buscar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 14: 080 - Productos (Rediseñada según pedidoizq/pedidoder.jpeg) */}
        {pantalla === 'resultados_busqueda' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden font-sans">
            {/* Cabecera con color dinámico */}
            <div className="p-2 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <span className="text-xl font-black italic drop-shadow-md">f</span>
                  </div>
                </div>
                <span className="text-[15px] font-normal tracking-wide">080 - Productos - {empresaSeleccionada}</span>
              </div>
              <span className="text-xl leading-none cursor-pointer px-2">⋮</span>
            </div>

            <div className="flex-1 flex flex-col bg-[#eeeeee] overflow-hidden">
              {/* Barra de descripción del producto activo (Gris Claro) */}
              <div className="bg-[#f0f0f0] px-3 py-1.5 border-b border-gray-300 min-h-[32px] flex items-center">
                <span className="text-[12px] text-gray-600 font-bold truncate">
                  {productoActivo ? productoActivo.desc : "Seleccione un producto"}
                </span>
              </div>

              {/* Barra de búsqueda con estilo subrayado */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/50 border-b border-gray-300">
                <span className="text-[14px] font-bold text-gray-800">Buscar</span>
                <div className="flex-1 flex flex-col pt-1">
                  <input
                    type="text"
                    value={busquedaProducto}
                    inputMode="numeric"
                    onChange={(e) => {
                      setBusquedaProducto(e.target.value);
                      setBusquedaNombre('');
                      setProductoActivoIndex(0);
                    }}
                    className="w-full bg-transparent text-black font-sans text-[14px] px-1 outline-none border-b border-gray-500 focus:border-blue-600"
                  />
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={() => setMostrarDatosBotonB(true)}
                    className="bg-[#dadada] text-black border border-gray-400 px-3 py-0.5 text-[11px] font-bold shadow-sm active:bg-gray-400"
                  >B.</button>
                  <button className="bg-[#dadada] text-black border border-gray-400 px-3 py-0.5 text-[11px] font-bold shadow-sm">SUB</button>
                  <button className="bg-[#dadada] text-black border border-gray-400 px-3 py-0.5 text-[11px] font-bold shadow-sm">ASOC.</button>
                </div>
              </div>

              {/* Lista de artículos (Tabla blanca con bordes) */}
              <div className="m-2 border border-black bg-white flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  {productosFiltrados.map((prod, i) => (
                    <div
                      key={i}
                      onClick={() => setProductoActivoIndex(i)}
                      className={`flex items-center py-1.5 px-1.5 border-b border-gray-200 cursor-pointer ${i === productoActivoIndex ? 'bg-[#00a2e8] text-white' : 'bg-white text-black'}`}
                    >
                      <div className={`w-4 h-4 border border-black mr-2 flex items-center justify-center shrink-0 ${i === productoActivoIndex ? 'bg-[#00a2e8]' : 'bg-white'}`}>
                        {i === productoActivoIndex && <div className="w-2 h-2 bg-white"></div>}
                      </div>
                      <span className={`text-[12px] font-bold w-16 shrink-0 ${i === productoActivoIndex ? 'text-white' : 'text-gray-800'}`}>
                        {prod.cod}
                      </span>
                      <span className={`text-[12px] font-bold truncate flex-1 ${i === productoActivoIndex ? 'text-white' : 'text-black'}`}>
                        {prod.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel de Datos Inferior (Grids de cajas grises) */}
              <div className="bg-[#f0f0f0] p-3 border-t border-gray-400 flex flex-col gap-2">
                {/* Precios P1 y P2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] italic text-gray-500 font-medium">P1</span>
                    <div
                      onClick={() => { setAfvCalcPrecio(productoActivo?.p1); setAfvCalcNombre('P1'); setAfvDctoComercial(productoActivo?.dscto !== '0,00' ? productoActivo.dscto + '%' : ''); setAfvDctoFP(''); setMostrarAfvCalc(true); }}
                      className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-end px-2 text-[13px] font-bold text-gray-800 border border-gray-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] cursor-pointer active:bg-blue-200"
                    >
                      {productoActivo?.p1}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] italic text-gray-500 font-medium">P2</span>
                    <div
                      onClick={() => { setAfvCalcPrecio(productoActivo?.p2); setAfvCalcNombre('P2'); setAfvDctoComercial(productoActivo?.dscto !== '0,00' ? productoActivo.dscto + '%' : ''); setAfvDctoFP(''); setMostrarAfvCalc(true); }}
                      className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-end px-2 text-[13px] font-bold text-gray-800 border border-gray-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] cursor-pointer active:bg-blue-200"
                    >
                      {productoActivo?.p2}
                    </div>
                  </div>
                </div>

                {/* Detalles U.Inv, Emp.C, C.Min, Dscto */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12">U. Inv.:</span>
                    <div className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-center text-[12px] font-bold border border-gray-400">
                      {productoActivo?.inv}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12">Emp. C.:</span>
                    <div className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-center text-[12px] font-bold border border-gray-400">
                      {productoActivo?.emp}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12">C. Min.:</span>
                    <div className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-center text-[12px] font-bold border border-gray-400">
                      {productoActivo?.cmin}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12">Dscto.:</span>
                    <div className="flex-1 bg-[#c0c0c0] h-7 flex items-center justify-center text-[12px] font-bold border border-gray-400">
                      {productoActivo?.dscto}
                    </div>
                  </div>
                </div>

                {/* Stock (Exist.) */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12">Exist.</span>
                  <div className="w-1/2 bg-[#c0c0c0] h-7 flex items-center justify-end px-2 text-[12px] font-bold border border-gray-400">
                    {productoActivo?.exist}
                  </div>
                </div>

                {/* Cantidad y Botón OK */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] w-12">Cant.:</span>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={cantidadProducto}
                      onChange={(e) => setCantidadProducto(e.target.value)}
                      className="flex-1 bg-white border-b border-gray-600 h-7 text-center text-[14px] outline-none focus:border-blue-600"
                    />
                    <button
                      onClick={() => setPantalla('detalle_pedido_con_producto')}
                      className="bg-[#dadada] text-black font-bold h-7 px-10 text-[12px] border border-gray-400 shadow-sm active:bg-gray-400 flex items-center justify-center"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón volver flotante (Igual que en las otras pantallas) */}
              <div className="absolute top-[85%] right-4">
                <button onClick={() => setPantalla('productos_busqueda')} className="w-8 h-8 bg-gray-400/80 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-500 border-2 border-white/50">
                  ←
                </button>
              </div>
            </div>

            {/* Modal: Buscar por Nombre o Código Antiguo (botón B.) */}
            {mostrarBuscaNombre && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="w-[280px] bg-white shadow-2xl flex flex-col overflow-hidden border border-gray-400">
                  {/* Header */}
                  <div className="bg-[#00a2e8] px-2 py-1.5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <span className="text-[7px] font-black text-gray-800 italic">f</span>
                      </div>
                      <span className="text-[12px] font-bold font-sans">080 - Buscar por Nombre</span>
                    </div>
                    <button onClick={() => setMostrarBuscaNombre(false)} className="text-white font-bold text-lg leading-none">✕</button>
                  </div>

                  <div className="p-3 flex flex-col gap-3">
                    <div>
                      <label className="text-[9px] text-gray-500 font-bold block mb-1 uppercase">Nombre o Código antiguo</label>
                      <input
                        autoFocus
                        type="text"
                        value={busquedaNombre}
                        onChange={(e) => setBusquedaNombre(e.target.value)}
                        className="w-full border-b-2 border-[#00a2e8] text-[13px] font-sans px-1 py-1 outline-none bg-transparent text-black"
                        placeholder="Ej: canilla flexible"
                      />
                    </div>

                    <div className="border border-gray-300 max-h-[120px] overflow-y-auto">
                      {(busquedaNombre.trim()
                        ? MOCK_PRODUCTOS.filter(p =>
                          p.desc.toLowerCase().includes(busquedaNombre.toLowerCase()) ||
                          p.old.toLowerCase().includes(busquedaNombre.toLowerCase())
                        )
                        : []
                      ).map((prod, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setBusquedaNombre(busquedaNombre);
                            setBusquedaProducto('');
                            setProductoActivoIndex(MOCK_PRODUCTOS.indexOf(prod));
                            setMostrarBuscaNombre(false);
                          }}
                          className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 hover:bg-blue-50 cursor-pointer text-[9px]"
                        >
                          <span className="font-bold text-gray-800">{prod.cod}</span>
                          <span className="bg-gray-200 px-0.5 rounded text-[8px]">{prod.old}</span>
                          <span className="text-gray-600 truncate">{prod.desc}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setBusquedaNombre(''); setMostrarBuscaNombre(false); }} className="bg-gray-200 text-gray-700 font-bold px-4 py-1 text-[11px] border border-gray-400">Limpiar</button>
                      <button onClick={() => setMostrarBuscaNombre(false)} className="bg-[#00a2e8] text-white font-bold px-4 py-1 text-[11px] border border-[#008cc9]">Buscar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Imagen Botón B. (datosbotonb.jpeg) */}
            {mostrarDatosBotonB && (
              <div
                className="absolute inset-0 bg-black/70 flex items-center justify-center z-[60]"
                onClick={() => setMostrarDatosBotonB(false)}
              >
                <div className="relative w-[95%] h-[80%] flex items-center justify-center bg-transparent">
                  <img
                    src="datosbotonb.jpeg"
                    alt="Datos Botón B"
                    className="max-w-full max-h-full object-contain rounded shadow-2xl"
                  />
                  <button
                    onClick={() => setMostrarDatosBotonB(false)}
                    className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-8 h-8 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:bg-red-700"
                    title="Cerrar imagen"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANTALLA 15: 021 - Detalle Pedido CON producto cargado (buscar0.jpg) */}
        {pantalla === 'detalle_pedido_con_producto' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">021 - Detalle Pedido</span>
              </div>
              <span className="text-xl leading-none text-gray-700">⋮</span>
            </div>

            <div className="p-1 flex flex-col flex-1 bg-gray-100">
              <div className="flex items-center mb-1">
                <div className="bg-[#d3d3d3] py-1.5 px-2 flex-1 border border-gray-300 text-ellipsis overflow-hidden">
                  <span className="text-[11px] font-bold text-gray-800 font-sans whitespace-nowrap">GRUPO ISO HOME, C.A - 2531318</span>
                </div>
                <div className="flex gap-1 ml-1">
                  <button onClick={() => setPantalla('finalizar_pedido_gv')} className="bg-[#e6e6e6] text-black font-bold font-sans text-[10px] px-2 py-0 border border-gray-400 shadow-sm active:bg-gray-300">FIN</button>
                  <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[10px] px-2 py-0 border border-gray-400 shadow-sm active:bg-gray-300">X</button>
                  <button onClick={() => setPantalla('gestion_ventas')} className="w-6 h-6 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[2px] border-[#999999] shadow-sm flex-shrink-0">
                    ←
                  </button>
                </div>
              </div>

              <div className="mb-1">
                <p className="text-[9px] text-gray-500 font-sans leading-tight">
                  0101002 - Receptáculo de pvc blanco con bornes<br />
                  automáticos Bticino - 7110502
                </p>
              </div>

              <div className="flex-1 border border-gray-400 bg-white flex flex-col">
                <div className="bg-[#a6a6a6] text-white font-bold text-[11px] text-center py-1 border-b border-gray-400">
                  Producto
                </div>
                {/* Producto cargado */}
                <div className="bg-[#00b0f0] text-black text-[10px] font-sans p-1.5 border-b border-gray-300">
                  <span className="font-bold">Receptáculo de pvc blanco con bornes automáticos Btic...</span>
                  <span className="ml-2">x12</span>
                </div>
                <div className="flex-1 bg-white"></div>
              </div>

              <div className="flex flex-col gap-1 mt-2 mb-2">
                <div className="flex items-center justify-end">
                  <span className="text-[11px] font-bold text-gray-700 font-sans mr-2">Subtotal (USD):</span>
                  <div className="bg-[#b3b3b3] w-32 h-5 flex items-center justify-end pr-2">
                    <span className="text-[11px] font-bold text-black font-sans">10,34</span>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-[11px] font-bold text-gray-700 font-sans mr-2">Renglones:</span>
                  <div className="bg-[#b3b3b3] w-32 h-5 flex items-center justify-end pr-2">
                    <span className="text-[11px] font-bold text-black font-sans">1</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1 justify-between py-1">
                <button className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">PROM.</button>
                <button onClick={() => setPantalla('resultados_busqueda')} className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">BUSCAR</button>
                <button className="flex-1 bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4]">OTROS</button>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 16: 016 - Finalizar Pedido GV (cierrapedido1.png) */}
        {pantalla === 'finalizar_pedido_gv' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">016 - Finalizar Pedido</span>
              </div>
              <span className="text-xl leading-none text-gray-700">⋮</span>
            </div>

            <div className="flex-1 flex flex-col p-3 bg-gray-100 overflow-y-auto relative">
              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Pedido:</span>
                <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[12px] px-2 py-1 text-right font-bold">60063</div>
                <button onClick={() => setPantalla('detalle_pedido_con_producto')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm ml-2">
                  ←
                </button>
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Fecha:</span>
                <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[12px] px-2 py-1 text-right">09-02-2026</div>
              </div>

              <div className="flex items-center mb-2 relative">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Nivel:</span>
                <div onClick={() => setMostrarComboNivel(!mostrarComboNivel)} className="flex-1 bg-white border border-gray-400 text-black font-sans text-[12px] px-2 py-1 flex justify-between items-center cursor-pointer">
                  <span className="font-bold">{nivelSeleccionado}</span>
                  <span className="text-gray-500">▼</span>
                </div>
                {mostrarComboNivel && (
                  <div className="absolute left-[85px] top-7 bg-white border border-gray-400 shadow-lg z-50 w-[calc(100%-85px)] rounded-sm overflow-hidden">
                    <div onClick={() => { setNivelSeleccionado('MAYOREOD'); setMostrarComboNivel(false); }} className={`px-2 py-2 text-[11px] font-sans border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${nivelSeleccionado === 'MAYOREOD' ? 'bg-[#00b0f0] font-bold' : ''}`}>MAYOREOD</div>
                    <div onClick={() => { setNivelSeleccionado('MAYOREOB'); setMostrarComboNivel(false); }} className={`px-2 py-2 text-[11px] font-sans cursor-pointer hover:bg-gray-100 ${nivelSeleccionado === 'MAYOREOB' ? 'bg-[#00b0f0] font-bold' : ''}`}>MAYOREOB</div>
                  </div>
                )}
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Condición:</span>
                <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[11px] px-2 py-1">
                  {nivelSeleccionado === 'MAYOREOB' ? '10% hasta 7 dias' : ''}
                </div>
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Flete (USD):</span>
                <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[12px] px-2 py-1 text-right">1,22</div>
                <div className="bg-white border border-gray-400 text-black font-sans text-[11px] px-2 py-1 w-10 text-center ml-1">50</div>
                <span className="text-[10px] text-gray-500 ml-1">(%)</span>
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Subtotal (USD):</span>
                <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[12px] px-2 py-1 text-right font-bold">44,92</div>
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">IVA Ret. 12%:</span>
                <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[12px] px-2 py-1 text-right">7,19</div>
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">IVA Rest. 4%:</span>
                <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[12px] px-2 py-1 text-right">1,80</div>
              </div>

              <div className="flex items-center mb-3">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans font-bold">Total (USD):</span>
                <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[14px] px-2 py-1 text-right font-bold">52,10</div>
                <button onClick={() => setModalCierraGV1(true)} className="bg-[#e6e6e6] text-black font-bold font-sans text-[11px] px-3 py-1 border border-[#a6a6a6] shadow-sm active:bg-[#d4d4d4] ml-2">FIN</button>
              </div>

              {/* Tabla Monto Pedido */}
              <div className="border border-gray-400 mb-3">
                <div className="flex bg-[#a6a6a6] text-white font-bold text-[10px] font-sans">
                  <div className="flex-1 text-center py-1 border-r border-gray-300">Monto Pedido (USD)</div>
                  <div className="flex-1 text-center py-1">% Desc</div>
                </div>
                <div className="flex bg-[#00b0f0] text-black font-bold text-[10px] font-sans border-b border-gray-300">
                  <div className="flex-1 text-center py-1 border-r border-gray-300">0-200</div>
                  <div className="flex-1 text-center py-1">50</div>
                </div>
                <div className="flex bg-white text-black text-[10px] font-sans">
                  <div className="flex-1 text-center py-1 border-r border-gray-300">Mayor a201</div>
                  <div className="flex-1 text-center py-1">100</div>
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-[11px] font-bold text-gray-700 font-sans">Observaciones:</span>
                {observacionTipo ? (
                  <span className="flex-1 text-[10px] font-bold text-blue-700 font-sans ml-2 truncate">{observacionTipo}</span>
                ) : (
                  <div className="flex-1"></div>
                )}
                <button onClick={() => setMostrarObservaciones(true)} className="w-6 h-6 bg-[#e6e6e6] border border-gray-400 text-black font-bold text-[14px] leading-none flex items-center justify-center">+</button>
              </div>

              {/* Modal Observaciones */}
              {mostrarObservaciones && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-2xl w-[280px] overflow-hidden border border-gray-300">
                    {/* Header */}
                    <div className="bg-[#00b0f0] px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <span className="text-[7px] font-bold text-gray-800">f</span>
                        </div>
                        <span className="text-[12px] font-bold text-black font-sans">016 - Toma de Observación</span>
                      </div>
                      <button onClick={() => setMostrarObservaciones(false)} className="text-black font-bold text-lg leading-none">✕</button>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold block mb-1">TIPO DE OBSERVACIÓN</label>
                        <select
                          value={observacionTipo}
                          onChange={(e) => {
                            setObservacionTipo(e.target.value);
                            if (e.target.value) setObservacionTexto(e.target.value);
                          }}
                          className="w-full border border-gray-400 text-[12px] font-bold px-2 py-1.5 outline-none bg-white text-black"
                        >
                          <option value="">-- Seleccione --</option>
                          <option value="Negociación Especial">Negociación Especial</option>
                          <option value="Pedido Urgente">Pedido Urgente</option>
                          <option value="Entrega Programada">Entrega Programada</option>
                          <option value="Descuento Aprobado">Descuento Aprobado</option>
                          <option value="Crédito Ampliado">Crédito Ampliado</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold block mb-1">OBSERVACIÓN</label>
                        <textarea
                          value={observacionTexto}
                          onChange={(e) => setObservacionTexto(e.target.value)}
                          rows={3}
                          placeholder="Escriba la observación aquí..."
                          className="w-full border border-gray-400 text-[11px] px-2 py-1 outline-none resize-none font-sans"
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          onClick={() => { setObservacionTipo(''); setObservacionTexto(''); setMostrarObservaciones(false); }}
                          className="bg-gray-200 text-gray-700 font-bold px-4 py-1.5 border border-gray-400 text-[11px] active:bg-gray-300"
                        >Limpiar</button>
                        <button
                          onClick={() => {
                            if (observacionTipo && !observacionTexto) setObservacionTexto(observacionTipo);
                            setMostrarObservaciones(false);
                          }}
                          className="bg-[#00b0f0] text-black font-bold px-4 py-1.5 border border-[#0092c8] text-[11px] active:bg-[#0092c8]"
                        >Aceptar</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Confirmación 1 - ¿Desea añadir más artículos? */}
            {modalCierraGV1 && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 mt-8">
                <div className="bg-white rounded-lg shadow-2xl w-[260px] overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[22px]"></span>
                      <span className="text-[#00b0f0] font-bold text-[15px] font-sans">Confirmación</span>
                    </div>
                    <p className="text-[12px] text-gray-700 font-sans leading-relaxed">
                      El monto de su pedido es 52,10 $ con un descuento de 0% en el monto del flete. ¿Desea añadir más articulos al pedido?
                    </p>
                  </div>
                  <div className="flex border-t border-gray-200">
                    <button onClick={() => { setModalCierraGV1(false); setModalCierraGV2(true); }} className="flex-1 py-3 text-[13px] font-bold text-gray-600 font-sans hover:bg-gray-100 border-r border-gray-200">No</button>
                    <button onClick={() => setModalCierraGV1(false)} className="flex-1 py-3 text-[13px] font-bold text-gray-600 font-sans hover:bg-gray-100">Si</button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Confirmación 2 - ¿Desea guardar y cerrar? */}
            {modalCierraGV2 && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 mt-8">
                <div className="bg-white rounded-lg shadow-2xl w-[260px] overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[22px]"></span>
                      <span className="text-[#00b0f0] font-bold text-[15px] font-sans">Confirmación</span>
                    </div>
                    <p className="text-[12px] text-gray-700 font-sans leading-relaxed">
                      ¿Desea guardar los Datos y Cerrar el Pedido?
                    </p>
                  </div>
                  <div className="flex border-t border-gray-200">
                    <button onClick={() => setModalCierraGV2(false)} className="flex-1 py-3 text-[13px] font-bold text-gray-600 font-sans hover:bg-gray-100 border-r border-gray-200">No</button>
                    <button onClick={() => { setModalCierraGV2(false); setPantalla('pedido_cerrado_gv'); }} className="flex-1 py-3 text-[13px] font-bold text-gray-600 font-sans hover:bg-gray-100">Si</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- MÓDULO DE COBRANZA --- */}

        {/* PANTALLA: RECIBO CLIENTE (088 - recibocliente.jpg) */}
        {pantalla === 'recibo_cliente' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">088 - Clientes</span>
              </div>
              <button onClick={() => setPantalla('menu')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm">
                ←
              </button>
            </div>
            <div className="flex-1 flex flex-col p-2 bg-gray-100 overflow-hidden">
              <div className="flex items-center mb-2 gap-2">
                <span className="text-[12px] font-bold text-gray-700 font-sans">Ruta:</span>
                <select className="flex-1 bg-transparent text-[12px] font-sans text-gray-600 outline-none">
                  <option>--- Todas ---</option>
                </select>
              </div>
              <div className="flex items-center mb-2 gap-2">
                <span className="text-[12px] font-bold text-gray-700 font-sans">Cliente:</span>
                <input type="text" placeholder="Buscar..." className="bg-white border border-gray-400 text-black font-sans text-[13px] px-2 py-1 flex-1 outline-none" />
                <button className="bg-[#e6e6e6] text-[#333] border border-gray-400 px-2 py-1 text-[11px] font-bold shadow-sm">B.</button>
              </div>
              <div className="flex-1 border border-gray-400 bg-white overflow-y-auto">
                <div onClick={() => setPantalla('recibo_menu')} className="bg-[#00b0f0] text-black font-bold text-[11px] px-2 py-2 font-sans border-b border-gray-300 cursor-pointer">
                  GRUPO ISO HOME, C.A - 2531318
                </div>
                {[
                  'EMPACADURAS INDUSTRIALES DEL CI - 2531976',
                  'GRUPO TRIFERCA, C.A - 2580160',
                  'HIPER HIERRO, C.A - 2531151',
                  'INVERSIONES C MIGUEL A C.A - 2525053'
                ].map((cli, i) => (
                  <div key={i} onClick={() => setPantalla('recibo_menu')} className="bg-white text-black font-bold text-[10px] px-2 py-2.5 font-sans border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                    {cli}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA: RECIBO MENU (recibomenu1.jpg) */}
        {pantalla === 'recibo_menu' && (
          <div className="flex-1 bg-[#f0f0f0] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden p-0.5">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center text-white font-serif italic text-xs border border-blue-300">f</div>
                </div>
                <span className="text-[13px] font-bold text-black font-sans uppercase tracking-tight">044 - Menú Cobranza</span>
              </div>
              <div className="text-[14px] font-bold">⋮</div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between bg-[#c0c0c0] px-3 py-1.5 shadow-inner">
                <span className="text-[12px] font-bold text-gray-800 font-sans truncate">GRUPO ISO HOME, C.A - 2531318</span>
                <button
                  onClick={() => setPantalla('recibo_cliente')}
                  className="w-6 h-6 bg-[#f0f0f0] rounded-full flex items-center justify-center text-[#808080] border-2 border-[#808080] shadow-sm transform hover:scale-105 active:scale-95 transition-transform"
                >
                  <span className="font-bold text-sm leading-none mt-[-1px]">←</span>
                </button>
              </div>
              <div className="px-3 py-1 bg-white/50 border-b border-gray-300">
                <span className="text-[10px] text-gray-600 font-bold">Código Cliente: 2531318</span>
              </div>

              <div className="flex-1 flex flex-col items-center pt-8 gap-3.5 px-6">
                <button className="w-full bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.2)] border border-white active:bg-gray-300 transition-colors">
                  ESTADO DE CUENTA
                </button>
                <button className="w-full bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.2)] border border-white active:bg-gray-300 transition-colors">
                  ANÁLISIS DE DEUDORES
                </button>
                <button
                  onClick={() => setPantalla('retencion_list')}
                  className="w-full bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.2)] border border-white active:bg-gray-300 transition-colors"
                >
                  RETENCIONES DE IVA
                </button>
                <button
                  onClick={() => setPantalla('recibo_index')}
                  className="w-full bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.2)] border border-white active:bg-gray-300 transition-colors"
                >
                  RECIBOS DE COBRO
                </button>
                <button className="w-full bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.2)] border border-white active:bg-gray-300 transition-colors">
                  CALENDARIO
                </button>
              </div>

              <div className="mt-auto pb-2 px-2">
                <p className="text-center text-[8px] text-gray-500 font-sans tracking-tight">© Copyright Wholesale World Information Systems LTD, 2014</p>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA: LISTA DE RETENCIONES (Functional - Standardized to match ret00.jpeg) */}
        {pantalla === 'retencion_list' && (
          <div className="flex-1 bg-[#f0f0f0] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center text-black border-b border-[#0092c8] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden p-0.5">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center text-white font-serif italic text-xs border border-blue-300">f</div>
                </div>
                <span className="text-[14px] text-black font-sans tracking-tight">061 - Retenciones</span>
              </div>
            </div>

            <div className="flex flex-col flex-1 bg-[#f0f0f0]">
              {/* Toolbar de Cliente y Volver */}
              <div className="flex items-center justify-between bg-[#f0f0f0] px-2 py-2 mb-1">
                <div className="bg-[#b3b3b3] px-3 py-1 flex-1 shadow-sm border border-gray-400 flex items-center h-8 text-[14px]">
                  <span className="bg-[#b3b3b3] text-black font-sans font-medium uppercase truncate">
                    ALTAMIRA FERRE-INDUSTRIAL - 21311
                  </span>
                </div>
                <button
                  onClick={() => setPantalla('recibo_menu')}
                  className="w-8 h-8 ml-2 bg-gradient-to-b from-[#e6e6e6] to-[#cccccc] rounded-full flex items-center justify-center text-[#666666] border border-[#a6a6a6] shadow-md transform hover:scale-105 active:scale-95 transition-transform"
                >
                  <span className="font-bold text-2xl leading-none mt-[-2px]">←</span>
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-1 pb-2">
                <div className="flex-1 mx-2 border border-black bg-white flex flex-col font-sans overflow-hidden">
                  <div className="flex bg-[#a6a6a6] text-white font-bold text-[12px] border-b border-gray-400">
                    <div className="w-12 text-center py-1.5 border-r border-[#cfcfcf]">E</div>
                    <div className="flex-1 text-center py-1.5 border-r border-[#cfcfcf]">Comprobante</div>
                    <div className="flex-1 text-center py-1.5 border-r border-[#cfcfcf]">Monto (USD)</div>
                    <div className="w-4 bg-[#a6a6a6]"></div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {retencionesLista.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 italic text-[11px]">
                        No hay retenciones registradas
                      </div>
                    ) : (
                      retencionesLista.map((ret, idx) => (
                        <div key={idx} className="flex border-b border-gray-200 text-[12px] text-black hover:bg-gray-100 transition-colors">
                          <div className="w-12 flex items-center justify-center py-2 border-r border-gray-200">
                          </div>
                          <div className="flex-1 text-center px-2 py-2 border-r border-gray-200">{ret.comprobante}</div>
                          <div className="flex-1 text-center px-2 py-2 border-r border-gray-200">{ret.monto}</div>
                          <div className="w-4 bg-gray-50 border-l border-gray-200"></div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-[#cccccc] py-1 border-t border-gray-400 flex items-center">
                    <span className="text-[12px] font-bold text-black ml-10">Total:</span>
                  </div>
                </div>

                <div className="flex gap-4 p-2 justify-center">
                  <button className="bg-[#e6e6e6] text-black font-sans text-[13px] py-1.5 px-6 shadow-sm border border-[#a6a6a6] active:bg-gray-300">
                    ANULAR
                  </button>
                  <button
                    onClick={() => {
                      setRetencionTipo('');
                      setPantalla('retencion_form');
                    }}
                    className="bg-[#e6e6e6] text-black font-sans text-[13px] py-1.5 px-6 shadow-sm border border-[#a6a6a6] active:bg-gray-300"
                  >
                    NUEVO
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA: FORMULARIO DE RETENCION (Functional) */}
        {pantalla === 'retencion_form' && (
          <div className="flex-1 bg-[#f0f0f0] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden p-0.5">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center text-white font-serif italic text-xs border border-blue-300">f</div>
                </div>
                <span className="text-[14px] text-black font-sans tracking-tight">
                  097 - Retenciones
                </span>
              </div>
              <button
                onClick={() => setPantalla('retencion_list')}
                className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Toolbar de Cliente Estándar */}
            <div className="flex items-center justify-between bg-[#c0c0c0] px-3 py-1.5 shadow-inner mb-0.5 text-[11px]">
              <span className="font-bold text-gray-800 font-sans truncate">GRUPO ISO HOME, C.A - 2531318</span>
            </div>

            <div className="flex-1 flex flex-col p-5 gap-5 overflow-y-auto">
              {/* Paso 1: Selección de Tipo (Standardized) */}
              {!retencionTipo && (
                <div className="flex-1 flex flex-col bg-white overflow-hidden font-sans">
                  <div className="bg-gray-100 p-2 text-gray-800 font-bold text-sm">
                    Retenciones de IVA
                  </div>
                  <div className="flex-1 p-1 flex flex-col gap-2 overflow-hidden">
                    <div className="flex-1 border border-gray-500 flex flex-col bg-white overflow-hidden shadow-sm">
                      <div className="flex bg-[#a6a6a6] text-white font-bold text-[10px] uppercase">
                        <div className="w-8 text-center py-1.5 border-r border-gray-400">[]</div>
                        <div className="w-12 text-center py-1.5 border-r border-gray-400">Tipo</div>
                        <div className="flex-1 px-2 py-1.5 border-r border-gray-400">No. Fiscal</div>
                        <div className="w-24 text-right px-2 py-1.5">Monto (USD)</div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {[
                          { tipo: 'FAC', nro: '06980316', monto: '8,87' },
                          { tipo: 'FAC', nro: '06980336', monto: '1,38' },
                          { tipo: 'FAC', nro: '06982446', monto: '1,79' },
                          { tipo: 'FAC', nro: '06982447', monto: '2,84' },
                          { tipo: 'FAC', nro: '06982589', monto: '1,99' }
                        ].map((row, i) => (
                          <div key={i} className={`flex border-b border-gray-200 text-[10px] font-bold text-black`}>
                            <div className="w-8 flex items-center justify-center py-2 border-r border-gray-300">
                              <div className={`w-3 h-3 border border-gray-600 bg-white`}>
                              </div>
                            </div>
                            <div className="w-12 text-center py-2 border-r border-gray-200 uppercase">{row.tipo}</div>
                            <div className="flex-1 px-2 py-2 border-r border-gray-200">{row.nro}</div>
                            <div className="w-24 text-right px-2 py-2">{row.monto}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dropdown Section */}
                    <div className="flex flex-col gap-2 bg-[#f0f0f0] p-3 border-t border-gray-300">
                      <div className="flex gap-2 items-center relative">
                        <div className="flex-1 relative">
                          <div
                            id="metodoCombo"
                            onClick={() => setMostrarComboRetencion(!mostrarComboRetencion)}
                            className="w-full bg-white border border-gray-400 px-2 py-1 text-[11px] font-bold text-gray-700 flex justify-between items-center cursor-pointer"
                          >
                            <span>{retencionMetodo}</span>
                            <span className="text-gray-500 text-[10px]">▼</span>
                          </div>

                          {/* Dropdown visual simulado */}
                          {mostrarComboRetencion && (
                            <div className="absolute left-0 bottom-[100%] mb-1 bg-white border border-gray-400 shadow-lg z-50 w-full rounded-sm overflow-hidden flex flex-col-reverse">
                              <div onClick={() => { setRetencionMetodo('--Seleccione--'); setMostrarComboRetencion(false); }} className={`px-2 py-1.5 text-[11px] font-sans border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${retencionMetodo === '--Seleccione--' ? 'bg-[#00b0f0] text-black font-bold' : 'text-gray-700'}`}>--Seleccione--</div>
                              <div onClick={() => { setRetencionMetodo('Escanear Retencion'); setMostrarComboRetencion(false); }} className={`px-2 py-1.5 text-[11px] font-sans border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${retencionMetodo === 'Escanear Retencion' ? 'bg-[#00b0f0] text-black font-bold' : 'text-gray-700'}`}>Escanear Retencion</div>
                              <div onClick={() => { setRetencionMetodo('Cargar PDF'); setMostrarComboRetencion(false); }} className={`px-2 py-1.5 text-[11px] font-sans border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${retencionMetodo === 'Cargar PDF' ? 'bg-[#00b0f0] text-black font-bold' : 'text-gray-700'}`}>Cargar PDF</div>
                              <div onClick={() => { setRetencionMetodo('Cargar Imagen'); setMostrarComboRetencion(false); }} className={`px-2 py-1.5 text-[11px] font-sans border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${retencionMetodo === 'Cargar Imagen' ? 'bg-[#00b0f0] text-black font-bold' : 'text-gray-700'}`}>Cargar Imagen</div>
                              <div onClick={() => { setRetencionMetodo('Cargar Manual'); setMostrarComboRetencion(false); }} className={`px-2 py-1.5 text-[11px] font-sans cursor-pointer hover:bg-gray-100 border-b border-gray-200 ${retencionMetodo === 'Cargar Manual' ? 'bg-[#00b0f0] text-black font-bold' : 'text-gray-700'}`}>Cargar Manual</div>
                            </div>
                          )}
                        </div>
                        <button
                          id="btnValidar"
                          onClick={() => {
                            if (retencionMetodo === 'Cargar Manual') {
                              setRetencionTipo('Manual');
                            }
                          }}
                          className="bg-[#e6e6e6] text-black font-bold text-[10px] py-1.5 px-4 border border-white shadow-sm active:bg-gray-300 uppercase"
                        >
                          VALIDAR
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Total retenido:</span>
                          <div className="bg-[#b3b3b3] px-10 py-1 border border-gray-400 text-center font-bold text-sm">0</div>
                        </div>
                        <button className="bg-[#e6e6e6] text-black font-bold text-[10px] py-1.5 px-6 border border-white shadow-sm active:bg-gray-300 uppercase">
                          FINALIZAR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Formulario */}
              {retencionTipo && (
                <div className="flex-1 flex flex-col bg-[#f0f0f0] overflow-hidden font-sans">
                  {/* Header Info like Image ret1.jpeg */}
                  <div className="px-2 py-2 flex flex-col gap-1.5 bg-[#f0f0f0]">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-[11px] text-gray-500 w-[60px] text-right bg-[#f0f0f0] bg-opacity-0">RIF:</span>
                        <div className="bg-[#b3b3b3] px-2 py-0.5 font-sans text-[12px] flex-1 text-black tracking-tight font-medium">J312193697</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setRetencionesLista([{ comprobante: retencionPeriodo + (retencionSecuencia ? retencionSecuencia.padStart(8, '0') : '00000000'), fecha: retencionFecha, monto: retencionMonto }]);
                            setPantalla('retencion_list');
                            setRetencionTipo('');
                          }}
                          className="bg-[#d9d9d9] font-sans text-[11px] font-bold text-black px-3 py-1 border border-gray-400 shadow-sm active:bg-gray-300 transition-colors"
                        >
                          FIN
                        </button>
                        <button
                          onClick={() => setRetencionTipo('')}
                          className="w-7 h-7 bg-gradient-to-b from-[#e6e6e6] to-[#cccccc] rounded-full flex items-center justify-center text-[#666666] border border-[#a6a6a6] shadow-md transform hover:scale-105 active:scale-95 transition-transform"
                        >
                          <span className="font-bold text-lg leading-none mt-[-1px]">←</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[11px] text-gray-500 whitespace-nowrap w-[60px] text-right">Razón Social:</span>
                      <div className="bg-[#cccccc] px-2 py-0.5 font-sans text-[12px] flex-1 text-black font-medium truncate">ALTAMIRA FERRE-INDUSTRIAL -</div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2 px-1">
                      <div className="flex items-center gap-2 border-b border-gray-500 pb-0.5 relative">
                        <span className="text-[11px] text-gray-500 whitespace-nowrap w-[65px] text-left">Fecha Comp:</span>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={retencionFecha}
                            readOnly
                            onClick={() => setMostrarCalendario(true)}
                            className="bg-transparent outline-none text-[12px] font-bold text-black w-full font-sans tracking-wide px-1 cursor-pointer"
                          />
                        </div>
                        {/* CALENDARIO SIMULADO */}
                        {mostrarCalendario && (
                          <div className="absolute top-full left-14 mt-1 bg-white border border-gray-400 shadow-2xl z-50 w-44 rounded-sm overflow-hidden select-none">
                            <div className="bg-[#00b0f0] text-black font-bold text-center text-[10px] py-1 border-b border-[#0092c8]">Marzo 2026</div>
                            <div className="grid grid-cols-7 text-[8px] font-bold text-gray-500 text-center bg-gray-100 py-0.5 border-b border-gray-300">
                              <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
                            </div>
                            <div className="grid grid-cols-7 text-[10px] text-black font-bold text-center p-1 gap-y-1">
                              <div className="text-gray-300">1</div><div className="text-gray-300">2</div><div className="text-gray-300">3</div><div className="text-gray-300">4</div>
                              <div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div>
                              <div>12</div><div>13</div><div>14</div><div>15</div><div>16</div><div>17</div><div>18</div>
                              <div>19</div><div>20</div><div>21</div><div>22</div><div>23</div><div>24</div><div>25</div>
                              <div>26</div>
                              <div
                                onClick={() => {
                                  setRetencionFecha('27-03-2026');
                                  setMostrarCalendario(false);
                                }}
                                className="bg-[#00b0f0] text-white rounded-sm cursor-pointer shadow-sm hover:bg-[#0092c8]"
                              >
                                27
                              </div>
                              <div>28</div><div>29</div><div>30</div><div>31</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pb-0.5 border-b border-gray-600">
                        <span className="text-[11px] text-gray-500 whitespace-nowrap w-[65px] text-left">Comprobante:</span>
                        <div className="flex items-center gap-2 flex-1 relative top-0.5">
                          <div className="bg-[#b3b3b3] px-1 py-0.5 w-16">
                            <input
                              type="text"
                              value={retencionPeriodo}
                              onChange={(e) => setRetencionPeriodo(e.target.value.replace(/\D/g, ''))}
                              placeholder="YYYYMM"
                              maxLength={6}
                              className="bg-transparent outline-none text-[12px] font-bold text-black w-full font-sans tracking-wider text-center"
                            />
                          </div>
                          <div className="flex-1 border-b-[2px] border-[#3f51b5] pb-0.5 ml-1 mr-1">
                            <input
                              type="text"
                              value={retencionSecuencia}
                              onChange={(e) => setRetencionSecuencia(e.target.value.replace(/\D/g, ''))}
                              placeholder="00000000"
                              maxLength={8}
                              className="w-full bg-transparent outline-none text-[12px] font-bold text-black font-sans tracking-wider px-1 text-left"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 px-1 flex flex-col gap-1 overflow-hidden mt-1 pb-1">
                    <div className="flex-1 border border-black flex flex-col bg-white overflow-hidden font-sans mx-1 mb-1">
                      <div className="flex bg-[#a6a6a6] text-white font-medium text-[11px]">
                        <div className="w-10 text-center py-1 border-r border-[#cfcfcf]">Tipo</div>
                        <div className="flex-1 px-1 py-1 border-r border-[#cfcfcf] text-center">No. Fiscal</div>
                        <div className="w-20 text-center py-1">Monto (USD)</div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {[
                          { nro: '06980316', monto: '8,87', isTarget: true },
                          { nro: '06980336', monto: '1,38', isTarget: false },
                          { nro: '06982446', monto: '1,79', isTarget: false },
                          { nro: '06982447', monto: '2,84', isTarget: false },
                          { nro: '06982589', monto: '1.160,40', isTarget: false },
                          { nro: '06984423', monto: '4,41', isTarget: false },
                          { nro: '06985798', monto: '22,31', isTarget: false },
                          { nro: '06987571', monto: '2,97', isTarget: false },
                          { nro: '06987584', monto: '0,65', isTarget: false },
                          { nro: '06989077', monto: '9,27', isTarget: false },
                          { nro: '06990475', monto: '6,05', isTarget: false }
                        ].map((row, i) => {
                          const isSel = row.isTarget ? invoiceChecked : false;
                          return (
                            <div key={i} onClick={() => {
                              if (row.isTarget) {
                                setInvoiceChecked(false);
                                setMostrarDetalleRetencion(false);
                                setTimeout(() => {
                                  setInvoiceChecked(true);
                                  setMostrarDetalleRetencion(true);
                                }, 50);
                              }
                            }} className={`flex border-b border-gray-200 text-[11px] text-black cursor-pointer hover:bg-gray-100 ${isSel ? 'bg-[#00b0f0]' : ''}`}>
                              <div className="w-10 flex items-center justify-center py-1.5 border-r border-gray-200">
                                <div className={`w-3 h-3 border border-gray-600 bg-white flex items-center justify-center`}>
                                  {isSel && (
                                    <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="w-10 flex items-center justify-center font-bold px-1 py-1.5 border-r border-gray-200 text-[10px]">FAC</div>
                              <div className="flex-1 font-bold px-2 py-1.5 border-r border-gray-200 text-center">{row.nro}</div>
                              <div className="w-20 font-bold text-right px-2 py-1.5">{row.monto}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Modal Detalle Retencion (reten8.jpeg) */}
                    {mostrarDetalleRetencion && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
                        <div className="bg-[#f0f0f0] w-[270px] flex flex-col font-sans shadow-2xl border border-gray-600 animate-in fade-in zoom-in duration-200">
                          <div className="bg-white p-2.5 flex justify-between items-center border-b border-gray-300">
                            <h2 className="text-[14px] font-bold text-black font-sans leading-none mt-1">098 - Detalle Retencion</h2>
                            <button className="bg-gradient-to-br from-[#e6e6e6] to-[#b3b3b3] border border-gray-400 shadow-md text-gray-500 rounded-full w-6 h-6 flex items-center justify-center font-bold text-[12px] hover:scale-105 transition-transform" onClick={() => setMostrarDetalleRetencion(false)}>œ–</button>
                          </div>
                          <div className="p-3 flex flex-col gap-1.5 bg-white">
                            <div className="flex border-b border-gray-400 pb-1 items-center">
                              <span className="w-[85px] text-[12px] text-gray-700">Comprobante:</span>
                              <div className="bg-[#cccccc] flex-1 px-2 py-1 text-right font-sans text-[13px] text-black">
                                {retencionPeriodo ? retencionPeriodo : '202603'}
                                {retencionSecuencia ? retencionSecuencia.padStart(8, '0') : '00001234'}
                              </div>
                            </div>
                            <div className="flex border-b border-gray-400 pb-1 mt-2 items-center">
                              <span className="w-[85px] text-[12px] text-gray-700">Tipo Doc:</span>
                              <div className="bg-[#cccccc] flex-1 px-2 py-1 text-right font-sans text-[13px] text-black">FAC</div>
                            </div>
                            <div className="flex border-b border-gray-400 pb-1 mt-0.5 items-center">
                              <span className="w-[85px] text-[12px] text-gray-700">Nro. Doc:</span>
                              <div className="bg-[#cccccc] flex-1 px-2 py-1 text-right font-sans text-[13px] text-black">06982589</div>
                            </div>
                            <div className="flex border-b border-gray-400 pb-1 mt-0.5 items-center">
                              <span className="w-[85px] text-[12px] text-gray-700">Nro. Control:</span>
                              <div className="bg-[#cccccc] flex-1 px-2 py-1 text-right font-sans text-[13px] text-black opacity-0">.</div>
                            </div>
                            <div className="flex border-b border-gray-400 pb-1 mt-2 items-center">
                              <span className="w-[85px] text-[12px] text-gray-700 leading-tight">Alicuota (%):</span>
                              <div className="bg-[#cccccc] flex-1 px-2 py-1 text-right font-sans text-[12px] tracking-tight text-black">16,00% Ret: 75.0%</div>
                            </div>
                            <div className="flex border-b border-gray-400 pb-1 mt-0.5 items-center">
                              <span className="w-[85px] text-[12px] text-gray-700">Base:</span>
                              <div className="bg-[#cccccc] flex-1 px-2 py-1 text-right font-sans text-[13px] text-black">8.615,78</div>
                            </div>
                            <div className="flex border-b border-gray-400 pb-1 mt-0.5 items-center">
                              <span className="w-[85px] text-[12px] text-gray-700">Impuesto:</span>
                              <div className="bg-[#cccccc] flex-1 px-2 py-1 text-right font-sans text-[13px] text-black">1.160,40</div>
                            </div>
                            <div className="flex border-b border-gray-400 pb-0.5 mt-2 items-center relative">
                              <span className="w-[85px] text-[12px] text-gray-700">Retención:</span>
                              <input
                                type="text"
                                value={retencionMonto}
                                onChange={(e) => setRetencionMonto(e.target.value)}
                                className="bg-white flex-1 px-1 py-1 text-right font-sans text-[15px] text-black outline-none font-medium ml-2"
                              />
                              <div className="absolute right-0 bottom-0.5 w-[140px] h-px bg-gray-500"></div>
                            </div>
                          </div>
                          <div className="bg-[#f0f0f0] flex justify-center gap-4 py-3 border-t border-gray-300">
                            <button onClick={() => setMostrarDetalleRetencion(false)} className="bg-[#d9d9d9] px-6 py-1.5 font-sans font-bold text-[13px] text-black border border-[#a6a6a6] shadow-sm active:bg-gray-300">OK</button>
                            <button onClick={() => setMostrarDetalleRetencion(false)} className="bg-[#d9d9d9] px-4 py-1.5 font-sans font-medium text-[13px] text-black border border-[#a6a6a6] shadow-sm active:bg-gray-300">Cancelar</button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-[#f0f0f0] p-1 flex flex-col gap-1 mx-1">
                      <div className="flex items-center gap-2 border-b border-gray-400 pb-1.5 mb-0.5">
                        <div className="w-4 h-4 border border-gray-600 bg-transparent flex items-center justify-center"></div>
                        <span className="text-[11px] text-black font-sans">Seleccionar todo</span>
                      </div>
                      <div className="flex items-center gap-2 justify-between">
                        <span className="text-[11px] text-gray-500 font-sans">Monto VES:</span>
                        <div className="bg-[#b3b3b3] px-2 py-1 font-sans font-bold text-[13px] flex-1 text-black tracking-wide ml-1 text-right">
                          2.800,30
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <span className="text-[8px] font-black text-gray-300 tracking-[0.3em] uppercase">Security Level: High Protected</span>
            </div>
          </div>
        )}

        {/* PANTALLA: RECIBO INDEX (recibo0.jpg) */}
        {pantalla === 'recibo_index' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden p-0.5">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center text-white font-serif italic text-xs border border-blue-300">f</div>
                </div>
                <span className="text-[13px] font-bold text-black font-sans tracking-tight uppercase">060 - Recibos de Cobro</span>
              </div>
              <div className="text-[14px] font-bold">⋮</div>
            </div>
            <div className="p-1 flex flex-col flex-1 bg-[#f0f0f0]">
              <div className="flex items-center justify-between bg-[#c0c0c0] px-3 py-1.5 shadow-inner mb-1">
                <span className="text-[12px] font-bold text-gray-800 font-sans truncate">GRUPO ISO HOME, C.A - 2531318</span>
                <button
                  onClick={() => setPantalla('recibo_menu')}
                  className="w-6 h-6 bg-[#f0f0f0] rounded-full flex items-center justify-center text-[#808080] border-2 border-[#808080] shadow-sm transform hover:scale-105 active:scale-95 transition-transform"
                >
                  <span className="font-bold text-sm leading-none mt-[-1px]">←</span>
                </button>
              </div>

              <div className="flex-1 border border-gray-500 flex flex-col bg-white">
                <div className="flex bg-[#a6a6a6] text-white font-bold text-[10px] font-sans">
                  <div className="w-8 text-center py-1 border-r border-gray-400">E</div>
                  <div className="flex-1 text-center py-1 border-r border-gray-400">No.</div>
                  <div className="flex-1 text-center py-1 border-r border-gray-400">Fecha</div>
                  <div className="flex-1 text-center py-1">Monto (USD)</div>
                </div>
                <div className="flex-1 flex items-center justify-center text-gray-400 text-[12px] italic">
                  No hay recibos registrados
                </div>
                <div className="bg-[#d0d0d0] text-black font-bold text-[10px] py-1 text-center border-t border-gray-400">
                  Total:
                </div>
              </div>

              <div className="flex gap-2 p-3 justify-center">
                <button
                  onClick={() => { setPantalla('recibo_sel_factura'); setMostrarModalFormasPagoRecibo(true); }}
                  className="bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-2 px-6 border border-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] active:bg-gray-300"
                >
                  NUEVO
                </button>
                <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-2 px-6 border border-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] active:bg-gray-300">ENVIAR EMAIL</button>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 041: SELECCIÓN DE FACTURAS (056 - Por Cobrar / reciboselfactura1.jpg) */}
        {pantalla === 'recibo_sel_factura' && (
          <div className="flex-1 bg-[#f0f0f0] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden p-0.5">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center text-white font-serif italic text-xs border border-blue-300">f</div>
                </div>
                <span className="text-[13px] font-bold text-black font-sans uppercase tracking-tight">056 - Por Cobrar</span>
              </div>
              <div className="text-[14px] font-bold">⋮</div>
            </div>

            <div className="flex flex-col flex-1 p-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between bg-[#c0c0c0] px-2 py-1.5 shadow-inner mb-1 gap-1">
                <span className="text-[11px] font-bold text-gray-800 font-sans truncate flex-1">ALTAMIRA FERRE-INDL</span>
                <button
                  onClick={() => { if (facturaSeleccionada) setPantalla('recibo_incluidas'); }}
                  className={`${facturaSeleccionada ? 'bg-blue-600 text-white' : 'bg-[#e0e0e0] text-gray-500'} text-[9px] font-bold px-2 py-1 border border-gray-400 shadow-sm active:bg-gray-300`}
                >
                  INCLUIR
                </button>
                <button className="w-6 h-6 bg-[#f0f0f0] rounded-full flex items-center justify-center text-gray-500 border-2 border-gray-400 shadow-sm text-xs font-bold font-serif">?</button>
                <button
                  onClick={() => setPantalla('recibo_index')}
                  className="w-6 h-6 bg-[#f0f0f0] rounded-full flex items-center justify-center text-gray-500 border-2 border-gray-400 shadow-sm"
                >
                  <span className="font-bold text-sm leading-none mt-[-1px]">←</span>
                </button>
              </div>

              {/* Ordenar Por */}
              <div className="px-1 py-1 flex items-center gap-2 mb-1">
                <span className="text-[10px] text-gray-600">Ordenar Por:</span>
                <div className="flex-1 bg-white border border-gray-300 text-[10px] px-2 py-0.5 flex justify-between items-center cursor-pointer">
                  <span>Fecha Vencimiento</span>
                  <span className="text-[8px]">▼</span>
                </div>
              </div>

              {/* Tabla */}
              <div className="flex-1 border border-gray-400 bg-white flex flex-col mb-1 overflow-hidden">
                <div className="flex bg-[#a6a6a6] text-white font-bold text-[9px] font-sans">
                  <div className="w-8 text-center py-1 border-r border-gray-300">T</div>
                  <div className="flex-1 text-center py-1 border-r border-gray-300">No. Fiscal</div>
                  <div className="flex-1 text-center py-1">Importe USD</div>
                </div>
                <div className="overflow-y-auto flex-1">
                  <div className="flex bg-[#00b0f0] text-black text-[11px] font-bold font-sans items-center border-b border-gray-200 cursor-pointer">
                    <div className="w-8 flex items-center justify-center border-r border-blue-400 py-2">
                      <input type="checkbox" checked={facturaSeleccionada} onChange={(e) => { e.stopPropagation(); setFacturaSeleccionada(e.target.checked); }} className="w-3 h-3 accent-blue-600" />
                    </div>
                    <div className="w-6 text-center border-r border-blue-400">A</div>
                    <div className="flex-1 pl-2">06948862</div>
                    <div className="flex-1 pr-2 text-right">58,87</div>
                  </div>
                  {[
                    { n: '06956875', m: '46,86' },
                    { n: '06956930', m: '850,79' },
                    { n: '06965151', m: '955,43' },
                    { n: '06965887', m: '122,95' },
                    { n: '06966250', m: '122,13' },
                    { n: '06966278', m: '172,65' },
                    { n: '06966286', m: '38,65' }
                  ].map((row, i) => (
                    <div key={i} className="flex bg-white text-black text-[10px] font-sans items-center border-b border-gray-100 hover:bg-gray-50">
                      <div className="w-8 flex items-center justify-center border-r border-gray-200 py-2">
                        <input type="checkbox" className="w-3 h-3" />
                      </div>
                      <div className="w-6 text-center border-r border-gray-200">A</div>
                      <div className="flex-1 pl-2">{row.n}</div>
                      <div className="flex-1 pr-2 text-right font-bold">{row.m}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#d0d0d0] h-4 border-t border-gray-400"></div>
              </div>

              {/* Footer */}
              <div className="px-2 py-1 space-y-1">
                <div className="flex items-center gap-1 mb-1">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className="text-[10px] text-gray-800 font-bold">Seleccionar todo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-700">Sub-Total (USD):</span>
                  <div className="bg-white border-b border-gray-400 px-2 text-[11px] font-bold min-w-[70px] text-right">50,22</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-700">Descuento (USD):</span>
                  <div className="flex items-center gap-1">
                    <div className="bg-white border-b border-gray-400 px-2 text-[11px] font-bold min-w-[70px] text-right">6,53</div>
                    <button className="w-4 h-4 bg-gray-200 border border-gray-400 text-[10px] flex items-center justify-center rounded">+</button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-700">Cargos (USD):</span>
                  <div className="flex items-center gap-1">
                    <div className="bg-white border-b border-gray-400 px-2 text-[11px] font-bold min-w-[70px] text-right">0,00</div>
                    <button className="w-4 h-4 bg-gray-200 border border-gray-400 text-[10px] flex items-center justify-center rounded">+</button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-300">
                  <span className="text-[11px] font-bold text-gray-700">Total (USD):</span>
                  <div className="bg-white border-b border-gray-400 px-2 text-[12px] font-bold min-w-[70px] text-right">43,69</div>
                </div>
              </div>
            </div>

            {/* MODAL FORMAS DE PAGO (reciboformapagos.jpg) - SOBRE LA 056 */}
            {mostrarModalFormasPagoRecibo && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
                <div className="bg-[#f0f0f0] w-full rounded shadow-2xl overflow-hidden border border-gray-300">
                  <div className="p-3 border-b border-[#00b0f0] flex items-center gap-3 bg-white">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shadow-inner">i</div>
                    <h3 className="text-[14px] font-bold text-[#00b0f0] font-sans">Seleccione la forma de pago</h3>
                  </div>
                  <div className="bg-white">
                    {[
                      'DEPOSITO $',
                      'DEPOSITO EN TRANSITO',
                      'TRANSFERENCIA $ INTERNACION..',
                      'TRANSFERENCIA BS'
                    ].map((fp, i) => (
                      <div
                        key={i}
                        onClick={() => { setFormaPagoReciboSeleccionada(fp); setMostrarModalFormasPagoRecibo(false); }}
                        className="px-4 py-3 text-[13px] font-bold text-gray-800 font-sans border-b border-gray-100 active:bg-blue-50 cursor-pointer"
                      >
                        {fp}
                      </div>
                    ))}
                  </div>
                  <div onClick={() => setMostrarModalFormasPagoRecibo(false)} className="py-3 text-center text-[13px] font-bold text-gray-600 font-sans bg-gray-50 active:bg-gray-200 cursor-pointer">
                    Cancelar
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANTALLA 044: DETALLE RECIBO (059 - Detalle Recibo / reciboincluidas3.jpg) */}
        {pantalla === 'recibo_incluidas' && (
          <div className="flex-1 bg-[#f0f0f0] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden p-0.5">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center text-white font-serif italic text-xs border border-blue-300">f</div>
                </div>
                <span className="text-[13px] font-bold text-black font-sans uppercase tracking-tight">059 - Detalle Recibo</span>
              </div>
              <div className="text-[14px] font-bold">⋮</div>
            </div>

            <div className="flex-1 flex flex-col p-1 overflow-hidden">
              {/* Sección DOCUMENTOS */}
              <div className="flex flex-col h-[40%] mb-1">
                <div className="flex items-center justify-between bg-[#c0c0c0] px-2 py-0.5 shadow-inner">
                  <span className="text-[9px] font-bold text-gray-700 uppercase">DOCUMENTOS</span>
                  <div className="flex items-center gap-1.5">
                    <button className="w-5 h-5 bg-[#f0f0f0] rounded-full border border-gray-400 flex items-center justify-center shadow-sm text-[10px]">ðŸ‘</button>
                    <button onClick={() => setPantalla('recibo_sel_factura')} className="w-5 h-5 bg-[#f0f0f0] rounded-full border border-gray-400 flex items-center justify-center shadow-sm text-[10px] font-bold">+</button>
                    <button className="w-5 h-5 bg-[#f0f0f0] rounded-full border border-gray-400 flex items-center justify-center shadow-sm text-[10px]">✕</button>
                    <button onClick={() => setPantalla('recibo_sel_factura')} className="w-5 h-5 bg-[#f0f0f0] rounded-full border border-gray-400 flex items-center justify-center shadow-sm text-[10px]">←</button>
                  </div>
                </div>
                <div className="flex-1 border border-gray-400 bg-white flex flex-col overflow-hidden">
                  <div className="flex bg-[#a6a6a6] text-white font-bold text-[8px] font-sans">
                    <div className="w-10 text-center py-0.5 border-r border-gray-300">Tipo</div>
                    <div className="flex-1 text-center py-0.5 border-r border-gray-300">No. Fiscal</div>
                    <div className="flex-1 text-center py-0.5 border-r border-gray-300">Forma de Pago</div>
                    <div className="w-12 text-center py-0.5 border-l border-gray-300">Descu</div>
                  </div>
                  <div className="flex-1 bg-white overflow-y-auto">
                    <div className="flex bg-[#00b0f0] text-black text-[9px] font-bold font-sans items-center border-b border-gray-200">
                      <div className="w-10 text-center py-1 border-r border-blue-400">FAC</div>
                      <div className="flex-1 pl-1 border-r border-blue-400">06948862</div>
                      <div className="flex-1 pl-1 border-r border-blue-400 truncate text-[8px] uppercase">{formaPagoReciboSeleccionada}</div>
                      <div className="w-12 text-center border-l border-blue-400"></div>
                    </div>
                  </div>
                  <div className="bg-[#d0d0d0] text-black font-bold text-[9px] py-0.5 text-center border-t border-gray-400">
                    Total:
                  </div>
                </div>
              </div>

              {/* Sección PAGOS */}
              <div className="flex flex-col flex-1 pb-1">
                <div className="flex items-center justify-between bg-[#c0c0c0] px-2 py-0.5 shadow-inner">
                  <div className="flex items-center gap-8">
                    <span className="text-[9px] font-bold text-gray-700 uppercase">PAGOS</span>
                    <span className="text-[9px] font-bold text-gray-500">0</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="w-5 h-5 bg-[#f0f0f0] rounded-full border border-gray-400 flex items-center justify-center shadow-sm text-[10px]">✕</button>
                    <button onClick={() => setMostrarModalDeposito(true)} className="w-5 h-5 bg-[#f0f0f0] rounded-full border border-gray-400 flex items-center justify-center shadow-sm text-[10px] font-bold">+</button>
                  </div>
                </div>
                <div className="flex-1 border border-gray-400 bg-white flex flex-col overflow-hidden">
                  <div className="flex bg-[#a6a6a6] text-white font-bold text-[8px] font-sans">
                    <div className="flex-1 text-center py-0.5 border-r border-gray-300">Pago</div>
                    <div className="flex-1 text-center py-0.5 border-r border-gray-300">Moneda</div>
                    <div className="flex-1 text-center py-0.5">Monto</div>
                  </div>
                  <div className="flex-1 bg-white flex items-center justify-center">
                    {/* Vacío */}
                  </div>
                </div>
              </div>

              {/* Barra de Resta Inferior */}
              <div className="flex items-center gap-1 mt-auto bg-[#e6e6e6] p-1 border-t border-gray-300 h-10">
                <span className="text-[10px] font-bold text-gray-600">Resta:</span>
                <div className="flex-1 flex gap-1 h-full">
                  <div className="flex-1 bg-[#b0b0b0] flex items-center justify-center border border-gray-400 shadow-inner">
                    <span className="text-[12px] font-black text-red-600 font-sans tracking-tight">84,46 USD</span>
                  </div>
                  <div className="flex-1 bg-[#b0b0b0] flex items-center justify-center border border-gray-400 shadow-inner">
                    <span className="text-[12px] font-black text-red-600 font-sans italic tracking-tighter">45.718,20 VES</span>
                  </div>
                </div>
              </div>
            </div>

            {/* EFECTO LUPA MONTOS INFERIORES */}
            {mostrarLupaMontos && (
              <div
                className="absolute z-[210] w-[260px] h-[75px] rounded-2xl border-[4px] border-[#00b0f0] pointer-events-none overflow-hidden animate-in zoom-in duration-500 bg-[#e6e6e6] flex flex-col items-center justify-center p-2"
                style={{
                  bottom: '60px',
                  left: '50%',
                  transform: 'translate(-50%, 0)',
                  boxShadow: '0 0 30px rgba(0,0,0,0.7), inset 0 0 15px rgba(0,0,0,0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none z-10"></div>
                <div className="flex gap-2 w-full h-full z-20">
                  <div className="flex-1 bg-white flex items-center justify-center border border-gray-400 rounded shadow-inner">
                    <span className="text-[17px] font-black text-red-600 font-sans tracking-tight">84,46 <span className="text-[10px]">USD</span></span>
                  </div>
                  <div className="flex-1 bg-white flex items-center justify-center border border-gray-400 rounded shadow-inner">
                    <span className="text-[17px] font-black text-red-600 font-sans tracking-tight">45.718,20 <span className="text-[10px]">VES</span></span>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL DEPOSITO (recibodeposito5.jpg) */}
            {mostrarModalDeposito && (
              <div className="absolute inset-x-4 top-40 bg-white border-t-[3px] border-[#00b0f0] shadow-2xl z-50 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[13px] font-bold text-gray-800">PAGO</h3>
                  <button onClick={() => setMostrarModalDeposito(false)} className="w-6 h-6 bg-red-500 hover:bg-red-600 flex items-center justify-center rounded-full text-white font-bold border border-white shadow-sm active:scale-95 transition-transform">X</button>
                </div>
                <div className="space-y-4 relative">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">MONTO</label>
                    <input type="text" value={montoDeposito} onChange={(e) => setMontoDeposito(e.target.value)} className="w-full border-b border-gray-400 text-[14px] font-bold py-1 outline-none" />
                  </div>
                  {/* Mostrar REFERENCIA y BANCO solo si NO es efectivo ($) */}
                  {formaPagoReciboSeleccionada !== 'DEPOSITO $' && (
                    <>
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold block mb-1">REFERENCIA</label>
                        <input type="text" value={referenciaDeposito} onChange={(e) => setReferenciaDeposito(e.target.value)} placeholder="Numero referencia bancaria" className="w-full border-b border-gray-400 text-[14px] py-1 outline-none" />
                      </div>
                      <div className="relative">
                        <label className="text-[10px] text-gray-500 font-bold block mb-1">BANCO</label>
                        <div
                          className="w-full border-b border-gray-400 text-[14px] py-1 cursor-pointer flex justify-between"
                          onClick={() => setMostrarComboBanco(!mostrarComboBanco)}
                        >
                          <span className={bancoDeposito ? "text-black font-bold" : "text-gray-400"}>{bancoDeposito || "Seleccione el banco"}</span>
                          <span className="text-gray-500 text-xs">▼</span>
                        </div>
                        {mostrarComboBanco && (
                          <div className="absolute top-12 left-0 w-full bg-white border border-gray-300 shadow-lg z-[60] flex flex-col max-h-32 overflow-y-auto">
                            {['Banco Banesco', 'Banco Mercantil', 'Banco Provincial', 'Banco de Venezuela', 'Banco Exterior'].map(b => (
                              <div
                                key={b}
                                className="p-2 text-[12px] hover:bg-blue-100 cursor-pointer border-b border-gray-100 last:border-0 font-bold"
                                onClick={() => { setBancoDeposito(b); setMostrarComboBanco(false); }}
                              >
                                {b}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold block mb-1">FECHA</label>
                        <input type="date" value={fechaDeposito} onChange={(e) => setFechaDeposito(e.target.value)} className="w-full border-b border-gray-400 text-[14px] py-1 outline-none font-bold" />
                      </div>
                    </>
                  )}

                  <div className="flex justify-center pt-2">
                    <button onClick={() => {
                      setMontoDeposito('');
                      setReferenciaDeposito('');
                      setBancoDeposito('');
                      setFechaDeposito('');
                      // El OK solo blanquea, el modal se cierra con la X
                    }} className="bg-gray-200 text-black font-bold px-8 py-2 border border-gray-400 text-[12px] active:bg-gray-300 shadow-sm">OK</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANTALLA 042: RECIBO ABONO (046 - Recibo de Cobro / reciboabono4.jpg) */}
        {pantalla === 'recibo_abono' && (
          <div className="flex-1 bg-[#f0f0f0] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden p-0.5">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center text-white font-serif italic text-xs border border-blue-300">f</div>
                </div>
                <span className="text-[13px] font-bold text-black font-sans uppercase tracking-tight">046 - Recibo de Cobro</span>
              </div>
              <div className="text-[14px] font-bold">⋮</div>
            </div>

            <div className="flex-1 flex flex-col p-1 overflow-y-auto">
              <div className="space-y-1 mt-1">
                {/* Tipo Doc */}
                <div className="flex items-center gap-1">
                  <label className="text-[9px] font-bold text-gray-500 w-16 text-right">Tipo Doc:</label>
                  <div className="flex-1 bg-[#b0b0b0] border border-gray-400 px-2 py-0.5 text-[10px] font-bold text-gray-800">FACTURAS</div>
                  <button onClick={() => setPantalla('recibo_incluidas')} className="w-6 h-6 bg-[#f0f0f0] rounded-full flex items-center justify-center text-gray-500 border-2 border-gray-400 shadow-sm">
                    <span className="font-bold text-sm leading-none mt-[-1px]">←</span>
                  </button>
                </div>

                {/* Nro Doc */}
                <div className="flex items-center gap-1">
                  <label className="text-[9px] font-bold text-gray-500 w-16 text-right">Nro. Doc:</label>
                  <div className="flex-1 bg-[#b0b0b0] border border-gray-400 px-2 py-0.5 text-[10px] font-bold text-gray-800 flex justify-between">
                    <span>06948862</span>
                    <span className="bg-gray-200 px-1 border border-gray-400">P</span>
                  </div>
                </div>

                {/* Fecha */}
                <div className="flex items-center gap-1 justify-end mt-1">
                  <label className="text-[9px] font-bold text-gray-400">Fecha:</label>
                  <div className="bg-[#b0b0b0] border border-gray-400 px-3 py-0.5 text-[10px] font-bold text-gray-800 min-w-[80px]">09-12-2025</div>
                </div>

                {/* Importe */}
                <div className="flex items-center gap-1">
                  <label className="text-[9px] font-bold text-gray-500 w-16 text-right">Importe (USD):</label>
                  <div className="flex-1 bg-[#b0b0b0] border border-gray-400 px-2 py-1 text-[11px] font-bold text-gray-800 text-right">58,87</div>
                </div>

                {/* Saldo */}
                <div className="flex items-center gap-1">
                  <label className="text-[9px] font-bold text-gray-500 w-16 text-right">Saldo (USD):</label>
                  <div className="flex-1 bg-[#b0b0b0] border border-gray-400 px-2 py-1 text-[11px] font-bold text-gray-800 text-right">50,22</div>
                </div>

                {/* Fecha Dep/Trans */}
                <div className="flex items-center gap-1">
                  <label className="text-[8px] font-bold text-gray-500 w-16 text-right leading-tight">
                    {formaPagoReciboSeleccionada.includes('DEPOSITO') ? 'Fecha Dep:' : 'Fecha Dep / Trans:'}
                  </label>
                  <div className="w-6 bg-white border border-gray-400 px-1 text-[10px] text-center">X</div>
                  <div className="flex-1 bg-[#b0b0b0] border border-gray-400 h-6"></div>
                </div>

                {/* P. Pago Row */}
                <div className="flex items-center gap-2 pl-2 mt-2">
                  <input type="checkbox" checked readOnly className="w-3 h-3" />
                  <label className="text-[8px] font-bold text-gray-400">Desc Adic</label>
                  <span className="text-[8px] text-gray-400">P. Pago</span>
                  <div className="bg-[#b0b0b0] border border-gray-400 px-2 py-0.5 text-[10px] font-bold text-gray-800 min-w-[50px]">0,00</div>
                  <div className="flex-1 bg-white border-b border-gray-400 text-[10px] px-2 py-0.5 font-bold">13,00</div>
                  <input type="checkbox" checked readOnly className="w-3 h-3" />
                </div>

                {/* Excluir Retencion */}
                <div className="flex items-center gap-1 pl-2 mb-2">
                  <input type="checkbox" className="w-3 h-3" />
                  <label className="text-[8px] font-bold text-gray-300 uppercase">Excluir Monto de retención</label>
                </div>

                {/* SECCION MONTO EDITABLE */}
                <div className="px-2 pt-2 border-t border-gray-300 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-700">Monto (USD):</span>
                    <div className="flex-1 flex justify-end">
                      <input
                        type="text"
                        value={montoAbono}
                        onChange={(e) => setMontoAbono(e.target.value)}
                        className="bg-white border-b border-gray-400 px-2 text-[12px] font-black min-w-[120px] text-right outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-700">Descuento (USD):</span>
                    <div className="bg-[#b0b0b0] border border-gray-400 px-2 text-[11px] font-bold min-w-[120px] text-right py-0.5">6,53</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-700">Retenciones (USD):</span>
                    <div className="bg-[#b0b0b0] border border-gray-400 px-2 text-[11px] font-bold min-w-[120px] text-right py-0.5">0,00</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-700">Total (USD):</span>
                    <div className="bg-[#b0b0b0] border border-gray-400 px-2 text-[11px] font-bold min-w-[120px] text-right py-1">50,22</div>
                  </div>

                  <div className="flex justify-between items-center bg-gray-200/50 p-1 rounded">
                    <span className="text-[10px] font-bold text-gray-700">Saldo Pend. (USD):</span>
                    <div className="bg-[#b0b0b0] border border-gray-400 px-2 text-[11px] font-bold min-w-[120px] text-right py-0.5">0,00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA: RECIBO PAGADO (recibopagado6.jpg) */}
        {pantalla === 'recibo_pagado' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">045 - Pago de Facturas</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPantalla('recibo_listo')} className="bg-[#e6e6e6] text-black font-bold font-sans text-[11px] px-3 py-1 border border-gray-400 shadow-sm active:bg-gray-300">FIN</button>
                <button onClick={() => setPantalla('recibo_incluidas')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm">
                  ←
                </button>
              </div>
            </div>
            <div className="p-2 flex-1 bg-gray-100 flex flex-col">
              <div className="bg-[#d3d3d3] py-2 px-3 border border-gray-300 text-center mb-2">
                <span className="text-[12px] font-bold text-gray-800 font-sans">GRUPO ISO HOME, C.A - 2531318</span>
              </div>
              <div className="flex-1 border border-gray-400 bg-white flex flex-col">
                <div className="flex bg-[#a6a6a6] text-white font-bold text-[10px] font-sans">
                  <div className="flex-[2] text-center py-1 border-r border-gray-300">Tipo de Pago</div>
                  <div className="flex-1 text-center py-1 border-r border-gray-300">Nro. Ref.</div>
                  <div className="flex-1 text-center py-1">Valor USD</div>
                </div>
                <div className="flex bg-[#00b0f0] text-black font-bold text-[11px] font-sans items-center border-b border-gray-300">
                  <div className="flex-[2] pl-2 py-2 border-r border-blue-400 uppercase">{formaPagoReciboSeleccionada.includes('DEPOSITO') ? formaPagoReciboSeleccionada : 'TRANSFERENCIA USD'}</div>
                  <div className="flex-1 text-center border-r border-blue-400">22558</div>
                  <div className="flex-1 pr-2 text-right">40,00</div>
                </div>
                <div className="flex-1 bg-white"></div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[11px] font-bold text-gray-700">Abono:</span>
                  <span className="text-[12px] font-bold">40,00</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[11px] font-bold text-gray-700">Diferencia:</span>
                  <span className="text-[12px] font-bold">0,00</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA: RECIBO LISTO (recibolisto7.png) */}
        {pantalla === 'recibo_listo' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">023 - Consulta de Pedidos</span>
              </div>
              <button onClick={() => setPantalla('menu')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm">
                ←
              </button>
            </div>
            <div className="flex-1 flex flex-col bg-gray-100 p-2">
              <div className="bg-white px-3 py-2 border border-gray-300 mb-2">
                <span className="text-[12px] font-bold text-black font-sans">GRUPO ISO HOME, C.A - 2531318</span>
              </div>
              <div className="flex-1 border border-gray-400 bg-white flex flex-col">
                <div className="flex bg-[#a6a6a6] text-white font-bold text-[11px] font-sans">
                  <div className="w-8 text-center py-1.5 border-r border-gray-300">S</div>
                  <div className="flex-1 text-center py-1.5 border-r border-gray-300">Nro. Recibo</div>
                  <div className="flex-1 text-center py-1.5">Recibo</div>
                </div>
                <div className="flex bg-[#00b0f0] text-black font-bold text-[12px] font-sans items-center">
                  <div className="w-8 text-center py-2 border-r border-blue-400">A</div>
                  <div className="flex-1 text-center py-2 border-r border-blue-400">60063</div>
                  <div className="flex-1 text-center py-2">60063</div>
                </div>
                <div className="flex-1 bg-white"></div>
              </div>
              <div className="flex gap-2 p-3 justify-center">
                <button onClick={() => setPantalla('recibo_sel_factura')} className="bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-2 px-8 border border-gray-400 shadow-sm active:bg-gray-300">Nuevo</button>
                <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-2 px-8 border border-gray-400 shadow-sm active:bg-gray-300">Enviar Email</button>
              </div>
              <div className="text-center text-[7px] text-gray-400 font-sans pb-1 mt-auto uppercase tracking-tighter">© Copyright Wholesale World Information Systems LTD, 2014</div>
            </div>
          </div>
        )}

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

        {/* GHOST MOUSE POINTER */}
        <div
          className={`absolute z-[100] w-6 h-6 rounded-full border-2 border-white pointer-events-none transition-all ease-in-out flex items-center justify-center overflow-visible ${isClicking ? 'bg-red-700 shadow-[0_0_5px_rgba(185,28,28,0.8)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]'}`}
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: `translate(-50%, -50%) scale(${isClicking ? 0.75 : 1})`,
            transitionDuration: isClicking ? '150ms' : '500ms',
            opacity: cursorPos.visible ? (isClicking ? 1 : 0.7) : 0
          }}
        >
          {isClicking && <div className="ghost-ripple" />}
        </div>

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

        {/* OVERLAY CALCULADORA */}
        {mostrarCalculadora && (
          <div className="absolute inset-0 bg-black/60 z-[200] flex items-center justify-center animate-in fade-in zoom-in duration-300">
            {imgCalculadora === 'calcnew.png' || imgCalculadora === 'calc3.png' ? (
              <div className="relative w-[90%] max-w-[300px] shadow-2xl rounded-xl overflow-hidden border-2 border-white/20">
                <img src={imgCalculadora} alt="Calculadora" className="w-full h-auto" />
                <button
                  onClick={() => setMostrarCalculadora(false)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center font-bold text-sm border border-white/30 backdrop-blur-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative w-[90%] max-w-[320px] bg-[#f3f3f3] shadow-2xl rounded-lg overflow-hidden border border-gray-300 flex flex-col font-sans">
                <div className="flex justify-between items-center p-2 text-xs text-gray-700 bg-white border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Calculadora</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="cursor-pointer px-1 hover:bg-gray-200">-</span>
                    <span className="cursor-pointer px-1 hover:bg-gray-200">\u25FB</span>
                    <button onClick={() => setMostrarCalculadora(false)} className="px-2 hover:bg-red-500 hover:text-white transition-colors">✕</button>
                  </div>
                </div>
                <div className="px-4 pt-4 pb-2">
                  <div className="text-right text-gray-500 text-[13px] h-5 mb-1">
                    {imgCalculadora === 'calc1.png' ? '45718.20 / 84.46 =' : '10988.39 - 541.30 ='}
                  </div>
                  <div className="text-right text-4xl font-semibold text-gray-900 mb-2 truncate tracking-tight">
                    {imgCalculadora === 'calc1.png' ? '541.3' : '20.30'}
                  </div>
                </div>
                <div className="px-1 pb-1">
                  <div className="grid grid-cols-4 gap-[2px]">
                    {/* Fila 1 */}
                    {['%', 'CE', 'C', '\u232B'].map(btn => (
                      <button key={btn} className="bg-[#f9f9f9] hover:bg-[#eaeaea] text-gray-700 text-sm py-3 rounded-sm">{btn}</button>
                    ))}
                    {/* Fila 2 */}
                    {['1/x', 'x\u00B2', '\u221A', '/'].map(btn => (
                      <button key={btn} className="bg-[#f9f9f9] hover:bg-[#eaeaea] text-gray-700 text-sm py-3 rounded-sm">{btn}</button>
                    ))}
                    {/* Fila 3 */}
                    {['7', '8', '9', 'X'].map(btn => (
                      <button key={'btn_' + btn} className={`text-sm py-3 rounded-sm ${['X'].includes(btn) ? 'bg-[#f9f9f9] hover:bg-[#eaeaea] text-gray-700' : 'bg-white hover:bg-[#f9f9f9] text-gray-900 font-semibold shadow-sm'}`}>{btn}</button>
                    ))}
                    {/* Fila 4 */}
                    {['4', '5', '6', '-'].map(btn => (
                      <button key={'btn_' + btn} className={`text-sm py-3 rounded-sm ${['-'].includes(btn) ? 'bg-[#f9f9f9] hover:bg-[#eaeaea] text-gray-700' : 'bg-white hover:bg-[#f9f9f9] text-gray-900 font-semibold shadow-sm'}`}>{btn}</button>
                    ))}
                    {/* Fila 5 */}
                    {['1', '2', '3', '+'].map(btn => (
                      <button key={'btn_' + btn} className={`text-sm py-3 rounded-sm ${['+'].includes(btn) ? 'bg-[#f9f9f9] hover:bg-[#eaeaea] text-gray-700' : 'bg-white hover:bg-[#f9f9f9] text-gray-900 font-semibold shadow-sm'}`}>{btn}</button>
                    ))}
                    {/* Fila 6 */}
                    {['+/-', '0', '.', '='].map(btn => (
                      <button key={'btn_' + btn} className={`text-sm py-3 rounded-sm ${['='].includes(btn) ? 'bg-[#0067c0] hover:bg-[#005a9e] text-white' : '+/-' === btn || '.' === btn ? 'bg-[#f9f9f9] hover:bg-[#eaeaea] text-gray-700' : 'bg-white hover:bg-[#f9f9f9] text-gray-900 font-semibold shadow-sm'}`}>{btn}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OVERLAY SOPORTE PAGO */}
        {mostrarSoporte && (
          <div className="absolute inset-0 bg-black/70 z-[200] flex items-center justify-center animate-in fade-in slide-in-from-bottom duration-500">
            <div className="relative w-[92%] max-h-[85%] shadow-2xl rounded-lg overflow-hidden border-4 border-white/10 flex flex-col bg-white">
              <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-700 uppercase">Soporte de Pago</span>
                <button
                  onClick={() => setMostrarSoporte(false)}
                  className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-gray-200 relative">
                <img src="soportepago.jpeg" alt="Soporte de Pago" className="w-full h-auto" />

                {/* EFECTO LUPA (ZOOM SOBRE EL MONTO) */}
                {mostrarLupa && (
                  <div
                    className="absolute z-[210] w-32 h-32 rounded-full border-4 border-blue-500 shadow-2xl pointer-events-none overflow-hidden animate-in zoom-in duration-500"
                    style={{
                      top: '55%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundImage: 'url(soportepago.jpeg)',
                      backgroundSize: '300%', // Magnificación 3x
                      backgroundPosition: '50% 64%', // Centrado en el monto (ajustado empíricamente)
                      boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    {/* Reflejo de cristal de la lupa */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

