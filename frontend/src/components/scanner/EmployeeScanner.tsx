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
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [selectedCostCenter, setSelectedCostCenter] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [currentImageBase64, setCurrentImageBase64] = useState<string | null>(null);
  
  // Review/Edit form state
  const [reviewData, setReviewData] = useState({
    amount: "",
    merchant: "",
    date: "",
    document: "",
    category: ""
  });

  // Manual form state (for pure manual entry)
  const [manualData, setManualData] = useState({
    amount: "",
    merchant: "",
    date: new Date().toISOString().split('T')[0],
    document: ""
  });

  // Auto-trigger input if requested via URL
  useEffect(() => {
    if (searchParams.get('trigger') === 'true' && fileInputRef.current) {
      fileInputRef.current.click();
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('trigger');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    setError(null);
    setIsReviewing(false);

    try {
      const base64 = await toBase64(file);
      setCurrentImageBase64(base64);

      const res = await axios.post('/expenses/extract', { 
        imageBase64: base64
      });

      const { data } = res.data;
      setReviewData({
        amount: String(data.amount),
        merchant: data.merchant,
        date: data.date,
        document: data.document ? formatCNPJ_CPF(data.document) : "",
        category: data.category
      });
      setIsReviewing(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Falha ao processar recibo. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const res = await axios.post('/expenses', {
        amount: parseFloat(reviewData.amount.replace(',', '.')),
        merchant: reviewData.merchant,
        date: reviewData.date,
        document: reviewData.document || null,
        cost_center_id: selectedCostCenter,
        imageBase64: currentImageBase64
      });
      setResult(res.data);
      setIsReviewing(false);
      setCurrentImageBase64(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Erro ao salvar despesa.");
    } finally {
      setIsProcessing(false);
    }
  };

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
        document: manualData.document || null,
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
    <div className="max-w-xl mx-auto space-y-8 pb-20">
      {/* Step 1: Selection (Always visible except when reviewing) */}
      {!isReviewing && !result && (
        <CostCenterSelector 
          selectedId={selectedCostCenter}
          onSelect={setSelectedCostCenter}
        />
      )}

      {/* Step 2: Main Interaction Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="aspect-square bg-white rounded-[40px] border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center p-8 text-center shadow-premium"
            >
              <div className="relative mb-8">
                <Loader2 size={64} className="text-[#1D1D1F] animate-spin-slow" />
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-4 border-emerald-500 rounded-full"
                />
              </div>
              <h3 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Análise em tempo real</h3>
              <p className="text-sm text-[#86868B] max-w-[240px] mt-3 font-medium leading-relaxed">Nossa IA está lendo os valores e identificando o estabelecimento...</p>
            </motion.div>
          ) : isReviewing ? (
            <motion.div
              key="review-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] border border-[#EBEBEB] p-6 sm:p-10 shadow-premium overflow-hidden"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-full aspect-[16/9] bg-gray-100 rounded-3xl overflow-hidden mb-6 border border-gray-200">
                  <img src={`data:image/jpeg;base64,${currentImageBase64}`} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Revisar Despesa</h3>
                <p className="text-xs font-bold text-[#86868B] uppercase tracking-widest mt-1">Confirme os dados extraídos</p>
              </div>

              <form onSubmit={handleConfirmReview} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Estabelecimento</label>
                  <input
                    type="text"
                    required
                    className="w-full h-14 bg-[#F5F5F7] border-none rounded-2xl px-6 font-bold text-[#1D1D1F] focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={reviewData.merchant}
                    onChange={e => setReviewData({...reviewData, merchant: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Valor Total</label>
                    <input
                      type="text"
                      required
                      className="w-full h-14 bg-[#F5F5F7] border-none rounded-2xl px-6 font-bold text-2xl text-emerald-600 focus:ring-2 focus:ring-emerald-500 transition-all"
                      value={reviewData.amount}
                      onChange={e => setReviewData({...reviewData, amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Data</label>
                    <input
                      type="date"
                      required
                      className="w-full h-14 bg-[#F5F5F7] border-none rounded-2xl px-6 font-bold text-[#1D1D1F] focus:ring-2 focus:ring-emerald-500 transition-all"
                      value={reviewData.date}
                      onChange={e => setReviewData({...reviewData, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">CNPJ do Estabelecimento (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Documento vazio (CNPJ/CPF)"
                    className={`w-full h-14 bg-[#F5F5F7] border rounded-2xl px-6 font-medium text-[#1D1D1F] focus:ring-2 focus:ring-emerald-500 transition-all ${
                      reviewData.document 
                        ? (validateDocument(reviewData.document) 
                            ? 'border-emerald-200' 
                            : reviewData.document.replace(/\D/g, '').length === 11 || reviewData.document.replace(/\D/g, '').length === 14
                              ? 'border-red-400 focus:ring-red-500 bg-red-50'
                              : 'border-amber-400 focus:ring-amber-500 bg-amber-50')
                        : 'border-transparent'
                    }`}
                    value={reviewData.document}
                    onChange={e => setReviewData({...reviewData, document: formatCNPJ_CPF(e.target.value)})}
                  />
                  {reviewData.document && (
                    <div className="flex items-center gap-1.5 ml-1 mt-1">
                      {validateDocument(reviewData.document) ? (
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Documento Válido</p>
                      ) : (reviewData.document.replace(/\D/g, '').length === 11 || reviewData.document.replace(/\D/g, '').length === 14) ? (
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Documento Falso/Inválido</p>
                      ) : (
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Formato Incompleto</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => { setIsReviewing(false); setCurrentImageBase64(null); }}
                    className="flex-1 h-16 bg-white border border-[#EBEBEB] text-[#1D1D1F] rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] h-16 bg-[#1D1D1F] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-premium"
                  >
                    Confirmar e Lançar
                  </button>
                </div>
              </form>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] border border-[#EBEBEB] p-8 sm:p-12 shadow-massive text-center overflow-hidden relative"
            >
               <div className="absolute top-0 inset-x-0 h-2 bg-emerald-500" />
               <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-emerald-100 ring-8 ring-emerald-50/50">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-bold text-[#1D1D1F] tracking-tighter mb-2">Despesa Lançada!</h3>
                <p className="text-sm text-[#86868B] font-medium mb-10">O registro foi enviado para aprovação.</p>

                <div className="bg-[#F5F5F7] rounded-3xl p-6 mb-8 divide-y divide-[#EBEBEB]">
                  <div className="pb-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Loja</span>
                    <span className="text-sm font-bold text-[#1D1D1F]">{result.expense?.merchant || 'Estabelecimento'}</span>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Valor</span>
                    <span className="text-xl font-black text-[#1D1D1F]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.expense?.amount || 0)}
                    </span>
                  </div>
                </div>

              <button 
                onClick={() => setResult(null)}
                className="w-full py-5 bg-[#1D1D1F] text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#333333] transition-all shadow-premium"
              >
                Escanear Próxima
              </button>
            </motion.div>
          ) : showManualForm ? (
            <motion.div
              key="manual-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[32px] border border-[#EBEBEB] p-6 sm:p-10 shadow-premium"
            >
              {/* Manual Form (already implemented, just adding document) */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Preencher Manual</h3>
                <button onClick={() => setShowManualForm(false)} className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Fechar</button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Estabelecimento</label>
                  <input type="text" required className="w-full h-14 bg-[#F5F5F7] rounded-2xl px-6 font-medium" value={manualData.merchant} onChange={e => setManualData({...manualData, merchant: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Valor (R$)</label>
                    <input type="text" required placeholder="0,00" className="w-full h-14 bg-[#F5F5F7] rounded-2xl px-6 font-medium" value={manualData.amount} onChange={e => setManualData({...manualData, amount: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">Data</label>
                    <input type="date" required className="w-full h-14 bg-[#F5F5F7] rounded-2xl px-6 font-medium" value={manualData.date} onChange={e => setManualData({...manualData, date: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest ml-1">CNPJ/Documento (Opcional)</label>
                  <input 
                    type="text" 
                    className={`w-full h-14 bg-[#F5F5F7] border rounded-2xl px-6 font-medium transition-all ${
                      manualData.document 
                        ? (validateDocument(manualData.document) 
                            ? 'border-emerald-200' 
                            : manualData.document.replace(/\D/g, '').length === 11 || manualData.document.replace(/\D/g, '').length === 14
                              ? 'border-red-400 bg-red-50' 
                              : 'border-amber-400 bg-amber-50')
                        : 'border-transparent'
                    }`}
                    value={manualData.document} 
                    onChange={e => setManualData({...manualData, document: formatCNPJ_CPF(e.target.value)})} 
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-[#1D1D1F] text-white rounded-2xl font-bold uppercase tracking-widest shadow-premium">Salvar</button>
              </form>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  key="camera-interaction"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative aspect-[4/5] sm:aspect-square bg-white rounded-[40px] border-2 border-dashed border-[#EBEBEB] group hover:border-emerald-500 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-premium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                    <div className="w-20 h-20 bg-[#F5F5F7] rounded-[28px] flex items-center justify-center mb-6 text-[#1D1D1F] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-[#EBEBEB] shadow-sm">
                      <Camera size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Tirar Foto</h3>
                    <p className="text-[10px] text-[#86868B] max-w-[200px] mt-2 font-medium leading-relaxed uppercase tracking-widest">Usar Câmera</p>
                  </div>
                </motion.div>

                <motion.div
                  key="gallery-interaction"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative aspect-[4/5] sm:aspect-square bg-white rounded-[40px] border-2 border-dashed border-[#EBEBEB] group hover:border-emerald-500 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-premium"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                    <div className="w-20 h-20 bg-[#F5F5F7] rounded-[28px] flex items-center justify-center mb-6 text-[#1D1D1F] group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 border border-[#EBEBEB] shadow-sm">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight">Galeria</h3>
                    <p className="text-[10px] text-[#86868B] max-w-[200px] mt-2 font-medium leading-relaxed uppercase tracking-widest">Escolher Arquivo</p>
                  </div>
                </motion.div>
              </div>

              <button 
                onClick={() => setShowManualForm(true)}
                className="w-full py-5 bg-white border border-[#EBEBEB] text-[#86868B] rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#1D1D1F] hover:border-[#D2D2D7] transition-all"
              >
                Preencher de forma manual
              </button>
            </div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
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

      <input 
        ref={galleryInputRef} 
        type="file" 
        accept="image/*" 
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

function formatCNPJ_CPF(value: string): string {
  const v = value.replace(/\D/g, '');
  if (!v) return '';
  if (v.length <= 11) {
    return v
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14);
  }
  return v
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
}

function validateDocument(doc: string): boolean {
  const v = doc.replace(/\D/g, '');
  if (v.length === 11) return isValidCPF(v);
  if (v.length === 14) return isValidCNPJ(v);
  return false;
}

function isValidCPF(cpf: string): boolean {
  if (/^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  let rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(cpf.substring(10, 11));
}

function isValidCNPJ(cnpj: string): boolean {
  if (/^(\d)\1+$/.test(cnpj)) return false;
  let t = cnpj.length - 2;
  let d = cnpj.substring(0, t);
  let p = cnpj.substring(t);
  const calc = (n: string) => {
    let s = 0;
    let w = n.length - 7;
    for (let i = n.length; i >= 1; i--) {
      s += parseInt(n.charAt(n.length - i)) * w--;
      if (w < 2) w = 9;
    }
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(d);
  const d2 = calc(d + d1);
  return d1 === parseInt(p.charAt(0)) && d2 === parseInt(p.charAt(1));
}
