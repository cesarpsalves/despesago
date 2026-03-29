import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Enhanced Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1D1D1F]/40 backdrop-blur-md"
          />

          {/* Premium Sheet Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.8 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, { offset, velocity }) => {
              if (offset.y > 120 || velocity.y > 600) {
                onClose();
              }
            }}
            className="absolute bottom-0 left-0 right-0 flex flex-col max-h-[92vh] bg-white rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.12)] border-t border-[#EBEBEB] overflow-hidden"
          >
            {/* Grab Handle */}
            <div className="flex items-center justify-center w-full pt-4 pb-2">
              <motion.div 
                whileHover={{ scaleX: 1.2 }}
                className="w-12 h-1.5 rounded-full bg-[#D2D2D7] active:bg-[#86868B] transition-colors" 
              />
            </div>

            {title && (
              <div className="flex items-center justify-center px-8 py-4 border-b border-[#F5F5F7]">
                <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-widest">{title}</h3>
              </div>
            )}

            {/* Scroll Container */}
            <div className="flex-1 px-8 pt-6 pb-12 overflow-y-auto overscroll-contain">
              <div className="relative z-10">
                {children}
              </div>
              
              {/* Bottom Safe Area Spacer */}
              <div className="h-safe-bottom" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
