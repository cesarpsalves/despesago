import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { LayoutDashboard, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface CostCenter {
  id: string;
  name: string;
  budgetText?: string;
  budget?: number;
}

interface ManageCostCentersModalProps {
  isOpen: boolean;
  onClose: () => void;
  costCenters: CostCenter[];
  onRefresh: () => void;
}

export function ManageCostCentersModal({ isOpen, onClose, costCenters, onRefresh }: ManageCostCentersModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error('Nome é obrigatório');
    try {
      setLoading(true);
      await axios.post('/company/cost-centers', { 
        name: newName, 
        budget: newBudget ? parseFloat(newBudget) : null 
      });
      toast.success('Centro de custo criado!');
      resetForm();
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      setLoading(true);
      await axios.put(`/company/cost-centers/${id}`, { 
        name: newName, 
        budget: newBudget ? parseFloat(newBudget) : null 
      });
      toast.success('Atualizado com sucesso!');
      resetForm();
      onRefresh();
    } catch (err: any) {
      toast.error('Erro ao atualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (name === 'Geral') return toast.error('O setor Geral não pode ser removido.');
    
    if (!confirm(`Tem certeza que deseja excluir o setor "${name}"? Os membros e despesas serão movidos para o setor Geral.`)) return;

    try {
      setLoading(true);
      await axios.delete(`/company/cost-centers/${id}`);
      toast.success('Setor removido.');
      onRefresh();
    } catch (err: any) {
      toast.error('Erro ao remover');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewName('');
    setNewBudget('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Caixas / Setores">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#86868B] font-medium uppercase tracking-widest">Setores Ativos</p>
          {!isAdding && !editingId && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
            >
              <Plus size={14} />
              Novo Setor
            </button>
          )}
        </div>

        <div className="space-y-3">
          {(isAdding || editingId) && (
            <div className="p-5 bg-[#F5F5F7] rounded-[20px] border border-[#EBEBEB] space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Nome do Setor</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Comercial"
                    className="w-full bg-white border-transparent rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#1D1D1F]/10 transition-all font-medium"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Orçamento (Opcional)</label>
                  <input 
                    type="number" 
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border-transparent rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#1D1D1F]/10 transition-all font-medium"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={resetForm} disabled={loading}>
                  <X size={16} />
                </Button>
                <Button size="sm" onClick={() => editingId ? handleUpdate(editingId) : handleCreate()} disabled={loading}>
                  <Save size={16} className="mr-2" />
                  {editingId ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          )}

          <div className="divide-y divide-[#F5F5F7] bg-white rounded-[24px] border border-[#EBEBEB] overflow-hidden">
            {costCenters.map((cc) => (
              <div key={cc.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F5F5F7]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F] border border-[#EBEBEB]">
                    <LayoutDashboard size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[#1D1D1F] text-sm">{cc.name}</p>
                    <p className="text-[10px] text-[#86868B] font-medium">
                      {cc.budget ? `R$ ${Number(cc.budget).toLocaleString('pt-BR')}` : 'Sem orçamento fixo'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingId(cc.id);
                      setNewName(cc.name);
                      setNewBudget(cc.budget?.toString() || '');
                    }}
                    className="p-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors rounded-lg hover:bg-white"
                  >
                    <Edit3 size={16} />
                  </button>
                  {cc.name !== 'Geral' && (
                    <button 
                      onClick={() => handleDelete(cc.id, cc.name)}
                      className="p-2 text-[#86868B] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50/50 p-5 rounded-[20px] border border-emerald-100/50 flex gap-4">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 text-xs mb-1">Dica de Gestão</h4>
            <p className="text-[11px] text-emerald-800/80 leading-relaxed font-medium">
              Dividir sua empresa em caixas/setores permite que a IA gere insights específicos por departamento, ajudando a identificar gargalos em times específicos automaticamente.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
