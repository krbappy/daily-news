import { useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import HomeScreen from "./components/home/HomeScreen";
import LoginScreen from "./components/login/LoginScreen";
import ChatScreen from "./components/chat/ChatScreen";
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
      <Route path="/" element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatScreen />
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
