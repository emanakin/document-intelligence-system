import Link from "next/link";
import styles from "./document-viewer.module.css";
import AnalysisDashboard from "@/components/analysis/analysis-dashboard";

export default function DocumentPage({
  params,
}: {
  params: { docId: string };
}) {
  // Mock document data based on the docId
  const document = {
    id: params.docId,
    name: "Invoice_Client_ABC_April.pdf",
    pageCount: 5,
    currentPage: 1,
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.documentTitle}>{document.name}</h1>
        <div className={styles.breadcrumbs}>
          <Link href="/dashboard">Dashboard</Link> / {document.name}
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.viewerContainer}>
          <div className={styles.toolbar}>
            <button className={styles.toolbarButton}>-</button>
            <button className={styles.toolbarButton}>+</button>
            <button className={styles.toolbarButton}>🖌️</button>
            <div className={styles.spacer}></div>
            <div className={styles.pagination}>
              Page {document.currentPage} of {document.pageCount}
            </div>
            <div className={styles.spacer}></div>
            <button className={styles.toolbarButton}>⬅️</button>
            <button className={styles.toolbarButton}>➡️</button>
          </div>

          <div className={styles.documentViewer}>
            {/* Document content placeholder */}
            <div className={styles.documentPlaceholder}>
              <div className={styles.highlightedArea}></div>
              <div className={styles.placeholderText}>
                [ Document Content Placeholder ]
                <br />
                (PDF/Image/Text would render here)
              </div>
            </div>
          </div>
        </div>

        <AnalysisDashboard docId={params.docId} />
      </div>
    </div>
  );
}
