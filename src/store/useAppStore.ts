import { create } from "zustand";

export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_color: string;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  deleted_at?: string | null;
  unsent_at?: string | null;
  reply_to_id?: string | null;
  replied_message?: {
    id: string;
    content: string;
    sender_id: string;
    image_url?: string | null;
  } | null;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Presence {
  is_online: boolean;
  last_seen: string;
  is_typing: boolean;
}

interface AppState {
  // Auth
  sessionToken: string | null;
  currentUser: User | null;
  otherUser: User | null;
  isAuthenticated: boolean;
  passwordType: "A" | "B" | null; // A = chat, B = decoy

  // Messages
  messages: Message[];
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  isLoadingOlder: boolean;

  // Reactions
  reactions: Record<string, Reaction[]>; // message_id -> reactions

  // Reply
  replyingTo: Message | null;

  // Presence
  otherUserPresence: Presence | null;

  // UI
  isSessionActive: boolean; // false when tab hidden → triggers logout

  // Actions
  setAuth: (token: string, user: User, type: "A" | "B") => void;
  clearAuth: () => void;
  setOtherUser: (user: User | null) => void;
  setMessages: (msgs: Message[]) => void;
  prependMessages: (msgs: Message[]) => void;
  appendMessage: (msg: Message) => void;
  setHasMoreMessages: (hasMore: boolean) => void;
  setLoadingOlder: (loading: boolean) => void;
  softDeleteMessages: (userId: string) => void;
  clearMessagesLocal: () => void;
  setPresence: (p: Presence) => void;
  setLoadingMessages: (loading: boolean) => void;
  setSessionActive: (active: boolean) => void;
  setReactions: (reactions: Record<string, Reaction[]>) => void;
  addReaction: (reaction: Reaction) => void;
  removeReaction: (reactionId: string, messageId: string) => void;
  setReplyingTo: (msg: Message | null) => void;
  unsendMessage: (id: string) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sessionToken: null,
  currentUser: null,
  otherUser: null,
  isAuthenticated: false,
  passwordType: null,

  messages: [],
  isLoadingMessages: false,
  hasMoreMessages: true,
  isLoadingOlder: false,

  reactions: {},
  replyingTo: null,

  otherUserPresence: null,

  isSessionActive: true,

  setAuth: (token, user, type) =>
    set({
      sessionToken: token,
      currentUser: user,
      isAuthenticated: true,
      passwordType: type,
    }),

  clearAuth: () =>
    set({
      sessionToken: null,
      currentUser: null,
      otherUser: null,
      isAuthenticated: false,
      passwordType: null,
      messages: [],
      otherUserPresence: null,
    }),

  setOtherUser: (user) => set({ otherUser: user }),

  setMessages: (msgs) => set({ messages: msgs }),

  prependMessages: (msgs) =>
    set((state) => {
      const existingIds = new Set(state.messages.map((m) => m.id));
      const unique = msgs.filter((m) => !existingIds.has(m.id));
      return { messages: [...unique, ...state.messages] };
    }),

  appendMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setHasMoreMessages: (hasMore) => set({ hasMoreMessages: hasMore }),

  setLoadingOlder: (loading) => set({ isLoadingOlder: loading }),

  softDeleteMessages: (userId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.sender_id === userId
          ? { ...m, deleted_at: new Date().toISOString() }
          : m
      ),
    })),

  clearMessagesLocal: () => set({ messages: [] }),

  setPresence: (p) => set({ otherUserPresence: p }),

  setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),

  setSessionActive: (active) => set({ isSessionActive: active }),

  setReactions: (reactions) => set({ reactions }),

  addReaction: (reaction) =>
    set((state) => {
      const existing = state.reactions[reaction.message_id] ?? [];
      // Avoid duplicates
      if (existing.some((r) => r.id === reaction.id)) return state;
      return {
        reactions: {
          ...state.reactions,
          [reaction.message_id]: [...existing, reaction],
        },
      };
    }),

  removeReaction: (reactionId, messageId) =>
    set((state) => {
      const existing = state.reactions[messageId] ?? [];
      return {
        reactions: {
          ...state.reactions,
          [messageId]: existing.filter((r) => r.id !== reactionId),
        },
      };
    }),

  setReplyingTo: (msg) => set({ replyingTo: msg }),

  unsendMessage: (id) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, unsent_at: new Date().toISOString() } : m
      ),
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
}));
