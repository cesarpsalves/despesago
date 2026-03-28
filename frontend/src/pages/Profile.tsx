import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Save, ArrowLeft, Mail, Building } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
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

  return (
    <AppLayout title="Meus Dados">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <button 
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Coluna da Esquerda: Resumo */}
          <div className="space-y-4">
            <Card className="p-6 text-center">
              <div className="w-24 h-24 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-brand-600 font-extrabold text-3xl shadow-sm border border-brand-100">
                {userName[0] || user?.email?.[0]?.toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{userName || 'Usuário'}</h2>
              <p className="text-sm text-slate-500 font-medium truncate mb-6">{user?.email}</p>
              
              <div className="pt-6 border-t border-slate-50 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Building size={16} className="text-slate-400" />
                  <span className="text-slate-600 font-bold">{company?.name || 'Carregando...'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-slate-500 font-medium truncate">{user?.email}</span>
                </div>
              </div>
            </Card>

            <Button 
              variant="outline" 
              fullWidth 
              onClick={signOut}
              className="border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
            >
              Sair da Conta
            </Button>
          </div>

          {/* Coluna da Direita: Formulários */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-brand-500" />
                Informações Pessoais
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Nome Completo</label>
                  <input 
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900 font-medium"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  <Save size={18} className="mr-2" />
                  Salvar Alterações
                </Button>
              </form>
            </Card>

            <Card className="p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Lock size={20} className="text-brand-500" />
                Segurança (Senha)
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Nova Senha</label>
                    <input 
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirmar Senha</label>
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900 font-medium"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} variant="secondary">
                  Atualizar Senha
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
