import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  Zap,
  CheckCircle2,
  CreditCard, 
  Globe 
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Logo } from '../components/ui/Logo';
import { toast } from 'sonner';

interface CompanyStats {
  id: string;
  name: string;
  created_at: string;
  plan: string;
  user_count: number;
}

export default function SuperAdminDashboard() {
  const { isPlatformAdmin } = useAuth();
  const [companies, setCompanies] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isPlatformAdmin) {
      fetchData();
    }
  }, [isPlatformAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/platform/companies');
      // A API já retorna formatado com plan e status
      setCompanies(res.data || []);
    } catch (err: any) {
      console.error('FetchData Error:', err);
      toast.error('Erro ao conectar ao Painel Global');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (companyId: string, companyName: string) => {
    toast.custom((t) => (
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl flex flex-col gap-4 max-w-sm animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
            <Zap size={24} className="fill-indigo-400 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Ativar Cortesia PRO</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">Conceder acesso vitalício para <span className="text-white font-black">{companyName}</span>?</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            className="flex-1 rounded-2xl h-11 text-[11px] font-black uppercase tracking-widest text-white bg-indigo-600 border-none shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-[1.02] flex items-center justify-center"
            onClick={async () => {
              toast.dismiss(t);
              const loadingId = toast.loading("Confirmando upgrade...");
              try {
                await axios.post(`/platform/companies/${companyId}/grant-pro`);
                toast.success("Plano PRO ativado com sucesso!", { id: loadingId });
                fetchData();
              } catch (err: any) {
                const msg = err.response?.data?.details || "Erro ao processar";
                toast.error(`Falha: ${msg}`, { id: loadingId });
              }
            }}
          >
            Confirmar Upgrade
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 rounded-2xl h-11 text-[11px] font-black uppercase tracking-widest text-slate-200 border-white/20 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all shadow-none flex items-center justify-center"
            onClick={() => toast.dismiss(t)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  if (!isPlatformAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-[3rem] shadow-xl border border-slate-100 max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Acesso Restrito</h1>
          <p className="text-slate-500 mt-2 font-medium">Este é o Painel Global da Plataforma. Seus privilégios atuais não permitem o acesso.</p>
          <Button onClick={() => navigate('/app')} className="mt-8 px-8 h-12 rounded-2xl font-bold shadow-lg shadow-brand-500/20">Voltar ao App</Button>
        </div>
      </div>
    );
  }

  if (loading && companies.length === 0) {
    return (
      <AppLayout title="Administração da Plataforma">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase italic">Sincronizando Ecossistema Global...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Painel Global">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-white border-slate-200 p-6 shadow-sm hover:border-indigo-200 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Total de Empresas</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{companies.length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white border-slate-200 p-6 shadow-sm hover:border-emerald-200 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Assinaturas PRO</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{companies.filter(c => c.plan === 'pro').length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white border-slate-200 p-6 shadow-sm hover:border-indigo-200 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Saúde do SaaS</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight text-indigo-600">100% OK</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo showText={false} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 leading-none">Management</span>
                <span className="text-xl font-black text-slate-900 tracking-tighter leading-tight italic">
                  Despesa<span className="text-indigo-600">Go</span> Platform
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Empresa</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Criado em</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Plano Integrado</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((company) => (
                  <tr key={company.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">{company.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">ID: {company.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border ${
                        company.plan === 'pro' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${company.plan === 'pro' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        {company.plan === 'pro' ? 'Premium PRO' : 'Basic FREE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {company.plan !== 'pro' ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpgrade(company.id, company.name)}
                          className="h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/10 active:scale-95 border-none"
                        >
                          Conceder PRO
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Ativo</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Cards instead of table */}
          <div className="sm:hidden divide-y divide-slate-100">
            {companies.map((company) => (
              <div key={company.id} className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-slate-900">{company.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400">UUID: {company.id.slice(0, 8)}...</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                    company.plan === 'pro' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {company.plan === 'pro' ? 'Premium' : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    Cadastrado em {new Date(company.created_at).toLocaleDateString()}
                  </p>
                  {company.plan !== 'pro' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleUpgrade(company.id, company.name)}
                      className="h-10 rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 bg-brand-600 text-white shadow-lg shadow-brand-500/20 active:scale-95 border-none"
                    >
                      Ativar PRO
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {companies.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-400 italic">Nenhum cliente cadastrado ainda.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
