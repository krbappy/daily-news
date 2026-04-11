import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAppStore, type Message, type User } from "../store/useAppStore";

export function useMessages() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setMessages = useAppStore((s) => s.setMessages);
  const appendMessage = useAppStore((s) => s.appendMessage);
  const setLoadingMessages = useAppStore((s) => s.setLoadingMessages);
  const setOtherUser = useAppStore((s) => s.setOtherUser);

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;

    async function load() {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .not("deleted_by", "cs", `{${currentUser!.id}}`)
        .order("created_at", { ascending: true });

      if (!cancelled && !error && data) {
        setMessages(data as Message[]);
      }
      if (!cancelled) setLoadingMessages(false);
    }

    async function loadOtherUser() {
      const { data } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_color")
        .neq("id", currentUser!.id)
        .limit(1)
        .maybeSingle();
      if (!cancelled && data) setOtherUser(data as User);
    }

    load();
    loadOtherUser();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message & { deleted_by?: string[] };
          if (msg.deleted_by?.includes(currentUser!.id)) return;
          appendMessage(msg);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [
    currentUser,
    setMessages,
    appendMessage,
    setLoadingMessages,
    setOtherUser,
  ]);
}
