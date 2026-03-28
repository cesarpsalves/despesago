import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, CreditCard, ShieldCheck, Globe } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
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
  const navigate = useNavigate();

  useEffect(() => {
    if (isPlatformAdmin) {
      fetchData();
    }
  }, [isPlatformAdmin]);

  const fetchData = async () => {
    try {
      const res = await axios.get('/platform/companies');
      // A API já retorna formatado com plan e status
      setCompanies(res.data);
    } catch (err: any) {
      console.error('FetchData Error:', err);
      toast.error('Erro ao carregar empresas da plataforma');
    }
  };

  const handleUpgrade = async (companyId: string) => {
    const confirmUpgrade = window.confirm("Deseja realmente ativar o plano PRO vitalício/cortesia para esta empresa?");
    if (!confirmUpgrade) return;

    const loadingToast = toast.loading("Processando ativação...");
    try {
      await axios.post(`/platform/companies/${companyId}/grant-courtesy`);
      toast.success("Plano PRO concedido com sucesso!", { id: loadingToast });
      fetchData();
    } catch (err: any) {
      console.error('Upgrade Error:', err);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || "Erro ao conceder cortesia";
      toast.error(`Falha: ${errorMsg}`, { id: loadingToast, duration: 5000 });
    }
  };

  if (!isPlatformAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-md">
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
          <p className="text-slate-500 mt-2">Você não tem permissão para acessar o Painel Global de Gestão.</p>
          <Button onClick={() => navigate('/app')} className="mt-6">Voltar ao App</Button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout title="Gestão Global SaaS">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-emerald-50 border-emerald-100 p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-2xl text-white shrink-0">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-emerald-600">Total de Empresas</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-900">{companies.length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-brand-50 border-brand-100 p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-500 rounded-2xl text-white shrink-0">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-brand-600">Assinaturas PRO</p>
                <p className="text-xl sm:text-2xl font-bold text-brand-900">{companies.filter(c => c.plan === 'pro').length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-slate-50 border-slate-200 p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-500 rounded-2xl text-white shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">SaaS Health</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">100% OK</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-500" />
              Lista de Clientes (Tenants)
            </h2>
          </div>
          
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Empresa</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criado em</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plano Ativo</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{company.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{company.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${
                        company.plan === 'pro' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {company.plan === 'pro' ? 'Premium (PRO)' : 'Básico (FREE)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {company.plan !== 'pro' ? (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleUpgrade(company.id)}
                          className="h-8 rounded-lg font-bold text-xs"
                        >
                          Ativar PRO
                        </Button>
                      ) : (
                        <span className="text-xs font-medium text-emerald-500 italic">Vitalício</span>
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
              <div key={company.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{company.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400">{company.id.slice(0, 12)}...</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${
                    company.plan === 'pro' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {company.plan}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-slate-500">
                    Desde {new Date(company.created_at).toLocaleDateString()}
                  </p>
                  {company.plan !== 'pro' && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleUpgrade(company.id)}
                      className="h-8 rounded-lg font-bold text-xs px-4"
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
