import { useAuth } from '../../contexts/AuthContext';
import { LogOut, LayoutDashboard, Shield, Camera, CreditCard, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export const AppLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({ children }) => {
  const { role, signOut, isPlatformAdmin } = useAuth();
  const isAdmin = role === 'admin';
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans pb-24 md:pb-0 text-left">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 glass z-50 border-b border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">
          <Link to="/app" className="flex items-center gap-2 group">
            <Logo size="sm" />
          </Link>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/app?view=scanner&trigger=true')}
              className="hidden sm:flex items-center text-[#1D1D1F]"
            >
              <Camera size={16} className="mr-2" />
              <span className="font-bold text-[10px] uppercase tracking-widest">Escanear Recibo</span>
            </Button>

            {isPlatformAdmin && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/platform')}
                className="text-emerald-600 hover:bg-emerald-50 border-emerald-100"
              >
                <Shield className="w-4 h-4 mr-2" />
                <span className="font-bold text-[10px] uppercase tracking-widest">Plataforma</span>
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/app/profile')}
              className="px-3"
            >
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline font-bold text-[10px] uppercase tracking-widest">Meu Perfil</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-[#86868B] hover:text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline font-bold text-[10px] uppercase tracking-widest">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Padding otimizado para não 'achatar' em landscape ou telas curtas */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-44 md:pb-12 max-w-7xl mx-auto w-full transition-all duration-300">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-[#F5F5F7] z-[60] pb-safe-offset-4 shadow-top-premium">
        <div className="flex justify-around items-center h-22 px-6 max-w-lg mx-auto relative">
          <button 
            onClick={() => navigate('/')}
            className={`flex flex-col items-center gap-1.5 transition-all ${location.pathname === '/' ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}
          >
            <div className={`p-2.5 rounded-[14px] transition-all ${location.pathname === '/' ? 'bg-[#1D1D1F] text-white shadow-premium-dark scale-110' : 'hover:bg-[#F5F5F7]'}`}>
              <LayoutDashboard size={20} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5">Painel</span>
          </button>

          <div className="flex items-center justify-center -mt-12 relative">
            <button 
              onClick={() => navigate('/?view=scanner')}
              className="w-18 h-18 bg-[#1D1D1F] rounded-[28px] text-white flex items-center justify-center shadow-premium-dark border-[6px] border-white active:scale-90 transition-all group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Camera size={28} className="relative z-10 group-active:scale-110 transition-transform" />
            </button>
            <span className="absolute -bottom-7 text-[9px] font-black text-[#1D1D1F] uppercase tracking-[0.2em] whitespace-nowrap bg-white/50 px-3 py-1 rounded-full backdrop-blur-md">Escanear</span>
          </div>

          <button 
            onClick={() => navigate('/app/subscription')}
            className={`flex flex-col items-center gap-1.5 transition-all ${location.pathname === '/app/subscription' ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}
          >
            <div className={`p-2.5 rounded-[14px] transition-all ${location.pathname === '/app/subscription' ? 'bg-[#1D1D1F] text-white shadow-premium-dark scale-110' : 'hover:bg-[#F5F5F7]'}`}>
              <CreditCard size={20} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5">Plano</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
