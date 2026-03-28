import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Camera, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export const AppLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  const { role, user, signOut } = useAuth();
  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-24 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-4 sm:px-6 h-16">
          <div className="flex items-center gap-2">
            <img src="/logo/logo_preto_fundo_transparente.png" alt="DespesaGo" className="h-6 opacity-90" />
            <span className="font-semibold tracking-tight text-slate-800 hidden sm:inline-block">
              {title || (isAdmin ? 'Admin' : 'Painel')}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={signOut} 
              className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold shadow-sm">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Only for Employees) */}
      {!isAdmin && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-around h-16">
            <button className="flex flex-col items-center justify-center w-full h-full text-brand-600">
              <Home size={20} />
              <span className="text-[10px] font-medium mt-1">Início</span>
            </button>
            
            {/* FAB */}
            <div className="relative w-full flex justify-center h-full">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="absolute -top-5 flex items-center justify-center w-14 h-14 bg-brand-500 text-white rounded-full shadow-[0_8px_32px_rgba(16,185,129,0.4)]"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <Camera size={24} />
              </motion.button>
              <span className="absolute bottom-2 text-[10px] font-medium text-slate-400">Escanear</span>
            </div>

            <button 
              onClick={signOut}
              className="flex flex-col items-center justify-center w-full h-full text-slate-400 focus:text-slate-900"
            >
              <LogOut size={20} />
              <span className="text-[10px] font-medium mt-1">Sair</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
