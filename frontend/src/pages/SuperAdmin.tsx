import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Building2, Users, CreditCard, ShieldCheck, Globe } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';

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

  useEffect(() => {
    if (isPlatformAdmin) {
      fetchData();
    }
  }, [isPlatformAdmin]);

  const fetchData = async () => {
    // Fetch all companies and their member counts
    const { data: cos, error: cosErr } = await supabase
      .from('companies')
      .select(`
        id, 
        name, 
        created_at,
        subscriptions (plan)
      `);

    if (cosErr) {
      console.error(cosErr);
      return;
    }

    // Process counts (simplified for demo)
    const formatted: CompanyStats[] = cos.map((c: any) => ({
      id: c.id,
      name: c.name,
      created_at: new Date(c.created_at).toLocaleDateString(),
      plan: c.subscriptions?.[0]?.plan || 'free',
      user_count: 0 // In a real app we'd join with a count
    }));

    setCompanies(formatted);
  };

  const handleUpgrade = async (companyId: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .update({ plan: 'pro', status: 'active' })
      .eq('company_id', companyId);
    
    if (error) alert(error.message);
    else {
      alert("Empresa atualizada para PRO com sucesso!");
      fetchData();
    }
  };

  if (!isPlatformAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-md">
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
          <p className="text-slate-500 mt-2">Você não tem permissão para acessar o Painel Global de Gestão.</p>
          <Button onClick={() => window.location.href = '/app'} className="mt-6">Voltar ao App</Button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout title="Gestão Global SaaS">
      <div className="space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-2xl text-white">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600">Total de Empresas</p>
                <p className="text-2xl font-bold text-emerald-900">{companies.length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-brand-50 border-brand-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-500 rounded-2xl text-white">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-600">Assinaturas PRO</p>
                <p className="text-2xl font-bold text-brand-900">{companies.filter(c => c.plan === 'pro').length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-slate-50 border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-500 rounded-2xl text-white">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Status do Servidor</p>
                <p className="text-2xl font-bold text-slate-900">Online</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-500" />
              Empresas Registradas
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cadastro</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plano Atual</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{company.name}</p>
                      <p className="text-xs text-slate-400">ID: {company.id.slice(0,8)}...</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{company.created_at}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        company.plan === 'pro' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {company.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {company.plan !== 'pro' && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleUpgrade(company.id)}
                          className="text-xs"
                        >
                          Ativar PRO
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Nenhuma empresa encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
