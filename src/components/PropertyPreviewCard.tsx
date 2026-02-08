import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Camera,
  Home,
  Building,
  Landmark,
} from 'lucide-react-native';
import { Imovel } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, GLASS, SHADOWS, PROPERTY_STATUS } from '../constants';
import { formatarMoeda, formatarEnderecoResumido } from '../utils/formatters';

interface PropertyPreviewCardProps {
  imovel: Imovel;
  onClose: () => void;
  onViewDetails: () => void;
  onViewTour?: () => void;
}

export const PropertyPreviewCard: React.FC<PropertyPreviewCardProps> = ({
  imovel,
  onClose,
  onViewDetails,
  onViewTour,
}) => {
  const imagemPrincipal = imovel.midias.find(m => m.principal && m.tipo === 'imagem')?.url
    || imovel.midias.find(m => m.tipo === 'imagem')?.url;

  const statusConfig = PROPERTY_STATUS[imovel.status];
  const hasTour = !!imovel.tour_virtual_url;

  const getPropertyIcon = () => {
    const iconProps = { size: 14, color: COLORS.primary };
    switch (imovel.tipo) {
      case 'casa':
        return <Home {...iconProps} />;
      case 'apartamento':
        return <Building {...iconProps} />;
      default:
        return <Landmark {...iconProps} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Botão fechar */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={18} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.card}>
        {/* Imagem */}
        <View style={styles.imageContainer}>
          {imagemPrincipal ? (
            <Image source={{ uri: imagemPrincipal }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Home size={32} color={COLORS.textLight} />
            </View>
          )}

          {/* Badge 360° */}
          {hasTour && (
            <View style={styles.tourBadge}>
              <Camera size={12} color={COLORS.surface} />
              <Text style={styles.tourBadgeText}>360°</Text>
            </View>
          )}

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          {/* Tipo e Preço */}
          <View style={styles.header}>
            <View style={styles.typeTag}>
              {getPropertyIcon()}
              <Text style={styles.typeText}>{imovel.tipo}</Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={1}>{imovel.titulo}</Text>
          <Text style={styles.price}>{formatarMoeda(imovel.valor)}</Text>

          {/* Localização */}
          <View style={styles.locationRow}>
            <MapPin size={12} color={COLORS.textSecondary} />
            <Text style={styles.location} numberOfLines={1}>
              {formatarEnderecoResumido(imovel.localizacao)}
            </Text>
          </View>

          {/* Características */}
          {imovel.tipo !== 'terreno' && (
            <View style={styles.features}>
              {imovel.caracteristicas.quartos && (
                <View style={styles.featureItem}>
                  <Bed size={12} color={COLORS.textSecondary} />
                  <Text style={styles.featureText}>{imovel.caracteristicas.quartos}</Text>
                </View>
              )}
              {imovel.caracteristicas.banheiros && (
                <View style={styles.featureItem}>
                  <Bath size={12} color={COLORS.textSecondary} />
                  <Text style={styles.featureText}>{imovel.caracteristicas.banheiros}</Text>
                </View>
              )}
              {imovel.caracteristicas.vagas_garagem && (
                <View style={styles.featureItem}>
                  <Car size={12} color={COLORS.textSecondary} />
                  <Text style={styles.featureText}>{imovel.caracteristicas.vagas_garagem}</Text>
                </View>
              )}
              {imovel.caracteristicas.area_total && (
                <View style={styles.featureItem}>
                  <Maximize size={12} color={COLORS.textSecondary} />
                  <Text style={styles.featureText}>{imovel.caracteristicas.area_total}m²</Text>
                </View>
              )}
            </View>
          )}

          {imovel.tipo === 'terreno' && imovel.caracteristicas.area_total && (
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Maximize size={12} color={COLORS.textSecondary} />
                <Text style={styles.featureText}>{imovel.caracteristicas.area_total}m²</Text>
              </View>
            </View>
          )}

          {/* Botões */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onViewDetails}
            >
              <Text style={styles.primaryButtonText}>Ver Detalhes</Text>
            </TouchableOpacity>

            {hasTour && onViewTour && (
              <TouchableOpacity
                style={styles.tourButton}
                onPress={onViewTour}
              >
                <Camera size={16} color={COLORS.primary} />
                <Text style={styles.tourButtonText}>Tour 360°</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  closeButton: {
    position: 'absolute',
    top: -12,
    right: -8,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.xs,
    zIndex: 1,
    ...SHADOWS.md,
  },
  card: {
    backgroundColor: GLASS.light.background,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: GLASS.light.border,
    ...SHADOWS.lg,
    ...(Platform.OS === 'web' ? {
      backdropFilter: `blur(${GLASS.blur}px)`,
    } : {}),
  },
  imageContainer: {
    width: 130,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    minHeight: 160,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    minHeight: 160,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    gap: 3,
  },
  tourBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.surface,
  },
  statusBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featureText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.surface,
  },
  tourButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  tourButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
