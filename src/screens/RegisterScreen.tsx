import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, User, Mail, Lock, Phone, FileText, Eye, EyeOff } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Polygon, Circle, Line } from 'react-native-svg';

import { useAuth } from '../context/AuthContext';
import { SPACING, BORDER_RADIUS, FONTS } from '../constants';
import { AnimatedInput } from './LoginScreen';
import type { AuthStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<AuthStackParamList>;
type TipoCadastro = 'usuario' | 'corretor';

const { width: W, height: H } = Dimensions.get('window');
const HERO_H = H * 0.26;
const OVERLAP = 28;

// Ilustração hero — variação com foco no terreno/lote
const HeroIllustration: React.FC = () => (
  <Svg
    width={W}
    height={HERO_H}
    viewBox={`0 0 ${W} ${HERO_H}`}
    style={StyleSheet.absoluteFill}
  >
    {/* Brilho suave */}
    <Circle cx={W / 2} cy={HERO_H} r={W * 0.5} fill="rgba(180,83,9,0.06)" />

    {/* Colinas */}
    <Path
      d={`M0,${HERO_H * 0.68} Q${W * 0.25},${HERO_H * 0.45} ${W * 0.5},${HERO_H * 0.6} Q${W * 0.75},${HERO_H * 0.75} ${W},${HERO_H * 0.55} L${W},${HERO_H} L0,${HERO_H} Z`}
      fill="rgba(15,23,42,0.05)"
    />
    <Path
      d={`M0,${HERO_H * 0.82} Q${W * 0.2},${HERO_H * 0.72} ${W * 0.4},${HERO_H * 0.78} Q${W * 0.65},${HERO_H * 0.85} ${W * 0.85},${HERO_H * 0.68} L${W},${HERO_H * 0.74} L${W},${HERO_H} L0,${HERO_H} Z`}
      fill="rgba(15,23,42,0.08)"
    />

    {/* Casas */}
    <Rect x={W * 0.08} y={HERO_H * 0.6} width={W * 0.11} height={HERO_H * 0.4} fill="rgba(15,23,42,0.07)" />
    <Polygon
      points={`${W * 0.065},${HERO_H * 0.6} ${W * 0.135},${HERO_H * 0.44} ${W * 0.205},${HERO_H * 0.6}`}
      fill="rgba(15,23,42,0.1)"
    />

    <Rect x={W * 0.44} y={HERO_H * 0.35} width={W * 0.12} height={HERO_H * 0.65} fill="rgba(15,23,42,0.06)" />
    <Rect x={W * 0.462} y={HERO_H * 0.44} width="7" height="7" fill="rgba(180,83,9,0.2)" />
    <Rect x={W * 0.518} y={HERO_H * 0.44} width="7" height="7" fill="rgba(180,83,9,0.2)" />

    <Rect x={W * 0.73} y={HERO_H * 0.58} width={W * 0.1} height={HERO_H * 0.42} fill="rgba(15,23,42,0.07)" />
    <Polygon
      points={`${W * 0.715},${HERO_H * 0.58} ${W * 0.78},${HERO_H * 0.43} ${W * 0.845},${HERO_H * 0.58}`}
      fill="rgba(15,23,42,0.09)"
    />

    {/* Árvores */}
    <Rect x={W * 0.3} y={HERO_H * 0.7} width="3" height={HERO_H * 0.3} fill="rgba(15,23,42,0.1)" />
    <Circle cx={W * 0.302} cy={HERO_H * 0.66} r="10" fill="rgba(15,23,42,0.07)" />

    <Rect x={W * 0.62} y={HERO_H * 0.68} width="3" height={HERO_H * 0.32} fill="rgba(15,23,42,0.1)" />
    <Circle cx={W * 0.622} cy={HERO_H * 0.64} r="10" fill="rgba(15,23,42,0.07)" />

    {/* Horizonte */}
    <Line
      x1="0" y1={HERO_H * 0.76}
      x2={W} y2={HERO_H * 0.76}
      stroke="rgba(180,83,9,0.12)"
      strokeWidth="0.8"
      strokeDasharray="4,9"
    />
  </Svg>
);

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { registrarCorretor, registrarUsuario } = useAuth();

  const [passo, setPasso] = useState<1 | 2>(1);
  const [tipo, setTipo] = useState<TipoCadastro>('usuario');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [creci, setCreci] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Animação hero (uma vez ao montar)
  const heroOpacity = useSharedValue(0);
  const logoY = useSharedValue(-16);

  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    logoY.value = withDelay(100, withSpring(0, { damping: 18, stiffness: 90 }));
  }, []);

  // Animação de conteúdo — re-anima a cada mudança de passo
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(30);

  const animateContent = () => {
    contentOpacity.value = 0;
    contentY.value = 20;
    contentOpacity.value = withDelay(60, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
    contentY.value = withDelay(60, withSpring(0, { damping: 18, stiffness: 100 }));
  };

  useEffect(() => { animateContent(); }, [passo]);

  const heroStyle = useAnimatedStyle(() => ({ opacity: heroOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: logoY.value }] }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const handleVoltar = () => {
    if (passo === 2) setPasso(1);
    else navigation.goBack();
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

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero */}
        <Animated.View style={[styles.hero, heroStyle]}>
          <LinearGradient
            colors={['#F5EFE6', '#EDE4D3']}
            style={StyleSheet.absoluteFill}
          />
          <HeroIllustration />

          <Animated.View style={[styles.logoBox, logoStyle]}>
            <Text style={styles.logoLine}>LIVVO</Text>
            <Text style={styles.logoLine}>SMART</Text>
            <View style={styles.accentLine} />
          </Animated.View>
        </Animated.View>

        {/* Card principal */}
        <View style={styles.card}>
          {/* Cabeçalho do card — fixo (não anima junto com o conteúdo) */}
          <View style={styles.cardHeader}>
            <TouchableOpacity onPress={handleVoltar} activeOpacity={0.7} style={styles.voltarBtn}>
              <ArrowLeft size={20} color="#57534E" />
            </TouchableOpacity>

            {/* Indicador de progresso */}
            <View style={styles.progresso}>
              <View style={[styles.dot, styles.dotAtivo]} />
              <View style={[styles.progressoLinha, passo === 2 && styles.progressoLinhaAtiva]} />
              <View style={[styles.dot, passo === 2 && styles.dotAtivo]} />
            </View>
          </View>

          {/* Conteúdo animado por passo */}
          <Animated.View style={contentStyle}>
            {passo === 1 ? (
              // ── Passo 1: seleção do tipo ─────────────────────────────────
              <>
                <Text style={styles.titulo}>Criar conta</Text>
                <Text style={styles.subtitulo}>Como você vai usar o Livvo Smart?</Text>

                <View style={styles.tipoContainer}>
                  <TouchableOpacity
                    style={[styles.tipoCard, tipo === 'usuario' && styles.tipoCardOn]}
                    onPress={() => setTipo('usuario')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.tipoEmoji}>🏠</Text>
                    <Text style={[styles.tipoTitulo, tipo === 'usuario' && styles.tipoTituloOn]}>
                      Quero comprar ou ver imóveis
                    </Text>
                    <Text style={styles.tipoDesc}>
                      Busque, favorite e entre em contato com corretores
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tipoCard, tipo === 'corretor' && styles.tipoCardOn]}
                    onPress={() => setTipo('corretor')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.tipoEmoji}>💼</Text>
                    <Text style={[styles.tipoTitulo, tipo === 'corretor' && styles.tipoTituloOn]}>
                      Sou corretor
                    </Text>
                    <Text style={styles.tipoDesc}>
                      Anuncie imóveis, gerencie seu portfólio e atenda clientes
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setPasso(2)}
                  activeOpacity={0.85}
                  style={styles.btn}
                >
                  <Text style={styles.btnTxt}>CONTINUAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.linkBox}
                >
                  <Text style={styles.linkTxt}>
                    Já tenho conta{'  '}
                    <Text style={styles.linkAccent}>Entrar →</Text>
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // ── Passo 2: formulário ───────────────────────────────────────
              <>
                <Text style={styles.titulo}>
                  {tipo === 'corretor' ? 'Dados do corretor' : 'Seus dados'}
                </Text>

                <AnimatedInput
                  label="Nome completo"
                  icon={<User size={17} color="#A8A29E" />}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Seu nome"
                  autoCapitalize="words"
                />

                <AnimatedInput
                  label="E-mail"
                  icon={<Mail size={17} color="#A8A29E" />}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <AnimatedInput
                  label="Senha"
                  icon={<Lock size={17} color="#A8A29E" />}
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry={!mostrarSenha}
                  rightElement={
                    <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeBtn}>
                      {mostrarSenha
                        ? <EyeOff size={17} color="#A8A29E" />
                        : <Eye size={17} color="#A8A29E" />}
                    </TouchableOpacity>
                  }
                />

                <AnimatedInput
                  label="Telefone (opcional)"
                  icon={<Phone size={17} color="#A8A29E" />}
                  value={telefone}
                  onChangeText={setTelefone}
                  placeholder="(62) 99999-9999"
                  keyboardType="phone-pad"
                />

                {tipo === 'corretor' && (
                  <>
                    <AnimatedInput
                      label="CRECI *"
                      icon={<FileText size={17} color="#A8A29E" />}
                      value={creci}
                      onChangeText={setCreci}
                      placeholder="Ex: 12345-GO"
                      autoCapitalize="characters"
                    />
                    <AnimatedInput
                      label="WhatsApp *"
                      icon={<Phone size={17} color="#A8A29E" />}
                      value={whatsapp}
                      onChangeText={setWhatsapp}
                      placeholder="(62) 99999-9999"
                      keyboardType="phone-pad"
                    />
                  </>
                )}

                <TouchableOpacity
                  onPress={handleCadastrar}
                  disabled={carregando}
                  activeOpacity={0.85}
                  style={[styles.btn, carregando && styles.btnOff]}
                >
                  {carregando
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={styles.btnTxt}>CRIAR CONTA</Text>}
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flexGrow: 1,
  },
  // Hero
  hero: {
    height: HERO_H,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: OVERLAP + SPACING.md,
  },
  logoBox: {
    alignItems: 'center',
  },
  logoLine: {
    fontSize: 30,
    fontFamily: FONTS.heading,
    color: '#0F172A',
    letterSpacing: 5,
    lineHeight: 36,
  },
  accentLine: {
    width: 28,
    height: 2,
    backgroundColor: '#B45309',
    marginTop: SPACING.sm,
    borderRadius: 1,
  },
  // Card
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: OVERLAP,
    borderTopRightRadius: OVERLAP,
    marginTop: -OVERLAP,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  voltarBtn: {
    padding: SPACING.xs,
    marginLeft: -SPACING.xs,
  },
  // Progresso
  progresso: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E7E5E4',
  },
  dotAtivo: {
    backgroundColor: '#B45309',
  },
  progressoLinha: {
    width: 32,
    height: 1.5,
    backgroundColor: '#E7E5E4',
    marginHorizontal: SPACING.xs,
  },
  progressoLinhaAtiva: {
    backgroundColor: '#B45309',
  },
  // Títulos
  titulo: {
    fontSize: 22,
    fontFamily: FONTS.heading,
    color: '#0F172A',
    marginBottom: SPACING.xs,
  },
  subtitulo: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#A8A29E',
    marginBottom: SPACING.xl,
  },
  // Cards de tipo
  tipoContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  tipoCard: {
    backgroundColor: '#FAFAF8',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
  },
  tipoCardOn: {
    borderColor: '#B45309',
    backgroundColor: 'rgba(180,83,9,0.04)',
  },
  tipoEmoji: {
    fontSize: 26,
    marginBottom: SPACING.sm,
  },
  tipoTitulo: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#57534E',
    marginBottom: SPACING.xs,
  },
  tipoTituloOn: {
    color: '#0F172A',
  },
  tipoDesc: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#A8A29E',
    lineHeight: 18,
  },
  // Botão
  btn: {
    backgroundColor: '#B45309',
    paddingVertical: 15,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  btnOff: { opacity: 0.7 },
  btnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    letterSpacing: 2.5,
  },
  eyeBtn: { padding: SPACING.xs },
  // Link
  linkBox: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  linkTxt: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#A8A29E',
  },
  linkAccent: {
    color: '#B45309',
    fontFamily: FONTS.medium,
  },
});
