/**
 * Navigation (README §3) : 5 onglets en bas + FAB d'ajout + écrans en pile
 * (fiche détail, ajout, noter une récolte, paramètres).
 */
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../components/Icon';
import { CatalogueScreen } from '../screens/CatalogueScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { makePlaceholder } from '../screens/Placeholder';
import { colors, fonts, shadow } from '../theme/tokens';
import type { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const AccueilScreen = makePlaceholder('Accueil', 'Tableau de bord — stats, à semer, à surveiller');
const RecoltesScreen = makePlaceholder('Récoltes', 'Journal de récupération des semences');
const InventaireScreen = makePlaceholder('Inventaire', "Zones d'entreposage et remplissage");
const CalendrierScreen = makePlaceholder('Calendrier', 'Vue par mois + agenda annuel');

const AjoutScreen = makePlaceholder('Ajouter une graine', 'Assistant IA + scan + saisie manuelle', true);
const NoterRecolteScreen = makePlaceholder('Noter une récolte', 'Variété, méthode, statut, notes', true);
const ParametresScreen = makePlaceholder('Paramètres', 'Clé OpenRouter (stockage local)', true);

const TAB_META: Array<{ name: keyof TabParamList; label: string; icon: IconName }> = [
  { name: 'Accueil', label: 'Accueil', icon: 'home' },
  { name: 'Catalogue', label: 'Catalogue', icon: 'list' },
  { name: 'Recoltes', label: 'Récoltes', icon: 'harvest' },
  { name: 'Inventaire', label: 'Inventaire', icon: 'box' },
  { name: 'Calendrier', label: 'Calendrier', icon: 'calendar' },
];

/** Barre d'onglets personnalisée (fond crème, icônes outline, actif = vert). */
function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: 10 + insets.bottom }]}>
      {state.routes.map((route, index) => {
        const meta = TAB_META.find((m) => m.name === route.name)!;
        const focused = state.index === index;
        const color = focused ? colors.primary : colors.navInactive;
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
          >
            <Icon name={meta.icon} size={22} color={color} />
            <Text style={[styles.tabLabel, { color }]}>{meta.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** FAB d'ajout, masqué sur les écrans de détail / ajout / etc. (rendu seulement sur les onglets). */
function Fab() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: 78 + insets.bottom }]}
      activeOpacity={0.85}
      onPress={() => nav.navigate('Ajout')}
    >
      <Icon name="plus" size={25} color={colors.onPrimary} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

function Tabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tab.Screen name="Accueil" component={AccueilScreen} />
        <Tab.Screen name="Catalogue" component={CatalogueScreen} />
        <Tab.Screen name="Recoltes" component={RecoltesScreen} />
        <Tab.Screen name="Inventaire" component={InventaireScreen} />
        <Tab.Screen name="Calendrier" component={CalendrierScreen} />
      </Tab.Navigator>
      <Fab />
    </View>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Ajout" component={AjoutScreen} />
      <Stack.Screen name="NoterRecolte" component={NoterRecolteScreen} />
      <Stack.Screen name="Parametres" component={ParametresScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 9,
    paddingHorizontal: 8,
    backgroundColor: colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabItem: { alignItems: 'center', gap: 4, width: 62 },
  tabLabel: { fontFamily: fonts.sansSemi, fontSize: 9.5 },
  fab: {
    position: 'absolute',
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primaryGradTo,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
});
