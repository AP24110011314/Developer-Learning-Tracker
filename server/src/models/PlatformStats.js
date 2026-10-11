import mongoose from 'mongoose';

const platformStatsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    platform: { type: String, required: true, trim: true, maxlength: 50 },
    rating: { type: Number, default: undefined },
    maxRating: { type: Number, default: undefined },
    totalSolved: { type: Number, default: 0, min: 0 },
    byDifficulty: {
      easy: { type: Number, default: 0, min: 0 },
      medium: { type: Number, default: 0, min: 0 },
      hard: { type: Number, default: 0, min: 0 },
    },
    lastSyncedAt: { type: Date, default: undefined },
  },
  { timestamps: true }
);

platformStatsSchema.index({ user: 1, platform: 1 }, { unique: true });

export const PlatformStats = mongoose.model('PlatformStats', platformStatsSchema);
