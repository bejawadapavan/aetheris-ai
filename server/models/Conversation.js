import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tokens: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ConversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'New conversation',
      trim: true,
      maxlength: 200,
    },
    persona: {
      type: String,
      default: 'empathetic-friend',
      index: true,
    },
    language: {
      type: String,
      default: 'auto',
      index: true,
    },
    model: {
      type: String,
      default: 'gemini-3-flash-preview',
    },
    userId: {
      type: String,
      default: 'anonymous',
      index: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
    metadata: {
      totalTokens: { type: Number, default: 0 },
      sentiment: { type: String, default: 'positive' },
    },
  },
  { timestamps: true }
);

ConversationSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model('Conversation', ConversationSchema);
