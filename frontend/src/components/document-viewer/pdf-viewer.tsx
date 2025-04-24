"use client";

import "../../polyfills/promise-withResolvers";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import styles from "./pdf-viewer.module.css";

// Set the worker source to the local file in public directory
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFViewerProps {
  fileUrl: string;
  currentPage: number;
  scale?: number;
  onDocumentLoad?: (numPages: number) => void;
}

export default function PDFViewer({
  fileUrl,
  currentPage = 1,
  scale = 1.0,
  onDocumentLoad,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    if (onDocumentLoad) {
      onDocumentLoad(numPages);
    }
  }

  function onLoadError(err: Error) {
    setError(err);
    setLoading(false);
    console.error("Error loading PDF:", err);
  }

  if (!fileUrl) {
    return <div className={styles.pdfError}>No file URL provided</div>;
  }

  return (
    <div className={styles.pdfWrapper}>
      {loading && <div className={styles.pdfLoading}>Loading PDF...</div>}
      {error && (
        <div className={styles.pdfError}>
          Error loading PDF: {error.message}
        </div>
      )}

      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onLoadError}
        loading={null}
        className={styles.pdfDocument}
      >
        <Page
          pageNumber={currentPage}
          scale={scale}
          className={styles.pdfPage}
          loading={null}
          renderTextLayer={false}
          renderAnnotationLayer={false}
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
