export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-message-in">
      <div className="bg-ink-700 rounded-3xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce-dot"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce-dot"
          style={{ animationDelay: "160ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce-dot"
          style={{ animationDelay: "320ms" }}
        />
      </div>
    </div>
  );
}
