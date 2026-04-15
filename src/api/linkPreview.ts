const FUNCTION_BASE = import.meta.env.VITE_FUNCTION_BASE as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface LinkPreview {
  url: string;
  resolvedUrl: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  videoUrl: string | null;
  videoWidth: number | null;
  videoHeight: number | null;
  imageWidth: number | null;
  imageHeight: number | null;
}

const cache = new Map<string, Promise<LinkPreview | null>>();

export function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  const cached = cache.get(url);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const res = await fetch(
        `${FUNCTION_BASE}/og-preview?url=${encodeURIComponent(url)}`,
        {
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${ANON_KEY}`,
          },
        }
      );
      if (!res.ok) return null;
      return (await res.json()) as LinkPreview;
    } catch {
      return null;
    }
  })();

  cache.set(url, promise);
  return promise;
}
