import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error('A senha deve ter pelo menos 6 caracteres.');
    }
    if (password !== confirmPassword) {
      return toast.error('As senhas não coincidem.');
    }

    setLoading(true);
    try {
      const { error } = await updateUser({ password });
      if (error) throw error;
      
      toast.success('Ambiente provisionado com total segurança!');
      navigate('/app');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao definir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-50/20 via-transparent to-transparent">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 flex flex-col items-center max-w-md"
      >
        <div className="w-16 h-16 bg-white rounded-[24px] shadow-premium flex items-center justify-center mb-10 text-[#1D1D1F]">
          <ShieldCheck size={32} />
        </div>
        <Logo size="md" className="mb-6" />
        <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Defina sua Senha</h1>
        <p className="text-[#86868B] mt-2 font-medium leading-relaxed">
          Para garantir a integridade dos seus dados corporativos, crie uma senha robusta para acesso futuro.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-10 rounded-[32px] shadow-premium border border-[#EBEBEB] w-full max-w-md"
      >
        <form onSubmit={handleSetPassword} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Senha de Acesso</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[#D2D2D7] group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="pl-12 pr-4 py-3.5 w-full bg-[#F5F5F7] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#EBEBEB] transition-all text-[#1D1D1F] font-medium"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Confirmar Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[#D2D2D7] group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="pl-12 pr-4 py-3.5 w-full bg-[#F5F5F7] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#EBEBEB] transition-all text-[#1D1D1F] font-medium"
                placeholder="Repita a nova senha"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            fullWidth
            size="lg"
            className="mt-2 rounded-2xl h-14"
          >
            {loading ? 'Salvando...' : 'Finalizar Configuração'} 
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>

          <button
            type="button"
            onClick={() => navigate('/app')}
            className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#86868B] hover:text-[#1D1D1F] uppercase tracking-widest transition-all mt-2"
          >
            <ChevronLeft size={14} />
            Configurar depois
          </button>
        </form>
      </motion.div>
    </div>
  );
}
