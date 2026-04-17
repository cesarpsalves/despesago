import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { CostCenterSelector } from "../ui/CostCenterSelector.js";
import { useSearchParams } from "react-router-dom";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCostCenter, setSelectedCostCenter] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  
  // Manual form state
  const [manualData, setManualData] = useState({
    amount: "",
    merchant: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Auto-trigger input if requested via URL
  useEffect(() => {
    if (searchParams.get('trigger') === 'true' && fileInputRef.current) {
      fileInputRef.current.click();
      // Clean up param so it doesn't re-trigger on re-render
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('trigger');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    setError(null);

    try {
      const base64 = await toBase64(file);
      const res = await axios.post('/expenses/process', { 
        imageBase64: base64,
        cost_center_id: selectedCostCenter 
      });
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Falha ao processar recibo. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedCostCenter]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualData.amount || !manualData.merchant) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const res = await axios.post('/expenses', {
        amount: parseFloat(manualData.amount.replace(',', '.')),
        merchant: manualData.merchant,
        date: manualData.date,
        cost_center_id: selectedCostCenter
      });
      setResult(res.data);
      setShowManualForm(false);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Erro ao salvar despesa manual.");
    } finally {
      setIsProcessing(false);
    }
  };

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
              className="aspect-square sm:aspect-video bg-white rounded-[32px] border-2 border-dashed border-[#EBEBEB] flex flex-col items-center justify-center p-6 sm:p-8 text-center"
            >
              <div className="relative mb-6">
                <Loader2 size={48} className="text-[#1D1D1F] animate-spin" />
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-2 border-emerald-500 rounded-full"
                />
              </div>
              <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Analisando Inteligente</h3>
              <p className="text-sm text-[#86868B] max-w-[220px] mt-2 font-medium">Extraindo valores e categorias com IA...</p>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] border border-[#EBEBEB] p-6 sm:p-10 shadow-premium"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.2em] mb-0.5">Sucesso</h3>
                  <p className="text-xl font-bold text-[#1D1D1F] tracking-tight leading-none">Despesa Lançada</p>
                </div>
              </div>
 
              <div className="space-y-5 pt-6 border-t border-[#F5F5F7]">
                <div className="flex justify-between items-baseline gap-4">
                  <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest shrink-0">Estabelecimento</span>
                  <span className="text-sm sm:text-base font-bold text-[#1D1D1F] text-right truncate">{result.expense.merchant}</span>
                </div>
                <div className="flex justify-between items-baseline gap-4">
                  <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest shrink-0">Valor Total</span>
                  <span className="text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.expense.amount)}
                  </span>
                </div>
              </div>
 
              <button 
                onClick={() => setResult(null)}
                className="w-full mt-10 py-4 bg-[#1D1D1F] text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#333333] transition-all shadow-premium"
              >
                Escanear Outro
              </button>
            </motion.div>
          ) : showManualForm ? (
            <motion.div
              key="manual-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[32px] border border-[#EBEBEB] p-6 sm:p-10 shadow-premium"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Preencher Manual</h3>
                <button 
                  onClick={() => setShowManualForm(false)}
                  className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest hover:text-red-500 transition-colors"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Estabelecimento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Starbucks, Posto shell..."
                    className="w-full h-14 bg-[#F5F5F7] border-none rounded-2xl px-6 font-medium text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F] transition-all"
                    value={manualData.merchant}
                    onChange={e => setManualData({...manualData, merchant: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Valor (R$)</label>
                    <input
                      type="text"
                      required
                      placeholder="0,00"
                      className="w-full h-14 bg-[#F5F5F7] border-none rounded-2xl px-6 font-medium text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F] transition-all"
                      value={manualData.amount}
                      onChange={e => setManualData({...manualData, amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Data</label>
                    <input
                      type="date"
                      required
                      className="w-full h-14 bg-[#F5F5F7] border-none rounded-2xl px-6 font-medium text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F] transition-all"
                      value={manualData.date}
                      onChange={e => setManualData({...manualData, date: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-5 bg-[#1D1D1F] text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#333333] transition-all shadow-premium mt-4 disabled:opacity-50"
                >
                  {isProcessing ? "Salvando..." : "Salvar Despesa"}
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.div
                key="interaction"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-[4/5] sm:aspect-video bg-white rounded-[32px] border-2 border-dashed border-[#EBEBEB] group hover:border-[#1D1D1F] transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-premium"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-10 text-center pointer-events-none">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F5F5F7] rounded-[28px] flex items-center justify-center mb-6 text-[#1D1D1F] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-[#EBEBEB] group-hover:border-[#D2D2D7] shadow-sm">
                    <Camera size={window.innerWidth < 640 ? 32 : 40} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight px-4">Toque para Escanear</h3>
                  <p className="text-sm text-[#86868B] max-w-[240px] mt-3 font-medium leading-relaxed">Capture ou selecione a foto do recibo para processar automaticamente.</p>
                </div>
                
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.4em] bg-white/80 px-4 py-1.5 rounded-full backdrop-blur-sm">IA Pronta</span>
                </div>
              </motion.div>

              <button 
                onClick={() => setShowManualForm(true)}
                className="w-full py-4 bg-white border border-[#EBEBEB] text-[#86868B] rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#1D1D1F] hover:border-[#D2D2D7] transition-all"
              >
                Ou preencher manualmente
              </button>
            </div>
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
        ref={fileInputRef}
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
