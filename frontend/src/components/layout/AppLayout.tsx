import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Shield, Home, Camera, CreditCard } from 'lucide-react';
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
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-32 md:pb-12 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-[60] glass border-t border-[#EBEBEB] pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-4">
          <button 
            onClick={() => navigate('/app')}
            className={`flex flex-col items-center justify-center flex-1 h-full active:scale-90 transition-all gap-1 ${
              isActive('/app') ? 'text-[#1D1D1F]' : 'text-[#86868B]'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${isActive('/app') ? 'bg-[#1D1D1F]/5' : ''}`}>
              <Home size={20} strokeWidth={isActive('/app') ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">Painel</span>
          </button>
          
          {/* Central Button: Scan - Robust Implementation */}
          <div className="flex-1 flex justify-center -mt-10 relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#1D1D1F] text-white rounded-2xl shadow-premium border-[4px] border-[#F5F5F7] z-10"
              onClick={() => navigate('/app?view=scanner&trigger=true')}
            >
              <Camera size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
            </motion.button>
            <span className="absolute -bottom-10 text-[9px] font-bold text-[#86868B] uppercase tracking-wider whitespace-nowrap">Escanear</span>
          </div>

          <button 
            onClick={() => navigate('/app/profile')}
            className={`flex flex-col items-center justify-center flex-1 h-full active:scale-95 transition-all gap-1 ${
              isActive('/app/profile') ? 'text-[#1D1D1F]' : 'text-[#86868B]'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${isActive('/app/profile') ? 'bg-[#1D1D1F]/5' : ''}`}>
              <User size={20} strokeWidth={isActive('/app/profile') ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">Conta</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
