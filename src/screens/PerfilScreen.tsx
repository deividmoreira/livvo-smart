import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, LogOut, Heart, LayoutDashboard, Shield, User, Phone, Mail } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../constants';
import type { MainStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export const PerfilScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
          }
        },
      },
    ]);
  };

  if (!usuario) return null;

  const inicial = usuario.nome?.charAt(0).toUpperCase() || '?';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltarBtn}>
            <ArrowLeft size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>Meu Perfil</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Avatar e info */}
        <View style={styles.avatarSection}>
          {usuario.foto_url ? (
            // eslint-disable-next-line react-native/no-inline-styles
            <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.avatarLetra}>{inicial}</Text>
            </View>
          ) : (
            <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.avatarLetra}>{inicial}</Text>
            </View>
          )}
          <Text style={styles.nome}>{usuario.nome}</Text>
          <View style={styles.tipoBadge}>
            <Text style={styles.tipoTexto}>{labelTipo(usuario.tipo)}</Text>
          </View>
        </View>

        {/* Dados */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Informações</Text>

          {usuario.telefone && (
            <View style={styles.infoRow}>
              <Phone size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoTexto}>{usuario.telefone}</Text>
            </View>
          )}

          {usuario.corretor?.email && (
            <View style={styles.infoRow}>
              <Mail size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoTexto}>{usuario.corretor.email}</Text>
            </View>
          )}

          {usuario.corretor?.creci && (
            <View style={styles.infoRow}>
              <User size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoTexto}>CRECI: {usuario.corretor.creci}</Text>
            </View>
          )}
        </View>

        {/* Ações por tipo */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Acesso rápido</Text>

          {(usuario.tipo === 'usuario' || usuario.tipo === 'corretor' || usuario.tipo === 'administrador') && (
            <BotaoAcao
              icone={<Heart size={20} color={COLORS.primary} />}
              titulo="Meus Favoritos"
              desc="Imóveis que você salvou"
              onPress={() => navigation.navigate('Favoritos')}
            />
          )}

          {(usuario.tipo === 'corretor' || usuario.tipo === 'administrador') && (
            <BotaoAcao
              icone={<LayoutDashboard size={20} color={COLORS.primary} />}
              titulo="Dashboard do Corretor"
              desc="Gerencie seus imóveis"
              onPress={() => navigation.navigate('DashboardCorretor')}
            />
          )}

          {usuario.tipo === 'administrador' && (
            <BotaoAcao
              icone={<Shield size={20} color={COLORS.accent} />}
              titulo="Painel Administrativo"
              desc="Gerencie usuários e imóveis"
              onPress={() => navigation.navigate('Admin')}
            />
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.botaoLogout} onPress={handleLogout} activeOpacity={0.85}>
          <LogOut size={20} color={COLORS.error} />
          <Text style={styles.botaoLogoutTexto}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const BotaoAcao: React.FC<{
  icone: React.ReactNode;
  titulo: string;
  desc: string;
  onPress: () => void;
}> = ({ icone, titulo, desc, onPress }) => (
  <TouchableOpacity style={styles.acaoItem} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.acaoIcone}>{icone}</View>
    <View style={styles.acaoTextos}>
      <Text style={styles.acaoTitulo}>{titulo}</Text>
      <Text style={styles.acaoDesc}>{desc}</Text>
    </View>
    <Text style={styles.acaoSeta}>›</Text>
  </TouchableOpacity>
);

const labelTipo = (tipo: string): string => {
  switch (tipo) {
    case 'corretor': return 'Corretor';
    case 'administrador': return 'Administrador';
    default: return 'Comprador';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  voltarBtn: {
    padding: SPACING.xs,
  },
  headerTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  avatarLetra: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.surface,
    fontFamily: FONTS.bold,
  },
  nome: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: FONTS.heading,
    marginBottom: SPACING.sm,
  },
  tipoBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  tipoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  cardTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
    fontFamily: FONTS.bold,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoTexto: {
    fontSize: 15,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  acaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
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
  acaoTextos: {
    flex: 1,
  },
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
  acaoSeta: {
    fontSize: 22,
    color: COLORS.textSecondary,
  },
  botaoLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xxxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.error,
  },
  botaoLogoutTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
    fontFamily: FONTS.bold,
  },
});
