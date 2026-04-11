import { useState } from "react";
import { format } from "date-fns";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useAppStore, type Message } from "../../store/useAppStore";

interface Props {
  message: Message;
  isOwn: boolean;
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

export default function MessageBubble({ message, isOwn }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const otherLastSeen = useAppStore(
    (s) => s.otherUserPresence?.last_seen ?? null
  );

  const deleted = !!message.deleted_at;
  const time = format(new Date(message.created_at), "h:mm a");
  const emojiOnly = !message.image_url && isEmojiOnly(message.content);

  const seen =
    isOwn &&
    otherLastSeen &&
    new Date(otherLastSeen).getTime() >= new Date(message.created_at).getTime();
  const statusLabel = isOwn ? (seen ? "Seen" : "Delivered") : null;

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

  if (emojiOnly) {
    return (
      <div
        className={`flex animate-message-in ${
          isOwn ? "justify-end" : "justify-start"
        }`}
      >
        <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
          <div className="text-5xl leading-none py-1">{message.content}</div>
          <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
            <span>{time}</span>
            {statusLabel && (
              <span className={seen ? "text-accent-bright" : ""}>
                · {statusLabel}
              </span>
            )}
          </div>
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
      <div className={`max-w-[75%] ${bubbleClass} overflow-hidden`}>
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
