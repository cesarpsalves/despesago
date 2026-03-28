import { useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase.js';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// Configuração do axios global para mandar o token sempre
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
      // Usando o supabase client seguro pelo RLS pra ver se achamos a empresa do usuário logado
      const { data } = await supabase
        .from('users')
        .select('company_id, role, is_platform_admin')
        .single();

      if (data) {
        setCompanyId(data.company_id);
        setRole(data.role as 'admin' | 'employee' | null);
        setIsPlatformAdmin(!!data.is_platform_admin);
        setRequireOnboarding(!data.company_id);
      } else {
        setCompanyId(null);
        setRole(null);
        setIsPlatformAdmin(false);
        setRequireOnboarding(true);
      }
    } catch (err) {
      console.error('Erro ao verificar status da empresa:', err);
      setRequireOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionUpdate = async (session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);

    if (session) {
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