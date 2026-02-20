import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Plus, Trash2, Shield, User, Briefcase } from 'lucide-react-native';

import { listarUsuarios, deletarUsuario, promoverAdmin, criarAdmin } from '../../services/usuarios';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants';
import type { Perfil, TipoUsuario } from '../../types';
import type { MainStackParamList } from '../../../App';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const FILTROS: { value: TipoUsuario | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'usuario', label: 'Compradores' },
  { value: 'corretor', label: 'Corretores' },
  { value: 'administrador', label: 'Admins' },
];

export const GerenciarUsuariosScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<TipoUsuario | 'todos'>('todos');
  const [modalNovoAdmin, setModalNovoAdmin] = useState(false);

  // Formulário novo admin
  const [adminNome, setAdminNome] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminSenha, setAdminSenha] = useState('');
  const [criandoAdmin, setCriandoAdmin] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await listarUsuarios(filtro !== 'todos' ? filtro : undefined);
      setUsuarios(lista);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os usuários.');
    } finally {
      setCarregando(false);
    }
  }, [filtro]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleDeletar = (usuario: Perfil) => {
    Alert.alert('Deletar usuário', `Deletar "${usuario.nome}"? Esta ação é irreversível.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletarUsuario(usuario.user_id);
            setUsuarios(prev => prev.filter(u => u.user_id !== usuario.user_id));
          } catch {
            Alert.alert('Erro', 'Não foi possível deletar o usuário.');
          }
        },
      },
    ]);
  };

  const handlePromover = (usuario: Perfil) => {
    Alert.alert('Promover a admin', `Promover "${usuario.nome}" a administrador?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Promover',
        onPress: async () => {
          try {
            await promoverAdmin(usuario.user_id);
            setUsuarios(prev => prev.map(u =>
              u.user_id === usuario.user_id ? { ...u, tipo: 'administrador' } : u
            ));
          } catch {
            Alert.alert('Erro', 'Não foi possível promover o usuário.');
          }
        },
      },
    ]);
  };

  const handleCriarAdmin = async () => {
    if (!adminNome.trim() || !adminEmail.trim() || adminSenha.length < 6) {
      Alert.alert('Dados inválidos', 'Preencha nome, e-mail e senha (mín. 6 caracteres).');
      return;
    }
    setCriandoAdmin(true);
    try {
      await criarAdmin({ nome: adminNome.trim(), email: adminEmail.trim().toLowerCase(), senha: adminSenha });
      setModalNovoAdmin(false);
      setAdminNome(''); setAdminEmail(''); setAdminSenha('');
      Alert.alert('Sucesso', 'Novo administrador criado!');
      carregar();
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Não foi possível criar o administrador.');
    } finally {
      setCriandoAdmin(false);
    }
  };

  const tipoIcon = (tipo: TipoUsuario) => {
    if (tipo === 'corretor') return <Briefcase size={16} color={COLORS.secondary} />;
    if (tipo === 'administrador') return <Shield size={16} color={COLORS.accent} />;
    return <User size={16} color={COLORS.primary} />;
  };

  const renderUsuario = ({ item }: { item: Perfil }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.cardAvatar}>
          <Text style={styles.cardAvatarLetra}>{item.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardTextos}>
          <Text style={styles.cardNome}>{item.nome}</Text>
          <View style={styles.cardTipoRow}>
            {tipoIcon(item.tipo)}
            <Text style={styles.cardTipo}>{labelTipo(item.tipo)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardAcoes}>
        {item.tipo !== 'administrador' && (
          <TouchableOpacity style={styles.acaoBtn} onPress={() => handlePromover(item)}>
            <Shield size={14} color={COLORS.accent} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.acaoBtn, styles.acaoBtnPerigo]} onPress={() => handleDeletar(item)}>
          <Trash2 size={14} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltarBtn}>
          <ArrowLeft size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Usuários</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalNovoAdmin(true)}>
          <Plus size={20} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosRow}>
        {FILTROS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filtroPill, filtro === f.value && styles.filtroPillAtivo]}
            onPress={() => setFiltro(f.value)}
          >
            <Text style={[styles.filtroPillTexto, filtro === f.value && styles.filtroPillTextoAtivo]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {carregando ? (
        <View style={styles.centralize}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={u => u.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={renderUsuario}
          onRefresh={carregar}
          refreshing={carregando}
          ListEmptyComponent={
            <View style={styles.centralize}>
              <User size={40} color={COLORS.border} />
              <Text style={styles.vazioTexto}>Nenhum usuário encontrado</Text>
            </View>
          }
        />
      )}

      {/* Modal: Novo Admin */}
      <Modal visible={modalNovoAdmin} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Novo Administrador</Text>

            <TextInput style={styles.modalInput} placeholder="Nome completo" placeholderTextColor={COLORS.textSecondary} value={adminNome} onChangeText={setAdminNome} autoCapitalize="words" />
            <TextInput style={styles.modalInput} placeholder="E-mail" placeholderTextColor={COLORS.textSecondary} value={adminEmail} onChangeText={setAdminEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.modalInput} placeholder="Senha (mín. 6 caracteres)" placeholderTextColor={COLORS.textSecondary} value={adminSenha} onChangeText={setAdminSenha} secureTextEntry />

            <View style={styles.modalAcoes}>
              <TouchableOpacity style={styles.modalBotaoCancelar} onPress={() => setModalNovoAdmin(false)}>
                <Text style={styles.modalBotaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBotaoConfirmar, criandoAdmin && styles.botaoDesabilitado]}
                onPress={handleCriarAdmin}
                disabled={criandoAdmin}
              >
                {criandoAdmin
                  ? <ActivityIndicator color={COLORS.surface} />
                  : <Text style={styles.modalBotaoConfirmarTexto}>Criar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const labelTipo = (tipo: TipoUsuario): string => {
  if (tipo === 'corretor') return 'Corretor';
  if (tipo === 'administrador') return 'Admin';
  return 'Comprador';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  voltarBtn: { padding: SPACING.xs },
  headerTitulo: { fontSize: 17, fontWeight: '700', color: COLORS.text, fontFamily: FONTS.bold },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm },
  filtrosRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  filtroPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtroPillAtivo: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filtroPillTexto: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, fontFamily: FONTS.bold },
  filtroPillTextoAtivo: { color: COLORS.surface },
  centralize: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md, paddingTop: 40 },
  vazioTexto: { fontSize: 15, color: COLORS.textSecondary, fontFamily: FONTS.regular },
  lista: { padding: SPACING.lg, gap: SPACING.md },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  cardInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarLetra: { fontSize: 18, fontWeight: '700', color: COLORS.surface, fontFamily: FONTS.bold },
  cardTextos: { flex: 1 },
  cardNome: { fontSize: 15, fontWeight: '600', color: COLORS.text, fontFamily: FONTS.bold },
  cardTipoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardTipo: { fontSize: 12, color: COLORS.textSecondary, fontFamily: FONTS.regular },
  cardAcoes: { flexDirection: 'row', gap: SPACING.sm },
  acaoBtn: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acaoBtnPerigo: { borderColor: COLORS.error + '40' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  modalTitulo: { fontSize: 18, fontWeight: '700', color: COLORS.text, fontFamily: FONTS.bold, marginBottom: SPACING.sm },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundDark,
    fontFamily: FONTS.regular,
  },
  modalAcoes: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  modalBotaoCancelar: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalBotaoCancelarTexto: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary, fontFamily: FONTS.bold },
  modalBotaoConfirmar: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  botaoDesabilitado: { opacity: 0.7 },
  modalBotaoConfirmarTexto: { fontSize: 15, fontWeight: '700', color: COLORS.surface, fontFamily: FONTS.bold },
});
