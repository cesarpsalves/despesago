import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { SEO } from '../components/SEO';
import { Camera, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DespesaGo",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "description": "Gestão inteligente de reembolsos e despesas corporativas usando IA.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "120"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL"
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1D1D1F] selection:bg-emerald-500/20 selection:text-emerald-900 text-left">
      <SEO 
        title="Gestão Financeira Inteligente com IA"
        description="Poupe horas de trabalho. O DespesaGo usa IA para processar seus recibos e organizar suas prestações de contas automaticamente."
      >
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </SEO>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Logo size="md" />
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm font-bold text-[#86868B] transition-colors hover:text-[#1D1D1F]"
            >
              Entrar
            </button>
            <Button size="sm" onClick={() => navigate('/login')} className="px-4">
              Começar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-16 overflow-hidden sm:pt-48 sm:pb-32 lg:pt-64">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-[#1D1D1F] sm:text-6xl md:text-8xl leading-[1.05]">
              Documente sem<br />
              <span className="text-emerald-500">
                digitar nada.
              </span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto mt-8 text-lg text-[#86868B] sm:text-xl font-medium"
          >
            Fotografe o recibo. Nossa IA extrai tudo em segundos e envia para o financeiro. 
            Menos planilhas, mais foco no seu trabalho.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center mt-12 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/login')} 
              className="w-full sm:w-auto px-12 shadow-premium"
              aria-label="Começar teste grátis do DespesaGo"
            >
              Testar Grátis
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth'})} 
              className="w-full sm:w-auto px-12"
              aria-label="Saiba como funciona o DespesaGo"
            >
              Explorar
            </Button>
          </motion.div>
        </div>

        {/* OCR Animation Demo (Premium Container) */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto mt-20 sm:mt-32 px-4"
        >
          <div className="relative p-3 rounded-[32px] bg-[#F5F5F7] shadow-soft border border-[#EBEBEB]">
            <OCRDemo />
          </div>
        </motion.div>
      </section>

      {/* Como Funciona (Clean Grid) */}
      <section id="como-funciona" className="py-24 bg-white sm:py-32">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F] sm:text-5xl">
              Ficou fácil prestar contas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#F5F5F7] p-10 rounded-[24px] border border-transparent hover:border-[#EBEBEB] transition-all group"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-[16px] bg-white text-emerald-600 mb-8 border border-[#EBEBEB] group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-[#1D1D1F] mb-4">{feature.name}</h3>
                <p className="text-[#86868B] font-medium leading-[1.6]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Segmentação Premium */}
      <section className="py-24 bg-[#F5F5F7] sm:py-32 border-t border-[#EBEBEB]">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Gestores */}
            <div className="bg-white p-10 rounded-[32px] shadow-soft border border-[#EBEBEB] group relative overflow-hidden transition-all hover:shadow-premium">
              <h3 className="text-2xl font-bold text-[#1D1D1F] mb-8">Para Gestores</h3>
              <ul className="space-y-6">
                <ListItem icon={CheckCircle2} title="Visibilidade Total" text="Acompanhe os gastos em tempo real, direto no painel." />
                <ListItem icon={CheckCircle2} title="Zero Planilha" text="Receba os dados estruturados e prontos para exportar." />
                <ListItem icon={CheckCircle2} title="Antifraude IA" text="A IA identifica recibos duplicados em segundos." />
              </ul>
            </div>

            {/* Funcionários */}
            <div className="bg-[#1D1D1F] p-10 rounded-[32px] shadow-premium relative overflow-hidden group">
              <h3 className="text-2xl font-bold text-white mb-8">Para Equipes</h3>
              <ul className="space-y-6 text-[#86868B]">
                <ListItem dark icon={CheckCircle2} title="Adeus Digitação" text="Tire a foto e deixe o app fazer o trabalho pesado." />
                <ListItem dark icon={CheckCircle2} title="Rapidez no Café" text="Documente suas despesas antes mesmo da conta chegar." />
                <ListItem dark icon={CheckCircle2} title="Reembolso Agilizado" text="Fluxo aprovado mais rápido com dados auditados." />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-[#EBEBEB]">
        <div className="px-6 mx-auto max-w-7xl lg:px-8 flex flex-col items-center justify-center text-center">
          <Logo size="md" className="mb-8 opacity-50 hover:opacity-100" />
          <nav className="flex gap-8 mb-8">
            <a href="#" className="text-sm font-bold text-[#86868B] hover:text-[#1D1D1F]">Termos</a>
            <a href="#" className="text-sm font-bold text-[#86868B] hover:text-[#1D1D1F]">Privacidade</a>
            <a href="#" className="text-sm font-bold text-[#86868B] hover:text-[#1D1D1F]">Contato</a>
          </nav>
          <p className="text-xs text-[#86868B] font-medium uppercase tracking-widest">
            &copy; {new Date().getFullYear()} DespesaGo Inteligência Financeira.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ListItem({ icon: Icon, title, text, dark = false }: { icon: any, title: string, text: string, dark?: boolean }) {
  return (
    <li className="flex items-start gap-4">
      <div className={`mt-1 flex items-center justify-center w-6 h-6 rounded-full ${dark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
        <Icon size={16} />
      </div>
      <div>
        <h4 className={`text-base font-bold ${dark ? 'text-white' : 'text-[#1D1D1F]'}`}>{title}</h4>
        <p className={`text-sm font-medium ${dark ? 'text-[#86868B]' : 'text-slate-500'}`}>{text}</p>
      </div>
    </li>
  );
}

const features = [
  {
    name: 'Tirar Foto',
    description: 'Basta abrir o app e fotografar o recibo. Simples assim.',
    icon: Camera,
  },
  {
    name: 'Extração Instantânea',
    description: 'Nossa IA identifica o lojista, CNPJ, data, valor e categoria automaticamente.',
    icon: Sparkles,
  },
  {
    name: 'Fluxo de Aprovação',
    description: 'A despesa cai no painel do gestor já estruturada e pronta para ser validada.',
    icon: CheckCircle2,
  },
];

function OCRDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white rounded-[24px] overflow-hidden flex flex-col md:flex-row min-h-[480px]">
      <div className="w-full md:w-1/2 p-12 flex items-center justify-center bg-[#F5F5F7] relative">
        <motion.div 
          className="bg-white p-8 rounded-xl shadow-premium w-full max-w-[280px] relative font-mono text-[11px] text-[#1D1D1F] border border-[#EBEBEB] rotate-[-1deg]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center font-bold text-sm mb-6 border-b border-dashed border-[#EBEBEB] pb-4 uppercase">
            RESTAURANTE PREMIUM <br/><span className="text-[9px] text-[#86868B] font-sans">CNPJ 12.345.678/0001-90</span>
          </div>
          <div className="flex justify-between mb-2"><span>CAFÉ EXPRESSO</span><span>R$ 12,00</span></div>
          <div className="flex justify-between mb-6 border-b border-dashed border-[#EBEBEB] pb-4"><span>CROISSANT</span><span>R$ 18,00</span></div>
          <div className="flex justify-between text-base font-bold mb-4 font-sans tracking-tight"><span>TOTAL</span><span>R$ 30,00</span></div>
          <div className="text-[9px] text-center text-[#86868B] font-sans">27/03/2026 - 09:42:00</div>

          <AnimatePresence>
            {step === 1 && (
              <motion.div
                initial={{ top: 0, opacity: 0 }}
                animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                className="absolute left-0 right-0 h-[4px] bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-10"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="w-full md:w-1/2 p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#EBEBEB]">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Processamento IA</span>
        </div>

        <div className="space-y-6">
          <Field label="Estabelecimento" value="Restaurante Premium" show={step === 2} />
          <Field label="Valor" value="R$ 30,00" show={step === 2} />
          <Field label="Categoria" value="Alimentação" show={step === 2} isTag />
          
          <AnimatePresence>
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-8">
                <div className="w-full py-4 bg-[#1D1D1F] text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 shadow-premium">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Pronto para Reembolso
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, show, isTag = false }: { label: string, value: string, show: boolean, isTag?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">{label}</span>
      <div className="h-12 bg-[#F5F5F7] rounded-xl border border-transparent flex items-center px-4 relative overflow-hidden">
        {show ? (
          <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className={isTag ? "bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-tighter" : "text-[#1D1D1F] font-bold"}>
            {value}
          </motion.span>
        ) : (
          <div className="w-20 h-2 bg-[#EBEBEB] rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}
