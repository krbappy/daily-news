const FUNCTION_BASE = import.meta.env.VITE_FUNCTION_BASE as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface PresenceUpdate {
  is_online?: boolean;
  is_typing?: boolean;
}

export async function updatePresence(
  token: string,
  payload: PresenceUpdate
): Promise<void> {
  await fetch(`${FUNCTION_BASE}/update-presence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "x-session-token": token,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
