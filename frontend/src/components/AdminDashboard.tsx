import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [company, setCompany] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [expRes, compRes] = await Promise.all([
        axios.get('/expenses'),
        axios.get('/company/me')
      ]);
      setExpenses(expRes.data);
      setCompany(compRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      const res = await axios.post('/billing/subscribe', { cycle: 'MONTHLY' });
      if (res.data.paymentLink) {
        window.open(res.data.paymentLink, '_blank');
      }
    } catch (err: any) {
      console.error('Upgrade Error:', err);
      const msg = err.response?.data?.error || 'Erro ao iniciar assinatura';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header de Boas-Vindas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Olá! 👋
          </h1>
          <p className="text-slate-500 font-medium">
            Gerencie as despesas da <span className="text-slate-900 font-bold">{company?.name || 'sua empresa'}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-full flex items-center gap-2 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${company?.plan === 'pro' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {company?.plan === 'pro' ? 'Plano Pro' : 'Plano Free'}
            </span>
          </div>
        </div>
      </div>

      {/* Cards de Ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Users className="text-blue-500 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Convidar Equipe</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">Adicione colaboradores</p>
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
            <Button type="submit" size="sm" className="px-8 rounded-2xl h-12 shadow-lg shadow-brand-500/10">
              {loading ? '...' : 'Enviar'}
            </Button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <CreditCard className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Assinatura PRO</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">Recursos ilimitados</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-6">Desbloqueie usuários ilimitados, alertas de fraude e relatórios avançados.</p>
          <Button 
            variant="secondary"
            onClick={handleUpgrade} 
            className="w-full bg-slate-900 text-white hover:bg-black rounded-2xl h-12 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Fazer Upgrade Agora
          </Button>
        </div>
      </div>

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
                <div key={exp.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-lg font-bold text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                      {exp.merchant?.[0] || 'D'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">{exp.merchant}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(exp.date).toLocaleDateString('pt-BR')} • {exp.category || 'Geral'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-xl text-slate-900 tracking-tighter">
                      R$ {Number(exp.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {exp.confidence < 0.8 && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full mt-1.5 uppercase tracking-tighter">
                        <AlertCircle className="w-3 h-3"/> Baixa Confiança
                      </span>
                    )}
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
    </div>
  );
}
