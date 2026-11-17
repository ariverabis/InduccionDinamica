// Mock Data realista para Simulador AFV 2.0 (Cobranzas)
// Basado fielmente en las capturas del sistema móvil

export const TASA_BCV = 904.37; // Tasa para que coincidan los cálculos de pantalla (ej: $29.41 * 904.37 = 26.597,57 Bs.)

export const CLIENTES_MOCK = [
  {
    id: 'cli-1',
    codigo: '2525003',
    zona: 'Z075',
    nombre: 'FERRETERIA CONSTRUCASA 2011, C.A',
    rif: 'J-31458920-1',
    estadoRiesgo: 'ALERTA', // 'CRITICOS', 'ALERTA', 'SANOS'
    esAgenteRetencion: false,
    saldoTotal: 5143.73,
    saldoVencido: 2706.59,
    saldoNoVencido: 2437.14,
    facturasPendientes: 3
  },
  {
    id: 'cli-2',
    codigo: '2550979',
    zona: 'Z075',
    nombre: 'FERRE CONSTRUCCIÓN EL PATRÓN, C.A',
    rif: 'J-40982314-5',
    estadoRiesgo: 'ALERTA',
    esAgenteRetencion: true,
    saldoTotal: 1858.74,
    saldoVencido: 387.76,
    saldoNoVencido: 1470.98,
    facturasPendientes: 2
  },
  {
    id: 'cli-3',
    codigo: '2501010',
    zona: 'Z075',
    nombre: 'HVENTAS, C.A',
    rif: 'J-29841562-3',
    estadoRiesgo: 'ALERTA',
    esAgenteRetencion: true,
    saldoTotal: 27520.11,
    saldoVencido: 0.00,
    saldoNoVencido: 27520.11,
    facturasPendientes: 2
  },
  {
    id: 'cli-4',
    codigo: '2550287',
    zona: 'Z075',
    nombre: 'FERREVIVO 88, C.A',
    rif: 'J-30512894-0',
    estadoRiesgo: 'CRITICOS',
    esAgenteRetencion: true,
    saldoTotal: 3422.14,
    saldoVencido: 3200.00,
    saldoNoVencido: 222.14,
    facturasPendientes: 4
  },
  {
    id: 'cli-5',
    codigo: '2580083',
    zona: 'Z075',
    nombre: 'COMERCIAL LANCHAN, C.A',
    rif: 'J-41120984-7',
    estadoRiesgo: 'SANOS',
    esAgenteRetencion: true,
    saldoTotal: 210.15,
    saldoVencido: 0.00,
    saldoNoVencido: 210.15,
    facturasPendientes: 1
  },
  {
    id: 'cli-6',
    codigo: '2550295',
    zona: 'Z075',
    nombre: 'MATERIALES ELECTRICOS NAGUANAGUA, C.A',
    rif: 'J-30987412-2',
    estadoRiesgo: 'ALERTA',
    esAgenteRetencion: false,
    saldoTotal: 1250.00,
    saldoVencido: 620.00,
    saldoNoVencido: 630.00,
    facturasPendientes: 2
  }
];

