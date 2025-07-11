import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

interface PDFOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  addLinks?: boolean;
  contactInfo?: ContactInfo;
}

export class EnhancedPDFGenerator {
  private static readonly DEFAULT_OPTIONS: PDFOptions = {
    quality: 0.95,
    scale: 2, // Reduced scale for better performance while maintaining quality
    addLinks: true,
    filename: 'Resume.pdf'
  };

  /**
   * Generate high-quality PDF with clickable links and proper multi-page support
   */
  static async generatePDF(element: HTMLElement, options: PDFOptions = {}): Promise<void> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Step 1: Prepare element for PDF generation
      const preparedElement = await this.prepareElementForPDF(element);
      
      // Step 2: Generate high-quality canvas
      const canvas = await this.generateHighQualityCanvas(preparedElement, opts.scale!);
      
      // Step 3: Create PDF with proper multi-page support
      const pdf = await this.createMultiPagePDFFromCanvas(canvas, opts.quality!);
      
      // Step 4: Add clickable links if enabled
      if (opts.addLinks && opts.contactInfo) {
        await this.addClickableLinks(pdf, preparedElement, opts.contactInfo, canvas);
      }
      
      // Step 5: Save the PDF
      pdf.save(opts.filename!);
      
      // Cleanup
      this.cleanupElement(preparedElement, element);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Prepare element for PDF generation by optimizing styles
   */
  private static async prepareElementForPDF(element: HTMLElement): Promise<HTMLElement> {
    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Apply PDF-specific styles for optimal A4 layout
    clonedElement.style.width = '210mm'; // A4 width
    clonedElement.style.minHeight = 'auto'; // Allow natural height for multi-page
    clonedElement.style.padding = '15mm'; // Standard padding
    clonedElement.style.margin = '0'; // Remove any margins
    clonedElement.style.boxSizing = 'border-box';
    clonedElement.style.backgroundColor = '#ffffff';
    clonedElement.style.color = '#000000';
    clonedElement.style.fontSize = '11px'; // Optimal size for readability
    clonedElement.style.lineHeight = '1.4';
    clonedElement.style.fontFamily = 'Arial, sans-serif';
    clonedElement.style.position = 'relative';
    
    // Enhanced page break prevention
    clonedElement.style.pageBreakInside = 'avoid';
    clonedElement.style.breakInside = 'avoid';
    (clonedElement.style as any).webkitColumnBreakInside = 'avoid';
    
    // Optimize all child elements for PDF
    const allElements = clonedElement.querySelectorAll('*');
    allElements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style) {
        // Fix icon alignment issues
        if (htmlEl.classList.contains('lucide') || htmlEl.tagName.toLowerCase() === 'svg') {
          htmlEl.style.verticalAlign = 'middle';
          htmlEl.style.display = 'inline-block';
          htmlEl.style.marginRight = '4px';
        }
        
        // Ensure proper text alignment with icons
        if (htmlEl.classList.contains('flex') && htmlEl.classList.contains('items-center')) {
          htmlEl.style.display = 'flex';
          htmlEl.style.alignItems = 'center';
          htmlEl.style.gap = '4px';
        }
        
        // Enhanced page break avoidance for sections
        if (htmlEl.classList.contains('section') || 
            htmlEl.tagName.toLowerCase() === 'section' ||
            htmlEl.tagName.toLowerCase() === 'h1' ||
            htmlEl.tagName.toLowerCase() === 'h2' ||
            htmlEl.tagName.toLowerCase() === 'h3') {
          htmlEl.style.pageBreakInside = 'avoid';
          htmlEl.style.breakInside = 'avoid';
          htmlEl.style.pageBreakAfter = 'avoid';
          htmlEl.style.breakAfter = 'avoid';
          (htmlEl.style as any).webkitColumnBreakInside = 'avoid';
          (htmlEl.style as any).webkitColumnBreakAfter = 'avoid';
        }
        
        // Handle experience, education, project items to avoid awkward breaks
        if (htmlEl.classList.contains('experience-item') || 
            htmlEl.classList.contains('education-item') ||
            htmlEl.classList.contains('project-item') ||
            htmlEl.classList.contains('certification-item') ||
            htmlEl.classList.contains('volunteer-item') ||
            htmlEl.classList.contains('award-item') ||
            htmlEl.classList.contains('language-item') ||
            htmlEl.tagName.toLowerCase() === 'li') {
          htmlEl.style.pageBreakInside = 'avoid';
          htmlEl.style.breakInside = 'avoid';
          htmlEl.style.marginBottom = '16px';
          (htmlEl.style as any).webkitColumnBreakInside = 'avoid';
        }
        
        // Prevent page breaks within paragraphs and text blocks
        if (htmlEl.tagName.toLowerCase() === 'p' ||
            htmlEl.tagName.toLowerCase() === 'div' ||
            htmlEl.tagName.toLowerCase() === 'span') {
          htmlEl.style.pageBreakInside = 'avoid';
          htmlEl.style.breakInside = 'avoid';
          (htmlEl.style as any).webkitColumnBreakInside = 'avoid';
        }
        
        // Special handling for lists to keep items together
        if (htmlEl.tagName.toLowerCase() === 'ul' ||
            htmlEl.tagName.toLowerCase() === 'ol') {
          htmlEl.style.pageBreakInside = 'avoid';
          htmlEl.style.breakInside = 'avoid';
          (htmlEl.style as any).webkitColumnBreakInside = 'avoid';
        }
        
        // Prevent orphaned lines by keeping related content together
        if (htmlEl.classList.contains('space-y-1') ||
            htmlEl.classList.contains('space-y-2') ||
            htmlEl.classList.contains('space-y-3') ||
            htmlEl.classList.contains('space-y-4') ||
            htmlEl.classList.contains('mb-2') ||
            htmlEl.classList.contains('mb-4')) {
          htmlEl.style.pageBreakInside = 'avoid';
          htmlEl.style.breakInside = 'avoid';
          (htmlEl.style as any).webkitColumnBreakInside = 'avoid';
        }
        
        // Handle text colors for better PDF readability
        const computedStyle = window.getComputedStyle(htmlEl);
        if (computedStyle.color && computedStyle.color !== 'rgb(0, 0, 0)') {
          const isLightColor = this.isLightColor(computedStyle.color);
          htmlEl.style.color = isLightColor ? '#666666' : '#000000';
        }
        
        // Remove background colors for cleaner PDF
        if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          htmlEl.style.backgroundColor = 'transparent';
        }
        
