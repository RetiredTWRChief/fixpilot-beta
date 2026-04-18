import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false, tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#E62020', tabBarInactiveTintColor: '#777777',
      tabBarLabelStyle: styles.tabLabel,
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="diagnose" options={{ title: 'Diagnose', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="wrench" size={size} color={color} /> }} />
      <Tabs.Screen name="garage" options={{ title: 'Garage', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="car-multiple" size={size} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="history" size={size} color={color} /> }} />
      <Tabs.Screen name="scanner" options={{ title: 'Scanner', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="bluetooth-connect" size={size} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: '#111111', borderTopColor: '#2A2A2A', borderTopWidth: 1, height: 68, paddingBottom: 8, paddingTop: 6 },
  tabLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
