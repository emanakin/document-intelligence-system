export type DocStatus = "uploaded" | "processing" | "failed";

export interface Document {
  id: string;
  filename: string;
  created_at: string;
  file_size: number;
  file_type: string;
  status: DocStatus;
  description?: string;
}

// Document Types
export interface DocumentData {
  id: string;
  filename: string;
  pageCount: number;
  currentPage: number;
  created_at: string;
  file_type: string;
  file_size: number;
  status: string;
  file_url?: string;
  analysis?: DocumentAnalysis;
  description?: string;
}

// Analysis Types
export interface DocumentAnalysis {
  invoiceNumber?: string;
  clientName?: string;
  invoiceDate?: string;
  dueDate?: string;
  totalAmount?: string;
  classification?: string;
  fraudCheck?: {
    status: string;
    details: string;
  };
  insights?: string;
}

// API Response Types
export interface DocumentApiResponse {
  id: string;
  filename: string;
  page_count?: number;
  created_at: string;
  file_size?: number;
  file_type?: string;
  status?: string;
  file_url?: string;
  analysis?: DocumentAnalysis;
  description?: string;
}
