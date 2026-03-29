import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ 
  className = "", 
  showText = true 
}) => {
  const navigate = useNavigate();
  const baseStyles = "bg-slate-100/80 animate-pulse";

  return (
    <div 
      className={`flex items-center gap-3 group cursor-pointer group transition-all duration-300 ${className}`} 
      onClick={() => navigate('/app')}
    >
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105 active:scale-95">
        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden group-hover:shadow-md transition-shadow">
          <img 
            src="/logo/logo_preto_fundo_transparente.png" 
            alt="dg" 
            className="w-7 h-7 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('span');
                fallback.className = "text-indigo-600 font-black text-xl italic";
                fallback.innerText = "dg";
                parent.appendChild(fallback);
              }
            }}
          />
        </div>
        <div className="absolute -inset-1 bg-indigo-500/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-none">
            Despesa<span className="text-brand-600">Go</span>
          </span>
        </div>
      )}
    </div>
  );
};
