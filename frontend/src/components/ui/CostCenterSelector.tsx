import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Check } from 'lucide-react';

interface CostCenter {
  id: string;
  name: string;
  budget?: number;
}

interface CostCenterSelectorProps {
  onSelect: (id: string | null) => void;
  selectedId: string | null;
}

export function CostCenterSelector({ onSelect, selectedId }: CostCenterSelectorProps) {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCostCenters = async () => {
      try {
        const res = await axios.get('/company/cost-centers');
        const data = res.data || [];
        setCostCenters(data);
        
        // Se houver apenas um centro de custo e nenhum selecionado, selecionar automaticamente
        if (data.length === 1 && !selectedId) {
          onSelect(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch cost centers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCostCenters();
  }, []);

  if (loading) return (
    <div className="flex gap-2 animate-pulse">
      {[1, 2].map(i => <div key={i} className="h-10 w-24 bg-[#F5F5F7] rounded-xl" />)}
    </div>
  );

  if (costCenters.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.2em] ml-1">
        Selecionar Caixa / Setor
      </label>
      <div className="flex flex-wrap gap-2">
        {costCenters.map((cc) => (
          <motion.button
            key={cc.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(selectedId === cc.id ? null : cc.id)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
              selectedId === cc.id 
                ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-premium' 
                : 'bg-white text-[#86868B] border-[#EBEBEB] hover:border-[#D2D2D7]'
            }`}
          >
            <LayoutDashboard size={14} className={selectedId === cc.id ? 'text-emerald-400' : 'text-[#D2D2D7]'} />
            {cc.name}
            <AnimatePresence>
              {selectedId === cc.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <Check size={12} className="text-emerald-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
