import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Search, Navigation, Share2 } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, GLASS, FONTS } from '../constants';

interface FloatingSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
  onLocationPress?: () => void;
  placeholder?: string;
}

export const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  onLocationPress,
  placeholder = 'Ao meu redor',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Search size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Botão de localização */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={onLocationPress}
        activeOpacity={0.8}
      >
        <Navigation size={22} color={COLORS.surface} fill={COLORS.surface} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    zIndex: 100,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    ...SHADOWS.lg,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.family.body,
    color: COLORS.text,
    paddingVertical: Platform.OS === 'ios' ? SPACING.xs : 0,
  },
  shareButton: {
    padding: SPACING.xs,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
});
