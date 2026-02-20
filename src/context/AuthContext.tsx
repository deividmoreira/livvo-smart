import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { buscarPerfil, login as serviceLogin, logout as serviceLogout, registrarCorretor as serviceRegistrarCorretor, registrarUsuario as serviceRegistrarUsuario } from '../services/auth';
import type { Perfil, DadosRegistroCorretor, DadosRegistroUsuario } from '../types';

interface AuthContextType {
  usuario: Perfil | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  registrarCorretor: (dados: DadosRegistroCorretor) => Promise<void>;
  registrarUsuario: (dados: DadosRegistroUsuario) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        carregarPerfil(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        carregarPerfil(session.user.id);
      } else {
        setUsuario(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const carregarPerfil = async (userId: string) => {
    try {
      const perfil = await buscarPerfil(userId);
      setUsuario(perfil);
    } catch {
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, senha: string) => {
    await serviceLogin(email, senha);
  };

  const logout = async () => {
    await serviceLogout();
    setUsuario(null);
  };

  const registrarCorretor = async (dados: DadosRegistroCorretor) => {
    await serviceRegistrarCorretor(dados);
  };

  const registrarUsuario = async (dados: DadosRegistroUsuario) => {
    await serviceRegistrarUsuario(dados);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, registrarCorretor, registrarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
};
