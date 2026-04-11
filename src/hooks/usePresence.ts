import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { updatePresence } from "../api/presence";
import { useAppStore, type Presence } from "../store/useAppStore";

const HEARTBEAT_MS = 30_000;

export function usePresence(
  currentUserId: string | null,
  otherUserId: string | null
) {
  const token = useAppStore((s) => s.sessionToken);
  const setPresence = useAppStore((s) => s.setPresence);

  // 1. Heartbeat — keep current user marked online
  useEffect(() => {
    if (!currentUserId || !token) return;

    updatePresence(token, { is_online: true });
    const interval = window.setInterval(() => {
      updatePresence(token, { is_online: true });
    }, HEARTBEAT_MS);

    return () => window.clearInterval(interval);
  }, [currentUserId, token]);

  // 2. Subscribe to the other user's presence row via Realtime
  useEffect(() => {
    if (!otherUserId) return;

    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("presence")
        .select("is_online, last_seen, is_typing")
        .eq("user_id", otherUserId)
        .maybeSingle();
      if (!cancelled && data) setPresence(data as Presence);
    })();

    const channel = supabase
      .channel(`presence:${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "presence",
          filter: `user_id=eq.${otherUserId}`,
        },
        (payload) => {
          setPresence(payload.new as Presence);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [otherUserId, setPresence]);
}
