import Conversation from '../models/Conversation.js';

export async function listConversations(req, res) {
  try {
    const conversations = await Conversation.find({})
      .sort({ updatedAt: -1 })
      .select('title persona language updatedAt createdAt')
      .limit(100);
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations.', details: err.message });
  }
}

export async function getConversation(req, res) {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    res.json({ conversation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation.', details: err.message });
  }
}

export async function createConversation(req, res) {
  try {
    const { persona = 'empathetic-friend', language = 'auto', title } = req.body;
    const conversation = await Conversation.create({
      persona,
      language,
      title: title || 'New conversation',
      messages: [],
    });
    res.status(201).json({ conversation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create conversation.', details: err.message });
  }
}

export async function updateConversation(req, res) {
  try {
    const { title, persona, language } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (persona !== undefined) update.persona = persona;
    if (language !== undefined) update.language = language;

    const conversation = await Conversation.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    res.json({ conversation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update conversation.', details: err.message });
  }
}

export async function deleteConversation(req, res) {
  try {
    const result = await Conversation.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete conversation.', details: err.message });
  }
}
