import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { MapPin, ChevronDown, ChevronUp, X } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../constants';
import { TipoImovel } from '../types';

interface HeaderProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  onSearch: () => void;
  selectedTipo: TipoImovel | null;
  onTipoChange: (tipo: TipoImovel | null) => void;
  resultCount: number;
  // Filtro de preço
  precoMin: number | null;
  precoMax: number | null;
  onPrecoChange: (min: number | null, max: number | null) => void;
  // Filtro de quartos/banheiros/vagas
  minQuartos: number | null;
  minBanheiros: number | null;
  minVagas: number | null;
  onQuartosChange: (val: number | null) => void;
  onBanheirosChange: (val: number | null) => void;
  onVagasChange: (val: number | null) => void;
}

const NAV_ITEMS = ['Início', 'Comprar', 'Alugar', 'Vender', 'Serviços'];

const TIPO_FILTERS: { value: TipoImovel | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 'casa', label: 'Casas' },
  { value: 'apartamento', label: 'Apartamentos' },
  { value: 'terreno', label: 'Terrenos' },
];

const PRECO_RANGES: { label: string; min: number | null; max: number | null }[] = [
  { label: 'Qualquer preço', min: null, max: null },
  { label: 'Até R$ 100 mil', min: null, max: 100000 },
  { label: 'R$ 100 mil - R$ 300 mil', min: 100000, max: 300000 },
  { label: 'R$ 300 mil - R$ 500 mil', min: 300000, max: 500000 },
  { label: 'R$ 500 mil - R$ 1 milhão', min: 500000, max: 1000000 },
  { label: 'Acima de R$ 1 milhão', min: 1000000, max: null },
];

const QUARTOS_OPTIONS = [1, 2, 3, 4];
const VAGAS_OPTIONS = [1, 2, 3];

