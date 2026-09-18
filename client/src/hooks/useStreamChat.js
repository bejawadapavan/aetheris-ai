import { useCallback, useRef } from 'react';
import { streamChat } from '../services/api.js';
import useChatStore from '../store/useChatStore.js';

/**
 * Encapsulates the full send-message flow: optimistic user message,
 * placeholder assistant message, SSE streaming into that placeholder,
 * and final sync of conversation metadata.
 */
export function useStreamChat() {
  const abortRef = useRef(null);

  const {
    addMessage,
    appendToLastMessage,
    setIsStreaming,
    activeConversationId,
    setActiveConversationId,
    persona,
    language,
    upsertConversationMeta,
  } = useChatStore();

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      addMessage({ role: 'user', content: trimmed, timestamp: Date.now() });
      addMessage({ role: 'assistant', content: '', timestamp: Date.now(), streaming: true });
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      await streamChat({
        conversationId: activeConversationId,
        message: trimmed,
        persona,
        language,
        signal: controller.signal,
        onToken: (token) => {
          appendToLastMessage(token);
        },
        onDone: ({ conversationId, title }) => {
          if (conversationId && conversationId !== activeConversationId) {
            setActiveConversationId(conversationId);
          }
          if (conversationId) {
            upsertConversationMeta({
              _id: conversationId,
              title: title || 'New conversation',
              persona,
              language,
              updatedAt: new Date().toISOString(),
            });
          }
          setIsStreaming(false);
        },
        onError: (message) => {
          appendToLastMessage(`\n\n⚠️ ${message}`);
          setIsStreaming(false);
        },
      });
    },
    [
      activeConversationId,
      persona,
      language,
      addMessage,
      appendToLastMessage,
      setIsStreaming,
      setActiveConversationId,
      upsertConversationMeta,
    ]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, [setIsStreaming]);

  return { sendMessage, stopStreaming };
}
