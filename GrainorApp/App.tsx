/**
 * Grainor — point d'entrée.
 * Charge les polices (Newsreader serif + Hanken Grotesk sans), monte le store
 * global et la navigation. L'app reste hors-ligne par défaut ; rien n'est rendu
 * tant que les polices et les données persistées ne sont pas prêtes.
 */
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import {
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
  Newsreader_600SemiBold,
  useFonts,
} from '@expo-google-fonts/newsreader';
import { NavigationContainer, type Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppProvider, useApp } from './src/store/AppContext';
import { colors, fonts } from './src/theme/tokens';

// Thème React Navigation aligné sur les tokens (fond crème, pas de blanc cassé).
const navTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
  fonts: {
    regular: { fontFamily: fonts.sans, fontWeight: '400' },
    medium: { fontFamily: fonts.sansMedium, fontWeight: '500' },
    bold: { fontFamily: fonts.sansSemi, fontWeight: '600' },
    heavy: { fontFamily: fonts.sansBold, fontWeight: '700' },
  },
};

/** Rendu de la navigation une fois le store prêt (données persistées chargées). */
function Root() {
  const { ready } = useApp();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium,
    Newsreader_600SemiBold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
