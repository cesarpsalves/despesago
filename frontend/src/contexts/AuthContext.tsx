import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  companyId: string | null;
  role: 'admin' | 'employee' | null;
  isPlatformAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string, captchaToken?: string) => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string, captchaToken?: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  requireOnboarding: boolean;
  checkCompanyStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

// Re-exportando o provider para facilitar importação
export { AuthProvider } from './AuthProvider';
