import mongoose from 'mongoose';

const PersonaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      default: 'AI Assistant',
    },
    description: {
      type: String,
      required: true,
    },
    systemPrompt: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'Sparkles',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Persona', PersonaSchema);
