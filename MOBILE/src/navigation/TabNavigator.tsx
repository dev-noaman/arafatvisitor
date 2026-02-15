/**
 * Tab Navigator
 * Bottom tab navigation with stack navigators for each tab
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
  PreRegisterTab: undefined;
  QRScanTab: undefined;
  ProfileTab: undefined;
};

// Stack Param Types
export type DashboardStackParamList = {
  DashboardHome: undefined;
  VisitorDetail: { sessionId: string; visitor?: any };
};

export type VisitorsStackParamList = {
  VisitorsList: undefined;
  VisitorDetail: { sessionId: string; visitor?: any };
};

export type PreRegisterStackParamList = {
  PreRegisterList: undefined;
  PreRegDetail: { preReg: any };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  ChangePassword: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Dashboard Stack
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashboardStack.Screen name="VisitorDetail" component={VisitorDetailScreen} />
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

// PreRegister Stack
const PreRegStack = createNativeStackNavigator<PreRegisterStackParamList>();
function PreRegStackScreen() {
  return (
    <PreRegStack.Navigator screenOptions={{ headerShown: false }}>
      <PreRegStack.Screen name="PreRegisterList" component={PreRegisterScreen} />
      <PreRegStack.Screen name="PreRegDetail" component={PreRegDetailScreen} />
    </PreRegStack.Navigator>
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

// Tab icon helper
const TabIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => {
  const icons: Record<string, string> = {
    DashboardTab: '▣',
    VisitorsTab: '👤',
    PreRegisterTab: '📋',
    QRScanTab: '⊞',
    ProfileTab: '⚙',
  };
  return <Text style={[styles.tabIcon, { color }]}>{icons[name] || '•'}</Text>;
};

export const TabNavigator: React.FC = () => {
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: isDarkMode ? colors.dark.card : colors.light.card },
        ],
        tabBarActiveTintColor: colors.brand[500],
        tabBarInactiveTintColor: isDarkMode ? colors.dark.text.muted : colors.light.text.muted,
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="VisitorsTab"
        component={VisitorsStackScreen}
        options={{ tabBarLabel: 'Visitors' }}
      />
      <Tab.Screen
        name="PreRegisterTab"
        component={PreRegStackScreen}
        options={{ tabBarLabel: 'Pre-Register' }}
      />
      <Tab.Screen
        name="QRScanTab"
        component={QRScannerScreen}
        options={{ tabBarLabel: 'QR Scan' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: 4,
    height: 56,
  },
  tabIcon: {
    fontSize: 22,
  },
});
