import { useCallback, useEffect, useState } from 'react';
import {
  fetchConversations,
  fetchConversation,
  deleteConversation as apiDeleteConversation,
} from '../services/api.js';
import useChatStore from '../store/useChatStore.js';

export function useConversations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    conversations,
    setConversations,
    setActiveConversationId,
    setMessages,
    removeConversationMeta,
    activeConversationId,
    startNewConversation,
    setPersona,
    setLanguage,
  } = useChatStore();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchConversations();
      setConversations(list);
    } catch (err) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  }, [setConversations]);

  const openConversation = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const conversation = await fetchConversation(id);
        setActiveConversationId(conversation._id);
        setMessages(conversation.messages || []);
        setPersona(conversation.persona);
        setLanguage(conversation.language);
      } catch (err) {
        setError(err.message || 'Failed to load conversation.');
      } finally {
        setLoading(false);
      }
    },
    [setActiveConversationId, setMessages, setPersona, setLanguage]
  );

  const removeConversation = useCallback(
    async (id) => {
      try {
        await apiDeleteConversation(id);
        removeConversationMeta(id);
        if (id === activeConversationId) {
          startNewConversation();
        }
      } catch (err) {
        setError(err.message || 'Failed to delete conversation.');
      }
    },
    [removeConversationMeta, activeConversationId, startNewConversation]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { conversations, loading, error, refresh, openConversation, removeConversation };
}
