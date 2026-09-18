import Conversation from '../models/Conversation.js';
import { streamChatCompletion, generateConversationTitle } from '../services/aiService.js';
import { isDbConnected } from '../config/db.js';

/**
 * POST /api/chat
 * Body: { conversationId?, message, persona, language }
 * Streams the assistant's reply back to the client via Server-Sent Events.
 */
export async function handleChatStream(req, res) {
  const { conversationId, persona = 'empathetic-friend', language = 'auto' } = req.body || {};

  const rawMessage =
    req.body?.message ||
    req.body?.prompt ||
    req.body?.query ||
    req.body?.text ||
    req.body?.input ||
    (Array.isArray(req.body?.messages) && req.body.messages[req.body.messages.length - 1]?.content);

  const message = typeof rawMessage === 'string' ? rawMessage.trim() : '';

  if (!message) {
    return res.status(400).json({ error: 'A non-empty "message" or "prompt" field is required.' });
  }

  const wantsJson =
    req.query?.stream === 'false' ||
    req.body?.stream === false ||
    (req.headers.accept?.includes('application/json') && !req.headers.accept?.includes('text/event-stream'));

  let conversation = null;
  const dbAvailable = isDbConnected();

  if (dbAvailable) {
    try {
      if (conversationId) {
        conversation = await Conversation.findById(conversationId);
      }
      if (!conversation) {
        conversation = new Conversation({ persona, language, messages: [] });
      }
      conversation.persona = persona;
      conversation.language = language;
      conversation.messages.push({ role: 'user', content: message });
    } catch (e) {
      console.warn('[chat] DB conversation lookup error:', e.message);
    }
  }

  const history = dbAvailable && conversation
    ? conversation.messages.map((m) => ({ role: m.role, content: m.content }))
    : [{ role: 'user', content: message }];

  // Standard JSON response mode
  if (wantsJson) {
    try {
      let assembled = await streamChatCompletion({
        messages: history,
        persona,
        language,
        onToken: () => {},
      });

      if (dbAvailable && conversation) {
        conversation.messages.push({ role: 'assistant', content: assembled });
        if (conversation.messages.length === 2) {
          conversation.title = await generateConversationTitle(message);
        }
        await conversation.save().catch(() => {});
      }

      return res.json({
        reply: assembled,
        response: assembled,
        message: assembled,
        text: assembled,
        conversationId: conversation?._id?.toString() || null,
        title: conversation?.title || null,
      });
    } catch (err) {
      console.error('[chat] json error:', err.message);
      return res.status(500).json({ error: err.message || 'Error generating response' });
    }
  }

  // SSE streaming mode
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    send('start', { conversationId: conversation?._id?.toString() || null });

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
      conversation.messages.push({ role: 'assistant', content: assembled });
      if (conversation.messages.length === 2) {
        conversation.title = await generateConversationTitle(message);
      }
      await conversation.save().catch(() => {});
    }

    send('done', {
      conversationId: conversation?._id?.toString() || null,
      title: conversation?.title || null,
    });
    res.end();
  } catch (err) {
    console.error('[chat] stream error:', err.message);
    send('error', { message: err.message || 'Something went wrong generating a response.' });
    res.end();
  }
}
