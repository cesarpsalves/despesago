import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Save, ChevronLeft, Mail, Building, Bell, ShieldCheck } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
  const { user, updateUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState(user?.user_metadata?.full_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await axios.get('/company/me');
        setCompany(res.data);
      } catch (err) {
        console.error('Erro ao buscar empresa:', err);
      }
    };
    fetchCompany();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await updateUser({ data: { full_name: userName } });
      if (error) throw error;
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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
      toast.success('Senha alterada com sucesso!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
    <div className="flex items-start gap-4 mb-8 pb-6 border-b border-[#F5F5F7]">
      <div className="w-12 h-12 bg-[#F5F5F7] rounded-3xl flex items-center justify-center text-[#1D1D1F] shadow-sm">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F]">{title}</h3>
        <p className="text-[#86868B] text-[11px] font-bold uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <AppLayout title="Configurações">
      <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-24">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 mb-10 text-[#86868B] hover:text-[#1D1D1F] transition-all group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Painel Administrativo</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-premium border border-[#EBEBEB]">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#1D1D1F] rounded-[32px] flex items-center justify-center text-white font-bold text-3xl shadow-premium mb-6 overflow-hidden">
                  <span className="relative z-10">{userName[0] || user?.email?.[0]?.toUpperCase()}</span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-transparent" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">{userName || 'Usuário'}</h2>
                <span className="mt-2 px-3 py-1 bg-[#F5F5F7] rounded-full text-[10px] font-bold text-[#86868B] uppercase tracking-widest">
                  Colaborador Ativo
                </span>
                
                <div className="w-full mt-10 space-y-4 pt-8 border-t border-[#F5F5F7]">
                  <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-[#F5F5F7] transition-all">
                    <Building size={18} className="text-[#86868B]" />
                    <div>
                      <p className="text-[9px] font-bold text-[#D2D2D7] uppercase tracking-widest leading-none mb-1">Empresa</p>
                      <p className="text-sm font-bold text-[#1D1D1F]">{company?.name || 'Recuperando...'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-[#F5F5F7] transition-all">
                    <Mail size={18} className="text-[#86868B]" />
                    <div className="max-w-[200px] overflow-hidden">
                      <p className="text-[9px] font-bold text-[#D2D2D7] uppercase tracking-widest leading-none mb-1">E-mail</p>
                      <p className="text-sm font-bold text-[#1D1D1F] truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              fullWidth 
              size="lg"
              onClick={signOut}
              className="rounded-[24px] border-[#EBEBEB] text-[#E03131] hover:bg-rose-50 hover:border-rose-100 h-14 font-bold"
            >
              Encerrar Sessão
            </Button>
          </div>

          {/* Forms Area */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[32px] shadow-premium border border-[#EBEBEB]"
            >
              <SectionHeader 
                icon={User} 
                title="Perfil do Usuário" 
                subtitle="Identificação e Comunicação Profissional" 
              />
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    className="w-full bg-[#F5F5F7] border border-transparent rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-[#EBEBEB] transition-all text-[#1D1D1F] font-medium"
                    placeholder="Seu nome profissional"
                  />
                </div>
                <Button type="submit" disabled={loading} size="lg" className="rounded-2xl">
                  <Save size={18} className="mr-2" />
                  Atualizar Dados
                </Button>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-10 rounded-[32px] shadow-premium border border-[#EBEBEB]"
            >
              <SectionHeader 
                icon={ShieldCheck} 
                title="Segurança" 
                subtitle="Proteção e Controle de Acesso" 
              />
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Nova Senha</label>
                    <input 
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full bg-[#F5F5F7] border border-transparent rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-[#EBEBEB] transition-all text-[#1D1D1F] font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Confirmar Senha</label>
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full bg-[#F5F5F7] border border-transparent rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-[#EBEBEB] transition-all text-[#1D1D1F] font-medium"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} variant="secondary" size="lg" className="rounded-2xl">
                  Alterar Senha de Acesso
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
