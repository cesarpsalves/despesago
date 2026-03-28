import { Button } from '../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg"
      >
        <img 
          src="/logo/logo_preto_fundo_transparente.png" 
          alt="DespesaGo" 
          className="h-16 mx-auto mb-8 opacity-20"
        />
        
        <h1 className="text-[120px] font-black text-slate-100 leading-none mb-4Selection: none">404</h1>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Oops! Caminho perdido.</h2>
        <p className="text-slate-500 mb-8 text-lg font-medium">
          A página que você está procurando não existe ou foi movida para um novo endereço.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Voltar ao Início
          </Button>
          <Button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Página Anterior
          </Button>
        </div>
      </motion.div>
      
      <div className="mt-16 text-slate-300 text-xs font-bold uppercase tracking-widest">
        DespesaGo • Enterprise Expense Management
      </div>
    </div>
  );
}
