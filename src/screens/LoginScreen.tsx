import React, { useState, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
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
import type { AuthStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const { width: W, height: H } = Dimensions.get('window');
const HERO_H = H * 0.36;
const OVERLAP = 28;

// Ilustração minimalista de paisagem imobiliária
const HeroIllustration: React.FC = () => (
  <Svg
    width={W}
    height={HERO_H}
    viewBox={`0 0 ${W} ${HERO_H}`}
    style={StyleSheet.absoluteFill}
  >
    {/* Brilho do sol no horizonte */}
    <Circle cx={W / 2} cy={HERO_H} r={W * 0.55} fill="rgba(180,83,9,0.07)" />
    <Circle cx={W / 2} cy={HERO_H} r={W * 0.32} fill="rgba(180,83,9,0.06)" />

    {/* Colinas — fundo */}
    <Path
      d={`M0,${HERO_H * 0.72} Q${W * 0.22},${HERO_H * 0.5} ${W * 0.42},${HERO_H * 0.64} Q${W * 0.62},${HERO_H * 0.78} ${W * 0.82},${HERO_H * 0.52} L${W},${HERO_H * 0.6} L${W},${HERO_H} L0,${HERO_H} Z`}
      fill="rgba(15,23,42,0.05)"
    />
    {/* Colinas — frente */}
    <Path
      d={`M0,${HERO_H * 0.84} Q${W * 0.18},${HERO_H * 0.74} ${W * 0.35},${HERO_H * 0.8} Q${W * 0.52},${HERO_H * 0.86} ${W * 0.68},${HERO_H * 0.72} Q${W * 0.84},${HERO_H * 0.62} ${W},${HERO_H * 0.76} L${W},${HERO_H} L0,${HERO_H} Z`}
      fill="rgba(15,23,42,0.08)"
    />

    {/* Casa esquerda */}
    <Rect x={W * 0.1} y={HERO_H * 0.65} width={W * 0.12} height={HERO_H * 0.35} fill="rgba(15,23,42,0.07)" />
    <Polygon
      points={`${W * 0.085},${HERO_H * 0.65} ${W * 0.16},${HERO_H * 0.5} ${W * 0.235},${HERO_H * 0.65}`}
      fill="rgba(15,23,42,0.1)"
    />

    {/* Prédio central */}
    <Rect x={W * 0.43} y={HERO_H * 0.38} width={W * 0.14} height={HERO_H * 0.62} fill="rgba(15,23,42,0.06)" />
    <Rect x={W * 0.455} y={HERO_H * 0.47} width="7" height="7" fill="rgba(180,83,9,0.18)" />
    <Rect x={W * 0.515} y={HERO_H * 0.47} width="7" height="7" fill="rgba(180,83,9,0.18)" />
    <Rect x={W * 0.455} y={HERO_H * 0.6} width="7" height="7" fill="rgba(180,83,9,0.1)" />
    <Rect x={W * 0.515} y={HERO_H * 0.6} width="7" height="7" fill="rgba(180,83,9,0.1)" />

    {/* Casa direita */}
    <Rect x={W * 0.71} y={HERO_H * 0.61} width={W * 0.11} height={HERO_H * 0.39} fill="rgba(15,23,42,0.07)" />
    <Polygon
      points={`${W * 0.695},${HERO_H * 0.61} ${W * 0.765},${HERO_H * 0.46} ${W * 0.835},${HERO_H * 0.61}`}
      fill="rgba(15,23,42,0.09)"
    />

    {/* Árvore esquerda */}
    <Rect x={W * 0.295} y={HERO_H * 0.72} width="3" height={HERO_H * 0.28} fill="rgba(15,23,42,0.1)" />
    <Circle cx={W * 0.297} cy={HERO_H * 0.68} r="11" fill="rgba(15,23,42,0.07)" />

    {/* Árvore direita */}
    <Rect x={W * 0.635} y={HERO_H * 0.7} width="3" height={HERO_H * 0.3} fill="rgba(15,23,42,0.1)" />
    <Circle cx={W * 0.637} cy={HERO_H * 0.66} r="11" fill="rgba(15,23,42,0.07)" />

    {/* Linha do horizonte pontilhada */}
    <Line
      x1="0" y1={HERO_H * 0.74}
      x2={W} y2={HERO_H * 0.74}
      stroke="rgba(180,83,9,0.14)"
      strokeWidth="0.8"
      strokeDasharray="5,10"
    />
  </Svg>
);

// Input com underline animado — tema claro
interface AnimatedInputProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
  autoCorrect?: boolean;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label, icon, value, onChangeText, placeholder,
  keyboardType = 'default', autoCapitalize = 'none',
  secureTextEntry = false, rightElement, autoCorrect = false,
}) => {
  const focused = useSharedValue(0);

  const underlineStyle = useAnimatedStyle(() => ({
    backgroundColor: focused.value === 1 ? '#B45309' : '#E7E5E4',
    height: focused.value === 1 ? 1.5 : 1,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: focused.value === 1 ? '#B45309' : '#A8A29E',
  }));

  return (
    <View style={iStyles.wrapper}>
      <Animated.Text style={[iStyles.label, labelStyle]}>{label}</Animated.Text>
      <View style={iStyles.row}>
        <View style={iStyles.icon}>{icon}</View>
        <TextInput
          style={iStyles.input}
          placeholder={placeholder}
          placeholderTextColor="#C8C4BF"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          onFocus={() => { focused.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }); }}
          onBlur={() => { focused.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) }); }}
        />
        {rightElement}
      </View>
      <Animated.View style={[iStyles.underline, underlineStyle]} />
    </View>
  );
};

