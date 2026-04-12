import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { useAppStore, type Message } from "../../store/useAppStore";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

type Row =
  | { type: "separator"; key: string; label: string }
  | { type: "message"; key: string; message: Message };

function separatorLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

function buildRows(messages: Message[]): Row[] {
  const rows: Row[] = [];
  let lastDay = "";
  for (const m of messages) {
    const d = new Date(m.created_at);
    const dayKey = format(d, "yyyy-MM-dd");
    if (dayKey !== lastDay) {
      rows.push({
        type: "separator",
        key: `sep-${dayKey}`,
        label: separatorLabel(d),
      });
      lastDay = dayKey;
    }
    rows.push({ type: "message", key: m.id, message: m });
  }
  return rows;
}

export default function MessageList() {
  const messages = useAppStore((s) => s.messages);
  const currentUser = useAppStore((s) => s.currentUser);
  const isTyping = useAppStore((s) => s.otherUserPresence?.is_typing ?? false);
  const setReplyingTo = useAppStore((s) => s.setReplyingTo);

  const handleReply = useCallback(
    (msg: Message) => {
      setReplyingTo(msg);
    },
    [setReplyingTo]
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [showFab, setShowFab] = useState(false);

  const rows = useMemo(() => buildRows(messages), [messages]);

  const scrollToBottom = (smooth = true) => {
    endRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    if (!showFab) scrollToBottom();
  }, [messages.length, isTyping, showFab]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowFab(distanceFromBottom > 200);
  }

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto px-4 py-3 space-y-2"
      >
        {rows.map((row) =>
          row.type === "separator" ? (
            <div key={row.key} className="flex justify-center my-4">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 bg-white/5 px-3 py-1 rounded-full">
                {row.label}
              </span>
            </div>
          ) : (
            <MessageBubble
              key={row.key}
              message={row.message}
              isOwn={row.message.sender_id === currentUser?.id}
              onReply={handleReply}
            />
          )
        )}
        {isTyping && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      {showFab && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute right-4 bottom-4 w-10 h-10 rounded-full bg-ink-800/80 backdrop-blur border border-white/10 text-white flex items-center justify-center shadow-lg hover:bg-ink-700"
          aria-label="Scroll to bottom"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </div>
  );
}
