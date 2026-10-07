import React from 'react';

const CartaEvaluacionPDF = ({ asesor, departamento, actividades, onBack }) => {
  // Desglosar las actividades
  const desglose = actividades.flatMap(sm => {
    return (sm.contenido || []).map(act => ({
      modulo: sm.nombre_tarea,
      aspecto: act.actividad,
      peso: act.peso
    }));
  });

  return (
    <div className="bg-white min-h-screen text-slate-900 p-8 font-sans">
      <div className="print:hidden mb-4 flex justify-between items-center bg-slate-100 p-4 rounded-xl">
        <p className="text-sm font-bold text-slate-600">Vista de impresión de la Hoja de Evaluación (Inducción en Sede)</p>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all">🖨️ Imprimir Hoja</button>
          <button onClick={onBack} className="bg-white border border-slate-300 px-6 py-2 rounded-lg font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto border border-slate-300 p-10 print:border-none print:p-0">
        {/* Encabezado */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Hoja de Evaluación de Inducción</h1>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Academia de Formación AFV</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold">Fecha de Impresión</p>
            <p className="text-sm font-black">{new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        {/* Datos del Asesor y Departamento */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Datos del Asesor</p>
            <p className="text-lg font-black">{asesor?.nombre || 'N/A'}</p>
            <p className="text-xs font-bold text-slate-700">{asesor?.empresa || 'N/A'}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Departamento a Evaluar</p>
            <p className="text-lg font-black text-indigo-700">{departamento?.nombre || 'N/A'}</p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mb-6 text-xs text-slate-600 leading-relaxed border-l-4 border-indigo-500 pl-4">
          <strong>Instrucciones para el Evaluador:</strong> Califique cada uno de los aspectos detallados a continuación en una escala del 0 al 100. Registre observaciones relevantes si considera necesario justificar la nota o destacar áreas de mejora.
        </div>

        {/* Tabla de Indicadores */}
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="bg-slate-100 text-[10px] uppercase tracking-widest font-black text-slate-600 border border-slate-300">
              <th className="p-3 border border-slate-300">Módulo / Tema</th>
              <th className="p-3 border border-slate-300">Aspecto a Evaluar</th>
              <th className="p-3 border border-slate-300 text-center w-16">Peso</th>
              <th className="p-3 border border-slate-300 text-center w-32">Nota (0-100)</th>
              <th className="p-3 border border-slate-300">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {desglose.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-xs text-slate-500 italic border border-slate-300">No hay indicadores configurados para este departamento.</td>
              </tr>
            ) : (
              desglose.map((item, idx) => (
                <tr key={idx} className="border border-slate-300 text-xs">
                  <td className="p-3 border border-slate-300 font-bold text-slate-800">{item.modulo}</td>
                  <td className="p-3 border border-slate-300">{item.aspecto}</td>
                  <td className="p-3 border border-slate-300 text-center font-bold">{item.peso}%</td>
                  <td className="p-3 border border-slate-300 text-center"></td>
                  <td className="p-3 border border-slate-300"></td>
                </tr>
              ))
            )}
            <tr className="bg-slate-50 font-black text-xs border border-slate-300">
              <td colSpan="2" className="p-3 text-right uppercase">Total Ponderado</td>
              <td className="p-3 text-center border border-slate-300">100%</td>
              <td colSpan="2" className="p-3 border border-slate-300 bg-slate-200"></td>
            </tr>
          </tbody>
        </table>

        {/* Observaciones Generales */}
        <div className="mb-12 break-inside-avoid">
          <h3 className="text-xs font-black uppercase text-slate-800 mb-2">Observaciones Generales / Feedback Cualitativo</h3>
          <div className="border-2 border-slate-300 h-32 rounded-lg"></div>
        </div>

        {/* Firmas */}
        <div className="grid grid-cols-2 gap-16 mt-16 pt-8 break-inside-avoid">
          <div className="text-center">
            <div className="border-b-2 border-slate-400 w-full mb-2"></div>
            <p className="text-xs font-black uppercase text-slate-700">Firma Evaluador del Dpto.</p>
            <p className="text-[10px] text-slate-500 mt-1">Nombre y Sello</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-slate-400 w-full mb-2"></div>
            <p className="text-xs font-black uppercase text-slate-700">Firma Asesor de Ventas</p>
            <p className="text-[10px] text-slate-500 mt-1">Conformidad</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartaEvaluacionPDF;
