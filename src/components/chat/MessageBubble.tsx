import { useState, useRef, useCallback, useEffect } from "react";
import { format } from "date-fns";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useAppStore, type Message } from "../../store/useAppStore";
import { supabase } from "../../lib/supabase";
import { unsendMessage } from "../../api/messages";

interface Props {
  message: Message;
  isOwn: boolean;
  onReply: (msg: Message) => void;
}

const EMOJI_ONLY_RE =
  /^(\s*(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\u200D|\p{Extended_Pictographic}|\p{Emoji_Presentation})*\s*)+$/u;

function isEmojiOnly(text: string) {
  if (!text.trim()) return false;
  try {
    return EMOJI_ONLY_RE.test(text);
  } catch {
    return false;
  }
}

const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function renderWithLinks(text: string) {
  const parts = text.split(URL_RE);
  return parts.map((part, i) => {
    if (!part) return null;
    if (URL_RE.test(part)) {
      URL_RE.lastIndex = 0;
      const href = part.startsWith("http") ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const QUICK_EMOJIS = ["\u2764\uFE0F", "\uD83D\uDE02", "\uD83D\uDE2E", "\uD83D\uDE22", "\uD83D\uDE20", "\uD83D\uDC4D"];
const EMPTY_REACTIONS: import("../../store/useAppStore").Reaction[] = [];

export default function MessageBubble({ message, isOwn, onReply }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppStore((s) => s.currentUser);
  const otherUser = useAppStore((s) => s.otherUser);
  const reactions = useAppStore((s) => s.reactions[message.id]) ?? EMPTY_REACTIONS;
  const otherLastSeen = useAppStore(
    (s) => s.otherUserPresence?.last_seen ?? null
  );

  const token = useAppStore((s) => s.sessionToken);
  const unsendMsg = useAppStore((s) => s.unsendMessage);

  const deleted = !!message.deleted_at;
  const unsent = !!message.unsent_at;
  const time = format(new Date(message.created_at), "h:mm a");
  const emojiOnly = !message.image_url && isEmojiOnly(message.content);

  const seen =
    isOwn &&
    otherLastSeen &&
    new Date(otherLastSeen).getTime() >= new Date(message.created_at).getTime();
  const statusLabel = isOwn ? (seen ? "Seen" : "Delivered") : null;

  // Close picker when tapping outside
  useEffect(() => {
    if (!showReactionPicker) return;
    function handleTap(e: TouchEvent | MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowReactionPicker(false);
      }
    }
    document.addEventListener("touchstart", handleTap);
    document.addEventListener("mousedown", handleTap);
    return () => {
      document.removeEventListener("touchstart", handleTap);
      document.removeEventListener("mousedown", handleTap);
    };
  }, [showReactionPicker]);

  const handleLongPressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowReactionPicker(true);
    }, 500);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleLongPressMove = useCallback(() => {
    // Cancel long press if finger moves (prevents accidental triggers while scrolling)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  async function toggleReaction(emoji: string) {
    if (!currentUser) return;
    const existing = reactions.find(
      (r) => r.emoji === emoji && r.user_id === currentUser.id
    );
    if (existing) {
      await supabase
        .from("message_reactions")
        .delete()
        .eq("id", existing.id);
    } else {
      await supabase.from("message_reactions").insert({
        message_id: message.id,
        user_id: currentUser.id,
        emoji,
      });
    }
    setShowReactionPicker(false);
  }

  function handleReply() {
    setShowReactionPicker(false);
    onReply(message);
  }

  async function handleUnsend() {
    if (!token) return;
    setShowReactionPicker(false);
    unsendMsg(message.id);
    try {
      await unsendMessage(token, message.id);
    } catch (e) {
      console.error("Failed to unsend:", e);
    }
  }

  // Group reactions by emoji for display
  const reactionGroups = reactions.reduce<
    Record<string, { emoji: string; count: number; hasOwn: boolean }>
  >((acc, r) => {
    if (!acc[r.emoji]) {
      acc[r.emoji] = { emoji: r.emoji, count: 0, hasOwn: false };
    }
    acc[r.emoji].count++;
    if (r.user_id === currentUser?.id) acc[r.emoji].hasOwn = true;
    return acc;
  }, {});
  const groupedReactions = Object.values(reactionGroups);

  function getReplyAuthor(senderId: string) {
    if (senderId === currentUser?.id) return "You";
    return otherUser?.display_name ?? "Unknown";
  }

  if (unsent) {
    const label = isOwn
      ? "You unsent a message"
      : `${otherUser?.display_name || "They"} unsent a message`;
    return (
      <div
        className={`flex animate-message-in ${
          isOwn ? "justify-end" : "justify-start"
        }`}
      >
        <div className="max-w-[75%] rounded-3xl px-4 py-2 text-sm italic opacity-50 border border-white/10 text-white/60 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {label}
        </div>
      </div>
    );
  }

  if (deleted) {
    return (
      <div
        className={`flex animate-message-in ${
          isOwn ? "justify-end" : "justify-start"
        }`}
      >
        <div className="max-w-[75%] rounded-3xl px-4 py-2 text-sm italic opacity-60 bg-ink-700 text-white">
          message deleted
        </div>
      </div>
    );
  }

  const replyPreview = message.replied_message ? (
    <div
      className={`mx-2 mt-2 mb-0 px-3 py-1.5 rounded-xl text-xs border-l-2 ${
        isOwn
          ? "bg-white/10 border-white/40 text-white/70"
          : "bg-white/5 border-accent/50 text-white/60"
      }`}
    >
      <div className="font-medium text-[11px] mb-0.5">
        {getReplyAuthor(message.replied_message.sender_id)}
      </div>
      <div className="truncate">
        {message.replied_message.image_url && !message.replied_message.content
          ? "Photo"
          : message.replied_message.content || "Photo"}
      </div>
    </div>
  ) : null;

  const reactionBar = groupedReactions.length > 0 && (
    <div
      className={`flex gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {groupedReactions.map((g) => (
        <button
          key={g.emoji}
          onClick={() => toggleReaction(g.emoji)}
          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition ${
            g.hasOwn
              ? "bg-accent/20 border border-accent/40"
              : "bg-white/10 border border-white/10 hover:bg-white/15"
          }`}
        >
          <span>{g.emoji}</span>
          {g.count > 1 && <span className="text-[10px] text-white/70">{g.count}</span>}
        </button>
      ))}
    </div>
  );

  const reactionPicker = showReactionPicker && (
    <div
      ref={pickerRef}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute ${isOwn ? "right-0" : "left-0"} -top-12 z-50 flex gap-1 bg-ink-800 border border-white/10 rounded-full px-2 py-1.5 shadow-xl animate-message-in`}
    >
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleReaction(emoji);
          }}
          onClick={(e) => {
            e.stopPropagation();
            toggleReaction(emoji);
          }}
          className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 active:scale-125 transition-transform rounded-full hover:bg-white/10 active:bg-white/10"
        >
          {emoji}
        </button>
      ))}
      <button
        type="button"
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleReply();
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleReply();
        }}
        className="w-8 h-8 flex items-center justify-center text-sm hover:scale-110 active:scale-110 transition-transform rounded-full hover:bg-white/10 active:bg-white/10"
        title="Reply"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 17 4 12 9 7" />
          <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
        </svg>
      </button>
      {isOwn && (
        <button
          type="button"
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleUnsend();
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleUnsend();
          }}
          className="w-8 h-8 flex items-center justify-center text-sm hover:scale-110 active:scale-110 transition-transform rounded-full hover:bg-red-500/20 active:bg-red-500/20 text-red-400"
          title="Unsend"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      )}
    </div>
  );

  const touchHandlers = showReactionPicker
    ? {}
    : {
        onTouchStart: handleLongPressStart,
        onTouchEnd: handleLongPressEnd,
        onTouchCancel: handleLongPressEnd,
        onTouchMove: handleLongPressMove,
      };

  if (emojiOnly) {
    return (
      <div
        className={`flex animate-message-in ${
          isOwn ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`relative flex flex-col ${isOwn ? "items-end" : "items-start"}`}
          {...touchHandlers}
          onDoubleClick={() => setShowReactionPicker(true)}
        >
          {reactionPicker}
          {replyPreview && (
            <div className={`w-full max-w-[200px] ${isOwn ? "self-end" : "self-start"}`}>
              {replyPreview}
            </div>
          )}
          <div className="text-5xl leading-none py-1">{message.content}</div>
          <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
            <span>{time}</span>
            {statusLabel && (
              <span className={seen ? "text-accent-bright" : ""}>
                · {statusLabel}
              </span>
            )}
          </div>
          {reactionBar}
        </div>
      </div>
    );
  }

  const bubbleClass = isOwn
    ? "bg-gradient-to-br from-accent-bright to-accent-deep text-white rounded-3xl rounded-br-md shadow-lg shadow-accent/20"
    : "bg-ink-700 text-white rounded-3xl rounded-bl-md";

  return (
    <div
      className={`flex animate-message-in ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className="relative max-w-[75%]"
        {...touchHandlers}
        onDoubleClick={() => setShowReactionPicker(true)}
      >
        {reactionPicker}

        <div className={`${bubbleClass} overflow-hidden`}>
          {replyPreview}

          {message.image_url && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block relative w-full"
            >
              {!imgLoaded && (
                <div className="w-56 h-40 bg-ink-600 animate-pulse" />
              )}
              <img
                src={message.image_url}
                alt=""
                onLoad={() => setImgLoaded(true)}
                className={`max-h-72 w-full object-cover ${
                  imgLoaded ? "block" : "hidden"
                }`}
              />
            </button>
          )}

          {(message.content || !message.image_url) && (
            <div className="px-3 py-2">
              {message.content && (
                <div className="text-sm whitespace-pre-wrap break-words">
                  {renderWithLinks(message.content)}
                </div>
              )}
              <div
                className={`text-[10px] mt-1 opacity-70 flex items-center gap-1 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <span>{time}</span>
                {statusLabel && <span>· {statusLabel}</span>}
              </div>
            </div>
          )}

          {message.image_url && !message.content && (
            <div
              className={`px-3 pb-2 text-[10px] opacity-70 flex items-center gap-1 ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              <span>{time}</span>
              {statusLabel && <span>· {statusLabel}</span>}
            </div>
          )}
        </div>

        {reactionBar}
      </div>

      {message.image_url && lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src: message.image_url }]}
        />
      )}
    </div>
  );
}
