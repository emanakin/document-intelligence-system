import { useCallback, useEffect, useState } from "react";
import { DocumentApiResponse, DocumentData } from "@/types";
import documentsApi from "@/services/documents";

export function useDocumentViewer(docId: string) {
  /* ---------------- core state ---------------- */
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrent] = useState(1);
  const [scale, setScale] = useState(1);
  const [totalPages, setTotal] = useState(1);

  /* -------------- data fetching --------------- */
  useEffect(() => {
    if (!docId) return;

    const load = async () => {
      setLoading(true);
      try {
        const raw: DocumentApiResponse = await documentsApi.getDocument(docId);

        const formatted: DocumentData = {
          id: raw.id,
          filename: raw.filename || "Unnamed document",
          pageCount: raw.page_count || 1,
          currentPage: 1,
          created_at: new Date(raw.created_at).toLocaleDateString(),
          file_type: raw.file_type || "PDF",
          file_size: raw.file_size || 0,
          status: raw.status || "Processed",
          file_url: raw.file_url,
          analysis: raw.analysis || {},
        };

        setDocument(formatted);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load document. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [docId]);

  /* -------------- navigation ------------------ */
  const prevPage = useCallback(() => {
    setCurrent((p) => Math.max(p - 1, 1));
  }, []);

  const nextPage = useCallback(() => {
    setCurrent((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  /* -------------- zoom controls --------------- */
  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  /* -------------- pdf loaded ------------------ */
  const onPdfLoad = useCallback((pages: number) => {
    setTotal(pages);
    setCurrent((c) => Math.min(c, pages));

    setDocument((d) => (d ? { ...d, pageCount: pages } : d));
  }, []);

  /* -------------- exports --------------------- */
  return {
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
  };
}

export default useDocumentViewer;
