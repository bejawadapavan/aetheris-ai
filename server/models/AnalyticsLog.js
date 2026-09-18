import mongoose from 'mongoose';

const AnalyticsLogSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      default: 'gemini-3-flash-preview',
      index: true,
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
    latencyMs: {
      type: Number,
      required: true,
    },
    tokens: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'success',
    },
    endpoint: {
      type: String,
      default: '/api/chat',
    },
  },
  { timestamps: true }
);

export default mongoose.model('AnalyticsLog', AnalyticsLogSchema);
