import { ActivityIndicator, Redirect, Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { TabBarIcon, TabIcons } from '@/components/tab-bar-icon';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { ThemedView } from '@/components/themed-view';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'unspecified' ? 'light' : colorScheme];
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      initialRouteName="stage"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.accentPink,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      }}>
      <Tabs.Screen
        name="stage"
        options={{
          title: 'Stage',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={TabIcons.stage} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="children"
        options={{
          title: 'Children',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={TabIcons.children} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={TabIcons.sos} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
