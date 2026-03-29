import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Mail, ArrowRight, Lock, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
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
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/20 via-transparent to-transparent">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-10 text-center"
      >
        <motion.button 
          whileHover={{ x: -4 }}
          onClick={() => window.location.href = '/'}
          className="group flex items-center gap-2 mb-8 text-[#86868B] hover:text-[#1D1D1F] transition-all"
        >
          <ChevronLeft size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Voltar para o site</span>
        </motion.button>
        <Logo size="lg" className="mb-8" />
        <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Olá novamente.</h1>
        <p className="text-[#86868B] mt-2 font-medium">Use seu e-mail profissional para acessar.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-10 rounded-[32px] shadow-premium border border-[#EBEBEB] w-full max-w-md"
      >
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">E-mail Profissional</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[#D2D2D7] group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="pl-12 pr-4 py-3.5 w-full bg-[#F5F5F7] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#EBEBEB] transition-all text-[#1D1D1F] font-medium"
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
                    className="pl-12 pr-4 py-3.5 w-full bg-[#F5F5F7] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#EBEBEB] transition-all text-[#1D1D1F] font-medium"
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
            className="mt-2"
          >
            {loading ? 'Processando...' : isPasswordLogin ? 'Entrar' : 'Receber Acesso Mágico'} 
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>

          <button
            type="button"
            onClick={() => setIsPasswordLogin(!isPasswordLogin)}
            className="text-[10px] font-bold text-[#86868B] hover:text-[#1D1D1F] uppercase tracking-widest transition-all mt-2"
          >
            {isPasswordLogin ? 'Usar Link por E-mail' : 'Entrar com Senha (Adm)'}
          </button>

          <div className="mt-4 flex justify-center scale-90 opacity-50 hover:opacity-100 transition-opacity">
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
  );
}
