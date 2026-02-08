import { Linking } from 'react-native';
import { CURRENCY_CONFIG, WHATSAPP_DEFAULT_MESSAGE } from '../constants';

// Formatar valor em reais
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
};

// Formatar valor abreviado (ex: R$ 100K, R$ 1.5M)
export const formatarMoedaAbreviada = (valor: number): string => {
  if (valor >= 1000000) {
    return `R$ ${(valor / 1000000).toFixed(1).replace('.', ',')}M`;
  }
  if (valor >= 1000) {
    return `R$ ${(valor / 1000).toFixed(0)}K`;
  }
  return formatarMoeda(valor);
};

// Formatar área em m²
export const formatarArea = (area: number): string => {
  return `${area.toLocaleString('pt-BR')} m²`;
};

// Formatar endereço completo
export const formatarEndereco = (localizacao: {
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}): string => {
  const partes = [
    localizacao.endereco,
    localizacao.bairro,
    localizacao.cidade,
    localizacao.estado,
  ].filter(Boolean);

  return partes.join(', ');
};

// Formatar endereço resumido
export const formatarEnderecoResumido = (localizacao: {
  bairro?: string;
  cidade?: string;
}): string => {
  const partes = [localizacao.bairro, localizacao.cidade].filter(Boolean);
  return partes.join(', ');
};

// Abrir WhatsApp com mensagem
export const abrirWhatsApp = async (
  numero: string,
  mensagem?: string
): Promise<void> => {
  // Limpar número (remover caracteres não numéricos)
  const numeroLimpo = numero.replace(/\D/g, '');

  // Adicionar código do país se não tiver
  const numeroCompleto = numeroLimpo.startsWith('55')
    ? numeroLimpo
    : `55${numeroLimpo}`;

  const url = mensagem
    ? `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensagem)}`
    : `https://wa.me/${numeroCompleto}`;

  const canOpen = await Linking.canOpenURL(url);

  if (canOpen) {
    await Linking.openURL(url);
  } else {
    throw new Error('Não foi possível abrir o WhatsApp');
  }
};

// Abrir WhatsApp para contato sobre imóvel
export const contatarSobreImovel = async (
  whatsapp: string,
  imovelTitulo: string,
  imovelId: string
): Promise<void> => {
  const mensagem = WHATSAPP_DEFAULT_MESSAGE(imovelTitulo, imovelId);
  await abrirWhatsApp(whatsapp, mensagem);
};

// Compartilhar imóvel via WhatsApp
export const compartilharImovelWhatsApp = async (
  imovelTitulo: string,
  imovelId: string,
  valor: number,
  localizacao: string
): Promise<void> => {
  const mensagem = `🏠 *${imovelTitulo}*\n\n💰 ${formatarMoeda(valor)}\n📍 ${localizacao}\n\n🔗 Veja mais detalhes no app Livvo Smart!\n\nID: ${imovelId}`;

  const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

  const canOpen = await Linking.canOpenURL(url);

  if (canOpen) {
    await Linking.openURL(url);
  } else {
    throw new Error('Não foi possível abrir o WhatsApp');
  }
};

// Formatar telefone para exibição
export const formatarTelefone = (telefone: string): string => {
  const limpo = telefone.replace(/\D/g, '');

  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
  }

  if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
  }

  return telefone;
};

// Formatar data
export const formatarData = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR');
};

// Gerar label para características
export const getCaracteristicaLabel = (chave: string): string => {
  const labels: Record<string, string> = {
    quartos: 'Quartos',
    suites: 'Suítes',
    banheiros: 'Banheiros',
    vagas_garagem: 'Vagas',
    area_total: 'Área Total',
    area_construida: 'Área Construída',
    piscina: 'Piscina',
    churrasqueira: 'Churrasqueira',
    jardim: 'Jardim',
    academia: 'Academia',
    portaria_24h: 'Portaria 24h',
    elevador: 'Elevador',
    ar_condicionado: 'Ar-condicionado',
    mobiliado: 'Mobiliado',
  };

  return labels[chave] || chave;
};

// Truncar texto
export const truncarTexto = (texto: string, maxLength: number): string => {
  if (texto.length <= maxLength) return texto;
  return `${texto.slice(0, maxLength)}...`;
};
