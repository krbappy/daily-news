// WebRTC ICE servers.
//
// STUN is free and always on (Google's public servers) — it covers most
// connections. TURN relays media when both peers are behind strict NAT;
// it only kicks in if a Metered API key is configured.
//
// To enable TURN: sign up free at https://dashboard.metered.ca (20 GB/mo),
// then set in your .env:
//   VITE_METERED_APP=yourapp.metered.live
//   VITE_METERED_API_KEY=xxxxxxxx

const STUN_ONLY: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const METERED_APP = import.meta.env.VITE_METERED_APP as string | undefined;
const METERED_API_KEY = import.meta.env.VITE_METERED_API_KEY as string | undefined;

let cached: RTCIceServer[] | null = null;

export async function getIceServers(): Promise<RTCIceServer[]> {
  if (cached) return cached;

  if (METERED_APP && METERED_API_KEY) {
    try {
      const res = await fetch(
        `https://${METERED_APP}/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`
      );
      if (res.ok) {
        const turn = (await res.json()) as RTCIceServer[];
        cached = [...STUN_ONLY, ...turn];
        return cached;
      }
    } catch {
      // network/credential issue — fall through to STUN-only
    }
  }

  return STUN_ONLY;
}
