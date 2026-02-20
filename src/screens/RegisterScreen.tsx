import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, User, Mail, Lock, Phone, FileText, Eye, EyeOff } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../constants';
import type { AuthStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

type TipoCadastro = 'usuario' | 'corretor';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { registrarCorretor, registrarUsuario } = useAuth();

  const [passo, setPasso] = useState<1 | 2>(1);
  const [tipo, setTipo] = useState<TipoCadastro>('usuario');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Campos comuns
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');

  // Campos de corretor
  const [creci, setCreci] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleProximo = () => {
    setPasso(2);
  };

  const handleVoltar = () => {
    if (passo === 2) {
      setPasso(1);
    } else {
      navigation.goBack();
    }
  };

  const validar = (): boolean => {
    if (!nome.trim()) { Alert.alert('Campo obrigatório', 'Informe seu nome.'); return false; }
    if (!email.trim()) { Alert.alert('Campo obrigatório', 'Informe seu e-mail.'); return false; }
    if (!email.includes('@')) { Alert.alert('E-mail inválido', 'Informe um e-mail válido.'); return false; }
    if (senha.length < 6) { Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.'); return false; }
    if (tipo === 'corretor') {
      if (!creci.trim()) { Alert.alert('Campo obrigatório', 'Informe o CRECI.'); return false; }
      if (!whatsapp.trim()) { Alert.alert('Campo obrigatório', 'Informe o WhatsApp.'); return false; }
    }
    return true;
  };

  const handleCadastrar = async () => {
    if (!validar()) return;

    setCarregando(true);
    try {
      if (tipo === 'corretor') {
        await registrarCorretor({ nome, email: email.trim().toLowerCase(), senha, creci, whatsapp, telefone: telefone || undefined });
      } else {
        await registrarUsuario({ nome, email: email.trim().toLowerCase(), senha, telefone: telefone || undefined });
      }
      Alert.alert(
        'Cadastro realizado!',
        'Verifique seu e-mail para confirmar o cadastro antes de entrar.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: any) {
      const msg = err?.message || 'Tente novamente.';
      if (msg.includes('already registered')) {
        Alert.alert('E-mail já cadastrado', 'Este e-mail já está em uso. Tente fazer login.');
      } else {
        Alert.alert('Erro ao cadastrar', msg);
      }
    } finally {
      setCarregando(false);
    }
  };

  // Passo 1: seleção do tipo
  if (passo === 1) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.voltarBtn} onPress={handleVoltar}>
          <ArrowLeft size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.passoHeader}>
          <Text style={styles.titulo}>Criar conta</Text>
          <Text style={styles.subtitulo}>Como você vai usar o Livvo Smart?</Text>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={[styles.tipoCard, tipo === 'usuario' && styles.tipoCardSelecionado]}
            onPress={() => setTipo('usuario')}
            activeOpacity={0.85}
          >
            <Text style={styles.tipoCardEmoji}>🏠</Text>
            <Text style={[styles.tipoCardTitulo, tipo === 'usuario' && styles.tipoCardTituloSelecionado]}>
              Quero comprar ou ver imóveis
            </Text>
            <Text style={styles.tipoCardDesc}>
              Busque, favorite e entre em contato com corretores
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tipoCard, tipo === 'corretor' && styles.tipoCardSelecionado]}
            onPress={() => setTipo('corretor')}
            activeOpacity={0.85}
          >
            <Text style={styles.tipoCardEmoji}>💼</Text>
            <Text style={[styles.tipoCardTitulo, tipo === 'corretor' && styles.tipoCardTituloSelecionado]}>
              Sou corretor
            </Text>
            <Text style={styles.tipoCardDesc}>
              Anuncie imóveis, gerencie seu portfólio e atenda clientes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Indicador de progresso */}
        <View style={styles.progresso}>
          <View style={[styles.progressoPonto, styles.progressoPontoAtivo]} />
          <View style={styles.progressoLinha} />
          <View style={styles.progressoPonto} />
        </View>

        <TouchableOpacity style={styles.botaoPrimario} onPress={handleProximo} activeOpacity={0.85}>
          <Text style={styles.botaoPrimarioTexto}>Continuar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkLogin} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkLoginTexto}>Já tenho conta — Entrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Passo 2: formulário
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.voltarBtn} onPress={handleVoltar}>
          <ArrowLeft size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.passoHeader}>
          <Text style={styles.titulo}>
            {tipo === 'corretor' ? 'Dados do corretor' : 'Seus dados'}
          </Text>
        </View>

        {/* Indicador de progresso */}
        <View style={[styles.progresso, { marginBottom: SPACING.xl }]}>
          <View style={[styles.progressoPonto, styles.progressoPontoAtivo]} />
          <View style={[styles.progressoLinha, styles.progressoLinhaAtiva]} />
          <View style={[styles.progressoPonto, styles.progressoPontoAtivo]} />
        </View>

        <View style={styles.form}>
          <Campo label="Nome completo" icon={<User size={18} color={COLORS.textSecondary} />}>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor={COLORS.textSecondary}
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </Campo>

          <Campo label="E-mail" icon={<Mail size={18} color={COLORS.textSecondary} />}>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Campo>

          <Campo label="Senha" icon={<Lock size={18} color={COLORS.textSecondary} />}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={COLORS.textSecondary}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeButton}>
              {mostrarSenha
                ? <EyeOff size={18} color={COLORS.textSecondary} />
                : <Eye size={18} color={COLORS.textSecondary} />}
            </TouchableOpacity>
          </Campo>

          <Campo label="Telefone (opcional)" icon={<Phone size={18} color={COLORS.textSecondary} />}>
            <TextInput
              style={styles.input}
              placeholder="(62) 99999-9999"
              placeholderTextColor={COLORS.textSecondary}
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />
          </Campo>

          {tipo === 'corretor' && (
            <>
              <Campo label="CRECI *" icon={<FileText size={18} color={COLORS.textSecondary} />}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 12345-GO"
                  placeholderTextColor={COLORS.textSecondary}
                  value={creci}
                  onChangeText={setCreci}
                  autoCapitalize="characters"
                />
              </Campo>

              <Campo label="WhatsApp *" icon={<Phone size={18} color={COLORS.textSecondary} />}>
                <TextInput
                  style={styles.input}
                  placeholder="(62) 99999-9999"
                  placeholderTextColor={COLORS.textSecondary}
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  keyboardType="phone-pad"
                />
              </Campo>
            </>
          )}

          <TouchableOpacity
            style={[styles.botaoPrimario, carregando && styles.botaoDesabilitado, { marginTop: SPACING.md }]}
            onPress={handleCadastrar}
            disabled={carregando}
            activeOpacity={0.85}
          >
            {carregando
              ? <ActivityIndicator color={COLORS.surface} />
              : <Text style={styles.botaoPrimarioTexto}>Criar conta</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Componente auxiliar para campos do formulário
const Campo: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <View style={styles.campo}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <View style={styles.inputIcon}>{icon}</View>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: SPACING.lg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxxl,
  },
  voltarBtn: {
    marginBottom: SPACING.xl,
    alignSelf: 'flex-start',
    padding: SPACING.xs,
  },
  passoHeader: {
    marginBottom: SPACING.xl,
  },
  titulo: {
    fontSize: 26,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitulo: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  cardsContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  tipoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  tipoCardSelecionado: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '08',
  },
  tipoCardEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  tipoCardTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tipoCardTituloSelecionado: {
    color: COLORS.primary,
  },
  tipoCardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    fontFamily: FONTS.regular,
  },
  progresso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    gap: 0,
  },
  progressoPonto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  progressoPontoAtivo: {
    backgroundColor: COLORS.primary,
  },
  progressoLinha: {
    width: 48,
    height: 2,
    backgroundColor: COLORS.border,
  },
  progressoLinhaAtiva: {
    backgroundColor: COLORS.primary,
  },
  botaoPrimario: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  botaoPrimarioTexto: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  linkLogin: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  linkLoginTexto: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: 0,
  },
  campo: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: 15,
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  eyeButton: {
    padding: SPACING.xs,
  },
});
