import type { User } from "../store/useAppStore";

const FUNCTION_BASE = import.meta.env.VITE_FUNCTION_BASE as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface LoginResponse {
  token: string;
  passwordType: "A" | "B";
  user: User;
  otherUser?: User;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${FUNCTION_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Invalid username or password");
  }

  return res.json();
}

export async function logout(token: string): Promise<void> {
  await fetch(`${FUNCTION_BASE}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "x-session-token": token,
    },
  }).catch(() => {});
}
