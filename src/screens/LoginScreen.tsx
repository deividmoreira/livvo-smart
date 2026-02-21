import React, { useState, useEffect, useRef } from 'react';
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
import Svg, { Path, Line, Rect, Polygon } from 'react-native-svg';

import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants';
import type { AuthStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// SVG decorativo de silhuetas arquitetônicas
const SvgBackground: React.FC = () => (
  <Svg
    width={SCREEN_WIDTH}
    height={SCREEN_HEIGHT}
    style={StyleSheet.absoluteFill}
    viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT}`}
  >
    {/* Edifício 1 — torre esquerda */}
    <Rect x="20" y={SCREEN_HEIGHT * 0.45} width="60" height={SCREEN_HEIGHT * 0.55} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <Rect x="30" y={SCREEN_HEIGHT * 0.38} width="40" height={SCREEN_HEIGHT * 0.62} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    {/* Janelas edifício 1 */}
    <Rect x="35" y={SCREEN_HEIGHT * 0.42} width="8" height="10" fill="rgba(255,255,255,0.04)" />
    <Rect x="52" y={SCREEN_HEIGHT * 0.42} width="8" height="10" fill="rgba(255,255,255,0.04)" />
    <Rect x="35" y={SCREEN_HEIGHT * 0.46} width="8" height="10" fill="rgba(255,255,255,0.04)" />
    <Rect x="52" y={SCREEN_HEIGHT * 0.46} width="8" height="10" fill="rgba(255,255,255,0.04)" />
    <Rect x="35" y={SCREEN_HEIGHT * 0.50} width="8" height="10" fill="rgba(255,255,255,0.04)" />
    <Rect x="52" y={SCREEN_HEIGHT * 0.50} width="8" height="10" fill="rgba(255,255,255,0.04)" />

    {/* Edifício 2 — centro-esquerda */}
    <Rect x="100" y={SCREEN_HEIGHT * 0.35} width="80" height={SCREEN_HEIGHT * 0.65} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    <Polygon
      points={`100,${SCREEN_HEIGHT * 0.35} 140,${SCREEN_HEIGHT * 0.28} 180,${SCREEN_HEIGHT * 0.35}`}
      fill="none"
      stroke="rgba(255,255,255,0.06)"
      strokeWidth="1"
    />
    {/* Janelas edifício 2 */}
    {[0, 1, 2, 3, 4].map((row) =>
      [0, 1, 2].map((col) => (
        <Rect
          key={`b2-${row}-${col}`}
          x={110 + col * 22}
          y={SCREEN_HEIGHT * 0.38 + row * 18}
          width="12"
          height="10"
          fill="rgba(255,255,255,0.03)"
        />
      ))
    )}

    {/* Edifício 3 — direita */}
    <Rect x={SCREEN_WIDTH - 120} y={SCREEN_HEIGHT * 0.4} width="110" height={SCREEN_HEIGHT * 0.6} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <Rect x={SCREEN_WIDTH - 100} y={SCREEN_HEIGHT * 0.3} width="70" height={SCREEN_HEIGHT * 0.7} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    {[0, 1, 2, 3, 4, 5].map((row) =>
      [0, 1].map((col) => (
        <Rect
          key={`b3-${row}-${col}`}
          x={SCREEN_WIDTH - 92 + col * 28}
          y={SCREEN_HEIGHT * 0.34 + row * 18}
          width="14"
          height="10"
          fill="rgba(255,255,255,0.04)"
        />
      ))
    )}

    {/* Linha do horizonte */}
    <Line
      x1="0"
      y1={SCREEN_HEIGHT * 0.65}
      x2={SCREEN_WIDTH}
      y2={SCREEN_HEIGHT * 0.65}
      stroke="rgba(255,255,255,0.04)"
      strokeWidth="1"
    />

    {/* Linhas geométricas decorativas — canto superior */}
    <Line x1={SCREEN_WIDTH * 0.7} y1="0" x2={SCREEN_WIDTH} y2={SCREEN_HEIGHT * 0.2} stroke="rgba(180,83,9,0.12)" strokeWidth="1" />
    <Line x1={SCREEN_WIDTH * 0.85} y1="0" x2={SCREEN_WIDTH} y2={SCREEN_HEIGHT * 0.1} stroke="rgba(180,83,9,0.08)" strokeWidth="1" />
  </Svg>
);

// Input com animação de foco (underline bronze)
interface AnimatedInputProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
  autoCorrect?: boolean;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  secureTextEntry = false,
  rightElement,
  autoCorrect = false,
}) => {
  const borderAnim = useSharedValue(0);

  const underlineStyle = useAnimatedStyle(() => ({
    backgroundColor: borderAnim.value === 1
      ? '#B45309'
      : 'rgba(255,255,255,0.2)',
    height: borderAnim.value === 1 ? 1.5 : 1,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: borderAnim.value === 1
      ? '#B45309'
      : 'rgba(255,255,255,0.5)',
  }));

  return (
    <View style={inputStyles.wrapper}>
      <Animated.Text style={[inputStyles.label, labelStyle]}>{label}</Animated.Text>
      <View style={inputStyles.row}>
        <View style={inputStyles.icon}>{icon}</View>
        <TextInput
          style={inputStyles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          onFocus={() => {
            borderAnim.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
          }}
          onBlur={() => {
            borderAnim.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
          }}
        />
        {rightElement}
      </View>
      <Animated.View style={[inputStyles.underline, underlineStyle]} />
    </View>
  );
};

const inputStyles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.md,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: FONTS.regular,
    paddingVertical: 0,
  },
  underline: {
    width: '100%',
    marginTop: 2,
  },
});

// Componente principal
export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Valores de animação
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(-30);
  const subtitleOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(40);

  useEffect(() => {
    // Logo: fade-in + slide from top
    logoOpacity.value = withDelay(0, withSpring(1, { damping: 18, stiffness: 100 }));
    logoTranslateY.value = withDelay(0, withSpring(0, { damping: 18, stiffness: 100 }));

    // Subtítulo: fade-in após 200ms
    subtitleOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));

    // Card: fade-in + slide from bottom após 300ms
    cardOpacity.value = withDelay(300, withSpring(1, { damping: 18, stiffness: 100 }));
    cardTranslateY.value = withDelay(300, withSpring(0, { damping: 18, stiffness: 100 }));
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const subtitleAnimStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Gradiente de fundo navy */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={StyleSheet.absoluteFill}
      />

      {/* SVG arquitetônico decorativo */}
      <SvgBackground />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Seção do Logo */}
        <Animated.View style={[styles.logoSection, logoAnimStyle]}>
          <Text style={styles.logoText}>LIVVO</Text>
          <Text style={styles.logoText}>SMART</Text>
          <View style={styles.accentLine} />
        </Animated.View>

        <Animated.Text style={[styles.subtitulo, subtitleAnimStyle]}>
          Seu portal de imóveis premium
        </Animated.Text>

        {/* Card glassmorphism */}
        <Animated.View style={[styles.card, cardAnimStyle]}>
          <Text style={styles.cardTitulo}>Bem-vindo de volta</Text>

          {/* Input E-mail */}
          <AnimatedInput
            label="E-mail"
            icon={<Mail size={18} color="rgba(255,255,255,0.6)" />}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Input Senha */}
          <AnimatedInput
            label="Senha"
            icon={<Lock size={18} color="rgba(255,255,255,0.6)" />}
            value={senha}
            onChangeText={setSenha}
            placeholder="••••••••"
            secureTextEntry={!mostrarSenha}
            rightElement={
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeBtn}>
                {mostrarSenha
                  ? <EyeOff size={18} color="rgba(255,255,255,0.5)" />
                  : <Eye size={18} color="rgba(255,255,255,0.5)" />}
              </TouchableOpacity>
            }
          />

          {/* Botão Entrar com gradiente bronze */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={carregando}
            activeOpacity={0.85}
            style={styles.btnWrapper}
          >
            <LinearGradient
              colors={['#B45309', '#92400E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.btnGradient, carregando && styles.btnDisabled]}
            >
              {carregando
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.btnTexto}>ENTRAR</Text>}
            </LinearGradient>
          </TouchableOpacity>

          {/* Link criar conta */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkCriarConta}
          >
            <Text style={styles.linkTexto}>
              Não tem conta?{' '}
              <Text style={styles.linkDestaque}>Criar conta →</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: 38,
    fontFamily: FONTS.heading,
    color: '#FFFFFF',
    letterSpacing: 6,
    lineHeight: 44,
  },
  accentLine: {
    width: 48,
    height: 2,
    backgroundColor: '#B45309',
    marginTop: SPACING.md,
    borderRadius: 1,
  },
  subtitulo: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    marginBottom: SPACING.xxxl,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.xl,
    // Sombra suave escura
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  cardTitulo: {
    fontSize: 22,
    fontFamily: FONTS.heading,
    color: '#FFFFFF',
    marginBottom: SPACING.xl,
    letterSpacing: 0.3,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  btnWrapper: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  btnGradient: {
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    // Brilho dourado sutil
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
    letterSpacing: 2,
  },
  linkCriarConta: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  linkTexto: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.45)',
  },
  linkDestaque: {
    color: '#B45309',
    fontFamily: FONTS.medium,
  },
});
