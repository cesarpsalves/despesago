import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
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
      
      toast.success('Senha definida com sucesso! Agora você pode acessar o DespesaGo usando seu e-mail e esta senha.');
      navigate('/app');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao definir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 max-w-md"
      >
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Segurança da Conta</h1>
        <p className="text-slate-500 mt-2 font-medium">
          Para sua segurança e facilidade de acesso futuro, crie uma senha corporativa.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 w-full max-w-sm"
      >
        <form onSubmit={handleSetPassword} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
                placeholder="Repita a senha"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            fullWidth
            className="mt-4 py-6 text-base font-bold"
          >
            {loading ? 'Salvando...' : 'Concluir Configuração'} 
            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>

          <button
            type="button"
            onClick={() => navigate('/app')}
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors mt-4"
          >
            Pular por enquanto
          </button>
        </form>
      </motion.div>
    </div>
  );
}
