import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    platform: { type: String, default: 'other', trim: true, maxlength: 50 },
    url: { type: String, default: '', trim: true, maxlength: 2000 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    topics: { type: [String], default: [] },
    status: { type: String, enum: ['solved', 'revisit', 'stuck'], default: 'solved' },
    timeMinutes: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '', maxlength: 5000 },
    solvedAt: { type: Date, default: Date.now },
    source: { type: String, enum: ['manual', 'sync'], default: 'manual' },
    externalId: { type: String, default: undefined },
  },
  { timestamps: true }
);

problemSchema.index(
  { user: 1, platform: 1, externalId: 1 },
  {
    unique: true,
    // Only index docs that actually carry a sync externalId, so manual
    // problems (no externalId) never collide with each other.
    partialFilterExpression: { externalId: { $type: 'string' } },
  }
);
problemSchema.index({ user: 1, solvedAt: -1 });

export const Problem = mongoose.model('Problem', problemSchema);
