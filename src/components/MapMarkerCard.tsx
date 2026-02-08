import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { X, MapPin, ArrowRight } from 'lucide-react-native';
import { Imovel } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, PROPERTY_STATUS, FONTS } from '../constants';
import { formatarMoeda, formatarEnderecoResumido } from '../utils/formatters';

interface MapMarkerCardProps {
  imovel: Imovel;
  onClose: () => void;
  onViewDetails: () => void;
}

const { width } = Dimensions.get('window');

export const MapMarkerCard: React.FC<MapMarkerCardProps> = ({
  imovel,
  onClose,
  onViewDetails,
}) => {
  const imagemPrincipal = imovel.midias.find(m => m.principal && m.tipo === 'imagem')?.url
    || imovel.midias.find(m => m.tipo === 'imagem')?.url;

  const statusConfig = PROPERTY_STATUS[imovel.status];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={onViewDetails}
        activeOpacity={0.9}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {imagemPrincipal ? (
            <Image source={{ uri: imagemPrincipal }} style={styles.image} />
          ) : (
            <View style={[styles.image, { backgroundColor: COLORS.backgroundDark }]} />
          )}
          <View style={[styles.badge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.badgeText}>{statusConfig.label}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.price}>{formatarMoeda(imovel.valor)}</Text>
          <Text style={styles.title} numberOfLines={1}>{imovel.titulo}</Text>

          <View style={styles.locationRow}>
            <MapPin size={12} color={COLORS.textSecondary} />
            <Text style={styles.location} numberOfLines={1}>
              {formatarEnderecoResumido(imovel.localizacao)}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.moreInfo}>Toque para ver mais</Text>
            <ArrowRight size={16} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30, // Lifted for tab bar space
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 100,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: 'row',
    height: 130,
    ...SHADOWS.lg,
    padding: SPACING.sm,
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.surface,
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...SHADOWS.sm,
  },
  imageContainer: {
    width: 110,
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontFamily: FONTS.family.bodyBold,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    paddingLeft: SPACING.md,
    paddingVertical: SPACING.xs,
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontFamily: FONTS.family.heading,
    color: COLORS.primary,
  },
  title: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.body,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.body,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 'auto',
  },
  moreInfo: {
    fontSize: 11,
    color: COLORS.accent, // Use accent for action
    fontFamily: FONTS.family.bodyBold,
  },
});
