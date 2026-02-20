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
import { ArrowLeft, Heart, Search } from 'lucide-react-native';

import { buscarFavoritos, removerFavorito } from '../services/favoritos';
import { PropertyCard } from '../components';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../constants';
import type { Favorito } from '../types';
import type { MainStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export const FavoritosScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await buscarFavoritos();
      setFavoritos(dados);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar seus favoritos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleDesfavoritar = (imovelId: string) => {
    Alert.alert('Remover favorito', 'Deseja remover este imóvel dos favoritos?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await removerFavorito(imovelId);
            setFavoritos(prev => prev.filter(f => f.imovel_id !== imovelId));
          } catch {
            Alert.alert('Erro', 'Não foi possível remover o favorito.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltarBtn}>
          <ArrowLeft size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Favoritos</Text>
        <View style={{ width: 38 }} />
      </View>

      {carregando ? (
        <View style={styles.centralize}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : favoritos.length === 0 ? (
        <View style={styles.centralize}>
          <Heart size={48} color={COLORS.border} />
          <Text style={styles.vazioTitulo}>Nenhum favorito ainda</Text>
          <Text style={styles.vazioDesc}>
            Salve imóveis que você gostou para visualizá-los aqui
          </Text>
          <TouchableOpacity
            style={styles.botaoBuscar}
            onPress={() => navigation.navigate('Home')}
          >
            <Search size={18} color={COLORS.surface} />
            <Text style={styles.botaoBuscarTexto}>Buscar imóveis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (!item.imovel) return null;
            return (
              <View style={styles.itemWrapper}>
                <PropertyCard
                  imovel={item.imovel}
                  onPress={() => navigation.navigate('PropertyDetails', { imovelId: item.imovel_id })}
                />
                <TouchableOpacity
                  style={styles.desfavoritarBtn}
                  onPress={() => handleDesfavoritar(item.imovel_id)}
                >
                  <Heart size={18} color={COLORS.error} fill={COLORS.error} />
                  <Text style={styles.desfavoritarTexto}>Remover</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
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
  centralize: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  vazioTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  vazioDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 21,
  },
  botaoBuscar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    ...SHADOWS.sm,
  },
  botaoBuscarTexto: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  lista: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  itemWrapper: {
    gap: SPACING.xs,
  },
  desfavoritarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    alignSelf: 'flex-end',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  desfavoritarTexto: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
});
