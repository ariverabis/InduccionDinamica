import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Asegurar directorios de salida
const outputDirs = [
  path.resolve('Plantillas_Drive_BDF'),
  path.resolve('public/plantillas')
];

outputDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function saveWorkbook(wb, filename) {
  outputDirs.forEach(dir => {
    const dest = path.join(dir, filename);
    XLSX.writeFile(wb, dest);
    console.log(`✓ Archivo guardado en: ${dest}`);
  });
}

// ==============================================================================
// 1. PLANTILLA BDF DEL ASESOR (4 Hojas)
// ==============================================================================
function createBdfWorkbook() {
  const wb = XLSX.utils.book_new();

  // Hoja 1: BDF_Empresa
  const dataEmpresa = [
    {
      Cod_Articulo: "FEB-01024",
      Descripcion_Articulo: "Cerradura de Sobreponer Clásica Cilindro Suelto",
      Marca: "Cisa",
      Categoria_Ramo: "Cerrajería",
      Presentacion_Empaque: "Caja x 12",
      Precio_Base_USD: 18.50,
      Margen_Prioridad: "Alta",
      Disponibilidad_Stock: "Disponible"
    },
    {
      Cod_Articulo: "FEB-02050",
      Descripcion_Articulo: "Alicate Universal 8 pulgadas Alta Resistencia",
      Marca: "Truper",
      Categoria_Ramo: "Herramientas Manuales",
      Presentacion_Empaque: "Blister x 6",
      Precio_Base_USD: 7.20,
      Margen_Prioridad: "Alta",
      Disponibilidad_Stock: "Disponible"
    },
    {
      Cod_Articulo: "FEB-03110",
      Descripcion_Articulo: "Impermeabilizante Acrílico Fibratado 5 Años Blanco",
      Marca: "Sika",
      Categoria_Ramo: "Construcción / Pinturas",
      Presentacion_Empaque: "Cuñete 4 Galones",
      Precio_Base_USD: 42.00,
      Margen_Prioridad: "Estratégico",
      Disponibilidad_Stock: "Stock Crítico"
    },
    {
      Cod_Articulo: "FEB-04015",
      Descripcion_Articulo: "Disco de Corte Extra Fino 4-1/2 pulg Metal/Inox",
      Marca: "Norton",
      Categoria_Ramo: "Abrasivos",
      Presentacion_Empaque: "Paquete x 25",
      Precio_Base_USD: 1.10,
      Margen_Prioridad: "Alta",
      Disponibilidad_Stock: "Disponible"
    },
    {
      Cod_Articulo: "FEB-05080",
      Descripcion_Articulo: "Tirafondo Hexagonal Galvanizado 1/4 x 2 pulg",
      Marca: "Generico",
      Categoria_Ramo: "Tornillería",
      Presentacion_Empaque: "Ciento x 100",
      Precio_Base_USD: 5.40,
      Margen_Prioridad: "Media",
      Disponibilidad_Stock: "Disponible"
    },
    {
      Cod_Articulo: "FEB-06200",
      Descripcion_Articulo: "Bombillo LED 12W Rosca E27 Luz Blanca 6500K",
      Marca: "Megabright",
      Categoria_Ramo: "Iluminación",
      Presentacion_Empaque: "Caja x 50",
      Precio_Base_USD: 0.95,
      Margen_Prioridad: "Alta",
      Disponibilidad_Stock: "Disponible"
    }
  ];
  const wsEmpresa = XLSX.utils.json_to_sheet(dataEmpresa);
  XLSX.utils.book_append_sheet(wb, wsEmpresa, "BDF_Empresa");

  // Hoja 2: BDF_Zona
  const dataZona = [
    {
      Cod_Articulo: "FEB-01024",
      Descripcion_Articulo: "Cerradura de Sobreponer Clásica Cilindro Suelto",
      Marca: "Cisa",
      Clientes_Compradores_Zona: 28,
      Venta_Promedio_Zona_USD: 1450.00,
      Nivel_Demanda_Local: "Top Rotación"
    },
    {
      Cod_Articulo: "FEB-02050",
      Descripcion_Articulo: "Alicate Universal 8 pulgadas Alta Resistencia",
      Marca: "Truper",
      Clientes_Compradores_Zona: 35,
      Venta_Promedio_Zona_USD: 2100.00,
      Nivel_Demanda_Local: "Top Rotación"
    },
    {
      Cod_Articulo: "FEB-03110",
      Descripcion_Articulo: "Impermeabilizante Acrílico Fibratado 5 Años Blanco",
      Marca: "Sika",
      Clientes_Compradores_Zona: 12,
      Venta_Promedio_Zona_USD: 1800.00,
      Nivel_Demanda_Local: "Oportunidad (Temporada)"
    },
    {
      Cod_Articulo: "FEB-04015",
      Descripcion_Articulo: "Disco de Corte Extra Fino 4-1/2 pulg Metal/Inox",
      Marca: "Norton",
      Clientes_Compradores_Zona: 42,
      Venta_Promedio_Zona_USD: 3100.00,
      Nivel_Demanda_Local: "Top Rotación"
    },
    {
      Cod_Articulo: "FEB-06200",
      Descripcion_Articulo: "Bombillo LED 12W Rosca E27 Luz Blanca 6500K",
      Marca: "Megabright",
      Clientes_Compradores_Zona: 19,
      Venta_Promedio_Zona_USD: 850.00,
      Nivel_Demanda_Local: "Crecimiento"
    }
  ];
  const wsZona = XLSX.utils.json_to_sheet(dataZona);
  XLSX.utils.book_append_sheet(wb, wsZona, "BDF_Zona");

  // Hoja 3: BDF_Vendido
  const dataVendido = [
    {
      Cod_Cliente: "J-30458901-2",
      Nombre_Cliente: "Ferretería El Gran Tornillo C.A.",
      Cod_Articulo: "FEB-02050",
      Descripcion_Articulo: "Alicate Universal 8 pulgadas Alta Resistencia",
      Marca: "Truper",
      Ultima_Fecha_Compra: "2026-08-28",
      Cantidad_Ultima_Compra: 12,
      Promedio_Compra_Mensual: 10,
      Estatus_Recompra: "Al día"
    },
    {
      Cod_Cliente: "J-30458901-2",
      Nombre_Cliente: "Ferretería El Gran Tornillo C.A.",
      Cod_Articulo: "FEB-04015",
      Descripcion_Articulo: "Disco de Corte Extra Fino 4-1/2 pulg Metal/Inox",
      Marca: "Norton",
      Ultima_Fecha_Compra: "2026-08-15",
      Cantidad_Ultima_Compra: 50,
      Promedio_Compra_Mensual: 50,
      Estatus_Recompra: "Al día"
    },
    {
      Cod_Cliente: "J-40112399-0",
      Nombre_Cliente: "Materiales y Acabados Los Andes S.R.L.",
      Cod_Articulo: "FEB-01024",
      Descripcion_Articulo: "Cerradura de Sobreponer Clásica Cilindro Suelto",
      Marca: "Cisa",
      Ultima_Fecha_Compra: "2026-07-10",
      Cantidad_Ultima_Compra: 6,
      Promedio_Compra_Mensual: 6,
      Estatus_Recompra: "En riesgo (+45 días)"
    },
    {
      Cod_Cliente: "J-40998812-3",
      Nombre_Cliente: "Inversiones San Antonio 2020 C.A.",
      Cod_Articulo: "FEB-06200",
      Descripcion_Articulo: "Bombillo LED 12W Rosca E27 Luz Blanca 6500K",
      Marca: "Megabright",
      Ultima_Fecha_Compra: "2026-09-02",
      Cantidad_Ultima_Compra: 100,
      Promedio_Compra_Mensual: 80,
      Estatus_Recompra: "Al día"
    }
  ];
  const wsVendido = XLSX.utils.json_to_sheet(dataVendido);
  XLSX.utils.book_append_sheet(wb, wsVendido, "BDF_Vendido");

  // Hoja 4: BDF_No_Vendido (Cruce Estratégico)
  const dataNoVendido = [
    {
      Cod_Cliente: "J-30458901-2",
      Nombre_Cliente: "Ferretería El Gran Tornillo C.A.",
      Cod_Articulo_Sugerido: "FEB-03110",
      Descripcion_Articulo: "Impermeabilizante Acrílico Fibratado 5 Años Blanco",
      Marca: "Sika",
      Razon_Oportunidad: "Cliente compra afines pero nunca ha pedido Sika. Temporada de lluvias activa.",
      Propuesta_Cantidad_Minima: 2,
      Precio_Sugerido_USD: 42.00,
      Resultado_Visita: "Pendiente Visita",
      Motivo_Rechazo: ""
    },
    {
      Cod_Cliente: "J-30458901-2",
      Nombre_Cliente: "Ferretería El Gran Tornillo C.A.",
      Cod_Articulo_Sugerido: "FEB-01024",
      Descripcion_Articulo: "Cerradura de Sobreponer Clásica Cilindro Suelto",
      Marca: "Cisa",
      Razon_Oportunidad: "El 85% de las ferreterías de la zona lo compran con alta rotación.",
      Propuesta_Cantidad_Minima: 6,
      Precio_Sugerido_USD: 18.50,
      Resultado_Visita: "Pendiente Visita",
      Motivo_Rechazo: ""
    },
    {
      Cod_Cliente: "J-40112399-0",
      Nombre_Cliente: "Materiales y Acabados Los Andes S.R.L.",
      Cod_Articulo_Sugerido: "FEB-02050",
      Descripcion_Articulo: "Alicate Universal 8 pulgadas Alta Resistencia",
      Marca: "Truper",
      Razon_Oportunidad: "Compra cerrajería pero tiene desatendida la línea de herramientas Truper.",
      Propuesta_Cantidad_Minima: 6,
      Precio_Sugerido_USD: 7.20,
      Resultado_Visita: "Pendiente Visita",
      Motivo_Rechazo: ""
    },
    {
      Cod_Cliente: "J-40998812-3",
      Nombre_Cliente: "Inversiones San Antonio 2020 C.A.",
      Cod_Articulo_Sugerido: "FEB-04015",
      Descripcion_Articulo: "Disco de Corte Extra Fino 4-1/2 pulg Metal/Inox",
      Marca: "Norton",
      Razon_Oportunidad: "Artículo de consumo rápido y alta recompra mensual.",
      Propuesta_Cantidad_Minima: 25,
      Precio_Sugerido_USD: 1.10,
      Resultado_Visita: "Pendiente Visita",
      Motivo_Rechazo: ""
    }
  ];
  const wsNoVendido = XLSX.utils.json_to_sheet(dataNoVendido);
  XLSX.utils.book_append_sheet(wb, wsNoVendido, "BDF_No_Vendido");

  saveWorkbook(wb, "Plantilla_BDF_Asesor_Modelo.xlsx");
}

