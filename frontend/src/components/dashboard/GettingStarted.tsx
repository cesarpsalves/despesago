import React from 'react';
import { Users, Camera, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface GettingStartedProps {
  onDismiss?: () => void;
}

export const GettingStarted: React.FC<GettingStartedProps> = ({ onDismiss }) => {
  const steps = [
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      title: "Convide sua Equipe",
      description: "Adicione colaboradores para que eles possam escanear recibos diretamente pelo celular.",
      bg: "bg-blue-50"
    },
    {
      icon: <Camera className="w-5 h-5 text-emerald-500" />,
      title: "Capture Despesas",
      description: "Seus colaboradores fotografam os recibos e nossa IA extrai todos os dados automaticamente.",
      bg: "bg-emerald-50"
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-brand-500" />,
      title: "Aprovação em 1-Clique",
      description: "Revise os gastos consolidados aqui no dashboard e aprove reembolsos instantaneamente.",
      bg: "bg-brand-50"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
    >
      <div className="absolute top-6 right-6">
        <button 
          onClick={onDismiss}
          className="p-2 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="px-3 py-1 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-500/20">
            Guia Rápido
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Primeiros Passos no DespesaGo</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className={`w-12 h-12 ${step.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-base">
                {index + 1}. {step.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {step.description}
              </p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-6 text-slate-100">
                  <ChevronRight size={24} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            Precisa de ajuda detalhada? <a href="#" className="text-brand-600 font-bold hover:underline">Acesse a Central de Ajuda</a>
          </p>
          <button 
             onClick={onDismiss}
             className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-900/10"
          >
            Entendi, vamos lá!
          </button>
        </div>
      </div>
    </motion.div>
  );
};
