"use client";

import Link from "next/link";
import styles from "./analysis-dashboard.module.css";
import { DocumentData, DocumentAnalysis } from "@/types";

interface AnalysisDashboardProps {
  docId: string;
  documentData?: DocumentData;
}

export default function AnalysisDashboard({
  docId,
  documentData,
}: AnalysisDashboardProps) {
  // Use document analysis data if available, otherwise use mock data
  const mockAnalysis: DocumentAnalysis = {
    invoiceNumber: "INV-2025-04-123",
    clientName: "ABC Corporation",
    invoiceDate: "2025-04-15",
    dueDate: "2025-05-15",
    totalAmount: "$ 1,250.75 CAD",
    classification: "Invoice",
    fraudCheck: {
      status: "Potential Tampering Detected",
      details: "Signature area flagged for review",
    },
    insights:
      "The total amount is slightly above the average for this client over the last 6 months. The payment terms are standard (Net 30). No unusual line items detected compared to previous invoices.",
  };

  const analysis = documentData?.analysis
    ? {
        ...documentData.analysis,
      }
    : mockAnalysis;

  console.log("Analysis dashboard using data:", analysis);

  return (
    <div className={styles.analysisContainer}>
      <section className={styles.analysisSection}>
        <h2 className={styles.sectionTitle}>Analysis Dashboard</h2>

        <div className={styles.dataGrid}>
          <div className={styles.dataItem}>
            <h3>Invoice Number</h3>
            <p>{analysis.invoiceNumber}</p>
          </div>

          <div className={styles.dataItem}>
            <h3>Client Name</h3>
            <p>{analysis.clientName}</p>
          </div>

          <div className={styles.dataItem}>
            <h3>Invoice Date</h3>
            <p>{analysis.invoiceDate}</p>
          </div>

          <div className={styles.dataItem}>
            <h3>Due Date</h3>
            <p>{analysis.dueDate}</p>
          </div>

          <div className={styles.dataItem}>
            <h3>Total Amount</h3>
            <p>{analysis.totalAmount}</p>
          </div>
        </div>

        <div className={styles.classificationsContainer}>
          <div className={styles.classification}>
            <h3>Classification:</h3>
            <span>{analysis.classification}</span>
          </div>

          {analysis.fraudCheck && (
            <div className={styles.fraudCheck}>
              <h3>Fraud Check:</h3>
              <span className={styles.fraudAlert}>
                {analysis.fraudCheck.status}
              </span>
              <p className={styles.fraudDetails}>
                ({analysis.fraudCheck.details})
              </p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.insightsSection}>
        <h2 className={styles.sectionTitle}>Insights</h2>
        <p className={styles.insightsText}>{analysis.insights}</p>

        <div className={styles.dataVisualization}>
          [ Data Visualization Placeholder - e.g., Chart.js ]
        </div>

        <Link
          href={`/integrations/${docId}`}
          className={styles.integrateButton}
        >
          Simulate Integration
        </Link>
      </section>
    </div>
  );
}
