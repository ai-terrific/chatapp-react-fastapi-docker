import axios from "axios";
import { SignUpRequest, LoginRequest, User } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const signUp = async (data: SignUpRequest): Promise<User> => {
  const response = await api.post<User>("/auth/sign-up", data);
  return response.data;
};

export const login = async (data: LoginRequest): Promise<User> => {
  const response = await api.post<User>("/auth/login", data);
  return response.data;
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get("/auth/");
    return response.status === 200;
  } catch {
    return false;
  }
};

export default api;
