import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Login from '../pages/Login';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock do Supabase Client para não fazer requisições reais
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    }
  })
}));

describe('Login Authentication Flow', () => {
  it('Should render the login form correctly', () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    );
    
    expect(screen.getByText('Acessar Conta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nome@suaempresa.com')).toBeInTheDocument();
  });

  it('Should show error on empty submission', async () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /Receber Acesso Mágico/i });
    fireEvent.click(submitBtn);

    const input = screen.getByPlaceholderText('nome@suaempresa.com');
    expect(input).toBeRequired();
  });
});
