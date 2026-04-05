import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, User, Navigation } from 'lucide-react';
import { Card } from './ui/Card';

interface WorkerTrackerProps {
  userLocation: { lat: number; lng: number };
  workerName: string;
}

export const WorkerTracker: React.FC<WorkerTrackerProps> = ({ userLocation, workerName }) => {
  const [workerPos, setWorkerPos] = useState({ 
    lat: userLocation.lat + 0.005, 
    lng: userLocation.lng + 0.005 
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate movement towards user
    const startLat = userLocation.lat + 0.005;
    const startLng = userLocation.lng + 0.005;
    
    const currentLat = startLat - (startLat - userLocation.lat) * (progress / 100);
    const currentLng = startLng - (startLng - userLocation.lng) * (progress / 100);
    
    setWorkerPos({ lat: currentLat, lng: currentLng });
  }, [progress, userLocation]);

  return (
    <Card className="p-4 bg-zinc-900 text-white overflow-hidden relative min-h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Worker on the way</p>
            <p className="font-bold">{workerName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">Estimated Arrival</p>
          <p className="font-bold text-primary">{Math.max(0, 10 - Math.floor(progress / 10))} mins</p>
        </div>
      </div>

      {/* Simulated Map Grid */}
      <div className="relative h-32 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }} />
        
        {/* User Marker */}
        <div 
          className="absolute transition-all duration-1000"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            <MapPin className="w-6 h-6 text-red-500 fill-red-500/20" />
            <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping" />
          </div>
        </div>

        {/* Worker Marker */}
        <motion.div 
          className="absolute"
          animate={{ 
            left: `${50 + (100 - progress) / 4}%`, 
            top: `${50 + (100 - progress) / 4}%` 
          }}
          transition={{ duration: 1, ease: "linear" }}
        >
          <div className="relative">
            <Navigation className="w-5 h-5 text-primary fill-primary/20 rotate-45" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded text-[10px] whitespace-nowrap border border-primary/30">
              {workerName}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
};