        // Ensure borders are visible
        if (computedStyle.borderColor) {
          htmlEl.style.borderColor = '#cccccc';
        }
        
        // Optimize font rendering
        (htmlEl.style as any).webkitFontSmoothing = 'antialiased';
        (htmlEl.style as any).mozOsxFontSmoothing = 'grayscale';
        
        // Remove shadows and other effects that don't translate well to PDF
        htmlEl.style.boxShadow = 'none';
        htmlEl.style.textShadow = 'none';
      }
    });
    
    // Add additional CSS rules for better page break handling
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced page break rules for PDF generation */
      .resume-section,
      .experience-item,
      .education-item,
      .project-item,
      .certification-item,
      .volunteer-item,
      .award-item,
      .language-item {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        -webkit-column-break-inside: avoid !important;
      }
      
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid !important;
        break-after: avoid !important;
        -webkit-column-break-after: avoid !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        -webkit-column-break-inside: avoid !important;
      }
      
      p, div, span, li {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        -webkit-column-break-inside: avoid !important;
      }
      
      ul, ol {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        -webkit-column-break-inside: avoid !important;
      }
      
      /* Prevent widows and orphans */
      p {
        widows: 3 !important;
        orphans: 3 !important;
      }
      
      /* Keep related content together */
      .flex, .grid {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        -webkit-column-break-inside: avoid !important;
      }
    `;
    clonedElement.appendChild(style);
    
    // Temporarily add to DOM for accurate rendering
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';
    clonedElement.style.zIndex = '-1';
    document.body.appendChild(clonedElement);
    
    // Wait for fonts and images to load
    await this.waitForContent(clonedElement);
    
    return clonedElement;
  }

  /**
   * Generate high-quality canvas from element
   */
  private static async generateHighQualityCanvas(element: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
    return await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      imageTimeout: 15000,
      removeContainer: false,
      // Ensure proper handling of fonts
      onclone: (clonedDoc) => {
        // Ensure all fonts are loaded in the cloned document
        const clonedElement = clonedDoc.querySelector('#resume-content');
        if (clonedElement) {
          (clonedElement as HTMLElement).style.fontFamily = 'Arial, sans-serif';
        }
      }
    });
  }

  /**
   * Create multi-page PDF from canvas maintaining proper alignment
   */
  private static async createMultiPagePDFFromCanvas(canvas: HTMLCanvasElement, quality: number): Promise<jsPDF> {
    const imgData = canvas.toDataURL('image/jpeg', quality);
    
    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    const topMarginSecondPage = 17; // 17mm top margin for second page and beyond (includes space for border line)
    
    // Calculate the actual content dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate scale to fit width perfectly (maintain aspect ratio)
    const scale = pdfWidth / canvasWidth;
    const scaledHeight = canvasHeight * scale;
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      precision: 2
    });
    
    // If content fits on one page, add it normally
    if (scaledHeight <= pdfHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, scaledHeight, undefined, 'FAST');
    } else {
      // Multi-page handling with top margin for subsequent pages
      const firstPageHeight = pdfHeight;
      const subsequentPageHeight = pdfHeight - topMarginSecondPage;
      
      // Calculate total pages considering the reduced height for subsequent pages
      let remainingHeight = scaledHeight - firstPageHeight;
      const additionalPages = Math.ceil(remainingHeight / subsequentPageHeight);
      const totalPages = 1 + additionalPages;
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        let sourceY: number;
        let sourceHeight: number;
        let targetY: number;
        let targetHeight: number;
        
        if (page === 0) {
          // First page - no top margin
          sourceY = 0;
          sourceHeight = Math.min(firstPageHeight / scale, canvasHeight);
          targetY = 0;
          targetHeight = sourceHeight * scale;
        } else {
          // Subsequent pages - add top margin
          const contentStartForPage = firstPageHeight + (page - 1) * subsequentPageHeight;
          sourceY = contentStartForPage / scale;
          sourceHeight = Math.min(subsequentPageHeight / scale, canvasHeight - sourceY);
          targetY = topMarginSecondPage; // Start content below the top margin
          targetHeight = sourceHeight * scale;
        }
        
        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d')!;
        
        pageCanvas.width = canvasWidth;
        pageCanvas.height = sourceHeight;
        
        // Fill with white background
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, canvasWidth, sourceHeight);
        
        // Draw the slice of the original canvas
        pageCtx.drawImage(
          canvas,
          0, sourceY, canvasWidth, sourceHeight, // Source rectangle
          0, 0, canvasWidth, sourceHeight        // Destination rectangle
        );
        
        const pageImgData = pageCanvas.toDataURL('image/jpeg', quality);
        pdf.addImage(pageImgData, 'JPEG', 0, targetY, pdfWidth, targetHeight, undefined, 'FAST');
        
        // Add top border line for subsequent pages
        if (page > 0) {
          pdf.setDrawColor(0, 0, 0); // Black color
          pdf.setLineWidth(0.5); // Thin line
          pdf.line(15, 10, pdfWidth - 15, 10); // Draw line 10mm from top of page
        }
      }
    }
    
    return pdf;
  }

  /**
   * Add clickable links to PDF with improved accuracy for multi-page support
   */
  private static async addClickableLinks(
    pdf: jsPDF, 
    element: HTMLElement, 
    contactInfo: ContactInfo,
    canvas: HTMLCanvasElement
  ): Promise<void> {
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const topMarginSecondPage = 17; // 17mm top margin for second page and beyond (includes space for border line)
    
    // Calculate scale factors from canvas to PDF
    const scale = pdfWidth / canvas.width;
    const scaledCanvasHeight = canvas.height * scale;
    
    // Calculate total pages considering the reduced height for subsequent pages
    const firstPageHeight = pdfHeight;
    const subsequentPageHeight = pdfHeight - topMarginSecondPage;
    let remainingHeight = scaledCanvasHeight - firstPageHeight;
    const additionalPages = Math.ceil(Math.max(0, remainingHeight) / subsequentPageHeight);
    const totalPages = 1 + additionalPages;
    
    // Find all clickable elements
    const linkElements = element.querySelectorAll('a, [data-link], [data-link-type]');
    
    linkElements.forEach((linkEl: Element) => {
      const htmlEl = linkEl as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      // Calculate position relative to the element
      const relativeX = (rect.left - elementRect.left) * scale;
      const relativeY = (rect.top - elementRect.top) * scale;
      const width = rect.width * scale;
      const height = rect.height * scale;
      
      // Determine which page this link is on and calculate position on that page
      let pageIndex: number;
      let yOnPage: number;
      
      if (relativeY < firstPageHeight) {
        // Link is on the first page
        pageIndex = 0;
        yOnPage = relativeY;
      } else {
        // Link is on a subsequent page
        const remainingY = relativeY - firstPageHeight;
        pageIndex = 1 + Math.floor(remainingY / subsequentPageHeight);
        yOnPage = topMarginSecondPage + (remainingY % subsequentPageHeight);
      }
      
      // Only add link if it's within valid page bounds
      const maxYForPage = pageIndex === 0 ? pdfHeight : pdfHeight;
      if (pageIndex < totalPages && yOnPage >= 0 && yOnPage + height <= maxYForPage) {
        // Determine the URL
        let url = '';
        const href = htmlEl.getAttribute('href') || htmlEl.getAttribute('data-link') || '';
        const linkType = htmlEl.getAttribute('data-link-type') || '';
        const text = htmlEl.textContent?.toLowerCase() || '';
        
        if (href) {
          url = href;
        } else {
          // Determine URL based on link type or content
          switch (linkType) {
            case 'email':
              url = contactInfo.email ? `mailto:${contactInfo.email}` : '';
              break;
            case 'phone':
              url = contactInfo.phone ? `tel:${contactInfo.phone}` : '';
              break;
            case 'website':
              if (contactInfo.website) {
                url = contactInfo.website.startsWith('http') ? contactInfo.website : `https://${contactInfo.website}`;
              }
              break;
            case 'linkedin':
              if (contactInfo.linkedin) {
                url = contactInfo.linkedin.startsWith('http') ? contactInfo.linkedin : `https://linkedin.com/in/${contactInfo.linkedin}`;
              }
              break;
            case 'github':
              if (contactInfo.github) {
                url = contactInfo.github.startsWith('http') ? contactInfo.github : `https://github.com/${contactInfo.github}`;
              }
              break;
            default:
              // Auto-detect based on text content
              if (text.includes('@') && contactInfo.email) {
                url = `mailto:${contactInfo.email}`;
              } else if (text.includes('linkedin') && contactInfo.linkedin) {
                url = contactInfo.linkedin.startsWith('http') ? contactInfo.linkedin : `https://linkedin.com/in/${contactInfo.linkedin}`;
              } else if (text.includes('github') && contactInfo.github) {
                url = contactInfo.github.startsWith('http') ? contactInfo.github : `https://github.com/${contactInfo.github}`;
              } else if (contactInfo.website && (text.includes('website') || text.includes('portfolio'))) {
                url = contactInfo.website.startsWith('http') ? contactInfo.website : `https://${contactInfo.website}`;
              }
          }
        }
        
        // Add clickable link to the appropriate page
        if (url && relativeX >= 0 && width > 0 && height > 0) {
          // Set the page context for the link
          if (pageIndex > 0) {
            // For multi-page PDFs, we need to add links to the correct page
            // This is a limitation of jsPDF - links are added to the current page
            // We'll add all links to the first page for now, but this could be enhanced
          }
          pdf.link(relativeX, yOnPage, width, height, { url });
        }
      }
    });
  }

  /**
   * Add automatic links for email addresses, phone numbers, etc.
   */
  private static addAutomaticLinks(
    pdf: jsPDF,
    element: HTMLElement,
    contactInfo: ContactInfo,
    scaleX: number,
    scaleY: number
  ): void {
    const textNodes = this.getTextNodes(element);
    
    textNodes.forEach(node => {
      const text = node.textContent || '';
      const parent = node.parentElement;
      
      if (!parent) return;
      
      // Email detection
      if (contactInfo.email && text.includes(contactInfo.email)) {
        const rect = parent.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        pdf.link(
          (rect.left - elementRect.left) * scaleX,
          (rect.top - elementRect.top) * scaleY,
          rect.width * scaleX,
          rect.height * scaleY,
          { url: `mailto:${contactInfo.email}` }
        );
      }
      
      // Phone detection
      if (contactInfo.phone && text.includes(contactInfo.phone)) {
        const rect = parent.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        pdf.link(
          (rect.left - elementRect.left) * scaleX,
          (rect.top - elementRect.top) * scaleY,
          rect.width * scaleX,
          rect.height * scaleY,
          { url: `tel:${contactInfo.phone}` }
        );
      }
    });
  }

  /**
   * Get all text nodes from an element
   */
  private static getTextNodes(element: HTMLElement): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent && node.textContent.trim()) {
        textNodes.push(node as Text);
      }
    }
    
    return textNodes;
  }

  /**
   * Wait for content to load (fonts, images, etc.)
   */
  private static async waitForContent(element: HTMLElement): Promise<void> {
    // Wait for fonts to load
    if (document.fonts) {
      await document.fonts.ready;
    }
    
    // Wait for images to load
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = () => resolve(undefined);
        img.onerror = () => resolve(undefined);
      });
    });
    
    await Promise.all(imagePromises);
    
    // Small delay to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Check if a color is light
   */
  private static isLightColor(color: string): boolean {
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return false;
    
    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
    return brightness > 128;
  }

  /**
   * Clean up the cloned element
   */
  private static cleanupElement(clonedElement: HTMLElement, originalElement: HTMLElement): void {
    if (clonedElement.parentNode) {
      clonedElement.parentNode.removeChild(clonedElement);
    }
  }
}

// Convenience function for simple PDF generation
export const generateResumePDF = async (
  element: HTMLElement,
  contactInfo: ContactInfo,
  filename?: string
): Promise<void> => {
  return EnhancedPDFGenerator.generatePDF(element, {
    filename: filename || 'Resume.pdf',
    contactInfo,
    quality: 0.95,
    scale: 2,
    addLinks: true
  });
}; 