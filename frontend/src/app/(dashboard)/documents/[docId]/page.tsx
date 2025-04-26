"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import styles from "./document-viewer.module.css";
import AnalysisDashboard from "@/components/analysis/analysis-dashboard";
import authService from "@/services/auth";
import { DocumentData, DocumentApiResponse } from "@/types";
import PDFViewer from "@/components/document-viewer/pdf-viewer";
import documentsApi from "@/services/api/documents";

export default function DocumentPage() {
  const params = useParams();
  const docId = params.docId as string;

  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    // Check authentication and load document
    const loadDocument = async () => {
      if (!authService.isAuthenticated()) {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        // Fetch the document data using the imported service
        const docData: DocumentApiResponse = await documentsApi.getDocument(
          docId
        );

        // Format the document data
        setDocument({
          id: docData.id,
          filename: docData.filename || "Unnamed Document",
          pageCount: docData.page_count || 1,
          currentPage: 1,
          created_at: new Date(docData.created_at).toLocaleDateString(),
          file_type: docData.file_type || "PDF",
          file_size: docData.file_size || 0,
          status: docData.status || "Processed",
          file_url: docData.file_url,
          analysis: docData.analysis || {},
        });
      } catch (err) {
        console.error("Error loading document:", err);
        setError("Failed to load document. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Ensure docId is available before attempting to load
    if (docId) {
      loadDocument();
    }
  }, [docId, router]);

  useEffect(() => {
    if (document) {
      console.log("Document state updated:", document);
      console.log("File URL:", document.file_url);

      if (document.file_url) {
        console.log("Attempting to fetch PDF from:", document.file_url);

        // Explicitly try to fetch the file to verify the endpoint
        fetch(document.file_url)
          .then((response) => {
            console.log(
              "PDF fetch response:",
              response.status,
              response.statusText
            );
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            return response.blob();
          })
          .then((blob) => {
            console.log("PDF fetched successfully, size:", blob.size, "bytes");
          })
          .catch((error) => {
            console.error("PDF fetch failed:", error);
          });
      }
    }
  }, [document]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  const handleDocumentLoad = (numPages: number) => {
    setTotalPages(numPages);
    if (document) {
      setDocument({
        ...document,
        pageCount: numPages,
      });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading document...</div>;
  }

  if (error || !document) {
    return (
      <div className={styles.error}>
        <p>{error || "Document not found"}</p>
        <Link href="/dashboard">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.documentTitle}>{document.filename}</h1>
        <div className={styles.breadcrumbs}>
          <Link href="/dashboard">Dashboard</Link> / {document.filename}
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.viewerContainer}>
          <div className={styles.toolbar}>
            <button
              className={styles.toolbarButton}
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              -
            </button>
            <button
              className={styles.toolbarButton}
              onClick={handleZoomIn}
              title="Zoom In"
            >
              +
            </button>
            <button className={styles.toolbarButton} title="Annotation">
              🖌️
            </button>
            <div className={styles.spacer}></div>
            <div className={styles.pagination}>
              Page {currentPage} of {document.pageCount}
            </div>
            <div className={styles.spacer}></div>
            <button
              className={styles.toolbarButton}
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              ⬅️
            </button>
            <button
              className={styles.toolbarButton}
              onClick={handleNextPage}
              disabled={currentPage === document.pageCount}
              title="Next Page"
            >
              ➡️
            </button>
          </div>

          <div className={styles.documentViewer}>
            {document.file_url ? (
              document.file_type?.toLowerCase() === "pdf" ? (
                <div className={styles.pdfContainer}>
                  <PDFViewer
                    fileUrl={document.file_url}
                    currentPage={currentPage}
                    scale={scale}
                    onDocumentLoad={handleDocumentLoad}
                  />
                </div>
              ) : (
                <iframe
                  src={document.file_url}
                  className={styles.documentFrame}
                  title={document.filename}
                />
              )
            ) : (
              <div className={styles.documentPlaceholder}>
                <div className={styles.highlightedArea}></div>
                <div className={styles.placeholderText}>
                  [ Document Content Placeholder ]
                  <br />
                  (PDF/Image/Text would render here)
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
