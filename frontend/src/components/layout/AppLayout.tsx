import { useAuth } from '../../contexts/AuthContext';
import { Home, Camera, LogOut, UserCircle, Globe, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

export const AppLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  const { role, user, signOut, isPlatformAdmin } = useAuth();
  const isAdmin = role === 'admin';
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-24 md:pb-0 text-left">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 h-16">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/app')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center p-1.5 group-hover:bg-brand-600 transition-colors shrink-0">
              <img src="/logo/favicon.png" alt="DG" className="w-full h-full brightness-0 invert" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 hidden xs:inline-block">
              {title || (location.pathname.startsWith('/platform') ? 'Painel Global' : 'Painel da Empresa')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {isPlatformAdmin && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 border-none hover:bg-slate-800 text-white shadow-xl shadow-brand-500/10 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                onClick={() => navigate('/platform')}
              >
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                Painel Global
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/app/profile')}
              className="text-slate-600 hover:text-brand-600 hover:bg-brand-50/80 rounded-xl border border-transparent hover:border-brand-100 px-3 sm:px-4 transition-all"
            >
              <UserCircle className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline font-bold text-xs uppercase tracking-tight">Meus Dados</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-slate-400 hover:text-red-600 hover:bg-red-50/80 rounded-xl border border-transparent hover:border-red-100 px-3 transition-all"
            >
              <LogOut className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline font-bold text-xs uppercase tracking-tight">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-24 md:pb-12 max-w-7xl mx-auto w-full transition-all duration-300">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          <button 
            onClick={() => navigate('/app')}
            className={`flex flex-col items-center justify-center w-full h-full active:scale-90 transition-all ${
              isActive('/app') ? 'text-brand-600' : 'text-slate-400'
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wide">Início</span>
          </button>
          
          {/* Slot Central: Camera (Employee) or Subscription (Admin) */}
          {isAdmin ? (
            <button 
              onClick={() => navigate('/app/subscription')}
              className={`flex flex-col items-center justify-center w-full h-full active:scale-90 transition-all ${
                isActive('/app/subscription') ? 'text-brand-600' : 'text-slate-400'
              }`}
            >
              <CreditCard size={20} />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wide">Plano</span>
            </button>
          ) : (
            <div className="relative w-full flex justify-center h-full">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="absolute -top-5 flex items-center justify-center w-14 h-14 bg-brand-500 text-white rounded-full shadow-[0_8px_32px_rgba(16,185,129,0.4)] border-4 border-white"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <Camera size={24} />
              </motion.button>
              <span className="absolute bottom-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Escanear</span>
            </div>
          )}

          <button 
            onClick={signOut}
            className="flex flex-col items-center justify-center w-full h-full text-slate-400 active:scale-95 transition-all hover:text-red-500"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wide">Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
