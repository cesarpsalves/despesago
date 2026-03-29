import React from 'react';
import { Users, Camera, CheckCircle2, ChevronRight, X, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface GettingStartedProps {
  onDismiss?: () => void;
}

export const GettingStarted: React.FC<GettingStartedProps> = ({ onDismiss }) => {
  const steps = [
    {
      icon: <Users className="w-6 h-6 text-[#1D1D1F]" />,
      title: "Convite sua Equipe",
      description: "Adicione colaboradores para que eles possam escanear recibos diretamente pelo celular.",
      bg: "bg-[#F5F5F7]"
    },
    {
      icon: <Camera className="w-6 h-6 text-emerald-500" />,
      title: "Capture Despesas",
      description: "Seus colaboradores fotografam os recibos e nosso orquestrador extrai todos os dados automaticamente.",
      bg: "bg-emerald-50"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-[#1D1D1F]" />,
      title: "Aprovação Executiva",
      description: "Revise os gastos consolidados aqui no dashboard e aprove reembolsos instantaneamente.",
      bg: "bg-[#F5F5F7]"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-[32px] border border-[#EBEBEB] shadow-premium overflow-hidden"
    >
      <div className="absolute top-8 right-8 z-10">
        <button 
          onClick={onDismiss}
          className="p-2 hover:bg-[#F5F5F7] rounded-full text-[#D2D2D7] hover:text-[#1D1D1F] transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-10 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
          <div className="px-4 py-1.5 bg-[#1D1D1F] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-sm w-fit">
            Guia de Implementação
          </div>
          <h2 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Primeiros Passos no DespesaGo</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                {step.icon}
              </div>
              <h3 className="font-bold text-[#1D1D1F] mb-3 flex items-center gap-2 text-lg tracking-tight">
                {index + 1}. {step.title}
              </h3>
              <p className="text-sm text-[#86868B] leading-relaxed font-medium">
                {step.description}
              </p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-6 top-8 text-[#EBEBEB]">
                  <ChevronRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-10 border-t border-[#F5F5F7] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#86868B]">
                <HelpCircle size={16} />
             </div>
             <p className="text-[11px] text-[#86868B] font-bold uppercase tracking-widest">
               Dúvidas? <a href="#" className="text-emerald-600 hover:text-emerald-700 transition-colors">Acesse o Suporte Executivo</a>
             </p>
          </div>
          <Button 
             onClick={onDismiss}
             size="lg"
             className="min-w-[200px] h-14 rounded-2xl"
          >
            Começar Agora
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
