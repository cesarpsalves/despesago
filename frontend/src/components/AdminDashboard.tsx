import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CreditCard, AlertCircle, ShieldCheck, Building, LayoutDashboard, ChevronRight, UserPlus, History, BarChart3, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { GettingStarted } from './dashboard/GettingStarted';
import { DashboardSkeleton } from './dashboard/DashboardSkeleton';
import { ExpenseDetailModal } from './ui/ExpenseDetailModal';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { isPlatformAdmin } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [company, setCompany] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
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
        members: dashboardMembers = [],
        costCenters: dashboardCostCenters = [] 
      } = summaryData;
      
      setCompany(comp);
      setExpenses(Array.isArray(recentExpenses) ? recentExpenses : []);
      setStats(dashboardStats);
      setMembers(Array.isArray(dashboardMembers) ? dashboardMembers : []);
      setCostCenters(Array.isArray(dashboardCostCenters) ? dashboardCostCenters : []);
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
      <div className="bg-white p-6 rounded-[24px] border border-[#EBEBEB] shadow-premium flex flex-col gap-5 max-w-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl flex items-center justify-center text-[#1D1D1F]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-[#1D1D1F] text-base">Privilégios</h4>
            <p className="text-xs text-[#86868B] font-medium">{isCurrentlyAdmin ? 'Remover' : 'Conceder'} acesso de administrador?</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            className="flex-1"
            size="sm"
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
            className="flex-1"
            size="sm"
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
      toast.success('Convite enviado!');
      setInviteEmail('');
      fetchData();
    } catch (err: any) {
      if (err.response?.data?.code === 'UPGRADE_REQUIRED') {
        toast.error('Limite atingido. Faça upgrade do plano.');
      } else {
        toast.error(err.response?.data?.error || 'Erro ao enviar convite');
      }
    }
  };

  if (loading) return <DashboardSkeleton />;

  const isPro = (company?.plan === 'pro' || company?.plan === 'platform_admin') && company?.subscriptionStatus === 'active';

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Banner de Modo Admin Global */}
      {isPlatformAdmin && (
        <div className="bg-[#1D1D1F] p-4 rounded-[20px] flex items-center justify-between text-white shadow-premium">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Modo Plataforma</p>
              <p className="text-[10px] text-[#86868B] font-medium uppercase tracking-widest">Acesso Global Ativo</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/platform')}
            className="text-white hover:bg-white/10"
          >
            Sair
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight mb-1">
            Gestão da Empresa
          </h1>
          <p className="text-[#86868B] font-medium text-sm">
            Visualizando dados de <span className="text-[#1D1D1F] font-bold">{company?.name || 'Sua Empresa'}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border transition-all ${
            isPro ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-[#EBEBEB]'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-emerald-500 animate-pulse' : 'bg-[#D2D2D7]'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isPro ? 'text-emerald-700' : 'text-[#86868B]'}`}>
              {isPro ? 'Plano Pro Ativo' : 'Plano Free'}
            </span>
          </div>
          {!isPro && (
            <Button size="sm" onClick={() => navigate('/app/subscription')} className="shadow-premium">
              Fazer Upgrade
            </Button>
          )}
        </div>
      </div>

      {showOnboarding && (
        <GettingStarted onDismiss={() => {
          setShowOnboarding(false);
          localStorage.setItem('despesago_onboarding_dismissed', 'true');
        }} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={BarChart3} 
          label="Gasto Mensal" 
          value={`R$ ${stats?.monthlyTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
          sublabel="Total consolidado"
          color="emerald"
        />
        
        <div className="bg-white p-8 rounded-[24px] border border-[#EBEBEB] shadow-soft flex flex-col justify-between group hover:shadow-premium transition-all">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl flex items-center justify-center text-[#1D1D1F] group-hover:scale-110 transition-transform">
              <UserPlus size={24} />
            </div>
            <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">{members.length} Ativos</span>
          </div>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input 
              type="email" 
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="Convidar por e-mail" 
              className="flex-1 bg-[#F5F5F7] border-transparent rounded-[12px] px-4 py-2 text-sm outline-none focus:bg-white focus:border-[#EBEBEB] transition-all font-medium" 
              required 
            />
            <Button type="submit" size="sm" className="px-5">Enviar</Button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-[#EBEBEB] shadow-soft hover:shadow-premium transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest leading-none mb-1">Uso de IA</p>
              <h3 className="font-bold text-[#1D1D1F] text-sm">Escaneamento</h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-[#86868B]">Consumido</span>
              <span className="text-[#1D1D1F]">{stats?.consumedCount || 0} / {stats?.limit || 50}</span>
            </div>
            <div className="h-1.5 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((stats?.consumedCount || 0) / (stats?.limit || 50)) * 100)}%` }}
                className={`h-full rounded-full ${((stats?.consumedCount || 0) / (stats?.limit || 50)) > 0.8 ? 'bg-red-500' : 'bg-emerald-500'}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Equipe Table Style */}
        <section className="bg-white rounded-[24px] border border-[#EBEBEB] shadow-soft overflow-hidden">
          <div className="px-8 py-6 border-b border-[#F5F5F7] flex justify-between items-center">
            <h3 className="font-bold text-[#1D1D1F] flex items-center gap-2">
              <Users size={20} className="text-emerald-500" />
              Sua Equipe
            </h3>
          </div>
          <div className="divide-y divide-[#F5F5F7]">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="px-8 py-5 flex items-center justify-between hover:bg-[#F5F5F7]/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-sm font-bold text-[#1D1D1F] border border-[#EBEBEB]">
                    {member.display_name?.[0] || member.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[#1D1D1F] text-sm">{member.display_name || 'Membro'}</p>
                    <p className="text-[10px] text-[#86868B] font-medium">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                    member.role === 'admin' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-[#F5F5F7] text-[#86868B] border-transparent'
                  }`}>
                    {member.role === 'admin' ? 'Admin' : 'Membro'}
                  </span>
                  <button onClick={() => handleToggleAdmin(member)} className="text-[#D2D2D7] hover:text-[#1D1D1F] transition-colors p-1">
                    <ShieldCheck size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {members.length > 5 && (
             <div className="px-8 py-4 bg-[#F5F5F7]/30 border-t border-[#F5F5F7]">
                <button className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest hover:text-[#1D1D1F] transition-colors">
                  Ver todos os {members.length} membros
                </button>
             </div>
          )}
        </section>

        {/* Centros de Custo (Caixas) */}
        <section className="bg-white rounded-[24px] border border-[#EBEBEB] shadow-soft overflow-hidden">
          <div className="px-8 py-6 border-b border-[#F5F5F7] flex justify-between items-center">
            <h3 className="font-bold text-[#1D1D1F] flex items-center gap-2">
              <Building size={20} className="text-emerald-500" />
              Caixas / Setores
            </h3>
            <button className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest hover:text-[#1D1D1F]">Gerenciar</button>
          </div>
          <div className="divide-y divide-[#F5F5F7]">
            {costCenters.length > 0 ? costCenters.map((cc) => (
              <div key={cc.id} className="px-8 py-5 flex items-center justify-between hover:bg-[#F5F5F7]/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] border border-[#EBEBEB]">
                    <LayoutDashboard size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[#1D1D1F] text-sm">{cc.name}</p>
                    <p className="text-[10px] text-[#86868B] font-medium">Orçamento: {cc.budget ? `R$ ${cc.budget}` : 'Sem limite'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Ativo</span>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center">
                <p className="text-sm text-[#86868B] font-medium mb-4">Nenhum caixa configurado.</p>
                <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest">Criar Primeiro Caixa</Button>
              </div>
            )}
          </div>
        </section>

        {/* Despesas Recentes */}
        <section className="bg-white rounded-[24px] border border-[#EBEBEB] shadow-soft overflow-hidden">
          <div className="px-8 py-6 border-b border-[#F5F5F7] flex justify-between items-center">
            <h3 className="font-bold text-[#1D1D1F] flex items-center gap-2">
              <History size={20} className="text-emerald-500" />
              Despesas Recentes
            </h3>
            <button className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest hover:text-[#1D1D1F]">Ver Tudo</button>
          </div>
          <div className="divide-y divide-[#F5F5F7]">
            {expenses.map(exp => (
              <div 
                key={exp.id} 
                onClick={() => { setSelectedExpense(exp); setIsDetailOpen(true); }}
                className="px-8 py-5 flex items-center justify-between hover:bg-[#F5F5F7]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#F5F5F7] rounded-xl flex items-center justify-center text-[#1D1D1F] border border-[#EBEBEB] group-hover:bg-white group-hover:scale-105 transition-all">
                    {exp.merchant?.[0] || 'D'}
                  </div>
                  <div>
                    <p className="font-bold text-[#1D1D1F] text-sm truncate max-w-[120px]">{exp.merchant}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-[#86868B] font-bold uppercase tracking-widest">{exp.category || 'Geral'}</p>
                      {exp.cost_centers?.name && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[#D2D2D7]" />
                          <p className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-tight">{exp.cost_centers.name}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1D1D1F] text-sm">
                    R$ {Number(exp.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-[#86868B] font-medium">{new Date(exp.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="p-12 text-center text-[#86868B] text-sm font-medium italic">
                Nenhum registro encontrado.
              </div>
            )}
          </div>
        </section>
      </div>

      <ExpenseDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} expense={selectedExpense} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, color = 'dark' }: any) {
  return (
    <div className="bg-white p-8 rounded-[24px] border border-[#EBEBEB] shadow-soft hover:shadow-premium transition-all group">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
          color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-[#F5F5F7] text-[#1D1D1F]'
        }`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-xs text-[#86868B] font-medium">{sublabel}</p>
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight text-[#1D1D1F]">{value}</p>
    </div>
  );
}
