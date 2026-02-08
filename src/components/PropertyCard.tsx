import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Home, MapPin, Bed, Bath, Car, Maximize, Heart, Share2 } from 'lucide-react-native';
import { Imovel } from '../types';
// ... imports
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, PROPERTY_STATUS, FONTS } from '../constants';
import { formatarMoeda, formatarEnderecoResumido, formatarArea } from '../utils/formatters';
// ...

// ... inside render ...



interface PropertyCardProps {
  imovel: Imovel;
  onPress: () => void;
  variant?: 'standard' | 'compact' | 'carousel';
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.lg * 2;
const COMPACT_CARD_WIDTH = width * 0.8;
const CAROUSEL_CARD_WIDTH = width * 0.85;

export const PropertyCard: React.FC<PropertyCardProps> = ({
  imovel,
  onPress,
  variant = 'standard',
}) => {
  const compact = variant === 'compact';
  const carousel = variant === 'carousel';
  const imagemPrincipal = imovel.midias.find(m => m.principal && m.tipo === 'imagem')?.url
    || imovel.midias.find(m => m.tipo === 'imagem')?.url;

  const statusConfig = PROPERTY_STATUS[imovel.status];

  // Helper function to render feature items
  const renderFeature = (icon: React.ReactNode, value: number | string | undefined, label?: string) => {
    if (!value) return null;
    return (
      <View style={styles.featureItem}>
        {icon}
        <Text style={styles.featureText}>
          {value} {label}
        </Text>
      </View>
    );
  };

  if (carousel) {
    return (
      <TouchableOpacity
        style={styles.carouselCard}
        onPress={onPress}
        activeOpacity={0.95}
      >
        <View style={styles.carouselImageContainer}>
          {imagemPrincipal ? (
            <Image source={{ uri: imagemPrincipal }} style={styles.image} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Home size={40} color={COLORS.textLight} />
            </View>
          )}
          <View style={[styles.badge, styles.absoluteBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.badgeText}>{statusConfig.label}</Text>
          </View>
        </View>

        <View style={styles.carouselContent}>
          <View style={styles.carouselHeader}>
            <View>
              <Text style={styles.carouselPrice}>{formatarMoeda(imovel.valor)}</Text>
              <Text style={styles.carouselTitle} numberOfLines={1}>{imovel.titulo}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={12} color={COLORS.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {formatarEnderecoResumido(imovel.localizacao)}
            </Text>
          </View>

          <View style={styles.featuresRow}>
            {renderFeature(<Bed size={14} color={COLORS.textSecondary} />, imovel.caracteristicas.quartos)}
            {renderFeature(<Bath size={14} color={COLORS.textSecondary} />, imovel.caracteristicas.banheiros)}
            {renderFeature(<Car size={14} color={COLORS.textSecondary} />, imovel.caracteristicas.vagas_garagem)}
            {renderFeature(
              <Maximize size={14} color={COLORS.textSecondary} />,
              imovel.caracteristicas.area_total ? formatarArea(imovel.caracteristicas.area_total).replace('m²', '') : undefined,
              'm²'
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.compactImageContainer}>
          {imagemPrincipal ? (
            <Image source={{ uri: imagemPrincipal }} style={styles.compactImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Home size={32} color={COLORS.textLight} />
            </View>
          )}
          <View style={[styles.badge, styles.compactBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.badgeText}>{statusConfig.label}</Text>
          </View>
        </View>

        <View style={styles.compactContent}>
          <Text style={styles.price} numberOfLines={1}>{formatarMoeda(imovel.valor)}</Text>
          <Text style={styles.compactTitle} numberOfLines={1}>{imovel.titulo}</Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color={COLORS.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {formatarEnderecoResumido(imovel.localizacao)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        {imagemPrincipal ? (
          <Image source={{ uri: imagemPrincipal }} style={styles.image} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Home size={48} color={COLORS.textLight} />
          </View>
        )}

        {/* Top Overlay */}
        <View style={styles.topOverlay}>
          <View style={[styles.badge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.badgeText}>{statusConfig.label}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Heart size={20} color={COLORS.surface} fill="rgba(0,0,0,0.2)" />
          </TouchableOpacity>
        </View>

        {/* Bottom Gradient/Overlay for text contrast if needed, 
            but for this clean design we put info below. 
            However, we can put the price on the image for a bold look.
            Let's keep it clean below for now like Airbnb.
        */}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.price}>{formatarMoeda(imovel.valor)}</Text>
            <Text style={styles.title} numberOfLines={1}>{imovel.titulo}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color={COLORS.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {formatarEnderecoResumido(imovel.localizacao)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.featuresRow}>
          {renderFeature(<Bed size={16} color={COLORS.textSecondary} />, imovel.caracteristicas.quartos)}
          {renderFeature(<Bath size={16} color={COLORS.textSecondary} />, imovel.caracteristicas.banheiros)}
          {renderFeature(<Car size={16} color={COLORS.textSecondary} />, imovel.caracteristicas.vagas_garagem)}
          {renderFeature(
            <Maximize size={16} color={COLORS.textSecondary} />,
            imovel.caracteristicas.area_total ? formatarArea(imovel.caracteristicas.area_total as number).replace('m²', '') : undefined,
            'm²'
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl, // Refined radius
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
    // overflow: 'visible', // Shadow visibility
  },
  imageContainer: {
    height: 240, // Taller image for impact
    width: '100%',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.backgroundDark,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
  topOverlay: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.sm, // Sharper badge
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: FONTS.family.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
  },
  price: {
    fontSize: 26,
    fontFamily: FONTS.family.heading,
    color: COLORS.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.body,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.body,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
    opacity: 0.6,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    fontFamily: FONTS.family.bodyBold,
    color: COLORS.text,
  },

  // Carousel Styles
  carouselCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    width: CAROUSEL_CARD_WIDTH,
    marginRight: SPACING.md,
    ...SHADOWS.md,
    overflow: 'visible',
    marginBottom: SPACING.sm,
  },
  carouselImageContainer: {
    height: 180, // Taller carousel
    width: '100%',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  absoluteBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
  },
  carouselContent: {
    padding: SPACING.md,
  },
  carouselHeader: {
    marginBottom: SPACING.xs,
  },
  carouselPrice: {
    fontSize: 22,
    fontFamily: FONTS.family.heading,
    color: COLORS.primary,
  },
  carouselTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.body,
  },

  // Compact Card Styles
  compactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    width: COMPACT_CARD_WIDTH,
    marginRight: SPACING.md,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  compactImageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  compactImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  compactBadge: {
    position: 'absolute',
    left: SPACING.sm,
    top: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  compactContent: {
    padding: SPACING.md,
  },
  compactTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.body,
    marginTop: 2,
    marginBottom: SPACING.xs,
  },
});
