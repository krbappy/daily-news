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
}

export async function sendMessage(
  token: string,
  payload: SendMessagePayload
): Promise<void> {
  const res = await fetch(`${FUNCTION_BASE}/send-message`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send message");
}

export async function deleteMessages(token: string): Promise<void> {
  const res = await fetch(`${FUNCTION_BASE}/delete-messages`, {
    method: "POST",
    headers: headers(token),
  });
  if (!res.ok) throw new Error("Failed to clear messages");
}
