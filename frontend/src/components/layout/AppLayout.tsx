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
              onClick={() => {
                if (location.pathname !== '/app') navigate('/app');
                setTimeout(() => document.getElementById("fileInput")?.click(), 100);
              }}
              className="hidden sm:flex items-center text-[#1D1D1F]"
            >
              <Camera size={16} className="mr-2" />
              <span className="font-bold text-[10px] uppercase tracking-widest">Novo Recibo</span>
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

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-32 md:pb-12 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[#EBEBEB] pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          <button 
            onClick={() => navigate('/app')}
            className={`flex flex-col items-center justify-center w-full h-full active:scale-90 transition-all ${
              isActive('/app') ? 'text-emerald-500' : 'text-[#86868B]'
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tight">Início</span>
          </button>
          
          {/* Central Button: Scan for Anyone with Company */}
          <div className="relative w-full flex justify-center h-full">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute -top-6 flex items-center justify-center w-16 h-16 bg-[#1D1D1F] text-white rounded-full shadow-premium border-4 border-white"
              onClick={() => {
                if (location.pathname !== '/app') navigate('/app');
                setTimeout(() => document.getElementById("fileInput")?.click(), 100);
              }}
            >
              <Camera size={26} />
            </motion.button>
            <span className="absolute bottom-2 text-[10px] font-bold text-[#86868B] uppercase tracking-tight">Escanear</span>
          </div>

          <button 
            onClick={() => navigate('/app/profile')}
            className={`flex flex-col items-center justify-center w-full h-full active:scale-95 transition-all ${
              isActive('/app/profile') ? 'text-emerald-500' : 'text-[#86868B]'
            }`}
          >
            <User size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tight">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
