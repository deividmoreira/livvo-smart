import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { Heart, MapPin, Bed, Bath, Car, Maximize, ChevronLeft, ChevronRight, Camera } from 'lucide-react-native';
import { Imovel } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS, PROPERTY_STATUS } from '../constants';
import { formatarMoeda, formatarEnderecoResumido, formatarArea } from '../utils/formatters';

interface MappoPropertyCardProps {
  imovel: Imovel;
  onPress: () => void;
  cardWidth?: number;
}

export const MappoPropertyCard: React.FC<MappoPropertyCardProps> = ({
  imovel,
  onPress,
  cardWidth,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const imagens = imovel.midias.filter(m => m.tipo === 'imagem');
  const statusConfig = PROPERTY_STATUS[imovel.status];
  const actualWidth = cardWidth || 340;

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < imagens.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  return (
    <View style={[styles.card, { width: actualWidth }]}>
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <FlatList
          ref={flatListRef}
          data={imagens}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / (actualWidth));
            setCurrentIndex(index);
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.url }}
              style={[styles.image, { width: actualWidth }]}
            />
          )}
          keyExtractor={(item) => item.id}
        />

        {/* Navigation Arrows */}
        {imagens.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navArrow, styles.navArrowLeft]}
                onPress={() => scrollToIndex(currentIndex - 1)}
              >
                <ChevronLeft size={18} color={COLORS.text} />
              </TouchableOpacity>
            )}
            {currentIndex < imagens.length - 1 && (
              <TouchableOpacity
                style={[styles.navArrow, styles.navArrowRight]}
                onPress={() => scrollToIndex(currentIndex + 1)}
              >
                <ChevronRight size={18} color={COLORS.text} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Page Indicator */}
        {imagens.length > 1 && (
          <View style={styles.pageIndicator}>
            <Text style={styles.pageText}>
              {currentIndex + 1}/{imagens.length}
            </Text>
          </View>
        )}

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Heart
            size={18}
            color={isFavorite ? '#EF4444' : COLORS.surface}
            fill={isFavorite ? '#EF4444' : 'rgba(0,0,0,0.3)'}
          />
        </TouchableOpacity>

        {/* Tour 360° Badge */}
        {imovel.tour_virtual_url && (
          <View style={styles.tourBadge}>
            <Camera size={12} color={COLORS.surface} />
            <Text style={styles.tourBadgeText}>360°</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.7}>
        {/* Price + Type */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatarMoeda(imovel.valor)}</Text>
          <View style={[styles.typeBadge, { backgroundColor: statusConfig.color + '18' }]}>
            <Text style={[styles.typeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>{imovel.titulo}</Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <MapPin size={13} color={COLORS.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {formatarEnderecoResumido(imovel.localizacao)}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          {imovel.caracteristicas.quartos && (
            <View style={styles.featureItem}>
              <Bed size={14} color={COLORS.textSecondary} />
              <Text style={styles.featureText}>{imovel.caracteristicas.quartos}</Text>
            </View>
          )}
          {imovel.caracteristicas.banheiros && (
            <View style={styles.featureItem}>
              <Bath size={14} color={COLORS.textSecondary} />
              <Text style={styles.featureText}>{imovel.caracteristicas.banheiros}</Text>
            </View>
          )}
          {imovel.caracteristicas.vagas_garagem && (
            <View style={styles.featureItem}>
              <Car size={14} color={COLORS.textSecondary} />
              <Text style={styles.featureText}>{imovel.caracteristicas.vagas_garagem}</Text>
            </View>
          )}
          {imovel.caracteristicas.area_total && (
            <View style={styles.featureItem}>
              <Maximize size={14} color={COLORS.textSecondary} />
              <Text style={styles.featureText}>
                {formatarArea(imovel.caracteristicas.area_total)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    height: 200,
    resizeMode: 'cover',
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  navArrowLeft: {
    left: SPACING.sm,
  },
  navArrowRight: {
    right: SPACING.sm,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: SPACING.sm,
    alignSelf: 'center',
    backgroundColor: 'rgba(42, 42, 42, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  pageText: {
    color: COLORS.surface,
    fontSize: 11,
    fontFamily: FONTS.family.body,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  tourBadgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontFamily: FONTS.family.bodyBold,
  },
  content: {
    padding: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontFamily: FONTS.family.bodyBold,
    color: COLORS.text,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeText: {
    fontSize: 11,
    fontFamily: FONTS.family.bodyBold,
  },
  title: {
    fontSize: 14,
    fontFamily: FONTS.family.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  locationText: {
    fontSize: 13,
    fontFamily: FONTS.family.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 13,
    fontFamily: FONTS.family.body,
    color: COLORS.textSecondary,
  },
});
