"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/pages/integration.module.css";

export default function IntegrationPage() {
  const params = useParams();
  const docId = params.docId as string;

  const documentName = "Invoice_Client_ABC_April.pdf";

  useEffect(() => {
    if (docId) {
      console.log("Integration Doc ID:", docId);
    }
  }, [docId]);

  return (
    <div className={styles.container}>
      <div className={styles.integrationCard}>
        <h1 className={styles.title}>Integration Simulator</h1>
        <p className={styles.subtitle}>
          Simulate sending data from{" "}
          <span className={styles.highlight}>{documentName}</span> to an
          external system.
        </p>

        <div className={styles.formGroup}>
          <label>Target System</label>
          <select className={styles.select}>
            <option>CRM (Customer Relationship Management)</option>
            <option>ERP (Enterprise Resource Planning)</option>
            <option>Accounting System</option>
            <option>Document Management System</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Document ID (Read-only)</label>
          <input
            type="text"
            className={styles.input}
            value="doc_abc123xyz"
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>Client Name (Extracted)</label>
          <input
            type="text"
            className={styles.input}
            defaultValue="ABC Corporation"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Invoice Amount (Extracted)</label>
          <input
            type="text"
            className={styles.input}
            defaultValue="$ 1,250.75"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Invoice Date (Extracted)</label>
          <input
            type="text"
            className={styles.input}
            defaultValue="2025-04-15"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Additional Notes</label>
          <textarea
            className={styles.textarea}
            placeholder="Enter any relevant notes for the target system..."
          ></textarea>
        </div>

        <button className={styles.sendButton}>Simulate Data Send</button>

        <Link href={`/documents/${docId}`} className={styles.backLink}>
          ← Back to Document Detail
        </Link>
      </div>
    </div>
  );
}
