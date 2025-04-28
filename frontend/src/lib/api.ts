import authService from "@/services/auth";

export async function apiFetch<T = unknown>(
  endpoint: string,
  opts: RequestInit = {},
  token?: string
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const url = `${baseUrl}${endpoint}`;

  // Set up headers with authentication if token provided
  const headers = new Headers(opts.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...opts,
    headers,
    credentials: "include",
    mode: "cors",
    next: { revalidate: 0 },
  });

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    console.log("Token expired or invalid - logging out");
    authService.clearToken();

    window.location.href = "/login?p=" + window.location.pathname;

    // Throw error to prevent further processing
    throw new Error("Unauthorized - session expired");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  // Check if content length is 0 or empty
  const contentLength = response.headers.get("content-length");
  const isEmpty = contentLength === "0" || contentLength === null;

  return isEmpty ? ({} as T) : await response.json();
}
