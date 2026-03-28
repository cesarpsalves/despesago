import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CreditCard, AlertCircle, ShieldCheck, Globe, Building, LayoutDashboard, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from './ui/Skeleton';
import { GettingStarted } from './dashboard/GettingStarted';
import { DashboardSkeleton } from './dashboard/DashboardSkeleton';
import { ExpenseDetailModal } from './ui/ExpenseDetailModal';

export default function AdminDashboard() {
  const { isPlatformAdmin } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [company, setCompany] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [viewMode, setViewMode] = useState<'company' | 'platform'>('company');
  const [platformData, setPlatformData] = useState<{ companies: any[], users: any[] }>({ companies: [], users: [] });
  const [members, setMembers] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('despesago_onboarding_dismissed') !== 'true';
  });
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Busca o sumário consolidado (Performance Fix)
      const summaryRes = await axios.get('/company/dashboard/summary');
      const { company: comp, recentExpenses, stats: dashboardStats, members: dashboardMembers } = summaryRes.data;
      
      setCompany(comp);
      setExpenses(recentExpenses);
      setStats(dashboardStats);
      setMembers(dashboardMembers || []);

      // 2. Busca dados de plataforma SE for admin (em paralelo)
      if (isPlatformAdmin) {
        const { data: companies } = await axios.get('/platform/companies');
        setPlatformData(prev => ({ ...prev, companies }));
        
        // Se a resposta do sumário indicar que somos platform admin puro (sem empresa), muda a view
        if (summaryRes.data.isPlatformAdmin) {
          setViewMode('platform');
        }
      }
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
          <div className="w-10 h-10 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
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
    } catch (err: any) {
      if (err.response?.data?.code === 'UPGRADE_REQUIRED') {
        toast.error(err.response.data.error);
      } else {
        toast.error(err.response?.data?.error || 'Erro ao enviar convite');
      }
    }
  };

  const handleUpgrade = async () => {
    try {
      setSubscribing(true);
      const res = await axios.post('/billing/subscribe', { cycle: 'MONTHLY' });
      if (res.data.paymentLink) {
        toast.success('Link de pagamento gerado! Redirecionando...');
        setTimeout(() => {
          window.open(res.data.paymentLink, '_blank');
          setSubscribing(false);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Upgrade Error:', err);
      const msg = err.response?.data?.error || 'Erro ao iniciar assinatura';
      toast.error(msg);
      setSubscribing(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      {/* Header de Boas-Vindas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">
              Olá! 👋
            </h1>
            {isPlatformAdmin && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-200">
                <ShieldCheck className="w-3 h-3" /> Super Admin
              </span>
            )}
          </div>
          <p className="text-slate-500 font-medium">
            {viewMode === 'company' 
              ? `Gerencie as despesas da ` 
              : `Gerenciamento Global da Plataforma `}
            <span className="text-slate-900 font-bold">
              {viewMode === 'company' ? (company?.name || 'sua empresa') : 'DespesaGo'}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isPlatformAdmin && (
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center shadow-inner">
              <button 
                onClick={() => setViewMode('company')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'company' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Building className="w-4 h-4" /> Minha Empresa
              </button>
              <button 
                onClick={() => setViewMode('platform')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'platform' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Globe className="w-4 h-4" /> Gestão Global
              </button>
            </div>
          )}
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${company?.plan === 'pro' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {company?.plan === 'pro' ? 'Plano Pro' : 'Plano Free'}
            </span>
          </div>
        </div>
      </div>

      {/* Guia de Onboarding Premium */}
      {viewMode === 'company' && showOnboarding && (
        <GettingStarted 
          onDismiss={() => {
            setShowOnboarding(false);
            localStorage.setItem('despesago_onboarding_dismissed', 'true');
          }} 
        />
      )}

      {viewMode === 'platform' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Empresas Totais</p>
              <h2 className="text-3xl font-black text-slate-900">{platformData.companies.length}</h2>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status Sistema</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <h2 className="text-lg font-bold text-slate-900 uppercase">Operacional</h2>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Versão SaaS</p>
              <h2 className="text-lg font-bold text-slate-900">v1.2.0 (Premium)</h2>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-indigo-50/10">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                Empresas Cadastradas
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] rounded-full uppercase tracking-tighter">Global</span>
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {platformData.companies.map(comp => (
                <div key={comp.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-lg font-bold text-indigo-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">{comp.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Data: {new Date(comp.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${comp.plan === 'pro' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                      {comp.plan === 'pro' ? 'PRO' : 'FREE'}
                    </span>
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-600 hover:bg-indigo-50">Detalhes</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Cards de Ação */}
          {/* Cards de Ação & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Total do Mês</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Consolidado Equipe</p>
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">
                R$ {stats?.monthlyTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Convidar Equipe</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{stats?.memberCount || 0} membros ativos</p>
                </div>
              </div>
              <form onSubmit={handleInvite} className="flex gap-2">
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="Ex: joao@empresa.com" 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all" 
                  required 
                />
                <Button type="submit" size="sm" className="px-6 rounded-2xl h-12 shadow-lg shadow-brand-500/10">
                  Convidar
                </Button>
              </form>
            </div>

            <div className={`bg-white p-8 rounded-[2rem] shadow-sm border ${company?.plan === 'pro' ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100'} flex flex-col justify-between hover:shadow-md transition-all group`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${company?.plan === 'pro' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'} rounded-2xl flex items-center justify-center transition-colors group-hover:scale-110`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {company?.plan === 'pro' ? 'Assinatura PRO' : 'Plano Free'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      {company?.plan === 'pro' ? 'Recursos ativos' : 'Limites do plano'}
                    </p>
                  </div>
                </div>
                {company?.plan === 'pro' && (
                  <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm shadow-emerald-200">
                    Ativo
                  </span>
                )}
              </div>

              {/* Barra de Progresso de IA */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uso de IA (Mês)</span>
                  <span className="text-xs font-black text-slate-900">
                    {stats?.consumedCount || 0} de {stats?.limit || 50}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      ((stats?.consumedCount || 0) / (stats?.limit || 50)) > 0.9 ? 'bg-rose-500' : 
                      ((stats?.consumedCount || 0) / (stats?.limit || 50)) > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, ((stats?.consumedCount || 0) / (stats?.limit || 50)) * 100)}%` }}
                  />
                </div>
              </div>

              <Button 
                variant="secondary"
                onClick={handleUpgrade} 
                disabled={subscribing || company?.plan === 'pro'}
                className={`w-full rounded-2xl h-12 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  subscribing || company?.plan === 'pro'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-none' 
                    : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200'
                }`}
              >
                {subscribing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                    <span>Processando...</span>
                  </div>
                ) : company?.plan === 'pro' ? (
                  'Plano Profissional'
                ) : (
                  'Fazer Upgrade Agora'
                )}
              </Button>
            </div>
          </div>
        </>
      )}


      {/* Gestão de Equipe */}
      {viewMode === 'company' && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              Gestão de Equipe
              <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] rounded-full uppercase tracking-tighter">Membros Ativos</span>
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {members.map((member) => (
              <div key={member.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-lg font-bold text-slate-400">
                    {member.display_name?.[0] || member.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-base">{member.display_name || 'Usuário'}</p>
                    <p className="text-xs text-slate-400 font-medium">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    member.role === 'admin' 
                      ? 'bg-brand-50 text-brand-700 border-brand-100' 
                      : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {member.role === 'admin' ? 'Administrador' : 'Colaborador'}
                  </span>
                  
                  {/* Botão de Toggle - Só habilitado se for Administrador */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAdmin(member)}
                    className="p-2 h-10 w-10 rounded-2xl hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    title={member.role === 'admin' ? "Remover privilégios" : "Tornar administrador"}
                  >
                    <ShieldCheck size={20} />
                  </Button>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                Nenhum membro encontrado.
              </div>
            )}
          </div>
        </div>
      )}


      {/* Lista de Despesas */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            Despesas da Equipe
            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] rounded-full uppercase tracking-tighter">Real-time</span>
          </h3>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-brand-600 hover:bg-brand-50">Ver Tudo</Button>
        </div>
        <div className="divide-y divide-slate-50">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="p-8 flex items-center justify-between animate-pulse">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-slate-50 rounded-md" />
                    <div className="h-3 w-28 bg-slate-50/50 rounded-md" />
                  </div>
                </div>
                <div className="h-6 w-24 bg-slate-50 rounded-md" />
              </div>
            ))
          ) : (
            <>
              {expenses.map(exp => (
                <div 
                  key={exp.id} 
                  onClick={() => {
                    setSelectedExpense(exp);
                    setIsDetailOpen(true);
                  }}
                  className="p-8 flex items-center justify-between hover:bg-slate-50/80 transition-all cursor-pointer group active:scale-[0.99] border-l-4 border-l-transparent hover:border-l-brand-500"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-lg font-bold text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all group-hover:text-brand-500">
                      {exp.merchant?.[0] || 'D'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">{exp.merchant}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        {new Date(exp.date).toLocaleDateString('pt-BR')} <span className="w-1 h-1 bg-slate-200 rounded-full" /> {exp.category || 'Geral'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-extrabold text-xl text-slate-900 tracking-tighter">
                        R$ {Number(exp.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {exp.confidence < 0.8 && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full mt-1.5 uppercase tracking-tighter">
                          <AlertCircle className="w-3 h-3"/> Conferir
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="p-16 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                    <Users className="text-slate-200 w-10 h-10" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900">Comece agora!</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-[300px] mx-auto font-medium">
                    Sua equipe ainda não enviou despesas. Que tal convidar seu primeiro colaborador acima?
                  </p>
                  <div className="mt-8 flex justify-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-brand-500 mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Convite</span>
                    </div>
                    <div className="w-12 h-[1px] bg-slate-100 mt-1" />
                    <div className="flex flex-col items-center opacity-30">
                      <div className="w-2 h-2 rounded-full bg-slate-300 mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Captura</span>
                    </div>
                    <div className="w-12 h-[1px] bg-slate-100 mt-1" />
                    <div className="flex flex-col items-center opacity-30">
                      <div className="w-2 h-2 rounded-full bg-slate-300 mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Relatórios</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
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
