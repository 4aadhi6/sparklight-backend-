import mongoose, { Schema, Document } from 'mongoose';

export interface IWorker extends Document {
  userId: mongoose.Types.ObjectId;
  skills: string[];
  experience: number;
  address?: string;
  jobsCompleted: number;
  rating: number;
  points: number;
  incentives: number;
  gifts: string[];
  badges: string[];
  lastLocation?: { lat: number; lng: number };
  availability: boolean;
  status: 'active' | 'suspended' | 'pending';
}

const WorkerSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: [{ type: String }],
  experience: { type: Number, default: 0 },
  address: { type: String },
  jobsCompleted: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  points: { type: Number, default: 0 },
  incentives: { type: Number, default: 0 },
  gifts: [{ type: String }],
  badges: [{ type: String }],
  lastLocation: {
    lat: Number,
    lng: Number
  },
  availability: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
}, { timestamps: true });

export default mongoose.model<IWorker>('Worker', WorkerSchema);
