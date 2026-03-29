import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { CostCenterSelector } from "../ui/CostCenterSelector.js";

interface ProcessResponse {
  message: string;
  expense: {
    id: string;
    amount: number;
    merchant: string;
    category: string;
    date: string;
  };
}

export function EmployeeScanner() {
  const [selectedCostCenter, setSelectedCostCenter] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    setError(null);

    try {
      const base64 = await toBase64(file);
      const res = await axios.post('/expenses/process', { 
        image: base64,
        cost_center_id: selectedCostCenter // New field for categorization
      });
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Falha ao processar recibo. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedCostCenter]);

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Step 1: Selection (Always visible) */}
      <CostCenterSelector 
        selectedId={selectedCostCenter}
        onSelect={setSelectedCostCenter}
      />

      {/* Step 2: Main Interaction Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="aspect-square sm:aspect-video bg-white rounded-[32px] border-2 border-dashed border-[#EBEBEB] flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="relative">
                <Loader2 size={48} className="text-[#1D1D1F] animate-spin mb-4" />
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-2 border-emerald-500 rounded-full"
                />
              </div>
              <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">Analisando Inteligente</h3>
              <p className="text-sm text-[#86868B] max-w-[200px] mt-2">Extraindo valores e categorias com IA...</p>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] border border-[#EBEBEB] p-8 shadow-premium"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#86868B] uppercase tracking-widest">Sucesso</h3>
                  <p className="text-lg font-bold text-[#1D1D1F] tracking-tight">Despesa Lancada</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#F5F5F7]">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Estabelecimento</span>
                  <span className="text-sm font-bold text-[#1D1D1F]">{result.expense.merchant}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Valor</span>
                  <span className="text-xl font-extrabold text-[#1D1D1F]">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.expense.amount)}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setResult(null)}
                className="w-full mt-8 py-4 bg-[#F5F5F7] text-[#1D1D1F] rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#EBEBEB] transition-all"
              >
                Novo Lancamento
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="interaction"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square sm:aspect-video bg-white rounded-[32px] border-2 border-dashed border-[#EBEBEB] group hover:border-[#1D1D1F] transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-premium"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                <div className="w-20 h-20 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-6 text-[#1D1D1F] group-hover:scale-110 transition-transform duration-500">
                  <Camera size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Toque para Escanear</h3>
                <p className="text-sm text-[#86868B] max-w-[240px] mt-2">Capture ou selecione a foto do recibo para processar automaticamente.</p>
              </div>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-[10px] font-bold text-[#1D1D1F] uppercase tracking-[0.3em]">IA Pronta</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3 text-red-600"
          >
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold uppercase tracking-tight">Erro detectado</p>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </div>

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleUpload(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString().split(",")[1] || "");
    reader.onerror = reject;
  });
}
