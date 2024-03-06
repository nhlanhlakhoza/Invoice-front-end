import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-pdf-download',
  templateUrl: './pdf-download.component.html',
  styleUrls: ['./pdf-download.component.css']
})
export class PdfDownloadComponent {
  @ViewChild('pdfViewer')
  pdfViewer!: ElementRef;
  pdfSrc: string = 'http://localhost:8081/user/download/pdf/18'; // Default PDF URL
  constructor(private http: HttpClient) { }

  downloadPdf(pdfId: number): void {
    const url = `http://localhost:8081/user/download/pdf/${pdfId}`;
    this.downloadFile(url, `document_${pdfId}.pdf`);
  }

  viewPdf(pdfId: number): void {
    const url = `http://localhost:8081/user/download/pdf/${pdfId}`;
    this.displayPdfInline(url);
  }

  printPdf(pdfId: number): void {
    const url = `http://localhost:8081/user/download/pdf/${pdfId}`;
    this.displayPdfInline(url, true);
  }

  private downloadFile(url: string, filename: string): void {
    this.http.get(url, { responseType: 'blob' }).subscribe(
      (data: Blob) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const blobUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(blobUrl);
      },
      error => {
        console.error('Error downloading PDF:', error);
      }
    );
  }

  private displayPdfInline(url: string, printMode: boolean = false): void {
    const iframe = this.pdfViewer.nativeElement;
    iframe.src = url;
    
    // Wait for the PDF to load before printing if printMode is true
    if (printMode) {
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };
    }
  }
}
