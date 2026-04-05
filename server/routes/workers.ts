import express from 'express';
import Worker from '../models/Worker';
import Booking from '../models/Booking';
import JobAssignment from '../models/JobAssignment';
import jwt from 'jsonwebtoken';

const router = express.Router();

const verifyWorker = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'worker' && decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get Leaderboard
router.get('/leaderboard', verifyWorker, async (req: any, res) => {
  try {
    const leaderboard = await Worker.find({ status: 'active' })
      .populate('userId', 'name profilePhoto')
      .sort({ points: -1, rating: -1 })
      .limit(10);
    res.json(leaderboard);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get Worker Profile
router.get('/profile', verifyWorker, async (req: any, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user.id }).populate('userId', '-password');
    res.json(worker);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update Profile
router.patch('/profile', verifyWorker, async (req: any, res) => {
  try {
    const { skills, experience, address } = req.body;
    const worker = await Worker.findOneAndUpdate(
      { userId: req.user.id },
      { skills, experience, address },
      { new: true }
    ).populate('userId', '-password');
    res.json(worker);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update Availability
router.patch('/availability', verifyWorker, async (req: any, res) => {
  try {
    const worker = await Worker.findOneAndUpdate(
      { userId: req.user.id },
      { availability: req.body.availability },
      { new: true }
    );
    res.json(worker);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get Assigned Jobs
router.get('/jobs', verifyWorker, async (req: any, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    const assignments = await JobAssignment.find({ workerId: worker._id })
      .populate({
        path: 'bookingId',
        populate: { path: 'userId', select: 'name phone profilePhoto' }
      })
      .sort({ createdAt: -1 });
    
    // Format response to look like before for frontend compatibility
    const jobs = assignments
      .filter(a => a.bookingId) // Ensure booking exists
      .map(a => {
        const booking = a.bookingId as any;
        return {
          ...booking.toObject(),
          workerStatus: a.status,
          assignmentId: a._id
        };
      });

    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update Job Status (Accept/Reject)
router.patch('/jobs/:id/status', verifyWorker, async (req: any, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const bookingId = req.params.id;
    const worker = await Worker.findOne({ userId: req.user.id });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    const assignment = await JobAssignment.findOne({ bookingId, workerId: worker._id });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (status === 'accepted') {
      // Check if job is already taken
      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      
      if (booking.workerId) {
        return res.status(400).json({ message: 'Job already accepted by another worker' });
      }

      assignment.status = 'accepted';
      await assignment.save();

      // Update Booking
      booking.workerId = worker._id;
      booking.workerStatus = 'accepted';
      booking.status = 'assigned';
      await booking.save();

      // Cancel all other assignments for this booking
      await JobAssignment.updateMany(
        { bookingId, workerId: { $ne: worker._id }, status: 'pending' },
        { status: 'cancelled' }
      );

      const io = req.app.get('io');
      io.emit('bookingUpdated', booking);
      
      res.json(booking);
    } else {
      assignment.status = 'rejected';
      await assignment.save();
      res.json({ message: 'Job rejected', status: 'rejected' });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
