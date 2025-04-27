import { API_BASE_URL } from "./config";

export async function apiFetch<T = unknown>(
  endpoint: string,
  opts: RequestInit = {},
  token?: string
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    credentials: "include", // Include cookies in the request
    mode: "cors", // Enable CORS
    next: { revalidate: 0 }, // don't cache by default
  });

  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.detail || res.statusText);
  }

  // Check if content length is 0 or empty
  const contentLength = res.headers.get("content-length");
  const isEmpty = contentLength === "0" || contentLength === null;

  return isEmpty ? ({} as T) : await res.json();
}
