export function useGhostDemos({
  stopRequestedRef,
  setStopRequested,
  setCursorPos,
  setNarracionTexto,
  setIsPaused,
  isPausedRef,
  setIsClicking,
  setPantalla,
  setMostrarModalOtorgar,
  setMostrarComboNivel,
  setNivelSeleccionado,
  setCondicionPedido,
  setMostrarModalNegociacion,
  setMostrarModalCierra1,
  setMostrarModalCierra2,
  setGrupoSeleccionado,
  setCantidadProducto,
  setModalCierraGV1,
  setModalCierraGV2,
  setBusquedaProducto,
  setBusquedaNombre,
  setProductoActivoIndex,
  setMostrarBuscaNombre,
  setMostrarAfvCalc,
  setAfvCalcPrecio,
  setAfvCalcNombre,
  setAfvDctoComercial,
  setAfvDctoFP,
  setMostrarSubmenu,
  setFacturaSeleccionada,
  setMostrarModalFormasPagoRecibo,
  setFormaPagoReciboSeleccionada,
  setMontoResta,
  setMontoAbono,
  setMostrarModalDeposito,
  setMontoDeposito,
  setReferenciaDeposito,
  setMostrarComboBanco,
  setBancoDeposito,
  setFechaDeposito,
  setMostrarLupaMontos,
  setImgCalculadora,
  setMostrarCalculadora,
  setMostrarSoporte,
  setMostrarLupa,
  setInvoiceChecked,
  setMostrarDetalleRetencion,
  setRetencionMonto,
  setRetencionFecha,
  setRetencionPeriodo,
  setRetencionSecuencia,
  setRetencionTipo,
  setRetencionMetodo,
  setMostrarComboRetencion,
  setMostrarCalendario,
  setRetencionesLista,
  MOCK_PRODUCTOS
}) {
  const sleep = (ms) => new Promise((resolve, reject) => {
    let remaining = ms;

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
      setCursorPos({ x: -100, y: -100, visible: false });
      setNarracionTexto('');
      setIsPaused(false);
      setStopRequested(false);
      stopRequestedRef.current = false;
    }
  };

  const triggerClick = async () => {
    setIsClicking(true);
    await sleep(500);
    setIsClicking(false);
  };

  const decir = async (texto, duracion = 2500) => {
    setNarracionTexto(texto);
    await sleep(duracion);
  };

  const runDemoCatalogo = async () => {
    await decir("1.- Click en Pedidos Catalogo");
    setCursorPos({ x: 160, y: 600, visible: true });
    await sleep(100);

    setCursorPos({ x: 160, y: 130, visible: true });
    await sleep(400);
    await triggerClick();
    setPantalla('pedidos_catalogo');
    await sleep(200);

    await decir("2.- Visualiza todos los pedidos que vienen del Catalogo de Clientes.");
    await sleep(400);

    await decir("3.- Seleccione el pedido a visualizar y haga click en Ver detalles.");
    setCursorPos({ x: 230, y: 550, visible: true });
    await sleep(400);
    await triggerClick();
    setPantalla('detalles_pedido');
    await sleep(800);

    await decir("4.- Visualice los productos seleccionados por el cliente.");
    await sleep(2500);

    await decir("5.- Pulse el boton Crear Cotizacion.");
    setCursorPos({ x: 160, y: 550, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('promociones_asociativas');
    await sleep(800);

    await decir("6.- Visualice los descuentos asociados a los productos escogidos. Esta pantalla muestra los descuentos, los haya cumplido o no.");
    await sleep(2500);

    await decir("7.- Pulse el boton Otorgar para aplicar el descuento.");
    setCursorPos({ x: 260, y: 565, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalOtorgar(true);
    await sleep(800);

    await decir("8.- Confirme el descuento pulsando SI.");
    setCursorPos({ x: 230, y: 375, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalOtorgar(false);
    setPantalla('finalizar_pedido');
    await sleep(800);

    await decir("9.- Seleccione el Nivel del Pedido.");
    setCursorPos({ x: 200, y: 170, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarComboNivel(true);
    await sleep(1500);

    await decir("10.- Al seleccionar MAYOREOB, la condicion cambia a 10% hasta 7 días.");
    setCursorPos({ x: 200, y: 200, visible: true });
    await sleep(800);
    await triggerClick();
    setNivelSeleccionado('MAYOREOB');
    setCondicionPedido('10% hasta 7 días');
    setMostrarComboNivel(false);
    await sleep(2500);

    await decir("11.- Al seleccionar MAYOREOD, la condicion queda en blanco.");
    setCursorPos({ x: 200, y: 170, visible: true });
    await sleep(800);
    await triggerClick();
    setMostrarComboNivel(true);
    await sleep(1500);
    setCursorPos({ x: 200, y: 300, visible: true });
    await sleep(800);
    await triggerClick();
    setNivelSeleccionado('MAYOREOD');
    setCondicionPedido('');
    setMostrarComboNivel(false);
    await sleep(2000);

    await decir("12.- Visualice las Etiquetas de Negociacion Especial.");
    setCursorPos({ x: 290, y: 495, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalNegociacion(true);
    await sleep(1500);
    setCursorPos({ x: 270, y: 225, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalNegociacion(false);
    await sleep(800);

    await decir("13.- Cierre en el boton Fin.");
    setCursorPos({ x: 280, y: 350, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalCierra1(true);
    await sleep(800);

    await decir("10, Responda NO.");
    setCursorPos({ x: 80, y: 390, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalCierra1(false);
    setMostrarModalCierra2(true);
    await sleep(800);

    await decir("11. Responda SI.");
    setCursorPos({ x: 240, y: 365, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalCierra2(false);

    await decir("12 Fin");
    setPantalla('consulta_pedidos');
    await sleep(1500);

    setNarracionTexto("");
    setCursorPos({ x: -100, y: -100, visible: false });
  };

  const runDemoGestionVentas = async () => {
    setCursorPos({ x: 160, y: 600, visible: true });
    await sleep(100);

    setCursorPos({ x: 160, y: 300, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('clientes');
    await sleep(800);

    await decir("1.- Gestión de ventas");
    setCursorPos({ x: 160, y: 200, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('gestion_ventas');
    await sleep(800);

    await decir("2 Selecciona al cliente");
    await sleep(1500);

    await decir("3.- Nuevo pedido");
    setCursorPos({ x: 160, y: 180, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('detalle_pedido_nuevo');
    await sleep(800);

    await decir("4.- Selecciona el botón buscar");
    setCursorPos({ x: 160, y: 565, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('productos_busqueda');
    setGrupoSeleccionado('--Seleccione--');
    await sleep(800);

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

    await decir("6.- Selecciona los artículos");
    setCursorPos({ x: 230, y: 540, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('resultados_busqueda');
    setCantidadProducto('1');
    await sleep(800);

    await decir("7.- Coloca la cantidad solicitada");
    setCursorPos({ x: 220, y: 530, visible: true });
    await sleep(1200);
    await triggerClick();
    setCantidadProducto('12');
    await sleep(800);

    await decir("8.- pulsa ok");
    setCursorPos({ x: 280, y: 530, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('detalle_pedido_con_producto');
    await sleep(800);

    await decir("9.- Devuélvete");
    setCursorPos({ x: 230, y: 115, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('finalizar_pedido_gv');
    setNivelSeleccionado('MAYOREOD');
    await sleep(800);

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

    await decir("11.- Valida escala de flete.");
    setCursorPos({ x: 160, y: 440, visible: true });
    await sleep(2000);

    await decir("12.- Visualice las etiquetas de negociacion especial.");
    setCursorPos({ x: 270, y: 430, visible: true });
    await sleep(2000);

    await decir("13.- Cierre en el boton Fin.");
    setCursorPos({ x: 270, y: 430, visible: true });
    await sleep(1200);
    await triggerClick();
    setModalCierraGV1(true);
    await sleep(800);

    await decir("14.- Responda NO.");
    setCursorPos({ x: 110, y: 400, visible: true });
    await sleep(1200);
    await triggerClick();
    setModalCierraGV1(false);
    setModalCierraGV2(true);
    await sleep(800);

    await decir("15.- Responda SI.");
    setCursorPos({ x: 210, y: 380, visible: true });
    await sleep(1200);
    await triggerClick();
    setModalCierraGV2(false);

    await decir("16.- Fin");
    setPantalla('consulta_pedidos');
    await sleep(2000);

    setNarracionTexto("");
    setCursorPos({ x: -100, y: -100, visible: false });
  };

  const runDemo080 = async () => {
    setCursorPos({ x: 160, y: 600, visible: true });
    await sleep(300);
    setPantalla('resultados_busqueda');
    setBusquedaProducto('');
    setBusquedaNombre('');
    setProductoActivoIndex(0);
    setMostrarBuscaNombre(false);
    setMostrarAfvCalc(false);
    await sleep(600);

    await decir("1.- Buscar por código numérico: escribe el código en el campo Buscar.");
    setCursorPos({ x: 160, y: 195, visible: true });
    await sleep(1000);
    await triggerClick();
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

    await decir("2.- Haz clic en un artículo de la lista para seleccionarlo.");
    setCursorPos({ x: 160, y: 290, visible: true });
    await sleep(1200);
    await triggerClick();
    setProductoActivoIndex(1);
    await sleep(1000);

    setBusquedaProducto('');
    setProductoActivoIndex(0);
    await sleep(500);

    await decir("3.- Presiona B. para buscar por nombre o código antiguo.");
    setCursorPos({ x: 242, y: 195, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarBuscaNombre(true);
    await sleep(800);

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

    await decir("5.- Pulsa Buscar para aplicar el filtro por nombre.");
    setCursorPos({ x: 220, y: 400, visible: true });
    await sleep(1200);
    await triggerClick();
    setBusquedaProducto('');
    setProductoActivoIndex(0);
    setMostrarBuscaNombre(false);
    await sleep(900);

    await decir("6.- Selecciona un artículo del resultado de la búsqueda por nombre.");
    setCursorPos({ x: 160, y: 295, visible: true });
    await sleep(1200);
    await triggerClick();
    setProductoActivoIndex(0);
    await sleep(1000);

    await decir("7.- Haz clic en P1 para abrir la Calculadora AFV (084 - Consulta de Precios).");
    setCursorPos({ x: 145, y: 470, visible: true });
    await sleep(1400);
    await triggerClick();
    const pAct = MOCK_PRODUCTOS.filter(p => p.desc.toLowerCase().includes('canilla'))[0];
    if (pAct) {
      setAfvCalcPrecio(pAct.p1);
      setAfvCalcNombre('P1');
      setAfvDctoComercial('0');
      setAfvDctoFP('');
      setMostrarAfvCalc(true);
    }
    await sleep(1000);

    await decir("8.- Selecciona un Descuento de Promoción en la calculadora.");
    setCursorPos({ x: 200, y: 370, visible: true });
    await sleep(1200);
    await triggerClick();
    setAfvDctoComercial('5');
    await sleep(1200);

    await decir("9.- Selecciona la Forma de Pago: TRANSFERENCIA INTERNACIONAL USD 15%.");
    setCursorPos({ x: 200, y: 420, visible: true });
    await sleep(1200);
    await triggerClick();
    setAfvDctoFP('TRANSFERENCIA INTERNACIONAL USD 15%');
    await sleep(1500);

    await decir("10.- Cierra la calculadora.");
    setCursorPos({ x: 285, y: 42, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarAfvCalc(false);
    await sleep(800);

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

    await decir("12.- Cierra la calculadora P2.");
    setCursorPos({ x: 285, y: 42, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarAfvCalc(false);
    await sleep(800);

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

    await decir("15.- Ir a la pantalla 016 - Finalizar Pedido.");
    setCursorPos({ x: 160, y: 430, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('finalizar_pedido_gv');
    await sleep(1000);

    await decir("16.- Pulsa el botón FIN para generar el cierre del pedido.");
    setCursorPos({ x: 235, y: 370, visible: true });
    await sleep(1400);
    await triggerClick();
    setModalCierraGV1(true);
    await sleep(1000);

    await decir("17.- El sistema pregunta: ¿Desea añadir más artículos? Responda NO.");
    setCursorPos({ x: 105, y: 420, visible: true });
    await sleep(1500);
    await triggerClick();
    setModalCierraGV1(false);
    setModalCierraGV2(true);
    await sleep(1000);

    await decir("18.- El sistema pregunta: ¿Desea guardar los Datos y Cerrar el Pedido? Responda SI.");
    setCursorPos({ x: 215, y: 420, visible: true });
    await sleep(1500);
    await triggerClick();
    setModalCierraGV2(false);
    await sleep(600);

    await decir("19.- Pedido cerrado correctamente. Se muestra la pantalla 023 - Consulta de Pedidos.");
    setPantalla('consulta_pedidos');
    await sleep(2500);

    setNarracionTexto('');
    setBusquedaProducto('');
    setBusquedaNombre('');
    setProductoActivoIndex(0);
    setCursorPos({ x: -100, y: -100, visible: false });
  };

  const runDemoCobranza = async () => {
    await decir("1.- Ingrese Módulo de cobranza.");
    setCursorPos({ x: 290, y: 60, visible: true });
    await sleep(1000);
    await triggerClick();

    setMostrarSubmenu(true);
    await sleep(800);
    setCursorPos({ x: 200, y: 155, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('recibo_cliente');
    setMostrarSubmenu(false);
    await sleep(800);

    await decir("2.- Seleccione el cliente.");
    setCursorPos({ x: 160, y: 180, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_menu');
    setFacturaSeleccionada(false);
    await sleep(800);

    await decir("3.- Seleccione Recibo de cobro.");
    setCursorPos({ x: 160, y: 340, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_index');
    await sleep(800);

    await decir("4.- Nuevo Recibo de cobro.");
    setCursorPos({ x: 100, y: 560, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_sel_factura');
    setMostrarModalFormasPagoRecibo(true);
    await sleep(1000);

    await decir("5.- Seleccione la forma de pago (Depósito en tránsito).");
    setCursorPos({ x: 160, y: 300, visible: true });
    await sleep(1200);
    await triggerClick();
    setFormaPagoReciboSeleccionada('DEPOSITO $');
    setMostrarModalFormasPagoRecibo(false);
    await sleep(800);

    await decir("6.- Seleccione la factura en el check.");
    setCursorPos({ x: 25, y: 190, visible: true });
    await sleep(1200);
    await triggerClick();
    setFacturaSeleccionada(true);
    await sleep(800);

    await decir("7.- Pulse al botón incluir.");
    setCursorPos({ x: 220, y: 115, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_incluidas');
    setMontoResta('43,59');
    await sleep(800);

    await decir("8.- Mantenga Pulsada la barra azul. Cambiar el monto (abono).");
    setCursorPos({ x: 160, y: 145, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_abono');
    await sleep(800);

    setCursorPos({ x: 230, y: 320, visible: true });
    await sleep(1000);
    await triggerClick();
    setMontoAbono('40');
    await sleep(800);

    await decir("9.- Regresar en la flecha.");
    setCursorPos({ x: 290, y: 99, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('recibo_incluidas');
    setMontoResta('40');
    await sleep(800);

    await decir("10.- Seleccione Simbolo (+).");
    setCursorPos({ x: 280, y: 300, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalDeposito(true);
    await sleep(800);

    await decir("11.- Validar monto.");
    setCursorPos({ x: 50, y: 300, visible: true });
    await sleep(1000);
    await triggerClick();
    setMontoDeposito('40');
    await sleep(500);

    await decir("13.- Pulse ok.");
    setCursorPos({ x: 160, y: 330, visible: true });
    await sleep(1000);
    await triggerClick();
    setMontoDeposito('0');
    await sleep(800);

    await decir("14.- Cerrar en la x.");
    setCursorPos({ x: 270, y: 215, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalDeposito(false);
    setPantalla('recibo_pagado');
    await sleep(800);

    await decir("15.- Finalizar recibo.");
    setCursorPos({ x: 230, y: 55, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_listo');
    await sleep(1500);

    setNarracionTexto('');
    setCursorPos({ x: -100, y: -100, visible: false });
  };

  const runDemoCobranzaBs = async () => {
    await decir("1.- Ingrese Módulo de cobranza.");
    setCursorPos({ x: 290, y: 60, visible: true });
    await sleep(1000);
    await triggerClick();

    setMostrarSubmenu(true);
    await sleep(800);
    setCursorPos({ x: 200, y: 155, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('recibo_cliente');
    setMostrarSubmenu(false);
    await sleep(800);

    await decir("2.- Seleccione el cliente.");
    setCursorPos({ x: 160, y: 180, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_menu');
    await sleep(800);

    await decir("3.- Seleccione Recibo de cobro.");
    setCursorPos({ x: 160, y: 340, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_index');
    await sleep(800);

    await decir("4.- Nuevo Recibo de cobro.");
    setCursorPos({ x: 100, y: 560, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_sel_factura');
    setMostrarModalFormasPagoRecibo(true);
    await sleep(1000);

    await decir("5.- Seleccione la forma de pago (Transferencia en Bs).");
    setCursorPos({ x: 160, y: 370, visible: true });
    await sleep(1200);
    await triggerClick();
    setFormaPagoReciboSeleccionada('TRANSFERENCIA BS');
    setMostrarModalFormasPagoRecibo(false);
    await sleep(800);

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

    await decir("7.- Visualice la parte inferior con los montos en bolívares y dólares.");
    setMostrarLupaMontos(true);
    await sleep(4000);
    setMostrarLupaMontos(false);
    await sleep(500);

    await decir("8.- Calculamos la tasa de la factura (Monto Bs / Monto USD).");
    setImgCalculadora('calc1.png');
    setMostrarCalculadora(true);
    await sleep(3500);
    setMostrarCalculadora(false);
    await sleep(500);

    await decir("8.- Ver soporte de pago enviado por el cliente.");
    setMostrarSoporte(true);
    await sleep(1000);
    setMostrarLupa(true);
    await sleep(3500);
    setMostrarLupa(false);
    setMostrarSoporte(false);
    await sleep(500);

    await decir("9.- Convertimos el monto transferido en Bs a USD usando la tasa.");
    setImgCalculadora('calcnew.png');
    setMostrarCalculadora(true);
    await sleep(3500);
    setMostrarCalculadora(false);
    await sleep(500);

    await decir("10.- Coloque el monto equivalente en USD en el abono.");
    setCursorPos({ x: 160, y: 145, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_abono');
    await sleep(800);
    setCursorPos({ x: 160, y: 320, visible: true });
    await sleep(1200);
    setMontoAbono('84,46');
    await sleep(1000);
    setCursorPos({ x: 160, y: 320, visible: true });
    await sleep(1200);
    setMontoAbono('43,39'); // Ajuste manual
    await sleep(1000);
    setCursorPos({ x: 290, y: 99, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('recibo_incluidas');
    await sleep(800);

    await decir("11.- Seleccione Simbolo (+).");
    setCursorPos({ x: 280, y: 300, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalDeposito(true);
    await sleep(800);

    await decir("12.- Llenamos los datos del pago (Monto, Referencia y Banco).");
    setCursorPos({ x: 50, y: 290, visible: true });
    await sleep(800);
    await triggerClick();
    setMontoDeposito('23.490,11');
    await sleep(800);

    setCursorPos({ x: 50, y: 360, visible: true });
    await sleep(800);
    await triggerClick();
    setReferenciaDeposito('14495478');
    await sleep(800);

    setCursorPos({ x: 160, y: 440, visible: true });
    await sleep(800);
    await triggerClick();
    setMostrarComboBanco(true);
    await sleep(600);
    setCursorPos({ x: 160, y: 550, visible: true });
    await sleep(800);
    await triggerClick();
    setBancoDeposito('Banco de Venezuela');
    setMostrarComboBanco(false);
    await sleep(800);

    setCursorPos({ x: 50, y: 500, visible: true });
    await sleep(800);
    await triggerClick();
    setFechaDeposito('2025-10-24');
    await sleep(800);

    await decir("13.- Pulse OK para añadir pago (se limpian los campos).");
    setCursorPos({ x: 160, y: 520, visible: true });
    await sleep(1000);
    await triggerClick();
    setMontoDeposito('');
    setReferenciaDeposito('');
    setBancoDeposito('');
    setFechaDeposito('');
    await sleep(1000);

    await decir("14.- Cierre la ventana de pago con la X.");
    setCursorPos({ x: 280, y: 210, visible: true });
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
    setInvoiceChecked(false);
    setMostrarDetalleRetencion(false);
    setRetencionMonto('870,30');
    setRetencionFecha('');
    setRetencionPeriodo('');
    setRetencionSecuencia('');

    await decir("1.- Ingrese Módulo de cobranza.");
    setCursorPos({ x: 290, y: 60, visible: true });
    await sleep(1000);
    await triggerClick();

    setMostrarSubmenu(true);
    await sleep(800);
    setCursorPos({ x: 200, y: 155, visible: true });
    await sleep(1000);
    await triggerClick();
    setPantalla('recibo_cliente');
    setMostrarSubmenu(false);
    await sleep(800);

    await decir("2.- Seleccione al cliente.");
    setCursorPos({ x: 160, y: 180, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('recibo_menu');
    await sleep(800);

    await decir("3.- Pulsamos en botón retenciones.");
    setCursorPos({ x: 160, y: 300, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('retencion_list');
    await sleep(1500);

    await decir("4.- Pulsamos botón nuevo.");
    setCursorPos({ x: 200, y: 560, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('retencion_form');
    setRetencionTipo('');
    setRetencionMetodo('--Seleccione--');
    await sleep(1500);

    await decir("5.- Seleccionamos 'Cargar Manual' en el combo.");
    setCursorPos({ x: 100, y: 350, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarComboRetencion(true);
    await sleep(1500);
    setCursorPos({ x: 110, y: 300, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarComboRetencion(false);
    setRetencionMetodo('Cargar Manual');
    await sleep(1000);

    await decir("6.- Pulsamos VALIDAR.");
    setCursorPos({ x: 260, y: 430, visible: true });
    await sleep(1200);
    await triggerClick();
    setRetencionTipo('Manual');
    await sleep(1500);

    await decir("7.- Colocamos la fecha seleccionándola en el calendario.");
    setCursorPos({ x: 160, y: 210, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarCalendario(true);
    await sleep(1000);

    setCursorPos({ x: 140, y: 285, visible: true });
    await sleep(1200);
    await triggerClick();
    setRetencionFecha('27-03-2026');
    setMostrarCalendario(false);
    await sleep(1200);

    setCursorPos({ x: 190, y: 200, visible: true });
    setRetencionPeriodo('202603');
    await decir("8.- Llenamos el campo numero de comprobante.");
    await sleep(800);
    await sleep(800);
    await triggerClick();
    setRetencionSecuencia('00001234');
    await sleep(1500);

    await decir("9.- Marcamos el check de la factura aplicable.");
    setCursorPos({ x: 35, y: 350, visible: true });
    await sleep(1200);
    await triggerClick();
    setInvoiceChecked(true);
    await sleep(1500);

    await decir("10.- Pulsamos sobre la barra azul para abrir el detalle y ajustar la retención.");
    setCursorPos({ x: 150, y: 380, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarDetalleRetencion(true);
    await sleep(1500);

    await decir("11.- Editamos la Retención para igualar el comprobante físico del cliente.");
    setCursorPos({ x: 200, y: 460, visible: true });
    await sleep(1200);
    await triggerClick();
    setRetencionMonto('870,3');
    await sleep(200);
    setRetencionMonto('870,');
    await sleep(200);
    setRetencionMonto('870');
    await sleep(1100);

    await decir("12.- Confirmamos los cambios pulsando OK.");
    setCursorPos({ x: 100, y: 520, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarDetalleRetencion(false);
    await sleep(1500);

    await decir("13.- Finalizamos pulsando FIN.");
    setCursorPos({ x: 245, y: 65, visible: true });
    await sleep(1200);
    await triggerClick();
    setRetencionesLista([{ comprobante: retencionPeriodo + (retencionSecuencia ? retencionSecuencia.padStart(8, '0') : '00000000'), fecha: retencionFecha, monto: retencionMonto }]);
    setPantalla('retencion_list');
    setRetencionTipo('');
    await sleep(1500);

    setNarracionTexto("");
    setCursorPos({ x: -100, y: -100, visible: false });
    setPantalla('menu');
  };

  const runDemoDigitalCatalog = async () => {
    await decir("El Catálogo Digital está deshabilitado.");
    await sleep(2000);
    setNarracionTexto("");
  };

  return {
    sleep,
    stopAllDemos,
    wrapDemo,
    triggerClick,
    decir,
    runDemoCatalogo,
    runDemoGestionVentas,
    runDemo080,
    runDemoCobranza,
    runDemoCobranzaBs,
    runDemoRetencion,
    runDemoDigitalCatalog
  };
}
