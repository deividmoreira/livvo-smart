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
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../constants';
import type { AuthStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.logo}>Livvo Smart</Text>
          <Text style={styles.subtitulo}>Seu portal de imóveis premium</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.titulo}>Entrar</Text>

          <View style={styles.campo}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
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
            </View>
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
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
            </View>
          </View>

          <TouchableOpacity
            style={[styles.botaoEntrar, carregando && styles.botaoDesabilitado]}
            onPress={handleLogin}
            disabled={carregando}
            activeOpacity={0.85}
          >
            {carregando
              ? <ActivityIndicator color={COLORS.surface} />
              : <Text style={styles.botaoEntrarTexto}>Entrar</Text>}
          </TouchableOpacity>

          <View style={styles.divisor}>
            <View style={styles.linha} />
            <Text style={styles.divisorTexto}>ou</Text>
            <View style={styles.linha} />
          </View>

          <TouchableOpacity
            style={styles.botaoRegistro}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.botaoRegistroTexto}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logo: {
    fontSize: 32,
    fontFamily: FONTS.heading,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  subtitulo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontFamily: FONTS.regular,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.md,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xl,
    fontFamily: FONTS.heading,
  },
  campo: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.regular,
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
  botaoEntrar: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  botaoEntrarTexto: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.regular,
  },
  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  linha: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  divisorTexto: {
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  botaoRegistro: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  botaoRegistroTexto: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.regular,
  },
});