export const FACTURAS_MOCK = [
  // Facturas de FERRE CONSTRUCCIÓN EL PATRÓN (cli-2)
  {
    id: 'fac-1',
    numero: '07091259',
    clienteId: 'cli-2',
    clienteNombre: 'FERRE CONSTRUCCIÓN EL PATRÓN, C.A',
    clienteCodigo: '2550979',
    clienteZona: 'Z075',
    fechaEmision: '12/10/2026',
    fechaVencimiento: '11/11/2026',
    fechaVencPlazo: '11/11/2026',
    importeUSD: 465.94,
    saldoUSD: 387.76,
    estado: 'Vencida', // 'Vencida', 'Pendiente', 'Cancelada'
    esAgenteRetencion: true,
    baseImponibleUSD: 401.67,
    ivaUSD: 64.27,
    montoRetencionUSD: 48.20, // 75% del IVA
    articulos: [
      { codigo: 'SKU-7721', descripcion: 'Disco Corte Metal 4 1/2" DeWalt', cantidad: 50, precioUnitario: 3.20, subtotal: 160.00 },
      { codigo: 'SKU-1094', descripcion: 'Electrodo 6013 3/32" Lincoln (Caja 20kg)', cantidad: 2, precioUnitario: 85.50, subtotal: 171.00 },
      { codigo: 'SKU-3320', descripcion: 'Cerradura Sobreponer Cilindro Cisa', cantidad: 4, precioUnitario: 17.67, subtotal: 70.67 }
    ],
    asientosContables: [
      { cuenta: '1.1.02.01.001 - Cuentas por Cobrar Comerciales Clientes', debe: 465.94, haber: 0.00 },
      { cuenta: '2.1.03.01.002 - IVA Débito Fiscal por Pagar (16%)', debe: 0.00, haber: 64.27 },
      { cuenta: '4.1.01.01.001 - Ingresos por Ventas de Mercancía Ferretera', debe: 0.00, haber: 401.67 }
    ]
  },
  {
    id: 'fac-2',
    numero: '07105642',
    clienteId: 'cli-2',
    clienteNombre: 'FERRE CONSTRUCCIÓN EL PATRÓN, C.A',
    clienteCodigo: '2550979',
    clienteZona: 'Z075',
    fechaEmision: '05/11/2026',
    fechaVencimiento: '05/12/2026',
    fechaVencPlazo: '05/12/2026',
    importeUSD: 1470.98,
    saldoUSD: 1470.98,
    estado: 'Pendiente',
    esAgenteRetencion: true,
    baseImponibleUSD: 1268.09,
    ivaUSD: 202.89,
    montoRetencionUSD: 152.17,
    articulos: [
      { codigo: 'SKU-8840', descripcion: 'Taladro Percutor 1/2" 650W Bosch', cantidad: 6, precioUnitario: 95.00, subtotal: 570.00 },
      { codigo: 'SKU-5512', descripcion: 'Pintura Caucho Mate Blanco Galón', cantidad: 24, precioUnitario: 18.50, subtotal: 444.00 },
      { codigo: 'SKU-2099', descripcion: 'Manguera Riego Reforzada 1/2" 50m', cantidad: 7, precioUnitario: 36.30, subtotal: 254.09 }
    ],
    asientosContables: [
      { cuenta: '1.1.02.01.001 - Cuentas por Cobrar Comerciales Clientes', debe: 1470.98, haber: 0.00 },
      { cuenta: '2.1.03.01.002 - IVA Débito Fiscal por Pagar (16%)', debe: 0.00, haber: 202.89 },
      { cuenta: '4.1.01.01.001 - Ingresos por Ventas de Mercancía Ferretera', debe: 0.00, haber: 1268.09 }
    ]
  },

  // Facturas de HVENTAS, C.A (cli-3) - Fieles a la captura afv2_cargar_retenciones.jpg
  {
    id: 'fac-3',
    numero: '07108992',
    clienteId: 'cli-3',
    clienteNombre: 'HVENTAS, C.A',
    clienteCodigo: '2501010',
    clienteZona: 'Z075',
    fechaEmision: '12/11/2026',
    fechaVencimiento: '12/12/2026',
    fechaVencPlazo: '12/12/2026',
    importeUSD: 245.08,
    saldoUSD: 245.08,
    estado: 'Pendiente',
    esAgenteRetencion: true,
    baseImponibleUSD: 211.28,
    ivaUSD: 33.80,
    montoRetencionUSD: 29.41,
    montoRetencionBs: 26597.57, // Exacto como en captura 1
    articulos: [
      { codigo: 'SKU-9910', descripcion: 'Tubería PVC Sanitaria 4"x3m Pavco', cantidad: 12, precioUnitario: 14.50, subtotal: 174.00 },
      { codigo: 'SKU-9912', descripcion: 'Codo PVC Sanitario 4"x90 Pavco', cantidad: 20, precioUnitario: 1.86, subtotal: 37.28 }
    ],
    asientosContables: [
      { cuenta: '1.1.02.01.001 - Cuentas por Cobrar Comerciales Clientes', debe: 245.08, haber: 0.00 },
      { cuenta: '2.1.03.01.002 - IVA Débito Fiscal por Pagar (16%)', debe: 0.00, haber: 33.80 },
      { cuenta: '4.1.01.01.001 - Ingresos por Ventas de Materiales PVC', debe: 0.00, haber: 211.28 }
    ]
  },
  {
    id: 'fac-4',
    numero: '07108993',
    clienteId: 'cli-3',
    clienteNombre: 'HVENTAS, C.A',
    clienteCodigo: '2501010',
    clienteZona: 'Z075',
    fechaEmision: '12/11/2026',
    fechaVencimiento: '12/12/2026',
    fechaVencPlazo: '12/12/2026',
    importeUSD: 8.50,
    saldoUSD: 8.50,
    estado: 'Pendiente',
    esAgenteRetencion: true,
    baseImponibleUSD: 7.33,
    ivaUSD: 1.17,
    montoRetencionUSD: 1.02,
    montoRetencionBs: 922.54, // Exacto como en captura 1
    articulos: [
      { codigo: 'SKU-4401', descripcion: 'Teflón Industrial 3/4" x 12m', cantidad: 10, precioUnitario: 0.73, subtotal: 7.33 }
    ],
    asientosContables: [
      { cuenta: '1.1.02.01.001 - Cuentas por Cobrar Comerciales Clientes', debe: 8.50, haber: 0.00 },
      { cuenta: '2.1.03.01.002 - IVA Débito Fiscal por Pagar (16%)', debe: 0.00, haber: 1.17 },
      { cuenta: '4.1.01.01.001 - Ingresos por Ventas de Accesorios', debe: 0.00, haber: 7.33 }
    ]
  },

  // Facturas de FERREVIVO 88 (cli-4) - Fiel a la captura afv2_historial.jpg
  {
    id: 'fac-5',
    numero: '07109036',
    clienteId: 'cli-4',
    clienteNombre: 'FERREVIVO 88, C.A',
    clienteCodigo: '2550287',
    clienteZona: 'Z075',
    fechaEmision: '12/11/2026',
    fechaVencimiento: '12/12/2026',
    fechaVencPlazo: '12/11/2026',
    importeUSD: 222.14,
    saldoUSD: 222.14,
    estado: 'Pendiente',
    esAgenteRetencion: true,
    baseImponibleUSD: 191.50,
    ivaUSD: 30.64,
    montoRetencionUSD: 22.98,
    articulos: [
      { codigo: 'SKU-1280', descripcion: 'Bombillo LED Bulbo 9W E27 Luz Blanca', cantidad: 60, precioUnitario: 1.80, subtotal: 108.00 },
      { codigo: 'SKU-1288', descripcion: 'Reflector LED Exterior 50W IP65', cantidad: 5, precioUnitario: 16.70, subtotal: 83.50 }
    ],
    asientosContables: [
      { cuenta: '1.1.02.01.001 - Cuentas por Cobrar Comerciales Clientes', debe: 222.14, haber: 0.00 },
      { cuenta: '2.1.03.01.002 - IVA Débito Fiscal por Pagar (16%)', debe: 0.00, haber: 30.64 },
      { cuenta: '4.1.01.01.001 - Ingresos por Ventas Iluminación', debe: 0.00, haber: 191.50 }
    ]
  },
  {
    id: 'fac-6',
    numero: '07109014',
    clienteId: 'cli-5',
    clienteNombre: 'COMERCIAL LANCHAN, C.A',
    clienteCodigo: '2580083',
    clienteZona: 'Z075',
    fechaEmision: '12/11/2026',
    fechaVencimiento: '12/12/2026',
    fechaVencPlazo: '12/11/2026',
    importeUSD: 210.15,
    saldoUSD: 210.15,
    estado: 'Pendiente',
    esAgenteRetencion: true,
    baseImponibleUSD: 181.16,
    ivaUSD: 28.99,
    montoRetencionUSD: 21.74,
    articulos: [
      { codigo: 'SKU-7750', descripcion: 'Candado Hierro 50mm Yale', cantidad: 15, precioUnitario: 12.08, subtotal: 181.16 }
    ],
    asientosContables: [
      { cuenta: '1.1.02.01.001 - Cuentas por Cobrar Comerciales Clientes', debe: 210.15, haber: 0.00 },
      { cuenta: '2.1.03.01.002 - IVA Débito Fiscal por Pagar (16%)', debe: 0.00, haber: 28.99 },
      { cuenta: '4.1.01.01.001 - Ingresos por Ventas de Cerrajería', debe: 0.00, haber: 181.16 }
    ]
  }
];

