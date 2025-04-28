"use client";

import Link from "next/link";
import styles from "@/styles/components/document-card.module.css";
import { Document } from "@/types/document";
import useAnalysisProgress from "@/hooks/useAnalysisProgress";
import { formatDate, formatFileSize } from "@/utils/format";

interface Props {
  doc: Document;
}

export default function DocumentCard({ doc }: Props) {
  /* 1.  Determine running state  --------------------------------------- */
  // treat uploaded / queued as still processing until WS says 100 %
  const isProcessingStatus =
    doc.status === "processing" || doc.status === "uploaded";

  /* 2.  Wire to WebSocket ------------------------------------------------ */
  const progress = useAnalysisProgress(doc.id.toString(), isProcessingStatus);

  /* 3.  Decide what to display ------------------------------------------ */
  const showProgressBar = isProcessingStatus && progress.percent < 100;

  // file size etc.
  const formattedSize = formatFileSize(doc.file_size);

  const classes = [
    styles.card,
    isProcessingStatus && styles.processing,
    styles.fadeIn,
  ]
    .filter(Boolean)
    .join(" ");

  /* 4.  UI --------------------------------------------------------------- */
  const body = (
    <>
      <span className={styles.fileIcon}>📄</span>
      <h3 className={styles.filename}>{doc.filename}</h3>
      <p className={styles.uploaded}>
        Uploaded: {formatDate(doc.created_at)} | Size: {formattedSize}
      </p>

      {/* progress ------------------------------------------------------- */}
      {showProgressBar && (
        <div className={styles.progressBox}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress.percent ?? 0}%` }}
            />
          </div>
          <div className={styles.docStatus}>
            {progress.message || "Processing…"}
          </div>
        </div>
      )}

      {/* final state badge --------------------------------------------- */}
      {!showProgressBar && (
        <>
          {doc.status === "failed" ? (
            <div className={styles.docStatus} style={{ color: "red" }}>
              Failed
            </div>
          ) : (
            <div className={`${styles.docStatus} ${styles.processed}`}>
              Completed
            </div>
          )}
        </>
      )}
    </>
  );

  /* 5.  Disable click while still processing --------------------------- */
  return isProcessingStatus && progress.percent < 100 ? (
    <div className={classes}>{body}</div>
  ) : (
    <Link href={`/documents/${doc.id}`} className={classes}>
      {body}
    </Link>
  );
}
