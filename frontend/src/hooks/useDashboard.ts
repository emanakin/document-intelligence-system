import { useCallback, useState } from "react";
import { Document } from "@/types/document";
import documentsApi from "@/services/documents";

export function useDashboard() {
  /* ----------------------- state ----------------------- */
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  /* ------------------- data fetching ------------------- */
  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentsApi.getDocuments();
      // keep raw, format in the view layer
      setDocs(data);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Could not load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- regular upload ---------------------- */
  const uploadDoc = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        setUploadSuccess(false);
        await documentsApi.uploadDocument(file);

        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3_000);

        await fetchDocs();
      } catch (e) {
        console.error(e);
        setError("Could not upload file");
      } finally {
        setLoading(false);
      }
    },
    [fetchDocs]
  );

  /* --------------- optimistic "process" ---------------- */
  const processDoc = useCallback(
    async (file: File) => {
      // Get the predicted next ID based on current documents
      const getNextId = () => {
        if (docs.length === 0) return "1";

        // Find the highest numeric ID and add 1
        const maxId = Math.max(
          ...docs
            .map((d) => parseInt(d.id.toString()))
            .filter((id) => !isNaN(id))
        );

        return (maxId + 1).toString();
      };

      // Use the predicted next ID instead of a temp ID
      const predictedId = getNextId();

      // Create placeholder with the predicted ID
      const placeholder: Document = {
        id: predictedId,
        filename: file.name,
        created_at: new Date().toISOString(),
        file_size: file.size,
        file_type: file.type || "application/pdf",
        status: "processing",
      };
      setDocs((prev) => [placeholder, ...prev]);

      try {
        setProcessing(true);
        const real = await documentsApi.uploadDocument(file);

        if (real.id.toString() !== predictedId) {
          setDocs((prev) => [
            {
              id: real.id.toString(),
              filename: real.filename,
              created_at: real.created_at,
              file_size: real.file_size ?? 0,
              file_type: real.file_type ?? "unknown",
              status: "processing",
            },
            ...prev.filter((d) => d.id !== predictedId),
          ]);
        } else {
          setDocs((prev) =>
            prev.map((d) =>
              d.id === predictedId ? { ...d, status: "processing" } : d
            )
          );
        }

        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 1000);
      } catch (e) {
        console.error(e);
        setError("Failed to process document");
        setDocs((prev) =>
          prev.map((d) =>
            d.id === predictedId ? { ...d, status: "failed" } : d
          )
        );
      } finally {
        setProcessing(false);
      }
    },
    [docs]
  );

  /* ------------------- exposed api --------------------- */
  return {
    docs,
    loading,
    processing,
    uploadSuccess,
    error,
    fetchDocs,
    uploadDoc,
    processDoc,
    setError,
  };
}
