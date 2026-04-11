import { useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import LoginScreen from "./components/login/LoginScreen";
import ChatScreen from "./components/chat/ChatScreen";
import DecoyPage from "./components/decoy/DecoyPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAppStore } from "./store/useAppStore";
import { useAutoLogout } from "./hooks/useAutoLogout";
import { logout as logoutApi } from "./api/auth";

function AppRoutes() {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const sessionToken = useAppStore((s) => s.sessionToken);
  const clearAuth = useAppStore((s) => s.clearAuth);

  const handleLogout = useCallback(async () => {
    if (sessionToken) {
      await logoutApi(sessionToken);
    }
    clearAuth();
    sessionStorage.clear();
    navigate("/", { replace: true });
  }, [sessionToken, clearAuth, navigate]);

  useAutoLogout(handleLogout, isAuthenticated);

  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/private"
        element={
          <ProtectedRoute>
            <DecoyPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
