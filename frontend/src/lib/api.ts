import authService from "@/services/auth";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const url = `${baseUrl}${endpoint}`;

  // Set headers with content-type if not already set
  const headers = new Headers(options.headers);
  if (
    !headers.has("Content-Type") &&
    options.method !== "GET" &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      mode: "cors",
      credentials: "include",
      next: { revalidate: 0 },
    });

    if (response.status === 401) {
      console.log("Token expired or invalid - logging out");
      authService.clearToken();

      window.location.href = "/login?p=" + window.location.pathname;

      // Throw error to prevent further processing
      throw new Error("Unauthorized - session expired");
    }

    if (!response.ok) {
      let errorMessage = `Error: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (parseError) {
        console.log("Error parsing error response:", parseError);
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T; // No content
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Network error");
    }
  }
}
