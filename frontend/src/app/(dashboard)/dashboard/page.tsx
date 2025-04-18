"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import DocumentUpload from "@/components/document-upload/upload-area";
import { useRouter } from "next/navigation";
import authService from "@/services/auth";

// API service with proper routes based on the backend
const documentsApi = {
  getDocuments: async () => {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`${authService.getApiBaseUrl()}/documents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch documents");
    return await response.json();
  },

  uploadDocument: async (file: File, description?: string) => {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    const formData = new FormData();
    formData.append("file", file);

    if (description) {
      formData.append("description", description);
    }

    const response = await fetch(
      `${authService.getApiBaseUrl()}/documents/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Failed to upload document");
    return await response.json();
  },
};

interface Document {
  id: string;
  filename: string;
  created_at: string;
  file_size: number;
  file_type: string;
  status: string;
  description?: string;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingFile, setProcessingFile] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch real documents from API
      const data = await documentsApi.getDocuments();

      // Format the documents if needed
      const formattedDocs = data.map((doc: Document) => ({
        id: doc.id.toString(),
        filename: doc.filename || "Unnamed Document",
        created_at: new Date(doc.created_at).toLocaleDateString(),
        file_size: formatFileSize(doc.file_size || 0),
        file_type: doc.file_type || "PDF",
        status: doc.status || "Uploaded",
        description: doc.description,
      }));

      setDocuments(formattedDocs);
      setError("");
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check authentication and redirect if necessary
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        console.log("User not authenticated, redirecting to login...");
        router.push("/login");
        return;
      }

      setIsAuthChecked(true);

      try {
        // Verify token is still valid by attempting to get user info
        await authService.fetchUserProfile();

        // Then fetch documents
        fetchDocuments();
      } catch (err) {
        console.error("Auth validation error:", err);
        // If token validation fails, log out and redirect
        authService.logout();
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, fetchDocuments]);

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      setUploadSuccess(false);
      await documentsApi.uploadDocument(file);

      // Show success message
      setUploadSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);

      // Refresh document list
      fetchDocuments();
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Clear any previous errors when a new file is selected
    setError("");
  };

  const handleProcessDocument = async () => {
    if (!selectedFile) {
      setError("Please select a file to process");
      return;
    }

    try {
      setProcessingFile(true);
      // Upload document
      const result = await documentsApi.uploadDocument(selectedFile);

      // Show temporary success message
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      // Reset selected file
      setSelectedFile(null);

      // Refresh the documents list
      await fetchDocuments();

      // Redirect to the document viewer page for the newly uploaded document
      router.push(`/documents/${result.id}`);
    } catch (err) {
      console.error("Error processing document:", err);
      setError("Failed to process document. Please try again.");
    } finally {
      setProcessingFile(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  // Don't render anything until we've checked authentication
  if (!isAuthChecked) {
    return <div className={styles.loading}>Checking authentication...</div>;
  }

  const user = authService.getCurrentUser();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>DocIntel</h1>
        <div className={styles.userInfo}>
          <span>Welcome, {user?.full_name || user?.username || "User"}!</span>
          <div
            className={styles.avatar}
            onClick={handleLogout}
            title="Click to logout"
          >
            {user?.full_name?.[0]?.toUpperCase() ||
              user?.username?.[0]?.toUpperCase() ||
              "U"}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.uploadSection}>
          <h2>Upload Document</h2>
          <DocumentUpload
            onFileUpload={handleFileUpload}
            onFileSelect={handleFileSelect}
          />

          <button
            className={styles.processButton}
            onClick={handleProcessDocument}
            disabled={!selectedFile || processingFile}
          >
            {processingFile ? "Processing..." : "Process Document"}
          </button>

          {uploadSuccess && (
            <div className={styles.successMessage}>
              Document uploaded successfully!
            </div>
          )}

          {error && <div className={styles.errorMessage}>{error}</div>}
        </section>

        <section className={styles.documentsList}>
          <h2>Processed Documents</h2>

          {loading && (
            <div className={styles.loading}>Loading documents...</div>
          )}

          {!loading && documents.length === 0 && (
            <div className={styles.emptyState}>
              No documents found. Upload your first document to get started.
            </div>
          )}

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
                  <h3>{doc.filename}</h3>
                  <p>
                    Uploaded: {doc.created_at} | Size: {doc.file_size}
                  </p>

                  <div
                    className={`${styles.docStatus} ${
                      styles[doc.status.toLowerCase()]
                    }`}
                  >
                    {doc.status}
                  </div>

                  <p className={styles.docType}>Type: {doc.file_type}</p>
                  {doc.description && (
                    <p className={styles.docDescription}>{doc.description}</p>
                  )}
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
