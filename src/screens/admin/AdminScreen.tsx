import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Users, Home, User, Briefcase, Shield } from 'lucide-react-native';

import { supabase } from '../../services/supabase';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants';
import type { MainStackParamList } from '../../../App';

type Nav = NativeStackNavigationProp<MainStackParamList>;

interface Estatisticas {
  totalUsuarios: number;
  totalCorretores: number;
  totalAdmins: number;
  totalImoveis: number;
  imoveisDisponivel: number;
  imoveisNegociacao: number;
  imoveisVendido: number;
}

export const AdminScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    setCarregando(true);
    try {
      const [perfis, imoveis] = await Promise.all([
        supabase.from('perfis').select('tipo'),
        supabase.from('imoveis').select('status'),
      ]);

      const perfisList = perfis.data || [];
      const imoveisList = imoveis.data || [];

      setStats({
        totalUsuarios: perfisList.filter(p => p.tipo === 'usuario').length,
        totalCorretores: perfisList.filter(p => p.tipo === 'corretor').length,
        totalAdmins: perfisList.filter(p => p.tipo === 'administrador').length,
        totalImoveis: imoveisList.length,
        imoveisDisponivel: imoveisList.filter(i => i.status === 'disponivel').length,
        imoveisNegociacao: imoveisList.filter(i => i.status === 'negociacao').length,
        imoveisVendido: imoveisList.filter(i => i.status === 'vendido').length,
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as estatísticas.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltarBtn}>
          <ArrowLeft size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Painel Admin</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {carregando ? (
          <View style={styles.centralize}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            {/* Usuários */}
            <Text style={styles.secaoTitulo}>Usuários</Text>
            <View style={styles.statsGrid}>
              <StatCard icone={<User size={22} color={COLORS.primary} />} valor={stats?.totalUsuarios ?? 0} label="Compradores" cor={COLORS.primary} />
              <StatCard icone={<Briefcase size={22} color={COLORS.secondary} />} valor={stats?.totalCorretores ?? 0} label="Corretores" cor={COLORS.secondary} />
              <StatCard icone={<Shield size={22} color={COLORS.accent} />} valor={stats?.totalAdmins ?? 0} label="Admins" cor={COLORS.accent} />
            </View>

            {/* Imóveis */}
            <Text style={styles.secaoTitulo}>Imóveis</Text>
            <View style={styles.statsGrid}>
              <StatCard icone={<Home size={22} color={COLORS.secondary} />} valor={stats?.imoveisDisponivel ?? 0} label="Disponíveis" cor={COLORS.secondary} />
              <StatCard icone={<Home size={22} color={COLORS.warning} />} valor={stats?.imoveisNegociacao ?? 0} label="Negociação" cor={COLORS.warning} />
              <StatCard icone={<Home size={22} color={COLORS.error} />} valor={stats?.imoveisVendido ?? 0} label="Vendidos" cor={COLORS.error} />
            </View>
            <View style={[styles.statsGrid, { justifyContent: 'flex-start' }]}>
              <StatCard icone={<Home size={22} color={COLORS.text} />} valor={stats?.totalImoveis ?? 0} label="Total" cor={COLORS.text} />
            </View>

            {/* Acesso rápido */}
            <Text style={styles.secaoTitulo}>Gerenciar</Text>
            <View style={styles.acoesCard}>
              <AcaoItem
                icone={<Users size={20} color={COLORS.primary} />}
                titulo="Gerenciar Usuários"
                desc="Visualize, edite e remova usuários"
                onPress={() => navigation.navigate('GerenciarUsuarios')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard: React.FC<{ icone: React.ReactNode; valor: number; label: string; cor: string }> = ({ icone, valor, label, cor }) => (
  <View style={[styles.statCard, { borderTopColor: cor }]}>
    {icone}
    <Text style={[styles.statValor, { color: cor }]}>{valor}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const AcaoItem: React.FC<{ icone: React.ReactNode; titulo: string; desc: string; onPress: () => void }> = ({ icone, titulo, desc, onPress }) => (
  <TouchableOpacity style={styles.acaoItem} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.acaoIcone}>{icone}</View>
    <View style={styles.acaoTextos}>
      <Text style={styles.acaoTitulo}>{titulo}</Text>
      <Text style={styles.acaoDesc}>{desc}</Text>
    </View>
    <Text style={styles.acaoSeta}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  voltarBtn: { padding: SPACING.xs },
  headerTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  centralize: { paddingTop: 80, alignItems: 'center' },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
    fontFamily: FONTS.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 90,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderTopWidth: 3,
    ...SHADOWS.sm,
  },
  statValor: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    marginVertical: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  acoesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  acaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  acaoIcone: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  acaoTextos: { flex: 1 },
  acaoTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  acaoDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  acaoSeta: { fontSize: 22, color: COLORS.textSecondary },
});