// ==============================================================================
// 2. PLANTILLA PLANIFICADOR DE RUTA Y COBRANZA (Rutero Semanal)
// ==============================================================================
function createRuteroWorkbook() {
  const wb = XLSX.utils.book_new();

  // Hoja: Resumen_Semanal
  const dataResumen = [
    {
      Dia: "Lunes",
      Zona_Ruta: "Centro / Casco Histórico",
      Clientes_Programados: 8,
      Meta_Venta_USD: 2500.00,
      Cobranza_Objetivo_USD: 1800.00,
      Venta_Real_USD: 0.00,
      Cobrado_Real_USD: 0.00,
      Efectividad_Visita_Porc: "0%"
    },
    {
      Dia: "Martes",
      Zona_Ruta: "Zona Industrial Norte",
      Clientes_Programados: 7,
      Meta_Venta_USD: 3200.00,
      Cobranza_Objetivo_USD: 2400.00,
      Venta_Real_USD: 0.00,
      Cobrado_Real_USD: 0.00,
      Efectividad_Visita_Porc: "0%"
    },
    {
      Dia: "Miércoles",
      Zona_Ruta: "Avenida Bolívar y Alrededores",
      Clientes_Programados: 9,
      Meta_Venta_USD: 2800.00,
      Cobranza_Objetivo_USD: 1500.00,
      Venta_Real_USD: 0.00,
      Cobrado_Real_USD: 0.00,
      Efectividad_Visita_Porc: "0%"
    },
    {
      Dia: "Jueves",
      Zona_Ruta: "Corredor Comercial Sur",
      Clientes_Programados: 8,
      Meta_Venta_USD: 2600.00,
      Cobranza_Objetivo_USD: 2000.00,
      Venta_Real_USD: 0.00,
      Cobrado_Real_USD: 0.00,
      Efectividad_Visita_Porc: "0%"
    },
    {
      Dia: "Viernes",
      Zona_Ruta: "Periferia / Clientes Mayoristas",
      Clientes_Programados: 6,
      Meta_Venta_USD: 3500.00,
      Cobranza_Objetivo_USD: 3000.00,
      Venta_Real_USD: 0.00,
      Cobrado_Real_USD: 0.00,
      Efectividad_Visita_Porc: "0%"
    }
  ];
  const wsResumen = XLSX.utils.json_to_sheet(dataResumen);
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen_Semanal");

  // Crear hojas individuales de Lunes a Viernes
  const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
  dias.forEach((dia, idx) => {
    const dataDia = [
      {
        Orden_Visita: 1,
        Cod_Cliente: "J-30458901-2",
        Nombre_Comercial: "Ferretería El Gran Tornillo C.A.",
        Direccion_Ubicacion: "Av. Principal #45, Galpón 2",
        Contacto_Comprador: "Carlos Mendoza",
        Telefono: "0414-1234567",
        Meta_Venta_Dia_USD: 500.00,
        Facturas_Por_Cobrar_USD: 350.00,
        Dias_Calle_Credito: 18,
        Venta_Real_Lograda_USD: 0.00,
        Monto_Cobrado_Real_USD: 0.00,
        Estatus_Visita: "Planificada",
        Observaciones_Compromiso: "Ofrecer promoción de Sika y cobrar factura vencida #1042"
      },
      {
        Orden_Visita: 2,
        Cod_Cliente: "J-40112399-0",
        Nombre_Comercial: "Materiales y Acabados Los Andes S.R.L.",
        Direccion_Ubicacion: "Calle 4 con Carrera 12, Local 5",
        Contacto_Comprador: "Luisa Rodríguez",
        Telefono: "0412-9876543",
        Meta_Venta_Dia_USD: 400.00,
        Facturas_Por_Cobrar_USD: 0.00,
        Dias_Calle_Credito: 0,
        Venta_Real_Lograda_USD: 0.00,
        Monto_Cobrado_Real_USD: 0.00,
        Estatus_Visita: "Planificada",
        Observaciones_Compromiso: "Apertura de línea Truper manual"
      },
      {
        Orden_Visita: 3,
        Cod_Cliente: "J-40998812-3",
        Nombre_Comercial: "Inversiones San Antonio 2020 C.A.",
        Direccion_Ubicacion: "Sector El Carmen, Av. 3",
        Contacto_Comprador: "Antonio Silva",
        Telefono: "0424-5551234",
        Meta_Venta_Dia_USD: 600.00,
        Facturas_Por_Cobrar_USD: 450.00,
        Dias_Calle_Credito: 25,
        Venta_Real_Lograda_USD: 0.00,
        Monto_Cobrado_Real_USD: 0.00,
        Estatus_Visita: "Planificada",
        Observaciones_Compromiso: "Cobro indispensable antes de liberar nuevo despacho"
      }
    ];
    const wsDia = XLSX.utils.json_to_sheet(dataDia);
    XLSX.utils.book_append_sheet(wb, wsDia, dia);
  });

  saveWorkbook(wb, "Plantilla_Rutero_Planificacion_Cobranza.xlsx");
}

