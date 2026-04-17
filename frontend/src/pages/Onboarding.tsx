import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, ArrowRight, LogOut, Layout, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { SEO } from '../components/SEO';
import { toast } from 'sonner';
import axios from 'axios';

export default function Onboarding() {
  const [companyName, setCompanyName] = useState('');
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signOut, checkCompanyStatus, requireOnboarding, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Se o usuário já tiver empresa, redireciona para o app
  useEffect(() => {
    if (!authLoading && !requireOnboarding && user) {
      navigate('/app', { replace: true });
    }
  }, [user, requireOnboarding, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return toast.error('Nome da empresa é obrigatório');

    setLoading(true);
    try {
      await axios.post('/company/onboarding', { 
        companyName: companyName,
        document: document || undefined 
      });
      await checkCompanyStatus();
      toast.success('Empresa configurada com sucesso!');
      navigate('/app', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/20 via-transparent to-transparent overflow-y-auto">
      <SEO title="Configuração" description="Finalize a configuração da sua empresa no DespesaGo." />

      {/* Navegação Superior - Absolute para evitar sobreposição */}
      <header className="absolute top-0 left-0 right-0 p-6 sm:p-8 flex justify-between items-center z-10 w-full">
        <Logo size="sm" disabled />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => signOut()}
          className="text-[#86868B] hover:text-[#FF3B30] transition-colors"
        >
          <div className="flex items-center gap-2">
            <LogOut size={16} />
            <span className="font-bold text-[10px] uppercase tracking-widest hidden sm:inline">Encerrar Sessão</span>
          </div>
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-5 sm:p-10 pt-20 sm:pt-0 w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg px-1 sm:px-0"
        >
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
              <Zap size={12} fill="currentColor" />
              Configuração Final
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1D1D1F] tracking-tight mb-3">Bem-vindo ao DespesaGo</h1>
            <p className="text-[#86868B] text-sm md:text-base font-medium max-w-sm mx-auto leading-relaxed">
              Para começar, precisamos criar o perfil organizacional da sua empresa.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-premium border border-[#EBEBEB] relative overflow-hidden"
          >
            {/* Decoração sutil de fundo */}
            <div className="absolute top-0 right-0 p-8 text-emerald-50/50 -mr-8 -mt-8">
              <Layout size={160} strokeWidth={1} />
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Nome da Organização</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-4 w-5 h-5 text-[#D2D2D7] group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    required
                    className="pl-12 pr-4 py-4 w-full bg-[#F5F5F7] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all text-[#1D1D1F] font-semibold text-lg"
                    placeholder="Ex: Minha Empresa LTDA"
                  />
                </div>
                <p className="text-[10px] text-[#86868B] ml-1 font-medium italic">
                  Este nome será exibido nos relatórios e convites de funcionários.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">CNPJ (Opcional)</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-4 w-5 h-5 text-[#D2D2D7] group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    value={document}
                    onChange={e => setDocument(e.target.value)}
                    className="pl-12 pr-4 py-4 w-full bg-[#F5F5F7] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all text-[#1D1D1F] font-semibold text-lg"
                    placeholder="Ex: 00.000.000/0001-00"
                  />
                </div>
                <p className="text-[10px] text-[#86868B] ml-1 font-medium italic">
                  Usado para emissão de Notas Fiscais ao assinar a plataforma.
                </p>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={loading}
                  fullWidth
                  size="lg"
                  className="h-16 text-lg rounded-2xl shadow-xl shadow-emerald-500/10"
                >
                  {loading ? 'Configurando...' : 'Criar Empresa & Começar'} 
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </div>
            </form>
          </motion.div>

          <p className="text-center mt-10 text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
            Logado como: <span className="text-[#1D1D1F]">{user?.email}</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
