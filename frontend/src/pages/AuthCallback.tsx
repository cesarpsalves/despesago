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
        const next = url.searchParams.get("next") || "/app";
        const type = url.searchParams.get("type") || url.hash.includes("type=recovery") ? "recovery" : "signup";

        // Se o Supabase enviou um código (PKCE Flow), trocamos pela sessão
        if (code) {
          setStatus("Trocando código pela sessão...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // Verifica se agora temos uma sessão ativa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          // Se for recuperação de senha, redirecionamos para definir a nova senha
          if (type === "recovery" || next.includes("reset-password") || next.includes("set-password")) {
            setStatus("Acesso recuperado! Redirecionando para definir senha...");
            // Usamos setTimeout pequeno para o usuário ler a mensagem de sucesso (UX)
            setTimeout(() => navigate(next || "/set-password"), 1000);
          } else {
            navigate(next);
          }
        } else {
          // Se não houver sessão nem código, algo deu errado (ex: link expirado)
          console.warn("Nenhuma sessão encontrada no callback.");
          toast.error("Link expirado ou inválido. Tente novamente.");
          navigate("/login");
        }
      } catch (err: any) {
        console.error("Auth callback error:", err.message);
        toast.error("Falha na autenticação. Verifique o link enviado.");
        navigate("/login");
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
