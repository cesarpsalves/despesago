import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase.js';
import axios from 'axios';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  companyId: string | null;
  role: 'admin' | 'employee' | null;
  isPlatformAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string, captchaToken?: string) => Promise<{ error: any }>;
  signInWithPassword: (email: string, password: string, captchaToken?: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  requireOnboarding: boolean;
  checkCompanyStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionUpdate(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionUpdate(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const checkCompanyStatus = async () => {
    try {
      // Usando o supabase client seguro pelo RLS pra ver se achamos a empresa do usuário logado
      const { data } = await supabase
        .from('users')
        .select('company_id, role, is_platform_admin')
        .single();
        
      if (data) {
        setCompanyId(data.company_id);
        setRole(data.role as any);
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

  const signInWithEmail = async (email: string, captchaToken?: string) => {
    return await supabase.auth.signInWithOtp({ 
      email,
      options: { 
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        captchaToken,
      }
    });
  };

  const signInWithPassword = async (email: string, password: string, captchaToken?: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken }
    });
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
      requireOnboarding, 
      checkCompanyStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
