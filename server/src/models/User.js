import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    bio: { type: String, default: '', maxlength: 500 },
    avatar: { type: String, default: '' },
    handles: {
      leetcode: { type: String, default: '' },
      codeforces: { type: String, default: '' },
    },
    privacy: {
      profilePublic: { type: Boolean, default: false },
      showHeatmap: { type: Boolean, default: true },
      showProjects: { type: Boolean, default: true },
    },
    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const User = mongoose.model('User', userSchema);
