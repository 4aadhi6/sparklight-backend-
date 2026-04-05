import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  workerId?: mongoose.Types.ObjectId;
  type: 'pre' | 'emergency';
  serviceType: 'Electrical' | 'Plumbing' | 'Home Repair' | 'Cleaning' | 'Other';
  details: string;
  address: string;
  date: Date;
  timeSlot?: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'completed' | 'cancelled';
  workerStatus?: 'pending' | 'accepted' | 'rejected';
  paymentStatus: 'pending' | 'paid' | 'failed';
  advancePaid: number;
  transactionId?: string;
  rating?: number;
  feedback?: string;
  coordinates?: { lat: number; lng: number };
}

const BookingSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workerId: { type: Schema.Types.ObjectId, ref: 'Worker' },
  type: { type: String, enum: ['pre', 'emergency'], required: true },
  serviceType: { type: String, required: true },
  details: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'assigned', 'completed', 'cancelled'], default: 'pending' },
  workerStatus: { type: String, enum: ['pending', 'accepted', 'rejected'] },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  advancePaid: { type: Number, default: 99 },
  transactionId: { type: String },
  rating: { type: Number },
  feedback: { type: String },
  coordinates: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

export default mongoose.model<IBooking>('Booking', BookingSchema);
