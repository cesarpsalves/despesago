import { useAuth } from '../../contexts/AuthContext';
import { Home, Camera, LogOut, CreditCard, ShieldCheck } from 'lucide-react';
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
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-4 sm:px-6 h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/app')}>
            <img src="/logo/logo_preto_fundo_transparente.png" alt="DespesaGo" className="h-6 opacity-90" />
            <span className="font-semibold tracking-tight text-slate-800 hidden sm:inline-block">
              {title || (isAdmin ? 'Painel Admin' : 'Painel')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {isPlatformAdmin && (
              <button 
                onClick={() => navigate('/superadmin')}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
                  isActive('/superadmin') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
              >
                <ShieldCheck size={16} />
                <span>Gestão Global</span>
              </button>
            )}
            {isAdmin && (
              <button 
                onClick={() => navigate('/app/subscription')}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isActive('/app/subscription') ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <CreditCard size={16} />
                <span>Minha Assinatura</span>
              </button>
            )}
            <button 
              onClick={signOut} 
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-200"
              title="Sair do sistema"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white cursor-pointer" onClick={() => navigate('/app')}>
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-6">
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
