import express from 'express';
import Booking from '../models/Booking';
import Worker from '../models/Worker';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create Booking
router.post('/', verifyToken, async (req: any, res) => {
  try {
    const bookingData = { ...req.body, userId: req.user.id };
    const booking = new Booking(bookingData);
    await booking.save();
    
    res.status(201).json(booking);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get User Bookings
router.get('/my-bookings', verifyToken, async (req: any, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get Booking Details
router.get('/:id', verifyToken, async (req: any, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('workerId');
    res.json(booking);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update Booking Status
router.patch('/:id/status', verifyToken, async (req: any, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // If job is completed, update worker stats
    if (status === 'completed' && oldStatus !== 'completed' && booking.workerId) {
      const worker = await Worker.findById(booking.workerId);
      if (worker) {
        worker.jobsCompleted += 1;
        worker.points += 10;
        
        // Award Badges
        const newBadges = [...(worker.badges || [])];
        if (worker.jobsCompleted >= 10 && !newBadges.includes('Pro')) {
          newBadges.push('Pro');
        }
        if (worker.rating >= 4.8 && worker.jobsCompleted >= 5 && !newBadges.includes('Top Rated')) {
          newBadges.push('Top Rated');
        }
        worker.badges = newBadges;
        
        await worker.save();
      }
    }
    
    const io = req.app.get('io');
    io.emit('bookingUpdated', booking);
    
    res.json(booking);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
