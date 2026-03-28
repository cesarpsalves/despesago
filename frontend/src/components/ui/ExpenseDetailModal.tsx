import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle, Calendar, Tag, CreditCard, Building, ExternalLink, Bot, CheckCircle2, XCircle } from 'lucide-react';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: any;
}

export function ExpenseDetailModal({ isOpen, onClose, expense }: ExpenseDetailModalProps) {
  if (!expense) return null;

  const isLowConfidence = expense.confidence < 0.8;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Despesa">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl font-bold text-slate-400">
              {expense.merchant?.[0] || 'D'}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{expense.merchant || 'Sem Nome'}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                <Tag className="w-3 h-3" /> {expense.category || 'Não categorizado'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900 tracking-tighter">
              R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Valor Consolidado</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> Data da Captura
            </p>
            <p className="text-sm font-bold text-slate-900">
              {new Date(expense.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3 h-3" /> Forma de Pagamento
            </p>
            <p className="text-sm font-bold text-slate-900">Dinheiro / Corporativo</p>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className={`p-5 rounded-3xl border ${isLowConfidence ? 'bg-amber-50/50 border-amber-100' : 'bg-indigo-50/50 border-indigo-100'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isLowConfidence ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                <Bot size={18} />
              </div>
              <h4 className={`text-sm font-bold ${isLowConfidence ? 'text-amber-900' : 'text-indigo-900'}`}>Insight da IA Inteligente</h4>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${isLowConfidence ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
              {(expense.confidence * 100).toFixed(0)}% Confiança
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed italic">
            {isLowConfidence 
              ? "A IA identificou algumas ambigüidades no formato do recibo. Por favor, valide os campos acima manualmente."
              : "Os dados foram extraídos com alta precisão. O comprovante está em conformidade com as regras fiscais."}
          </p>
        </div>

        {/* Receipt Visualizer (Placeholder for now) */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Building className="w-3 h-3" /> Comprovante Digital
          </p>
          <div className="aspect-[4/3] bg-slate-100 rounded-[2rem] border border-slate-200 border-dashed flex flex-col items-center justify-center group cursor-pointer hover:bg-slate-200/50 transition-colors">
            {expense.receipt_url ? (
              <img src={expense.receipt_url} alt="Recibo" className="w-full h-full object-contain rounded-[2rem]" />
            ) : (
              <>
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ExternalLink size={20} className="text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-400">Clique para visualizar original</p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1 rounded-2xl h-12 text-sm font-bold gap-2 text-rose-600 hover:bg-rose-50" onClick={onClose}>
            <XCircle size={18} /> Rejeitar
          </Button>
          <Button className="flex-[2] rounded-2xl h-12 text-sm font-bold gap-2 shadow-xl shadow-brand-500/10" onClick={onClose}>
            <CheckCircle2 size={18} /> Aprovar Despesa
          </Button>
        </div>
      </div>
    </Modal>
  );
}
