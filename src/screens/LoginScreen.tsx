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
  ActivityIndicator,
  useWindowDimensions,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, Lock, Eye, EyeOff, Trees } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';

import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { SPACING, BORDER_RADIUS, FONTS } from '../constants';
import type { AuthStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

// Rural/Nature high-class real estate imagery
const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2000&q=80';

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
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label, icon, value, onChangeText, placeholder,
  keyboardType = 'default', autoCapitalize = 'none',
  secureTextEntry = false, rightElement,
}) => {
  const focused = useSharedValue(0);

  const labelStyle = useAnimatedStyle(() => ({
    color: focused.value === 1 ? '#166534' : '#475569',
  }));

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: focused.value === 1 ? '#166534' : '#CBD5E1',
    backgroundColor: focused.value === 1 ? '#FFFFFF' : 'rgba(248, 250, 252, 0.7)',
  }));

  return (
    <View style={iStyles.wrapper}>
      <Animated.Text style={[iStyles.label, labelStyle]}>{label}</Animated.Text>
      <Animated.View style={[iStyles.inputContainer, containerStyle]}>
        <View style={iStyles.icon}>{icon}</View>
        <TextInput
          style={iStyles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          onFocus={() => { focused.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) }); }}
          onBlur={() => { focused.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.exp) }); }}
        />
        {rightElement}
      </Animated.View>
    </View>
  );
};

const iStyles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.lg },
  label: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 52,
    borderWidth: 1.5,
  },
  icon: { marginRight: SPACING.sm },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontFamily: FONTS.regular,
    height: '100%',
  },
});

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const { width } = useWindowDimensions();

  const isWebWide = width >= 768;

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !senha) {
      showAlert('Campos obrigatórios', 'Preencha e-mail e senha.', undefined, 'warning');
      return;
    }
    setCarregando(true);
    try {
      await login(email.trim().toLowerCase(), senha);
    } catch (err: any) {
      const msg = err?.message || 'Verifique suas credenciais e tente novamente.';
      if (msg.includes('Invalid login credentials')) {
        showAlert('Erro', 'E-mail ou senha incorretos.', undefined, 'error');
      } else if (msg.includes('Email not confirmed')) {
        showAlert('E-mail não confirmado', 'Verifique sua caixa de entrada.', undefined, 'warning');
      } else {
        showAlert('Erro', msg, undefined, 'error');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: BACKGROUND_IMAGE }}
      style={styles.root}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View
                entering={FadeInDown.duration(800).springify().damping(14)}
                style={[
                  styles.glassCard,
                  isWebWide && styles.glassCardWeb
                ]}
              >
                <View style={styles.headerContainer}>
                  <View style={styles.logoRow}>
                    <Trees size={36} color="#166534" />
                  </View>
                  <Text style={styles.logoText}>LIVVO SMART</Text>
                  <Text style={styles.taglineText}>Qualidade de vida e natureza{'\n'}Sua nova história começa aqui.</Text>
                </View>

                <AnimatedInput
                  label="E-mail"
                  icon={<Mail size={18} color="#64748B" />}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <AnimatedInput
                  label="Senha"
                  icon={<Lock size={18} color="#64748B" />}
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="••••••••"
                  secureTextEntry={!mostrarSenha}
                  rightElement={
                    <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeBtn}>
                      {mostrarSenha
                        ? <EyeOff size={18} color="#64748B" />
                        : <Eye size={18} color="#64748B" />}
                    </TouchableOpacity>
                  }
                />

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={carregando}
                  activeOpacity={0.8}
                  style={[styles.btn, carregando && styles.btnOff]}
                >
                  {carregando
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={styles.btnTxt}>ACESSAR</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  style={styles.linkBox}
                >
                  <Text style={styles.linkTxt}>
                    Quer viver melhor?{' '}
                    <Text style={styles.linkAccent}>Crie sua conta</Text>
                  </Text>
                </TouchableOpacity>

              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)', // Darken background slightly to ensure readability
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  glassCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    } as any),
  },
  glassCardWeb: {
    padding: 48,
    borderRadius: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  logoText: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    color: '#166534', // Nature green for brand color
    letterSpacing: 4,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  taglineText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  btn: {
    backgroundColor: '#166534', // Nature green
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnOff: { opacity: 0.7 },
  btnTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
    letterSpacing: 1.5,
  },
  linkBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  linkTxt: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#64748B',
  },
  linkAccent: {
    color: '#166534',
    fontFamily: FONTS.bold,
  },
});
