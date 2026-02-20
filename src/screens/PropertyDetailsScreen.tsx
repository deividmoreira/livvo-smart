import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Linking,
  FlatList,
  Share,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  Bed,
  Bath,
  Car,
  Maximize,
  Home,
  Building,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Play,
  View as ViewIcon,
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { Imovel, Media } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, PROPERTY_STATUS, GLASS, GRADIENTS } from '../constants';
import { VirtualTourModal } from '../components';
import { buscarImovelPorId } from '../services/imoveis';
import { useAuth } from '../context/AuthContext';
import { isFavorito, adicionarFavorito, removerFavorito } from '../services/favoritos';
import {
  formatarMoeda,
  formatarEndereco,
  formatarArea,
  formatarTelefone,
  contatarSobreImovel,
  compartilharImovelWhatsApp,
  getCaracteristicaLabel,
} from '../utils/formatters';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  PropertyDetails: { imovelId: string };
  Login: undefined;
};

type PropertyDetailsRouteProp = RouteProp<RootStackParamList, 'PropertyDetails'>;

export const PropertyDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<PropertyDetailsRouteProp>();
  const { imovelId } = route.params;
  const { usuario } = useAuth();

  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorito, setFavorito] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setCarregando(true);
    buscarImovelPorId(imovelId)
      .then(data => setImovel(data))
      .catch(() => setImovel(null))
      .finally(() => setCarregando(false));
  }, [imovelId]);

  useEffect(() => {
    if (usuario && imovelId) {
      isFavorito(imovelId).then(setFavorito);
    }
  }, [usuario, imovelId]);

  const handleToggleFavorito = useCallback(async () => {
    if (!usuario) {
      Alert.alert(
        'Login necessário',
        'Faça login para salvar imóveis nos favoritos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Entrar', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    try {
      if (favorito) {
        await removerFavorito(imovelId);
        setFavorito(false);
      } else {
        await adicionarFavorito(imovelId);
        setFavorito(true);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar os favoritos.');
    }
  }, [usuario, favorito, imovelId, navigation]);

  if (carregando || !imovel) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{carregando ? 'Carregando...' : 'Imóvel não encontrado.'}</Text>
      </View>
    );
  }

  const imagens = imovel.midias.filter(m => m.tipo === 'imagem').sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  const videos = imovel.midias.filter(m => m.tipo === 'video');
  const statusConfig = PROPERTY_STATUS[imovel.status];
  const anunciante = imovel.anunciante.corretor || imovel.anunciante.imobiliaria;

  const handleShare = async () => {
    try {
      await compartilharImovelWhatsApp(
        imovel.titulo,
        imovel.id,
        imovel.valor,
        formatarEndereco(imovel.localizacao)
      );
    } catch (error) {
      // Fallback para share nativo
      try {
        await Share.share({
          message: `🏠 ${imovel.titulo}\n\n💰 ${formatarMoeda(imovel.valor)}\n📍 ${formatarEndereco(imovel.localizacao)}\n\nVeja mais detalhes no app Livvo Smart!`,
          title: imovel.titulo,
        });
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível compartilhar.');
      }
    }
  };

  const handleContact = async () => {
    if (!anunciante?.whatsapp) {
      Alert.alert('Erro', 'WhatsApp não disponível.');
      return;
    }

    try {
      await contatarSobreImovel(anunciante.whatsapp, imovel.titulo, imovel.id);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
    }
  };

  const handleCall = () => {
    const telefone = anunciante?.telefone || anunciante?.whatsapp;
    if (telefone) {
      Linking.openURL(`tel:${telefone.replace(/\D/g, '')}`);
    }
  };

  const handleEmail = () => {
    if (anunciante?.email) {
      Linking.openURL(`mailto:${anunciante.email}?subject=Interesse no imóvel: ${imovel.titulo}`);
    }
  };

  const scrollToImage = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentImageIndex(index);
  };

  const getPropertyIcon = () => {
    switch (imovel.tipo) {
      case 'casa':
        return <Home size={18} color={COLORS.primary} />;
      case 'apartamento':
        return <Building size={18} color={COLORS.primary} />;
      case 'terreno':
        return <Landmark size={18} color={COLORS.primary} />;
      default:
        return null;
    }
  };

  const caracteristicasExtras = Object.entries(imovel.caracteristicas)
    .filter(([key, value]) => value === true && !['area_total', 'area_construida', 'quartos', 'suites', 'banheiros', 'vagas_garagem'].includes(key))
    .map(([key]) => key);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Galeria de Imagens */}
        <View style={styles.imageContainer}>
          <FlatList
            ref={flatListRef}
            data={imagens}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item.url }} style={styles.mainImage} />
            )}
            keyExtractor={(item) => item.id}
          />

          {/* Indicadores de imagem */}
          <View style={styles.imageIndicators}>
            {imagens.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.indicator, currentImageIndex === index && styles.indicatorActive]}
                onPress={() => scrollToImage(index)}
              />
            ))}
          </View>

          {/* Contador de imagens */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}/{imagens.length}
            </Text>
          </View>

          {/* Botão voltar */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>

          {/* Botões de ação */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleFavorito}
            >
              <Heart
                size={22}
                color={favorito ? COLORS.error : COLORS.text}
                fill={favorito ? COLORS.error : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share2 size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.typeTag}>
                {getPropertyIcon()}
                <Text style={styles.typeText}>{imovel.tipo}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
                <Text style={styles.statusText}>{statusConfig.label}</Text>
              </View>
            </View>

            <Text style={styles.title}>{imovel.titulo}</Text>
            <Text style={styles.price}>{formatarMoeda(imovel.valor)}</Text>

            <View style={styles.locationRow}>
              <MapPin size={16} color={COLORS.textSecondary} />
              <Text style={styles.location}>{formatarEndereco(imovel.localizacao)}</Text>
            </View>
          </View>

          {/* Características Principais */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.featuresGrid}>
              {imovel.caracteristicas.area_total && (
                <View style={styles.featureCard}>
                  <Maximize size={24} color={COLORS.primary} />
                  <Text style={styles.featureValue}>{formatarArea(imovel.caracteristicas.area_total)}</Text>
                  <Text style={styles.featureLabel}>Área Total</Text>
                </View>
              )}
              {imovel.caracteristicas.area_construida && (
                <View style={styles.featureCard}>
                  <Home size={24} color={COLORS.primary} />
                  <Text style={styles.featureValue}>{formatarArea(imovel.caracteristicas.area_construida)}</Text>
                  <Text style={styles.featureLabel}>Área Construída</Text>
                </View>
              )}
              {imovel.caracteristicas.quartos && (
                <View style={styles.featureCard}>
                  <Bed size={24} color={COLORS.primary} />
                  <Text style={styles.featureValue}>{imovel.caracteristicas.quartos}</Text>
                  <Text style={styles.featureLabel}>Quartos</Text>
                </View>
              )}
              {imovel.caracteristicas.banheiros && (
                <View style={styles.featureCard}>
                  <Bath size={24} color={COLORS.primary} />
                  <Text style={styles.featureValue}>{imovel.caracteristicas.banheiros}</Text>
                  <Text style={styles.featureLabel}>Banheiros</Text>
                </View>
              )}
              {imovel.caracteristicas.vagas_garagem && (
                <View style={styles.featureCard}>
                  <Car size={24} color={COLORS.primary} />
                  <Text style={styles.featureValue}>{imovel.caracteristicas.vagas_garagem}</Text>
                  <Text style={styles.featureLabel}>Vagas</Text>
                </View>
              )}
            </View>

            {/* Características extras */}
            {caracteristicasExtras.length > 0 && (
              <View style={styles.extraFeatures}>
                {caracteristicasExtras.map((key) => (
                  <View key={key} style={styles.extraFeatureTag}>
                    <Check size={14} color={COLORS.secondary} />
                    <Text style={styles.extraFeatureText}>{getCaracteristicaLabel(key)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{imovel.descricao}</Text>
          </View>

          {/* Tour Virtual 360° */}
          {imovel.tour_virtual_url && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tour Virtual 360°</Text>
              <TouchableOpacity
                style={styles.tourCard}
                onPress={() => setShowTourModal(true)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: imagens[0]?.url }}
                  style={styles.tourPreviewImage}
                />
                <View style={styles.tourOverlay}>
                  <View style={styles.tourPlayButton}>
                    <Play size={32} color={COLORS.surface} fill={COLORS.surface} />
                  </View>
                  <View style={styles.tourBadge}>
                    <ViewIcon size={16} color={COLORS.surface} />
                    <Text style={styles.tourBadgeText}>Explorar em 360°</Text>
                  </View>
                </View>
                <View style={styles.tourInfo}>
                  <Text style={styles.tourInfoText}>
                    Faça um tour interativo pelo imóvel
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Anunciante */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {imovel.anunciante.tipo === 'corretor' ? 'Corretor' : 'Imobiliária'}
            </Text>
            <View style={styles.advertiserCard}>
              <View style={styles.advertiserInfo}>
                {(imovel.anunciante.corretor?.foto_url || imovel.anunciante.imobiliaria?.logo_url) ? (
                  <Image
                    source={{ uri: imovel.anunciante.corretor?.foto_url || imovel.anunciante.imobiliaria?.logo_url }}
                    style={styles.advertiserImage}
                  />
                ) : (
                  <View style={styles.advertiserImagePlaceholder}>
                    <Text style={styles.advertiserInitial}>
                      {anunciante?.nome?.charAt(0) || '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.advertiserDetails}>
                  <Text style={styles.advertiserName}>{anunciante?.nome}</Text>
                  <Text style={styles.advertiserCreci}>CRECI: {anunciante?.creci}</Text>
                </View>
              </View>

              <View style={styles.contactButtons}>
                {anunciante?.telefone && (
                  <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                    <Phone size={18} color={COLORS.primary} />
                    <Text style={styles.contactButtonText}>Ligar</Text>
                  </TouchableOpacity>
                )}
                {anunciante?.email && (
                  <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                    <Mail size={18} color={COLORS.primary} />
                    <Text style={styles.contactButtonText}>E-mail</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Aviso de Status (se não disponível) */}
          {imovel.status !== 'disponivel' && (
            <View style={[styles.statusAlert, { backgroundColor: statusConfig.color + '20' }]}>
              <AlertCircle size={20} color={statusConfig.color} />
              <Text style={[styles.statusAlertText, { color: statusConfig.color }]}>
                Este imóvel está {statusConfig.label.toLowerCase()}
              </Text>
            </View>
          )}

          {/* Espaço para o botão fixo */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Botão de WhatsApp fixo */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.whatsappButton} onPress={handleContact}>
          <MessageCircle size={22} color={COLORS.surface} />
          <Text style={styles.whatsappButtonText}>Contato via WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Tour Virtual 360° */}
      {imovel.tour_virtual_url && (
        <VirtualTourModal
          visible={showTourModal}
          onClose={() => setShowTourModal(false)}
          tourUrl={imovel.tour_virtual_url}
          propertyTitle={imovel.titulo}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: height * 0.4,
    backgroundColor: COLORS.backgroundDark,
  },
  mainImage: {
    width: width,
    height: height * 0.4,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: SPACING.lg,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: COLORS.surface,
    width: 24,
  },
  imageCounter: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  imageCounterText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + SPACING.sm,
    left: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.sm,
    ...SHADOWS.md,
  },
  actionButtons: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + SPACING.sm,
    right: SPACING.lg,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.sm,
    ...SHADOWS.md,
  },
  content: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    marginTop: -SPACING.xl,
    paddingTop: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  typeText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  location: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  featureCard: {
    width: (width - SPACING.lg * 2 - SPACING.md * 2) / 3,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  featureValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  featureLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  extraFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  extraFeatureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  extraFeatureText: {
    fontSize: 12,
    color: COLORS.secondaryDark,
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
  },
  advertiserCard: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  advertiserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  advertiserImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
  },
  advertiserImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  advertiserInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.surface,
  },
  advertiserDetails: {
    flex: 1,
  },
  advertiserName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  advertiserCreci: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  statusAlertText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.whatsapp,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  whatsappButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
  // Tour Virtual Styles
  tourCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundDark,
    ...SHADOWS.md,
  },
  tourPreviewImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  tourOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourPlayButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  tourBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  tourBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.surface,
  },
  tourInfo: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '10',
  },
  tourInfoText: {
    fontSize: 13,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
