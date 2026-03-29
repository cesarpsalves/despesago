import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { LayoutDashboard, ArrowRightLeft, CheckCircle2, History } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface CostCenter {
  id: string;
  name: string;
}

interface MemberTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  costCenters: CostCenter[];
  onRefresh: () => void;
}

export function MemberTransferModal({ isOpen, onClose, member, costCenters, onRefresh }: MemberTransferModalProps) {
  const [selectedCcId, setSelectedCcId] = useState(member?.cost_center_id || '');
  const [transferExpenses, setTransferExpenses] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!selectedCcId) return toast.error('Selecione um novo setor');
    
    try {
      setLoading(true);
      await axios.patch(`/company/members/${member.id}/cost-center`, { 
        costCenterId: selectedCcId,
        transferExpenses
      });
      
      toast.success(`${member.name} movido com sucesso!`);
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error('Erro ao realizar transferência');
    } finally {
      setLoading(false);
    }
  };

  const currentCc = costCenters.find(cc => cc.id === member?.cost_center_id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tranferir de Setor">
      <div className="space-y-8">
        {/* Perfil do Membro */}
        <div className="flex items-center gap-4 bg-[#F5F5F7] p-5 rounded-[24px] border border-[#EBEBEB]">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-xl font-bold text-[#1D1D1F] border border-[#EBEBEB] shadow-sm">
            {member?.name?.[0] || member?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-[#1D1D1F] text-lg">{member?.name || 'Membro'}</h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Setor Atual:</span>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-tight">
                {currentCc?.name || 'Não atribuído'}
              </span>
            </div>
          </div>
        </div>

        {/* Seletor de Novo Setor */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-[#86868B] uppercase tracking-widest ml-1">Para qual caixa deseja mover?</label>
          <div className="grid grid-cols-1 gap-3">
            {costCenters.map((cc) => (
              <button
                key={cc.id}
                onClick={() => setSelectedCcId(cc.id)}
                className={`p-4 rounded-[20px] border transition-all flex items-center justify-between group ${
                  selectedCcId === cc.id 
                    ? 'bg-[#1D1D1F] border-[#1D1D1F] text-white shadow-premium' 
                    : 'bg-white border-[#EBEBEB] text-[#1D1D1F] hover:border-[#1D1D1F]/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    selectedCcId === cc.id ? 'bg-white/10 text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'
                  }`}>
                    <LayoutDashboard size={20} />
                  </div>
                  <span className="font-bold text-sm">{cc.name}</span>
                </div>
                {selectedCcId === cc.id && (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Opção de Transferência de Histórico */}
        <div 
          onClick={() => setTransferExpenses(!transferExpenses)}
          className={`p-5 rounded-[24px] border-2 transition-all cursor-pointer flex items-center gap-4 ${
            transferExpenses 
              ? 'bg-amber-50 border-amber-200' 
              : 'bg-white border-[#F5F5F7] hover:border-amber-100'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
            transferExpenses ? 'bg-amber-400 text-white' : 'bg-[#F5F5F7] text-amber-400'
          }`}>
            <History size={24} />
          </div>
          <div>
            <h5 className={`font-bold text-sm mb-0.5 ${transferExpenses ? 'text-amber-900' : 'text-[#1D1D1F]'}`}>
              Migrar histórico de despesas?
            </h5>
            <p className={`text-[11px] font-medium leading-snug ${transferExpenses ? 'text-amber-800/70' : 'text-[#86868B]'}`}>
              Se ativado, todas as despesas passadas de {member?.name} serão reatribuídas ao novo setor escolhido.
            </p>
          </div>
          <div className={`ml-auto w-12 h-6 rounded-full p-1 transition-colors ${transferExpenses ? 'bg-amber-400' : 'bg-[#EBEBEB]'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${transferExpenses ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button 
            className="flex-1 shadow-premium" 
            onClick={handleTransfer} 
            disabled={loading || !selectedCcId || selectedCcId === member?.cost_center_id}
          >
            <ArrowRightLeft size={18} className="mr-2" />
            Transferir Agora
          </Button>
        </div>
      </div>
    </Modal>
  );
}
