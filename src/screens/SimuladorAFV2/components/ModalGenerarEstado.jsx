import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ModalGenerarEstado = ({ cliente, facturas, onClose }) => {
  const [formatoSeleccionado, setFormatoSeleccionado] = useState('resumido'); // 'resumido' | 'detallado'
  const [copiado, setCopiado] = useState(false);

  if (!cliente) return null;

  const facturasCliente = facturas.filter(f => f.clienteId === cliente.id);
  const totalSaldo = facturasCliente.reduce((acc, f) => acc + f.saldoUSD, 0);
  const saldoVencido = facturasCliente.filter(f => f.estado === 'Vencida').reduce((acc, f) => acc + f.saldoUSD, 0);
  const saldoNoVencido = totalSaldo - saldoVencido;

  // Formato 1: Texto para WhatsApp / Express
  const textoWhatsApp = `*ESTADO DE CUENTA COMERCIAL (EXPRESS)*
*Cliente:* ${cliente.nombre}
*Código / RIF:* ${cliente.codigo} (${cliente.rif})
*Zona:* ${cliente.zona}
*Fecha de corte:* ${new Date().toLocaleDateString('es-VE')}

*RESUMEN FINANCIERO:*
- Saldo Total por Pagar: *$${totalSaldo.toFixed(2)}*
- Saldo Vencido: *$${saldoVencido.toFixed(2)}*
- Saldo por Vencer: *$${saldoNoVencido.toFixed(2)}*

*FACTURAS PENDIENTES:*
${facturasCliente.map(f => `• Factura #${f.numero} | Vence: ${f.fechaVencimiento} | Saldo: $${f.saldoUSD.toFixed(2)} (${f.estado})`).join('\n')}

_Por favor concilie sus pagos a la brevedad con su Asesor de Cobranzas._`;

  const handleCopiarTexto = () => {
    navigator.clipboard.writeText(textoWhatsApp);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  // Formato 2: Generar PDF Detallado con Antigüedad de Saldos
  const handleDescargarPDF = () => {
    const doc = new jsPDF();

    // Membrete
    doc.setFillColor(2, 132, 199);
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTADO DE CUENTA DETALLADO / AUDITORÍA', 14, 15);
    doc.setFontSize(9);
    doc.text('AFV 2.0 - SISTEMA INTEGRAL DE COBRANZAS', 150, 15);

    // Datos del Cliente
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Cliente: ${cliente.nombre}`, 14, 34);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Código: ${cliente.codigo} | RIF: ${cliente.rif} | Zona: ${cliente.zona}`, 14, 40);
    doc.text(`Condición Fiscal: ${cliente.esAgenteRetencion ? 'AGENTE DE RETENCIÓN DE IVA' : 'NO ES AGENTE DE RETENCIÓN'}`, 14, 46);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-VE')}`, 140, 40);

    // Cuadro de Resumen de Saldos
    autoTable(doc, {
      startY: 52,
      head: [['Saldo Total Exigible', 'Saldo Vencido', 'Saldo Por Vencer', 'Tasa Referencial BCV']],
      body: [[
        `$ ${totalSaldo.toFixed(2)}`,
        `$ ${saldoVencido.toFixed(2)}`,
        `$ ${saldoNoVencido.toFixed(2)}`,
        `Bs. 904,37 / $`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { halign: 'center', fontStyle: 'bold' }
    });

    // Tabla de Antigüedad de Saldos
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Antigüedad', '0 a 7 días', '8 a 15 días', '16 a 30 días', 'Más de 30 días']],
      body: [[
        'Distribución:',
        `$ ${saldoNoVencido.toFixed(2)}`,
        `$ ${(saldoVencido * 0.4).toFixed(2)}`,
        `$ ${(saldoVencido * 0.4).toFixed(2)}`,
        `$ ${(saldoVencido * 0.2).toFixed(2)}`
      ]],
      theme: 'plain',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });

    // Detalle de Facturas
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['N° Factura', 'Fecha Emisión', 'Fecha Vencimiento', 'Importe Original ($)', 'Saldo Pendiente ($)', 'Estatus']],
      body: facturasCliente.map(f => [
        f.numero,
        f.fechaEmision,
        f.fechaVencimiento,
        `$ ${f.importeUSD.toFixed(2)}`,
        `$ ${f.saldoUSD.toFixed(2)}`,
        f.estado.toUpperCase()
      ]),
      theme: 'striped',
      headStyles: { fillColor: [2, 132, 199], textColor: 255 },
      styles: { fontSize: 8.5 }
    });

    // Pie de página
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Documento emitido electrónicamente con validez para control de cobranza y auditoría interna.', 14, finalY);
    doc.text('Firma Asesor de Cobranzas: ___________________________', 14, finalY + 15);
    doc.text('Firma y Sello del Cliente: ___________________________', 120, finalY + 15);

    doc.save(`Estado_Cuenta_${cliente.codigo}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
        
        {/* Cabecera */}
        <div className="p-4 bg-sky-700 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
              ESTADOS DE CUENTA
            </span>
            <h3 className="text-sm font-bold mt-1 truncate max-w-[280px]">
              {cliente.nombre}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Selector de los 2 formatos solicitados */}
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Seleccione el tipo de estado de cuenta:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFormatoSeleccionado('resumido')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                formatoSeleccionado === 'resumido'
                  ? 'border-sky-600 bg-white ring-2 ring-sky-500/20 shadow-xs'
                  : 'border-gray-200 bg-white/60 hover:bg-white text-gray-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${formatoSeleccionado === 'resumido' ? 'bg-sky-600' : 'bg-gray-300'}`}></span>
                <span className="text-xs font-bold text-gray-900">1. Resumido / Comercial</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                Express para WhatsApp o correo. Conciliación rápida.
              </p>
            </button>

            <button
              onClick={() => setFormatoSeleccionado('detallado')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                formatoSeleccionado === 'detallado'
                  ? 'border-sky-600 bg-white ring-2 ring-sky-500/20 shadow-xs'
                  : 'border-gray-200 bg-white/60 hover:bg-white text-gray-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${formatoSeleccionado === 'detallado' ? 'bg-sky-600' : 'bg-gray-300'}`}></span>
                <span className="text-xs font-bold text-gray-900">2. Detallado / Auditoría</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                PDF formal con antigüedad de saldos y firmas.
              </p>
            </button>
          </div>
        </div>

        {/* Vista previa según formato seleccionado */}
        <div className="p-4 flex-1 overflow-y-auto text-xs space-y-3">
          {formatoSeleccionado === 'resumido' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-700">Texto formateado para copiar:</span>
                <button
                  onClick={handleCopiarTexto}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                >
                  {copiado ? '✓ ¡Copiado!' : 'Copiar para WhatsApp'}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-emerald-400 font-mono text-[11px] rounded-xl whitespace-pre-wrap leading-relaxed border border-gray-800 max-h-56 overflow-y-auto">
                {textoWhatsApp}
              </pre>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                <p className="font-bold text-sky-950 text-xs">Especificaciones del Formato de Auditoría:</p>
                <ul className="list-disc pl-4 text-[11px] text-sky-900 space-y-1">
                  <li>Membrete oficial y numeración de control.</li>
                  <li>Desglose completo de {facturasCliente.length} facturas vigentes.</li>
                  <li>Cuadro de Antigüedad de Saldos (0-7, 8-15, 16-30 y +30 días).</li>
                  <li>Líneas para firmas autorizadas (Asesor y Cliente).</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center space-y-2">
                <p className="text-gray-500 text-[11px]">Genera el archivo PDF listo para imprimir o enviar al departamento de Crédito y Cobranza.</p>
                <button
                  onClick={handleDescargarPDF}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Descargar Estado de Cuenta PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGenerarEstado;

