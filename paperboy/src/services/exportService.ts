import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PanelData } from '../types';

export interface ExportOptions {
  scale?: number;
  backgroundColor?: string;
}

const DEFAULT_OPTIONS: ExportOptions = {
  scale: 2,
  backgroundColor: '#121212'
};

async function captureElement(
  elementId: string,
  options: ExportOptions = {}
): Promise<HTMLCanvasElement> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  return html2canvas(element, {
    useCORS: true,
    scale: mergedOptions.scale,
    backgroundColor: mergedOptions.backgroundColor,
    allowTaint: true
  });
}

export async function exportComicAsPng(
  elementId: string,
  filename: string = 'comic.png',
  options: ExportOptions = {}
): Promise<void> {
  const canvas = await captureElement(elementId, options);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportComicAsPdf(
  elementId: string,
  filename: string = 'comic.pdf',
  options: ExportOptions = {}
): Promise<void> {
  const canvas = await captureElement(elementId, options);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const imgProps = pdf.getImageProperties(imgData);
  const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  let heightLeft = pdfImgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}

export async function exportSlidesAsPdf(
  panels: PanelData[],
  filename: string = 'comic-slides.pdf',
  options: ExportOptions = {}
): Promise<void> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 0; i < panels.length; i++) {
    if (i > 0) doc.addPage();
    
    const panel = panels[i];
    
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setFontSize(18);
    doc.setTextColor(74, 144, 226);
    doc.text(`Viñeta ${i + 1}: ${panel.title}`, pageWidth / 2, 15, { align: 'center' });

    let imgHeight = 0;
    let imgY = 25;
    
    if (panel.imageUrl) {
      try {
        const imgProps = doc.getImageProperties(panel.imageUrl);
        const ratio = imgProps.width / imgProps.height;
        const maxW = pageWidth - 40;
        const maxH = pageHeight - 80;
        let w = maxW;
        let h = w / ratio;
        if (h > maxH) { h = maxH; w = h * ratio; }
        doc.addImage(panel.imageUrl, 'JPEG', (pageWidth - w) / 2, imgY, w, h);
        imgHeight = h;
      } catch {
        doc.setTextColor(150, 150, 150);
        doc.text("Imagen no disponible", pageWidth / 2, pageHeight / 2, { align: 'center' });
      }
    }

    let textY = imgY + imgHeight + 8;

    if (panel.explanation) {
      doc.setFontSize(10);
      doc.setTextColor(180, 180, 180);
      doc.setFont('helvetica', 'italic');
      const splitExplanation = doc.splitTextToSize(panel.explanation, pageWidth - 40);
      doc.text(splitExplanation, pageWidth / 2, textY, { align: 'center' });
      textY += (splitExplanation.length * 4) + 4;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(224, 224, 224);
    const splitText = doc.splitTextToSize(panel.script, pageWidth - 40);
    if (textY < pageHeight - 10) {
      doc.text(splitText, pageWidth / 2, textY, { align: 'center' });
    }
  }

  doc.save(filename);
}
