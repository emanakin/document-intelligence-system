import { useState, useRef, useEffect } from "react";
import styles from "@/styles/components/upload-area.module.css";

interface UploadAreaProps {
  onFileUpload?: (file: File) => Promise<void>;
  onFileSelect?: (file: File) => void;
  uploadSuccess?: boolean;
}

export default function DocumentUpload({
  onFileSelect,
  uploadSuccess,
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* reset after a successful upload */
  useEffect(() => {
    if (uploadSuccess) {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [uploadSuccess]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  return (
    <div className={styles.uploadContainer}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ""} ${
          selectedFile ? styles.fileSelected : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className={styles.cloudIcon}>☁️</div>

        {selectedFile ? (
          <p className={styles.dropText}>
            Selected:{" "}
            <span className={styles.filename}>{selectedFile.name}</span>
            <br />
            <span>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </p>
        ) : (
          <p className={styles.dropText}>
            Drag & drop files here
            <br />
            <span>or click to browse</span>
          </p>
        )}

        <p className={styles.supportedFormats}>
          (Images, PDFs, Text Files supported)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          className={styles.fileInput}
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.txt"
        />
      </div>
    </div>
  );
}
