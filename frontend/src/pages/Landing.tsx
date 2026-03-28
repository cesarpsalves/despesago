import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Camera, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-brand-500 selection:text-white text-left">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src="/logo/logo_preto_fundo_transparente.png" alt="DespesaGo" className="h-8" />
          <span className="text-xl font-bold tracking-tight text-slate-900">DespesaGo</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-bold text-slate-600 transition-colors hover:text-slate-900"
          >
            Entrar
          </button>
          <Button size="sm" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
            Começar Grátis
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-20 overflow-hidden sm:px-6 sm:pt-48 sm:pb-32 lg:pb-32 lg:pt-56">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl leading-[1.1]">
              Tire uma foto.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-600">
                O resto o DespesaGo resolve.
              </span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="max-w-2xl mx-auto mt-6 text-lg text-slate-600 sm:text-xl font-medium"
          >
            Fotografe o recibo. A IA extrai tudo automaticamente e envia para aprovação em segundos. 
            Pare de perder tempo com planilhas de despesas.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col items-center justify-center mt-10 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
          >
            <Button size="lg" onClick={() => navigate('/login')} className="w-full sm:w-auto shadow-xl shadow-brand-500/20">
              Começar Grátis
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth'})} className="w-full sm:w-auto">
              Como funciona
            </Button>
          </motion.div>
        </div>

        {/* OCR Animation Demo */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="max-w-3xl mx-auto mt-16 sm:mt-24"
        >
          <div className="relative p-2 rounded-[2.5rem] bg-slate-900/5 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-[3rem] lg:p-4 shadow-soft">
            <OCRDemo />
          </div>
        </motion.div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24 bg-white sm:py-32">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="max-w-2xl mx-auto lg:text-center text-center">
            <h2 className="text-base font-bold leading-7 text-brand-600 uppercase tracking-widest">Velocidade e Precisão</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Adeus preenchimento manual
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600 font-medium">
              Transformamos a pior parte da viagem de negócios em um processo instantâneo de 3 etapas.
            </p>
          </div>
          <div className="max-w-2xl mx-auto mt-16 sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col text-center lg:text-left items-center lg:items-start">
                  <dt className="flex flex-col lg:flex-row items-center gap-x-3 text-lg font-bold leading-7 text-slate-900">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mb-4 lg:mb-0 shadow-sm border border-brand-100">
                      <feature.icon className="w-7 h-7" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="flex flex-col flex-auto mt-4 text-base leading-7 text-slate-600 font-medium">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Para Quem É */}
      <section className="py-24 bg-[#FAFAFA] sm:py-32 border-t border-slate-200">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl px-4">
              Criado para quem paga e para quem gasta
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Gestores */}
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-soft border border-slate-100 relative overflow-hidden group hover:border-brand-200 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                Para Gestores
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-600">
                  <CheckCircle2 className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium"><strong>Controle total:</strong> Visibilidade em tempo real dos gastos da equipe.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <CheckCircle2 className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium"><strong>Menos fraude:</strong> A IA confere CNPJ, data e valores contra duplicidades.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <CheckCircle2 className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium"><strong>Sem retrabalho:</strong> Dados caem estruturados e categorizados no financeiro.</span>
                </li>
              </ul>
            </div>

            {/* Funcionários */}
            <div className="bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] shadow-float relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity text-white">
                <Zap className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                Para Funcionários
              </h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium"><strong className="text-white">Sem planilhas:</strong> Nunca mais passe o fim de semana lançando notinhas.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium"><strong className="text-white">Sem formulários:</strong> Tire a foto e deixe o app preencher tudo sozinho.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium"><strong className="text-white">Foque no que importa:</strong> Feche a despesa em segundos no próprio aeroporto.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
              Pronto para focar no seu negócio?
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto mb-10 font-medium">
              Crie sua conta estruturada em 30 segundos. Convide sua equipe e nunca mais digite um recibo.
            </p>
            <Button size="lg" onClick={() => navigate('/login')} className="w-full sm:w-auto text-lg px-12 py-6 shadow-2xl shadow-brand-500/25">
              Criar conta em 30 segundos
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer minimalista */}
      <footer className="py-12 bg-[#FAFAFA] border-t border-slate-200">
        <div className="px-6 mx-auto max-w-7xl lg:px-8 flex flex-col items-center justify-center text-center">
          <img src="/logo/logo_preto_fundo_transparente.png" alt="DespesaGo" className="h-6 mb-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} />
          <p className="text-sm leading-5 text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} DespesaGo (Lupa Soluções). Inteligência Financeira B2B.
          </p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    name: '📸 1. Tire a foto',
    description: 'Abriu o app, tirou foto. Apenas isso. O documento é enviado imediatamente para nossa nuvem segura.',
    icon: Camera,
  },
  {
    name: '⚡ 2. IA preenche tudo',
    description: 'Nossa Inteligência Artificial lê o documento, identifica o lojista, o CNPJ, extrai o valor e categoriza o gasto sozinho.',
    icon: Sparkles,
  },
  {
    name: '✅ 3. Aprovado em segundos',
    description: 'O gestor visualiza a despesa já validada no painel. Sem digitação dupla, sem conferência manual estressante.',
    icon: CheckCircle2,
  },
];