export const RECIBOS_MOCK = [
  {
    id: 'rec-1',
    numeroRecibo: 'REC-2026-0891',
    clienteId: 'cli-2',
    clienteNombre: 'FERRE CONSTRUCCIÓN EL PATRÓN, C.A',
    fecha: '10/11/2026',
    montoUSD: 78.18,
    montoBs: 70703.66,
    tasaCambio: 904.37,
    metodo: 'Transferencia Banesco',
    referencia: 'TRF-90218491',
    facturasCanceladas: ['07091259 (Abono)']
  },
  {
    id: 'rec-2',
    numeroRecibo: 'REC-2026-0885',
    clienteId: 'cli-1',
    clienteNombre: 'FERRETERIA CONSTRUCASA 2011, C.A',
    fecha: '08/11/2026',
    montoUSD: 745.62,
    montoBs: 674316.06,
    tasaCambio: 904.37,
    metodo: 'Efectivo Divisas',
    referencia: 'EFECTIVO-EN-MANO',
    facturasCanceladas: ['07085512 (Cancelación total)']
  }
];

export const RETENCIONES_MOCK = [
  {
    id: 'ret-1',
    numeroComprobante: '2026110000412',
    clienteId: 'cli-2',
    clienteNombre: 'FERRE CONSTRUCCIÓN EL PATRÓN, C.A',
    fecha: '11/11/2026',
    periodoFiscal: '2026-11',
    porcentaje: '75%',
    montoRetenidoUSD: 48.20,
    montoRetenidoBs: 43590.63,
    facturaAfectada: '07091259',
    estatus: 'Precargada y Verificada'
  }
];

export const DEPOSITOS_MOCK = [
  {
    id: 'dep-1',
    numeroRelacion: 'ANX-DEP-0042',
    bancoReceptor: 'Banesco Banco Universal (Cuenta Recaudadora)',
    bancoEmisor: 'Depósito Directo Taquilla',
    numeroPlanilla: 'PLN-998124',
    fechaDeposito: '09/11/2026',
    montoUSD: 1200.00,
    montoBs: 1085244.00,
    recibosAsociados: ['REC-2026-0870', 'REC-2026-0872'],
    estatus: 'Confirmado por Administración'
  }
];

