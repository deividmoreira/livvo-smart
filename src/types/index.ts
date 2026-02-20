// Tipos de imóveis disponíveis
export type PropertyType = 'terreno' | 'casa' | 'apartamento';
export type TipoImovel = PropertyType; // Alias em português

// Status do imóvel
export type PropertyStatus = 'disponivel' | 'negociacao' | 'vendido' | 'reservado';

// Tipo de anunciante
export type AdvertiserType = 'corretor' | 'imobiliaria';

// Tipo de usuário no sistema
export type TipoUsuario = 'corretor' | 'usuario' | 'administrador';

// Interface para localização geográfica
export interface Location {
  latitude: number;
  longitude: number;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

// Interface para mídia (fotos/vídeos)
export interface Media {
  id: string;
  url: string;
  tipo: 'imagem' | 'video';
  principal?: boolean;
  ordem?: number;
}

// Interface para corretor
export interface Corretor {
  id: string;
  nome: string;
  foto_url?: string;
  creci: string;
  whatsapp: string;
  telefone?: string;
  email?: string;
  imobiliaria_id?: string;
  created_at?: string;
}

// Interface para imobiliária
export interface Imobiliaria {
  id: string;
  nome: string;
  logo_url?: string;
  creci: string;
  whatsapp: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  website?: string;
  created_at?: string;
}

// Interface para anunciante (pode ser corretor ou imobiliária)
export interface Anunciante {
  tipo: AdvertiserType;
  corretor?: Corretor;
  imobiliaria?: Imobiliaria;
}

// Características do imóvel
export interface CaracteristicasImovel {
  area_total?: number;
  area_construida?: number;
  quartos?: number;
  suites?: number;
  banheiros?: number;
  vagas_garagem?: number;
  andares?: number;
  // Características específicas
  piscina?: boolean;
  churrasqueira?: boolean;
  jardim?: boolean;
  academia?: boolean;
  portaria_24h?: boolean;
  elevador?: boolean;
  ar_condicionado?: boolean;
  mobiliado?: boolean;
}

// Interface principal do imóvel
export interface Imovel {
  id: string;
  tipo: PropertyType;
  titulo: string;
  descricao: string;
  valor: number;
  localizacao: Location;
  status: PropertyStatus;
  caracteristicas: CaracteristicasImovel;
  midias: Media[];
  anunciante: Anunciante;
  tour_virtual_url?: string; // URL do tour 360° (Kuula, Matterport, etc.)
  created_at: string;
  updated_at: string;
}

// Tipo de visualização na HomeScreen
export type ViewMode = 'lista' | 'mapa';

// Interface para filtros de busca
export interface FiltrosBusca {
  tipo?: PropertyType;
  valorMinimo?: number;
  valorMaximo?: number;
  cidade?: string;
  bairro?: string;
  quartos?: number;
  quartosMinimo?: number;
  areaMinima?: number;
  areaMaxima?: number;
  caracteristicas?: Partial<CaracteristicasImovel>;
}

// Interface para resultado de busca com paginação
export interface ResultadoBusca {
  imoveis: Imovel[];
  total: number;
  pagina: number;
  porPagina: number;
}

// Interface para região do mapa
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Interface para marcador no mapa
export interface MapMarker {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  imovel: Imovel;
}

// Perfil unificado de todos os usuários autenticados
export interface Perfil {
  id: string;
  user_id: string;
  nome: string;
  tipo: TipoUsuario;
  foto_url?: string;
  telefone?: string;
  corretor?: Corretor; // preenchido se tipo === 'corretor'
  created_at: string;
  updated_at?: string;
}

// Interface para favorito
export interface Favorito {
  id: string;
  user_id: string;
  imovel_id: string;
  imovel?: Imovel;
  created_at: string;
}

// Interface para usuário autenticado
export interface Usuario {
  id: string;
  email: string;
  tipo: TipoUsuario;
  perfil?: Perfil;
  created_at: string;
}

// Interface para resposta de autenticação
export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

// Dados para registro de corretor
export interface DadosRegistroCorretor {
  nome: string;
  email: string;
  senha: string;
  creci: string;
  whatsapp: string;
  telefone?: string;
  foto_url?: string;
  imobiliaria?: {
    nome: string;
    creci: string;
  };
}

// Dados para registro de usuário comum
export interface DadosRegistroUsuario {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}
