import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Text,
  FlatList,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SearchBar, MapMarkerCard, PropertyCard } from '../components';
import { Imovel, FiltrosBusca, MapRegion } from '../types';
import { COLORS, DEFAULT_MAP_REGION, BORDER_RADIUS, SHADOWS, SPACING } from '../constants';
import { formatarMoedaAbreviada } from '../utils/formatters';
import { buscarImoveis, buscarImoveisPorTexto, buscarImoveisPorRegiao } from '../services/imoveis';

type RootStackParamList = {
  Home: undefined;
  PropertyDetails: { imovelId: string };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const mapRef = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);

  const [searchText, setSearchText] = useState('');
  const [filtros, setFiltros] = useState<FiltrosBusca>({});
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<MapRegion>(DEFAULT_MAP_REGION);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const regionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carga inicial
  useEffect(() => {
    carregarImoveis();
    solicitarLocalizacao();
  }, []);

  const carregarImoveis = async () => {
    setLoading(true);
    try {
      const res = await buscarImoveis({});
      setImoveis(res.imoveis);
    } catch (err) {
      console.error('Erro ao carregar imóveis:', err);
    } finally {
      setLoading(false);
    }
  };

  const solicitarLocalizacao = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      } catch {
        // Usa região padrão se localização falhar
      }
    }
  };

  // Re-busca quando filtros mudam (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await buscarImoveis(filtros);
        setImoveis(res.imoveis);
      } catch (err) {
        console.error('Erro ao filtrar imóveis:', err);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filtros]);

  const handleSearch = useCallback(async () => {
    if (!searchText.trim()) {
      setLoading(true);
      try {
        const res = await buscarImoveis(filtros);
        setImoveis(res.imoveis);
      } catch (err) {
        console.error('Erro na busca:', err);
        Alert.alert('Erro', 'Não foi possível realizar a busca.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const resultado = await buscarImoveisPorTexto(searchText.trim(), filtros);
      setImoveis(resultado);

      if (resultado.length > 0) {
        const primeiro = resultado[0];
        const newRegion = {
          latitude: primeiro.localizacao.latitude,
          longitude: primeiro.localizacao.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        mapRef.current?.animateToRegion(newRegion, 1000);
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      Alert.alert('Erro', 'Não foi possível realizar a busca. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [searchText, filtros]);

  // Busca por região do mapa (debounced para evitar muitas requisições)
  const handleRegionChange = useCallback((newRegion: Region) => {
    setRegion(newRegion);

    if (regionDebounceRef.current) clearTimeout(regionDebounceRef.current);
    regionDebounceRef.current = setTimeout(async () => {
      try {
        const resultado = await buscarImoveisPorRegiao(newRegion, filtros);
        setImoveis(resultado);
      } catch (err) {
        console.error('Erro ao buscar por região:', err);
      }
    }, 1000);
  }, [filtros]);

  const handleMarkerPress = (imovel: Imovel) => {
    setSelectedImovel(imovel);

    const index = imoveis.findIndex(i => i.id === imovel.id);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }

    mapRef.current?.animateToRegion({
      latitude: imovel.localizacao.latitude,
      longitude: imovel.localizacao.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);
  };

  const handleViewDetails = () => {
    if (selectedImovel) {
      navigation.navigate('PropertyDetails', { imovelId: selectedImovel.id });
    }
  };

  const onCarouselScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (width * 0.85 + SPACING.md));
    if (imoveis[index] && imoveis[index].id !== selectedImovel?.id) {
      setSelectedImovel(imoveis[index]);
      mapRef.current?.animateToRegion({
        latitude: imoveis[index].localizacao.latitude,
        longitude: imoveis[index].localizacao.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  const getMarkerColor = (tipo: string) => {
    switch (tipo) {
      case 'terreno': return COLORS.secondary;
      case 'casa': return COLORS.primary;
      case 'apartamento': return COLORS.primaryDark;
      default: return COLORS.primary;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}
        onPress={() => setSelectedImovel(null)}
        showsUserLocation
        showsMyLocationButton
      >
        {imoveis.map((imovel) => {
          const isSelected = selectedImovel?.id === imovel.id;
          return (
            <Marker
              key={imovel.id}
              coordinate={{
                latitude: imovel.localizacao.latitude,
                longitude: imovel.localizacao.longitude,
              }}
              onPress={() => handleMarkerPress(imovel)}
              zIndex={isSelected ? 10 : 1}
            >
              <View style={[
                styles.markerContainer,
                { backgroundColor: getMarkerColor(imovel.tipo) },
                isSelected && styles.markerSelected
              ]}>
                <Text style={styles.markerText}>
                  {formatarMoedaAbreviada(imovel.valor)}
                </Text>
              </View>
              <View style={[styles.markerArrow, { borderTopColor: getMarkerColor(imovel.tipo) }]} />
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.searchOverlay}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          onSearch={handleSearch}
          filtros={filtros}
          onFiltrosChange={setFiltros}
          placeholder="Ex: terreno no Jardim América até 100 mil"
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {selectedImovel ? (
        <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, paddingHorizontal: 10 }}>
          <MapMarkerCard
            imovel={selectedImovel}
            onClose={() => setSelectedImovel(null)}
            onViewDetails={handleViewDetails}
          />
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={imoveis}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width * 0.85 + SPACING.md}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContentContainer}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PropertyCard
                imovel={item}
                variant="carousel"
                onPress={() => handleMarkerPress(item)}
              />
            )}
            onMomentumScrollEnd={onCarouselScroll}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: SPACING.md,
    zIndex: 10,
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  carouselContentContainer: {
    paddingHorizontal: SPACING.lg,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
    backgroundColor: COLORS.surface,
    borderRadius: 50,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  markerContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 50,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    ...SHADOWS.sm,
  },
  markerSelected: {
    transform: [{ scale: 1.2 }],
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  markerText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
  },
});
