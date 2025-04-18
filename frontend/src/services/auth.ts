interface User {
  id: string;
  username?: string;
  email: string;
  full_name?: string;
}

const getApiBaseUrl = () => {
  // Check if we're in production or development
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_API_URL || "";
  }

  return "http://localhost:8000";
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const authService = {
  // Login user and store token
  login: async (email: string, password: string): Promise<void> => {
    try {
      // Create form data for token endpoint (following OAuth2 password flow)
      const formData = new URLSearchParams();
      formData.append("username", email); // Backend uses email as username
      formData.append("password", password);

      const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      // Store the access token
      localStorage.setItem(TOKEN_KEY, data.access_token);

      // Fetch user profile with the token
      await authService.fetchUserProfile();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Register new user
  signup: async (
    email: string,
    password: string,
    fullName: string
  ): Promise<void> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Signup failed");
      }

      // After successful signup, log the user in
      await authService.login(email, password);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  // Fetch user profile using stored token
  fetchUserProfile: async (): Promise<User> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await response.json();
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return localStorage.getItem(TOKEN_KEY) !== null;
  },

  // Get current user from local storage
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get API base URL
  getApiBaseUrl: () => {
    // Check if we're in production or development
    if (process.env.NODE_ENV === "production") {
      return process.env.NEXT_PUBLIC_API_URL || "";
    }
    return "http://localhost:8000";
  },
};

export default authService;
