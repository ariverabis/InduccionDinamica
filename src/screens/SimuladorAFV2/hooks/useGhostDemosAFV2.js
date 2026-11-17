import { useRef, useState } from 'react';

export function useGhostDemosAFV2({
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
  handleReciboGenerado,
  handleRetencionRegistrada,
  handleDepositoRegistrado
}) {
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const stopRequestedRef = useRef(false);

  const [demoActiva, setDemoActiva] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

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

  const mover = async (x, y, ms = 500) => {
    setCursorPos({ x, y, visible: true });
    await sleep(ms);
  };

  const click = async (ms = 400) => {
    setIsClicking(true);
    await sleep(ms);
    setIsClicking(false);
    await sleep(250);
  };

  const decir = async (texto, ms = 2500) => {
    setNarracionTexto(texto);
    await sleep(ms);
  };

  const stopAllDemos = () => {
    stopRequestedRef.current = true;
    isRunningRef.current = false;
    setDemoActiva(null);
    setIsPaused(false);
    isPausedRef.current = false;
    setTimeout(() => {
      stopRequestedRef.current = false;
      setCursorPos({ x: -100, y: -100, visible: false });
      setNarracionTexto('');
    }, 200);
  };

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
  };

  const wrapDemo = (nombre, demoFn) => async () => {
    if (isRunningRef.current) {
      stopAllDemos();
      await sleep(300);
    }

    isRunningRef.current = true;
    stopRequestedRef.current = false;
    isPausedRef.current = false;
    setIsPaused(false);
    setDemoActiva(nombre);

    try {
      await demoFn();
    } catch (err) {
      if (err.message === 'STOP_DEMO') {
        console.log('Demo AFV 2.0 detenida por el usuario');
      } else {
        console.error('Error en Demo AFV 2.0:', err);
      }
    } finally {
      isRunningRef.current = false;
      setDemoActiva(null);
      setCursorPos({ x: -100, y: -100, visible: false });
      setNarracionTexto('');
      setIsPaused(false);
      isPausedRef.current = false;
    }
  };

  // 1. DEMO: GENERAR RECIBO DE COBRO
  const runDemoRecibo = async () => {
    setTabInferior('inicio');
    setVistaActual('cartera');
    await mover(160, 200);
    await decir('¡Bienvenido al Modo Guiado de AFV 2.0! Vamos a generar un recibo de cobro.', 2400);

    // Paso 1: Seleccionar cliente
    await decir('Paso 1: Localizamos al cliente con saldo pendiente y presionamos "Gestionar cobro".', 2600);
    await mover(160, 420);
    await click();
    const cli = clientes.find(c => c.codigo === '2550979') || clientes[1];
    setClienteSeleccionado(cli);
    setVistaActual('saldo_cuenta');

    // Paso 2: Saldo de cuenta -> Generar recibo
    await sleep(800);
    await decir('Paso 2: En la pantalla de Saldo de Cuenta, presionamos el botón azul "Generar recibo".', 2600);
    await mover(80, 580);
    await click();
    setVistaActual('generar_recibo');

    // Paso 3: Confirmar método y emitir recibo
    await sleep(800);
    await decir('Paso 3: Verificamos facturas, método de pago y tasa oficial del día.', 2600);
    await mover(160, 360);
    await sleep(600);
    await mover(160, 585);
    await decir('Paso 4: Presionamos "Emitir Recibo" para procesar el pago.', 2200);
    await click();

    // Simular guardado
    const facturasCli = facturas.filter(f => f.clienteId === cli.id);
    const totalUSD = facturasCli.reduce((acc, f) => acc + f.saldoUSD, 0);
    handleReciboGenerado({
      clienteId: cli.id,
      clienteNombre: cli.nombre,
      facturasIds: facturasCli.map(f => f.id),
      montoUSD: totalUSD,
      montoBs: totalUSD * 904.37,
      metodo: 'Transferencia Bancaria',
      referencia: 'TRF-DEMO-2026',
      tasaCambio: 904.37
    });

    await sleep(1500);
    await decir('✓ ¡Recibo emitido con éxito! El saldo de la factura quedó cancelado.', 2500);
  };

  // 2. DEMO: CARGAR RETENCIÓN DE IVA
  const runDemoRetencion = async () => {
    setTabInferior('inicio');
    setVistaActual('cartera');
    await mover(160, 200);
    await decir('Modo Guiado: Carga y Validación de Retenciones de IVA (75% / 100%).', 2500);

    // Seleccionar cliente agente de retención (HVENTAS)
    const cli = clientes.find(c => c.codigo === '2501010') || clientes[2];
    await decir('Paso 1: Entramos al comercio agente de retención "HVENTAS, C.A".', 2400);
    await mover(160, 420);
    await click();
    setClienteSeleccionado(cli);
    setVistaActual('saldo_cuenta');

    // Presionar Cargar retenciones
    await sleep(800);
    await decir('Paso 2: Presionamos el acceso directo superior "Cargar retenciones →".', 2500);
    await mover(245, 52);
    await click();
    setVistaActual('cargar_retenciones');

    // Marcar factura
    await sleep(800);
    await decir('Paso 3: Seleccionamos la factura sujeta a retención fiscal.', 2400);
    await mover(45, 230);
    await click();

    // Editar monto con el lápiz
    await decir('Paso 4: Presionamos el icono del lápiz ✏️ para verificar el comprobante.', 2400);
    await mover(285, 230);
    await click();
    const facH = facturas.find(f => f.clienteId === cli.id) || facturas[2];
    setFacturaEditandoRetencion(facH);

    await sleep(1000);
    await decir('Paso 5: Ajustamos el porcentaje legal (75% u 100%) y guardamos.', 2500);
    await mover(230, 395);
    await click();
    setFacturaEditandoRetencion(null);

    // Registrar pago
    await sleep(800);
    await decir('Paso 6: Presionamos "Registrar pago" para precargar el comprobante.', 2500);
    await mover(160, 590);
    await click();

    handleRetencionRegistrada({
      clienteId: cli.id,
      facturasIds: [facH.id],
      totalUSD: facH.montoRetencionUSD || 29.41,
      totalBs: facH.montoRetencionBs || 26597.57,
      comprobante: '2026110000412'
    });

    await sleep(1500);
    await decir('✓ ¡Retención precargada con éxito en AFV 2.0!', 2500);
  };

  // 3. DEMO: REGISTRAR DEPÓSITO BANCARIO
  const runDemoDeposito = async () => {
    setTabInferior('inicio');
    setVistaActual('cartera');
    await mover(160, 200);
    await decir('Modo Guiado: Relación de Depósitos Bancarios y Custodia de Efectivo.', 2500);

    // Hacer clic en Depositar en el banner azul
    await decir('Paso 1: Detectamos dinero pendiente en mano y presionamos el botón azul "Depositar".', 2700);
    await mover(275, 195);
    await click();
    setVistaActual('depositar');

    // Formulario de depósito
    await sleep(800);
    await decir('Paso 2: Seleccionamos el banco recaudador e ingresamos la referencia bancaria.', 2600);
    await mover(160, 280);
    await sleep(500);
    await mover(160, 360);
    await sleep(500);

    // Confirmar
    await decir('Paso 3: Presionamos "Confirmar Depósito" para liquidar el saldo y enviar a auditoría.', 2700);
    await mover(160, 590);
    await click();

    handleDepositoRegistrado({
      bancoReceptor: 'Banesco Banco Universal (Cuenta Recaudadora)',
      bancoEmisor: 'Depósito en Taquilla',
      numeroPlanilla: 'PLN-DEMO-991',
      montoUSD: saldoDepositoPendiente || 745.62,
      montoBs: (saldoDepositoPendiente || 745.62) * 904.37,
      fechaDeposito: new Date().toLocaleDateString('es-VE')
    });

    await sleep(1500);
    await decir('✓ ¡Depósito confirmado! El saldo pendiente en mano ahora es $0,00.', 2500);
  };

  // 4. DEMO: HISTORIAL Y ASIENTOS CONTABLES
  const runDemoHistorial = async () => {
    setVistaActual('cartera');
    await mover(160, 200);
    await decir('Modo Guiado: Consulta de Historial, Documentos y Asientos Contables.', 2500);

    // Ir a pestaña Historial
    await decir('Paso 1: Nos dirigimos a la barra inferior y seleccionamos "HISTORIAL".', 2500);
    await mover(160, 625);
    await click();
    setTabInferior('historial');

    // Abrir Detalle de Factura
    await sleep(800);
    await decir('Paso 2: Presionamos "Detalle de factura >" en la primera factura para auditarla.', 2700);
    await mover(160, 340);
    await click();
    setFacturaDetalle(facturas[0]);

    // Cambiar a Asientos Contables
    await sleep(1000);
    await decir('Paso 3: Cambiamos a la pestaña "Asientos Contables" para ver cuentas deudoras y acreedoras.', 2800);
    await mover(235, 175);
    await click();

    await sleep(2000);
    await decir('Paso 4: Verificamos Cuentas por Cobrar, Débito Fiscal e Ingresos. Cerramos el detalle.', 2700);
    await mover(160, 520);
    await click();
    setFacturaDetalle(null);

    await sleep(1000);
    await decir('✓ ¡Auditoría documental y contable completada exitosamente!', 2500);
  };

  // 5. DEMO: GENERAR LOS 2 ESTADOS DE CUENTA
  const runDemoEstadosCuenta = async () => {
    setTabInferior('inicio');
    setVistaActual('cartera');
    await mover(160, 200);
    await decir('Modo Guiado: Generación de los 2 Tipos de Estados de Cuenta (Resumido y Detallado).', 2800);

    // Seleccionar cliente
    const cli = clientes[1];
    setClienteSeleccionado(cli);
    setVistaActual('saldo_cuenta');

    await sleep(800);
    await decir('Paso 1: Desde la cuenta del cliente, presionamos el botón "Generar Estado".', 2600);
    await mover(235, 580);
    await click();
    setMostrarModalEstado(true);

    // Formato 1: Resumido
    await sleep(1000);
    await decir('Paso 2: Formato 1 (Resumido / Comercial). Diseñado con texto listo para WhatsApp.', 2800);
    await mover(260, 215);
    await click();

    // Formato 2: Detallado
    await sleep(1200);
    await decir('Paso 3: Ahora cambiamos al "Formato 2 (Detallado / Auditoría)" con antigüedad de saldos.', 2800);
    await mover(240, 130);
    await click();

    await sleep(1200);
    await decir('Paso 4: El asesor presiona "Descargar Estado de Cuenta PDF" para emitir el informe oficial.', 2800);
    await mover(160, 360);
    await click();

    await sleep(1500);
    setMostrarModalEstado(false);
    await decir('✓ ¡Los dos formatos de estado de cuenta han sido generados!', 2500);
  };

  return {
    demoActiva,
    isPaused,
    stopAllDemos,
    togglePause,
    runDemoRecibo: wrapDemo('Recibo de Cobro', runDemoRecibo),
    runDemoRetencion: wrapDemo('Carga de Retención', runDemoRetencion),
    runDemoDeposito: wrapDemo('Relación de Depósito', runDemoDeposito),
    runDemoHistorial: wrapDemo('Historial y Asientos', runDemoHistorial),
    runDemoEstadosCuenta: wrapDemo('Estados de Cuenta', runDemoEstadosCuenta)
  };
}

