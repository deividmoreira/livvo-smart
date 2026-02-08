import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Home, User, PlusCircle, MapPin, Search } from 'lucide-react-native';
import { COLORS, SPACING, SHADOWS, FONTS } from '../constants';

type TabName = 'inicio' | 'eu' | 'adicionar' | 'explorar' | 'descobrir';

interface BottomTabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

const TABS: { name: TabName; label: string; icon: any }[] = [
  { name: 'inicio', label: 'Início', icon: Home },
  { name: 'eu', label: 'Eu', icon: User },
  { name: 'adicionar', label: 'Adicionar', icon: PlusCircle },
  { name: 'explorar', label: 'Explorar', icon: MapPin },
  { name: 'descobrir', label: 'Descobrir', icon: Search },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.name;
        const isCenter = tab.name === 'adicionar';

        if (isCenter) {
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.centerButton}
              onPress={() => onTabPress(tab.name)}
              activeOpacity={0.8}
            >
              <View style={styles.centerButtonInner}>
                <Icon size={28} color={COLORS.surface} />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => onTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <Icon
              size={24}
              color={isActive ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    ...SHADOWS.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.sm,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.body,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontFamily: FONTS.family.bodyBold,
  },
  centerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent, // Gold/Bronze
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    ...SHADOWS.lg,
  },
});
