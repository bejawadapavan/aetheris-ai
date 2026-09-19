import axios from 'axios';

export const BACKEND_STORAGE_KEY = 'aetheris_custom_backend_url';

export function getBackendUrl() {
  try {
    const custom = localStorage.getItem(BACKEND_STORAGE_KEY);
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  } catch {}
  return import.meta.env.VITE_API_URL || '/api';
}

export function setBackendUrl(url) {
  try {
    if (url && url.trim()) {
      localStorage.setItem(BACKEND_STORAGE_KEY, url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem(BACKEND_STORAGE_KEY);
    }
  } catch {}
}

export const api = axios.create({
  baseURL: getBackendUrl(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.baseURL = getBackendUrl();
  return config;
});

export async function fetchConversations() {
  const { data } = await api.get('/conversations');
  return data.conversations;
}

export async function fetchConversation(id) {
  const { data } = await api.get(`/conversations/${id}`);
  return data.conversation;
}

export async function createConversation(payload) {
  const { data } = await api.post('/conversations', payload);
  return data.conversation;
}

export async function updateConversation(id, payload) {
  const { data } = await api.patch(`/conversations/${id}`, payload);
  return data.conversation;
}

export async function deleteConversation(id) {
  await api.delete(`/conversations/${id}`);
}

/**
 * Streams a chat response from the backend using fetch + ReadableStream,
 * parsing Server-Sent Events manually (EventSource does not support POST).
 *
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.message
 * @param {string} params.persona
 * @param {string} params.language
 * @param {(token: string) => void} params.onToken
 * @param {(meta: {conversationId: string, title?: string}) => void} params.onDone
 * @param {(message: string) => void} params.onError
 */
export async function streamChat({
  conversationId,
  message,
  persona,
  language,
  onToken,
  onDone,
  onError,
  signal,
}) {
  try {
    const base = getBackendUrl();
    const endpoint = base.endsWith('/chat') ? base : `${base}/chat`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message, persona, language }),
      signal,
    });

    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop(); // last chunk may be incomplete

      for (const raw of events) {
        if (!raw.trim()) continue;
        const lines = raw.split('\n');
        let eventName = 'message';
        let dataStr = '';
        for (const line of lines) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim();
          if (line.startsWith('data:')) dataStr += line.slice(5).trim();
        }

        let payload = {};
        try {
          payload = dataStr ? JSON.parse(dataStr) : {};
        } catch {
          continue;
        }

        if (eventName === 'token' && payload.token) {
          onToken(payload.token);
        } else if (eventName === 'done') {
          onDone?.(payload);
        } else if (eventName === 'error') {
          onError?.(payload.message || 'An error occurred.');
        }
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      onError?.(err.message || 'Failed to connect to the server.');
    }
  }
}
