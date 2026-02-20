import { supabase } from './supabase';
import { registrarAdmin } from './auth';
import type { Perfil, TipoUsuario, DadosRegistroUsuario } from '../types';

const verificarAdmin = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { data: perfil } = await supabase
    .from('perfis')
    .select('tipo')
    .eq('user_id', user.id)
    .single();

  if (perfil?.tipo !== 'administrador') {
    throw new Error('Acesso restrito a administradores');
  }
};

export const listarUsuarios = async (filtroTipo?: TipoUsuario): Promise<Perfil[]> => {
  await verificarAdmin();

  let query = supabase
    .from('perfis')
    .select('*, corretor:corretores(*)')
    .order('created_at', { ascending: false });

  if (filtroTipo) {
    query = query.eq('tipo', filtroTipo);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []) as Perfil[];
};

export const atualizarUsuario = async (
  userId: string,
  dados: Partial<Pick<Perfil, 'nome' | 'telefone' | 'foto_url' | 'tipo'>>
): Promise<void> => {
  await verificarAdmin();

  const { error } = await supabase
    .from('perfis')
    .update(dados)
    .eq('user_id', userId);

  if (error) throw error;
};

export const deletarUsuario = async (userId: string): Promise<void> => {
  await verificarAdmin();

  // Deletar perfil (cascade deleta favoritos)
  const { error: perfilError } = await supabase
    .from('perfis')
    .delete()
    .eq('user_id', userId);

  if (perfilError) throw perfilError;
};

export const criarAdmin = async (dados: DadosRegistroUsuario): Promise<void> => {
  await registrarAdmin(dados);
};

export const promoverAdmin = async (userId: string): Promise<void> => {
  await verificarAdmin();

  const { error } = await supabase
    .from('perfis')
    .update({ tipo: 'administrador' })
    .eq('user_id', userId);

  if (error) throw error;
};
