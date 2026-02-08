import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Imovel } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { formatarMoedaAbreviada } from '../utils/formatters';

interface WebMapProps {
  imoveis: Imovel[];
  onMarkerPress: (imovel: Imovel) => void;
}

export const WebMap: React.FC<WebMapProps> = ({ imoveis, onMarkerPress }) => {
  const getMarkerColor = (tipo: string) => {
    switch (tipo) {
      case 'terreno':
        return COLORS.secondary;
      case 'casa':
        return COLORS.primary;
      case 'apartamento':
        return COLORS.primaryDark;
      default:
        return COLORS.primary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <MapPin size={48} color={COLORS.textLight} />
        <Text style={styles.placeholderText}>
          O mapa interativo está disponível no aplicativo móvel
        </Text>
        <Text style={styles.placeholderSubtext}>
          Use o app no Android ou iOS para visualizar os imóveis no mapa
        </Text>
      </View>

      {/* Lista de imóveis como alternativa */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Imóveis encontrados ({imoveis.length})</Text>
        {imoveis.map((imovel) => (
          <TouchableOpacity
            key={imovel.id}
            style={styles.listItem}
            onPress={() => onMarkerPress(imovel)}
          >
            <View style={[styles.marker, { backgroundColor: getMarkerColor(imovel.tipo) }]}>
              <Text style={styles.markerText}>{formatarMoedaAbreviada(imovel.valor)}</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle} numberOfLines={1}>{imovel.titulo}</Text>
              <Text style={styles.itemLocation}>
                {imovel.localizacao.bairro}, {imovel.localizacao.cidade}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  mapPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  marker: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.md,
  },
  markerText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
