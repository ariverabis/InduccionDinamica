import React, { useState, useRef } from 'react'

function App() {
  // Manejador de pantallas: 'inicio', 'escritorio', 'config', 'menu'
  const [pantalla, setPantalla] = useState('inicio');
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
  const [busquedaCatalog, setBusquedaCatalog] = useState('');
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

  const MOCK_PRODUCTOS = [
    { cod: '2213021', old: 'CFLX-01', desc: 'Canilla flexible malla acero 1/2 x 50 x 40 cm', p1: '15.500,00', p2: '12.800,00', inv: 'UND', emp: '12', cmin: '1', dscto: '0,00', exist: '500' },
    { cod: '2213005', old: 'CFLX-02', desc: 'Canilla flexible malla acero 1/2 x 1/2 x 120', p1: '16.200,00', p2: '13.500,00', inv: 'UND', emp: '12', cmin: '1', dscto: '0,00', exist: '420' },
    { cod: '2213001', old: 'CFLX-03', desc: 'Canilla flexible de lujo malla acero 1/2 x 1/2', p1: '18.000,00', p2: '15.000,00', inv: 'UND', emp: '12', cmin: '1', dscto: '5,00', exist: '150' },
    { cod: '2213025', old: 'CFLX-04', desc: 'Canilla flexible malla acero 1/2 x 50 x 40 cm', p1: '15.500,00', p2: '12.800,00', inv: 'UND', emp: '12', cmin: '1', dscto: '0,00', exist: '300' },
    { cod: '2213010', old: 'CFLX-05', desc: 'Canilla flexible extra larga 1/2 x 1/2 x 200 c', p1: '20.000,00', p2: '17.500,00', inv: 'UND', emp: '6', cmin: '1', dscto: '0,00', exist: '80' },
    { cod: '2213007', old: 'CFLX-06', desc: 'Canilla flexible plastificada 1/2 x 40 cm v', p1: '12.500,00', p2: '10.000,00', inv: 'UND', emp: '24', cmin: '1', dscto: '2,00', exist: '600' },
    { cod: '2213030', old: 'CFLX-07', desc: 'Canilla flexible plastificada 1/2 x 1/2 x 120', p1: '14.000,00', p2: '11.500,00', inv: 'UND', emp: '24', cmin: '1', dscto: '0,00', exist: '450' },
    { cod: '2213027', old: 'CFLX-08', desc: 'Canilla flexible para recomeciantes platean', p1: '16.000,00', p2: '13.000,00', inv: 'UND', emp: '12', cmin: '1', dscto: '0,00', exist: '200' },
    { cod: '2213043', old: 'CFLX-09', desc: 'Canilla universal var. tamaños 800-1100', p1: '25.000,00', p2: '21.000,00', inv: 'UND', emp: '6', cmin: '1', dscto: '10,00', exist: '90' },
    { cod: '5544332', old: 'PINT-AV', desc: 'Pintura caucho blanco interior 1 galon', p1: '35.000,00', p2: '30.000,00', inv: 'GLN', emp: '4', cmin: '1', dscto: '0,00', exist: '120' },
    { cod: '5544335', old: 'PINT-EX', desc: 'Pintura esmalte azul exterior 1 galon', p1: '45.000,00', p2: '38.000,00', inv: 'GLN', emp: '4', cmin: '1', dscto: '5,00', exist: '85' },
    { cod: '1122334', old: 'CE-01', desc: 'Cemento gris Portland tipo 1 saco 42.5kg', p1: '8.500,00', p2: '7.800,00', inv: 'SCO', emp: '1', cmin: '10', dscto: '0,00', exist: '1000' },
    { cod: '9988776', old: 'CAB-12', desc: 'Cable cobre THHN 12 AWG rojo 100m', p1: '85.000,00', p2: '75.000,00', inv: 'ROL', emp: '1', cmin: '1', dscto: '12,00', exist: '40' },
    { cod: '9988777', old: 'CAB-10', desc: 'Cable cobre THHN 10 AWG negro 100m', p1: '115.000,00', p2: '100.000,00', inv: 'ROL', emp: '1', cmin: '1', dscto: '15,00', exist: '30' },
    { cod: '4455667', old: 'TU-PVC1', desc: 'Tubo PVC aguas blancas 1/2 x 3m', p1: '4.500,00', p2: '3.800,00', inv: 'UND', emp: '20', cmin: '5', dscto: '0,00', exist: '800' }
  ];

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

  const sleep = (ms) => new Promise((resolve, reject) => {
    let remaining = ms * 0.5; // Velocidad ajustada (multiplicador 0.5 - 2x más rápido que lo normal)

    const check = () => {
      if (stopRequestedRef.current) {
        reject(new Error('STOP_DEMO'));
        return;
      }
      if (!isPausedRef.current) {
        remaining -= 100;
        if (remaining <= 0) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });

  const stopAllDemos = () => {
    stopRequestedRef.current = true;
    setStopRequested(true);
    setTimeout(() => {
      stopRequestedRef.current = false;
      setStopRequested(false);
      setCursorPos({ x: -100, y: -100, visible: false });
      setNarracionTexto('');
      setIsPaused(false);
      isPausedRef.current = false;
    }, 200);
  };

  const wrapDemo = (demoFn) => async () => {
    try {
      await demoFn();
    } catch (err) {
      if (err.message === 'STOP_DEMO') {
        console.log('Demo stopped by user');
      } else {
        console.error('Demo Error:', err);
      }
    } finally {
      // Reset total para seguridad
      setCursorPos({ x: -100, y: -100, visible: false });
      setNarracionTexto('');
      setIsPaused(false);
      setStopRequested(false);
      stopRequestedRef.current = false;
    }
  };

  const triggerClick = async () => {
    setIsClicking(true);
    await sleep(500); // Duración de la animación
    setIsClicking(false);
  };

  const decir = async (texto, duracion = 2500) => {
    setNarracionTexto(texto);
    await sleep(duracion);
    // No limpiamos el texto inmediatamente para que se vea mientras el ratón se mueve
  };

  const runDemoCatalogo = async () => {
    // Inicia abajo oculto y lo muestra
    await decir("1.- Click en Pedidos Catalogo");
    setCursorPos({ x: 160, y: 600, visible: true });
    await sleep(100);

    // 1. Move to "PEDIDOS DEL CATÁLOGO" button
    setCursorPos({ x: 160, y: 130, visible: true });
    //await sleep(1200);
    await sleep(400);
    await triggerClick();
    setPantalla('pedidos_catalogo');
    //await sleep(800);
    await sleep(200);

    // 2. Visualiza todos los pedidos que vienen del catalogo de clientes
    await decir("2.- Visualiza todos los pedidos que vienen del Catalogo de Clientes.");
    //await sleep(2500);
    await sleep(400);

    // 3. Seleccione el pedido y Ver detalles
    await decir("3.- Seleccione el pedido a visualizar y haga click en Ver detalles.");
    setCursorPos({ x: 230, y: 550, visible: true });
    //await sleep(1200);
    await sleep(400);
    await triggerClick();
    setPantalla('detalles_pedido');
    await sleep(800);

    // 4. Visualice productos
    await decir("4.- Visualice los productos seleccionados por el cliente.");
    await sleep(2500);

    // 5. Pulse Crear Cotizacion
    await decir("5.- Pulse el boton Crear Cotizacion.");
    setCursorPos({ x: 160, y: 550, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('promociones_asociativas');
    await sleep(800);

    // 6. Visualice descuentos
    await decir("6.- Visualice los descuentos asociados a los productos escogidos. Esta pantalla muestra los descuentos, los haya cumplido o no.");
    await sleep(2500);

    // 6b. Pulse Otorgar
    await decir("7.- Pulse el boton Otorgar para aplicar el descuento.");
    setCursorPos({ x: 260, y: 565, visible: true }); // Botón Otorgar
    await sleep(1200);
    await triggerClick();
    setMostrarModalOtorgar(true);
    await sleep(800);

    // 6c. Confirmar (SI)
    await decir("8.- Confirme el descuento pulsando SI.");
    setCursorPos({ x: 230, y: 375, visible: true }); // Botón SI en el modal
    await sleep(1200);
    await triggerClick();
    setMostrarModalOtorgar(false);
    setPantalla('finalizar_pedido');
    await sleep(800);

    // 9. Seleccione el Nivel
    await decir("9.- Seleccione el Nivel del Pedido.");
    setCursorPos({ x: 200, y: 170, visible: true }); // Fila Nivel
    await sleep(1200);
    await triggerClick();
    setMostrarComboNivel(true);
    await sleep(1500);

    // Seleccionar MAYOREOB primero
    await decir("10.- Al seleccionar MAYOREOB, la condicion cambia a 10% hasta 7 días.");
    setCursorPos({ x: 200, y: 200, visible: true }); // Posición MAYOREOB
    await sleep(800);
    await triggerClick();
    setNivelSeleccionado('MAYOREOB');
    setCondicionPedido('10% hasta 7 días');
    setMostrarComboNivel(false);
    await sleep(2500);

    // Seleccionar MAYOREOD después
    await decir("11.- Al seleccionar MAYOREOD, la condicion queda en blanco.");
    setCursorPos({ x: 200, y: 170, visible: true });
    await sleep(800);
    await triggerClick();
    setMostrarComboNivel(true);
    await sleep(1500);
    setCursorPos({ x: 200, y: 300, visible: true }); // Posición MAYOREOD (en el combo)
    await sleep(800);
    await triggerClick();
    setNivelSeleccionado('MAYOREOD');
    setCondicionPedido('');
    setMostrarComboNivel(false);
    await sleep(2000);

    // 8. Visualice etiquetas de negociacion
    await decir("12.- Visualice las Etiquetas de Negociacion Especial.");
    setCursorPos({ x: 290, y: 495, visible: true }); // Botón "+"
    await sleep(1200);
    await triggerClick();
    setMostrarModalNegociacion(true);
    await sleep(1500);
    // Cerrar modal
    setCursorPos({ x: 270, y: 225, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalNegociacion(false);
    await sleep(800);

    // 9. Botón Fin
    await decir("13.- Cierre en el boton Fin.");
    setCursorPos({ x: 280, y: 350, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalCierra1(true);
    await sleep(800);

    // 10. Responda NO
    await decir("10, Responda NO.");
    setCursorPos({ x: 80, y: 390, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalCierra1(false);
    setMostrarModalCierra2(true);
    await sleep(800);

    // 11. Responda SI
    await decir("11. Responda SI.");
    setCursorPos({ x: 240, y: 365, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalCierra2(false);

    // 12. Fin
    await decir("12 Fin");
    setPantalla('consulta_pedidos');
    await sleep(1500);

    setNarracionTexto("");
    setCursorPos({ x: -100, y: -100, visible: false });
  };

  const runDemoGestionVentas = async () => {
    // Inicia abajo oculto y lo muestra
    setCursorPos({ x: 160, y: 600, visible: true });
    await sleep(100);

    // 1. Move to "GESTIÓN DE VENTAS" button and Client Selection
    setCursorPos({ x: 160, y: 300, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('clientes');
    await sleep(800);

    // Step 1: selecciona al cliente
    await decir("1.- Gestión de ventas");
    setCursorPos({ x: 160, y: 200, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('gestion_ventas');
    await sleep(800);

    // Step 2: gestión de ventas
    await decir("2 Selecciona al cliente");
    await sleep(1500);

    // Step 3: nuevo pedido
    await decir("3.- Nuevo pedido");
    setCursorPos({ x: 160, y: 180, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('detalle_pedido_nuevo');
    await sleep(800);

    // Step 4: selecciona el botón buscar
    await decir("4.- Selecciona el botón buscar");
    setCursorPos({ x: 160, y: 565, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('productos_busqueda');
    setGrupoSeleccionado('--Seleccione--');
    await sleep(800);

    // Step 5: selecciona el criterio Buscar Grupo Todas.
    await decir("5.- Selecciona el criterio Buscar Grupo Todas.");
    setCursorPos({ x: 200, y: 380, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarComboGrupo(true);
    await sleep(1000);
    setCursorPos({ x: 200, y: 450, visible: true });
    await sleep(800);
    await triggerClick();
    setGrupoSeleccionado('Todas');
    setMostrarComboGrupo(false);
    await sleep(800);

    // Step 6: selecciona los artículos
    await decir("6.- Selecciona los artículos");
    setCursorPos({ x: 230, y: 540, visible: true }); // Botón Buscar
    await sleep(1200);
    await triggerClick();
    setPantalla('resultados_busqueda');
    setCantidadProducto('1');
    await sleep(800);

    // Step 7: coloca la cantidad solicitada
    await decir("7.- Coloca la cantidad solicitada");
    setCursorPos({ x: 220, y: 530, visible: true });
    await sleep(1200);
    await triggerClick();
    setCantidadProducto('12');
    await sleep(800);

    // Step 8: pulsa ok
    await decir("8.- pulsa ok");
    setCursorPos({ x: 280, y: 530, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('detalle_pedido_con_producto');
    await sleep(800);

    // Step 9: devuélvete
    await decir("9.- Devuélvete");
    setCursorPos({ x: 230, y: 115, visible: true }); // Botón FIN
    await sleep(1200);
    await triggerClick();
    setPantalla('finalizar_pedido_gv');
    setNivelSeleccionado('MAYOREOD');
    await sleep(800);

    // Step 10: selecciona nivel (lista de precios).
    await decir("10.- Selecciona nivel (lista de precios).");
    setCursorPos({ x: 200, y: 200, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarComboNivel(true);
    await sleep(1000);
    setCursorPos({ x: 200, y: 240, visible: true });
    await sleep(800);
    await triggerClick();
    setNivelSeleccionado('MAYOREOB');
    setMostrarComboNivel(false);
    await sleep(800);

    // Step 11: valida escala de flete.
    await decir("11.- Valida escala de flete.");
    setCursorPos({ x: 160, y: 440, visible: true }); // Apuntar a escala de flete
    await sleep(2000);

    // Step 12: Visualice las etiquetas de negociacion especial.
    await decir("12.- Visualice las etiquetas de negociacion especial.");
    setCursorPos({ x: 270, y: 430, visible: true }); // No es FIN aún, es el área de abajo
    await sleep(2000);

    // Step 13: Cierre en el boton Fin.
    await decir("13.- Cierre en el boton Fin.");
    setCursorPos({ x: 270, y: 430, visible: true }); // Botón FIN (ajustado x:270, y:430)
    await sleep(1200);
    await triggerClick();
    setModalCierraGV1(true);
    await sleep(800);

    // Step 14: Responda NO.
    await decir("14.- Responda NO.");
    setCursorPos({ x: 110, y: 400, visible: true });
    await sleep(1200);
    await triggerClick();
    setModalCierraGV1(false);
    setModalCierraGV2(true);
    await sleep(800);

    // Step 15: Responda SI.
    await decir("15.- Responda SI.");
    setCursorPos({ x: 210, y: 380, visible: true });
    await sleep(1200);
    await triggerClick();
    setModalCierraGV2(false);

    // Step 16: Fin
    await decir("16.- Fin");
    setPantalla('consulta_pedidos');
    await sleep(2000);

    // Limpiar narración y ocultar puntero
    setNarracionTexto("");
    setCursorPos({ x: -100, y: -100, visible: false });
  };

  const runDemo080 = async () => {
    // Go to the 080 screen
    setCursorPos({ x: 160, y: 600, visible: true });
    await sleep(300);
    setPantalla('resultados_busqueda');
    setBusquedaProducto('');
    setBusquedaNombre('');
    setProductoActivoIndex(0);
    setMostrarBuscaNombre(false);
    setMostrarAfvCalc(false);
    await sleep(600);

    // 1. Buscar por código numérico
    await decir("1.- Buscar por código numérico: escribe el código en el campo Buscar.");
    setCursorPos({ x: 160, y: 195, visible: true });
    await sleep(1000);
    await triggerClick();
    // Type code character by character style
    setBusquedaProducto('2');
    await sleep(300);
    setBusquedaProducto('22');
    await sleep(300);
    setBusquedaProducto('221');
    await sleep(300);
    setBusquedaProducto('2213');
    await sleep(800);
    setProductoActivoIndex(0);
    await sleep(1000);

    // 2. Select a product by clicking it
    await decir("2.- Haz clic en un artículo de la lista para seleccionarlo.");
    setCursorPos({ x: 160, y: 290, visible: true });
    await sleep(1200);
    await triggerClick();
    setProductoActivoIndex(1);
    await sleep(1000);

    // 3. Clear code search
    setBusquedaProducto('');
    setProductoActivoIndex(0);
    await sleep(500);

    // 4. Click B. button to open name search
    await decir("3.- Presiona B. para buscar por nombre o código antiguo.");
    setCursorPos({ x: 242, y: 195, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarBuscaNombre(true);
    await sleep(800);

    // 5. Type in name search
    await decir("4.- Escribir el nombre del artículo o su código antiguo.");
    setCursorPos({ x: 160, y: 270, visible: true });
    await sleep(1000);
    await triggerClick();
    setBusquedaNombre('c');
    await sleep(200);
    setBusquedaNombre('ca');
    await sleep(200);
    setBusquedaNombre('can');
    await sleep(200);
    setBusquedaNombre('cani');
    await sleep(200);
    setBusquedaNombre('canil');
    await sleep(200);
    setBusquedaNombre('canill');
    await sleep(200);
    setBusquedaNombre('canilla');
    await sleep(1200);

    // 6. Click Buscar to apply filter and close modal
    await decir("5.- Pulsa Buscar para aplicar el filtro por nombre.");
    setCursorPos({ x: 220, y: 400, visible: true });
    await sleep(1200);
    await triggerClick();
    setBusquedaProducto('');
    setProductoActivoIndex(0);
    setMostrarBuscaNombre(false);
    await sleep(900);

    // 7. Select first filtered result
    await decir("6.- Selecciona un artículo del resultado de la búsqueda por nombre.");
    setCursorPos({ x: 160, y: 295, visible: true });
    await sleep(1200);
    await triggerClick();
    setProductoActivoIndex(0);
    await sleep(1000);

    // 8. Click on P1 to open AFV calculator
    await decir("7.- Haz clic en P1 para abrir la Calculadora AFV (084 - Consulta de Precios).");
    setCursorPos({ x: 145, y: 470, visible: true });
    await sleep(1400);
    await triggerClick();
    const pAct = MOCK_PRODUCTOS.filter(p =>
      p.desc.toLowerCase().includes('canilla')
    )[0];
    if (pAct) {
      setAfvCalcPrecio(pAct.p1);
      setAfvCalcNombre('P1');
      setAfvDctoComercial('0');
      setAfvDctoFP('');
      setMostrarAfvCalc(true);
    }
    await sleep(1000);

    // 9. Select a promotion discount
    await decir("8.- Selecciona un Descuento de Promoción en la calculadora.");
    setCursorPos({ x: 200, y: 370, visible: true });
    await sleep(1200);
    await triggerClick();
    setAfvDctoComercial('5');
    await sleep(1200);

    // 10. Select payment method
    await decir("9.- Selecciona la Forma de Pago: TRANSFERENCIA INTERNACIONAL USD 15%.");
    setCursorPos({ x: 200, y: 420, visible: true });
    await sleep(1200);
    await triggerClick();
    setAfvDctoFP('TRANSFERENCIA INTERNACIONAL USD 15%');
    await sleep(1500);

    // 11. Close calculator P1
    await decir("10.- Cierra la calculadora.");
    setCursorPos({ x: 285, y: 42, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarAfvCalc(false);
    await sleep(800);

    // 12. Click on P2 to open calculator with P2 price
    await decir("11.- Haz clic en P2 para consultar el precio alternativo (P2).");
    setCursorPos({ x: 235, y: 470, visible: true });
    await sleep(1400);
    await triggerClick();
    if (pAct) {
      setAfvCalcPrecio(pAct.p2);
      setAfvCalcNombre('P2');
      setAfvDctoComercial('0');
      setAfvDctoFP('');
      setMostrarAfvCalc(true);
    }
    await sleep(1800);

    // 13. Close P2 calculator
    await decir("12.- Cierra la calculadora P2.");
    setCursorPos({ x: 285, y: 42, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarAfvCalc(false);
    await sleep(800);

    // 14. Set quantity and press OK
    await decir("13.- Establece la cantidad del artículo y pulsa OK para agregar al pedido.");
    setCursorPos({ x: 240, y: 497, visible: true });
    await sleep(1200);
    await triggerClick();
    setCantidadProducto('6');
    await sleep(1000);
    setCursorPos({ x: 275, y: 497, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('detalle_pedido_con_producto');
    await sleep(1500);

    await decir("14.- Artículo agregado al pedido. Ahora finalizamos el pedido.");
    await sleep(1500);

    // Step 15: Navigate to finalizar pedido
    await decir("15.- Ir a la pantalla 016 - Finalizar Pedido.");
    setCursorPos({ x: 160, y: 430, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('finalizar_pedido_gv');
    await sleep(1000);

    // Step 16: Scroll down and click FIN button
    await decir("16.- Pulsa el botón FIN para generar el cierre del pedido.");
    setCursorPos({ x: 235, y: 370, visible: true });
    await sleep(1400);
    await triggerClick();
    setModalCierraGV1(true);
    await sleep(1000);

    // Step 17: Answer NO to "¿Desea añadir más artículos?"
    await decir("17.- El sistema pregunta: ¿Desea añadir más artículos? Responda NO.");
    setCursorPos({ x: 105, y: 420, visible: true });
    await sleep(1500);
    await triggerClick();
    setModalCierraGV1(false);
    setModalCierraGV2(true);
    await sleep(1000);

    // Step 18: Answer SI to "¿Desea guardar y cerrar?"
    await decir("18.- El sistema pregunta: ¿Desea guardar los Datos y Cerrar el Pedido? Responda SI.");
    setCursorPos({ x: 215, y: 420, visible: true });
    await sleep(1500);
    await triggerClick();
    setModalCierraGV2(false);
    await sleep(600);

    // Step 19: Show consulta_pedidos
    await decir("19.- Pedido cerrado correctamente. Se muestra la pantalla 023 - Consulta de Pedidos.");
    setPantalla('consulta_pedidos');
    await sleep(2500);

    // Reset
    setNarracionTexto('');
    setBusquedaProducto('');
    setBusquedaNombre('');
    setProductoActivoIndex(0);
    setCursorPos({ x: -100, y: -100, visible: false });
  };

  const runDemoCobranza = async () => {
    // 0. Inicio en 073 Ventas Menu
    await decir("1.- Ingrese Módulo de cobranza.");
    setCursorPos({ x: 290, y: 60, visible: true }); // Cerca del botón de 3 puntos/Run
    await sleep(1000);
    await triggerClick();

    // 1. Abrir submenú y seleccionar Cobranza
    setMostrarSubmenu(true);
    await sleep(800);
    setCursorPos({ x: 200, y: 155, visible: true }); // Botón Cobranza en el submenú
    await sleep(1000);
    await triggerClick();
    setPantalla('recibo_cliente');
    setMostrarSubmenu(false);
    await sleep(800);

    // 2. Seleccionar cliente en recibocliente.jpg (088)
    await decir("2.- Seleccione el cliente.");
    setCursorPos({ x: 160, y: 180, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_menu');
    setFacturaSeleccionada(false);
    await sleep(800);

    // 3. Seleccionar botón "RECIBO" en recibomenu1.jpg
    await decir("3.- Seleccione Recibo de cobro.");
    setCursorPos({ x: 160, y: 340, visible: true }); // Botón Recibo
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_index');
    await sleep(800);

    // 4. Clic en botón "NUEVO" en recibo0.jpg
    await decir("4.- Nuevo Recibo de cobro.");
    setCursorPos({ x: 100, y: 560, visible: true }); // Botón Nuevo abajo
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_sel_factura');
    setMostrarModalFormasPagoRecibo(true); // Se abre inmediatamente al entrar a 056
    await sleep(1000);

    // 4.5. Seleccionar "DEPOSITO $" en el overlay
    await decir("5.- Seleccione la forma de pago (Depósito en tránsito).");
    setCursorPos({ x: 160, y: 300, visible: true }); // Opción DEPOSITO $
    await sleep(1200);
    await triggerClick();
    setFormaPagoReciboSeleccionada('DEPOSITO $');
    setMostrarModalFormasPagoRecibo(false); // Se cierra el overlay y queda 056
    await sleep(800);

    // 5. Seleccionar check de factura
    await decir("6.- Seleccione la factura en el check.");
    setCursorPos({ x: 25, y: 190, visible: true }); // Check a la izquierda
    await sleep(1200);
    await triggerClick();
    setFacturaSeleccionada(true);
    await sleep(800);

    // 5.5. Clic en botón "INCLUIR" arriba
    await decir("7.- Pulse al botón incluir.");
    setCursorPos({ x: 220, y: 115, visible: true }); // Botón INCLUIR
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_incluidas');
    setMontoResta('43,59');
    await sleep(800);

    // 6. Clic en barra azul para abono
    await decir("8.- Mantenga Pulsada la barra azul. Cambiar el monto (abono).");
    setCursorPos({ x: 160, y: 145, visible: true }); // Barra azul de factura
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_abono');
    await sleep(800);

    // 7. Cambiar monto 43,59 a 40
    setCursorPos({ x: 230, y: 320, visible: true }); // Campo monto
    await sleep(1000);
    await triggerClick();
    setMontoAbono('40');
    await sleep(800);
    // Clic flecha arriba derecha para volver
    await decir("9.- Regresar en la flecha.");
    setCursorPos({ x: 290, y: 99, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('recibo_incluidas');
    setMontoResta('40');
    await sleep(800);

    // 8. Clic en símbolo + (plus)
    await decir("10.- Seleccione Simbolo (+).");
    setCursorPos({ x: 280, y: 300, visible: true }); // Símbolo plus central
    await sleep(1200);
    await triggerClick();
    setMostrarModalDeposito(true);
    await sleep(800);

    // 9. Colocar monto 40 y referencia
    await decir("11.- Validar monto.");
    setCursorPos({ x: 50, y: 300, visible: true }); // Campo monto
    await sleep(1000);
    await triggerClick();
    setMontoDeposito('40');
    await sleep(500);
    //await decir("12. Validar Referencia.");
    //setCursorPos({ x: 50, y: 350, visible: true }); // Campo referencia
    //await sleep(1000);
    //await triggerClick();
    //setReferenciaDeposito('001212');
    //await sleep(800);

    // 10. Clic OK
    await decir("13.- Pulse ok.");
    setCursorPos({ x: 160, y: 330, visible: true }); // Botón OK
    await sleep(1000);
    await triggerClick();
    setMontoDeposito('0');
    await sleep(800);
    //setReferenciaDeposito('');
    //await sleep(800);

    // 11. Clic X arriba derecha
    await decir("14.- Cerrar en la x.");
    setCursorPos({ x: 270, y: 215, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalDeposito(false);
    setPantalla('recibo_pagado');
    await sleep(800);

    // 12. Clic en botón FIN
    await decir("15.- Finalizar recibo.");
    setCursorPos({ x: 230, y: 55, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_listo');
    await sleep(1500);

    // Limpiar narración al finalizar
    setNarracionTexto('');
    setCursorPos({ x: -100, y: -100, visible: false });
  };

  const runDemoCobranzaBs = async () => {
    // 0. Inicio en 073 Ventas Menu
    await decir("1.- Ingrese Módulo de cobranza.");
    setCursorPos({ x: 290, y: 60, visible: true });
    await sleep(1000);
    await triggerClick();

    // 1. Abrir submenú y seleccionar Cobranza
    setMostrarSubmenu(true);
    await sleep(800);
    setCursorPos({ x: 200, y: 155, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('recibo_cliente');
    setMostrarSubmenu(false);
    await sleep(800);

    // 2. Seleccionar cliente
    await decir("2.- Seleccione el cliente.");
    setCursorPos({ x: 160, y: 180, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_menu');
    await sleep(800);

    // 3. Seleccionar botón "RECIBO"
    await decir("3.- Seleccione Recibo de cobro.");
    setCursorPos({ x: 160, y: 340, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_index');
    await sleep(800);

    // 4. Clic en botón "NUEVO"
    await decir("4.- Nuevo Recibo de cobro.");
    setCursorPos({ x: 100, y: 560, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_sel_factura');
    setMostrarModalFormasPagoRecibo(true);
    await sleep(1000);

    // 5. Seleccionar "TRANSFERENCIA BS" (Nueva opción)
    await decir("5.- Seleccione la forma de pago (Transferencia en Bs).");
    setCursorPos({ x: 160, y: 370, visible: true }); // Ajustado para ser la nueva opción abajo
    await sleep(1200);
    await triggerClick();
    setFormaPagoReciboSeleccionada('TRANSFERENCIA BS');
    setMostrarModalFormasPagoRecibo(false);
    await sleep(800);

    // 6. Visualizar pantalla de recibo (con los montos reales: 84.46 USD / 45.718,20 VES)
    //await decir("6.- Visualice los montos en la pantalla (84.46 USD / 45.718,20 VES).");
    //setPantalla('recibo_incluidas');
    //await sleep(2500);

    // 7. Seleccionar check de factura y pasar a abono
    setPantalla('recibo_sel_factura');
    await sleep(800);
    await decir("6.- Seleccione la factura y pulse Incluir.");
    setCursorPos({ x: 25, y: 190, visible: true });
    await sleep(1000);
    await triggerClick();
    setFacturaSeleccionada(true);
    await sleep(800);
    setCursorPos({ x: 220, y: 115, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('recibo_incluidas');
    await sleep(800);

    // 7.5 Efecto lupa en los montos inferiores
    await decir("7.- Visualice la parte inferior con los montos en bolívares y dólares.");
    setMostrarLupaMontos(true);
    await sleep(4000);
    setMostrarLupaMontos(false);
    await sleep(500);

    // 8. Representar calculadora (calc1.png) - Cálculo de tasa
    await decir("8.- Calculamos la tasa de la factura (Monto Bs / Monto USD).");
    setImgCalculadora('calc1.png');
    setMostrarCalculadora(true);
    await sleep(3500);
    setMostrarCalculadora(false);
    await sleep(500);

    // 9. Ver Soporte de Pago (soportepago.jpeg)
    await decir("8.- Ver soporte de pago enviado por el cliente.");
    setMostrarSoporte(true);
    await sleep(1000);
    setMostrarLupa(true); // Activar efecto lupa
    await sleep(3500);
    setMostrarLupa(false);
    setMostrarSoporte(false);
    await sleep(500);

    // 10. Representar calculadora (calcnew.png) - Saber monto en USD
    await decir("9.- Convertimos el monto transferido en Bs a USD usando la tasa.");
    setImgCalculadora('calcnew.png');
    setMostrarCalculadora(true);
    await sleep(3500);
    setMostrarCalculadora(false);
    await sleep(500);

    // 11. Colocar el monto en USD calculado en el abono
    await decir("10.- Coloque el monto equivalente en USD en el abono.");
    setCursorPos({ x: 160, y: 145, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_abono');
    await sleep(800);
    setCursorPos({ x: 160, y: 320, visible: true });
    await sleep(1200);
    setMontoAbono('84,46'); // Monto de ejemplo de la calculadora calc3
    await sleep(1000);
    setCursorPos({ x: 160, y: 320, visible: true });
    await sleep(1200);
    setMontoAbono('43,39'); // Monto de ejemplo de la calculadora calc3
    await sleep(1000);
    setCursorPos({ x: 290, y: 99, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('recibo_incluidas');
    await sleep(800);

    // 12. Clic en símbolo + para pagos
    await decir("11.- Seleccione Simbolo (+).");
    setCursorPos({ x: 280, y: 300, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalDeposito(true);
    await sleep(800);

    // 13. Colocar monto, banco y referencia
    await decir("12.- Llenamos los datos del pago (Monto, Referencia y Banco).");

    // Monto
    setCursorPos({ x: 50, y: 290, visible: true });
    await sleep(800);
    await triggerClick();
    setMontoDeposito('23.490,11'); // Monto calculado (20.30 USD * 541.30 VES/USD)
    await sleep(800);

    // Referencia
    setCursorPos({ x: 50, y: 360, visible: true });
    await sleep(800);
    await triggerClick();
    setReferenciaDeposito('14495478');
    await sleep(800);

    // Banco
    setCursorPos({ x: 160, y: 440, visible: true }); // Ajustado y:400 a y:440 para apuntar mejor al campo banco
    await sleep(800);
    await triggerClick();
    setMostrarComboBanco(true);
    await sleep(600);
    setCursorPos({ x: 160, y: 550, visible: true }); // Ajustado y:530 a y:550 para click en Banco de Venezuela
    await sleep(800);
    await triggerClick();
    setBancoDeposito('Banco de Venezuela');
    setMostrarComboBanco(false);
    await sleep(800);

    // Fecha
    setCursorPos({ x: 50, y: 500, visible: true });
    await sleep(800);
    await triggerClick();
    setFechaDeposito('2025-10-24'); // Ejemplo fecha del soporte
    await sleep(800);

    // Pulsar OK para limpiar
    await decir("13.- Pulse OK para añadir pago (se limpian los campos).");
    setCursorPos({ x: 160, y: 520, visible: true });
    await sleep(1000);
    await triggerClick();
    setMontoDeposito('');
    setReferenciaDeposito('');
    setBancoDeposito('');
    setFechaDeposito('');
    await sleep(1000);

    // Cerrar y finalizar con la X
    await decir("14.- Cierre la ventana de pago con la X.");
    setCursorPos({ x: 280, y: 210, visible: true }); // Posición de la X
    await sleep(1000);
    await triggerClick();
    setMostrarModalDeposito(false);

    setPantalla('recibo_pagado');
    await sleep(1000);
    setCursorPos({ x: 230, y: 55, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_listo');
    await sleep(1500);

    setNarracionTexto('');
    setCursorPos({ x: -100, y: -100, visible: false });
  };

  const runDemoRetencion = async () => {
    // Reset all modal and form states for clean demo
    setInvoiceChecked(false);
    setMostrarDetalleRetencion(false);
    setRetencionMonto('870,30');
    setRetencionFecha('');
    setRetencionPeriodo('');
    setRetencionSecuencia('');

    // 0. Inicio en 073 Ventas Menu
    await decir("1.- Ingrese Módulo de cobranza.");
    setCursorPos({ x: 290, y: 60, visible: true });
    await sleep(1000);
    await triggerClick();

    // 1. Abrir submenú y seleccionar Cobranza
    setMostrarSubmenu(true);
    await sleep(800);
    setCursorPos({ x: 200, y: 155, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('recibo_cliente');
    setMostrarSubmenu(false);
    await sleep(800);

    // 2. Seleccionar cliente
    await decir("2.- Seleccione al cliente.");
    setCursorPos({ x: 160, y: 180, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_menu');
    await sleep(800);

    // 3. Pulsamos en botón retenciones (Real Component)
    await decir("3.- Pulsamos en botón retenciones.");
    setCursorPos({ x: 160, y: 350, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('retencion_list');
    await sleep(1500);

    // 4. Pulsamos botón nuevo en la lista real
    await decir("4.- Pulsamos botón nuevo.");
    setCursorPos({ x: 80, y: 560, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('retencion_form');
    setRetencionTipo(''); // Reiniciar tipo
    setRetencionMetodo('--Seleccione--');
    await sleep(1500);

    // 5. Seleccionamos carga manual en el combo
    await decir("5.- Seleccionamos 'Cargar Manual' en el combo.");
    setCursorPos({ x: 140, y: 515, visible: true }); // Combo position
    await sleep(1200);
    await triggerClick();
    setMostrarComboRetencion(true);
    await sleep(1500); // Give user time to read the options
    setCursorPos({ x: 140, y: 495, visible: true }); // Move cursor up to 'Cargar Manual' (since dropdown opens upward now)
    await sleep(1200);
    await triggerClick();
    setMostrarComboRetencion(false);
    setRetencionMetodo('Cargar Manual');
    await sleep(1000);

    // 6. Pulsamos VALIDAR
    await decir("6.- Pulsamos VALIDAR.");
    setCursorPos({ x: 260, y: 515, visible: true }); // Botón Validar next to combo
    await sleep(1200);
    await triggerClick();
    setRetencionTipo('Manual');
    await sleep(1500);

    // 7. Colocamos la fecha en el campo real
    await decir("7.- Colocamos la fecha en el campo Fecha Comp.");
    setCursorPos({ x: 160, y: 140, visible: true });
    await sleep(1200);
    await triggerClick();
    setRetencionFecha('27-03-2026');
    await sleep(1500);

    // 8. Llenamos el campo comprobante real
    await decir("8.- Llenamos el campo numero de comprobante.");
    setCursorPos({ x: 190, y: 180, visible: true });
    await sleep(1200);
    await triggerClick();
    setRetencionPeriodo('202603');
    await sleep(800);
    setCursorPos({ x: 260, y: 180, visible: true });
    await sleep(800);
    await triggerClick();
    setRetencionSecuencia('00001234');
    await sleep(1500);

    // 9. Marcamos el check de la factura (Simulando scroll o selección de la última)
    await decir("9.- Marcamos el check de la factura aplicable.");
    setCursorPos({ x: 35, y: 310, visible: true }); // Fila 06982589 aprox
    await sleep(1200);
    await triggerClick();
    setInvoiceChecked(true);
    await sleep(1500);

    // 10. Seleccionar barra azul
    await decir("10.- Pulsamos sobre la barra azul para abrir el detalle y ajustar la retención.");
    setCursorPos({ x: 150, y: 310, visible: true }); // Sobre la barra
    await sleep(1200);
    await triggerClick();
    setMostrarDetalleRetencion(true);
    await sleep(1500);

    // 11. Editar el monto
    await decir("11.- Editamos la Retención para igualar el comprobante físico del cliente.");
    setCursorPos({ x: 200, y: 460, visible: true }); // Dentro del input de Retención en el modal
    await sleep(1200);
    await triggerClick();
    setRetencionMonto('870,30'); // Simulando el tipeo
    await sleep(1500);

    // 12. Confirmar cambio OK
    await decir("12.- Confirmamos los cambios pulsando OK.");
    setCursorPos({ x: 100, y: 520, visible: true }); // OK botón en el modal
    await sleep(1200);
    await triggerClick();
    setMostrarDetalleRetencion(false);
    await sleep(1500);

    // 13. Siguiente paso (FIN)
    await decir("13.- Finalizamos pulsando FIN.");
    setCursorPos({ x: 245, y: 65, visible: true }); // Boton FIN
    await sleep(1200);
    await triggerClick();
    setRetencionesLista([{ comprobante: retencionPeriodo + (retencionSecuencia ? retencionSecuencia.padStart(8, '0') : '00000000'), fecha: retencionFecha, monto: retencionMonto }]);
    setPantalla('retencion_list');
    setRetencionTipo('');
    await sleep(1500);


    // Regresar al menú
    setNarracionTexto("");
    setCursorPos({ x: -100, y: -100, visible: false });
    setPantalla('menu');
  };

  const runDemoDigitalCatalog = async () => {
    // 1. Click en Catálogo Febeca (Escritorio)
    await decir("a).- Menú.");
    setPantalla('escritorio');
    setCursorPos({ x: 160, y: 600, visible: true });
    await sleep(200);
    setCursorPos({ x: 280, y: 155, visible: true }); // Icono Febeca en el grid
    await sleep(1200);
    await triggerClick();
    setPantalla('catalog_main');
    await sleep(800);

    await decir("b).- Escriba Criterio.");
    setCursorPos({ x: 160, y: 85, visible: true }); // Barra búsqueda
    await sleep(1200);
    await triggerClick();
    setBusquedaCatalog('machete');
    await sleep(1000);
    setCursorPos({ x: 295, y: 85, visible: true }); // Lupa
    await sleep(800);
    await triggerClick();
    setPantalla('catalog_search');
    await sleep(800);

    // 2. Click en el resultado (imagen lista machete)
    await decir("c).- Seleccione el producto de la lista.");
    setCursorPos({ x: 160, y: 300, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('catalog_lista_machete');
    await sleep(1000);

    // 3. Click en la lista para ver detalle
    await decir("d).- Ver detalle del producto.");
    setCursorPos({ x: 160, y: 300, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('catalog_detalle_producto');
    await sleep(1000);

    // 4. Click en Carrito / Solicitar Cotización
    await decir("e).- Seleccione Solicitud de Cotización (Carrito).");
    setCursorPos({ x: 260, y: 520, visible: true }); // Aproximado para el área del carrito
    await sleep(1200);
    await triggerClick();
    setPantalla('catalog_detalle_machete_cantidad');
    setCantidadMachete('0');
    setErrorMachete('');
    await sleep(1000);

    // 5. Ingresar cantidad (múltiplo de 3)
    await decir("f).- Ingrese la cantidad (Debe ser múltiplo de 3).");
    setCursorPos({ x: 160, y: 320, visible: true }); // Input de cantidad
    await sleep(1200);
    await triggerClick();
    setCantidadMachete('6');
    await sleep(1500);

    // 6. Click en Aceptar
    await decir("g).- Pulse Aceptar para añadir al carrito.");
    setCursorPos({ x: 220, y: 400, visible: true }); // Botón Aceptar
    await sleep(1200);
    await triggerClick();
    setPantalla('catalog_main');
    await sleep(1500);

    setNarracionTexto("");
    setBusquedaCatalog("");
    setCursorPos({ x: -100, y: -100, visible: false });
  };

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
            <div className="w-40 h-40 mb-2 flex items-center justify-center">
              <img src="logoafv.jpeg" alt="AFV Logo" className="max-w-full max-h-full object-contain" />
            </div>
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

            <div className="relative z-10 grid grid-cols-4 gap-4 mt-6 px-2">
              {/* ICONO FEBECA */}
              <div onClick={() => {
                setloginUsername('admin');
                setloginPassword('1111');
                setloginError('');
                setPantalla('login_afv');
              }} title="Ingresar al módulo de AFV Febeca" className="flex flex-col items-center cursor-pointer">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md mb-1">
                  <img src="logoafv.jpeg" alt="Febeca" className="w-full h-full object-contain rounded-lg" />
                </div>
                <span className="text-[9px] text-white font-medium text-center leading-tight drop-shadow-md">AFV<br />Febeca</span>
              </div>

              <div title="Módulo AFV Sillaca (No disponible)" className="flex flex-col items-center opacity-70 cursor-help">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md mb-1">
                  <img src="logoafv.jpeg" alt="Sillaca" className="w-full h-full object-contain rounded-lg" />
                </div>
                <span className="text-[9px] text-white font-medium text-center leading-tight drop-shadow-md">AFV<br />Sillaca</span>
              </div>

              <div title="Módulo AFV Beval (No disponible)" className="flex flex-col items-center opacity-70 cursor-help">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md mb-1">
                  <img src="logoafv.jpeg" alt="Beval" className="w-full h-full object-contain rounded-lg" />
                </div>
                <span className="text-[9px] text-white font-medium text-center leading-tight drop-shadow-md">AFV<br />Beval</span>
              </div>

              {/* ICONO CATALOGO FEBECA (Deshabilitado temporalmente) */}
              <div
                onClick={() => { }}
                title="Módulo Catálogo Digital (En desarrollo)"
                className="flex flex-col items-center cursor-not-allowed opacity-50"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md mb-1 relative">
                  <img src="logocatalogofebeca.png" alt="Catálogo Febeca" className="w-full h-full object-contain rounded-lg" />
                  {/* Botón Run para el demo del catálogo (Deshabilitado) */}
                  <button
                    disabled
                    className="absolute -top-1 -right-1 bg-gray-400 text-[8px] text-white font-bold p-1 rounded-full shadow-lg z-20 cursor-not-allowed"
                  >
                    Run
                  </button>
                </div>
                <span className="text-[9px] text-white font-medium text-center leading-tight drop-shadow-md">Catálogo<br />Febeca</span>
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 1.5: LOGIN AFV FEBECA */}
        {pantalla === 'login_afv' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col p-6 items-center justify-center relative">
            <button
              onClick={() => setPantalla('escritorio')}
              className="absolute top-4 left-4 text-gray-500 font-bold"
            >
              ←
            </button>
            <div className="w-24 h-24 mb-6">
              <img src="logoafv.jpeg" alt="AFV Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 font-sans">Login AFV Febeca</h2>

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
                onClick={() => {
                  if (loginUsername === 'admin' && loginPassword === '1111') {
                    setloginError('');
                    setPantalla('config');
                  } else {
                    setloginError('Usuario o contraseña incorrectos.');
                  }
                }}
                className="w-full bg-[#00b0f0] text-white font-bold py-3 mt-4 rounded-lg shadow-md active:bg-[#0092c8] transition-colors"
              >
                INGRESAR
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA 2: CONFIGURACIÓN (Corresponde a 016a) */}
        {pantalla === 'config' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col">
            <div className="bg-[#009bba] p-3 flex items-center justify-between text-white shadow-md">
              <span className="font-bold text-[11px] uppercase tracking-wider">000 - Sin Título</span>
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
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative">
            <div className="bg-[#009bba] p-3 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-2">
                <button onClick={() => setPantalla('config')} className="text-lg leading-none">←</button>
                <span className="font-bold text-[11px] uppercase tracking-wider">073 - Ventas menu</span>
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

        {/* PANTALLA 5: PEDIDOS DEL CATÁLOGO (118) */}
        {pantalla === 'pedidos_catalogo' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            {/* Cabecera Celeste */}
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">118 - Pedidos del Catálogo</span>
              </div>
              <span className="text-xl leading-none text-gray-700">⋮</span>
            </div>

            {/* Contenido */}
            <div className="flex-1 flex flex-col p-2 bg-white overflow-hidden">

              {/* Barra de Cliente */}
              <div className="flex items-center justify-between mb-2">
                <div className="bg-[#d3d3d3] py-2 px-2 flex-1 mr-2 border border-gray-300">
                  <span className="text-[13px] text-gray-800 font-sans">FM IMPORT PARTS, C.A. - 2535</span>
                </div>
                <button onClick={() => setPantalla('menu')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">
                  ←
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
            {/* Cabecera Celeste */}
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">119 - Detalle Pedido Catálogo</span>
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
                  ←
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
            {/* Cabecera Celeste */}
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">107 - Promociones Asociativas</span>
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
                        ☁
                      </div>
                      <span className="text-[16px] text-[#00b0f0] font-sans">Confirmación</span>
                    </div>
                    <div className="bg-[#f9f9f9] p-4 border-b border-gray-300">
                      <p className="text-[14px] text-gray-800 font-sans">
                        ¿Desea otorgar 7 porciento de descuento?
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
            {/* Cabecera Celeste */}
            <div className="bg-[#00b0f0] p-2.5 flex items-center text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">016 - Finalizar Pedido</span>
              </div>
            </div>

            {/* Contenido Formulario */}
            <div className="flex-1 overflow-y-auto p-2">

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Pedido:</span>
                <div className="flex-1 bg-[#999999] text-black text-right pr-2 py-0.5 font-sans text-[13px]">62115</div>
                <button onClick={() => setPantalla('promociones_asociativas')} title="Regresar a Promociones Asociativas" className="ml-2 w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#8a8a8a] shadow-sm flex-shrink-0">
                  ←
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
            {/* Cabecera Celeste */}
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">AFV</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">023 - Consulta de Pedidos</span>
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
                  ←
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
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">088 - Clientes</span>
              </div>
              <span className="text-xl leading-none text-gray-700">⋮</span>
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
                  ←
                </button>
              </div>
              <div className="flex items-center mb-2 gap-2">
                <span className="text-[12px] font-bold text-gray-700 font-sans">Cliente:</span>
                <input type="text" value="2531318" readOnly className="bg-[#b3b3b3] text-black font-sans text-[13px] px-2 py-1 flex-1 text-center outline-none border-b border-gray-400" />
                <button className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] px-2 py-1 text-[11px] font-sans shadow-sm hover:bg-[#d4d4d4]">O.P.</button>
                <button className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] px-2 py-1 text-[11px] font-sans shadow-sm hover:bg-[#d4d4d4]">B.</button>
              </div>

              <div className="bg-white border border-gray-400 p-1 mb-1">
                <span className="text-[12px] text-gray-800 font-sans">GRUPO ISO HOME, C.A - 2531318</span>
              </div>

              <div className="flex-1 border border-gray-400 bg-white overflow-y-auto">
                <div onClick={() => setPantalla('gestion_ventas')} className="bg-[#00b0f0] text-black font-bold text-[11px] px-2 py-2 font-sans border-b border-gray-200 cursor-pointer">
                  GRUPO ISO HOME, C.A - 2531318
                </div>
                {[
                  'EMPACADURAS INDUSTRIALES DEL CI - 2531976',
                  'GRUPO TRIFERCA, C.A - 2580160',
                  'HIPER HIERRO, C.A - 2531151',
                  'HOGAR 245, C.A - ',
                  'INVERSIONES C MIGUEL A C.A - 2525053'
                ].map((cli, i) => (
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
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">028 - Gestión de Ventas</span>
              </div>
              <span className="text-xl leading-none text-gray-700">⋮</span>
            </div>

            <div className="p-2 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-[#d3d3d3] py-2 px-2 flex-1 mr-2 border border-gray-300 text-ellipsis overflow-hidden">
                  <span className="text-[12px] font-bold text-gray-800 font-sans whitespace-nowrap">GRUPO ISO HOME, C.A - 2531318</span>
                </div>
                <button onClick={() => setPantalla('clientes')} title="Regresar a Clientes" className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">
                  ←
                </button>
              </div>

              <div className="mb-4">
                <span className="text-[11px] text-gray-700 font-sans">Código Cliente: 2531976</span>
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
                  <span className="text-[11px] font-bold text-gray-800 font-sans whitespace-nowrap">GRUPO ISO HOME, C.A - 2531318..</span>
                </div>
                <div className="flex gap-1 ml-1">
                  <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[10px] px-2 py-0 border border-gray-400 shadow-sm active:bg-gray-300">FIN</button>
                  <button className="bg-[#e6e6e6] text-black font-bold font-sans text-[10px] px-2 py-0 border border-gray-400 shadow-sm active:bg-gray-300">X</button>
                  <button onClick={() => setPantalla('gestion_ventas')} className="w-6 h-6 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[2px] border-[#999999] shadow-sm flex-shrink-0">
                    ←
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
            <div className="bg-[#00b0f0] p-2.5 flex items-center text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">034 - Productos</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-gray-100 p-3 pt-6 relative">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[14px] font-bold text-gray-800 font-sans">Artículo</span>
                <button onClick={() => setPantalla('detalle_pedido_nuevo')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm flex-shrink-0">
                  ←
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
            {/* Cabecera Azul con logo 'f' */}
            <div className="bg-[#00a2e8] p-2 flex items-center justify-between text-white border-b border-[#008cc9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <span className="text-xl font-black italic text-white drop-shadow-md">f</span>
                  </div>
                </div>
                <span className="text-[15px] font-normal tracking-wide">080 - Productos</span>
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
                  ←
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
                    <button onClick={() => setMostrarBuscaNombre(false)} className="text-white font-bold text-lg leading-none">×</button>
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
                    ×
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
                    ←
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
                  ←
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
                      <button onClick={() => setMostrarObservaciones(false)} className="text-black font-bold text-lg leading-none">×</button>
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
                      <span className="text-[22px]">☁</span>
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
                      <span className="text-[22px]">☁</span>
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
                ←
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
                  <span className="font-bold text-sm leading-none mt-[-1px]">←</span>
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
                  <span className="font-bold text-2xl leading-none mt-[-2px]">←</span>
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
                          <span className="font-bold text-lg leading-none mt-[-1px]">←</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[11px] text-gray-500 whitespace-nowrap w-[60px] text-right">Razón Social:</span>
                      <div className="bg-[#cccccc] px-2 py-0.5 font-sans text-[12px] flex-1 text-black font-medium truncate">ALTAMIRA FERRE-INDUSTRIAL -</div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2 px-1">
                      <div className="flex items-center gap-2 border-b border-gray-500 pb-0.5">
                        <span className="text-[11px] text-gray-500 whitespace-nowrap w-[65px] text-left">Fecha Comp:</span>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={retencionFecha}
                            onChange={(e) => setRetencionFecha(e.target.value)}
                            className="bg-transparent outline-none text-[12px] font-bold text-black w-full font-sans tracking-wide px-1"
                          />
                        </div>
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
                          { nro: '06980316', monto: '8,87', isTarget: false },
                          { nro: '06980336', monto: '1,38', isTarget: false },
                          { nro: '06982446', monto: '1,79', isTarget: false },
                          { nro: '06982447', monto: '2,84', isTarget: false },
                          { nro: '06982589', monto: '1.160,40', isTarget: true },
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
                            <button className="bg-gradient-to-br from-[#e6e6e6] to-[#b3b3b3] border border-gray-400 shadow-md text-gray-500 rounded-full w-6 h-6 flex items-center justify-center font-bold text-[12px] hover:scale-105 transition-transform" onClick={() => setMostrarDetalleRetencion(false)}>✖</button>
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
                  <span className="font-bold text-sm leading-none mt-[-1px]">←</span>
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
                  <span className="font-bold text-sm leading-none mt-[-1px]">←</span>
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
                    <button className="w-5 h-5 bg-[#f0f0f0] rounded-full border border-gray-400 flex items-center justify-center shadow-sm text-[10px]">👁</button>
                    <button onClick={() => setPantalla('recibo_sel_factura')} className="w-5 h-5 bg-[#f0f0f0] rounded-full border border-gray-400 flex items-center justify-center shadow-sm text-[10px] font-bold">+</button>
                    <button className="w-5 h-5 bg-[#f0f0f0] rounded-full border border-gray-400 flex items-center justify-center shadow-sm text-[10px]">×</button>
                    <button onClick={() => setPantalla('recibo_sel_factura')} className="w-5 h-5 bg-[#f0f0f0] rounded-full border border-gray-400 flex items-center justify-center shadow-sm text-[10px]">←</button>
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
                    <button className="w-5 h-5 bg-[#f0f0f0] rounded-full border border-gray-400 flex items-center justify-center shadow-sm text-[10px]">×</button>
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
                    <span className="font-bold text-sm leading-none mt-[-1px]">←</span>
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
                <span className="text-[13px] font-normal text-black font-sans">045 - Pago de Facuras</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPantalla('recibo_listo')} className="bg-[#e6e6e6] text-black font-bold font-sans text-[11px] px-3 py-1 border border-gray-400 shadow-sm active:bg-gray-300">FIN</button>
                <button onClick={() => setPantalla('recibo_incluidas')} className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm">
                  ←
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
                ←
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
          className="absolute z-[100] w-6 h-6 bg-red-500 rounded-full border-2 border-white pointer-events-none transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(239,68,68,0.8)] flex items-center justify-center overflow-visible"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: 'translate(-50%, -50%)',
            opacity: cursorPos.visible ? 0.7 : 0
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
        {/* PANTALLA: CATÁLOGO DIGITAL MAIN */}
        {pantalla === 'catalog_main' && (
          <div className="flex-1 bg-white flex flex-col relative overflow-hidden font-sans">
            {/* Header azul Febeca */}
            <div className="bg-[#00b0f0] p-3 flex items-center shadow-md z-20">
              <button
                onClick={() => setMostrarMenuCatalog(true)}
                className="text-white text-2xl mr-4"
              >
                ≡
              </button>
              <div className="flex-1 flex items-center justify-center pr-6">
                <span className="text-white font-bold text-lg italic tracking-widest">Febeca</span>
              </div>
              <button className="text-white text-xl">🔍</button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-2 space-y-3">
              {/* Search bar faux */}
              <div
                className="bg-white p-2 rounded shadow-sm flex items-center cursor-pointer"
                onClick={() => setPantalla('catalog_search')}
              >
                <input
                  type="text"
                  placeholder="Buscar"
                  className="w-full text-sm outline-none bg-transparent pointer-events-none"
                  value={busquedaCatalog}
                  readOnly
                />
                <span className="text-gray-400">🔍</span>
              </div>

              {/* Banner / Welcome */}
              <div className="bg-white p-3 rounded shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">T</div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-800">¡Bienvenido!</p>
                    <p className="text-[8px] text-gray-500 line-clamp-2">Para realizar su pago de manera rápida y segura...</p>
                  </div>
                </div>
              </div>

              {/* Marcas destacadas */}
              <div className="bg-white p-2 rounded shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-800 uppercase">Marcas Destacadas</span>
                  <span className="text-[9px] text-[#00b0f0] font-bold">VER TODOS</span>
                </div>
                <div className="h-20 bg-gray-50 border border-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src="promocion_asociativa.jpg" alt="Marca" className="h-full w-full object-cover opacity-50" />
                  <span className="absolute text-[12px] font-bold text-gray-400">EMTOP</span>
                </div>
              </div>

              {/* Productos recientemente vistos */}
              <div className="bg-white p-2 rounded shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-800 uppercase">Recientemente Vistos</span>
                  <span className="text-[9px] text-[#00b0f0] font-bold">VER TODOS</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-gray-100 p-2 flex flex-col items-center">
                    <div className="h-16 bg-gray-50 w-full flex items-center justify-center text-2xl">📦</div>
                    <p className="text-[7px] text-center mt-1 font-bold text-gray-600 uppercase">CAVA ARCTIC 46L</p>
                    <p className="text-[9px] font-bold mt-1 text-black">USD 118,61</p>
                  </div>
                  <div className="border border-gray-100 p-2 flex flex-col items-center">
                    <div className="h-16 bg-gray-50 w-full flex items-center justify-center text-2xl">🛠️</div>
                    <p className="text-[7px] text-center mt-1 font-bold text-gray-600 uppercase">LLAVE IMPACTO</p>
                    <p className="text-[9px] font-bold mt-1 text-black">USD 381,83</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Menu Overlay */}
            {mostrarMenuCatalog && (
              <div className="absolute inset-0 z-[100] flex">
                <div className="w-[80%] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                  <div className="bg-[#00b0f0] p-6 text-white flex items-center gap-3 shadow-lg">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <span className="text-[#00b0f0] font-bold italic">f</span>
                    </div>
                    <span className="font-bold text-xl italic tracking-widest">Febeca</span>
                  </div>
                  <div className="flex-1 overflow-y-auto py-2">
                    <div className="px-4 py-2 text-[10px] font-bold text-[#00b0f0] uppercase tracking-wider">Solicitudes de Cotización</div>
                    <div className="flex items-center gap-4 px-6 py-3 hover:bg-gray-100">
                      <span className="text-lg">🛒</span>
                      <span className="text-sm font-semibold text-gray-700">Solicitud Abierta</span>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-3 hover:bg-gray-100 border-b border-gray-100">
                      <span className="text-lg">📋</span>
                      <span className="text-sm font-semibold text-gray-700">Solicitudes Cerradas</span>
                    </div>

                    <div className="px-4 py-2 mt-2 text-[10px] font-bold text-[#f7d117] uppercase tracking-wider">Mis Cotizaciones</div>
                    <div className="flex items-center gap-4 px-6 py-3 hover:bg-gray-100">
                      <span className="text-lg">📄</span>
                      <span className="text-sm font-semibold text-gray-700">Cotizaciones Abiertas</span>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-3 hover:bg-gray-100 border-b border-gray-100">
                      <span className="text-lg">📦</span>
                      <span className="text-sm font-semibold text-gray-700">Cotizaciones Cerradas</span>
                    </div>

                    <div className="px-4 py-2 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Configuración</div>
                    <div
                      onClick={() => { setPantalla('catalog_cuenta'); setMostrarMenuCatalog(false); }}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-gray-100 cursor-pointer"
                    >
                      <span className="text-lg">👤</span>
                      <span className="text-sm font-semibold text-gray-700">Mi Cuenta</span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 flex justify-end">
                    <button onClick={() => setMostrarMenuCatalog(false)} className="text-[#00b0f0] font-bold text-sm">Cerrar</button>
                  </div>
                </div>
                <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setMostrarMenuCatalog(false)}></div>
              </div>
            )}
          </div>
        )}

        {/* PANTALLA: CATÁLOGO CUENTA */}
        {pantalla === 'catalog_cuenta' && (
          <div className="flex-1 bg-white flex flex-col relative overflow-hidden font-sans">
            <div className="bg-[#00b0f0] p-3 flex items-center shadow-md">
              <button onClick={() => setPantalla('catalog_main')} className="text-white text-2xl mr-4">←</button>
              <div className="flex-1 flex items-center justify-center pr-10">
                <span className="text-white font-bold text-lg italic tracking-widest">Febeca</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              <div className="flex flex-col items-center py-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-[#00b0f0] text-4xl mb-3 border-2 border-white shadow-inner">👤</div>
                <p className="font-bold text-gray-800 text-lg">Alberto Gonzalez</p>
                <p className="text-xs text-gray-400">agonzalez@febeca.com.ve</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col p-4 border-b border-gray-50">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Correo Registrado</span>
                  <span className="text-sm text-gray-700">agonzalez@febeca.com.ve</span>
                </div>
                <div className="flex flex-col p-4 border-b border-gray-50 bg-blue-50/30">
                  <span className="text-[10px] text-[#00b0f0] uppercase font-bold tracking-widest mb-1">Última Sincronización</span>
                  <span className="text-sm text-gray-700 font-semibold">{lastSyncDate}</span>
                </div>
                <button
                  onClick={() => setIsSyncing(true)}
                  className="w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 flex justify-between items-center transition-colors active:bg-blue-50"
                >
                  <span className="text-sm font-bold text-gray-700">Iniciar sincronización manual</span>
                  <span className="text-[#00b0f0] text-xl">↻</span>
                </button>
                <button className="w-full text-left p-4 hover:bg-red-50 text-red-500 font-bold text-sm transition-colors uppercase tracking-wider">
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Sync Overlay */}
            {isSyncing && (
              <div className="absolute inset-0 bg-white z-[200] flex flex-col items-center justify-center p-10 text-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="502.6" strokeDashoffset={502.6 - (502.6 * syncProgress) / 100} className="text-[#00b0f0] transition-all duration-500" />
                  </svg>
                  <span className="text-5xl font-light text-gray-800">{syncProgress}%</span>
                </div>
                <p className="text-gray-400 text-sm font-sans mt-8 tracking-[0.3em] uppercase animate-pulse">Cargando Datos</p>
                <button
                  onClick={() => setIsSyncing(false)}
                  className="mt-12 border-2 border-gray-200 px-8 py-2 rounded-full uppercase text-[10px] font-bold text-gray-400 hover:border-red-200 hover:text-red-400 transition-all active:scale-95"
                >
                  Detener Sincronización
                </button>
              </div>
            )}
          </div>
        )}

        {/* PANTALLA: CATÁLOGO BÚSQUEDA */}
        {pantalla === 'catalog_search' && (
          <div className="flex-1 bg-white flex flex-col relative overflow-hidden font-sans">
            <div className="bg-[#00b0f0] p-1 flex flex-col shadow-lg z-20">
              <div className="flex items-center p-2">
                <button onClick={() => setPantalla('catalog_main')} className="text-white text-2xl mr-4">←</button>
                <span className="text-white font-bold text-sm uppercase tracking-wider">Busqueda de Producto</span>
                <span className="ml-auto text-xl text-white">⋮</span>
              </div>
              <div className="flex text-white text-[9px] font-bold uppercase tracking-tighter mt-1">
                <div className="flex-1 text-center py-2 border-b-4 border-white">Productos</div>
                <div className="flex-1 text-center py-2 opacity-60">Categorias</div>
                <div className="flex-1 text-center py-2 opacity-60">Subcategorias</div>
                <div className="flex-1 text-center py-2 opacity-60">Marcas</div>
              </div>
            </div>

            <div className="flex-1 bg-gray-50 flex flex-col p-3">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-3 shadow-sm mb-4 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <input
                  autoFocus
                  type="text"
                  value={busquedaCatalog}
                  onChange={(e) => setBusquedaCatalog(e.target.value)}
                  className="flex-1 outline-none text-sm font-sans font-medium"
                  placeholder="Escriba Criterio"
                />
                {busquedaCatalog && <button onClick={() => setBusquedaCatalog('')} className="text-gray-300 ml-2 text-lg">✕</button>}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 bg-white rounded-xl border border-gray-100 shadow-inner">
                {busquedaCatalog.toLowerCase().includes('machete') ? (
                  <div
                    className="h-full w-full cursor-pointer"
                    onClick={() => setPantalla('catalog_lista_machete')}
                  >
                    <img src="catalogolistamachete.jpg" alt="Lista Machete" className="w-full h-auto" />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-10 opacity-30">
                    <span className="text-6xl mb-4">🔍</span>
                    <p className="text-sm font-bold">Sin resultados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA: CATALOGO LISTA MACHETE */}
        {pantalla === 'catalog_lista_machete' && (
          <div className="flex-1 bg-white flex flex-col relative overflow-hidden font-sans">
            <div className="flex-1 overflow-y-auto">
              <img
                src="catalogolistamachete.jpg"
                alt="Lista Machete Full"
                className="w-full h-auto cursor-pointer"
                onClick={() => setPantalla('catalog_detalle_producto')}
              />
            </div>
            <div className="absolute top-2 left-2">
              <button onClick={() => setPantalla('catalog_search')} className="bg-black/20 text-white p-2 rounded-full">←</button>
            </div>
          </div>
        )}

        {/* PANTALLA: CATALOGO DETALLE PRODUCTO */}
        {pantalla === 'catalog_detalle_producto' && (
          <div className="flex-1 bg-white flex flex-col relative overflow-hidden font-sans">
            <div className="flex-1 overflow-y-auto relative">
              <img
                src="catalogodetalleproducto.jpg"
                alt="Detalle Producto"
                className="w-full h-auto"
              />
              {/* Botón Carrito / Solicitar Cotización */}
              <div
                className="absolute top-[80%] right-[10%] w-16 h-16 cursor-pointer"
                onClick={() => {
                  setPantalla('catalog_detalle_machete_cantidad');
                  setCantidadMachete('0');
                  setErrorMachete('');
                }}
              ></div>
            </div>
            <div className="absolute top-2 left-2">
              <button onClick={() => setPantalla('catalog_lista_machete')} className="bg-black/20 text-white p-2 rounded-full">←</button>
            </div>
          </div>
        )}

        {/* PANTALLA: CATALOGO DETALLE MACHETE CANTIDAD */}
        {pantalla === 'catalog_detalle_machete_cantidad' && (
          <div className="flex-1 bg-white flex flex-col relative overflow-hidden font-sans">
            <div className="flex-1 relative">
              <img
                src="catalogodetallemachetecantidad.jpg"
                alt="Detalle Cantidad"
                className="w-full h-auto"
              />

              {/* Overlay para entrada de cantidad */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6">
                <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-[260px] flex flex-col gap-4">
                  <h3 className="font-bold text-gray-800 text-center">Cantidad a Solicitar</h3>
                  <p className="text-[10px] text-blue-500 text-center font-semibold uppercase tracking-wider">Múltiplos de 3 (Empaquedado)</p>

                  <div className="relative">
                    <input
                      type="number"
                      value={cantidadMachete}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCantidadMachete(val);
                        if (parseInt(val) % 3 !== 0) {
                          setErrorMachete('La cantidad debe ser múltiplo de 3');
                        } else {
                          setErrorMachete('');
                        }
                      }}
                      className={`w-full border-2 p-3 text-center text-xl font-bold rounded-lg outline-none transition-all ${errorMachete ? 'border-red-500 bg-red-50' : 'border-blue-400 focus:border-blue-600'}`}
                    />
                    {errorMachete && (
                      <p className="text-[10px] text-red-500 mt-1 font-bold text-center">{errorMachete}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPantalla('catalog_detalle_producto')}
                      className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-lg active:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (parseInt(cantidadMachete) > 0 && parseInt(cantidadMachete) % 3 === 0) {
                          alert('Producto añadido con éxito!');
                          setPantalla('catalog_main');
                        } else if (parseInt(cantidadMachete) % 3 !== 0) {
                          setErrorMachete('Error: Debe ser múltiplo de 3');
                        }
                      }}
                      className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-lg active:bg-blue-700 shadow-md"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                {/* Header — blue bar */}
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
                  >◁</button>
                </div>

                {/* Top section: table + tipo precio */}
                <div className="flex bg-white border-b border-gray-300">
                  {/* Días / Descuento table */}
                  <div className="flex-1 border-r border-gray-300">
                    <div className="flex bg-[#595959] text-white text-[10px] font-bold">
                      <div className="flex-1 text-center py-1 border-r border-gray-500">Días</div>
                      <div className="flex-1 text-center py-1">Descuento</div>
                    </div>
                    {/* Row 1 — normal (not highlighted) */}
                    <div className="flex text-[11px] font-sans border-b border-gray-200">
                      <div className="flex-1 text-center py-1 border-r border-gray-200 text-gray-700">0,00</div>
                      <div className="flex-1 text-center py-1 text-gray-700">{fmt(dctoPromoNum)}</div>
                    </div>
                    {/* Row 2 — highlighted blue (active) */}
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

                  {/* Precio del Artículo */}
                  <div className="flex items-center gap-1 py-1 border-b border-gray-300">
                    <span className="text-[10px] text-gray-700 font-sans w-[110px] shrink-0">Precio del Artículo:</span>
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
                    <span className="text-[10px] text-gray-700 font-sans w-[110px] shrink-0">Dscto. Promoción:</span>
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
                <span>SIMULACIÓN PRECARGA RETENCIÓN</span>
                <button
                  onClick={() => setMostrarRetencionImg(false)}
                  className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                >✕</button>
              </div>
              <div className="relative">
                <img src={retencionImgSrc} alt="Retencion" className="w-full h-auto" />

                {/* Elementos dinámicos sobre la imagen para simular interacción */}
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
                    <span className="cursor-pointer px-1 hover:bg-gray-200">□</span>
                    <button onClick={() => setMostrarCalculadora(false)} className="px-2 hover:bg-red-500 hover:text-white transition-colors">✕</button>
                  </div>
                </div>
                <div className="px-4 pt-4 pb-2">
                  <div className="text-right text-gray-500 text-[13px] h-5 mb-1">
                    {imgCalculadora === 'calc1.png' ? '45718.20 ÷ 84.46 =' : '10988.39 ÷ 541.30 ='}
                  </div>
                  <div className="text-right text-4xl font-semibold text-gray-900 mb-2 truncate tracking-tight">
                    {imgCalculadora === 'calc1.png' ? '541.3' : '20.30'}
                  </div>
                </div>
                <div className="px-1 pb-1">
                  <div className="grid grid-cols-4 gap-[2px]">
                    {/* Fila 1 */}
                    {['%', 'CE', 'C', '⌫'].map(btn => (
                      <button key={btn} className="bg-[#f9f9f9] hover:bg-[#eaeaea] text-gray-700 text-sm py-3 rounded-sm">{btn}</button>
                    ))}
                    {/* Fila 2 */}
                    {['1/x', 'x²', '√x', '÷'].map(btn => (
                      <button key={btn} className="bg-[#f9f9f9] hover:bg-[#eaeaea] text-gray-700 text-sm py-3 rounded-sm">{btn}</button>
                    ))}
                    {/* Fila 3 */}
                    {['7', '8', '9', '×'].map(btn => (
                      <button key={'btn_' + btn} className={`text-sm py-3 rounded-sm ${['×'].includes(btn) ? 'bg-[#f9f9f9] hover:bg-[#eaeaea] text-gray-700' : 'bg-white hover:bg-[#f9f9f9] text-gray-900 font-semibold shadow-sm'}`}>{btn}</button>
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