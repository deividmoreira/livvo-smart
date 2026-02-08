import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Header, MappoPropertyCard } from '../components';
import { InteractiveMapWeb } from '../components/InteractiveMap.web';
import { Imovel, TipoImovel } from '../types';
import { COLORS, SPACING, FONTS } from '../constants';
import { MOCK_IMOVEIS } from './mockData';

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
  const [imoveis] = useState<Imovel[]>(MOCK_IMOVEIS);
  const [selectedTipo, setSelectedTipo] = useState<TipoImovel | null>(null);
  const [selectedImovelId, setSelectedImovelId] = useState<string | null>(null);

  // Filtros de preço
  const [precoMin, setPrecoMin] = useState<number | null>(null);
  const [precoMax, setPrecoMax] = useState<number | null>(null);

  // Filtros de quartos/banheiros/vagas
  const [minQuartos, setMinQuartos] = useState<number | null>(null);
  const [minBanheiros, setMinBanheiros] = useState<number | null>(null);
  const [minVagas, setMinVagas] = useState<number | null>(null);

  // Filtrar imóveis
  const filteredImoveis = (() => {
    let result = [...imoveis];

    if (selectedTipo) {
      result = result.filter(i => i.tipo === selectedTipo);
    }

    if (searchText.trim()) {
      const textoLower = searchText.toLowerCase();
      result = result.filter(i =>
        i.titulo.toLowerCase().includes(textoLower) ||
        i.descricao.toLowerCase().includes(textoLower) ||
        i.localizacao.bairro?.toLowerCase().includes(textoLower) ||
        i.localizacao.cidade?.toLowerCase().includes(textoLower)
      );
    }

    if (precoMin != null) {
      result = result.filter(i => i.valor >= precoMin);
    }
    if (precoMax != null) {
      result = result.filter(i => i.valor <= precoMax);
    }

    if (minQuartos) {
      result = result.filter(i => (i.caracteristicas.quartos || 0) >= minQuartos);
    }
    if (minBanheiros) {
      result = result.filter(i => (i.caracteristicas.banheiros || 0) >= minBanheiros);
    }
    if (minVagas) {
      result = result.filter(i => (i.caracteristicas.vagas_garagem || 0) >= minVagas);
    }

    return result;
  })();

  const handleSearch = () => {
    // Filtragem reativa - já funciona via searchText state
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

  // Largura dos cards para grid 2 colunas
  const listPanelWidth = IS_DESKTOP ? SCREEN_WIDTH * 0.48 : SCREEN_WIDTH;
  const cardWidth = IS_DESKTOP
    ? (listPanelWidth - SPACING.xl * 2 - SPACING.md) / 2
    : SCREEN_WIDTH - SPACING.lg * 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header: Nav + Filtros */}
      <Header
        searchText={searchText}
        onSearchChange={setSearchText}
        onSearch={handleSearch}
        selectedTipo={selectedTipo}
        onTipoChange={setSelectedTipo}
        resultCount={filteredImoveis.length}
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

      {/* Main Content: Map (left) + List (right) */}
      <View style={styles.mainContent}>
        {/* Mapa à esquerda */}
        {Platform.OS === 'web' && IS_DESKTOP && (
          <View style={styles.mapPanel}>
            <InteractiveMapWeb
              imoveis={filteredImoveis}
              onMarkerPress={handleMarkerPress}
              onViewDetails={handleViewDetails}
              selectedImovelId={selectedImovelId || undefined}
            />
          </View>
        )}

        {/* Lista à direita */}
        <ScrollView
          style={styles.listPanel}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.listContent}
        >
          {/* Título da seção */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Imóveis à venda em Goiânia, GO
            </Text>
            <Text style={styles.sectionCount}>
              {filteredImoveis.length} resultados
            </Text>
          </View>

          {/* Grid de cards */}
          {filteredImoveis.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhum imóvel encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Tente ajustar os filtros ou buscar por outra localidade
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredImoveis.map((imovel) => (
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

        {/* Mapa abaixo no mobile */}
        {Platform.OS === 'web' && !IS_DESKTOP && (
          <View style={styles.mapPanelMobile}>
            <InteractiveMapWeb
              imoveis={filteredImoveis}
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
  // Mapa (esquerda no desktop)
  mapPanel: {
    width: '52%',
    position: 'relative' as any,
  },
  mapPanelMobile: {
    height: 300,
  },
  // Lista (direita no desktop)
  listPanel: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  // Seção título
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
  // Grid 2 colunas
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
  // Empty
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
