import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types/auth.types";

// ===== GET ME (restore session) =====
export const useGetMe = () => {
  const { setUser, clearUser, setLoading } = useAuthStore();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const { data } = await authApi.getMe();
        if (data.data?.user) {
          setUser(data.data.user);
        }
        return data.data?.user || null;
      } catch {
        clearUser();
        return null;
      } finally {
        setLoading(false);
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ===== RESEND VERIFICATION =====
export const useResendVerification = () => {
  return useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: (response) => {
      toast.success(response.data.message || "Verification email sent! 📧");
    },
    onError: (error) => {
      const err = error as AxiosError<{ message?: string }>;
      const message =
        err.response?.data?.message || "Failed to resend verification link.";
      toast.error(message);
    },
  });
};

// ===== LOGIN =====
export const useLogin = () => {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const user = response.data.data?.user;
      if (user) {
        setUser(user);
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        toast.success("Welcome back! 👋");
        navigate("/dashboard");
      }
    },
    onError: (error) => {
      const err = error as AxiosError<{ message?: string }>;
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    },
  });
};

// ===== REGISTER =====
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      toast.success(
        response.data.message || "Account created! Check your email."
      );
      navigate("/login");
    },
    onError: (error) => {
      const err = error as AxiosError<{ message?: string }>;
      const message =
        err.response?.data?.message || "Registration failed.";
      toast.error(message);
    },
  });
};

// ===== LOGOUT =====
export const useLogout = () => {
  const { clearUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearUser();
      queryClient.clear();
      toast.success("Logged out");
      navigate("/login");
    },
    onError: () => {
      // Still clear client state on error
      clearUser();
      queryClient.clear();
      navigate("/login");
    },
  });
};

// ===== FORGOT PASSWORD =====
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: (response) => {
      toast.success(
        response.data.message || "Password reset link sent to your email."
      );
    },
    onError: (error) => {
      const err = error as AxiosError<{ message?: string }>;
      const message =
        err.response?.data?.message || "Something went wrong.";
      toast.error(message);
    },
  });
};

// ===== RESET PASSWORD =====
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({
      token,
      data,
    }: {
      token: string;
      data: ResetPasswordRequest;
    }) => authApi.resetPassword(token, data),
    onSuccess: (response) => {
      toast.success(
        response.data.message || "Password reset successful!"
      );
      navigate("/login");
    },
    onError: (error) => {
      const err = error as AxiosError<{ message?: string }>;
      const message =
        err.response?.data?.message || "Reset failed. Token may have expired.";
      toast.error(message);
    },
  });
};

// ===== VERIFY EMAIL =====
export const useVerifyEmail = (token: string) => {
  return useQuery({
    queryKey: ["auth", "verify-email", token],
    queryFn: async () => {
      const { data } = await authApi.verifyEmail(token);
      return data;
    },
    enabled: !!token,
    retry: false,
  });
};
