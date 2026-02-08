import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import { Home, Building, Landmark, MapPin, ChevronUp } from 'lucide-react-native';
import { Imovel, TipoImovel } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, GLASS } from '../constants';
import { formatarMoeda } from '../utils/formatters';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_TAB_HEIGHT = 80;
const COLLAPSED_HEIGHT = 180;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.6;

interface BottomSheetProps {
  imoveis: Imovel[];
  selectedTipo: TipoImovel | null;
  onTipoChange: (tipo: TipoImovel | null) => void;
  onImovelPress: (imovel: Imovel) => void;
}

const CATEGORIAS: { tipo: TipoImovel | null; label: string; icon: any }[] = [
  { tipo: null, label: 'Todos', icon: MapPin },
  { tipo: 'casa', label: 'Casas', icon: Home },
  { tipo: 'apartamento', label: 'Apartamentos', icon: Building },
  { tipo: 'terreno', label: 'Terrenos', icon: Landmark },
];

export const BottomSheet: React.FC<BottomSheetProps> = ({
  imoveis,
  selectedTipo,
  onTipoChange,
  onImovelPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const translateY = React.useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    Animated.spring(translateY, {
      toValue: isExpanded ? 0 : -(EXPANDED_HEIGHT - COLLAPSED_HEIGHT),
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const filteredImoveis = selectedTipo
    ? imoveis.filter(i => i.tipo === selectedTipo)
    : imoveis;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          height: EXPANDED_HEIGHT,
        },
      ]}
    >
      {/* Handle */}
      <TouchableOpacity style={styles.handleContainer} onPress={toggleExpand}>
        <View style={styles.handle} />
        <ChevronUp
          size={20}
          color={COLORS.textSecondary}
          style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {/* Categorias */}
      <View style={styles.categorias}>
        {CATEGORIAS.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedTipo === cat.tipo;
          return (
            <TouchableOpacity
              key={cat.label}
              style={[styles.categoriaButton, isActive && styles.categoriaButtonActive]}
              onPress={() => onTipoChange(cat.tipo)}
            >
              <Icon
                size={18}
                color={isActive ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[styles.categoriaText, isActive && styles.categoriaTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lista de imóveis */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {filteredImoveis.length} imóveis encontrados
        </Text>
      </View>

      <ScrollView
        style={styles.listContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredImoveis.map((imovel) => {
          const imageUrl = imovel.midias.find(m => m.principal)?.url || imovel.midias[0]?.url;
          return (
            <TouchableOpacity
              key={imovel.id}
              style={styles.card}
              onPress={() => onImovelPress(imovel)}
              activeOpacity={0.9}
            >
              {imageUrl && (
                <Image source={{ uri: imageUrl }} style={styles.cardImage} />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {imovel.titulo}
                </Text>
                <Text style={styles.cardPrice}>{formatarMoeda(imovel.valor)}</Text>
                <Text style={styles.cardLocation} numberOfLines={1}>
                  {imovel.localizacao.bairro}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: BOTTOM_TAB_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
    } : {}),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  categorias: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoriaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundDark,
    gap: SPACING.xs,
  },
  categoriaButtonActive: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoriaText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  categoriaTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  listHeader: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  card: {
    width: 200,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: SPACING.sm,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
