import { supabase } from "../lib/supabase";

const FUNCTION_BASE = import.meta.env.VITE_FUNCTION_BASE as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function headers(token: string) {
  return {
    "Content-Type": "application/json",
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    "x-session-token": token,
  };
}

export interface SendMessagePayload {
  content: string | null;
  image_url?: string | null;
  reply_to_id?: string | null;
}

export async function sendMessage(
  token: string,
  payload: SendMessagePayload
): Promise<void> {
  const { reply_to_id, ...rest } = payload;

  const res = await fetch(`${FUNCTION_BASE}/send-message`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(rest),
  });
  if (!res.ok) throw new Error("Failed to send message");

  // Edge Function doesn't handle reply_to_id, so we patch it directly.
  // Find the most recent message by this sender and set reply_to_id.
  if (reply_to_id) {
    // Small delay to let the INSERT propagate
    await new Promise((r) => setTimeout(r, 300));

    const { data } = await supabase
      .from("messages")
      .select("id")
      .eq("content", rest.content ?? "")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      await supabase
        .from("messages")
        .update({ reply_to_id })
        .eq("id", data.id);
    }
  }
}

export async function unsendMessage(
  token: string,
  messageId: string
): Promise<void> {
  const res = await fetch(`${FUNCTION_BASE}/unsend-message`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ message_id: messageId }),
  });
  if (!res.ok) throw new Error("Failed to unsend message");
}

export async function deleteMessages(token: string): Promise<void> {
  const res = await fetch(`${FUNCTION_BASE}/delete-messages`, {
    method: "POST",
    headers: headers(token),
  });
  if (!res.ok) throw new Error("Failed to clear messages");
}
