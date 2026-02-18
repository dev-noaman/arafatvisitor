/**
 * Tab Navigator
 * Bottom tab navigation matching Stitch design specs
 * Features: elevated center QR button, 5 tabs (Home, Visitors, QR, Alerts, Profile)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../store/uiStore';
import { colors } from '../theme';

// Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import VisitorsListScreen from '../screens/main/VisitorsListScreen';
import VisitorDetailScreen from '../screens/main/VisitorDetailScreen';
import PreRegisterScreen from '../screens/main/PreRegisterScreen';
import PreRegDetailScreen from '../screens/main/PreRegDetailScreen';
import QRScannerScreen from '../screens/modals/QRScannerScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ChangePasswordScreen from '../screens/modals/ChangePasswordScreen';

// Tab Param Types
export type TabParamList = {
  DashboardTab: undefined;
  VisitorsTab: undefined;
  QRScanTab: undefined;
  ProfileTab: undefined;
};

// Stack Param Types
export type DashboardStackParamList = {
  DashboardHome: undefined;
  VisitorDetail: { sessionId: string; visitor?: any };
  PreRegisterList: undefined;
  PreRegDetail: { preReg: any };
};

export type VisitorsStackParamList = {
  VisitorsList: undefined;
  VisitorDetail: { sessionId: string; visitor?: any };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  ChangePassword: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Dashboard Stack (includes Pre-Register as sub-screen)
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashboardStack.Screen name="VisitorDetail" component={VisitorDetailScreen} />
      <DashboardStack.Screen name="PreRegisterList" component={PreRegisterScreen} />
      <DashboardStack.Screen name="PreRegDetail" component={PreRegDetailScreen} />
    </DashboardStack.Navigator>
  );
}

// Visitors Stack
const VisitorsStack = createNativeStackNavigator<VisitorsStackParamList>();
function VisitorsStackScreen() {
  return (
    <VisitorsStack.Navigator screenOptions={{ headerShown: false }}>
      <VisitorsStack.Screen name="VisitorsList" component={VisitorsListScreen} />
      <VisitorsStack.Screen name="VisitorDetail" component={VisitorDetailScreen} />
    </VisitorsStack.Navigator>
  );
}

// Profile Stack
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </ProfileStack.Navigator>
  );
}

// Tab icon/label mapping per Stitch design
const TAB_CONFIG: Record<string, { icon: keyof typeof MaterialIcons.glyphMap; label: string }> = {
  DashboardTab: { icon: 'dashboard', label: 'Home' },
  VisitorsTab: { icon: 'group', label: 'Visitors' },
  QRScanTab: { icon: 'qr-code-scanner', label: 'QR' },
  ProfileTab: { icon: 'person', label: 'Profile' },
};

/** Custom tab bar matching Stitch design — elevated center QR button */
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: isDarkMode ? colors.dark.card : '#FFFFFF',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          borderTopColor: isDarkMode ? '#374151' : '#F3F4F6',
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isCenter = route.name === 'QRScanTab';
        const config = TAB_CONFIG[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isCenter) {
          // Elevated center QR button per Stitch design
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.85}
              style={styles.centerButton}
            >
              <View style={styles.centerButtonInner}>
                <MaterialIcons name="qr-code-scanner" size={28} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          );
        }

        const tintColor = isFocused
          ? colors.brand[500]
          : isDarkMode
          ? '#9CA3AF'
          : '#9CA3AF';

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItem}
          >
            <MaterialIcons name={config.icon} size={26} color={tintColor} />
            <View style={{ height: 2 }} />
            <View>
              <Text style={[styles.tabLabel, { color: tintColor }]}>{config.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStackScreen} />
      <Tab.Screen name="VisitorsTab" component={VisitorsStackScreen} />
      <Tab.Screen name="QRScanTab" component={QRScannerScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Outfit_500Medium',
  },
  centerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  centerButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#465FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#465FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
});
