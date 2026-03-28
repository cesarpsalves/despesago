import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  const fetchData = async () => {
    try {
      const res = await axios.get('/expenses');
      setExpenses(res.data);
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
    <div className="space-y-6">
      {/* Cards de Ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-500" />
            <h3 className="font-semibold">Convidar Equipe</h3>
          </div>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input 
              type="email" 
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="email@empresa.com" 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-black/5" required 
            />
            <Button type="submit" size="sm" className="px-6">
              {loading ? '...' : 'Convidar'}
            </Button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="text-green-500" />
              <h3 className="font-semibold">Plano PRO</h3>
            </div>
            <p className="text-sm text-gray-500">Desbloqueie usuários ilimitados e alertas avançados.</p>
          </div>
          <Button 
            variant="secondary"
            onClick={handleUpgrade} 
            className="mt-4 w-full bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
          >
            Fazer Upgrade Agora
          </Button>
        </div>
      </div>

      {/* Lista de Despesas */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-semibold text-lg text-gray-900">Despesas da Equipe</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            // Skeleton Loader
            [1, 2, 3].map((i) => (
              <div key={i} className="p-6 flex items-center justify-between animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-100 rounded-md" />
                  <div className="h-3 w-24 bg-gray-50 rounded-md" />
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-md" />
              </div>
            ))
          ) : (
            <>
              {expenses.map(exp => (
                <div key={exp.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">{exp.merchant}</p>
                    <p className="text-sm text-gray-500">{new Date(exp.date).toLocaleDateString()} • {exp.category || 'Geral'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg tracking-tight">R$ {Number(exp.amount).toFixed(2)}</p>
                    {exp.confidence < 0.8 && <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full mt-1"><AlertCircle className="w-3 h-3"/> Baixa Confiança</span>}
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Users className="text-gray-300 w-8 h-8" />
                  </div>
                  <p className="font-semibold text-gray-900">Nenhuma despesa ainda</p>
                  <p className="text-sm text-gray-500 mt-1">As despesas da sua equipe aparecerão aqui automaticamente.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
