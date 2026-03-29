import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  Zap,
  CheckCircle2,
  CreditCard, 
  Globe,
  ChevronRight,
  Search
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Logo } from '../components/ui/Logo';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
  const [searchTerm, setSearchTerm] = useState('');
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
      <div className="bg-white border border-[#EBEBEB] p-8 rounded-[32px] shadow-premium flex flex-col gap-6 max-w-sm animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#F5F5F7] rounded-2xl flex items-center justify-center text-[#1D1D1F] shadow-sm">
            <Zap size={28} className="fill-[#1D1D1F]" />
          </div>
          <div>
            <h4 className="font-bold text-[#1D1D1F] text-lg tracking-tight">Privilégio PRO</h4>
            <p className="text-xs text-[#86868B] font-medium leading-relaxed">Conceder acesso vitalício para <span className="text-[#1D1D1F] font-bold">{companyName}</span>?</p>
          </div>
        </div>
        
        <div className="flex gap-4 pt-2">
          <Button 
            className="flex-1 rounded-2xl h-12 text-[10px] font-bold uppercase tracking-widest"
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
            Confirmar
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 rounded-2xl h-12 text-[10px] font-bold uppercase tracking-widest text-[#86868B] hover:bg-[#F5F5F7]"
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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-white rounded-[40px] shadow-premium border border-[#EBEBEB] max-w-md"
        >
          <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-8">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Área Restrita</h1>
          <p className="text-[#86868B] mt-3 font-medium leading-relaxed">Seu acesso atual não possui privilégios de plataforma para visualizar o ecossistema global.</p>
          <Button onClick={() => navigate('/app')} className="mt-10 px-10 h-14 rounded-2xl font-bold">Voltar ao Painel</Button>
        </motion.div>
      </div>
    );
  }

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout title="Plataforma">
      <div className="max-w-[1200px] mx-auto space-y-10 pb-20">
        
        {/* Superior Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-lg bg-[#1D1D1F] flex items-center justify-center text-white">
                  <Globe size={18} />
               </div>
               <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Painel Global</span>
            </div>
            <h1 className="text-3xl font-bold text-[#1D1D1F] tracking-tight">Gestão do Ecossistema</h1>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#D2D2D7]" />
            <input 
              type="text" 
              placeholder="Buscar empresas..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#EBEBEB] rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-[#1D1D1F] transition-all text-sm font-medium shadow-soft"
            />
          </div>
        </div>

        {/* Global Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={Building2} 
            label="Empresas" 
            value={companies.length}
            sublabel="Clientes cadastrados"
          />
          <StatCard 
            icon={CreditCard} 
            label="Inscrições PRO" 
            value={companies.filter(c => c.plan === 'pro').length}
            sublabel="Assinaturas ativas"
            color="emerald"
          />
          <StatCard 
            icon={ShieldCheck} 
            label="Saúde SaaS" 
            value="100%"
            sublabel="Status de rede: OK"
          />
        </div>

        <section className="bg-white rounded-[32px] border border-[#EBEBEB] shadow-premium overflow-hidden">
          <div className="px-10 py-8 border-b border-[#F5F5F7] flex items-center justify-between">
            <div className="flex items-center gap-4">
               <Logo size="sm" showText={false} />
               <div>
                  <h3 className="font-bold text-[#1D1D1F] text-lg tracking-tight leading-none mb-1">Empresas Integradas</h3>
                  <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Controle de Provisionamento</p>
               </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F5F5F7] border-b border-[#EBEBEB]">
                  <th className="px-10 py-5 text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Organização</th>
                  <th className="px-10 py-5 text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Membros</th>
                  <th className="px-10 py-5 text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Plano Atual</th>
                  <th className="px-10 py-5 text-[10px] font-bold text-[#86868B] uppercase tracking-widest text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F7]">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="group hover:bg-[#F5F5F7]/30 transition-all">
                    <td className="px-10 py-6">
                      <p className="font-bold text-[#1D1D1F] transition-colors">{company.name}</p>
                      <p className="text-[10px] font-medium text-[#D2D2D7] tracking-tight">{company.id}</p>
                    </td>
                    <td className="px-10 py-6">
                       <span className="text-sm font-bold text-[#1D1D1F]">{company.user_count || 0}</span>
                       <span className="text-[10px] text-[#86868B] font-medium uppercase ml-2">Pessoas</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        company.plan === 'pro' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-[#F5F5F7] text-[#86868B] border-transparent'
                      }`}>
                        {company.plan === 'pro' ? 'Premium PRO' : 'Basic FREE'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      {company.plan !== 'pro' ? (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleUpgrade(company.id, company.name)}
                          className="h-9 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                        >
                          Conceder PRO
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Vitalício</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCompanies.length === 0 && (
            <div className="px-10 py-20 text-center">
              <p className="text-[#86868B] text-sm font-medium italic">Nenhuma empresa encontrada para este critério.</p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, color = 'dark' }: any) {
  return (
    <div className="bg-white p-10 rounded-[32px] border border-[#EBEBEB] shadow-soft hover:shadow-premium transition-all group">
      <div className="flex items-start justify-between mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
          color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-[#F5F5F7] text-[#1D1D1F]'
        }`}>
          <Icon size={24} />
        </div>
        <span className="text-[10px] font-bold text-[#D2D2D7] uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-4xl font-bold tracking-tighter text-[#1D1D1F] mb-1">{value}</p>
      <p className="text-[10px] text-[#86868B] font-bold uppercase tracking-widest">{sublabel}</p>
    </div>
  );
}
