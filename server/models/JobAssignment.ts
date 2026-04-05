import mongoose, { Schema, Document } from 'mongoose';

export interface IJobAssignment extends Document {
  bookingId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}

const JobAssignmentSchema: Schema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  workerId: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
}, { timestamps: true });

// Ensure a worker can only be assigned once to a specific booking
JobAssignmentSchema.index({ bookingId: 1, workerId: 1 }, { unique: true });

export default mongoose.model<IJobAssignment>('JobAssignment', JobAssignmentSchema);