// Interactive OCR Demo Component (Refined)
function OCRDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let interval: any;
    const startSequence = () => {
      interval = setInterval(() => {
        setStep((prev) => (prev + 1) % 3);
      }, 3000);
    };
    
    startSequence();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white rounded-[2rem] overflow-hidden flex flex-col md:flex-row relative min-h-[440px] text-left">
      {/* Receipt Side */}
      <div className="w-full md:w-1/2 p-10 flex items-center justify-center bg-slate-50 relative overflow-hidden group">
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-xl w-full max-w-[240px] relative font-mono text-[10px] text-slate-800 rotate-[-1deg] border border-slate-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center font-bold text-sm mb-4 border-b border-dashed border-slate-300 pb-2 uppercase tracking-tighter">
            Zapp Burger <br/><span className="text-[8px] opacity-50 font-sans">CNPJ 00.312.456/0001-91</span>
          </div>
          <div className="flex justify-between mb-1 font-sans">
            <span className="font-bold">01 X-BURGER DUPLO</span>
            <span className="font-bold">R$ 42,00</span>
          </div>
          <div className="flex justify-between mb-1 font-sans opacity-70">
            <span>01 COCA COLA 350ML</span>
            <span>R$ 9,00</span>
          </div>
          <div className="flex justify-between mb-4 border-b border-dashed border-slate-300 pb-2 font-sans opacity-70">
            <span>TAXA SERV (10%)</span>
            <span>R$ 5,10</span>
          </div>
          <div className="flex justify-between text-base font-bold mb-4 font-sans tracking-tight">
            <span>TOTAL</span>
            <span>R$ 56,10</span>
          </div>
          <div className="text-[8px] text-center text-slate-400 mt-2 italic leading-tight font-sans">
            27/03/2026 - 15:02:44 <br/>
            SESSÃO: 0042 - CAIXA: 01
          </div>

          {/* Laser Animation Overlay */}
          <AnimatePresence>
            {step === 1 && (
              <motion.div
                initial={{ top: 0, opacity: 0 }}
                animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                className="absolute left-0 right-0 h-[3px] bg-brand-500 shadow-[0_0_15px_rgba(16,185,129,0.9)] z-10"
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-500/10 mix-blend-overlay z-0"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Result UI Side */}
      <div className="w-full md:w-1/2 p-8 sm:p-10 border-t md:border-t-0 md:border-l border-slate-100 bg-white flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center border border-brand-100">
            <Sparkles className="w-5 h-5 text-brand-600" />
          </div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em]">Resultado IA</span>
        </div>

        <div className="space-y-5">
          <Field 
            label="Estabelecimento" 
            value="Zapp Burger Ltda" 
            show={step === 2} 
            delay={0.1} 
          />
          <Field 
            label="Data da Despesa" 
            value="27/03/2026" 
            show={step === 2} 
            delay={0.2} 
          />
          <div className="flex gap-4">
            <Field 
              label="Valor" 
              value="R$ 56,10" 
              show={step === 2} 
              delay={0.3} 
              className="flex-[1.5]"
            />
            <Field 
              label="Categoria" 
              value="Refeição" 
              show={step === 2} 
              delay={0.4} 
              className="flex-1"
              isTag
            />
          </div>

          <AnimatePresence>
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-6"
              >
                <div className="w-full py-4 bg-slate-900 text-white text-center font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-slate-200 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" />
                  Pronto para enviar
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, show, delay, className = "", isTag = false }: { label: string, value: string, show: boolean, delay: number, className?: string, isTag?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
      <div className="h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-4 overflow-hidden relative">
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay, duration: 0.3 }}
              className={isTag ? "bg-brand-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider" : "text-slate-900 font-bold text-base"}
            >
              {value}
            </motion.div>
          )}
        </AnimatePresence>
        {!show && <div className="w-16 h-2 bg-slate-200 rounded-full animate-pulse opacity-20" />}
      </div>
    </div>
  );
}
