import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function SubscribeScreen() {
  const router = useRouter();
  const { authHeaders } = useAuth();
  const { session_id, cancelled } = useLocalSearchParams<{ session_id?: string; cancelled?: string }>();
  const [loading, setLoading] = useState(false);
  const [subStatus, setSubStatus] = useState<any>(null);
  const [paymentResult, setPaymentResult] = useState<'success' | 'cancelled' | ''>('');
  const [polling, setPolling] = useState(false);

  useEffect(() => { fetchStatus(); }, []);

  useEffect(() => {
    if (session_id) pollPayment(session_id, 0);
    if (cancelled) setPaymentResult('cancelled');
  }, [session_id, cancelled]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API}/api/subscription-status`, { headers: authHeaders() });
      if (res.ok) setSubStatus(await res.json());
    } catch (e) {}
  };

  const pollPayment = async (sid: string, attempt: number) => {
    if (attempt >= 5) return;
    setPolling(true);
    try {
      const res = await fetch(`${API}/api/checkout-status/${sid}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.payment_status === 'paid') {
          setPaymentResult('success');
          setPolling(false);
          fetchStatus();
          return;
        }
      }
    } catch (e) {}
    setTimeout(() => pollPayment(sid, attempt + 1), 2000);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const origin = Platform.OS === 'web' ? window.location.origin : `${API}`;
      const res = await fetch(`${API}/api/subscribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ origin_url: origin }),
      });
      const data = await res.json();
      if (data.url) {
        if (Platform.OS === 'web') { window.location.href = data.url; }
        else { Linking.openURL(data.url); }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity testID="subscribe-back" onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#E5E5E5" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>FixPilot Pro</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {paymentResult === 'success' && (
          <View style={styles.successBox}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#22C55E" />
            <Text style={styles.successText}>Welcome to FixPilot Pro! You now have unlimited access.</Text>
          </View>
        )}
        {paymentResult === 'cancelled' && (
          <View style={styles.cancelBox}>
            <MaterialCommunityIcons name="close-circle-outline" size={20} color="#F59E0B" />
            <Text style={styles.cancelText}>Payment was cancelled. You can try again anytime.</Text>
          </View>
        )}
        {polling && (
          <View style={styles.pollingBox}>
            <ActivityIndicator color="#3B82F6" size="small" />
            <Text style={styles.pollingText}>Verifying payment...</Text>
          </View>
        )}

        {/* Current Status */}
        {subStatus && (
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>CURRENT PLAN</Text>
            <Text style={styles.statusPlan}>{subStatus.plan}</Text>
            {subStatus.status === 'free' && (
              <Text style={styles.statusDetail}>{subStatus.free_remaining} free diagnosis remaining</Text>
            )}
            {subStatus.status === 'pro' && subStatus.expires_at && (
              <Text style={styles.statusDetail}>Expires: {new Date(subStatus.expires_at).toLocaleDateString()}</Text>
            )}
          </View>
        )}

        {/* Pro Plan Card */}
        <View style={styles.proCard}>
          <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>
          <Text style={styles.proTitle}>FixPilot Pro</Text>
          <Text style={styles.proPrice}>$9.99<Text style={styles.proPeriod}> / month</Text></Text>

          <View style={styles.featureList}>
            {[
              { icon: 'infinity', text: 'Unlimited AI diagnoses' },
              { icon: 'car-wrench', text: 'Full vehicle history' },
              { icon: 'clipboard-check-outline', text: 'Recorded issues & resolutions' },
              { icon: 'tools', text: 'Complete DIY repair guides' },
              { icon: 'map-marker-radius', text: 'Nearby mechanics finder' },
              { icon: 'play-circle-outline', text: 'Repair instruction videos' },
              { icon: 'bluetooth-connect', text: 'OBD2 scanner integration' },
              { icon: 'bell-outline', text: 'Push notifications' },
            ].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <MaterialCommunityIcons name={f.icon as any} size={18} color="#22C55E" />
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {subStatus?.status !== 'pro' && (
            <TouchableOpacity testID="subscribe-button" style={[styles.subscribeBtn, loading && styles.subscribeBtnDisabled]}
              onPress={handleSubscribe} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" size="small" /> :
                <Text style={styles.subscribeBtnText}>Subscribe — $9.99/mo</Text>}
            </TouchableOpacity>
          )}
          {subStatus?.status === 'pro' && (
            <View style={styles.activeBox}>
              <MaterialCommunityIcons name="check-decagram" size={20} color="#22C55E" />
              <Text style={styles.activeText}>You're a Pro member!</Text>
            </View>
          )}
        </View>

        {/* Free Plan Comparison */}
        <View style={styles.freeCard}>
          <Text style={styles.freeTitle}>Free Tier</Text>
          <View style={styles.featureList}>
            {[
              { icon: 'numeric-1-circle-outline', text: '1 free diagnosis', color: '#A3A3A3' },
              { icon: 'tools', text: 'Basic DIY fix info', color: '#A3A3A3' },
              { icon: 'map-marker-outline', text: 'Local mechanics (one-time)', color: '#A3A3A3' },
            ].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <MaterialCommunityIcons name={f.icon as any} size={18} color={f.color} />
                <Text style={[styles.featureText, { color: '#737373' }]}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.disclaimer}>Powered by Stripe. Cancel anytime. Domain: tryfixpilot.com</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333333' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  content: { padding: 20 },
  successBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1F1F1F', borderWidth: 1, borderColor: '#22C55E', borderRadius: 4, padding: 16, marginBottom: 16 },
  successText: { fontSize: 14, color: '#22C55E', flex: 1 },
  cancelBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1F1F1F', borderWidth: 1, borderColor: '#F59E0B', borderRadius: 4, padding: 14, marginBottom: 16 },
  cancelText: { fontSize: 13, color: '#F59E0B', flex: 1 },
  pollingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 12, marginBottom: 16 },
  pollingText: { fontSize: 13, color: '#3B82F6' },
  statusCard: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#333333', borderRadius: 4, padding: 16, marginBottom: 16 },
  statusLabel: { fontSize: 10, fontWeight: '700', color: '#737373', letterSpacing: 2, marginBottom: 6 },
  statusPlan: { fontSize: 18, fontWeight: '500', color: '#FFFFFF' },
  statusDetail: { fontSize: 13, color: '#A3A3A3', marginTop: 4 },
  proCard: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#22C55E', borderRadius: 4, padding: 20, marginBottom: 16 },
  proBadge: { backgroundColor: '#22C55E', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 12 },
  proBadgeText: { fontSize: 11, fontWeight: '700', color: '#000', letterSpacing: 1 },
  proTitle: { fontSize: 22, fontWeight: '300', color: '#FFFFFF', marginBottom: 4 },
  proPrice: { fontSize: 28, fontWeight: '300', color: '#FFFFFF' },
  proPeriod: { fontSize: 14, color: '#737373' },
  featureList: { marginTop: 16, gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, color: '#E5E5E5' },
  subscribeBtn: { backgroundColor: '#22C55E', borderRadius: 4, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  subscribeBtnDisabled: { opacity: 0.5 },
  subscribeBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
  activeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, padding: 12, backgroundColor: '#0A0A0A', borderRadius: 4 },
  activeText: { fontSize: 14, fontWeight: '600', color: '#22C55E' },
  freeCard: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#333333', borderRadius: 4, padding: 20, marginBottom: 16 },
  freeTitle: { fontSize: 18, fontWeight: '500', color: '#A3A3A3', marginBottom: 4 },
  disclaimer: { fontSize: 11, color: '#737373', textAlign: 'center', marginTop: 8 },
});
