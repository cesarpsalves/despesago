import { useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAuth } from '../contexts/AuthContext.js';
import { Building, User, ArrowRight, LogOut, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { toast } from 'sonner';

export default function Onboarding() {
  const { checkCompanyStatus, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ companyName: '', document: '', userName: '' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await axios.post('/company/onboarding', form, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 20000 
        });

        console.log('Resposta do onboarding:', response.data);
        toast.success('Ambiente corporativo provisionado!');

        setTimeout(async () => {
          try {
            await checkCompanyStatus();
            navigate('/set-password');
          } catch (error) {
            navigate('/set-password');
          }
        }, 1500);
      } catch (error) {
      console.error('Erro no onboarding:', error);

      interface ApiErrorResponse {
        error?: string;
        message?: string;
      }

      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 
                          axiosError.response?.data?.message || 
                          axiosError.message || '';

      if (errorMessage.includes('já está vinculado')) {
        toast.info('Identificamos uma equipe vinculada. Acessando...');
        await checkCompanyStatus();
        navigate('/app');
        return;
      }

      toast.error(
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Falha ao configurar ambiente. Tente novamente ou contate o suporte.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-50/20 via-transparent to-transparent">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={signOut}
        className="absolute top-8 right-8 flex items-center gap-2 text-[10px] font-bold text-[#86868B] hover:text-[#1D1D1F] uppercase tracking-widest transition-all"
      >
        <LogOut size={14} />
        Encerrar Sessão
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 flex flex-col items-center"
      >
        <motion.button 
          whileHover={{ x: -4 }}
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 mb-8 text-[#86868B] hover:text-[#1D1D1F] transition-all"
        >
          <ChevronLeft size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Voltar para o site</span>
        </motion.button>
        <Logo size="lg" className="mb-8" />
        <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Configuração Final</h1>
        <p className="text-[#86868B] mt-2 font-medium">Estamos a poucos passos de simplificar sua gestão.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-10 rounded-[32px] shadow-premium border border-[#EBEBEB] w-full max-w-lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Instituição / Empresa</label>
            <div className="relative group">
              <Building className="absolute left-4 top-3.5 w-5 h-5 text-[#D2D2D7] group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                value={form.companyName}
                onChange={e => setForm({ ...form, companyName: e.target.value })}
                required
                className="pl-12 pr-4 py-3.5 w-full bg-[#F5F5F7] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#EBEBEB] transition-all text-[#1D1D1F] font-medium"
                placeholder="Ex: Razão Social ou Nome Fantasia"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Representante da Conta</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-[#D2D2D7] group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                value={form.userName}
                onChange={e => setForm({ ...form, userName: e.target.value })}
                required
                className="pl-12 pr-4 py-3.5 w-full bg-[#F5F5F7] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#EBEBEB] transition-all text-[#1D1D1F] font-medium"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-2xl flex items-start gap-3 border border-emerald-100">
            <ShieldCheck size={18} className="text-emerald-600 mt-0.5" />
            <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
              Ao continuar, você concorda em criar um ambiente seguro sob os <span className="underline cursor-pointer">Termos de Uso Corporativo</span> do DespesaGo.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            fullWidth
            size="lg"
            className="mt-2 rounded-2xl"
          >
            {loading ? 'Provisionando ambiente...' : 'Finalizar e Acessar'}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
