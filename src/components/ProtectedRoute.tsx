import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("session_token")
      : null;

  if (!token || !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
