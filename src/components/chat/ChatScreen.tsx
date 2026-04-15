import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useMessages } from "../../hooks/useMessages";
import { usePresence } from "../../hooks/usePresence";
import { useAppStore } from "../../store/useAppStore";

export default function ChatScreen() {
  const currentUser = useAppStore((s) => s.currentUser);
  const otherUser = useAppStore((s) => s.otherUser);

  const { loadOlder } = useMessages();
  usePresence(currentUser?.id ?? null, otherUser?.id ?? null);

  return (
    <div className="fixed inset-0 flex flex-col bg-ink-950 overflow-hidden">
      <ChatHeader />
      <MessageList loadOlder={loadOlder} />
      <MessageInput />
    </div>
  );
}
