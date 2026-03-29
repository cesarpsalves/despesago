import { useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase.js';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// Configuração do axios global para usar o proxy do Vite no desenvolvimento local
axios.defaults.baseURL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api');

// Interceptor global para garantir que o Token de Autenticação esteja em TODAS as chamadas
axios.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.error('Erro ao injetar token no Axios:', err);
  }
  return config;
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'employee' | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [requireOnboarding, setRequireOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkCompanyStatus = async () => {
    try {
      // Agora usamos nossa API centralizada que consulta o esquema correto (app_expense_b2b)
      // e retorna todos os metadados necessários de uma vez.
      const res = await axios.get('/auth/me');
      const data = res.data;

      if (data) {
        setCompanyId(data.companyId || null);
        setRole(data.role as 'admin' | 'employee' | null);
        setIsPlatformAdmin(!!data.isPlatformAdmin);
        setRequireOnboarding(!!data.requireOnboarding);
      } else {
        setCompanyId(null);
        setRole(null);
        setIsPlatformAdmin(false);
        setRequireOnboarding(true);
      }
    } catch (err) {
      console.error('Erro ao verificar status da empresa via API:', err);
      // Mantemos o estado atual ou falhamos silenciosamente para evitar loop de onboarding
      // Só forçamos onboarding se tivermos certeza que o erro é "usuário não encontrado no esquema"
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setRequireOnboarding(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSessionUpdate = async (session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);

    if (session) {
      // O interceptor acima já deve lidar com isso, mas mantemos o default por compatibilidade legado se necessário
      axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      await checkCompanyStatus();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setCompanyId(null);
      setRole(null);
      setRequireOnboarding(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      handleSessionUpdate(data.session);
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionUpdate(session);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithEmail = async (email: string) => {
    try {
      // Agora usamos nossa API profissional para Magic Link (Premium)
      await axios.post('/auth/magic-link', { email });
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao enviar link de acesso.';
      return { error: new Error(errorMessage) };
    }
  };

  const signInWithPassword = async (email: string, password: string, captchaToken?: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken }
    });
  };

  const resetPassword = async (email: string) => {
    try {
      // Agora usamos nossa API profissional que manda email via nosso serviço (Premium)
      await axios.post('/auth/reset-password/request', { email });
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao processar solicitação de senha.';
      return { error: new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUser = async (data: { password?: string; data?: any }) => {
    return await supabase.auth.updateUser(data);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      companyId,
      role,
      isPlatformAdmin,
      loading,
      signInWithEmail,
      signInWithPassword,
      resetPassword,
      signOut,
      updateUser,
      requireOnboarding,
      checkCompanyStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}