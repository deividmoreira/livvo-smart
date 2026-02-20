import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Header, MappoPropertyCard } from '../components';
import { InteractiveMapWeb } from '../components/InteractiveMap.web';
import { Imovel, TipoImovel, FiltrosBusca } from '../types';
import { COLORS, SPACING, FONTS } from '../constants';
import { buscarImoveis, buscarImoveisPorTexto } from '../services/imoveis';

type RootStackParamList = {
  Home: undefined;
  PropertyDetails: { imovelId: string };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_DESKTOP = Platform.OS === 'web' && SCREEN_WIDTH >= 900;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [searchText, setSearchText] = useState('');
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedTipo, setSelectedTipo] = useState<TipoImovel | null>(null);
  const [selectedImovelId, setSelectedImovelId] = useState<string | null>(null);

  const [precoMin, setPrecoMin] = useState<number | null>(null);
  const [precoMax, setPrecoMax] = useState<number | null>(null);
  const [minQuartos, setMinQuartos] = useState<number | null>(null);
  const [minBanheiros, setMinBanheiros] = useState<number | null>(null);
  const [minVagas, setMinVagas] = useState<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscar = useCallback(async (texto: string) => {
    setCarregando(true);
    try {
      const filtros: FiltrosBusca = {
        tipo: selectedTipo || undefined,
        valorMinimo: precoMin || undefined,
        valorMaximo: precoMax || undefined,
        quartosMinimo: minQuartos || undefined,
      };

      let resultado: Imovel[];

      if (texto.trim()) {
        resultado = await buscarImoveisPorTexto(texto.trim(), filtros);
        setTotal(resultado.length);
      } else {
        const res = await buscarImoveis(filtros);
        resultado = res.imoveis;
        setTotal(res.total);
      }

      // Filtros client-side não suportados pela API
      if (minBanheiros) {
        resultado = resultado.filter(i => (i.caracteristicas.banheiros || 0) >= minBanheiros);
      }
      if (minVagas) {
        resultado = resultado.filter(i => (i.caracteristicas.vagas_garagem || 0) >= minVagas);
      }

      setImoveis(resultado);
    } catch (err) {
      console.error('Erro ao buscar imóveis:', err);
    } finally {
      setCarregando(false);
    }
  }, [selectedTipo, precoMin, precoMax, minQuartos, minBanheiros, minVagas]);

  // Debounce: re-busca sempre que texto ou filtros mudam
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      buscar(searchText);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText, buscar]);

  const handleSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    buscar(searchText);
  };

  const handleViewDetails = (imovel: Imovel) => {
    navigation.navigate('PropertyDetails', { imovelId: imovel.id });
  };

  const handleMarkerPress = (imovel: Imovel) => {
    setSelectedImovelId(imovel.id);
  };

  const handlePrecoChange = (min: number | null, max: number | null) => {
    setPrecoMin(min);
    setPrecoMax(max);
  };

  const listPanelWidth = IS_DESKTOP ? SCREEN_WIDTH * 0.48 : SCREEN_WIDTH;
  const cardWidth = IS_DESKTOP
    ? (listPanelWidth - SPACING.xl * 2 - SPACING.md) / 2
    : SCREEN_WIDTH - SPACING.lg * 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <Header
        searchText={searchText}
        onSearchChange={setSearchText}
        onSearch={handleSearch}
        selectedTipo={selectedTipo}
        onTipoChange={setSelectedTipo}
        resultCount={total}
        precoMin={precoMin}
        precoMax={precoMax}
        onPrecoChange={handlePrecoChange}
        minQuartos={minQuartos}
        minBanheiros={minBanheiros}
        minVagas={minVagas}
        onQuartosChange={setMinQuartos}
        onBanheirosChange={setMinBanheiros}
        onVagasChange={setMinVagas}
      />

      <View style={styles.mainContent}>
        {Platform.OS === 'web' && IS_DESKTOP && (
          <View style={styles.mapPanel}>
            <InteractiveMapWeb
              imoveis={imoveis}
              onMarkerPress={handleMarkerPress}
              onViewDetails={handleViewDetails}
              selectedImovelId={selectedImovelId || undefined}
            />
          </View>
        )}

        <ScrollView
          style={styles.listPanel}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.listContent}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Imóveis à venda em Goiânia, GO
            </Text>
            {!carregando && (
              <Text style={styles.sectionCount}>
                {total} {total === 1 ? 'resultado' : 'resultados'}
              </Text>
            )}
          </View>

          {carregando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : imoveis.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhum imóvel encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Tente ajustar os filtros ou buscar por outra localidade
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {imoveis.map((imovel) => (
                <View
                  key={imovel.id}
                  style={[
                    styles.gridItem,
                    IS_DESKTOP && { width: cardWidth, maxWidth: cardWidth },
                  ]}
                >
                  <MappoPropertyCard
                    imovel={imovel}
                    onPress={() => handleViewDetails(imovel)}
                    cardWidth={IS_DESKTOP ? cardWidth : undefined}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {Platform.OS === 'web' && !IS_DESKTOP && (
          <View style={styles.mapPanelMobile}>
            <InteractiveMapWeb
              imoveis={imoveis}
              onMarkerPress={handleMarkerPress}
              onViewDetails={handleViewDetails}
              selectedImovelId={selectedImovelId || undefined}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
    flexDirection: IS_DESKTOP ? 'row' : 'column',
  },
  mapPanel: {
    width: '52%',
    position: 'relative' as any,
  },
  mapPanelMobile: {
    height: 300,
  },
  listPanel: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FONTS.family.bodyBold,
    color: COLORS.text,
    marginBottom: 2,
  },
  sectionCount: {
    fontSize: 14,
    fontFamily: FONTS.family.body,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    paddingTop: SPACING.xxxl,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  gridItem: {
    flex: IS_DESKTOP ? undefined : 1,
    minWidth: IS_DESKTOP ? undefined : '100%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.family.bodyBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONTS.family.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
