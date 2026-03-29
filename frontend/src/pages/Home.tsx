import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { useSearchParams } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard.tsx";
import { AppLayout } from "../components/layout/AppLayout.tsx";
import { EmployeeScanner } from "../components/scanner/EmployeeScanner.tsx";
import { SEO } from "../components/SEO.tsx";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, LayoutDashboard, ChevronLeft } from "lucide-react";

export default function Home() {
  const { role } = useAuth();
  const [searchParams] = useSearchParams();
  const isAdmin = role === 'admin';
  
  // Initialize from URL or default role logic
  const initialView = searchParams.get('view') === 'scanner' ? 'scanner' : (isAdmin ? 'default' : 'scanner');
  const [activeView, setActiveView] = useState<'default' | 'scanner'>(initialView);

  // Sync if URL changes while on home
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'scanner') setActiveView('scanner');
    else if (view === 'default') setActiveView('default');
  }, [searchParams]);

  return (
    <AppLayout>
      <SEO title={activeView === 'scanner' ? 'Escanear Recibo' : 'Painel de Controle'} description="Gestão de despesas em tempo real." />
      <div className="relative min-h-[calc(100vh-12rem)]">
        <AnimatePresence mode="wait">
          {activeView === 'scanner' ? (
            <motion.div
              key="scanner-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              {isAdmin && (
                <button 
                  onClick={() => setActiveView('default')}
                  className="mb-8 flex items-center gap-2 text-[10px] font-bold text-[#86868B] hover:text-[#1D1D1F] uppercase tracking-[0.2em] transition-all group"
                >
                  <div className="p-2 bg-white rounded-lg border border-[#EBEBEB] group-hover:border-[#D2D2D7] transition-all">
                    <ChevronLeft size={14} />
                  </div>
                  Voltar ao Painel
                </button>
              )}
              <EmployeeScanner />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full"
            >
              <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1D1D1F] rounded-2xl flex items-center justify-center text-white shadow-premium">
                    <LayoutDashboard size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Visão Geral</h1>
                    <p className="text-xs text-[#86868B] font-medium uppercase tracking-widest mt-0.5">Gestão em Tempo Real</p>
                  </div>
                </div>
              </div>
              
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
