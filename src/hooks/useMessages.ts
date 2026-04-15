import { useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAppStore, type Message, type Reaction, type User } from "../store/useAppStore";

const PAGE_SIZE = 50;

export function useMessages() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setMessages = useAppStore((s) => s.setMessages);
  const prependMessages = useAppStore((s) => s.prependMessages);
  const appendMessage = useAppStore((s) => s.appendMessage);
  const updateMessage = useAppStore((s) => s.updateMessage);
  const setLoadingMessages = useAppStore((s) => s.setLoadingMessages);
  const setHasMoreMessages = useAppStore((s) => s.setHasMoreMessages);
  const setLoadingOlder = useAppStore((s) => s.setLoadingOlder);
  const setOtherUser = useAppStore((s) => s.setOtherUser);
  const setReactions = useAppStore((s) => s.setReactions);
  const addReaction = useAppStore((s) => s.addReaction);
  const removeReaction = useAppStore((s) => s.removeReaction);

  const loadOlder = useCallback(async () => {
    const state = useAppStore.getState();
    if (state.isLoadingOlder || !state.hasMoreMessages || state.messages.length === 0) {
      return;
    }
    const oldest = state.messages[0];
    setLoadingOlder(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*, replied_message:reply_to_id(id, content, sender_id, image_url)")
      .lt("created_at", oldest.created_at)
      .not("deleted_by", "cs", `{${state.currentUser!.id}}`)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (!error && data) {
      const older = (data as Message[]).reverse();
      prependMessages(older);
      if (older.length < PAGE_SIZE) setHasMoreMessages(false);
    }
    setLoadingOlder(false);
  }, [prependMessages, setHasMoreMessages, setLoadingOlder]);

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;

    async function load() {
      setLoadingMessages(true);
      setHasMoreMessages(true);

      // Load latest page, newest first, then reverse for display
      const { data, error } = await supabase
        .from("messages")
        .select("*, replied_message:reply_to_id(id, content, sender_id, image_url)")
        .not("deleted_by", "cs", `{${currentUser!.id}}`)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (!cancelled && !error && data) {
        const latest = (data as Message[]).reverse();
        setMessages(latest);
        if (latest.length < PAGE_SIZE) setHasMoreMessages(false);
      }

      const { data: reactionsData } = await supabase
        .from("message_reactions")
        .select("*")
        .order("created_at", { ascending: true });

      if (!cancelled && reactionsData) {
        const grouped: Record<string, Reaction[]> = {};
        for (const r of reactionsData as Reaction[]) {
          if (!grouped[r.message_id]) grouped[r.message_id] = [];
          grouped[r.message_id].push(r);
        }
        setReactions(grouped);
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

    const msgChannel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new as Message & { deleted_by?: string[] };
          if (msg.deleted_by?.includes(currentUser!.id)) return;

          if (msg.reply_to_id) {
            const { data } = await supabase
              .from("messages")
              .select("id, content, sender_id, image_url")
              .eq("id", msg.reply_to_id)
              .maybeSingle();
            if (data) msg.replied_message = data;
          }

          appendMessage(msg);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new as Message & { unsent_at?: string | null };

          if (msg.unsent_at) {
            updateMessage(msg.id, { unsent_at: msg.unsent_at });
            return;
          }

          if (msg.reply_to_id) {
            const { data } = await supabase
              .from("messages")
              .select("id, content, sender_id, image_url")
              .eq("id", msg.reply_to_id)
              .maybeSingle();
            updateMessage(msg.id, {
              reply_to_id: msg.reply_to_id,
              replied_message: data ?? null,
            });
          }
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel("message_reactions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "message_reactions" },
        (payload) => {
          addReaction(payload.new as Reaction);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "message_reactions" },
        (payload) => {
          const old = payload.old as { id: string; message_id: string };
          removeReaction(old.id, old.message_id);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [
    currentUser,
    setMessages,
    appendMessage,
    updateMessage,
    setLoadingMessages,
    setHasMoreMessages,
    setOtherUser,
    setReactions,
    addReaction,
    removeReaction,
  ]);

  return { loadOlder };
}
