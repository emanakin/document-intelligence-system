import { useState, useRef } from "react";
import styles from "./upload-area.module.css";

interface UploadAreaProps {
  onFileUpload: (file: File) => Promise<void>;
  onFileSelect?: (file: File) => void;
}

export default function DocumentUpload({ onFileSelect }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
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
          type="file"
          ref={fileInputRef}
          className={styles.fileInput}
          onChange={handleFileSelect}
          multiple={false}
          accept=".pdf,.jpg,.jpeg,.png,.txt"
        />
      </div>
    </div>
  );
}
