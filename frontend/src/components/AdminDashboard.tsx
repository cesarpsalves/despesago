import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CreditCard, AlertCircle, ShieldCheck, Building, LayoutDashboard, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { GettingStarted } from './dashboard/GettingStarted';
import { DashboardSkeleton } from './dashboard/DashboardSkeleton';
import { ExpenseDetailModal } from './ui/ExpenseDetailModal';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { isPlatformAdmin } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [company, setCompany] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('despesago_onboarding_dismissed') !== 'true';
  });
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const summaryRes = await axios.get('/company/dashboard/summary');
      const summaryData = summaryRes.data || {};
      
      const { 
        company: comp = {}, 
        recentExpenses = [], 
        stats: dashboardStats = { consumedCount: 0, limit: 50, monthlyTotal: 0 }, 
        members: dashboardMembers = [] 
      } = summaryData;
      
      setCompany(comp);
      setExpenses(Array.isArray(recentExpenses) ? recentExpenses : []);
      setStats(dashboardStats);
      setMembers(Array.isArray(dashboardMembers) ? dashboardMembers : []);
    } catch (err) {
      console.error('FetchData Error:', err);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isPlatformAdmin]);

  const handleToggleAdmin = (member: any) => {
    const isCurrentlyAdmin = member.role === 'admin';
    
    toast.custom((t) => (
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-2xl flex flex-col gap-4 max-w-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 font-bold">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Alterar Privilégios</h4>
            <p className="text-xs text-slate-500">{isCurrentlyAdmin ? 'Remover' : 'Conceder'} acesso de administrador para {member.display_name || member.email}?</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            className="flex-1 rounded-xl h-10 text-xs font-bold"
            onClick={async () => {
              try {
                await axios.patch(`/company/members/${member.id}`, { 
                  role: isCurrentlyAdmin ? 'employee' : 'admin' 
                });
                toast.dismiss(t);
                toast.success('Privilégios atualizados!');
                fetchData();
              } catch (err: any) {
                toast.error('Erro ao atualizar');
              }
            }}
          >
            Confirmar
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 rounded-xl h-10 text-xs font-bold"
            onClick={() => toast.dismiss(t)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/company/invite', { email: inviteEmail, role: 'employee' });
      toast.success('Convite enviado com sucesso!');
      setInviteEmail('');
      fetchData();
    } catch (err: any) {
      if (err.response?.data?.code === 'UPGRADE_REQUIRED') {
        toast.error(err.response.data.error);
      } else {
        toast.error(err.response?.data?.error || 'Erro ao enviar convite');
      }
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 md:space-y-10 pb-10 animate-in fade-in duration-700">
      {/* Banner de Modo Admin Global */}
      {isPlatformAdmin && (
        <div className="bg-brand-50 border border-brand-100 p-4 rounded-2xl flex items-center gap-3 text-brand-800 mb-6 shadow-sm">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="font-bold text-sm">Modo de Visualização Global</p>
            <p className="text-xs opacity-80">Você está acessando este painel como Administrador da Plataforma.</p>
          </div>
        </div>
      )}

      {/* Header de Boas-Vindas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Painel da Empresa 👋
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Gerenciando: <span className="text-slate-900 font-bold">{company?.name || 'sua empresa'}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${company?.plan === 'pro' || company?.plan === 'platform_admin' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
              {company?.plan === 'platform_admin' ? 'Acesso Admin' : (company?.plan === 'pro' ? 'Plano Pro' : 'Plano Free')}
            </span>
          </div>
          {company?.plan === 'free' && (
            <Button size="sm" onClick={() => navigate('/app/subscription')} className="font-bold shadow-lg shadow-brand-500/20">
              Upgrade
            </Button>
          )}
        </div>
      </div>

      {/* Guia de Onboarding Premium */}
      {showOnboarding && (
        <GettingStarted 
          onDismiss={() => {
            setShowOnboarding(false);
            localStorage.setItem('despesago_onboarding_dismissed', 'true');
          }} 
        />
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Mês */}
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Total do Mês</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Consolidado Equipe</p>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
            R$ {stats?.monthlyTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </p>
        </div>

        {/* Convite */}
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Convidar Equipe</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{members.length} membros ativos</p>
            </div>
          </div>
          <form onSubmit={handleInvite} className="flex flex-col gap-3 mt-auto w-full">
            <input 
              type="email" 
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="E-mail do time" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-all" 
              required 
            />
            <Button type="submit" size="sm" className="w-full rounded-xl font-bold">Convidar</Button>
          </form>
        </div>

        {/* Uso de IA */}
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Uso de IA</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Scan de Recibos</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-widest">Consumido</span>
              <span className="text-slate-900">{stats?.consumedCount || 0} / {stats?.limit || 50}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  ((stats?.consumedCount || 0) / (stats?.limit || 50)) > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, ((stats?.consumedCount || 0) / (stats?.limit || 50)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gestão de Equipe */}
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />
            Gestão de Equipe
          </h3>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {members.map((member) => (
              <div key={member.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-sm font-bold text-slate-500">
                    {member.display_name?.[0] || member.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{member.display_name || 'Usuário'}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    member.role === 'admin' ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {member.role === 'admin' ? 'Admin' : 'Membro'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAdmin(member)}
                    className="p-2 h-9 w-9 rounded-xl hover:bg-brand-50 hover:text-brand-600"
                  >
                    <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Despesas */}
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-500" />
            Despesas Recentes
          </h3>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-brand-600">Ver Tudo</Button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {expenses.map(exp => (
              <div 
                key={exp.id} 
                onClick={() => {
                  setSelectedExpense(exp);
                  setIsDetailOpen(true);
                }}
                className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/80 transition-all cursor-pointer border-b border-slate-50 last:border-0 group"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg font-bold text-slate-400 group-hover:bg-white group-hover:text-brand-500 transition-all shrink-0">
                    {exp.merchant?.[0] || 'D'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{exp.merchant}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      {new Date(exp.date).toLocaleDateString('pt-BR')} <span className="w-1 h-1 bg-slate-200 rounded-full" /> {exp.category || 'Geral'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-extrabold text-base text-slate-900 tracking-tighter">
                      R$ {Number(exp.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {exp.confidence < 0.8 && (
                      <span className="inline-flex items-center gap-1 text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                        <AlertCircle className="w-2 h-2"/> Conferir
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-sm italic">
                Nenhuma despesa recente.
              </div>
            )}
          </div>
        </div>
      </div>

      <ExpenseDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        expense={selectedExpense} 
      />
    </div>
  );
}
