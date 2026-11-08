const TOKEN_KEY = "auth_token";

export const storageUtils = {
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      // Clean up legacy cookie if present
      document.cookie = `${TOKEN_KEY}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  },
};
