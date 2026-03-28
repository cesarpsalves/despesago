import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext.js';
import { Building, User, ArrowRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';

export default function Onboarding() {
  const { checkCompanyStatus, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ companyName: '', document: '', userName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/company/onboarding', form);
      await checkCompanyStatus(); 
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro interno ao provisionar ambiente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 relative">
      <button 
        onClick={signOut}
        className="absolute top-6 right-6 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
      >
        <LogOut size={16} />
        Sair da conta
      </button>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <button 
          onClick={() => window.location.href = '/'} 
          className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-100 transition-all mb-4"
        >
          <img src="/logo/logo_preto_fundo_transparente.png" alt="DespesaGo" className="h-6" />
          <span className="text-sm font-bold text-slate-400 group-hover:text-slate-900 transition-colors">Voltar para o site</span>
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Configure sua equipe</h1>
        <p className="text-slate-500 mt-2 font-medium">Crie o espaço de trabalho da sua empresa em segundos.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 w-full max-w-md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={form.companyName}
                onChange={e => setForm({ ...form, companyName: e.target.value })}
                required
                className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all outline-none text-slate-900"
                placeholder="Ex: Empresa Tech Inc"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Seu Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={form.userName}
                onChange={e => setForm({ ...form, userName: e.target.value })}
                required
                className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
                placeholder="Ex: João Silva"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            fullWidth
            className="mt-4"
          >
            {loading ? 'Criando espaço...' : 'Ir para o Dashboard'} 
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
