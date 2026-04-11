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

  // Presence
  otherUserPresence: Presence | null;

  // UI
  isSessionActive: boolean; // false when tab hidden → triggers logout

  // Actions
  setAuth: (token: string, user: User, type: "A" | "B") => void;
  clearAuth: () => void;
  setOtherUser: (user: User | null) => void;
  setMessages: (msgs: Message[]) => void;
  appendMessage: (msg: Message) => void;
  softDeleteMessages: (userId: string) => void;
  clearMessagesLocal: () => void;
  setPresence: (p: Presence) => void;
  setLoadingMessages: (loading: boolean) => void;
  setSessionActive: (active: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sessionToken: null,
  currentUser: null,
  otherUser: null,
  isAuthenticated: false,
  passwordType: null,

  messages: [],
  isLoadingMessages: false,

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

  appendMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

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
}));
