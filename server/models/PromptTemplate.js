import mongoose from 'mongoose';

const PromptTemplateSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['diffusion', 'copywriting', 'code', 'general'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    template: {
      type: String,
      required: true,
    },
    tags: [{ type: String }],
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('PromptTemplate', PromptTemplateSchema);
