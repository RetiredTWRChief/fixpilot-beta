import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarActiveTintColor: '#FFFFFF', tabBarInactiveTintColor: '#737373', tabBarLabelStyle: styles.tabLabel }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="diagnose" options={{ title: 'Diagnose', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="wrench-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="garage" options={{ title: 'Garage', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="car-multiple" size={size} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="history" size={size} color={color} /> }} />
      <Tabs.Screen name="scanner" options={{ title: 'Scanner', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="bluetooth-connect" size={size} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: '#141414', borderTopColor: '#333333', borderTopWidth: 1, height: 64, paddingBottom: 8, paddingTop: 4 },
  tabLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
});
