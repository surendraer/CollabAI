export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "admin";
  isVerified: boolean;
  provider: "local" | "google";
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T = undefined> {
  status: "success" | "fail" | "error";
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  user: User;
}
