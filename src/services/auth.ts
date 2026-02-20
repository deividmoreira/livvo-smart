import { supabase } from './supabase';
import type { Perfil, DadosRegistroCorretor, DadosRegistroUsuario } from '../types';

export const login = async (email: string, senha: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const buscarPerfil = async (userId: string): Promise<Perfil | null> => {
  const { data, error } = await supabase
    .from('perfis')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  if (data?.tipo === 'corretor') {
    const { data: corretor } = await supabase
      .from('corretores')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { ...data, corretor } as Perfil;
  }

  return data as Perfil;
};

export const registrarUsuario = async (dados: DadosRegistroUsuario): Promise<void> => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: dados.email,
    password: dados.senha,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Falha ao criar usuário');

  const { error: perfilError } = await supabase.from('perfis').insert({
    user_id: authData.user.id,
    nome: dados.nome,
    tipo: 'usuario',
    telefone: dados.telefone ?? null,
  });

  if (perfilError) throw perfilError;
};

export const registrarCorretor = async (dados: DadosRegistroCorretor): Promise<void> => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: dados.email,
    password: dados.senha,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Falha ao criar usuário');

  const userId = authData.user.id;

  const { error: perfilError } = await supabase.from('perfis').insert({
    user_id: userId,
    nome: dados.nome,
    tipo: 'corretor',
    foto_url: dados.foto_url ?? null,
    telefone: dados.telefone ?? null,
  });

  if (perfilError) throw perfilError;

  const { error: corretorError } = await supabase.from('corretores').insert({
    user_id: userId,
    nome: dados.nome,
    creci: dados.creci,
    whatsapp: dados.whatsapp,
    telefone: dados.telefone ?? null,
    email: dados.email,
    foto_url: dados.foto_url ?? null,
  });

  if (corretorError) throw corretorError;
};

export const registrarAdmin = async (dados: DadosRegistroUsuario): Promise<void> => {
  // Verifica se o chamador é admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { data: perfil } = await supabase
    .from('perfis')
    .select('tipo')
    .eq('user_id', user.id)
    .single();

  if (perfil?.tipo !== 'administrador') {
    throw new Error('Apenas administradores podem criar outros administradores');
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: dados.email,
    password: dados.senha,
    email_confirm: true,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Falha ao criar usuário admin');

  const { error: perfilError } = await supabase.from('perfis').insert({
    user_id: authData.user.id,
    nome: dados.nome,
    tipo: 'administrador',
    telefone: dados.telefone ?? null,
  });

  if (perfilError) throw perfilError;
};
