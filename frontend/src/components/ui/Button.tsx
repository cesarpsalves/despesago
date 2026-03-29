import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";
  
  const variants = {
    primary: "bg-[#1D1D1F] text-white hover:bg-[#000000] focus:ring-[#1D1D1F] shadow-soft",
    secondary: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-soft",
    outline: "border border-[#EBEBEB] bg-white text-[#1D1D1F] hover:bg-[#F5F5F7] hover:border-[#D2D2D7] focus:ring-[#D2D2D7]",
    ghost: "text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] border border-transparent transition-all",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-soft",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-[10px]",
    md: "px-5 py-2.5 text-sm rounded-[12px]",
    lg: "px-8 py-4 text-base rounded-[16px]"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
