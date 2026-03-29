import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Logo: React.FC<{ className?: string; showText?: boolean; size?: 'sm' | 'md' | 'lg' }> = ({ 
  className = "", 
  showText = true,
  size = 'md'
}) => {
  const navigate = useNavigate();

  const iconSizes = {
    sm: "w-6 h-6 rounded-lg",
    md: "w-9 h-9 rounded-xl",
    lg: "w-12 h-12 rounded-2xl"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl"
  };

  return (
    <div 
      className={`flex items-center gap-2.5 group cursor-pointer transition-all duration-300 ${className}`} 
      onClick={() => navigate('/app')}
      role="button"
      aria-label="Ir para o Início"
    >
      <div className="relative flex items-center justify-center transition-all duration-300 group-hover:scale-105 active:scale-95">
        <div className={`${iconSizes[size]} bg-white shadow-soft border border-[#EBEBEB] flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-premium`}>
          <img 
            src="/logo/logo_preto_fundo_transparente.png" 
            alt="dg" 
            className="w-[70%] h-[70%] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                parent.innerHTML = '<span class="text-[#000000] font-black italic">dg</span>';
              }
            }}
          />
        </div>
      </div>
      
      {showText && (
        <span className={`${textSizes[size]} font-extrabold tracking-tighter text-[#1D1D1F] leading-none select-none italic`}>
          DespesaGo
        </span>
      )}
    </div>
  );
};
