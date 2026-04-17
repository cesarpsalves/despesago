import { Modal } from './Modal';
import { Button } from './Button';
import { Calendar, Tag, CreditCard, Building, ExternalLink, Bot, CheckCircle2, XCircle, Share2, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: any;
}

export function ExpenseDetailModal({ isOpen, onClose, expense }: ExpenseDetailModalProps) {
  if (!expense) return null;

  const isLowConfidence = expense.confidence < 0.8;

  const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="bg-[#F5F5F7] p-5 rounded-2xl border border-transparent hover:border-[#EBEBEB] transition-all group">
      <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest mb-2 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 group-hover:text-[#1D1D1F] transition-colors" /> {label}
      </p>
      <p className="text-sm font-bold text-[#1D1D1F] tracking-tight">{value}</p>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalhes da Despesa" 
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button 
            variant="ghost" 
            className="flex-1 rounded-[20px] h-14 text-[11px] font-bold uppercase tracking-widest gap-2 text-[#E03131] hover:bg-rose-50 border border-[#EBEBEB] transition-all" 
            onClick={onClose}
          >
            <XCircle size={18} /> Rejeitar
          </Button>
          <Button 
            className="flex-[2] rounded-[20px] h-14 text-[11px] font-bold uppercase tracking-widest gap-2 shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all" 
            onClick={onClose}
          >
            <CheckCircle2 size={18} /> Aprovar Despesa
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Top Header Card */}
        <div className="relative overflow-hidden bg-[#1D1D1F] rounded-[32px] p-8 text-white shadow-premium">
          {/* Subtle pattern or glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-bold shadow-soft">
                {expense.merchant?.[0] || 'D'}
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">{expense.merchant || 'Sem Nome'}</h2>
                <div className="flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-full w-fit">
                  <Tag className="w-3 h-3 text-emerald-400" /> 
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{expense.category || 'Não categorizado'}</span>
                </div>
              </div>
            </div>
            <div className="md:text-right border-t md:border-t-0 border-white/10 pt-6 md:pt-0">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Valor Total</p>
              <p className="text-4xl font-bold tracking-tighter">
                R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem 
            icon={Calendar} 
            label="Data da Captura" 
            value={new Date(expense.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} 
          />
          <DetailItem 
            icon={CreditCard} 
            label="Método de Pagamento" 
            value="Corporativo / Dinheiro" 
          />
          {expense.document && (
            <DetailItem 
              icon={Building} 
              label="CNPJ / Documento" 
              value={expense.document} 
            />
          )}
          {expense.cost_centers?.name && (
            <DetailItem 
              icon={LayoutDashboard} 
              label="Caixa / Setor" 
              value={expense.cost_centers.name} 
            />
          )}
        </div>

        {/* AI Analysis Section */}
        <div className={`p-6 rounded-[24px] border transition-all ${isLowConfidence ? 'bg-amber-50/30 border-amber-100' : 'bg-emerald-50/30 border-emerald-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLowConfidence ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <Bot size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1D1D1F]">Análise DespesaGo</h4>
                <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Processamento via Orquestrador</p>
              </div>
            </div>
            <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${isLowConfidence ? 'bg-white text-amber-600 border border-amber-100' : 'bg-white text-emerald-600 border border-emerald-100'}`}>
              {((expense.confidence || 0.9) * 100).toFixed(0)}% Precisão
            </div>
          </div>
          <p className="text-sm text-[#424245] leading-relaxed font-medium">
            {isLowConfidence 
              ? "A detecção automática encontrou inconsistências no padrão do recibo. Recomendamos conferência manual apurada."
              : "Validado com sucesso. Os dados extraídos estão em conformidade total com os padrões financeiros da empresa."}
          </p>
        </div>

        {/* Receipt Visualizer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest flex items-center gap-2">
              <Building className="w-3.5 h-3.5" /> Comprovante Original
            </p>
            {expense.receipt_url && (
              <Button variant="ghost" size="sm" className="h-8 text-[9px] uppercase tracking-widest font-bold">
                <Share2 size={12} className="mr-2" /> Compartilhar
              </Button>
            )}
          </div>
          
          <div className="aspect-[4/3] bg-[#F5F5F7] rounded-[32px] border border-[#EBEBEB] border-dashed flex flex-col items-center justify-center group cursor-pointer hover:bg-[#F5F5F7]/80 hover:border-[#1D1D1F]/20 transition-all overflow-hidden relative mb-4">
            {expense.receipt_url ? (
              <img src={expense.receipt_url} alt="Recibo" className="w-full h-full object-contain p-4 group-hover:scale-[1.02] transition-transform" />
            ) : (
              <div className="flex flex-col items-center p-8 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-premium flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ExternalLink size={24} className="text-[#D2D2D7]" />
                </div>
                <p className="text-xs font-bold text-[#1D1D1F] mb-1">Visualização do Recibo</p>
                <p className="text-[10px] font-medium text-[#86868B] max-w-[200px]">Nenhuma imagem vinculada a esta transação.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
  );
}
