"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "@/styles/pages/document-viewer.module.css";

import PDFViewer from "@/components/document-viewer/pdf-viewer";
import AnalysisDashboard from "@/components/analysis/analysis-dashboard";
import { useAuth } from "@/context/AuthContext";
import useDocumentViewer from "../useDocumentViewer";

export default function DocumentPage() {
  const { docId } = useParams<{ docId: string }>();
  const { loading: authLoading } = useAuth();

  const {
    document,
    loading,
    error,
    currentPage,
    totalPages,
    scale,
    prevPage,
    nextPage,
    zoomIn,
    zoomOut,
    onPdfLoad,
  } = useDocumentViewer(docId);

  if (authLoading || loading) {
    return <div className={styles.loading}>Loading document …</div>;
  }

  if (error || !document) {
    return (
      <div className={styles.error}>
        <p>{error || "Document not found"}</p>
        <Link href="/dashboard">Return to dashboard</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* header */}
      <header className={styles.header}>
        <h1 className={styles.documentTitle}>{document.filename}</h1>
        <div className={styles.breadcrumbs}>
          <Link href="/dashboard">Dashboard</Link> / {document.filename}
        </div>
      </header>

      {/* main content */}
      <div className={styles.content}>
        <div className={styles.viewerContainer}>
          {/* toolbar */}
          <div className={styles.toolbar}>
            <button onClick={zoomOut} className={styles.toolbarButton}>
              −
            </button>
            <button onClick={zoomIn} className={styles.toolbarButton}>
              +
            </button>
            <div className={styles.spacer} />
            <div className={styles.pagination}>
              Page {currentPage} of {totalPages}
            </div>
            <div className={styles.spacer} />
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={styles.toolbarButton}
            >
              ⬅
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={styles.toolbarButton}
            >
              ➡
            </button>
          </div>

          {/* viewer */}
          <div className={styles.documentViewer}>
            {document.file_url ? (
              document.file_type?.toLowerCase() === "pdf" ? (
                <PDFViewer
                  fileUrl={document.file_url}
                  currentPage={currentPage}
                  scale={scale}
                  onDocumentLoad={onPdfLoad}
                />
              ) : (
                <iframe
                  src={document.file_url}
                  className={styles.documentFrame}
                  title={document.filename}
                />
              )
            ) : (
              <div className={styles.documentPlaceholder}>
                <div className={styles.highlightedArea} />
                <div className={styles.placeholderText}>
                  [ Document content placeholder ]
                </div>
              </div>
            )}
          </div>
        </div>

        <AnalysisDashboard docId={docId} documentData={document} />
      </div>
    </div>
  );
}
