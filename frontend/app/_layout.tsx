import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '../lib/auth-context';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function usePushNotifications() {
  const { token: authToken } = useAuth();
  const router = useRouter();
  const responseListener = useRef<any>();

  useEffect(() => {
    if (!authToken) return;
    registerForPush(authToken);
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'diagnosis' && data?.id) {
        router.push({ pathname: '/results', params: { id: data.id as string } });
      }
    });
    return () => { if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current); };
  }, [authToken]);
}

async function registerForPush(authToken: string) {
  try {
    if (Platform.OS === 'web') return;
    if (!Device.isDevice) return;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;
    const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
    if (pushToken) {
      fetch(`${API}/api/push-token`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ push_token: pushToken }),
      }).catch(() => {});
    }
  } catch (e) {}
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  usePushNotifications();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'forgot-password';
    if (!user && !inAuth) {
      router.replace('/login');
    } else if (user && inAuth) {
      router.replace('/');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#A3A3A3" size="large" />
        <Text style={styles.loadingText}>Loading FixPilot...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="results" options={{ animation: 'none' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#737373', fontSize: 14, marginTop: 12 },
});