// ==============================================================================
// 3. PLANTILLA ESTRATEGIA DE MARCAS Y TEMPORADA (Plan Focalizado)
// ==============================================================================
function createEstrategiaWorkbook() {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Definicion_Campana
  const dataCampana = [
    {
      Campo: "Nombre de la Campaña",
      Detalle: "Plan Focalizado Temporada de Lluvias e Impermeabilización 2026"
    },
    {
      Campo: "Objetivo Comercial",
      Detalle: "Aumentar un 35% la profundidad de ventas en impermeabilizantes, bombas y drenajes."
    },
    {
      Campo: "Vigencia",
      Detalle: "Del 01/10/2026 al 30/11/2026 (60 Días)"
    },
    {
      Campo: "Marcas Participantes",
      Detalle: "Sika, Truper, Cisa, Norton"
    },
    {
      Campo: "Ramos Foco",
      Detalle: "Construcción, Plomería, Impermeabilización"
    },
    {
      Campo: "Condición Comercial Especial",
      Detalle: "5% de descuento por compra de 3 cuñetes o más + 15 días adicionales de crédito."
    },
    {
      Campo: "Meta Global de la Zona (USD)",
      Detalle: "15,000.00 USD"
    }
  ];
  const wsCampana = XLSX.utils.json_to_sheet(dataCampana);
  XLSX.utils.book_append_sheet(wb, wsCampana, "Definicion_Campana");

  // Hoja 2: Target_Clientes_Objetivo
  const dataClientes = [
    {
      Cod_Cliente: "J-30458901-2",
      Nombre_Cliente: "Ferretería El Gran Tornillo C.A.",
      Clasificacion_Cliente: "A",
      Meta_Bultos_Unidades: 20,
      Facturado_Real_Unidades: 0,
      Monto_Facturado_USD: 0.00,
      Cumplimiento_Porcentaje: "0%",
      Estatus_Cierre: "En Negociación"
    },
    {
      Cod_Cliente: "J-40112399-0",
      Nombre_Cliente: "Materiales y Acabados Los Andes S.R.L.",
      Clasificacion_Cliente: "B",
      Meta_Bultos_Unidades: 12,
      Facturado_Real_Unidades: 0,
      Monto_Facturado_USD: 0.00,
      Cumplimiento_Porcentaje: "0%",
      Estatus_Cierre: "Pendiente Presentación"
    },
    {
      Cod_Cliente: "J-40998812-3",
      Nombre_Cliente: "Inversiones San Antonio 2020 C.A.",
      Clasificacion_Cliente: "A",
      Meta_Bultos_Unidades: 25,
      Facturado_Real_Unidades: 0,
      Monto_Facturado_USD: 0.00,
      Cumplimiento_Porcentaje: "0%",
      Estatus_Cierre: "En Negociación"
    },
    {
      Cod_Cliente: "J-50123456-1",
      Nombre_Cliente: "Distribuidora Ferretera del Centro C.A.",
      Clasificacion_Cliente: "A",
      Meta_Bultos_Unidades: 30,
      Facturado_Real_Unidades: 0,
      Monto_Facturado_USD: 0.00,
      Cumplimiento_Porcentaje: "0%",
      Estatus_Cierre: "Pendiente Presentación"
    }
  ];
  const wsClientes = XLSX.utils.json_to_sheet(dataClientes);
  XLSX.utils.book_append_sheet(wb, wsClientes, "Target_Clientes_Objetivo");

  // Hoja 3: Material_POP_Exhibicion
  const dataPop = [
    {
      Cod_Cliente: "J-30458901-2",
      Nombre_Cliente: "Ferretería El Gran Tornillo C.A.",
      Tipo_Material: "Exhibidor Metálico de Piso",
      Marca: "Truper",
      Fecha_Instalacion: "2026-10-05",
      Estado_Material: "Programado",
      Observaciones: "Ubicación en pasillo central de herramientas"
    },
    {
      Cod_Cliente: "J-40998812-3",
      Nombre_Cliente: "Inversiones San Antonio 2020 C.A.",
      Tipo_Material: "Afiche Publicitario + Mostrador",
      Marca: "Sika",
      Fecha_Instalacion: "2026-10-08",
      Estado_Material: "Programado",
      Observaciones: "Colocación en caja principal para campaña de lluvias"
    }
  ];
  const wsPop = XLSX.utils.json_to_sheet(dataPop);
  XLSX.utils.book_append_sheet(wb, wsPop, "Material_POP_Exhibicion");

  saveWorkbook(wb, "Plantilla_Estrategia_Marcas_Temporada.xlsx");
}

console.log("Generando ecosistema de plantillas Excel para Google Drive...");
createBdfWorkbook();
createRuteroWorkbook();
createEstrategiaWorkbook();
console.log("¡Todas las plantillas fueron generadas con éxito!");
