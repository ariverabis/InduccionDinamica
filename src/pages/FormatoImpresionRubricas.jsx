import React from 'react';
import { rubricaData } from '../data/rubricaData';

const DIMENSIONS = [
  { key: 'Desarrollo', label: '1. Desarrollo y Formación' },
  { key: 'Supervisor', label: '2. Supervisor de Ventas' },
  { key: 'Auditoria', label: '3. Auditoría de Procesos' },
  { key: 'Credito_Cobranza', label: '4. Crédito y Cobranza' },
  { key: 'Admin_Ventas', label: '5. Administración de Ventas' },
  { key: 'Autoevaluacion', label: '6. Autoevaluación Asesor' }
];

export default function FormatoImpresionRubricas() {
  return (
    <div className="bg-white min-h-screen text-black p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Botones de acción (ocultos al imprimir) */}
      <div className="print:hidden mb-8 flex justify-between items-center bg-gray-100 p-4 rounded shadow">
        <div>
          <h2 className="text-lg font-bold">Formato de Evaluación en Blanco</h2>
          <p className="text-sm text-gray-600">Este formato está optimizado para imprimir. Generará varias páginas con todas las rúbricas.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700 transition"
          >
            🖨️ Imprimir
          </button>
          <button 
            onClick={() => window.history.back()} 
            className="bg-white border border-gray-300 px-6 py-2 rounded font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            Volver
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Encabezado General */}
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-black uppercase tracking-wider mb-2">Formato de Evaluación de Inducción Dinámica</h1>
          <p className="text-sm">Escala: 1 (No Cumple) - 3 (Competente) - 5 (Referente) - N/A (No Aplica)</p>
        </div>

        <div className="flex gap-8 mb-8 border border-black p-4">
          <div className="flex-1">
            <p className="font-bold text-sm uppercase">Nombre del Asesor:</p>
            <div className="border-b border-black h-6"></div>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm uppercase">Mes de Evaluación (1 al 6):</p>
            <div className="border-b border-black h-6"></div>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm uppercase">Fecha de Evaluación:</p>
            <div className="border-b border-black h-6"></div>
          </div>
        </div>

        {DIMENSIONS.map(dim => {
          const criterios = rubricaData[dim.key] || [];
          if (criterios.length === 0) return null;

          return (
            <div key={dim.key} className="mb-12" style={{ pageBreakInside: 'avoid' }}>
              <div className="bg-gray-200 border border-black p-2 mb-4">
                <h2 className="text-lg font-bold uppercase">{dim.label}</h2>
              </div>
              
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-left w-1/4">Criterio</th>
                    <th className="border border-black p-2 text-left w-2/4">Descripción de Niveles</th>
                    <th className="border border-black p-2 text-center w-8">1</th>
                    <th className="border border-black p-2 text-center w-8">2</th>
                    <th className="border border-black p-2 text-center w-8">3</th>
                    <th className="border border-black p-2 text-center w-8">4</th>
                    <th className="border border-black p-2 text-center w-8">5</th>
                    <th className="border border-black p-2 text-center w-8 text-[9px]">N/A</th>
                  </tr>
                </thead>
                <tbody>
                  {criterios.map(crit => {
                    // Separar el concepto inicial de los niveles (que empiezan con 1, 2, 3...)
                    const partes = crit.descripcion.split('\n\n');
                    const conceptoGeneral = partes[0];
                    const niveles = partes.length > 1 ? partes.slice(1).join('\n\n') : '';

                    return (
                      <tr key={crit.id}>
                        <td className="border border-black p-2 font-bold align-top">
                          {crit.label}
                        </td>
                        <td className="border border-black p-2 align-top">
                          <p className="mb-2 italic text-gray-700">{conceptoGeneral}</p>
                          {niveles && (
                            <div className="text-[9px] leading-tight space-y-1">
                              {niveles.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="border border-black align-middle text-center">
                          <div className="w-4 h-4 border border-black mx-auto"></div>
                        </td>
                        <td className="border border-black align-middle text-center">
                          <div className="w-4 h-4 border border-black mx-auto"></div>
                        </td>
                        <td className="border border-black align-middle text-center">
                          <div className="w-4 h-4 border border-black mx-auto"></div>
                        </td>
                        <td className="border border-black align-middle text-center">
                          <div className="w-4 h-4 border border-black mx-auto"></div>
                        </td>
                        <td className="border border-black align-middle text-center">
                          <div className="w-4 h-4 border border-black mx-auto"></div>
                        </td>
                        <td className="border border-black align-middle text-center bg-gray-50">
                          <div className="w-4 h-4 border border-black mx-auto"></div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="border border-t-0 border-black p-2">
                <p className="font-bold text-xs uppercase mb-8">Comentarios / Observaciones:</p>
                <div className="border-b border-black mb-6 border-dashed"></div>
                <div className="border-b border-black mb-2 border-dashed"></div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <div className="w-64 border-t border-black text-center pt-1 text-xs font-bold uppercase mt-12">
                  Firma Evaluador
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
