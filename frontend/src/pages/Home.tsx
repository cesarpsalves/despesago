import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext.js";
import AdminDashboard from "../components/AdminDashboard.js";
import { AppLayout } from "../components/layout/AppLayout.js";
import { Button } from "../components/ui/Button";
import { Camera } from "lucide-react";

function EmployeeScanner() {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("/expenses");
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      const base64 = await toBase64(file);

      const res = await axios.post("/expenses/process", {
        imageBase64: base64
      });

      setResult(res.data);
      fetchHistory(); // Atualiza histórico localmente
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.code === 'UPGRADE_REQUIRED') {
         setError("Atenção: A empresa atingiu o limite mensal do Plano Free.");
      } else {
         const errorMap: any = {
           'invalid_expense_data': 'Lamentamos, mas os dados deste recibo estão ilegíveis.',
           'extraction_failed': 'Falha na IA ao tentar extrair o contexto.',
           'database_insert_failed': 'Houve um erro no salvamento do banco.',
           'invalid_amount_detected': 'O valor detectado foge da alçada permitida.'
         };
         setError(errorMap[err.response?.data?.error] || err.response?.data?.error || "A análise falhou de maneira inesperada.");
      }
    } finally {
      setLoading(false);
      URL.revokeObjectURL(localUrl);
    }
  };

  const resetFlow = () => {
    setResult(null);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center w-full pb-10">
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col items-center"
          >
            {/* ALERTAS DO BEHAVIOR AGENT */}
            {result.analysis?.behavior && (
              <div className="mb-4 w-full bg-red-50 text-red-700 rounded-2xl p-4 text-sm font-medium border border-red-100 flex items-start gap-2 shadow-sm">
                <span className="text-lg">⚠️</span>
                <p>{result.analysis.behavior}</p>
              </div>
            )}

            {/* CARD DA DESPESA */}
            <div className="w-full bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">
                {result.expense.category || 'Geral'}
              </p>
              <p className="text-xl font-bold text-gray-800 line-clamp-1">{result.expense.merchant}</p>
              <p className="text-4xl font-extrabold mt-2 tracking-tighter text-gray-900">
                R$ {Number(result.expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between text-sm text-gray-400 font-medium">
                <p>{new Date(result.expense.date).toLocaleDateString('pt-BR')}</p>
                <p className="text-gray-300">Confiança: {(result.expense.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>

            {/* INSIGHT DO INSIGHT AGENT */}
            {result.analysis?.insight && (
              <div className="mt-4 w-full bg-blue-50 text-blue-900 rounded-2xl p-4 text-sm font-medium border border-blue-100 flex items-start gap-2 shadow-sm">
                <span className="text-lg">✨</span>
                <p>{result.analysis.insight}</p>
              </div>
            )}

            <Button
              onClick={resetFlow}
              size="lg"
              className="mt-8 px-10"
            >
              Adicionar outro recibo
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-sm mx-auto">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-2xl border border-red-100 text-sm font-bold shadow-sm w-full text-center"
              >
                {error}
              </motion.div>
            )}

            {/* UPLOAD AREA */}
            {previewUrl && loading ? (
               <motion.div 
                 key="loading"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center w-full py-12"
               >
                 <div className="w-64 aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white relative bg-slate-100">
                   <img src={previewUrl} alt="Preview" className="object-cover w-full h-full opacity-60 grayscale-[0.3]" />
                   
                   {/* Linha de Scanner Animada (Premium Laser) */}
                   <motion.div 
                     animate={{ 
                       top: ['0%', '100%', '0%'],
                       opacity: [0.3, 0.8, 0.3]
                     }}
                     transition={{ 
                       duration: 3, 
                       repeat: Infinity, 
                       ease: "easeInOut" 
                     }}
                     className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,1)] z-10"
                   />
                   
                   {/* Overlay Pulsante */}
                   <motion.div 
                     animate={{ opacity: [0.1, 0.2, 0.1] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-emerald-500/10" 
                   />
                 </div>
                 
                 <div className="flex flex-col items-center mt-10">
                   <motion.div 
                     animate={{ opacity: [0.4, 1, 0.4] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 transition-all"
                   >
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-slate-900 font-bold tracking-tight">O DespesaGo está pensando...</span>
                   </motion.div>
                   <p className="text-slate-400 text-xs mt-3 font-medium uppercase tracking-widest">Extraindo dados com IA</p>
                 </div>
               </motion.div>
            ) : (
              <div className="w-full">
                <motion.button
                  key="upload-btn"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 flex flex-col items-center justify-center w-full aspect-square bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-soft transition-all duration-300 hover:border-brand-500 hover:bg-slate-50/50 group relative overflow-hidden"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:scale-110 shadow-sm border border-slate-100">
                    <Camera className="w-10 h-10" />
                  </div>
                  <span className="text-slate-900 text-xl font-bold">Adicionar Despesa</span>
                  <span className="text-slate-500 text-sm mt-2 font-medium">Tire foto do recibo</span>
                </motion.button>
              </div>
            )}

            {/* HISTÓRICO RECENTE E EMPTY STATE */}
            {!loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full mt-12 mb-10"
              >
                {history.length > 0 ? (
                  <>
                    <div className="flex justify-between items-end mb-4 px-2">
                      <h2 className="text-lg font-bold text-slate-900">Histórico Recente</h2>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{history.length} itens</span>
                    </div>
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div key={item.id} className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-brand-300 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category || 'Geral'}</span>
                            <span className="text-sm font-bold text-slate-800 line-clamp-1">{item.merchant}</span>
                            <span className="text-[10px] font-medium text-slate-400">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <span className="text-sm font-extrabold text-slate-900">
                            R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 mt-4 text-center border-2 border-dashed rounded-3xl border-slate-200 bg-slate-50/50">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                      <span className="text-3xl">✨</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Seu primeiro escaneamento</h3>
                    <p className="mt-2 text-sm text-slate-500 max-w-[250px]">
                      Aponte a câmera para qualquer nota fiscal ou recibo e deixe a IA extrair os dados magicamente.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

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
    reader.onload = () =>
      resolve(reader.result?.toString().split(",")[1] || "");
    reader.onerror = reject;
  });
}

export default function Home() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  return (
    <AppLayout>
      {isAdmin ? <AdminDashboard /> : <EmployeeScanner />}
    </AppLayout>
  );
}
