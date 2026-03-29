import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Mail, ArrowRight, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { SEO } from '../components/SEO';
import { toast } from 'sonner';
import { Turnstile } from '@marsidev/react-turnstile';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordLogin, setIsPasswordLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const { signInWithEmail, signInWithPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[32px] shadow-premium border border-[#EBEBEB] text-center max-w-sm w-full"
      >
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-6">
          <Mail size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-[#1D1D1F]">Verifique seu E-mail</h2>
        <p className="text-[#86868B] text-sm font-medium leading-relaxed">
          Enviamos um acesso seguro para <br/>
          <span className="text-[#1D1D1F] font-bold">{email}</span>.
        </p>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => setSent(false)}
          className="mt-8 text-[10px] tracking-widest uppercase"
        >
          Voltar ao login
        </Button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/20 via-transparent to-transparent overflow-y-auto">
      <SEO title="Entrar" description="Acesse sua conta profissional no DespesaGo para gerenciar suas despesas corporativas." />

      {/* Navegação Superior - Ajustada para não sobrepor no Mobile */}
      <header className="absolute top-0 left-0 right-0 p-6 sm:p-8 flex justify-between items-center z-10 w-full">
        <Logo size="sm" />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="text-[#86868B] hover:text-[#1D1D1F] transition-colors"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span className="font-bold text-[10px] uppercase tracking-widest hidden sm:inline">Voltar para o site</span>
          </div>
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-5 sm:p-10 pt-20 sm:pt-0 w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm px-1 sm:px-0"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mb-2">Acessar Conta</h1>
            <p className="text-sm text-[#86868B] font-medium uppercase tracking-widest">DespesaGo Business</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5 md:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">E-mail Profissional</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[#D2D2D7] group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="pl-12 pr-4 py-3.5 w-full bg-white border border-[#EBEBEB] rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-[#1D1D1F] font-medium shadow-sm"
                  placeholder="nome@suaempresa.com"
                />
              </div>
            </div>

            {isPasswordLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Senha</label>
                    <button 
                      type="button"
                      onClick={async () => {
                        if (!email) return toast.warning("Digite seu e-mail profissional primeiro.");
                        const { error } = await resetPassword(email);
                        if (error) toast.error(error.message);
                        else toast.success("Link enviado para " + email);
                      }}
                      className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[#D2D2D7] group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="pl-12 pr-4 py-3.5 w-full bg-white border border-[#EBEBEB] rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-[#1D1D1F] font-medium shadow-sm"
                      placeholder="Sua senha corporativa"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              fullWidth
              size="lg"
              className="mt-2 h-14 rounded-xl shadow-lg shadow-emerald-500/10"
            >
              {loading ? 'Processando...' : isPasswordLogin ? 'Entrar' : 'Receber Acesso Mágico'} 
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>

            <button
              type="button"
              onClick={() => setIsPasswordLogin(!isPasswordLogin)}
              className="text-[10px] font-bold text-[#86868B] hover:text-[#1D1D1F] uppercase tracking-widest transition-all mt-2 text-center"
            >
              {isPasswordLogin ? 'Usar Link por E-mail' : 'Entrar com Senha (Adm)'}
            </button>

            <div className="mt-8 flex justify-center scale-90 opacity-60 hover:opacity-100 transition-opacity min-h-[65px]">
              <Turnstile 
                siteKey={'0x4AAAAAACw_ETlhwO3aqZ9d'} 
                onSuccess={(token) => setCaptchaToken(token)}
                options={{
                  appearance: 'interaction-only',
                  theme: 'light',
                }}
              />
            </div>
          </form>
        </motion.div>
      </div>

      {/* Footer minimalista para evitar visual 'vazio' em telas longas (S20 Ultra) */}
      <footer className="mt-auto p-8 text-center sm:hidden">
        <p className="text-[9px] font-bold text-[#D2D2D7] uppercase tracking-[0.2em]">© 2026 DespesaGo Pro</p>
      </footer>
    </div>
  );
}
