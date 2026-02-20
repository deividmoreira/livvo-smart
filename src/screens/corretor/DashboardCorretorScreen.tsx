import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Plus, Home, Edit2, Trash2 } from 'lucide-react-native';

import { buscarMeusImoveis, atualizarStatusImovel } from '../../services/imoveis';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS, PROPERTY_STATUS } from '../../constants';
import { formatarMoeda } from '../../utils/formatters';
import type { Imovel, PropertyStatus } from '../../types';
import type { MainStackParamList } from '../../../App';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const STATUS_OPCOES: PropertyStatus[] = ['disponivel', 'negociacao', 'reservado', 'vendido'];

export const DashboardCorretorScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { usuario } = useAuth();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!usuario) return;
    setCarregando(true);
    try {
      const lista = await buscarMeusImoveis(usuario.user_id, 'corretor');
      setImoveis(lista);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar seus imóveis.');
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleAlterarStatus = (imovel: Imovel) => {
    const opcoes = STATUS_OPCOES.map(s => ({
      text: PROPERTY_STATUS[s].label,
      onPress: async () => {
        try {
          await atualizarStatusImovel(imovel.id, s);
          setImoveis(prev => prev.map(i => i.id === imovel.id ? { ...i, status: s } : i));
        } catch {
          Alert.alert('Erro', 'Não foi possível alterar o status.');
        }
      },
    }));

    Alert.alert('Alterar status', `Imóvel: ${imovel.titulo}`, [
      ...opcoes,
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleDeletar = (imovel: Imovel) => {
    Alert.alert('Deletar imóvel', `Tem certeza que deseja deletar "${imovel.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('imoveis').delete().eq('id', imovel.id);
            if (error) throw error;
            setImoveis(prev => prev.filter(i => i.id !== imovel.id));
          } catch {
            Alert.alert('Erro', 'Não foi possível deletar o imóvel.');
          }
        },
      },
    ]);
  };

  const renderImovel = ({ item }: { item: Imovel }) => {
    const statusCfg = PROPERTY_STATUS[item.status];
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTipoWrapper}>
            <Home size={14} color={COLORS.primary} />
            <Text style={styles.cardTipo}>{item.tipo}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + '20' }]}>
            <Text style={[styles.statusTexto, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>

        <Text style={styles.cardTitulo} numberOfLines={2}>{item.titulo}</Text>
        <Text style={styles.cardValor}>{formatarMoeda(item.valor)}</Text>
        {item.localizacao.bairro && (
          <Text style={styles.cardLocal}>{item.localizacao.bairro}, {item.localizacao.cidade}</Text>
        )}

        <View style={styles.cardAcoes}>
          <TouchableOpacity
            style={styles.acaoBotao}
            onPress={() => handleAlterarStatus(item)}
          >
            <Text style={styles.acaoBotaoTexto}>Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acaoBotao}
            onPress={() => navigation.navigate('CriarEditarImovel', { imovelId: item.id })}
          >
            <Edit2 size={14} color={COLORS.primary} />
            <Text style={styles.acaoBotaoTexto}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acaoBotao, styles.acaoBotaoPerigo]}
            onPress={() => handleDeletar(item)}
          >
            <Trash2 size={14} color={COLORS.error} />
            <Text style={[styles.acaoBotaoTexto, { color: COLORS.error }]}>Deletar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltarBtn}>
          <ArrowLeft size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Meus Imóveis</Text>
        <TouchableOpacity
          style={styles.novoBotao}
          onPress={() => navigation.navigate('CriarEditarImovel', {})}
        >
          <Plus size={20} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.centralize}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : imoveis.length === 0 ? (
        <View style={styles.centralize}>
          <Home size={48} color={COLORS.border} />
          <Text style={styles.vazioTitulo}>Nenhum imóvel cadastrado</Text>
          <Text style={styles.vazioDesc}>Crie seu primeiro anúncio agora</Text>
          <TouchableOpacity
            style={styles.botaoNovo}
            onPress={() => navigation.navigate('CriarEditarImovel', {})}
          >
            <Plus size={18} color={COLORS.surface} />
            <Text style={styles.botaoNovoTexto}>Novo imóvel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={imoveis}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={renderImovel}
          onRefresh={carregar}
          refreshing={carregando}
        />
      )}
    </SafeAreaView>
  );
};

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
  novoBotao: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  centralize: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  vazioTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  vazioDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  botaoNovo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  botaoNovoTexto: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  lista: { padding: SPACING.lg, gap: SPACING.md },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTipoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardTipo: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  statusTexto: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  cardValor: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  cardLocal: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.md,
  },
  cardAcoes: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  acaoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  acaoBotaoPerigo: {
    borderColor: COLORS.error + '40',
  },
  acaoBotaoTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});
