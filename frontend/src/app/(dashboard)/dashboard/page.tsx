"use client";

import Link from "next/link";
import styles from "./dashboard.module.css";
import DocumentUpload from "@/components/document-upload/upload-area";

export default function Dashboard() {
  // Mock document data
  const documents = [
    {
      id: "doc1",
      name: "Invoice_Client_ABC_April.pdf",
      uploaded: "2025-04-14",
      size: "1.2MB",
      type: "Invoice",
      status: "Processed",
    },
    {
      id: "doc2",
      name: "Contract_Project_Omega_Final.pdf",
      uploaded: "2025-04-12",
      size: "350KB",
      type: "Contract",
      status: "Processed",
    },
    {
      id: "doc3",
      name: "Quarterly_Report_Q1_Analysis.pdf",
      uploaded: "2025-04-10",
      size: "15KB",
      type: "Report",
      status: "Error",
    },
    {
      id: "doc4",
      name: "receipt_scan_005.jpg",
      uploaded: "2025-04-15",
      size: "800KB",
      type: "Receipt",
      status: "Processing",
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>DocIntel</h1>
        <div className={styles.userInfo}>
          <span>Welcome, User!</span>
          <div className={styles.avatar}>U</div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.uploadSection}>
          <h2>Upload Document</h2>
          <DocumentUpload />

          <div className={styles.urlInput}>
            <span>or enter URL</span>
            <div className={styles.urlInputGroup}>
              <input
                type="text"
                placeholder="https://example.com/document.pdf"
                className={styles.urlField}
              />
            </div>
          </div>

          <button className={styles.processButton}>Process Document</button>
        </section>

        <section className={styles.documentsList}>
          <h2>Processed Documents</h2>

          <div className={styles.documentsGrid}>
            {documents.map((doc) => (
              <Link
                href={`/documents/${doc.id}`}
                key={doc.id}
                className={styles.documentCard}
              >
                <div className={styles.docIcon}>
                  <span className={styles.fileIcon}>📄</span>
                </div>
                <div className={styles.docInfo}>
                  <h3>{doc.name}</h3>
                  <p>
                    Uploaded: {doc.uploaded} | Size: {doc.size}
                  </p>

                  <div
                    className={`${styles.docStatus} ${
                      styles[doc.status.toLowerCase()]
                    }`}
                  >
                    {doc.status}
                  </div>

                  <p className={styles.docType}>Type: {doc.type}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        © 2025 Document Intelligence System. Prototype Version.
      </footer>
    </div>
  );
}
