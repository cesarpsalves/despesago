import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error.message);
        navigate("/login");
        return;
      }

      if (data.session) {
        // Redireciona para o dashboard principal
        // O AuthContext cuidará de verificar o status da empresa (onboarding)
        navigate("/app");
      } else {
        navigate("/login");
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Autenticando no DespesaGo...</p>
      </div>
    </div>
  );
}
