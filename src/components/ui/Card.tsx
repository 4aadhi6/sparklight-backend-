import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'neu';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  hover = true,
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variant === 'glass' ? 'glass' : 'neu-flat',
        className
      )}
    >
      {children}
    </motion.div>
  );
};
