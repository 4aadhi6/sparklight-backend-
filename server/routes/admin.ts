import express from 'express';
import Booking from '../models/Booking';
import Worker from '../models/Worker';
import User from '../models/User';
import JobAssignment from '../models/JobAssignment';
import jwt from 'jsonwebtoken';

const router = express.Router();

const verifyAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get Dashboard Stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ paymentStatus: 'paid' });
    const totalWorkers = await Worker.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    res.json({ totalBookings, totalWorkers, totalUsers, completedBookings });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get All Bookings
router.get('/bookings', verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: 'paid' }).populate('userId', 'name phone').populate('workerId').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get All Workers
router.get('/workers', verifyAdmin, async (req, res) => {
  try {
    const workers = await Worker.find().populate('userId', 'name phone');
    res.json(workers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Assign Worker
router.patch('/bookings/:id/assign', verifyAdmin, async (req: any, res) => {
  try {
    const { workerIds } = req.body; // Array of worker IDs
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Create assignments for each worker
    const assignments = await Promise.all(workerIds.map(async (workerId: string) => {
      return await JobAssignment.findOneAndUpdate(
        { bookingId, workerId },
        { status: 'pending' },
        { upsert: true, new: true }
      );
    }));

    booking.status = 'assigned';
    await booking.save();
    
    const io = req.app.get('io');
    io.emit('bookingUpdated', booking);
    
    // Notify each worker
    workerIds.forEach((workerId: string) => {
      io.emit(`newJobInvitation_${workerId}`, { bookingId, booking });
    });
    
    res.json({ booking, assignments });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update Worker Incentives/Gifts
router.patch('/workers/:id/incentives', verifyAdmin, async (req, res) => {
  try {
    const { incentives, gifts } = req.body;
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { incentives, gifts },
      { new: true }
    ).populate('userId', 'name phone');
    res.json(worker);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
