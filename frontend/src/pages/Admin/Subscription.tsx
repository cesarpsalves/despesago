import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, ArrowRight, Activity, Zap, ExternalLink } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout.js';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export default function Subscription() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/billing/status');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch billing status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <AppLayout title="Assinatura">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">Carregando plano...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isPro = data?.plan === 'pro';
  const usagePercent = Math.min(100, (data?.usage?.current / data?.usage?.limit) * 100);

  return (
    <AppLayout title="Plano e Assinatura">
      <div className="max-w-2xl mx-auto space-y-8 pb-20">
        {/* Header Visual */}
        <section className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 text-brand-700 rounded-full text-xs font-bold uppercase tracking-widest border border-brand-100 mb-2"
          >
            <Zap size={14} className="fill-brand-500" />
            Gestão de Assinatura
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">O controle está em suas mãos.</h1>
          <p className="text-slate-500 font-medium">Gerencie seu plano, faturas e limites de uso da IA.</p>
        </section>

        {/* Card do Plano Atual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden p-8 rounded-[2.5rem] border ${
            isPro 
              ? 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-slate-900/20' 
              : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'
          }`}
        >
          {/* Background Decorative */}
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <CreditCard size={180} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-2 ${isPro ? 'text-brand-400' : 'text-slate-400'}`}>
                Seu Plano Atual
              </p>
              <h2 className="text-4xl font-extrabold tracking-tighter mb-2">
                {isPro ? 'Plano Pro' : 'Plano Gratuito'}
              </h2>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className={isPro ? 'text-emerald-400' : 'text-slate-300'} />
                <span className={`text-sm font-medium ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isPro ? 'Renovação automática ativa' : 'Limitado a 50 escaneamentos/mês'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 text-right">
              {isPro ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
                  <span className="text-emerald-400 text-sm font-bold uppercase tracking-tighter">Assinatura Ativa</span>
                </div>
              ) : (
                <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-2xl">
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-tighter text-black">Acesso Limitado</span>
                </div>
              )}
              {data?.current_period_end && (
                <p className={`text-xs font-medium ${isPro ? 'text-slate-500' : 'text-slate-400'}`}>
                  Próxima fatura: {new Date(data.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Barra de Uso (IA) */}
          <div className="mt-10 pt-8 border-t border-slate-800/10">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Activity size={16} className={isPro ? 'text-brand-400' : 'text-brand-600'} />
                <span>Uso do Mês</span>
              </div>
              <span className={`text-xs font-bold tracking-widest ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>
                {data?.usage?.current} / {data?.usage?.limit} ESCANEAMENTOS
              </span>
            </div>
            <div className="h-3 bg-slate-800/5 rounded-full overflow-hidden border border-slate-200/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  usagePercent > 80 ? 'bg-amber-400' : isPro ? 'bg-brand-500' : 'bg-brand-600'
                } shadow-[0_0_12px_rgba(16,185,129,0.3)]`}
              />
            </div>
          </div>
        </motion.div>

        {/* Links de Suporte e Faturas */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-brand-200 transition-all shadow-sm"
             onClick={() => {
                if (data?.company?.has_external_id) {
                    // Direcionar para o portal do Asaas (exemplo de comportamento)
                    window.open('https://asaas.com', '_blank');
                } else {
                    toast.info('Nenhuma fatura encontrada ainda.');
                }
             }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                <ExternalLink size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 leading-tight">Painel Financeiro</h4>
                <p className="text-xs text-slate-400 font-medium">Boleto, Pix e histórico oficial Asaas</p>
              </div>
            </div>
          </motion.div>

          {!isPro && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-brand-600 p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
              onClick={() => {
                // Trigger upgrade flow logic
                window.location.href = '/app'; // Back to home for upgrade
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                  <Zap size={20} className="fill-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight">Seja Ilimitado</h4>
                  <p className="text-xs text-white/70 font-medium">Faça upgrade para recursos Pro</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-white opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </motion.div>
          )}
        </section>

        {/* Footer info */}
        <footer className="text-center pt-10">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.2em]">
            DespesaGo Safe Billing &bull; Powered by Asaas Security
          </p>
        </footer>
      </div>
    </AppLayout>
  );
}
