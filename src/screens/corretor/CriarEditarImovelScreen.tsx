import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';

import { criarImovel, buscarImovelPorId } from '../../services/imoveis';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants';
import type { Imovel, PropertyStatus, PropertyType } from '../../types';
import type { MainStackParamList } from '../../../App';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type Rota = RouteProp<MainStackParamList, 'CriarEditarImovel'>;

const TIPOS: { value: PropertyType; label: string }[] = [
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'terreno', label: 'Terreno' },
];

const STATUS: { value: PropertyStatus; label: string }[] = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'negociacao', label: 'Em negociação' },
  { value: 'reservado', label: 'Reservado' },
  { value: 'vendido', label: 'Vendido' },
];

export const CriarEditarImovelScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rota>();
  const { usuario } = useAuth();
  const imovelId = route.params?.imovelId;
  const isEditing = !!imovelId;

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Campos do formulário
  const [tipo, setTipo] = useState<PropertyType>('casa');
  const [status, setStatus] = useState<PropertyStatus>('disponivel');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tourUrl, setTourUrl] = useState('');

  // Localização
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Características
  const [quartos, setQuartos] = useState('');
  const [banheiros, setBanheiros] = useState('');
  const [suites, setSuites] = useState('');
  const [vagas, setVagas] = useState('');
  const [areaTotal, setAreaTotal] = useState('');
  const [areaConstruida, setAreaConstruida] = useState('');

  // Características extras (booleans)
  const [piscina, setPiscina] = useState(false);
  const [churrasqueira, setChurrasqueira] = useState(false);
  const [academia, setAcademia] = useState(false);
  const [elevador, setElevador] = useState(false);
  const [portaria24h, setPortaria24h] = useState(false);
  const [mobiliado, setMobiliado] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setCarregando(true);
      buscarImovelPorId(imovelId).then(imovel => {
        if (imovel) preencherFormulario(imovel);
      }).finally(() => setCarregando(false));
    }
  }, [imovelId]);

  const preencherFormulario = (imovel: Imovel) => {
    setTipo(imovel.tipo);
    setStatus(imovel.status);
    setTitulo(imovel.titulo);
    setDescricao(imovel.descricao);
    setValor(String(imovel.valor));
    setTourUrl(imovel.tour_virtual_url || '');
    setEndereco(imovel.localizacao.endereco || '');
    setBairro(imovel.localizacao.bairro || '');
    setCidade(imovel.localizacao.cidade || '');
    setEstado(imovel.localizacao.estado || '');
    setCep(imovel.localizacao.cep || '');
    setLatitude(String(imovel.localizacao.latitude));
    setLongitude(String(imovel.localizacao.longitude));
    setQuartos(imovel.caracteristicas.quartos ? String(imovel.caracteristicas.quartos) : '');
    setBanheiros(imovel.caracteristicas.banheiros ? String(imovel.caracteristicas.banheiros) : '');
    setSuites(imovel.caracteristicas.suites ? String(imovel.caracteristicas.suites) : '');
    setVagas(imovel.caracteristicas.vagas_garagem ? String(imovel.caracteristicas.vagas_garagem) : '');
    setAreaTotal(imovel.caracteristicas.area_total ? String(imovel.caracteristicas.area_total) : '');
    setAreaConstruida(imovel.caracteristicas.area_construida ? String(imovel.caracteristicas.area_construida) : '');
    setPiscina(!!imovel.caracteristicas.piscina);
    setChurrasqueira(!!imovel.caracteristicas.churrasqueira);
    setAcademia(!!imovel.caracteristicas.academia);
    setElevador(!!imovel.caracteristicas.elevador);
    setPortaria24h(!!imovel.caracteristicas.portaria_24h);
    setMobiliado(!!imovel.caracteristicas.mobiliado);
  };

  const validar = (): boolean => {
    if (!titulo.trim()) { Alert.alert('Campo obrigatório', 'Informe o título.'); return false; }
    if (!descricao.trim()) { Alert.alert('Campo obrigatório', 'Informe a descrição.'); return false; }
    if (!valor || isNaN(Number(valor))) { Alert.alert('Campo obrigatório', 'Informe um valor válido.'); return false; }
    if (!cidade.trim()) { Alert.alert('Campo obrigatório', 'Informe a cidade.'); return false; }
    if (!estado.trim()) { Alert.alert('Campo obrigatório', 'Informe o estado (UF).'); return false; }
    if (!latitude || !longitude) { Alert.alert('Localização', 'Informe latitude e longitude.'); return false; }
    return true;
  };

  const handleSalvar = async () => {
    if (!validar() || !usuario) return;

    setSalvando(true);
    try {
      // Buscar o corretor_id do usuário
      const { data: corretor } = await supabase
        .from('corretores')
        .select('id')
        .eq('user_id', usuario.user_id)
        .single();

      if (!corretor) {
        Alert.alert('Erro', 'Perfil de corretor não encontrado.');
        return;
      }

      const dadosImovel = {
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        valor: parseFloat(valor),
        status,
        tour_virtual_url: tourUrl.trim() || undefined,
        localizacao: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          endereco: endereco.trim() || undefined,
          bairro: bairro.trim() || undefined,
          cidade: cidade.trim(),
          estado: estado.trim().toUpperCase().slice(0, 2),
          cep: cep.trim() || undefined,
        },
        caracteristicas: {
          quartos: quartos ? parseInt(quartos) : undefined,
          banheiros: banheiros ? parseInt(banheiros) : undefined,
          suites: suites ? parseInt(suites) : undefined,
          vagas_garagem: vagas ? parseInt(vagas) : undefined,
          area_total: areaTotal ? parseFloat(areaTotal) : undefined,
          area_construida: areaConstruida ? parseFloat(areaConstruida) : undefined,
          piscina: piscina || undefined,
          churrasqueira: churrasqueira || undefined,
          academia: academia || undefined,
          elevador: elevador || undefined,
          portaria_24h: portaria24h || undefined,
          mobiliado: mobiliado || undefined,
        },
        anunciante: {
          tipo: 'corretor' as const,
          corretor: { id: corretor.id, nome: usuario.nome, creci: '', whatsapp: '' },
        },
      };

      if (isEditing) {
        const { error } = await supabase
          .from('imoveis')
          .update({
            tipo: dadosImovel.tipo,
            titulo: dadosImovel.titulo,
            descricao: dadosImovel.descricao,
            valor: dadosImovel.valor,
            status: dadosImovel.status,
            latitude: dadosImovel.localizacao.latitude,
            longitude: dadosImovel.localizacao.longitude,
            endereco: dadosImovel.localizacao.endereco,
            bairro: dadosImovel.localizacao.bairro,
            cidade: dadosImovel.localizacao.cidade,
            estado: dadosImovel.localizacao.estado,
            cep: dadosImovel.localizacao.cep,
            area_total: dadosImovel.caracteristicas.area_total,
            area_construida: dadosImovel.caracteristicas.area_construida,
            quartos: dadosImovel.caracteristicas.quartos,
            suites: dadosImovel.caracteristicas.suites,
            banheiros: dadosImovel.caracteristicas.banheiros,
            vagas_garagem: dadosImovel.caracteristicas.vagas_garagem,
            caracteristicas: dadosImovel.caracteristicas,
          })
          .eq('id', imovelId);
        if (error) throw error;
        Alert.alert('Sucesso', 'Imóvel atualizado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await criarImovel(dadosImovel);
        Alert.alert('Sucesso', 'Imóvel criado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Não foi possível salvar o imóvel.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centralize}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltarBtn}>
          <ArrowLeft size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>{isEditing ? 'Editar Imóvel' : 'Novo Imóvel'}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Tipo */}
        <Secao titulo="Tipo de imóvel">
          <View style={styles.opcoesTipo}>
            {TIPOS.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.opcaoTipo, tipo === t.value && styles.opcaoTipoSelecionada]}
                onPress={() => setTipo(t.value)}
              >
                <Text style={[styles.opcaoTipoTexto, tipo === t.value && styles.opcaoTipoTextoSelecionado]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Secao>

        {/* Informações básicas */}
        <Secao titulo="Informações básicas">
          <Campo label="Título *">
            <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ex: Casa 3 quartos - Setor Bueno" placeholderTextColor={COLORS.textSecondary} />
          </Campo>
          <Campo label="Descrição *">
            <TextInput style={[styles.input, styles.textArea]} value={descricao} onChangeText={setDescricao} placeholder="Descreva o imóvel..." placeholderTextColor={COLORS.textSecondary} multiline numberOfLines={4} textAlignVertical="top" />
          </Campo>
          <Campo label="Valor (R$) *">
            <TextInput style={styles.input} value={valor} onChangeText={setValor} placeholder="0,00" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
          </Campo>
          <Campo label="URL Tour Virtual 360° (opcional)">
            <TextInput style={styles.input} value={tourUrl} onChangeText={setTourUrl} placeholder="https://kuula.co/..." placeholderTextColor={COLORS.textSecondary} autoCapitalize="none" autoCorrect={false} />
          </Campo>
        </Secao>

        {/* Status */}
        <Secao titulo="Status">
          <View style={styles.opcoesTipo}>
            {STATUS.map(s => (
              <TouchableOpacity
                key={s.value}
                style={[styles.opcaoTipo, status === s.value && styles.opcaoTipoSelecionada]}
                onPress={() => setStatus(s.value)}
              >
                <Text style={[styles.opcaoTipoTexto, status === s.value && styles.opcaoTipoTextoSelecionado]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Secao>

        {/* Localização */}
        <Secao titulo="Localização">
          <Campo label="Endereço">
            <TextInput style={styles.input} value={endereco} onChangeText={setEndereco} placeholder="Rua, número" placeholderTextColor={COLORS.textSecondary} />
          </Campo>
          <Campo label="Bairro">
            <TextInput style={styles.input} value={bairro} onChangeText={setBairro} placeholder="Bairro" placeholderTextColor={COLORS.textSecondary} />
          </Campo>
          <View style={styles.linha2cols}>
            <View style={{ flex: 2 }}>
              <Campo label="Cidade *">
                <TextInput style={styles.input} value={cidade} onChangeText={setCidade} placeholder="Goiânia" placeholderTextColor={COLORS.textSecondary} />
              </Campo>
            </View>
            <View style={{ flex: 1 }}>
              <Campo label="UF *">
                <TextInput style={styles.input} value={estado} onChangeText={setEstado} placeholder="GO" placeholderTextColor={COLORS.textSecondary} maxLength={2} autoCapitalize="characters" />
              </Campo>
            </View>
          </View>
          <Campo label="CEP">
            <TextInput style={styles.input} value={cep} onChangeText={setCep} placeholder="00000-000" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
          </Campo>
          <View style={styles.linha2cols}>
            <View style={{ flex: 1 }}>
              <Campo label="Latitude *">
                <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} placeholder="-16.6869" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              </Campo>
            </View>
            <View style={{ flex: 1 }}>
              <Campo label="Longitude *">
                <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} placeholder="-49.2648" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              </Campo>
            </View>
          </View>
        </Secao>

        {/* Características */}
        <Secao titulo="Características">
          <View style={styles.linha2cols}>
            <View style={{ flex: 1 }}>
              <Campo label="Quartos">
                <TextInput style={styles.input} value={quartos} onChangeText={setQuartos} placeholder="0" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              </Campo>
            </View>
            <View style={{ flex: 1 }}>
              <Campo label="Banheiros">
                <TextInput style={styles.input} value={banheiros} onChangeText={setBanheiros} placeholder="0" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              </Campo>
            </View>
          </View>
          <View style={styles.linha2cols}>
            <View style={{ flex: 1 }}>
              <Campo label="Suítes">
                <TextInput style={styles.input} value={suites} onChangeText={setSuites} placeholder="0" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              </Campo>
            </View>
            <View style={{ flex: 1 }}>
              <Campo label="Vagas">
                <TextInput style={styles.input} value={vagas} onChangeText={setVagas} placeholder="0" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              </Campo>
            </View>
          </View>
          <View style={styles.linha2cols}>
            <View style={{ flex: 1 }}>
              <Campo label="Área total (m²)">
                <TextInput style={styles.input} value={areaTotal} onChangeText={setAreaTotal} placeholder="0" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              </Campo>
            </View>
            <View style={{ flex: 1 }}>
              <Campo label="Área construída (m²)">
                <TextInput style={styles.input} value={areaConstruida} onChangeText={setAreaConstruida} placeholder="0" placeholderTextColor={COLORS.textSecondary} keyboardType="numeric" />
              </Campo>
            </View>
          </View>
        </Secao>

        {/* Extras */}
        <Secao titulo="Extras">
          {[
            { label: 'Piscina', value: piscina, setter: setPiscina },
            { label: 'Churrasqueira', value: churrasqueira, setter: setChurrasqueira },
            { label: 'Academia', value: academia, setter: setAcademia },
            { label: 'Elevador', value: elevador, setter: setElevador },
            { label: 'Portaria 24h', value: portaria24h, setter: setPortaria24h },
            { label: 'Mobiliado', value: mobiliado, setter: setMobiliado },
          ].map(item => (
            <View key={item.label} style={styles.switchRow}>
              <Text style={styles.switchLabel}>{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={item.setter}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.surface}
              />
            </View>
          ))}
        </Secao>

        {/* Botão salvar */}
        <TouchableOpacity
          style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
          onPress={handleSalvar}
          disabled={salvando}
          activeOpacity={0.85}
        >
          {salvando
            ? <ActivityIndicator color={COLORS.surface} />
            : <Text style={styles.botaoSalvarTexto}>{isEditing ? 'Salvar alterações' : 'Publicar imóvel'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const Secao: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
  <View style={styles.secao}>
    <Text style={styles.secaoTitulo}>{titulo}</Text>
    {children}
  </View>
);

const Campo: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.campo}>
    <Text style={styles.campoLabel}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centralize: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  voltarBtn: { padding: SPACING.xs },
  headerTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  secao: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
    fontFamily: FONTS.bold,
  },
  campo: { marginBottom: SPACING.md },
  campoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.sm,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundDark,
    fontFamily: FONTS.regular,
  },
  textArea: {
    height: 100,
    paddingTop: SPACING.md,
  },
  opcoesTipo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  opcaoTipo: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  opcaoTipoSelecionada: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  opcaoTipoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: FONTS.bold,
  },
  opcaoTipoTextoSelecionado: {
    color: COLORS.surface,
  },
  linha2cols: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  switchLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  botaoSalvar: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  botaoDesabilitado: { opacity: 0.7 },
  botaoSalvarTexto: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
});
