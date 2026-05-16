import api from "./axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types/auth.types";

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data),

  logout: () => api.post<ApiResponse>("/auth/logout"),

  getMe: () => api.get<ApiResponse<AuthResponse>>("/auth/me"),

  refreshToken: () => api.post<ApiResponse>("/auth/refresh"),

  verifyEmail: (token: string) =>
    api.get<ApiResponse<AuthResponse>>(`/auth/verify-email/${token}`),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse>("/auth/forgot-password", data),

  resetPassword: (token: string, data: ResetPasswordRequest) =>
    api.post<ApiResponse>(`/auth/reset-password/${token}`, data),
};
