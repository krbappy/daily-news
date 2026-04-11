import { useEffect, useState } from "react";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";
import { useAppStore } from "../../store/useAppStore";
import { deleteMessages } from "../../api/messages";

function useNowTicker(intervalMs: number) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
}

const ONLINE_WINDOW_MS = 45_000;

function PresenceLine() {
  const presence = useAppStore((s) => s.otherUserPresence);
  useNowTicker(15_000);

  const lastSeenMs = presence?.last_seen
    ? new Date(presence.last_seen).getTime()
    : 0;
  const freshlyOnline =
    !!presence?.is_online && Date.now() - lastSeenMs < ONLINE_WINDOW_MS;

  if (presence?.is_typing && freshlyOnline) {
    return <span className="text-accent-bright">Typing…</span>;
  }
  if (freshlyOnline) {
    return (
      <span className="flex items-center gap-1.5 text-emerald-400">
        <span className="relative flex">
          <span className="absolute inline-flex w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
        </span>
        Online
      </span>
    );
  }
  if (presence?.last_seen) {
    const seconds = differenceInSeconds(new Date(), new Date(presence.last_seen));
    const label =
      seconds < 60
        ? "just now"
        : formatDistanceToNow(new Date(presence.last_seen), { addSuffix: true });
    return <span className="text-zinc-500">Last seen {label}</span>;
  }
  return <span className="text-zinc-500">Offline</span>;
}

export default function ChatHeader() {
  const otherUser = useAppStore((s) => s.otherUser);
  const token = useAppStore((s) => s.sessionToken);
  const clearMessagesLocal = useAppStore((s) => s.clearMessagesLocal);

  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);

  const initial = (otherUser?.display_name || otherUser?.username || "?")
    .charAt(0)
    .toUpperCase();
  const avatarColor = otherUser?.avatar_color || "#5b21b6";

  async function handleClear() {
    if (!token) return;
    setClearing(true);
    try {
      await deleteMessages(token);
      clearMessagesLocal();
      setConfirming(false);
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
    }
  }

  return (
    <>
      <header className="h-[64px] shrink-0 bg-ink-900 border-b border-white/5 flex items-center px-4 gap-3 relative z-10">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-lg"
          style={{
            backgroundColor: avatarColor,
            boxShadow: `0 4px 20px ${avatarColor}40`,
          }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[15px] font-semibold truncate">
            {otherUser?.display_name || otherUser?.username || "Chat"}
          </div>
          <div className="text-xs truncate">
            <PresenceLine />
          </div>
        </div>
        <button
          onClick={() => setConfirming(true)}
          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
          aria-label="Clear chat"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </header>

      {confirming && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center animate-message-in"
          onClick={() => !clearing && setConfirming(false)}
        >
          <div
            className="w-full sm:max-w-sm bg-ink-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-white text-base font-semibold">
                Clear chat history?
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                This only clears your view.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                disabled={clearing}
                onClick={() => setConfirming(false)}
                className="flex-1 py-2.5 rounded-full bg-white/5 text-white text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={clearing}
                onClick={handleClear}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold disabled:opacity-50"
              >
                {clearing ? "Clearing…" : "Clear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
