import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAppStore, type Message, type Reaction, type User } from "../store/useAppStore";

export function useMessages() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setMessages = useAppStore((s) => s.setMessages);
  const appendMessage = useAppStore((s) => s.appendMessage);
  const updateMessage = useAppStore((s) => s.updateMessage);
  const setLoadingMessages = useAppStore((s) => s.setLoadingMessages);
  const setOtherUser = useAppStore((s) => s.setOtherUser);
  const setReactions = useAppStore((s) => s.setReactions);
  const addReaction = useAppStore((s) => s.addReaction);
  const removeReaction = useAppStore((s) => s.removeReaction);

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;

    async function load() {
      setLoadingMessages(true);

      // Fetch messages with replied-to message data
      const { data, error } = await supabase
        .from("messages")
        .select("*, replied_message:reply_to_id(id, content, sender_id, image_url)")
        .not("deleted_by", "cs", `{${currentUser!.id}}`)
        .order("created_at", { ascending: true });

      if (!cancelled && !error && data) {
        setMessages(data as Message[]);
      }

      // Fetch all reactions
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

    // Subscribe to new + updated messages
    const msgChannel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new as Message & { deleted_by?: string[] };
          if (msg.deleted_by?.includes(currentUser!.id)) return;

          // If it's a reply, fetch the replied-to message
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
          const msg = payload.new as Message;

          // When reply_to_id is set via the post-send patch, fetch replied message
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

    // Subscribe to reaction changes
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
    setOtherUser,
    setReactions,
    addReaction,
    removeReaction,
  ]);
}
