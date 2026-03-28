import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { toast } from "sonner";

/**
 * AuthCallback: O hub de retorno de todas as ações do Supabase Auth.
 * Gerencia Magic Links, Confirmação de Email e Recuperação de Senha.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Autenticando...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        
        // Detectar o tipo de ação (recovery, magic link, signup)
        let type = url.searchParams.get("type");
        const next = url.searchParams.get("next") || "/app";
        const hash = window.location.hash;

        if (!type && (hash.includes("type=recovery") || next.includes("password") || hash.includes("error_code=401"))) {
          type = "recovery";
        }

        console.log("AuthCallback: Processing...", { type, next, hasCode: !!code });

        // Se o Supabase enviou um código (PKCE Flow), trocamos pela sessão
        if (code) {
          setStatus("Trocando código pela sessão...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // Aguarda um pequeno delay para o listener do AuthContext capturar a sessão
        setStatus("Sessão confirmada! Preparando seu ambiente...");
        
        // Verifica se agora temos uma sessão ativa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          if (type === "recovery" || next.includes("password") || next.includes("reset")) {
            setStatus("Acesso recuperado! Redirecionando para definir senha...");
            setTimeout(() => navigate("/auth/reset-password", { replace: true }), 1500);
          } else {
            setStatus("Bem-vindo de volta! Carregando...");
            setTimeout(() => navigate(next, { replace: true }), 1000);
          }
        } else {
          // Se não houver sessão nem código, podemos estar em um fluxo de hash (Implicit Flow)
          // O hook onAuthStateChange deve capturar isso, mas vamos dar um tempo
          setStatus("Verificando credenciais...");
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              navigate(next, { replace: true });
            } else {
              console.warn("Nenhuma sessão encontrada após delay.");
              toast.error("Link expirado ou já utilizado.");
              navigate("/login", { replace: true });
            }
          }, 2000);
        }
      } catch (err: any) {
        console.error("Auth callback error:", err.message);
        toast.error("Falha na autenticação. Tente gerar um novo link.");
        navigate("/login", { replace: true });
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-inter">
      <div className="flex flex-col items-center gap-6 p-12 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-slate-100 max-w-sm w-full">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-bounce" />
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-900 mb-2">Quase lá!</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
