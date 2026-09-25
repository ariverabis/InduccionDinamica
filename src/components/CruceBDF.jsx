import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function CruceBDF() {
  const [bdfNacional, setBdfNacional] = useState([]);
  const [bdfZonal, setBdfZonal] = useState([]);
  const [ventasAsesor, setVentasAsesor] = useState([]);
  const [resultados, setResultados] = useState(null);

  const handleFileUpload = (e, setFileState) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      // Assume first row is header, take the rest.
      // Simplify logic: Assuming the file has a column for 'SKU' or 'Articulo'
      // For this implementation, we will map the first column to 'SKU' and second to 'Descripcion'
      const parsedData = data.slice(1).map(row => ({
        sku: String(row[0]).trim(),
        descripcion: row[1] || 'Sin descripción'
      })).filter(item => item.sku && item.sku !== 'undefined');
      
      setFileState(parsedData);
    };
    reader.readAsBinaryString(file);
  };

  const analizarCruce = () => {
    if (bdfNacional.length === 0 || bdfZonal.length === 0 || ventasAsesor.length === 0) {
      alert("Por favor cargue los 3 archivos antes de analizar.");
      return;
    }

    // Combine BDFs for the advisor's target
    const bdfEsperados = [...bdfNacional, ...bdfZonal];
    // Remove duplicates by sku
    const bdfUnicos = Array.from(new Map(bdfEsperados.map(item => [item.sku, item])).values());
    
    // Create a Set of SKUs sold by the advisor for fast lookup
    const skusVendidos = new Set(ventasAsesor.map(v => String(v.sku)));

    // Determine which expected BDFs were sold and which weren't
    const analisis = bdfUnicos.map(bdf => ({
      ...bdf,
      vendido: skusVendidos.has(bdf.sku)
    }));

    setResultados({
      totalEsperados: bdfUnicos.length,
      totalVendidos: analisis.filter(a => a.vendido).length,
      detalle: analisis
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
      <h2 className="text-xl font-semibold mb-4 text-blue-800">Cruce de Artículos BDF (SIM)</h2>
      <p className="text-sm text-gray-600 mb-6">
        Cargue los archivos Excel exportados del SIM para identificar los artículos foco que el asesor no ha logrado vender. (Asegúrese de que la primera columna contenga el código/SKU del artículo).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="border border-dashed border-gray-300 p-4 rounded-md text-center bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">1. BDF Nacional</label>
          <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileUpload(e, setBdfNacional)} className="text-sm" />
          <p className="text-xs text-green-600 mt-2">{bdfNacional.length} registros cargados</p>
        </div>
        
        <div className="border border-dashed border-gray-300 p-4 rounded-md text-center bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">2. BDF Zonal</label>
          <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileUpload(e, setBdfZonal)} className="text-sm" />
          <p className="text-xs text-green-600 mt-2">{bdfZonal.length} registros cargados</p>
        </div>
        
        <div className="border border-dashed border-gray-300 p-4 rounded-md text-center bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">3. Ventas del Asesor</label>
          <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileUpload(e, setVentasAsesor)} className="text-sm" />
          <p className="text-xs text-green-600 mt-2">{ventasAsesor.length} registros cargados</p>
        </div>
      </div>

      <button 
        onClick={analizarCruce}
        className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition"
      >
        Realizar Cruce BDF
      </button>

      {resultados && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Resultados del Análisis</h3>
          <div className="flex gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded flex-1">
              <p className="text-sm text-blue-800">Objetivo BDF (Únicos)</p>
              <p className="text-2xl font-bold text-blue-900">{resultados.totalEsperados}</p>
            </div>
            <div className="bg-green-100 p-3 rounded flex-1">
              <p className="text-sm text-green-800">Vendidos por Asesor</p>
              <p className="text-2xl font-bold text-green-900">{resultados.totalVendidos}</p>
            </div>
            <div className="bg-red-100 p-3 rounded flex-1">
              <p className="text-sm text-red-800">Oportunidades (No Vendidos)</p>
              <p className="text-2xl font-bold text-red-900">{resultados.totalEsperados - resultados.totalVendidos}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-600">SKU</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-600">Descripción</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {resultados.detalle.map((item, index) => (
                  <tr key={index} className={item.vendido ? "bg-green-50" : "bg-red-50"}>
                    <td className="py-2 px-4 border-b text-sm font-mono">{item.sku}</td>
                    <td className="py-2 px-4 border-b text-sm">{item.descripcion}</td>
                    <td className="py-2 px-4 border-b text-sm font-medium">
                      {item.vendido ? (
                        <span className="text-green-700">Vendido</span>
                      ) : (
                        <span className="text-red-700">No Vendido</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
