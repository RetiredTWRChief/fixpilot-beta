import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { LOGO_BASE64 } from '../../lib/logo-base64';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;
const FREE_LIMIT = 1;

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, authHeaders, token } = useAuth();
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [engine, setEngine] = useState('');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentDiagnoses, setRecentDiagnoses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [subStatus, setSubStatus] = useState<any>(null);
  const [paywallError, setPaywallError] = useState('');
  const [localUsed, setLocalUsed] = useState(0);

  const fetchRecent = useCallback(async () => {
    try {
      const headers: any = {};
      if (token) Object.assign(headers, authHeaders());
      const res = await fetch(`${API}/api/history`, { headers });
      if (res.ok) setRecentDiagnoses((await res.json()).slice(0, 3));
    } catch (e) {}
  }, [token, authHeaders]);

  useEffect(() => { fetchRecent(); fetchSubStatus(); loadLocalUsage(); }, []);

  const loadLocalUsage = async () => {
    const val = await AsyncStorage.getItem('fixpilot_diag_count');
    setLocalUsed(val ? parseInt(val, 10) : 0);
  };

  const fetchSubStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/subscription-status`, { headers: authHeaders() });
      if (res.ok) setSubStatus(await res.json());
    } catch (e) {}
  };

  const isPro = subStatus?.status === 'pro';
  const freeRemaining = isPro ? -1 : Math.max(0, FREE_LIMIT - localUsed);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecent();
    await fetchSubStatus();
    setRefreshing(false);
  }, [fetchRecent]);

  const handleDiagnose = async () => {
    if (!issue.trim()) return;
    if (!isPro && freeRemaining <= 0) {
      setPaywallError('Free limit reached. Upgrade to FixPilot Pro for unlimited diagnoses.');
      return;
    }
    setLoading(true);
    setPaywallError('');
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) Object.assign(headers, authHeaders());
      const res = await fetch(`${API}/api/diagnose`, {
        method: 'POST', headers,
        body: JSON.stringify({ vehicle: { year, make, model, engine }, issue: issue.trim() }),
      });
      const data = await res.json();
      if (res.status === 403) {
        setPaywallError(data.detail || 'Upgrade required');
        setLoading(false);
        return;
      }
      if (data.id) {
        const newCount = localUsed + 1;
        setLocalUsed(newCount);
        await AsyncStorage.setItem('fixpilot_diag_count', newCount.toString());
        router.push({ pathname: '/results', params: { id: data.id } });
      }
    } catch (e) {
      console.error('Diagnosis error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={s.flex} contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E62020" />}>

          {/* Hero Header with Logo */}
          <View style={s.hero}>
            <View style={s.heroTop}>
              <Image source={{ uri: LOGO_BASE64 }} style={s.logo} resizeMode="contain" />
              <View style={s.heroTextCol}>
                <Text style={s.heroTitle}>FixPilot</Text>
                <Text style={s.heroTagline}>Your AI Mechanic</Text>
                <Text style={s.heroSub}>Diagnose <Text style={s.redDot}>·</Text> Repair <Text style={s.redDot}>·</Text> Save Money</Text>
              </View>
              {user ? (
                <TouchableOpacity testID="logout-button" onPress={logout} style={s.logoutBtn}>
                  <MaterialCommunityIcons name="logout" size={18} color="#777" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Status Bar */}
            <View style={s.statusBar}>
              {isPro ? (
                <View style={s.proBadge}><Text style={s.proBadgeText}>PRO</Text></View>
              ) : (
                <TouchableOpacity testID="upgrade-button" style={s.upgradeBtn} onPress={() => router.push('/subscribe')}>
                  <MaterialCommunityIcons name="crown" size={14} color="#E62020" />
                  <Text style={s.upgradeBtnText}>Upgrade to Pro</Text>
                </TouchableOpacity>
              )}
              {!isPro && <Text style={s.freeCount}>{freeRemaining} free diagnosis left</Text>}
              {user && <Text style={s.userGreet}>Hi, {user.name}</Text>}
            </View>
          </View>

          {/* Vehicle Input */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <MaterialCommunityIcons name="car" size={16} color="#E62020" />
              <Text style={s.sectionLabel}>VEHICLE DETAILS</Text>
            </View>
            <View style={s.row}>
              <TextInput testID="input-year" style={s.input} placeholder="Year" placeholderTextColor="#555" value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} />
              <TextInput testID="input-make" style={s.input} placeholder="Make" placeholderTextColor="#555" value={make} onChangeText={setMake} />
            </View>
            <View style={s.row}>
              <TextInput testID="input-model" style={s.input} placeholder="Model" placeholderTextColor="#555" value={model} onChangeText={setModel} />
              <TextInput testID="input-engine" style={s.input} placeholder="Engine (opt)" placeholderTextColor="#555" value={engine} onChangeText={setEngine} />
            </View>
          </View>

          {/* Issue Input */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#E62020" />
              <Text style={s.sectionLabel}>WHAT'S THE PROBLEM?</Text>
            </View>
            <TextInput testID="input-issue" style={[s.input, s.textArea]}
              placeholder="e.g. My car is overheating and I smell coolant near the front..."
              placeholderTextColor="#555" value={issue} onChangeText={setIssue}
              multiline numberOfLines={4} textAlignVertical="top" />
          </View>

          {/* Paywall */}
          {paywallError ? (
            <TouchableOpacity testID="paywall-upgrade" style={s.paywallCard} onPress={() => { setPaywallError(''); router.push('/subscribe'); }}>
              <MaterialCommunityIcons name="lock" size={22} color="#E62020" />
              <View style={s.paywallInfo}>
                <Text style={s.paywallTitle}>Free limit reached</Text>
                <Text style={s.paywallText}>Upgrade to FixPilot Pro for unlimited diagnoses — $9.99/mo</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#E62020" />
            </TouchableOpacity>
          ) : null}

          {/* CTA Button */}
          <TouchableOpacity testID="diagnose-button"
            style={[s.ctaBtn, (!issue.trim() || loading) && s.ctaBtnDisabled]}
            onPress={handleDiagnose} disabled={!issue.trim() || loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#FFF" size="small" /> :
              <View style={s.ctaInner}>
                <MaterialCommunityIcons name="magnify" size={22} color="#FFF" />
                <Text style={s.ctaText}>Get Diagnosis</Text>
              </View>}
          </TouchableOpacity>

          {/* Recent */}
          {recentDiagnoses.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#E62020" />
                <Text style={s.sectionLabel}>RECENT DIAGNOSES</Text>
              </View>
              {recentDiagnoses.map((d: any) => (
                <TouchableOpacity testID={`recent-${d.id}`} key={d.id} style={s.recentCard}
                  onPress={() => router.push({ pathname: '/results', params: { id: d.id } })}>
                  <View style={s.recentLeft}>
                    <View style={s.recentIcon}>
                      <MaterialCommunityIcons name="car-wrench" size={16} color="#E62020" />
                    </View>
                    <View style={s.recentInfo}>
                      <Text style={s.recentVehicle} numberOfLines={1}>{d.vehicle_summary || 'Vehicle'}</Text>
                      <Text style={s.recentIssue} numberOfLines={1}>{d.issue}</Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} color="#555" />
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111111' },
  flex: { flex: 1 },
  scroll: { padding: 20 },
  // Hero
  hero: { marginBottom: 24 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: { width: 72, height: 72, borderRadius: 12 },
  heroTextCol: { flex: 1 },
  heroTitle: { fontSize: 30, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
  heroTagline: { fontSize: 13, color: '#CCCCCC', fontWeight: '500', marginTop: 1 },
  heroSub: { fontSize: 11, color: '#777', marginTop: 2 },
  redDot: { color: '#E62020', fontWeight: '700' },
  logoutBtn: { padding: 8, borderWidth: 1, borderColor: '#333', borderRadius: 6 },
  // Status Bar
  statusBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  proBadge: { backgroundColor: '#E62020', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 3 },
  proBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 1.5 },
  upgradeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1.5, borderColor: '#E62020', borderRadius: 6 },
  upgradeBtnText: { fontSize: 11, fontWeight: '700', color: '#E62020' },
  freeCount: { fontSize: 12, color: '#777' },
  userGreet: { fontSize: 12, color: '#999', marginLeft: 'auto' },
  // Sections
  section: { marginBottom: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#999', letterSpacing: 1.5 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  input: {
    flex: 1, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 8,
    color: '#FFF', fontSize: 15, paddingHorizontal: 14, paddingVertical: 12,
  },
  textArea: { minHeight: 100, paddingTop: 14 },
  // Paywall
  paywallCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#E62020', borderRadius: 8, padding: 14, marginBottom: 14 },
  paywallInfo: { flex: 1 },
  paywallTitle: { fontSize: 14, fontWeight: '700', color: '#E62020' },
  paywallText: { fontSize: 12, color: '#AAA', marginTop: 2 },
  // CTA
  ctaBtn: { backgroundColor: '#E62020', borderRadius: 10, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  ctaBtnDisabled: { opacity: 0.35 },
  ctaInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  // Recent
  recentCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 8, padding: 14, marginBottom: 8 },
  recentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  recentIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  recentInfo: { flex: 1 },
  recentVehicle: { fontSize: 13, color: '#CCC', fontWeight: '600' },
  recentIssue: { fontSize: 12, color: '#777', marginTop: 2 },
});
