import authService from "@/services/auth";
import { API_BASE_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import { DocumentApiResponse } from "@/types";
import { Document } from "@/types/document";

// Document API service
const documentsApi = {
  getDocuments: async (): Promise<Document[]> => {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    return apiFetch<Document[]>("/documents", {}, token);
  },

  getDocument: async (docId: string): Promise<DocumentApiResponse> => {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    return apiFetch<DocumentApiResponse>(`/documents/${docId}`, {}, token);
  },

  uploadDocument: async (
    file: File,
    description?: string
  ): Promise<DocumentApiResponse> => {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    const formData = new FormData();
    formData.append("file", file);

    if (description) {
      formData.append("description", description);
    }

    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      throw new Error(msg.detail || res.statusText);
    }

    return await res.json();
  },
};

export default documentsApi;
