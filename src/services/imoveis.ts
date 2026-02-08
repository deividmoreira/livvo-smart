import { supabase } from './supabase';
import type { Imovel, FiltrosBusca, ResultadoBusca, PropertyType, PropertyStatus, MapRegion } from '../types';
import { SEARCH_CONFIG } from '../constants';

// Transforma dados do banco para o tipo Imovel
const transformarImovel = (data: any): Imovel => {
  return {
    id: data.id,
    tipo: data.tipo as PropertyType,
    titulo: data.titulo,
    descricao: data.descricao,
    valor: data.valor,
    status: data.status as PropertyStatus,
    localizacao: {
      latitude: data.latitude,
      longitude: data.longitude,
      endereco: data.endereco,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      cep: data.cep,
    },
    caracteristicas: {
      area_total: data.area_total,
      area_construida: data.area_construida,
      quartos: data.quartos,
      suites: data.suites,
      banheiros: data.banheiros,
      vagas_garagem: data.vagas_garagem,
      ...(data.caracteristicas || {}),
    },
    midias: data.midias || [],
    anunciante: {
      tipo: data.anunciante_tipo,
      corretor: data.corretor || undefined,
      imobiliaria: data.imobiliaria || undefined,
    },
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

// Buscar imóveis com filtros
export const buscarImoveis = async (
  filtros: FiltrosBusca,
  pagina: number = 1,
  porPagina: number = SEARCH_CONFIG.defaultPerPage
): Promise<ResultadoBusca> => {
  let query = supabase
    .from('imoveis')
    .select(`
      *,
      midias (*),
      corretor:corretores (*),
      imobiliaria:imobiliarias (*)
    `, { count: 'exact' })
    .eq('status', 'disponivel');

  // Aplicar filtros
  if (filtros.tipo) {
    query = query.eq('tipo', filtros.tipo);
  }

  if (filtros.valorMinimo) {
    query = query.gte('valor', filtros.valorMinimo);
  }

  if (filtros.valorMaximo) {
    query = query.lte('valor', filtros.valorMaximo);
  }

  if (filtros.cidade) {
    query = query.ilike('cidade', `%${filtros.cidade}%`);
  }

  if (filtros.bairro) {
    query = query.ilike('bairro', `%${filtros.bairro}%`);
  }

  if (filtros.quartosMinimo) {
    query = query.gte('quartos', filtros.quartosMinimo);
  }

  if (filtros.areaMinima) {
    query = query.gte('area_total', filtros.areaMinima);
  }

  if (filtros.areaMaxima) {
    query = query.lte('area_total', filtros.areaMaxima);
  }

  // Paginação
  const offset = (pagina - 1) * porPagina;
  query = query.range(offset, offset + porPagina - 1);

  // Ordenar por data de criação
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Erro ao buscar imóveis:', error);
    throw error;
  }

  return {
    imoveis: (data || []).map(transformarImovel),
    total: count || 0,
    pagina,
    porPagina,
  };
};

// Buscar imóveis por região do mapa
export const buscarImoveisPorRegiao = async (
  region: MapRegion,
  filtros?: FiltrosBusca
): Promise<Imovel[]> => {
  const latMin = region.latitude - region.latitudeDelta / 2;
  const latMax = region.latitude + region.latitudeDelta / 2;
  const lngMin = region.longitude - region.longitudeDelta / 2;
  const lngMax = region.longitude + region.longitudeDelta / 2;

  let query = supabase
    .from('imoveis')
    .select(`
      *,
      midias (*),
      corretor:corretores (*),
      imobiliaria:imobiliarias (*)
    `)
    .eq('status', 'disponivel')
    .gte('latitude', latMin)
    .lte('latitude', latMax)
    .gte('longitude', lngMin)
    .lte('longitude', lngMax);

  // Aplicar filtros adicionais
  if (filtros?.tipo) {
    query = query.eq('tipo', filtros.tipo);
  }

  if (filtros?.valorMaximo) {
    query = query.lte('valor', filtros.valorMaximo);
  }

  if (filtros?.valorMinimo) {
    query = query.gte('valor', filtros.valorMinimo);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    console.error('Erro ao buscar imóveis por região:', error);
    throw error;
  }

  return (data || []).map(transformarImovel);
};

// Buscar imóvel por ID
export const buscarImovelPorId = async (id: string): Promise<Imovel | null> => {
  const { data, error } = await supabase
    .from('imoveis')
    .select(`
      *,
      midias (*),
      corretor:corretores (*),
      imobiliaria:imobiliarias (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Não encontrado
    }
    console.error('Erro ao buscar imóvel:', error);
    throw error;
  }

  return transformarImovel(data);
};

// Buscar imóveis por texto (busca em título, descrição, cidade, bairro)
export const buscarImoveisPorTexto = async (
  texto: string,
  filtros?: FiltrosBusca
): Promise<Imovel[]> => {
  // Parse do texto para extrair informações
  const textoLower = texto.toLowerCase();

  let query = supabase
    .from('imoveis')
    .select(`
      *,
      midias (*),
      corretor:corretores (*),
      imobiliaria:imobiliarias (*)
    `)
    .eq('status', 'disponivel');

  // Verificar se menciona tipo de imóvel
  if (textoLower.includes('terreno')) {
    query = query.eq('tipo', 'terreno');
  } else if (textoLower.includes('casa')) {
    query = query.eq('tipo', 'casa');
  } else if (textoLower.includes('apartamento')) {
    query = query.eq('tipo', 'apartamento');
  }

  // Extrair valor máximo do texto (ex: "até 100 mil")
  const valorMatch = texto.match(/(\d+)\s*(mil|milhão|milhões)/i);
  if (valorMatch) {
    let valor = parseInt(valorMatch[1]);
    if (valorMatch[2].toLowerCase() === 'mil') {
      valor *= 1000;
    } else {
      valor *= 1000000;
    }
    query = query.lte('valor', valor);
  }

  // Buscar por cidade ou bairro mencionado
  // Palavras comuns a ignorar
  const palavrasIgnorar = ['procuro', 'quero', 'busco', 'um', 'uma', 'no', 'na', 'em', 'de', 'do', 'da', 'com', 'preço', 'valor', 'até', 'reais', 'terreno', 'casa', 'apartamento', 'bairro', 'mil', 'milhão', 'milhões'];

  const palavras = texto.split(/[\s,]+/).filter(p =>
    p.length > 2 && !palavrasIgnorar.includes(p.toLowerCase()) && !p.match(/^\d+$/)
  );

  if (palavras.length > 0) {
    // Buscar em bairro e cidade
    const orConditions = palavras.map(p =>
      `bairro.ilike.%${p}%,cidade.ilike.%${p}%`
    ).join(',');

    query = query.or(orConditions);
  }

  // Aplicar filtros adicionais passados
  if (filtros?.valorMaximo) {
    query = query.lte('valor', filtros.valorMaximo);
  }

  if (filtros?.valorMinimo) {
    query = query.gte('valor', filtros.valorMinimo);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('Erro ao buscar imóveis por texto:', error);
    throw error;
  }

  return (data || []).map(transformarImovel);
};

// Atualizar status do imóvel (para corretores/imobiliárias)
export const atualizarStatusImovel = async (
  id: string,
  status: PropertyStatus
): Promise<void> => {
  const { error } = await supabase
    .from('imoveis')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
};

// Criar novo imóvel
export const criarImovel = async (
  imovel: Omit<Imovel, 'id' | 'created_at' | 'updated_at' | 'midias'>
): Promise<string> => {
  const { data, error } = await supabase
    .from('imoveis')
    .insert({
      tipo: imovel.tipo,
      titulo: imovel.titulo,
      descricao: imovel.descricao,
      valor: imovel.valor,
      latitude: imovel.localizacao.latitude,
      longitude: imovel.localizacao.longitude,
      endereco: imovel.localizacao.endereco,
      bairro: imovel.localizacao.bairro,
      cidade: imovel.localizacao.cidade,
      estado: imovel.localizacao.estado,
      cep: imovel.localizacao.cep,
      status: imovel.status,
      area_total: imovel.caracteristicas.area_total,
      area_construida: imovel.caracteristicas.area_construida,
      quartos: imovel.caracteristicas.quartos,
      suites: imovel.caracteristicas.suites,
      banheiros: imovel.caracteristicas.banheiros,
      vagas_garagem: imovel.caracteristicas.vagas_garagem,
      caracteristicas: imovel.caracteristicas,
      anunciante_tipo: imovel.anunciante.tipo,
      corretor_id: imovel.anunciante.corretor?.id,
      imobiliaria_id: imovel.anunciante.imobiliaria?.id,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Erro ao criar imóvel:', error);
    throw error;
  }

  return data.id;
};

// Buscar imóveis do corretor/imobiliária logado
export const buscarMeusImoveis = async (
  userId: string,
  tipo: 'corretor' | 'imobiliaria'
): Promise<Imovel[]> => {
  // Primeiro buscar o ID do corretor/imobiliária
  const tabela = tipo === 'corretor' ? 'corretores' : 'imobiliarias';
  const { data: anunciante, error: anuncianteError } = await supabase
    .from(tabela)
    .select('id')
    .eq('user_id', userId)
    .single();

  if (anuncianteError || !anunciante) {
    return [];
  }

  const campo = tipo === 'corretor' ? 'corretor_id' : 'imobiliaria_id';

  const { data, error } = await supabase
    .from('imoveis')
    .select(`
      *,
      midias (*),
      corretor:corretores (*),
      imobiliaria:imobiliarias (*)
    `)
    .eq(campo, anunciante.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar meus imóveis:', error);
    throw error;
  }

  return (data || []).map(transformarImovel);
};
