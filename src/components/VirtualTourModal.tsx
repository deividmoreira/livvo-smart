import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { X, Maximize2, RotateCcw } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, GLASS } from '../constants';

const { width, height } = Dimensions.get('window');

interface VirtualTourModalProps {
  visible: boolean;
  onClose: () => void;
  tourUrl: string;
  propertyTitle: string;
}

export const VirtualTourModal: React.FC<VirtualTourModalProps> = ({
  visible,
  onClose,
  tourUrl,
  propertyTitle,
}) => {
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setLoading(true);
    setKey(prev => prev + 1);
  };

  const renderWebView = () => {
    if (Platform.OS === 'web') {
      return (
        <iframe
          key={key}
          src={tourUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      );
    }

    const WebView = require('react-native-webview').default;
    return (
      <WebView
        key={key}
        source={{ uri: tourUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        scalesPageToFit
      />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Header Glassmorphism */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.badge}>Tour 360°</Text>
              <Text style={styles.title} numberOfLines={1}>
                {propertyTitle}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRefresh}
              >
                <RotateCcw size={20} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.closeButton]}
                onPress={onClose}
              >
                <X size={22} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tour Content */}
        <View style={styles.content}>
          {renderWebView()}

          {loading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Carregando tour virtual...</Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer com instrução */}
        <View style={styles.footer}>
          <Maximize2 size={16} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>
            Arraste para explorar • Pinça para zoom
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: GLASS.dark.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: GLASS.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: COLORS.error,
  },
  content: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingCard: {
    backgroundColor: GLASS.light.background,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md,
    backgroundColor: GLASS.dark.background,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
