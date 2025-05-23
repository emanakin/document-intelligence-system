import { apiFetch } from "@/lib/api";
import Cookies from "js-cookie";

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
}

const TOKEN_COOKIE = "di_jwt";
const COOKIE_OPTS = { sameSite: "lax" as const, path: "/", expires: 7 }; // 7 days

const authService = {
  /* ---------- low-level helpers ---------- */
  setToken(token: string) {
    Cookies.set(TOKEN_COOKIE, token, COOKIE_OPTS);
  },
  getToken() {
    return Cookies.get(TOKEN_COOKIE);
  },
  clearToken() {
    Cookies.remove(TOKEN_COOKIE, COOKIE_OPTS);
    Cookies.remove(TOKEN_COOKIE, { path: "/" });
  },

  /* ---------- HIGH-LEVEL API ------------- */
  /** POST /auth/login  (x-www-form-urlencoded) */
  login: async (email: string, password: string) => {
    const { access_token } = await apiFetch<{ access_token: string }>(
      "/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email, // FastAPI's OAuth2PasswordRequestForm «username»
          password,
        }),
      }
    );
    authService.setToken(access_token);
    return authService.fetchUserProfile(); // <- returns User
  },

  /** POST /auth/signup  (json) */
  signup: async (email: string, password: string, fullName: string) => {
    try {
      await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
        }),
      });

      // If signup succeeds, attempt login
      return authService.login(email, password);
    } catch (error) {
      // Properly propagate the error up to the component
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to create account. Please try again.");
      }
    }
  },

  /** GET /auth/users/me   (Bearer) */
  fetchUserProfile: async (): Promise<User> => {
    const token = authService.getToken();
    if (!token) throw new Error("Unauthenticated");
    return apiFetch<User>("/auth/users/me", {}, token);
  },

  logout: () => authService.clearToken(),
};

export default authService;
