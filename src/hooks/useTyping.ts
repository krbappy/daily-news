import { useCallback, useEffect, useRef } from "react";
import { updatePresence } from "../api/presence";
import { useAppStore } from "../store/useAppStore";

const TYPING_DEBOUNCE_MS = 2000;

export function useTyping() {
  const token = useAppStore((s) => s.sessionToken);
  const typingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopTyping = useCallback(() => {
    clearTimer();
    if (!token || !typingRef.current) return;
    typingRef.current = false;
    updatePresence(token, { is_typing: false });
  }, [token]);

  const onType = useCallback(() => {
    if (!token) return;
    if (!typingRef.current) {
      typingRef.current = true;
      updatePresence(token, { is_typing: true });
    }
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      typingRef.current = false;
      updatePresence(token, { is_typing: false });
      timerRef.current = null;
    }, TYPING_DEBOUNCE_MS);
  }, [token]);

  useEffect(() => () => clearTimer(), []);

  return { onType, stopTyping };
}
