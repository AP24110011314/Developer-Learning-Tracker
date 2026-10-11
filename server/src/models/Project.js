import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    stack: { type: [String], default: [] },
    repoUrl: { type: String, default: '', trim: true, maxlength: 2000 },
    liveUrl: { type: String, default: '', trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'completed', 'archived'],
      default: 'in-progress',
    },
    learnings: { type: String, default: '', maxlength: 5000 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', projectSchema);
