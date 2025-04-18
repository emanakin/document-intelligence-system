import { useState, useRef } from "react";
import styles from "./upload-area.module.css";

export default function DocumentUpload() {
  const [isDragging, setIsDragging] = useState(false);
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

    // Handle file upload logic here
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      console.log("Files dropped:", files);
      // Process files
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("Files selected:", files);
      // Process files
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className={styles.cloudIcon}>☁️</div>
        <p className={styles.dropText}>
          Drag & drop files here
          <br />
          <span>or click to browse</span>
        </p>
        <p className={styles.supportedFormats}>
          (Images, PDFs, Text Files supported)
        </p>
        <input
          type="file"
          ref={fileInputRef}
          className={styles.fileInput}
          onChange={handleFileSelect}
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.txt"
        />
      </div>
    </div>
  );
}
