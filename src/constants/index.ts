// Cores do aplicativo - Editorial Luxury Theme
export const COLORS = {
  primary: '#0F172A', // Slate 900 - Deep Professional Navy
  primaryDark: '#020617', // Slate 950
  primaryLight: '#334155', // Slate 700
  accent: '#B45309', // Amber 700 - Bronze/Gold Accent
  secondary: '#059669', // Emerald 600 - Success/Nature
  secondaryDark: '#047857',
  background: '#FAFAFA', // Crisp Off-White
  backgroundDark: '#F1F5F9', // Slate 100
  surface: '#FFFFFF',
  text: '#1C1917', // Stone 900 - Warm Black
  textSecondary: '#57534E', // Stone 600
  textLight: '#A8A29E', // Stone 400
  border: '#E7E5E4', // Stone 200
  error: '#DC2626', // Red 600
  warning: '#D97706', // Amber 600
  success: '#059669', // Emerald 600
  whatsapp: '#25D366',
  // Status do imóvel
  statusDisponivel: '#059669',
  statusNegociacao: '#D97706',
  statusVendido: '#DC2626',
  statusReservado: '#7C3AED', // Violet 600
};

// Fontes
export const FONTS = {
  family: {
    heading: 'PlayfairDisplay_700Bold',
    body: 'Manrope_400Regular',
    bodyBold: 'Manrope_700Bold',
  },
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  bold: 'Manrope_700Bold',
  heading: 'PlayfairDisplay_700Bold',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 34,
  },
};

// Espaçamentos
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Raios de borda - Refined but Friendly
export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20, // Slightly reduced from 24 for cleaner look
  xxl: 28,
  '3xl': 32,
  full: 9999,
};

// Sombras - Soft & Diffused (Premium feel)
export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

// Glassmorphism Design System
export const GLASS = {
  light: {
    background: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(255, 255, 255, 0.5)',
    shadow: 'rgba(15, 23, 42, 0.1)',
  },
  dark: {
    background: 'rgba(15, 23, 42, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
  blur: 16,
};

// Animações com Reanimated
export const ANIMATIONS = {
  spring: {
    damping: 15,
    stiffness: 120,
    mass: 1,
  },
  timing: {
    duration: 400, // Slower, more elegant
    easing: (t: number) => t * (2 - t), // Ease-out quad
  },
  stagger: 60,
};

// Gradientes
export const GRADIENTS = {
  primary: ['#0F172A', '#1E293B'], // Slate 900 -> 800
  secondary: ['#059669', '#047857'],
  accent: ['#B45309', '#92400E'], // Bronze gradient
  overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)'], // Enhanced overlay
};

// Cores dos marcadores por tipo de imóvel
export const MARKER_COLORS = {
  terreno: {
    background: '#059669', // Emerald
    border: '#047857',
  },
  casa: {
    background: '#0F172A', // Slate 900
    border: '#020617',
  },
  apartamento: {
    background: '#B45309', // Bronze/Accent
    border: '#92400E',
  },
};

// Tipos de imóveis com labels
export const PROPERTY_TYPES = [
  { value: 'terreno', label: 'Terreno', icon: 'map' }, // Updated icon names closer to typical
  { value: 'casa', label: 'Casa', icon: 'home' },
  { value: 'apartamento', label: 'Apartamento', icon: 'building' },
] as const;

// Status com labels e cores
export const PROPERTY_STATUS = {
  disponivel: { label: 'Disponível', color: COLORS.statusDisponivel },
  negociacao: { label: 'Em Negociação', color: COLORS.statusNegociacao },
  vendido: { label: 'Vendido', color: COLORS.statusVendido },
  reservado: { label: 'Reservado', color: COLORS.statusReservado },
} as const;

// Região padrão do mapa (Goiânia)
export const DEFAULT_MAP_REGION = {
  latitude: -16.6869,
  longitude: -49.2648,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Configurações de busca
export const SEARCH_CONFIG = {
  defaultPerPage: 20,
  maxPerPage: 50,
  debounceMs: 500,
};

// Formato de moeda
export const CURRENCY_CONFIG = {
  locale: 'pt-BR',
  currency: 'BRL',
};

// Mensagem padrão do WhatsApp
export const WHATSAPP_DEFAULT_MESSAGE = (imovelTitulo: string, imovelId: string) =>
  `Olá! Vi o imóvel "${imovelTitulo}" (ID: ${imovelId}) no app Livvo Smart e gostaria de mais informações.`;
