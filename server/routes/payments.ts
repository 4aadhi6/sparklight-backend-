import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Transaction from '../models/Transaction';
import Booking from '../models/Booking';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SXKBlcZ3TmB0Ea',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'MbzT3w0g9JloqruDBabR4GFQ',
});

// Create Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, bookingId, userId } = req.body;
    
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_${bookingId}`,
    };

    const order = await razorpay.orders.create(options);
    
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transaction = new Transaction({
      userId,
      bookingId,
      amount,
      razorpayOrderId: order.id,
      invoiceNumber
    });
    await transaction.save();

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Verify Payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'MbzT3w0g9JloqruDBabR4GFQ')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      await Transaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'success', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }
      );
      
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid', status: 'confirmed' });
      
      const io = req.app.get('io');
      const booking = await Booking.findById(bookingId).populate('userId', 'name phone');
      io.emit('newBooking', booking);
      
      res.json({ message: "Payment verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid signature" });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel Payment/Booking
router.post('/cancel', async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    // 1. Check if a successful transaction already exists in our database
    const successfulTransaction = await Transaction.findOne({ bookingId, status: 'success' });
    if (successfulTransaction) {
      return res.json({ message: "Booking already paid, skipping cancellation" });
    }

    // 2. Fetch the transaction to get the Razorpay Order ID
    const transaction = await Transaction.findOne({ bookingId }).sort({ createdAt: -1 });
    if (transaction) {
      // 3. Fetch the order status from Razorpay directly
      const order = await razorpay.orders.fetch(transaction.razorpayOrderId);
      const payments = await razorpay.orders.fetchPayments(transaction.razorpayOrderId);
      
      // 4. If any payment for this order is 'captured' or 'authorized', mark as paid
      const successfulPayment = payments.items.find((p: any) => p.status === 'captured' || p.status === 'authorized');
      
      if (successfulPayment) {
        await Transaction.findByIdAndUpdate(transaction._id, { 
          status: 'success', 
          razorpayPaymentId: successfulPayment.id 
        });
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid', status: 'confirmed' });
        
        const io = req.app.get('io');
        const booking = await Booking.findById(bookingId).populate('userId', 'name phone');
        io.emit('newBooking', booking);
        
        return res.json({ message: "Payment was actually successful, booking confirmed" });
      }
    }

    // 5. If no successful payment found, mark as failed/cancelled
    const booking = await Booking.findByIdAndUpdate(
      bookingId, 
      { paymentStatus: 'failed', status: 'cancelled' },
      { new: true }
    );
    
    const io = req.app.get('io');
    io.emit('bookingUpdated', booking);
    
    res.json({ message: "Booking cancelled" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
