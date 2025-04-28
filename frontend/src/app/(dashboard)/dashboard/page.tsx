"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/pages/dashboard.module.css";
import DocumentUpload from "@/components/upload-area";
import DocumentCard from "@/components/document-card";
import { useDashboard } from "../../../hooks/useDashboard";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/user-menu";

export default function Dashboard() {
  /* ---------------- hook data / actions ---------------- */
  const {
    docs,
    loading,
    processing,
    uploadSuccess,
    error,
    fetchDocs,
    uploadDoc,
    processDoc,
    setError,
  } = useDashboard();

  const { user } = useAuth();

  /* ------------------ local ui state ------------------- */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  /* ---------------- authentication check --------------- */
  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  /* ------------------- event handlers ------------------ */
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError("");
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      setError("Please select a file to process");
      return;
    }
    await processDoc(selectedFile);
    setSelectedFile(null);
  };

  /* ---------------------- render ----------------------- */
  return (
    <div className={styles.container}>
      {/* ------------ header ------------ */}
      <header className={styles.header}>
        <h1 className={styles.title}>DocIntel</h1>
        <div className={styles.userInfo}>
          <span>Welcome, {user?.full_name || user?.username}!</span>
          <UserMenu />
        </div>
      </header>

      {/* ------------ main ------------ */}
      <main className={styles.main}>
        {/* upload area */}
        <section className={styles.uploadSection}>
          <h2>Upload Document</h2>

          <DocumentUpload
            onFileUpload={uploadDoc}
            onFileSelect={handleFileSelect}
            uploadSuccess={uploadSuccess}
          />

          <button
            className={styles.processButton}
            onClick={handleProcess}
            disabled={!selectedFile || processing}
          >
            {processing ? "Processing…" : "Process Document"}
          </button>

          {uploadSuccess && (
            <div className={styles.successMessage}>
              Document uploaded successfully!
            </div>
          )}
          {error && <div className={styles.errorMessage}>{error}</div>}
        </section>

        {/* processed docs */}
        <section className={styles.documentsList}>
          <h2>Processed Documents</h2>

          {loading && <div className={styles.loading}>Loading documents…</div>}

          {!loading && docs.length === 0 && (
            <div className={styles.emptyState}>
              No documents found. Upload your first document to get started.
            </div>
          )}

          <div className={styles.documentsGrid}>
            {docs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      </main>

      {/* ------------ footer ------------ */}
      <footer className={styles.footer}>
        © 2025 Document Intelligence System. Prototype Version.
      </footer>
    </div>
  );
}
