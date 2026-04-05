import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const socket = io();
    
    socket.emit('join', user.id);
    if (user.role === 'admin') socket.emit('join', 'admin');
    if (user.role === 'worker') socket.emit('join', 'workers');

    socket.on('newBooking', (booking) => {
      if (user.role === 'admin' || user.role === 'worker') {
        toast.info(`New ${booking.type} booking request!`);
      }
    });

    socket.on('bookingUpdated', (booking) => {
      if (user.id === booking.userId) {
        toast.success(`Your booking status is now: ${booking.status}`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);
};
