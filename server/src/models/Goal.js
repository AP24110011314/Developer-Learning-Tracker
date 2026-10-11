import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    metric: { type: String, enum: ['problems', 'streak', 'projects'], required: true },
    target: { type: Number, required: true, min: 1, max: 100000 },
    filter: {
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: undefined },
      topic: { type: String, default: undefined, maxlength: 100 },
    },
    startDate: { type: Date, default: undefined },
    deadline: { type: Date, default: undefined },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

export const Goal = mongoose.model('Goal', goalSchema);
