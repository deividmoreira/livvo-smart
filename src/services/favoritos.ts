import { supabase } from './supabase';
import type { Favorito } from '../types';

export const adicionarFavorito = async (imovelId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase.from('favoritos').insert({
    user_id: user.id,
    imovel_id: imovelId,
  });

  if (error) throw error;
};

export const removerFavorito = async (imovelId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('favoritos')
    .delete()
    .eq('user_id', user.id)
    .eq('imovel_id', imovelId);

  if (error) throw error;
};

export const buscarFavoritos = async (): Promise<Favorito[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('favoritos')
    .select(`
      *,
      imovel:imoveis(
        *,
        midias(*),
        corretor:corretores(*),
        imobiliaria:imobiliarias(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []) as Favorito[];
};

export const isFavorito = async (imovelId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('favoritos')
    .select('id')
    .eq('user_id', user.id)
    .eq('imovel_id', imovelId)
    .maybeSingle();

  if (error) return false;
  return !!data;
};
