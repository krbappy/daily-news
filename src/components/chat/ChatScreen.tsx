import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import SorryBackdrop from "./SorryBackdrop";
import { useMessages } from "../../hooks/useMessages";
import { usePresence } from "../../hooks/usePresence";
import { useAppStore } from "../../store/useAppStore";
import { SORRY_MODE } from "../../config/chatTheme";

export default function ChatScreen() {
  const currentUser = useAppStore((s) => s.currentUser);
  const otherUser = useAppStore((s) => s.otherUser);

  const { loadOlder } = useMessages();
  usePresence(currentUser?.id ?? null, otherUser?.id ?? null);

  return (
    <div
      className={`fixed inset-0 flex flex-col overflow-hidden ${
        SORRY_MODE ? "bg-[#1a0a1f]" : "bg-ink-950"
      }`}
    >
      {SORRY_MODE && <SorryBackdrop />}
      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <ChatHeader />
        <MessageList loadOlder={loadOlder} />
        <MessageInput />
      </div>
    </div>
  );
}
