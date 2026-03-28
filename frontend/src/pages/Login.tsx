import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Mail, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordLogin, setIsPasswordLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const { signInWithEmail, signInWithPassword, resetPassword } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let error;
    if (isPasswordLogin) {
      const result = await signInWithPassword(email, password, captchaToken);
      error = result.error;
    } else {
      const result = await signInWithEmail(email, captchaToken);
      error = result.error;
      if (!error) setSent(true);
    }

    setLoading(false);
    if (error) {
      toast.error(error.message);
    }
  };

  if (sent) return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 text-center max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Verifique seu email</h2>
        <p className="text-gray-500">Enviamos um link mágico corporativo para <span className="font-medium text-gray-900">{email}</span>. Clique no link para acessar seu painel.</p>
        <button 
          onClick={() => setSent(false)}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Voltar para o login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
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
        className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 w-full max-w-sm"
      >
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Profissional</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
                placeholder="voce@suaempresa.com"
              />
            </div>
          </div>

          {isPasswordLogin && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Senha</label>
                <button 
                  type="button"
                  onClick={async () => {
                    if (!email) return toast.warning("Digite seu email profissional primeiro.");
                    const { error } = await resetPassword(email);
                    if (error) toast.error(error.message);
                    else toast.success("Link de recuperação enviado para " + email);
                  }}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
                  placeholder="Sua senha corporativa"
                />
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            fullWidth
            className="mt-4"
          >
            {loading ? 'Aguarde...' : isPasswordLogin ? 'Entrar' : 'Receber Link Mágico'} 
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>

          <button
            type="button"
            onClick={() => setIsPasswordLogin(!isPasswordLogin)}
            className="text-sm font-medium text-slate-400 hover:text-brand-600 transition-colors mt-4"
          >
            {isPasswordLogin ? 'Voltar para Link Mágico' : 'Entrar com Senha (gestores)'}
          </button>

          <div className="mt-6 flex justify-center">
            <Turnstile 
              siteKey={'0x4AAAAAACw_ETlhwO3aqZ9d'} 
              onSuccess={(token) => setCaptchaToken(token)}
            />
          </div>
        </form>
      </motion.div>
    </div>
  );
}
