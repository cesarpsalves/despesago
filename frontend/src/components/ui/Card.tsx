import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  padding = 'md', 
  className = '', 
  animate = false,
  children, 
  ...props 
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = `bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden ${paddings[padding]} ${className}`;

  if (animate) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={baseClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};
