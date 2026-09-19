import Conversation from '../models/Conversation.js';
import { streamChatCompletion, generateConversationTitle } from '../services/aiService.js';
import { isDbConnected } from '../config/db.js';
import { encryptText, decryptText } from '../utils/encryption.js';

/**
 * GET /api/chat or GET /chat
 * Status endpoint so browser GET requests never return 404.
 */
export function getChatStatus(req, res) {
  return res.json({
    status: 'ok',
    service: 'Aetheris AI Chat & Reasoning Engine',
    port: process.env.PORT || 5000,
    encryption: 'AES-256-GCM Active',
    authentication: req.user ? `Authenticated as ${req.user.name || req.user.email}` : 'Anonymous / Guest Mode',
    methods: ['POST'],
    expectedPayload: {
      message: 'string (or prompt/query/text)',
      session_id: 'optional string for session tracking',
      persona: 'empathetic-friend | professional-strategist | creative-visionary | witty-playful | casual-friendly',
      language: 'auto | en | hi | es | etc.',
      encrypted: 'boolean (optional, if true payload is encrypted)',
    },
  });
}

/**
 * POST /api/chat or POST /chat
 * Handles incoming chat messages with multi-frontend compatibility (Turing Whisper & Aetheris).
 */
export async function handleChatStream(req, res) {
  const body = req.body || {};
  const sessionId = body.session_id || body.sessionId || body.conversationId || 'default-session';
  const persona = body.persona || 'empathetic-friend';
  const language = body.language || 'auto';
  const shouldEncrypt = Boolean(body.encrypt || body.encrypted);

  // Decrypt incoming message if client sent encrypted payload
  let rawIncoming =
    body.message ||
    body.prompt ||
    body.query ||
    body.text ||
    body.input ||
    (Array.isArray(body.messages) && body.messages[body.messages.length - 1]?.content);

  if (typeof rawIncoming === 'string' && shouldEncrypt && rawIncoming.includes(':')) {
    rawIncoming = decryptText(rawIncoming);
  }

  const message = typeof rawIncoming === 'string' ? rawIncoming.trim() : '';

  if (!message) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'A non-empty "message" or "prompt" field is required.',
      reply: 'Please provide a message so I can assist you.',
    });
  }

  // Determine response mode:
  // Only stream SSE if the client explicitly requests text/event-stream or stream: true.
  // Standard fetches (Accept: */* or Accept: application/json) get clean JSON.
  const acceptHeader = req.headers.accept || '';
  const wantsSse =
    body.stream === true ||
    req.query?.stream === 'true' ||
    (acceptHeader.includes('text/event-stream') && !acceptHeader.includes('application/json'));

  let conversation = null;
  const dbAvailable = isDbConnected();

  if (dbAvailable) {
    try {
      if (sessionId && sessionId !== 'default-session' && sessionId.length === 24) {
        conversation = await Conversation.findById(sessionId).catch(() => null);
      }
      if (!conversation) {
        conversation = new Conversation({
          persona,
          language,
          user: req.user?.id || null,
          messages: [],
        });
      }
      conversation.persona = persona;
      conversation.language = language;

      // Encrypt message content at rest for high privacy
      const storedUserMsg = encryptText(message);
      conversation.messages.push({
        role: 'user',
        content: storedUserMsg,
        encrypted: true,
      });
    } catch (e) {
      console.warn('[chat] DB conversation lookup notice:', e.message);
    }
  }

  // Build history (decrypting any encrypted stored messages for the AI context)
  const history =
    dbAvailable && conversation
      ? conversation.messages.map((m) => ({
          role: m.role,
          content: decryptText(m.content),
        }))
      : [{ role: 'user', content: message }];

  // 1. Standard JSON Response Mode (used by Turing's Whisper & standard fetch frontends)
  if (!wantsSse) {
    try {
      const assembled = await streamChatCompletion({
        messages: history,
        persona,
        language,
        onToken: () => {},
      });

      if (dbAvailable && conversation) {
        const storedReply = encryptText(assembled);
        conversation.messages.push({
          role: 'assistant',
          content: storedReply,
          encrypted: true,
        });
        if (conversation.messages.length === 2) {
          conversation.title = await generateConversationTitle(message);
        }
        await conversation.save().catch(() => {});
      }

      // Return unified payload satisfying ALL frontends
      const responsePayload = {
        status: 'success',
        reply: assembled,
        response: assembled,
        message: assembled,
        text: assembled,
        answer: assembled,
        session_id: sessionId,
        sessionId: sessionId,
        conversationId: conversation?._id?.toString() || sessionId,
        title: conversation?.title || message.slice(0, 30),
        history: history.concat([{ role: 'assistant', content: assembled }]),
        security: {
          encrypted: shouldEncrypt,
          algorithm: 'AES-256-GCM',
          authenticated: !!req.user,
        },
      };

      if (shouldEncrypt) {
        responsePayload.encryptedReply = encryptText(assembled);
      }

      return res.json(responsePayload);
    } catch (err) {
      console.error('[chat] json error:', err.message);
      return res.status(500).json({
        error: 'Internal Server Error',
        reply: `I encountered an unexpected error: ${err.message}`,
        message: err.message,
      });
    }
  }

  // 2. SSE Streaming Response Mode (used by real-time streaming frontends)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    send('start', {
      session_id: sessionId,
      conversationId: conversation?._id?.toString() || sessionId,
      encrypted: shouldEncrypt,
    });

    let assembled = '';
    assembled = await streamChatCompletion({
      messages: history,
      persona,
      language,
      onToken: (token) => {
        send('token', { token });
      },
    });

    if (dbAvailable && conversation) {
      const storedReply = encryptText(assembled);
      conversation.messages.push({
        role: 'assistant',
        content: storedReply,
        encrypted: true,
      });
      if (conversation.messages.length === 2) {
        conversation.title = await generateConversationTitle(message);
      }
      await conversation.save().catch(() => {});
    }

    send('done', {
      reply: assembled,
      session_id: sessionId,
      conversationId: conversation?._id?.toString() || sessionId,
      title: conversation?.title || message.slice(0, 30),
    });
    res.end();
  } catch (err) {
    console.error('[chat] stream error:', err.message);
    send('error', { message: err.message || 'Something went wrong.' });
    res.end();
  }
}
