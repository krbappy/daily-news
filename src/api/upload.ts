const FUNCTION_BASE = import.meta.env.VITE_FUNCTION_BASE as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export async function uploadImage(token: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${FUNCTION_BASE}/upload-image`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "x-session-token": token,
    },
    body: form,
  });

  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json();
  return json.url as string;
}
