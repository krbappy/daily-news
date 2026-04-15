const URL_RE = /(https?:\/\/[^\s]+)/i;

export function extractFirstUrl(text: string): string | null {
  const match = text.match(URL_RE);
  return match ? match[0].replace(/[.,)\]}>'"]+$/, "") : null;
}

const FB_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "fb.watch",
  "fb.com",
]);

export function isFacebookUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return FB_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

export function facebookEmbedSrc(url: string, width = 400): string {
  const params = new URLSearchParams({
    href: url,
    show_text: "0",
    width: String(width),
    t: "0",
  });
  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}
