import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocIntel - Document Intelligence System",
  description: "AI-powered document analysis and management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