export const Header: React.FC<HeaderProps> = ({
  searchText,
  onSearchChange,
  onSearch,
  selectedTipo,
  onTipoChange,
  resultCount,
  precoMin,
  precoMax,
  onPrecoChange,
  minQuartos,
  minBanheiros,
  minVagas,
  onQuartosChange,
  onBanheirosChange,
  onVagasChange,
}) => {
  const [showPrecoDropdown, setShowPrecoDropdown] = useState(false);
  const [showQuartosDropdown, setShowQuartosDropdown] = useState(false);

  const hasPrecoFilter = precoMin != null || precoMax != null;
  const hasQuartosFilter = minQuartos != null || minBanheiros != null || minVagas != null;

  // Label do chip de preço
  const getPrecoLabel = () => {
    if (!hasPrecoFilter) return 'Preço';
    const range = PRECO_RANGES.find(r => r.min === precoMin && r.max === precoMax);
    if (range && range.min !== null) return range.label;
    if (precoMax && !precoMin) return `Até R$ ${(precoMax / 1000).toFixed(0)}K`;
    if (precoMin && !precoMax) return `A partir de R$ ${precoMin >= 1000000 ? (precoMin / 1000000).toFixed(0) + 'M' : (precoMin / 1000).toFixed(0) + 'K'}`;
    return 'Preço';
  };

  // Label do chip de quartos
  const getQuartosLabel = () => {
    if (!hasQuartosFilter) return 'Quartos, Banheiros e Vagas';
    const parts: string[] = [];
    if (minQuartos) parts.push(`${minQuartos}+ qts`);
    if (minBanheiros) parts.push(`${minBanheiros}+ ban`);
    if (minVagas) parts.push(`${minVagas}+ vg`);
    return parts.join(', ');
  };

  const handleNavPress = (item: string, index: number) => {
    if (index === 0 || index === 1) return; // Início e Comprar = tela atual
    if (Platform.OS === 'web') {
      window.alert(`${item}: Em breve! Esta funcionalidade está em desenvolvimento.`);
    } else {
      Alert.alert('Em breve', `${item}: Esta funcionalidade está em desenvolvimento.`);
    }
  };

  const closeAllDropdowns = () => {
    setShowPrecoDropdown(false);
    setShowQuartosDropdown(false);
  };

  return (
    <View style={styles.container}>
      {/* Row 1: Logo + Navigation */}
      <View style={styles.navRow}>
        <View style={styles.logoContainer}>
          <MapPin size={20} color="#FB4748" />
          <Text style={styles.logo}>livvo</Text>
        </View>

        <View style={styles.navItems}>
          {NAV_ITEMS.map((item, i) => (
            <TouchableOpacity key={item} style={styles.navItem} onPress={() => handleNavPress(item, i)}>
              <Text style={[styles.navText, i === 1 && styles.navTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Row 2: Search + Filters */}
      <View style={styles.filterRow}>
        {/* Localização */}
        <View style={styles.filterInput}>
          <MapPin size={16} color={COLORS.textSecondary} />
          <TextInput
            style={styles.filterInputText}
            value={searchText}
            onChangeText={onSearchChange}
            placeholder="Goiânia - GO"
            placeholderTextColor={COLORS.textSecondary}
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
        </View>

        {/* Botão Comprar */}
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Comprar</Text>
        </TouchableOpacity>

        {/* Tipo Toggles */}
        {TIPO_FILTERS.map((filter) => {
          const isActive = selectedTipo === filter.value;
          return (
            <TouchableOpacity
              key={filter.label}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => { closeAllDropdowns(); onTipoChange(filter.value); }}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Filtro Preço */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={[styles.filterChip, hasPrecoFilter && styles.filterChipActive]}
            onPress={() => { setShowPrecoDropdown(!showPrecoDropdown); setShowQuartosDropdown(false); }}
          >
            <Text style={[styles.filterChipText, hasPrecoFilter && styles.filterChipTextActive]} numberOfLines={1}>
              {getPrecoLabel()}
            </Text>
            {showPrecoDropdown
              ? <ChevronUp size={14} color={hasPrecoFilter ? '#FFF' : COLORS.textSecondary} />
              : <ChevronDown size={14} color={hasPrecoFilter ? '#FFF' : COLORS.textSecondary} />
            }
          </TouchableOpacity>

          {showPrecoDropdown && (
            <View style={styles.dropdown}>
              <Text style={styles.dropdownTitle}>Faixa de Preço</Text>
              {PRECO_RANGES.map((range) => {
                const isSelected = range.min === precoMin && range.max === precoMax;
                return (
                  <TouchableOpacity
                    key={range.label}
                    style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                    onPress={() => {
                      onPrecoChange(range.min, range.max);
                      setShowPrecoDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Filtro Quartos/Banheiros/Vagas */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={[styles.filterChip, hasQuartosFilter && styles.filterChipActive]}
            onPress={() => { setShowQuartosDropdown(!showQuartosDropdown); setShowPrecoDropdown(false); }}
          >
            <Text style={[styles.filterChipText, hasQuartosFilter && styles.filterChipTextActive]} numberOfLines={1}>
              {getQuartosLabel()}
            </Text>
            {showQuartosDropdown
              ? <ChevronUp size={14} color={hasQuartosFilter ? '#FFF' : COLORS.textSecondary} />
              : <ChevronDown size={14} color={hasQuartosFilter ? '#FFF' : COLORS.textSecondary} />
            }
          </TouchableOpacity>

          {showQuartosDropdown && (
            <View style={[styles.dropdown, styles.dropdownWide]}>
              {/* Quartos */}
              <Text style={styles.dropdownTitle}>Quartos</Text>
              <View style={styles.optionRow}>
                {QUARTOS_OPTIONS.map((n) => (
                  <TouchableOpacity
                    key={`q-${n}`}
                    style={[styles.optionButton, minQuartos === n && styles.optionButtonActive]}
                    onPress={() => onQuartosChange(minQuartos === n ? null : n)}
                  >
                    <Text style={[styles.optionButtonText, minQuartos === n && styles.optionButtonTextActive]}>{n}+</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Banheiros */}
              <Text style={styles.dropdownTitle}>Banheiros</Text>
              <View style={styles.optionRow}>
                {QUARTOS_OPTIONS.map((n) => (
                  <TouchableOpacity
                    key={`b-${n}`}
                    style={[styles.optionButton, minBanheiros === n && styles.optionButtonActive]}
                    onPress={() => onBanheirosChange(minBanheiros === n ? null : n)}
                  >
                    <Text style={[styles.optionButtonText, minBanheiros === n && styles.optionButtonTextActive]}>{n}+</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Vagas */}
              <Text style={styles.dropdownTitle}>Vagas</Text>
              <View style={styles.optionRow}>
                {VAGAS_OPTIONS.map((n) => (
                  <TouchableOpacity
                    key={`v-${n}`}
                    style={[styles.optionButton, minVagas === n && styles.optionButtonActive]}
                    onPress={() => onVagasChange(minVagas === n ? null : n)}
                  >
                    <Text style={[styles.optionButtonText, minVagas === n && styles.optionButtonTextActive]}>{n}+</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Limpar */}
              {hasQuartosFilter && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    onQuartosChange(null);
                    onBanheirosChange(null);
                    onVagasChange(null);
                    setShowQuartosDropdown(false);
                  }}
                >
                  <X size={14} color="#FB4748" />
                  <Text style={styles.clearButtonText}>Limpar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Overlay para fechar dropdowns */}
      {(showPrecoDropdown || showQuartosDropdown) && (
        <Pressable
          style={styles.overlay}
          onPress={closeAllDropdowns}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 100,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    } : SHADOWS.sm),
  },
  // Row 1: Nav
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'web' ? SPACING.md : SPACING.xl + 10,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: SPACING.xxl,
  },
  logo: {
    fontSize: 24,
    fontFamily: FONTS.family.bodyBold,
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
  },
  navItem: {
    paddingVertical: SPACING.xs,
  },
  navText: {
    fontSize: 14,
    fontFamily: FONTS.family.body,
    color: COLORS.textSecondary,
  },
  navTextActive: {
    color: '#FB4748',
    fontFamily: FONTS.family.bodyBold,
  },
  // Row 2: Filters
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    flexWrap: 'wrap',
    zIndex: 101,
  },
  filterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 180,
  },
  filterInputText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.family.body,
    color: COLORS.text,
  },
  buyButton: {
    backgroundColor: '#FB4748',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.family.bodyBold,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: {
    backgroundColor: '#FB4748',
    borderColor: '#FB4748',
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: FONTS.family.body,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFF',
    fontFamily: FONTS.family.bodyBold,
  },
  // Dropdown
  dropdownWrapper: {
    position: 'relative',
    zIndex: 102,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    minWidth: 220,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    } : SHADOWS.lg),
  },
  dropdownWide: {
    minWidth: 260,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  dropdownTitle: {
    fontSize: 12,
    fontFamily: FONTS.family.bodyBold,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: SPACING.xs,
  },
  dropdownItemActive: {
    backgroundColor: '#FB474815',
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: FONTS.family.body,
    color: COLORS.text,
  },
  dropdownItemTextActive: {
    color: '#FB4748',
    fontFamily: FONTS.family.bodyBold,
  },
  // Option buttons (quartos/banheiros/vagas)
  optionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  optionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  optionButtonActive: {
    backgroundColor: '#FB4748',
    borderColor: '#FB4748',
  },
  optionButtonText: {
    fontSize: 13,
    fontFamily: FONTS.family.body,
    color: COLORS.text,
  },
  optionButtonTextActive: {
    color: '#FFF',
    fontFamily: FONTS.family.bodyBold,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearButtonText: {
    fontSize: 13,
    fontFamily: FONTS.family.body,
    color: '#FB4748',
  },
  // Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -2000,
    zIndex: 99,
  },
});
