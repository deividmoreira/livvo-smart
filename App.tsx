import React, { useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_700Bold
} from '@expo-google-fonts/playfair-display';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold
} from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/constants';

// Screens — Main
import { HomeScreen, PropertyDetailsScreen } from './src/screens';
import { PerfilScreen } from './src/screens/PerfilScreen';
import { FavoritosScreen } from './src/screens/FavoritosScreen';

// Screens — Auth
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';

// Screens — Corretor
import { DashboardCorretorScreen } from './src/screens/corretor/DashboardCorretorScreen';
import { CriarEditarImovelScreen } from './src/screens/corretor/CriarEditarImovelScreen';

// Screens — Admin
import { AdminScreen } from './src/screens/admin/AdminScreen';
import { GerenciarUsuariosScreen } from './src/screens/admin/GerenciarUsuariosScreen';

// Tipos para a navegação
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  PropertyDetails: { imovelId: string };
  Perfil: undefined;
  Favoritos: undefined;
  DashboardCorretor: undefined;
  CriarEditarImovel: { imovelId?: string };
  Admin: undefined;
  GerenciarUsuarios: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

SplashScreen.preventAutoHideAsync().catch(() => { });

const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: COLORS.background },
      animation: 'slide_from_right',
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const MainNavigator = () => (
  <MainStack.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: COLORS.background },
      animation: 'slide_from_right',
    }}
  >
    <MainStack.Screen name="Home" component={HomeScreen} />
    <MainStack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
    <MainStack.Screen name="Perfil" component={PerfilScreen} />
    <MainStack.Screen name="Favoritos" component={FavoritosScreen} />
    <MainStack.Screen name="DashboardCorretor" component={DashboardCorretorScreen} />
    <MainStack.Screen name="CriarEditarImovel" component={CriarEditarImovelScreen} />
    <MainStack.Screen name="Admin" component={AdminScreen} />
    <MainStack.Screen name="GerenciarUsuarios" component={GerenciarUsuariosScreen} />
  </MainStack.Navigator>
);

const RootNavigator = () => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
  }

  return usuario ? <MainNavigator /> : <AuthNavigator />;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor="transparent" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
