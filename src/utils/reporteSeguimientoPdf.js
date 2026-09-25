import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DIMENSION_NAMES = {
  Desarrollo: '1. Desarrollo y Formación',
  Supervisor: '2. Supervisor de Ventas',
  Auditoria: '3. Auditoría de Procesos',
  Credito_Cobranza: '4. Crédito y Cobranza',
  Admin_Ventas: '5. Administración de Ventas',
  Autoevaluacion: '6. Autoevaluación Asesor'
};

export function generarPdfSeguimiento({
  advisor,
  month,
  evaluations = [],
  actionPlans = [],
  evaluatorName = 'Administración'
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Franja Superior Corporativa
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFillColor(2, 132, 199); // sky-600
  doc.rect(0, 24, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FICHA DE SEGUIMIENTO Y PLAN DE ACCIÓN', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('SISTEMA INTEGRAL DE INDUCCIÓN Y SEGUIMIENTO COMERCIAL', margin, 18);

  // Metadata en el encabezado (derecha)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  const corteText = `CORTE: MES ${month} ${parseInt(month) === 3 ? '(TRIMESTRAL)' : parseInt(month) === 6 ? '(SEMESTRAL)' : ''}`;
  doc.text(corteText, pageWidth - margin, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(224, 231, 255);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-VE')}`, pageWidth - margin, 18, { align: 'right' });

  // 2. Tarjeta: Datos del Asesor y Evaluación
  let yPos = 32;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ASESOR EVALUADO:', margin + 4, yPos + 6);
  doc.text('CORREO / USUARIO:', margin + 4, yPos + 13);
  doc.text('EVALUADOR RESPONSABLE:', margin + 4, yPos + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(advisor?.full_name || 'Asesor Comercial', margin + 42, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(advisor?.email || 'N/A', margin + 42, yPos + 13);
  doc.text(evaluatorName || 'Comité Evaluador', margin + 42, yPos + 20);

  // 3. Resumen Ejecutivo (Semáforo Global)
  // Calcular promedio global de las evaluaciones recibidas para este mes
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
  let statusColor = [239, 68, 68]; // Rojo
  if (Number(globalAvg) >= 4.0) {
    statusLabel = 'SÓLIDO / REFERENTE';
    statusColor = [34, 197, 94]; // Verde
  } else if (Number(globalAvg) >= 3.0) {
    statusLabel = 'COMPETENTE ESTÁNDAR';
    statusColor = [234, 179, 8]; // Amarillo
  }

  const kpiBoxX = pageWidth - margin - 58;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(kpiBoxX, yPos + 2, 54, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PROMEDIO GLOBAL DEL MES', kpiBoxX + 27, yPos + 7, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${globalAvg} / 5.00`, kpiBoxX + 27, yPos + 14, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`[ ${statusLabel} ]`, kpiBoxX + 27, yPos + 19, { align: 'center' });

  yPos += 30;

  // 4. Tabla: Desglose de las 6 Dimensiones
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. EVALUACIÓN POR DIMENSIONES (RÚBRICA DE DESEMPEÑO)', margin, yPos);

  const dimensionKeys = ['Desarrollo', 'Supervisor', 'Auditoria', 'Credito_Cobranza', 'Admin_Ventas', 'Autoevaluacion'];
  const tableRows = dimensionKeys.map(key => {
    const ev = evaluations.find(e => e.department === key);
    const score = ev ? Number(ev.average_score).toFixed(2) : '-';
    let estado = 'Pendiente';
    if (ev) {
      if (Number(score) >= 4.0) estado = 'Sólido (>= 4.0)';
      else if (Number(score) >= 3.0) estado = 'Competente (3.0 - 3.9)';
      else estado = 'Requiere Refuerzo (< 3.0)';
    }

    const comentarios = ev?.comments ? ev.comments.substring(0, 75) + (ev.comments.length > 75 ? '...' : '') : 'Sin observaciones adicionales';

    return [
      DIMENSION_NAMES[key] || key,
      score,
      estado,
      comentarios
    ];
  });

  autoTable(doc, {
    startY: yPos + 3,
    head: [['Dimensión Evaluada', 'Nota', 'Nivel de Cumplimiento', 'Observaciones / Hallazgos']],
    body: tableRows,
    theme: 'grid',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 42 },
      3: { cellWidth: 'auto' }
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

  yPos = doc.lastAutoTable.finalY + 10;

  // 5. Tabla: Plan de Acción y Compromisos de Mejora
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. PLAN DE ACCIÓN Y COMPROMISOS DE MEJORA', margin, yPos);

  const planRows = actionPlans.length > 0
    ? actionPlans.map(p => [
        p.department ? (DIMENSION_NAMES[p.department] || p.department) : 'General',
        p.criterion_label || p.criterion_id || 'Indicador',
        p.compromiso || p.accion || 'Acción de mejora acordada',
        p.responsable || 'Supervisor / Buddy',
        p.fecha_limite || 'Por definir',
        p.estado || 'Pendiente'
      ])
    : [
        [
          'Todas las Dimensiones',
          'Rendimiento General',
          'Continuar con la ejecución de los procedimientos estándar establecidos para el mes en curso.',
          'Asesor y Supervisor',
          'Siguiente Corte',
          'En Progreso'
        ]
      ];

  autoTable(doc, {
    startY: yPos + 3,
    head: [['Dimensión', 'Indicador Crítico', 'Compromiso / Acción Específica', 'Responsable', 'F. Límite', 'Estado']],
    body: planRows,
    theme: 'grid',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 26 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 5) {
        const est = String(data.cell.raw).toLowerCase();
        if (est.includes('cumplido')) data.cell.styles.textColor = [22, 101, 52];
        else if (est.includes('progreso') || est.includes('proceso')) data.cell.styles.textColor = [29, 78, 216];
        else if (est.includes('pendiente')) data.cell.styles.textColor = [161, 98, 7];
      }
    }
  });

  yPos = doc.lastAutoTable.finalY + 14;

  // Si queda poco espacio para las firmas, agregar página
  if (yPos > pageHeight - 35) {
    doc.addPage();
    yPos = 30;
  }

  // 6. Firmas Formales de Compromiso
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. CONFORMIDAD Y FIRMAS DE COMPROMISO', margin, yPos);

  yPos += 16;
  const colWidth = (pageWidth - (margin * 2)) / 3;

  // Firma 1: Asesor
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(margin + 5, yPos, margin + colWidth - 5, yPos);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(advisor?.full_name || 'Asesor Comercial', margin + (colWidth / 2), yPos + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Firma del Asesor', margin + (colWidth / 2), yPos + 8, { align: 'center' });

  // Firma 2: Supervisor / Evaluador
  doc.line(margin + colWidth + 5, yPos, margin + (colWidth * 2) - 5, yPos);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(evaluatorName || 'Supervisor de Área', margin + colWidth + (colWidth / 2), yPos + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Firma Supervisor / Evaluador', margin + colWidth + (colWidth / 2), yPos + 8, { align: 'center' });

  // Firma 3: Gerencia
  doc.line(margin + (colWidth * 2) + 5, yPos, pageWidth - margin - 5, yPos);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Desarrollo Comercial / RRHH', margin + (colWidth * 2) + (colWidth / 2), yPos + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Validación Gerencial', margin + (colWidth * 2) + (colWidth / 2), yPos + 8, { align: 'center' });

  // 7. Pie de Página Institucional
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Documento confidencial para la gestión del desempeño y acompañamiento comercial continuo.',
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

  // Guardar / Descargar el archivo
  const safeName = (advisor?.full_name || 'Asesor').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Seguimiento_PlanAccion_${safeName}_Mes_${month}.pdf`;
  doc.save(fileName);
}
