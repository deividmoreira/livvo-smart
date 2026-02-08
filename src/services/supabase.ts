import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Supabase - substitua com suas credenciais
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sua-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tipos para Database (serão gerados pelo Supabase CLI posteriormente)
export type Database = {
  public: {
    Tables: {
      imoveis: {
        Row: {
          id: string;
          tipo: string;
          titulo: string;
          descricao: string;
          valor: number;
          latitude: number;
          longitude: number;
          endereco: string | null;
          bairro: string | null;
          cidade: string;
          estado: string;
          cep: string | null;
          status: string;
          area_total: number | null;
          area_construida: number | null;
          quartos: number | null;
          suites: number | null;
          banheiros: number | null;
          vagas_garagem: number | null;
          caracteristicas: Record<string, boolean> | null;
          anunciante_tipo: string;
          corretor_id: string | null;
          imobiliaria_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['imoveis']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['imoveis']['Insert']>;
      };
      corretores: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          foto_url: string | null;
          creci: string;
          whatsapp: string;
          telefone: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['corretores']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['corretores']['Insert']>;
      };
      imobiliarias: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          logo_url: string | null;
          creci: string;
          whatsapp: string;
          telefone: string | null;
          email: string | null;
          endereco: string | null;
          website: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['imobiliarias']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['imobiliarias']['Insert']>;
      };
      midias: {
        Row: {
          id: string;
          imovel_id: string;
          url: string;
          tipo: string;
          principal: boolean;
          ordem: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['midias']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['midias']['Insert']>;
      };
    };
  };
};
