import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "@/types/auth.types";
import { storageUtils } from "@/utils/storage";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      storageUtils.setToken(action.payload.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    initializeAuth: (state) => {
      const token = storageUtils.getToken();
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              state.user = JSON.parse(storedUser);
            } catch {
              state.user = null;
            }
          }
        }
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      storageUtils.removeToken();
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
    },
  },
});

export const { setCredentials, initializeAuth, logout } = authSlice.actions;
export default authSlice.reducer;
