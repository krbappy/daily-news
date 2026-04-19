import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useAppStore } from "../../store/useAppStore";
import { sendMessage } from "../../api/messages";
import { uploadImage } from "../../api/upload";
import { useTyping } from "../../hooks/useTyping";
import { SORRY_MODE } from "../../config/chatTheme";

const LINE_HEIGHT = 20;
const MAX_LINES = 4;

export default function MessageInput() {
  const token = useAppStore((s) => s.sessionToken);
  const currentUser = useAppStore((s) => s.currentUser);
  const otherUser = useAppStore((s) => s.otherUser);
  const replyingTo = useAppStore((s) => s.replyingTo);
  const setReplyingTo = useAppStore((s) => s.setReplyingTo);
  const { onType, stopTyping } = useTyping();

  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSend = !sending && (text.trim().length > 0 || !!file);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = LINE_HEIGHT * MAX_LINES + 16;
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [text]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Focus textarea when replying
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    onType();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape" && replyingTo) {
      setReplyingTo(null);
    }
  }

  function handleFilePick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
    e.target.value = "";
  }

  function addEmoji(emoji: string) {
    setText((t) => t + emoji);
    onType();
  }

  function getReplyAuthor(senderId: string) {
    if (senderId === currentUser?.id) return "You";
    return otherUser?.display_name ?? "Unknown";
  }

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSend || !token) return;

    setSending(true);
    try {
      let image_url: string | null = null;
      if (file) {
        image_url = await uploadImage(token, file);
      }
      await sendMessage(token, {
        content: text.trim() || null,
        image_url,
        reply_to_id: replyingTo?.id ?? null,
      });
      setText("");
      setFile(null);
      setEmojiOpen(false);
      setReplyingTo(null);
      stopTyping();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={`shrink-0 border-t relative z-10 ${
        SORRY_MODE
          ? "bg-pink-950/40 backdrop-blur-md border-pink-300/15"
          : "bg-ink-900 border-white/5"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Reply preview bar */}
      {replyingTo && (
        <div className="px-3 pt-3 flex items-center gap-2">
          <div className="flex-1 bg-white/5 border-l-2 border-accent rounded-lg px-3 py-2">
            <div className="text-[11px] font-medium text-accent">
              Replying to {getReplyAuthor(replyingTo.sender_id)}
            </div>
            <div className="text-xs text-white/50 truncate mt-0.5">
              {replyingTo.image_url && !replyingTo.content
                ? "Photo"
                : replyingTo.content || "Photo"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 flex items-center justify-center text-xs transition"
            aria-label="Cancel reply"
          >
            ✕
          </button>
        </div>
      )}

      {preview && (
        <div className="px-3 pt-3">
          <div className="relative inline-block">
            <img
              src={preview}
              alt=""
              className="max-h-32 rounded-lg border border-zinc-700"
            />
            <button
              type="button"
              onClick={() => setFile(null)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 text-white text-xs"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {emojiOpen && (
        <div className="px-2 pt-2">
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={(d) => addEmoji(d.emoji)}
            width="100%"
            height={320}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="px-3 py-3 flex items-end gap-2"
      >
        <button
          type="button"
          onClick={() => setEmojiOpen((v) => !v)}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-zinc-200 shrink-0 flex items-center justify-center transition"
          aria-label="Emoji"
        >
          😊
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onBlur={stopTyping}
          placeholder="Message"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-bwignore="true"
          data-form-type="other"
          className="flex-1 resize-none overflow-y-auto bg-white/5 border border-white/10 rounded-3xl px-4 py-2.5 text-white text-sm leading-5 placeholder:text-zinc-500 focus:outline-none focus:border-accent/50 transition break-words scrollbar-hide"
          style={{
            maxHeight: LINE_HEIGHT * MAX_LINES + 16,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            wordBreak: "break-word",
          }}
        />

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFilePick}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-zinc-200 shrink-0 flex items-center justify-center transition"
          aria-label="Add image"
        >
          📷
        </button>

        <button
          type="submit"
          disabled={!canSend}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-bright to-accent-deep text-white shrink-0 flex items-center justify-center shadow-lg shadow-accent/30 disabled:opacity-30 disabled:shadow-none transition"
          aria-label="Send"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
