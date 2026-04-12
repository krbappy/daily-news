import { useEffect, useRef } from "react";

const VISIBILITY_GRACE_MS = 5000; // 5s grace for file pickers / camera

export function useAutoLogout(
  onLogout: () => void | Promise<void>,
  isAuthenticated: boolean
) {
  const logoutCalledRef = useRef(false);
  const onLogoutRef = useRef(onLogout);
  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  useEffect(() => {
    if (!isAuthenticated) {
      logoutCalledRef.current = false;
      return;
    }

    const performLogout = async () => {
      if (logoutCalledRef.current) return;
      logoutCalledRef.current = true;
      await onLogoutRef.current();
    };

    // 1. Page Visibility — tab hidden, phone locked, app backgrounded
    //    Use a grace period so file pickers / camera don't trigger logout.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        visibilityTimerRef.current = setTimeout(() => {
          performLogout();
        }, VISIBILITY_GRACE_MS);
      } else {
        // Came back before grace period expired — cancel logout
        if (visibilityTimerRef.current) {
          clearTimeout(visibilityTimerRef.current);
          visibilityTimerRef.current = null;
        }
      }
    };

    // 2. pagehide — tab close, browser close, navigation
    const handlePageHide = () => {
      performLogout();
    };

    // 3. beforeunload — fallback with sendBeacon for reliability.
    // sendBeacon can't set custom headers, so we pass the session token
    // in the request body as JSON (the logout function should accept it
    // from either `x-session-token` header or `token` in body).
    const handleBeforeUnload = () => {
      const token = sessionStorage.getItem("session_token");
      if (!token) return;
      const blob = new Blob([JSON.stringify({ token })], {
        type: "application/json",
      });
      navigator.sendBeacon(
        `${import.meta.env.VITE_FUNCTION_BASE}/logout`,
        blob
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAuthenticated]);

  // On mount: if sessionStorage was cleared (new tab, browser restart),
  // make sure we're logged out even if Zustand thinks otherwise.
  useEffect(() => {
    const token = sessionStorage.getItem("session_token");
    if (!token && isAuthenticated) {
      onLogoutRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
