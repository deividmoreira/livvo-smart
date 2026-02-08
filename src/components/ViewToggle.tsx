import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { List, Map } from 'lucide-react-native';
import { ViewMode } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, GLASS, SHADOWS } from '../constants';

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ mode, onModeChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.toggle}>
        {/* Indicador animado */}
        <View
          style={[
            styles.indicator,
            mode === 'mapa' && styles.indicatorRight,
          ]}
        />

        {/* Botão Lista */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => onModeChange('lista')}
          activeOpacity={0.7}
        >
          <List
            size={18}
            color={mode === 'lista' ? COLORS.surface : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.buttonText,
              mode === 'lista' && styles.buttonTextActive,
            ]}
          >
            Lista
          </Text>
        </TouchableOpacity>

        {/* Botão Mapa */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => onModeChange('mapa')}
          activeOpacity={0.7}
        >
          <Map
            size={18}
            color={mode === 'mapa' ? COLORS.surface : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.buttonText,
              mode === 'mapa' && styles.buttonTextActive,
            ]}
          >
            Mapa
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: GLASS.light.background,
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
    position: 'relative',
    ...SHADOWS.md,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '50%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    // Transição será feita pelo left
  },
  indicatorRight: {
    left: '50%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
    zIndex: 1,
    minWidth: 80,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  buttonTextActive: {
    color: COLORS.surface,
  },
});
