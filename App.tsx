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

import { HomeScreen, PropertyDetailsScreen } from './src/screens';
import { COLORS } from './src/constants';

// Tipos para a navegação
export type RootStackParamList = {
  Home: undefined;
  PropertyDetails: { imovelId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Keep splash screen visible while fetching resources
SplashScreen.preventAutoHideAsync().catch(() => { });

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
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor="transparent" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
