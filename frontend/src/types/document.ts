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
