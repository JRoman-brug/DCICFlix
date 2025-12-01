import api from "../axios.config";
import type { AuthResponse } from "./auth.types";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  const { data } = await api.post<AuthResponse>("/auth/login", credentials);
  if (data.token) {
    localStorage.setItem("jwt_token", data.token);
    localStorage.setItem("email_data", JSON.stringify(data.email));
  }
  return data;
};

export const register = async (userData: RegisterCredentials) => {
  const { data } = await api.post<AuthResponse>("/auth/register", userData);
  if (data.token) {
    localStorage.setItem("jwt_token", data.token);
    localStorage.setItem("email_data", JSON.stringify(data.email));
  }
  return data;
};

export const logout = async () => {
  try {
    await api.post("/auth/logout"); 
  } catch (error) {
    console.warn("Logout failed (probably token expired). Clearing local session...");
  }
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("email_data");
};
