"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import styles from "./pdf-viewer.module.css";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  currentPage: number;
}

export default function PDFViewer({ fileUrl, currentPage }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    setError("Failed to load the PDF document.");
    setLoading(false);
  }

  return (
    <div className={styles.pdfWrapper}>
      {loading && <div className={styles.pdfLoading}>Loading PDF...</div>}
      {error && <div className={styles.pdfError}>{error}</div>}

      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<div className={styles.pdfLoading}>Loading PDF...</div>}
        error={
          <div className={styles.pdfError}>Failed to load PDF document.</div>
        }
        className={styles.pdfDocument}
      >
        <Page
          pageNumber={currentPage}
          className={styles.pdfPage}
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Document>

      {numPages && (
        <div className={styles.pageInfo}>
          Page {currentPage} of {numPages}
        </div>
      )}
    </div>
  );
}
