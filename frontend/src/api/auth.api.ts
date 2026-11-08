import { LoginPayload, RegisterPayload, ApiSuccess, AuthResponse } from "@/types/auth.types";
import axios from "axios";

export const authApi = {
  register: async (payload: RegisterPayload): Promise<ApiSuccess<AuthResponse>> => {
    const { data } = await axios.post("/api/auth/register", payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<ApiSuccess<AuthResponse>> => {
    const { data } = await axios.post("/api/auth/login", payload);
    return data;
  },

  logout: async () => {
    const { data } = await axios.post("/api/auth/logout");
    return data;
  },
};
