import React, { useState } from 'react'

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

  // --- COBRANZA STATES ---
  const [montoAbono, setMontoAbono] = useState('43,59');
  const [montoDeposito, setMontoDeposito] = useState('40');
  const [referenciaDeposito, setReferenciaDeposito] = useState('');
  const [mostrarModalDeposito, setMostrarModalDeposito] = useState(false);
  const [montoResta, setMontoResta] = useState('43,59');
  const [mostrarModalFormasPagoRecibo, setMostrarModalFormasPagoRecibo] = useState(false);
  const [formaPagoReciboSeleccionada, setFormaPagoReciboSeleccionada] = useState('PAGO GENERICO');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(false);
  const [narracionTexto, setNarracionTexto] = useState('');

  // --- GHOST MOUSE STATE ---
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false });
  const [isClicking, setIsClicking] = useState(false);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    setCursorPos({ x: 160, y: 600, visible: true });
    await sleep(100);

    // 1. Move to "PEDIDOS DEL CATÁLOGO" button
    setCursorPos({ x: 160, y: 130, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('pedidos_catalogo');
    await sleep(800);

    // 2. Move to "Ver Detalles" on 118
    setCursorPos({ x: 230, y: 550, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('detalles_pedido');
    await sleep(800);

    // 3. Move to "Crear Cotización" on 119
    setCursorPos({ x: 160, y: 550, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('promociones_asociativas');
    await sleep(800);

    // 4. In Promociones Asociativas, "Si" button on modal 107
    setCursorPos({ x: 230, y: 355, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('finalizar_pedido');
    await sleep(800);

    // 5. Mover al combo "Forma Pago" in 016
    setCursorPos({ x: 180, y: 170, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarFormaPagoCombo(true);
    await sleep(1500);
    setMostrarFormaPagoCombo(false);
    await sleep(500);

    // 6. Mover al símbolo "+" Observaciones
    setCursorPos({ x: 290, y: 495, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalNegociacion(true);
    await sleep(800);
    // Mover a "X" close modal
    setCursorPos({ x: 270, y: 225, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalNegociacion(false);
    await sleep(500);

    // 7. Mover al botón "Fin"
    setCursorPos({ x: 280, y: 350, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalCierra1(true);
    await sleep(800);

    // 8. Mover a "No" (modal 1)
    setCursorPos({ x: 80, y: 390, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalCierra1(false);
    setMostrarModalCierra2(true);
    await sleep(800);

    // 9. Mover a "Si" (modal 2)
    setCursorPos({ x: 240, y: 365, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarModalCierra2(false);
    setPantalla('consulta_pedidos');

    // Ocultar puntero
    await sleep(1000);
    setCursorPos({ x: -100, y: -100, visible: false });
  };

  const runDemoGestionVentas = async () => {
    // Inicia abajo oculto y lo muestra
    setCursorPos({ x: 160, y: 600, visible: true });
    await sleep(100);

    // 1. Move to "GESTIÓN DE VENTAS" button in 073
    setCursorPos({ x: 160, y: 300, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('clientes');
    await sleep(800);

    // 2. 088 (Clientes) - Mover y hacer clic en el cliente seleccionado
    setCursorPos({ x: 160, y: 200, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('gestion_ventas');
    await sleep(800);

    // 3. 028 (Gestión) - Mover a "NUEVO PEDIDO"
    setCursorPos({ x: 160, y: 180, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('detalle_pedido_nuevo');
    await sleep(800);

    // 4. 021 (Detalle Pedido) - Mover a "BUSCAR" abajo al centro
    setCursorPos({ x: 160, y: 565, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('productos_busqueda');
    setGrupoSeleccionado('--Seleccione--');
    await sleep(800);

    // 5. 034 (Productos) - Mover al combo "Grupo"
    setCursorPos({ x: 200, y: 380, visible: true });
    await sleep(1200);
    await triggerClick();
    // Abrir visualmente el combo
    setMostrarComboGrupo(true);
    await sleep(1000);
    // Mover al item "Grupo Todas" dentro del combo desplegado
    setCursorPos({ x: 200, y: 450, visible: true });
    await sleep(800);
    await triggerClick();
    // Simular selección de "Grupo Todas"
    setGrupoSeleccionado('Grupo Todas');
    setMostrarComboGrupo(false);
    await sleep(800);

    // 6. 034 (Productos) - Mover al botón "Buscar" (abajo a la derecha)
    setCursorPos({ x: 230, y: 540, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('resultados_busqueda');
    setCantidadProducto('1');
    await sleep(800);

    // 7. 080 (Productos) - Mover al campo "Cant" y cambiar a 12
    setCursorPos({ x: 220, y: 530, visible: true });
    await sleep(1200);
    await triggerClick();
    setCantidadProducto('12');
    await sleep(800);

    // 8. 080 (Productos) - Mover al botón OK
    setCursorPos({ x: 280, y: 530, visible: true });
    await sleep(1000);
    await triggerClick();
    // Navegar a detalle pedido con producto cargado
    setPantalla('detalle_pedido_con_producto');
    await sleep(800);

    // 9. 021 (Detalle con producto) - Mover al botón FIN
    setCursorPos({ x: 230, y: 115, visible: true });
    await sleep(1200);
    await triggerClick();
    setPantalla('finalizar_pedido_gv');
    setNivelSeleccionado('MAYOREOD');
    await sleep(800);

    // 10. 016 (Finalizar Pedido) - Mover al combo Nivel
    setCursorPos({ x: 200, y: 200, visible: true });
    await sleep(1200);
    await triggerClick();
    setMostrarComboNivel(true);
    await sleep(1000);
    // Mover a MAYOREOB
    setCursorPos({ x: 200, y: 240, visible: true });
    await sleep(800);
    await triggerClick();
    setNivelSeleccionado('MAYOREOB');
    setMostrarComboNivel(false);
    await sleep(800);

    // 11. Mover al botón FIN del finalizar pedido
    setCursorPos({ x: 270, y: 430, visible: true });
    await sleep(1200);
    await triggerClick();
    // Mostrar modal confirmación 1
    setModalCierraGV1(true);
    await sleep(800);

    // 12. Mover a "No" en modal 1
    setCursorPos({ x: 110, y: 400, visible: true });
    await sleep(1200);
    await triggerClick();
    setModalCierraGV1(false);
    setModalCierraGV2(true);
    await sleep(800);

    // 13. Mover a "Si" en modal 2
    setCursorPos({ x: 210, y: 380, visible: true });
    await sleep(1200);
    await triggerClick();
    // Ocultar puntero
    await sleep(1000);
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
    await decir("12. Validar Referencia.");
    setCursorPos({ x: 50, y: 350, visible: true }); // Campo referencia
    await sleep(1000);
    await triggerClick();
    setReferenciaDeposito('001212');
    await sleep(800);

    // 10. Clic OK
    await decir("13.- Pulse ok.");
    setCursorPos({ x: 160, y: 400, visible: true }); // Botón OK
    await sleep(1000);
    await triggerClick();
    setMontoDeposito('0');
    await sleep(800);
    setReferenciaDeposito('');
    await sleep(800);

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
              <div onClick={() => setPantalla('config')} title="Ingresar al módulo de AFV Febeca" className="flex flex-col items-center cursor-pointer">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md mb-1">
                  <img src="logo sds febeca.jpg" alt="Febeca" className="w-full h-full object-contain rounded-lg" />
                </div>
                <span className="text-[9px] text-white font-medium text-center leading-tight drop-shadow-md">AFV<br />Febeca</span>
              </div>

              {/* ICONO SILLACA */}
              <div title="Módulo AFV Sillaca (No disponible)" className="flex flex-col items-center opacity-70 cursor-help">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md mb-1">
                  <img src="logo sds sillaca.jpg" alt="Sillaca" className="w-full h-full object-contain rounded-lg" />
                </div>
                <span className="text-[9px] text-white font-medium text-center leading-tight drop-shadow-md">AFV<br />Sillaca</span>
              </div>

              {/* ICONO BEVAL */}
              <div title="Módulo AFV Beval (No disponible)" className="flex flex-col items-center opacity-70 cursor-help">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md mb-1">
                  <img src="logo sds beval.jpg" alt="Beval" className="w-full h-full object-contain rounded-lg" />
                </div>
                <span className="text-[9px] text-white font-medium text-center leading-tight drop-shadow-md">AFV<br />Beval</span>
              </div>

              {/* ICONO CATALOGO FEBECA */}
              <div title="Abrir Catálogo Digital" className="flex flex-col items-center opacity-70 cursor-pointer">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md mb-1">
                  <img src="logocatalogofebeca.png" alt="Catálogo Febeca" className="w-full h-full object-contain rounded-lg" />
                </div>
                <span className="text-[9px] text-white font-medium text-center leading-tight drop-shadow-md">Catálogo<br />Febeca</span>
              </div>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={runDemoCobranza}
                  title="Ejecutar simulación de Cobranza (Ghost Mouse)"
                  className="bg-red-600 text-white font-bold text-[10px] px-2 py-1 rounded shadow-sm hover:bg-red-500 active:bg-red-700 transition-colors"
                >
                  Run
                </button>
                <span onClick={() => setMostrarSubmenu(!mostrarSubmenu)} className="text-xl leading-none cursor-pointer">⋮</span>
              </div>
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
                { label: 'CLIENTES', action: () => { } },
                { label: 'CONSULTAS', action: () => { } },
                { label: 'GESTIÓN DE VENTAS', action: () => setPantalla('clientes'), demoFn: runDemoGestionVentas },
                { label: 'TRANSMITIR TRANSACCIONES', action: () => { }, disabled: true }
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
                      onClick={opcion.demoFn}
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
                  <button onClick={() => setPantalla('escritorio')} title="Otorgar el descuento promocional indicado" className="bg-[#808080] text-black px-4 py-1.5 text-[13px] font-sans border border-gray-600 shadow-sm active:bg-gray-400">
                    Otorgar
                  </button>
                </div>
              </div>

              {/* Modal Oscurecedor */}
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
                    <button onClick={() => setMostrarModalCierra1(true)} title="Cancelar el descuento y cerrar esta promoción" className="flex-1 py-3 text-[14px] text-gray-800 font-sans border-r border-gray-300 active:bg-gray-200">
                      No
                    </button>
                    <button onClick={() => setPantalla('finalizar_pedido')} title="Aceptar el descuento y avanzar al cierre del pedido" className="flex-1 py-3 text-[14px] text-gray-800 font-sans active:bg-gray-200">
                      Si
                    </button>
                  </div>
                </div>
              </div>
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
                <span className="w-[85px] text-[11px] text-gray-700 font-sans shrink-0">Condición:</span>
                <div className="flex-1 flex justify-between items-center text-gray-500 font-sans text-[12px] mr-9">
                  <span className="truncate">0% DE DESCUENTO A 30..</span>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-gray-400 border-r-[6px] border-r-transparent mr-1"></div>
                </div>
              </div>

              <div className="flex items-center mb-2">
                <span className="w-[85px] text-[11px] text-gray-700 font-sans">Flete ($):</span>
                <div className="bg-[#999999] text-black text-right pr-2 py-0.5 font-sans text-[13px] w-[100px]">0,00</div>
                <div className="bg-[#b3b3b3] ml-1 text-black text-right pr-1 py-0.5 font-sans text-[13px] flex-1 border-b border-gray-400 flex items-end justify-end relative">
                  0
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-gray-600 border-r-[6px] border-r-transparent ml-1 mb-0.5"></div>
                  <span className="text-[11px] ml-1">(%)</span>
                </div>
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

              <div className="border border-gray-50 bg-white mb-4">
                <div className="flex bg-[#999999] text-white font-bold text-[13px] font-sans">
                  <div className="flex-[2] text-center py-1">Monto Pedido en $</div>
                  <div className="flex-1 border-l border-gray-400"></div>
                </div>
                <div className="h-12 bg-white"></div>
              </div>

              <div className="flex items-center justify-between mb-2 mt-4 pt-4 border-t border-gray-400">
                <span className="text-[12px] font-bold text-black font-sans">Observaciones:</span>
                <button onClick={() => setMostrarModalNegociacion(true)} title="Haga clic para agregar una observación o negociación especial al documento" className="w-8 h-8 bg-[#cccccc] flex items-center justify-center text-black text-lg border border-[#a6a6a6] shadow-sm pb-1 active:bg-[#bbbbbb]">+</button>
              </div>
              <p className="text-[12px] text-black font-sans">Descuento autorizado la gerencia 2%</p>
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
                <select value={grupoSeleccionado} onChange={(e) => setGrupoSeleccionado(e.target.value)} className={`flex-1 bg-transparent border-b border-gray-400 font-sans text-[11px] px-1 outline-none appearance-none cursor-pointer ${grupoSeleccionado === 'Grupo Todas' ? 'text-black font-bold' : 'text-gray-700'}`}>
                  <option>--Seleccione--</option>
                  <option>Grupo Todas</option>
                </select>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-gray-600 border-r-[4px] border-r-transparent ml-[-12px] pointer-events-none"></div>

                {/* Dropdown visual simulado para Ghost Mouse */}
                {mostrarComboGrupo && (
                  <div className="absolute left-[85px] top-5 bg-white border border-gray-400 shadow-lg z-50 w-[calc(100%-97px)] rounded-sm overflow-hidden">
                    <div className="px-2 py-2 text-[11px] text-gray-500 font-sans border-b border-gray-200 bg-gray-50">--Seleccione--</div>
                    <div className="px-2 py-2 text-[11px] text-black font-bold font-sans bg-[#00b0f0] cursor-pointer">Grupo Todas</div>
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

        {/* PANTALLA 14: 080 - Productos (basada en buscar3.jpg) */}
        {pantalla === 'resultados_busqueda' && (
          <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
            <div className="bg-[#00b0f0] p-2.5 flex items-center justify-between text-black border-b border-[#0092c8]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-bold text-gray-800">f</span>
                </div>
                <span className="text-[13px] font-normal text-black font-sans">080 - Productos</span>
              </div>
              <span className="text-xl leading-none text-gray-700">⋮</span>
            </div>

            <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
              {/* Descripción del producto activo */}
              <div className="bg-white px-2 py-1.5 border-b border-gray-300">
                <p className="text-[10px] text-gray-700 font-sans leading-tight">Canilla flexible malla acero 1/2 x</p>
                <p className="text-[9px] text-gray-500 font-sans leading-tight">automáticos Bticino - 7110502</p>
              </div>

              {/* Barra de búsqueda */}
              <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 border-b border-gray-300">
                <span className="text-[11px] font-bold text-gray-700 font-sans shrink-0">Buscar</span>
                <input type="text" value="2213020" readOnly className="flex-1 bg-[#b3b3b3] text-black font-sans text-[12px] px-2 py-0.5 text-center outline-none border border-gray-400" />
                <button className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] px-1.5 py-0.5 text-[10px] font-sans font-bold shadow-sm shrink-0">B.</button>
                <button className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] px-1.5 py-0.5 text-[10px] font-sans font-bold shadow-sm shrink-0">SUB</button>
                <button className="bg-[#e6e6e6] text-[#333] border border-[#a6a6a6] px-1.5 py-0.5 text-[10px] font-sans font-bold shadow-sm shrink-0">PROM.</button>
              </div>

              {/* Lista de productos con checkboxes */}
              <div className="flex-1 overflow-y-auto">
                {[
                  { cod: '2213021', desc: 'Canilla flexible malla acero 1/2 x 50 x 40 cm' },
                  { cod: '2213005', desc: 'Canilla flexible malla acero 1/2 x 1/2 x 120' },
                  { cod: '2213001', desc: 'Canilla flexible de lujo malla acero 1/2 x 1/2' },
                  { cod: '2213025', desc: 'Canilla flexible malla acero 1/2 x 50 x 40 cm' },
                  { cod: '2213010', desc: 'Canilla flexible extra larga 1/2 x 1/2 x 200 c' },
                  { cod: '2213007', desc: 'Canilla flexible plastificada 1/2 x 40 cm v' },
                  { cod: '2213030', desc: 'Canilla flexible plastificada 1/2 x 1/2 x 120' },
                  { cod: '2213027', desc: 'Canilla flexible para recomeciantes platean' },
                  { cod: '2213043', desc: 'Canilla universal var. tamaños  800-1100' }
                ].map((prod, i) => (
                  <div key={i} className={`flex items-center px-2 py-1.5 border-b border-gray-200 ${i === 0 ? 'bg-[#00b0f0]' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <input type="checkbox" className="mr-2 w-3.5 h-3.5 accent-blue-500 shrink-0" defaultChecked={i === 0} />
                    <span className="text-[10px] font-bold text-black font-sans mr-2 shrink-0">{prod.cod}</span>
                    <span className="text-[9px] text-gray-700 font-sans leading-tight truncate">{prod.desc}</span>
                  </div>
                ))}
              </div>

              {/* Detalle del artículo seleccionado */}
              <div className="bg-gray-200 border-t border-gray-400 px-2 py-1.5 flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-700 font-sans shrink-0">P1:</span>
                  <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[10px] px-1 py-0.5 text-right">15.500,00</div>
                  <span className="text-[10px] font-bold text-gray-700 font-sans shrink-0 ml-1">P2:</span>
                  <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[10px] px-1 py-0.5 text-right">12.800,00</div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-700 font-sans shrink-0">U.Inv:</span>
                  <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[10px] px-1 py-0.5 text-center">UND</div>
                  <span className="text-[10px] font-bold text-gray-700 font-sans shrink-0 ml-1">Emp.C:</span>
                  <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[10px] px-1 py-0.5 text-center">12</div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-700 font-sans shrink-0">C.Min:</span>
                  <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[10px] px-1 py-0.5 text-center">1</div>
                  <span className="text-[10px] font-bold text-gray-700 font-sans shrink-0 ml-1">Dscto.:</span>
                  <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[10px] px-1 py-0.5 text-center">0,00</div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-700 font-sans shrink-0">Exist.:</span>
                  <div className="flex-1 bg-[#b3b3b3] text-black font-sans text-[10px] px-1 py-0.5 text-center">450</div>
                  <span className="text-[10px] font-bold text-gray-700 font-sans shrink-0 ml-1">Cant:</span>
                  <input type="text" value={cantidadProducto} onChange={(e) => setCantidadProducto(e.target.value)} className={`bg-white border border-gray-400 text-black font-sans text-[10px] px-1 py-0.5 w-12 text-center outline-none ${cantidadProducto === '12' ? 'font-bold bg-yellow-100' : ''}`} />
                  <button onClick={() => setPantalla('detalle_pedido_con_producto')} className="bg-[#4CAF50] text-white font-bold font-sans text-[10px] px-3 py-0.5 border border-[#388E3C] shadow-sm active:bg-[#388E3C] ml-1">OK</button>
                </div>
              </div>

              {/* Botón volver */}
              <div className="p-1.5 flex justify-end border-t border-gray-300 bg-gray-100">
                <button onClick={() => setPantalla('productos_busqueda')} title="Volver a búsqueda de productos" className="w-7 h-7 bg-[#b3b3b3] rounded-full flex items-center justify-center text-white font-bold leading-none border-[3px] border-[#999999] shadow-sm">
                  ←
                </button>
              </div>
            </div>
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
                <div className="flex-1"></div>
                <button className="w-6 h-6 bg-[#e6e6e6] border border-gray-400 text-black font-bold text-[14px] leading-none flex items-center justify-center">+</button>
              </div>
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
                <button className="w-full bg-[#e6e6e6] text-black font-bold font-sans text-[11px] py-1.5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.2)] border border-white active:bg-gray-300 transition-colors">
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

            {/* MODAL DEPOSITO (recibodeposito5.jpg) */}
            {mostrarModalDeposito && (
              <div className="absolute inset-x-4 top-40 bg-white border-t-[3px] border-[#00b0f0] shadow-2xl z-50 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[13px] font-bold text-gray-800">PAGO</h3>
                  <button onClick={() => setMostrarModalDeposito(false)} className="w-6 h-6 bg-red-500 hover:bg-red-600 flex items-center justify-center rounded-full text-white font-bold border border-white shadow-sm active:scale-95 transition-transform">X</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">MONTO</label>
                    <input type="text" value={montoDeposito} onChange={(e) => setMontoDeposito(e.target.value)} className="w-full border-b border-gray-400 text-[14px] font-bold py-1 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">REFERENCIA</label>
                    <input type="text" value={referenciaDeposito} onChange={(e) => setReferenciaDeposito(e.target.value)} placeholder="Numero referencia bancaria" className="w-full border-b border-gray-400 text-[14px] py-1 outline-none" />
                  </div>
                  <div className="flex justify-center pt-2">
                    <button onClick={() => { setMontoDeposito('0'); setReferenciaDeposito(''); setMostrarModalDeposito(false); }} className="bg-gray-200 text-black font-bold px-8 py-2 border border-gray-400 text-[12px] active:bg-gray-300 shadow-sm">OK</button>
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
                  <label className="text-[8px] font-bold text-gray-500 w-16 text-right leading-tight">Fecha Dep / Trans:</label>
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
                  <div className="flex-[2] pl-2 py-2 border-r border-blue-400">TRANSFERENCIA USD</div>
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

      </div>
    </div>
  )
}

export default App