import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { rubricaData } from '../data/rubricaData';

const DIMENSIONS = [
  { key: 'Desarrollo', label: '1. Desarrollo y Formación' },
  { key: 'Supervisor', label: '2. Supervisor de Ventas' },
  { key: 'Auditoria', label: '3. Auditoría de Procesos' },
  { key: 'Credito_Cobranza', label: '4. Crédito y Cobranza' },
  { key: 'Admin_Ventas', label: '5. Administración de Ventas' },
  { key: 'Autoevaluacion', label: '6. Autoevaluación Asesor' }
];

const getScoreLabel = (score) => {
  if (score === 'N/A' || score === null || score === undefined) return 'N/A';
  const num = Number(score);
  if (isNaN(num)) return String(score);
  if (num === 5) return '5 (Referente)';
  if (num === 4) return '4 (Sólido)';
  if (num === 3) return '3 (Competente)';
  if (num === 2) return '2 (En desarrollo)';
  if (num === 1) return '1 (No cumple)';
  return `${num}`;
};

export function generarPdfRubricasDetallado({
  advisor,
  month,
  evaluations = [],
  actionPlans = [],
  evaluatorName = 'Comité Evaluador',
  openInNewTab = false
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const usableWidth = pageWidth - (margin * 2);

  // Resolver el nombre del asesor con todos los fallbacks posibles
  const evalAdvisorName = evaluations?.find(e => e.advisor_name && e.advisor_name.trim())?.advisor_name;
  const planAdvisorName = actionPlans?.find(p => p.advisor_name && p.advisor_name.trim())?.advisor_name;
  const advisorFullName = (
    advisor?.full_name ||
    advisor?.nombre ||
    advisor?.name ||
    advisor?.advisor_name ||
    evalAdvisorName ||
    planAdvisorName ||
    advisor?.email ||
    'Asesor Comercial'
  ).trim();

  const evalEmpresa = evaluations?.find(e => e.empresa && e.empresa.trim())?.empresa;
  const advisorEmpresa = advisor?.empresa || advisor?.company || evalEmpresa || '';
  const advisorZona = advisor?.zona || advisor?.estado || '';
  const empZona = [advisorEmpresa, advisorZona].filter(Boolean).join(' · ') || 'Sin Empresa / Zona';

  // 1. Franja Superior Corporativa
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setFillColor(2, 132, 199); // sky-600 accent
  doc.rect(0, 22, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('INFORME DETALLADO DE RÚBRICAS POR DIMENSIÓN', margin, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('EVALUACIÓN MENSUAL INTEGRAL · INDUCCIÓN DINÁMICA AFV', margin, 16);

  // Metadatos a la derecha
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  const corteTag = parseInt(month) === 3 ? ' (CORTE TRIMESTRAL)' : parseInt(month) === 6 ? ' (CORTE SEMESTRAL)' : '';
  doc.text(`CORTE: MES ${month}${corteTag}`, pageWidth - margin, 10, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(224, 231, 255);
  doc.text(`Emisión: ${new Date().toLocaleDateString('es-VE')}`, pageWidth - margin, 16, { align: 'right' });

  // 2. Ficha del Asesor
  let yPos = 29;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPos, usableWidth, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ASESOR EVALUADO:', margin + 4, yPos + 6);
  doc.text('EMPRESA / ZONA:', margin + 4, yPos + 12);
  doc.text('EVALUADOR RESPONSABLE:', margin + 4, yPos + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(advisorFullName, margin + 44, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(empZona, margin + 44, yPos + 12);
  doc.text(evaluatorName || 'Comité Evaluador', margin + 44, yPos + 18);

  // Resumen del mes en tarjeta derecha
  let totalScore = 0;
  let countDepts = 0;
  evaluations.forEach(ev => {
    if (ev.average_score) {
      totalScore += Number(ev.average_score);
      countDepts++;
    }
  });
  const globalAvg = countDepts > 0 ? (totalScore / countDepts).toFixed(2) : '0.00';

  let statusLabel = 'REQUIERE REFUERZO';
  let statusColor = [225, 29, 72]; // Rose-600
  if (Number(globalAvg) >= 4.0) {
    statusLabel = 'SÓLIDO / REFERENTE';
    statusColor = [22, 163, 74]; // Green-600
  } else if (Number(globalAvg) >= 3.0) {
    statusLabel = 'COMPETENTE ESTÁNDAR';
    statusColor = [217, 119, 6]; // Amber-600
  }

  const kpiWidth = 56;
  const kpiX = pageWidth - margin - kpiWidth - 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(kpiX, yPos + 2, kpiWidth, 19, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PROMEDIO GLOBAL DEL MES', kpiX + (kpiWidth / 2), yPos + 6.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${globalAvg} / 5.00`, kpiX + (kpiWidth / 2), yPos + 13, { align: 'center' });

  doc.setFontSize(6);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`[ ${statusLabel} ]`, kpiX + (kpiWidth / 2), yPos + 17.5, { align: 'center' });

  yPos += 27;

  // 3. Contexto Estructural de la Zona (si existe)
  const origenZona = advisor?.origen_zona || '';
  const deudaHeredada = advisor?.deuda_heredada || '';
  const presupuestoAsignado = advisor?.presupuesto_asignado || '';

  if (origenZona || deudaHeredada || presupuestoAsignado) {
    doc.setFillColor(254, 252, 232); // amber-50
    doc.setDrawColor(253, 230, 138); // amber-200
    doc.roundedRect(margin, yPos, usableWidth, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text('CONTEXTO ESTRUCTURAL DE LA ZONA (REFERENCIA BASE)', margin + 4, yPos + 5);

    const colW = (usableWidth - 8) / 3;
    const items = [
      { label: 'ORIGEN Y TIPOLOGÍA', val: origenZona },
      { label: 'DEUDA HEREDADA BASE', val: deudaHeredada },
      { label: 'PRESUPUESTO / META MENSUAL', val: presupuestoAsignado }
    ];

    items.forEach((it, idx) => {
      const itX = margin + 4 + (idx * colW);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(180, 83, 9);
      doc.text(it.label, itX, yPos + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(30, 41, 59);
      const splitText = doc.splitTextToSize(it.val || 'No registrado', colW - 4);
      doc.text(splitText.slice(0, 3), itX, yPos + 14);
    });

    yPos += 28;
  }

  // 4. Tabla Síntesis de las 6 Dimensiones
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SÍNTESIS GENERAL DE LAS SEIS DIMENSIONES', margin, yPos);

  const summaryRows = DIMENSIONS.map(dim => {
    const ev = evaluations.find(e => e.department === dim.key);
    const score = ev ? Number(ev.average_score).toFixed(2) : '-';
    let statusText = 'Pendiente';
    if (ev) {
      if (Number(score) >= 4.0) statusText = 'Sólido / Referente';
      else if (Number(score) >= 3.0) statusText = 'Competente Estándar';
      else statusText = 'Requiere Refuerzo';
    }
    const cCount = (rubricaData[dim.key] || []).length;
    const obsCount = ev?.criteria_observations ? Object.values(ev.criteria_observations).filter(v => v && v.trim()).length : 0;
    return [
      dim.label,
      score,
      statusText,
      `${obsCount} de ${cCount} criterios con observación`
    ];
  });

  autoTable(doc, {
    startY: yPos + 2,
    head: [['Dimensión Evaluada', 'Nota', 'Nivel de Desempeño', 'Observaciones Registradas']],
    body: summaryRows,
    theme: 'grid',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: [30, 41, 59],
      cellPadding: 1.8
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 42 },
      3: { cellWidth: 'auto', textColor: [100, 116, 139] }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 1) {
        const val = Number(data.cell.raw);
        if (!isNaN(val) && val > 0) {
          if (val >= 4.0) data.cell.styles.textColor = [22, 101, 52];
          else if (val >= 3.0) data.cell.styles.textColor = [161, 98, 7];
          else data.cell.styles.textColor = [185, 28, 28];
        }
      }
    }
  });

  yPos = doc.lastAutoTable.finalY + 8;

  // 5. Desglose Criterio por Criterio para cada una de las 6 Dimensiones
  DIMENSIONS.forEach((dim, dimIndex) => {
    const criterios = rubricaData[dim.key] || [];
    const ev = evaluations.find(e => e.department === dim.key);
    const scores = ev?.scores || {};
    const criteriaObs = ev?.criteria_observations || {};
    const generalComment = ev?.comments || '';
    const dimScore = ev ? Number(ev.average_score).toFixed(2) : '-';

    // Verificar si queda suficiente espacio para iniciar la dimensión o forzar salto de página
    if (yPos > pageHeight - 55) {
      doc.addPage();
      yPos = 18;
    }

    // Encabezado de la Dimensión
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, yPos, usableWidth, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(dim.label.toUpperCase(), margin + 3, yPos + 4.5);

    doc.setFontSize(7.5);
    doc.text(
      ev ? `PROMEDIO: ${dimScore} / 5.00` : 'PENDIENTE DE EVALUACIÓN',
      pageWidth - margin - 3,
      yPos + 4.5,
      { align: 'right' }
    );

    yPos += 7.5;

    // Filas para la tabla de criterios
    const criteriaTableRows = criterios.map(crit => {
      const rawScore = scores[crit.id];
      const scoreText = rawScore !== undefined ? getScoreLabel(rawScore) : 'Sin nota';
      const obsText = (criteriaObs[crit.id] && criteriaObs[crit.id].trim()) 
        ? criteriaObs[crit.id].trim() 
        : 'Sin observación específica registrada.';

      return [
        {
          content: `${crit.id} - ${crit.label}`,
          styles: { fontStyle: 'bold' }
        },
        {
          content: scoreText,
          styles: { halign: 'center', fontStyle: 'bold' }
        },
        {
          content: obsText,
          styles: { fontStyle: (criteriaObs[crit.id] && criteriaObs[crit.id].trim()) ? 'normal' : 'italic' }
        }
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Rúbrica / Criterio Evaluado', 'Calificación', 'Observaciones y Evidencia Cualitativa']],
      body: criteriaTableRows,
      theme: 'grid',
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [71, 85, 105], // slate-600
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 6.8
      },
      bodyStyles: {
        fontSize: 6.5,
        textColor: [30, 41, 59],
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 54 },
        1: { cellWidth: 26 },
        2: { cellWidth: 'auto' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 1) {
          const raw = String(data.cell.raw?.content || '');
          if (raw.startsWith('5') || raw.startsWith('4')) {
            data.cell.styles.textColor = [22, 101, 52]; // verde
          } else if (raw.startsWith('3')) {
            data.cell.styles.textColor = [161, 98, 7]; // ámbar
          } else if (raw.startsWith('2') || raw.startsWith('1')) {
            data.cell.styles.textColor = [185, 28, 28]; // rojo
          } else {
            data.cell.styles.textColor = [100, 116, 139]; // gris
          }
        }
        if (data.section === 'body' && data.column.index === 2) {
          const raw = String(data.cell.raw?.content || '');
          if (raw.startsWith('Sin observación')) {
            data.cell.styles.textColor = [148, 163, 184];
          } else {
            data.cell.styles.textColor = [15, 23, 42];
          }
        }
      }
    });

    yPos = doc.lastAutoTable.finalY + 2;

    // Comentario general de la dimensión si existe
    if (generalComment && generalComment.trim()) {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 18;
      }
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, yPos, usableWidth, 9, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(71, 85, 105);
      doc.text(`COMENTARIO GLOBAL DE ${dim.label.toUpperCase()}:`, margin + 3, yPos + 3.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(30, 41, 59);
      const splitComm = doc.splitTextToSize(generalComment.trim(), usableWidth - 6);
      doc.text(splitComm.slice(0, 2), margin + 3, yPos + 6.8);

      yPos += 11;
    } else {
      yPos += 4;
    }
  });

  // 6. Planes de Acción / Compromisos
  if (actionPlans && actionPlans.length > 0) {
    if (yPos > pageHeight - 45) {
      doc.addPage();
      yPos = 18;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('PLAN DE ACCIÓN Y COMPROMISOS DE MEJORA ACORDADOS', margin, yPos);

    const planRows = actionPlans.map(p => [
      p.department || 'General',
      p.criterion_label || p.criterion_id || 'Indicador',
      p.compromiso || 'Acción específica acordada',
      p.responsable || 'Supervisor / Buddy',
      p.fecha_limite || 'Por definir',
      p.estado || 'Pendiente'
    ]);

    autoTable(doc, {
      startY: yPos + 2,
      head: [['Dimensión', 'Indicador', 'Acción de Mejora', 'Responsable', 'F. Límite', 'Estado']],
      body: planRows,
      theme: 'grid',
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7
      },
      bodyStyles: {
        fontSize: 6.5,
        textColor: [30, 41, 59],
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 32, fontStyle: 'bold' },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 26 },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
      }
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // 7. Firmas de Compromiso
  if (yPos > pageHeight - 38) {
    doc.addPage();
    yPos = 24;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('CONFORMIDAD Y FIRMAS DE EVALUACIÓN', margin, yPos);

  yPos += 14;
  const colWidth = usableWidth / 3;

  // Firma 1: Asesor
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, yPos, margin + colWidth - 5, yPos);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(advisorFullName, margin + (colWidth / 2), yPos + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Firma de Conformidad del Asesor', margin + (colWidth / 2), yPos + 8, { align: 'center' });

  // Firma 2: Supervisor / Evaluador
  doc.line(margin + colWidth + 5, yPos, margin + (colWidth * 2) - 5, yPos);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(evaluatorName || 'Supervisor / Evaluador', margin + colWidth + (colWidth / 2), yPos + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Firma Supervisor de Ventas', margin + colWidth + (colWidth / 2), yPos + 8, { align: 'center' });

  // Firma 3: Gerencia / RRHH
  doc.line(margin + (colWidth * 2) + 5, yPos, pageWidth - margin - 5, yPos);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Desarrollo Comercial / RRHH', margin + (colWidth * 2) + (colWidth / 2), yPos + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Validación Gerencial AFV', margin + (colWidth * 2) + (colWidth / 2), yPos + 8, { align: 'center' });

  // 8. Pie de página institucional y numeración
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Documento oficial confidencial de inducción y evaluación por competencias · Academia de Formación en Ventas (AFV)',
      margin,
      pageHeight - 6
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  const safeName = advisorFullName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Reporte_Detallado_Rubricas_${safeName}_Mes_${month}.pdf`;

  if (openInNewTab) {
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
  } else {
    doc.save(fileName);
  }

  return doc;
}
