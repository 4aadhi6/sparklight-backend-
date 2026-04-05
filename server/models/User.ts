import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  password?: string;
  role: 'user' | 'worker' | 'admin';
  profilePhoto?: string;
  addresses: {
    label: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  }[];
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'worker', 'admin'], default: 'user' },
  profilePhoto: { type: String },
  addresses: [{
    label: { type: String, default: 'Home' },
    address: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
