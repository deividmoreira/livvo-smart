import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  Search,
  Mic,
  SlidersHorizontal,
  X,
  Home,
  Building,
  Landmark,
  Check,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, PROPERTY_TYPES } from '../constants';
import { PropertyType, FiltrosBusca } from '../types';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  onVoiceSearch?: () => void;
  filtros: FiltrosBusca;
  onFiltrosChange: (filtros: FiltrosBusca) => void;
  placeholder?: string;
}

const VALORES_PREDEFINIDOS = [
  { label: 'Até R$ 100 mil', value: 100000 },
  { label: 'Até R$ 200 mil', value: 200000 },
  { label: 'Até R$ 300 mil', value: 300000 },
  { label: 'Até R$ 500 mil', value: 500000 },
  { label: 'Até R$ 1 milhão', value: 1000000 },
  { label: 'Até R$ 2 milhões', value: 2000000 },
  { label: 'Acima de R$ 2 milhões', value: null },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  onVoiceSearch,
  filtros,
  onFiltrosChange,
  placeholder = 'Busque por localidade ou descreva o que procura...',
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [tempFiltros, setTempFiltros] = useState<FiltrosBusca>(filtros);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filtros.tipo) count++;
    if (filtros.valorMaximo) count++;
    if (filtros.quartosMinimo) count++;
    return count;
  };

  const activeFilters = getActiveFiltersCount();

  const handleApplyFilters = () => {
    onFiltrosChange(tempFiltros);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setTempFiltros({});
    onFiltrosChange({});
  };

  const getPropertyIcon = (tipo: string) => {
    switch (tipo) {
      case 'casa':
        return <Home size={20} color={tempFiltros.tipo === tipo ? COLORS.surface : COLORS.text} />;
      case 'apartamento':
        return <Building size={20} color={tempFiltros.tipo === tipo ? COLORS.surface : COLORS.text} />;
      case 'terreno':
        return <Landmark size={20} color={tempFiltros.tipo === tipo ? COLORS.surface : COLORS.text} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <X size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
        {onVoiceSearch && (
          <TouchableOpacity onPress={onVoiceSearch} style={styles.voiceButton}>
            <Mic size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.filterButton, activeFilters > 0 && styles.filterButtonActive]}
        onPress={() => {
          setTempFiltros(filtros);
          setShowFilters(true);
        }}
      >
        <SlidersHorizontal
          size={20}
          color={activeFilters > 0 ? COLORS.surface : COLORS.primary}
        />
        {activeFilters > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFilters}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal de Filtros */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Tipo de Imóvel */}
              <Text style={styles.filterLabel}>Tipo de Imóvel</Text>
              <View style={styles.typeContainer}>
                {PROPERTY_TYPES.map((tipo) => (
                  <TouchableOpacity
                    key={tipo.value}
                    style={[
                      styles.typeButton,
                      tempFiltros.tipo === tipo.value && styles.typeButtonActive,
                    ]}
                    onPress={() =>
                      setTempFiltros((prev) => ({
                        ...prev,
                        tipo: prev.tipo === tipo.value ? undefined : (tipo.value as PropertyType),
                      }))
                    }
                  >
                    {getPropertyIcon(tipo.value)}
                    <Text
                      style={[
                        styles.typeButtonText,
                        tempFiltros.tipo === tipo.value && styles.typeButtonTextActive,
                      ]}
                    >
                      {tipo.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Valor Máximo */}
              <Text style={styles.filterLabel}>Valor Máximo</Text>
              <View style={styles.valuesContainer}>
                {VALORES_PREDEFINIDOS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.valueButton,
                      tempFiltros.valorMaximo === item.value && styles.valueButtonActive,
                    ]}
                    onPress={() =>
                      setTempFiltros((prev) => ({
                        ...prev,
                        valorMaximo: prev.valorMaximo === item.value ? undefined : item.value ?? undefined,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.valueButtonText,
                        tempFiltros.valorMaximo === item.value && styles.valueButtonTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {tempFiltros.valorMaximo === item.value && (
                      <Check size={16} color={COLORS.surface} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quartos (apenas para casa/apartamento) */}
              {tempFiltros.tipo !== 'terreno' && (
                <>
                  <Text style={styles.filterLabel}>Quartos (mínimo)</Text>
                  <View style={styles.quartoContainer}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.quartoButton,
                          tempFiltros.quartosMinimo === num && styles.quartoButtonActive,
                        ]}
                        onPress={() =>
                          setTempFiltros((prev) => ({
                            ...prev,
                            quartosMinimo: prev.quartosMinimo === num ? undefined : num,
                          }))
                        }
                      >
                        <Text
                          style={[
                            styles.quartoButtonText,
                            tempFiltros.quartosMinimo === num && styles.quartoButtonTextActive,
                          ]}
                        >
                          {num}+
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                <Text style={styles.clearButtonText}>Limpar filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Glass effect
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
    height: 40,
  },
  voiceButton: {
    padding: SPACING.xs,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  filterBadgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundDark,
    gap: SPACING.xs,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  typeButtonTextActive: {
    color: COLORS.surface,
  },
  valuesContainer: {
    gap: SPACING.sm,
  },
  valueButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundDark,
  },
  valueButtonActive: {
    backgroundColor: COLORS.primary,
  },
  valueButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  valueButtonTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  quartoContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quartoButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundDark,
  },
  quartoButtonActive: {
    backgroundColor: COLORS.primary,
  },
  quartoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  quartoButtonTextActive: {
    color: COLORS.surface,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.surface,
  },
});
