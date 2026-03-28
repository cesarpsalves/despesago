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
  const baseStyles = "bg-slate-100 animate-pulse";
  
  const variantStyles = {
    rect: "rounded-2xl",
    circle: "rounded-full",
    text: "rounded-md"
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
