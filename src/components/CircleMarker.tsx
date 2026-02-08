import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants';

interface CircleMarkerProps {
  imageUrl?: string;
  count?: number;
  isSelected?: boolean;
  onPress?: () => void;
  size?: number;
}

export const CircleMarker: React.FC<CircleMarkerProps> = ({
  imageUrl,
  count,
  isSelected = false,
  onPress,
  size = 50,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: isSelected ? 3 : 2,
          borderColor: isSelected ? COLORS.primary : COLORS.surface,
        },
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: size - 4,
              height: size - 4,
              borderRadius: (size - 4) / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size - 4,
              height: size - 4,
              borderRadius: (size - 4) / 2,
            },
          ]}
        />
      )}

      {/* Badge de contagem */}
      {count && count > 1 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...SHADOWS.lg,
    backgroundColor: COLORS.surface,
    overflow: 'visible',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: COLORS.backgroundDark,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  countText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '700',
  },
});
