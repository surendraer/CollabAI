import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { useAuthStore } from "@/store/auth.store";

// Pages
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import DashboardPage from "@/pages/DashboardPage";
import WorkspaceBoardPage from "@/pages/WorkspaceBoardPage";
import WorkspaceChatPage from "@/pages/WorkspaceChatPage";
import WorkspaceAnalyticsPage from "@/pages/WorkspaceAnalyticsPage";
import WorkspaceSettingsPage from "@/pages/WorkspaceSettingsPage";
import JoinWorkspacePage from "@/pages/JoinWorkspacePage";
import WorkspaceNotesPage from "@/pages/WorkspaceNotesPage";
import WorkspaceFilesPage from "@/pages/WorkspaceFilesPage";
import LabCalendarPage from "@/pages/LabCalendarPage";
import DMsPage from "@/pages/DMsPage";

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth routes — guest only */}
      <Route
        element={
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Email verification — accessible to everyone */}
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/join/:token" element={<JoinWorkspacePage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects/:projectId" element={<WorkspaceBoardPage />} />
          <Route path="/notes" element={<WorkspaceNotesPage />} />
          <Route path="/files" element={<WorkspaceFilesPage />} />
          <Route path="/calendar" element={<LabCalendarPage />} />
          <Route path="/dms" element={<DMsPage />} />
          <Route path="/chat" element={<WorkspaceChatPage />} />
          <Route path="/analytics" element={<WorkspaceAnalyticsPage />} />
          <Route path="/settings" element={<WorkspaceSettingsPage />} />
        </Route>
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
