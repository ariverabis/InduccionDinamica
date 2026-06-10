import React from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';

/**
 * ResumenEvaluaciones - Displays a compact summary of submodule evaluations for the selected advisor.
 * Shows the grade (nota) and an indicator when the evaluator marked "No presentó".
 *
 * Props:
 *  - selectedAsesor: advisor object currently selected in ConsolaEvaluacion
 *  - submodulos: list of all submodules
 *  - notasGuardadas: list of saved notes from database
 */
export const ResumenEvaluaciones = ({ selectedAsesor, submodulos, notasGuardadas }) => {
  if (!selectedAsesor) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm font-medium">Seleccione un asesor para ver el resumen.</p>
      </div>
    );
  }

  // Build a map of submodule id -> saved note for quick lookup
  const notasMap = React.useMemo(() => {
    const map = {};
    notasGuardadas.forEach((n) => {
      if (n.id_submodulo) map[n.id_submodulo] = n;
    });
    return map;
  }, [notasGuardadas]);

  const handleExportExcel = () => {
    const data = submodulos.map(sm => {
      const notaObj = notasMap[sm.id];
      const nota = notaObj?.nota ?? '-';
      const noPresento = notaObj?.no_presento ?? false;
      return {
        'Asesor': selectedAsesor.nombre || selectedAsesor.usuario || 'Asesor',
        'Evaluación': sm.nombre_tarea,
        'Nota': noPresento ? 'No presentó' : nota
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resumen Evaluaciones");
    
    const fileName = `Evaluaciones_${selectedAsesor.nombre || selectedAsesor.usuario || 'Asesor'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black uppercase text-slate-800">Resumen de Evaluaciones</h2>
        <button 
          onClick={handleExportExcel}
          className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span>📊</span> Exportar a Excel
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {submodulos.map((sm) => {
          const notaObj = notasMap[sm.id];
          const nota = notaObj?.nota ?? '-';
          const noPresento = notaObj?.no_presento ?? false;
          return (
            <div key={sm.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-600">{sm.nombre_tarea}</span>
                <span className="text-sm font-black text-slate-800">Nota: {nota}</span>
              </div>
              {noPresento && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded">
                  No presentó
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