const iStyles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.xl },
  label: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingBottom: SPACING.sm },
  icon: { marginRight: SPACING.md },
  input: { flex: 1, fontSize: 15, color: '#1C1917', fontFamily: FONTS.regular, paddingVertical: 0 },
  underline: { width: '100%', marginTop: 2 },
});

// Tela principal
export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const heroOpacity = useSharedValue(0);
  const logoY = useSharedValue(-16);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(50);

  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) });
    logoY.value = withDelay(100, withSpring(0, { damping: 18, stiffness: 90 }));
    cardOpacity.value = withDelay(250, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }));
    cardY.value = withDelay(250, withSpring(0, { damping: 18, stiffness: 90 }));
  }, []);

  const heroStyle = useAnimatedStyle(() => ({ opacity: heroOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: logoY.value }] }));
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value, transform: [{ translateY: cardY.value }] }));

  const handleLogin = async () => {
    if (!email.trim() || !senha) {
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha.');
      return;
    }
    setCarregando(true);
    try {
      await login(email.trim().toLowerCase(), senha);
    } catch (err: any) {
      const msg = err?.message || 'Verifique suas credenciais e tente novamente.';
      if (msg.includes('Invalid login credentials')) {
        Alert.alert('Erro', 'E-mail ou senha incorretos.');
      } else if (msg.includes('Email not confirmed')) {
        Alert.alert('E-mail não confirmado', 'Verifique sua caixa de entrada para confirmar seu e-mail.');
      } else {
        Alert.alert('Erro', msg);
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

        {/* Card do formulário */}
        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.titulo}>Bem-vindo de volta</Text>
          <Text style={styles.subtitulo}>Acesse sua conta para continuar</Text>

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
            placeholder="••••••••"
            secureTextEntry={!mostrarSenha}
            rightElement={
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeBtn}>
                {mostrarSenha
                  ? <EyeOff size={17} color="#A8A29E" />
                  : <Eye size={17} color="#A8A29E" />}
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={carregando}
            activeOpacity={0.85}
            style={[styles.btn, carregando && styles.btnOff]}
          >
            {carregando
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.btnTxt}>ENTRAR</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkBox}
          >
            <Text style={styles.linkTxt}>
              Não tem conta?{'  '}
              <Text style={styles.linkAccent}>Criar conta →</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
    paddingBottom: OVERLAP + SPACING.lg,
    alignItems: 'center',
  },
  logoBox: {
    alignItems: 'center',
  },
  logoLine: {
    fontSize: 36,
    fontFamily: FONTS.heading,
    color: '#0F172A',
    letterSpacing: 6,
    lineHeight: 42,
  },
  accentLine: {
    width: 36,
    height: 2,
    backgroundColor: '#B45309',
    marginTop: SPACING.md,
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 6,
  },
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
    marginBottom: SPACING.xxl,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  btn: {
    backgroundColor: '#B45309',
    paddingVertical: 15,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
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
  linkBox: {
    alignItems: 'center',
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
