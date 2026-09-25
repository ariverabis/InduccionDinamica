import React from 'react';

const PLANTILLAS = [
  {
    id: 'bdf',
    title: 'Plantilla Matriz BDF del Asesor',
    filename: 'Plantilla_BDF_Asesor_Modelo.xlsx',
    badge: '4 Hojas de Trabajo',
    description: 'Cruza el catálogo foco de la empresa con la zona y los clientes para detectar artículos no vendidos y generar venta cruzada inmediata.',
    sheets: ['BDF_Empresa (Catálogo Foco)', 'BDF_Zona (Demanda del Territorio)', 'BDF_Vendido (Recompra Base)', 'BDF_No_Vendido (Mina de Oro / Cruce)']
  },
  {
    id: 'rutero',
    title: 'Planificador de Ruta y Cobranza',
    filename: 'Plantilla_Rutero_Planificacion_Cobranza.xlsx',
    badge: 'Lunes a Viernes',
    description: 'Estructura la semana de trabajo con clientes geolocalizados, metas diarias en USD, facturas por cobrar y efectividad de visita.',
    sheets: ['Resumen_Semanal', 'Lunes a Viernes (Rutero Diario Detallado)']
  },
  {
    id: 'estrategia',
    title: 'Estrategia de Marcas y Temporada',
    filename: 'Plantilla_Estrategia_Marcas_Temporada.xlsx',
    badge: 'Plan Focalizado',
    description: 'Campañas estacionales para empujar marcas o líneas clave (ej. Lluvias, Fin de Año) con metas por cliente y control de material POP.',
    sheets: ['Definicion_Campana', 'Target_Clientes_Objetivo', 'Material_POP_Exhibicion']
  }
];

export default function ModalPlantillasDrive({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📁</span>
            <div>
              <h2 className="text-lg font-bold">Ecosistema de Plantillas BDF y Gestión Comercial</h2>
              <p className="text-xs text-slate-400">Descarga los modelos oficiales en Excel listos para Google Drive y tus Asesores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-lg transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Tarjetas de Descarga */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANTILLAS.map(p => (
              <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {p.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">.xlsx</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{p.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{p.description}</p>
                  
                  <div className="border-t border-slate-200 pt-3 mb-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hojas Incluidas:</span>
                    <ul className="space-y-1">
                      {p.sheets.map((s, idx) => (
                        <li key={idx} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <a
                  href={`/plantillas/${p.filename}`}
                  download={p.filename}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-lg text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
                >
                  📥 Descargar Archivo Excel
                </a>
              </div>
            ))}
          </div>

          {/* Guía de Organización en Google Drive */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-950 mb-2 flex items-center gap-2">
              <span>💡</span> Estructura Recomendada de Carpetas en Google Drive
            </h4>
            <pre className="text-[11px] text-blue-900 font-mono bg-white p-3 rounded-lg border border-blue-100 overflow-x-auto leading-relaxed">
{`📁 GESTIÓN COMERCIAL Y BDF
│
├── 📁 00_PLANTILLAS_MAESTRAS (Solo Supervisores y Desarrollo)
│   ├── Plantilla_BDF_Asesor_Modelo.xlsx
│   ├── Plantilla_Rutero_Planificacion_Cobranza.xlsx
│   └── Plantilla_Estrategia_Marcas_Temporada.xlsx
│
└── 📁 ASESORES_POR_CASA_COMERCIAL
    ├── 📁 FEBECA / Zona_163_Oliver_Utrera (Compartida con el Asesor)
    │   ├── BDF_Zona163_Oliver_Utrera.xlsx
    │   ├── Rutero_Cobranza_Zona163.xlsx
    │   └── Plan_Campana_Actual.xlsx
    └── 📁 SILLACA / BEVAL / COFERSA...`}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
          >
            Entendido / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
