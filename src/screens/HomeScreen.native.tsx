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
import { MOCK_IMOVEIS } from './mockData';

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
  const [imoveis, setImoveis] = useState<Imovel[]>(MOCK_IMOVEIS);
  const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<MapRegion>(DEFAULT_MAP_REGION);

  // Initial Location
  useEffect(() => {
    (async () => {
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
        } catch (error) {
          console.log('Erro ao obter localização:', error);
        }
      }
    })();
  }, []);

  // Filter Logic
  const filtrarImoveisLocalmente = useCallback(() => {
    let resultado = [...MOCK_IMOVEIS];

    if (filtros.tipo) {
      resultado = resultado.filter(i => i.tipo === filtros.tipo);
    }
    if (filtros.valorMaximo) {
      resultado = resultado.filter(i => i.valor <= filtros.valorMaximo!);
    }
    if (filtros.valorMinimo) {
      resultado = resultado.filter(i => i.valor >= filtros.valorMinimo!);
    }
    if (filtros.bairro) {
      resultado = resultado.filter(i =>
        i.localizacao.bairro?.toLowerCase().includes(filtros.bairro!.toLowerCase())
      );
    }
    if (filtros.quartosMinimo && filtros.tipo !== 'terreno') {
      resultado = resultado.filter(i =>
        (i.caracteristicas.quartos || 0) >= filtros.quartosMinimo!
      );
    }
    return resultado;
  }, [filtros]);

  useEffect(() => {
    setImoveis(filtrarImoveisLocalmente());
  }, [filtros, filtrarImoveisLocalmente]);

  // Search Logic
  const handleSearch = async () => {
    if (!searchText.trim()) {
      setImoveis(filtrarImoveisLocalmente());
      return;
    }

    setLoading(true);

    try {
      const textoLower = searchText.toLowerCase();
      let resultado = MOCK_IMOVEIS.filter(i =>
        i.titulo.toLowerCase().includes(textoLower) ||
        i.descricao.toLowerCase().includes(textoLower) ||
        i.localizacao.bairro?.toLowerCase().includes(textoLower) ||
        i.localizacao.cidade?.toLowerCase().includes(textoLower)
      );

      if (textoLower.includes('terreno')) {
        resultado = resultado.filter(i => i.tipo === 'terreno');
      } else if (textoLower.includes('casa')) {
        resultado = resultado.filter(i => i.tipo === 'casa');
      } else if (textoLower.includes('apartamento')) {
        resultado = resultado.filter(i => i.tipo === 'apartamento');
      }

      const valorMatch = searchText.match(/(\d+)\s*(mil|milhão|milhões)/i);
      if (valorMatch) {
        let valor = parseInt(valorMatch[1]);
        if (valorMatch[2].toLowerCase() === 'mil') {
          valor *= 1000;
        } else {
          valor *= 1000000;
        }
        resultado = resultado.filter(i => i.valor <= valor);
      }

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
    } catch (error) {
      console.error('Erro na busca:', error);
      Alert.alert('Erro', 'Não foi possível realizar a busca. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Interactions
  const handleMarkerPress = (imovel: Imovel) => {
    setSelectedImovel(imovel);

    // Find index for carousel scroll
    const index = imoveis.findIndex(i => i.id === imovel.id);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }

    // Animate map
    const newRegion = {
      latitude: imovel.localizacao.latitude,
      longitude: imovel.localizacao.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    mapRef.current?.animateToRegion(newRegion, 1000);
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
      const newRegion = {
        latitude: imoveis[index].localizacao.latitude,
        longitude: imoveis[index].localizacao.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  };

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
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

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {selectedImovel && !loading && (
        // Optional: show quick details or actions, but Carousel already covers it.
        // Keeping it commented or removed to avoid clutter as per new design.
        <View />
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
    // Background handled by SearchBar itself
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
