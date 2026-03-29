import { useState } from 'react';
import { supabase } from '../services/supabase';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("As senhas não conferem.");
    }
    if (password.length < 6) {
      return toast.error("A senha deve ter pelo menos 6 caracteres.");
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Segurança atualizada com sucesso!");
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/20 via-transparent to-transparent">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 flex flex-col items-center"
      >
        <Logo size="lg" className="mb-8" />
        <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Segurança da Conta</h1>
        <p className="text-[#86868B] mt-2 font-medium">Defina uma nova credencial robusta para seu acesso.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-10 rounded-[32px] shadow-premium border border-[#EBEBEB] w-full max-w-md"
      >
        <form onSubmit={handleReset} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Nova Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[#D2D2D7] group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="pl-12 pr-4 py-3.5 w-full bg-[#F5F5F7] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#EBEBEB] transition-all text-[#1D1D1F] font-medium"
                placeholder="No mínimo 6 caracteres"
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
            className="mt-4 rounded-2xl"
          >
            {loading ? 'Salvando...' : 'Atualizar Credenciais'} 
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>

          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#86868B] hover:text-[#1D1D1F] uppercase tracking-widest transition-all mt-2"
          >
            <ChevronLeft size={14} />
            Voltar ao Login
          </button>
        </form>
      </motion.div>
    </div>
  );
}
