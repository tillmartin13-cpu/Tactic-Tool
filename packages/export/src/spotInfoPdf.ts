import { jsPDF } from 'jspdf';

export interface SpotPdfRow {
  kuerzel: string;
  kmLines: { trackName: string; km: number }[];
}

export function downloadSpotInfoPdf(
  eventId: string,
  eventName: string | null,
  spots: SpotPdfRow[],
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 20;
  let y = M;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(28, 43, 107);
  doc.text('SpotInfo', M, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Event: ${eventId}${eventName ? ` – ${eventName}` : ''}`, M, y);
  y += 5;
  doc.text(`Created: ${new Date().toLocaleDateString('de-DE')}`, M, y);
  y += 10;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 8;

  spots.forEach((s, i) => {
    if (y > 265) {
      doc.addPage();
      y = M;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(204, 43, 43);
    doc.text(s.kuerzel, M, y);
    y += 6;

    for (const r of s.kmLines) {
      if (y > 275) {
        doc.addPage();
        y = M;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(`KM ${r.km.toFixed(1)}  ·  ${r.trackName}`, M + 4, y);
      y += 5;
    }
    y += 4;
    if (i < spots.length - 1) {
      doc.setDrawColor(240, 240, 240);
      doc.line(M, y, W - M, y);
      y += 6;
    }
  });

  doc.save(`SpotInfo_${eventId}.pdf`);
}
