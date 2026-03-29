import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  variant = 'rect', 
  width, 
  height 
}) => {
  // Cores suaves para evitar "quadrados pretos"
  const baseStyles = "bg-slate-100/80 animate-pulse";
  
  const variantStyles = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded"
  };

  const style: React.CSSProperties = {
    width: width,
    height: height
  };

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  );
};
