import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { PanelData } from '../types';

export interface ExportOptions {
  scale?: number;
  backgroundColor?: string;
}

const DEFAULT_OPTIONS: ExportOptions = {
  scale: 2,
  backgroundColor: '#121212'
};

/**
 * Capture an HTML element as a canvas
 */
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

/**
 * Export comic as PNG
 */
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

/**
 * Export comic as PDF
 */
export async function exportComicAsPdf(
  elementId: string,
  filename: string = 'comic.pdf',
  options: ExportOptions = {}
): Promise<void> {
  const canvas = await captureElement(elementId, options);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const imgProps = pdf.getImageProperties(imgData);
  const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  let heightLeft = pdfImgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
  heightLeft -= pdfHeight;

  // Add subsequent pages if needed
  while (heightLeft > 0) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}

/**
 * Export slides as PDF (one panel per page)
 */
export async function exportSlidesAsPdf(
  panels: PanelData[],
  filename: string = 'comic-slides.pdf',
  options: ExportOptions = {}
): Promise<void> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 0; i < panels.length; i++) {
    if (i > 0) doc.addPage();
    
    const panel = panels[i];
    
    // Background
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Title
    doc.setFontSize(18);
    doc.setTextColor(74, 144, 226);
    const title = `Viñeta ${i + 1}: ${panel.title}`;
    doc.text(title, pageWidth / 2, 15, { align: 'center' });

    // Image
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

        if (h > maxH) {
          h = maxH;
          w = h * ratio;
        }
        
        const x = (pageWidth - w) / 2;
        doc.addImage(panel.imageUrl, 'JPEG', x, imgY, w, h);
        imgHeight = h;
      } catch {
        doc.setTextColor(150, 150, 150);
        doc.text("Imagen no disponible (Error)", pageWidth / 2, pageHeight / 2, { align: 'center' });
      }
    } else {
      doc.setTextColor(150, 150, 150);
      doc.text("Imagen no disponible", pageWidth / 2, pageHeight / 2, { align: 'center' });
    }

    // Text position
    let textY = imgY + imgHeight + 8;

    // Explanation
    if (panel.explanation) {
      doc.setFontSize(10);
      doc.setTextColor(180, 180, 180);
      doc.setFont('helvetica', 'italic');
      const splitExplanation = doc.splitTextToSize(panel.explanation, pageWidth - 40);
      doc.text(splitExplanation, pageWidth / 2, textY, { align: 'center' });
      textY += (splitExplanation.length * 4) + 4;
    }

    // Script Text
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

/**
 * Export auto-generation gallery as PDF
 */
export async function exportGalleryAsPdf(
  images: string[],
  prompts: string[],
  filename: string = 'galeria-secuencial.pdf'
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < images.length; i++) {
    if (i > 0) doc.addPage();
    
    // Background
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Image
    try {
      const imgProps = doc.getImageProperties(images[i]);
      const ratio = imgProps.width / imgProps.height;
      const maxW = pageWidth - 40;
      const maxH = pageHeight - 60;
      let w = maxW;
      let h = w / ratio;
      
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      doc.addImage(images[i], 'JPEG', (pageWidth - w) / 2, 20, w, h);
    } catch {
      console.error("Error adding image to gallery PDF", i);
    }

    // Prompt Text
    if (prompts[i]) {
      doc.setFontSize(10);
      doc.setTextColor(180, 180, 180);
      const splitText = doc.splitTextToSize(prompts[i], pageWidth - 40);
      doc.text(splitText, pageWidth / 2, pageHeight - 15, { align: 'center' });
    }
  }

  doc.save(filename);
}

/**
 * Export social media presentation as PDF
 */
export async function exportSocialPdf(
  renderElementId: string,
  panels: PanelData[],
  ratio: 'square' | 'landscape',
  filename: string
): Promise<void> {
  const isSquare = ratio === 'square';
  const width = isSquare ? 200 : 266.7;
  const height = isSquare ? 200 : 150;

  const doc = new jsPDF({
    orientation: isSquare ? 'p' : 'l',
    unit: 'mm',
    format: isSquare ? [200, 200] : [266.7, 150]
  });

  const renderElement = document.getElementById(renderElementId);
  if (!renderElement) throw new Error("No se encontró el elemento de renderizado");

  for (let i = 0; i < panels.length; i++) {
    // Wait for DOM update
    await new Promise(resolve => setTimeout(resolve, 400));

    const canvas = await html2canvas(renderElement, {
      useCORS: true,
      scale: 2,
      backgroundColor: null
    });

    const imgData = canvas.toDataURL('image/png');
    
    if (i > 0) doc.addPage();
    doc.addImage(imgData, 'PNG', 0, 0, width, height);
  }

  doc.save(filename);
}

/**
 * Export social media images as ZIP
 */
export async function exportSocialZip(
  renderElementId: string,
  panels: PanelData[],
  filename: string = 'presentacion-pack-x.zip'
): Promise<void> {
  const zip = new JSZip();
  const renderElement = document.getElementById(renderElementId);
  if (!renderElement) throw new Error("No se encontró el elemento de renderizado");

  for (let i = 0; i < panels.length; i++) {
    // Wait for DOM update
    await new Promise(resolve => setTimeout(resolve, 400));

    const canvas = await html2canvas(renderElement, {
      useCORS: true,
      scale: 2,
      backgroundColor: null
    });

    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.split(',')[1];
    
    const safeFilename = panels[i].title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 50);
    const fileName = `${String(i + 1).padStart(2, '0')}_${safeFilename}.png`;
    zip.file(fileName, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = filename;
  link.click();
}

/**
 * Export building view as PNG
 */
export async function exportBuildingPng(
  elementId: string,
  filename: string = '13_rue_del_percebe_ia.png'
): Promise<void> {
  const canvas = await captureElement(elementId, {
    scale: 2,
    backgroundColor: '#f3f4f6'
  });

  const imgData = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = imgData;
  link.click();
}

/**
 * Export building view as PDF
 */
export async function exportBuildingPdf(
  elementId: string,
  filename: string = '13_rue_del_percebe_ia.pdf'
): Promise<void> {
  const canvas = await captureElement(elementId, {
    scale: 2,
    backgroundColor: '#f3f4f6'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = pdfWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.setFontSize(14);
  pdf.text("13, Rue del Percebe - Réplica Interactiva IA", 10, 12);
  pdf.addImage(imgData, 'PNG', 10, 18, imgWidth, imgHeight);
  pdf.save(filename);
}

/**
 * Download a single image
 */
export function downloadImage(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}
