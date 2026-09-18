import Conversation from '../models/Conversation.js';
import { streamChatCompletion, generateConversationTitle } from '../services/aiService.js';
import { isDbConnected } from '../config/db.js';

/**
 * POST /api/chat
 * Body: { conversationId?, message, persona, language }
 * Streams the assistant's reply back to the client via Server-Sent Events.
 */
export async function handleChatStream(req, res) {
  const { conversationId, message, persona = 'empathetic-friend', language = 'auto' } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'A non-empty "message" field is required.' });
  }

  // Set up SSE headers
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

  let conversation = null;
  const dbAvailable = isDbConnected();

  try {
    if (dbAvailable) {
      if (conversationId) {
        conversation = await Conversation.findById(conversationId);
      }
      if (!conversation) {
        conversation = new Conversation({ persona, language, messages: [] });
      }
      conversation.persona = persona;
      conversation.language = language;
      conversation.messages.push({ role: 'user', content: message });
    }

    // Build history for the model: prior turns + the new user message
    const history = dbAvailable
      ? conversation.messages.map((m) => ({ role: m.role, content: m.content }))
      : [{ role: 'user', content: message }];

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

    if (dbAvailable) {
      conversation.messages.push({ role: 'assistant', content: assembled });

      // Auto-title new conversations after the first exchange
      if (conversation.messages.length === 2) {
        conversation.title = await generateConversationTitle(message);
      }

      await conversation.save();
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
