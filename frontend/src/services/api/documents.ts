import authService from "@/services/auth";

// Document API service
const documentsApi = {
  getDocuments: async () => {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`${authService.getApiBaseUrl()}/documents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch documents");
    return await response.json();
  },

  getDocument: async (docId: string) => {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(
      `${authService.getApiBaseUrl()}/documents/${docId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch document");
    return await response.json();
  },

  uploadDocument: async (file: File, description?: string) => {
    const token = authService.getToken();
    if (!token) throw new Error("Authentication required");

    const formData = new FormData();
    formData.append("file", file);

    if (description) {
      formData.append("description", description);
    }

    const response = await fetch(
      `${authService.getApiBaseUrl()}/documents/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Failed to upload document");
    return await response.json();
  },
};

export default documentsApi;
