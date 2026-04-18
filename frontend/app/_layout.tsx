import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, Text, Platform, Image } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { initI18n } from '../lib/i18n';
import { LOGO_BASE64 } from '../lib/logo-base64';
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
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="results" options={{ animation: 'none' }} />
      <Stack.Screen name="subscribe" options={{ animation: 'none' }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return (
      <View style={styles.splash}>
        <Image source={{ uri: LOGO_BASE64 }} style={styles.splashLogo} resizeMode="contain" />
        <Text style={styles.splashTitle}>FixPilot</Text>
        <Text style={styles.splashTagline}>Your AI Mechanic</Text>
        <ActivityIndicator color="#E62020" size="small" style={styles.splashSpinner} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#777', fontSize: 14, marginTop: 12 },
  splash: { flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  splashLogo: { width: 120, height: 120, borderRadius: 20 },
  splashTitle: { fontSize: 36, fontWeight: '700', color: '#FFF', marginTop: 20, letterSpacing: -0.5 },
  splashTagline: { fontSize: 14, color: '#999', marginTop: 4, letterSpacing: 1 },
  splashSpinner: { marginTop: 32 },
});
