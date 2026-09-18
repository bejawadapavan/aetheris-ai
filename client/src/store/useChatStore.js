import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  // Conversation list (sidebar)
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  upsertConversationMeta: (meta) =>
    set((state) => {
      const exists = state.conversations.some((c) => c._id === meta._id);
      const next = exists
        ? state.conversations.map((c) => (c._id === meta._id ? { ...c, ...meta } : c))
        : [meta, ...state.conversations];
      return { conversations: next };
    }),
  removeConversationMeta: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c._id !== id),
    })),

  // Active conversation state
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  appendToLastMessage: (chunk) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      messages[messages.length - 1] = { ...last, content: last.content + chunk };
      return { messages };
    }),

  isStreaming: false,
  setIsStreaming: (val) => set({ isStreaming: val }),

  // Persona / language selection (persists across the session)
  persona: 'empathetic-friend',
  setPersona: (persona) => set({ persona }),

  language: 'auto',
  setLanguage: (language) => set({ language }),

  // UI state
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  audioEnabled: false,
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),

  startNewConversation: () =>
    set({
      activeConversationId: null,
      messages: [],
    }),
}));

export default useChatStore;
