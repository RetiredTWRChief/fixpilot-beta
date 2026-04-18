import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, authHeaders } = useAuth();
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

  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/history`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRecentDiagnoses(data.slice(0, 3));
      }
    } catch (e) {}
  }, [authHeaders]);

  useEffect(() => { fetchRecent(); fetchSubStatus(); }, [fetchRecent]);

  const fetchSubStatus = async () => {
    try {
      const res = await fetch(`${API}/api/subscription-status`, { headers: authHeaders() });
      if (res.ok) setSubStatus(await res.json());
    } catch (e) {}
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecent();
    setRefreshing(false);
  }, [fetchRecent]);

  const handleDiagnose = async () => {
    if (!issue.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ vehicle: { year, make, model, engine }, issue: issue.trim() }),
      });
      const data = await res.json();
      if (res.status === 403) {
        setPaywallError(data.detail || 'Upgrade required');
        setLoading(false);
        return;
      }
      if (data.id) router.push({ pathname: '/results', params: { id: data.id } });
    } catch (e) {
      console.error('Diagnosis error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A3A3A3" />}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <View style={styles.logoRow}>
                  <MaterialCommunityIcons name="wrench" size={28} color="#E5E5E5" />
                  <Text style={styles.logoText}>FixPilot</Text>
                </View>
                {user && <Text style={styles.greeting}>Welcome, {user.name}</Text>}
              </View>
              <TouchableOpacity testID="logout-button" onPress={logout} style={styles.logoutBtn}>
                <MaterialCommunityIcons name="logout" size={20} color="#737373" />
              </TouchableOpacity>
            </View>
            {/* Subscription Badge */}
            {subStatus && (
              <View style={styles.subRow}>
                {subStatus.status === 'pro' ? (
                  <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>
                ) : (
                  <TouchableOpacity testID="upgrade-button" style={styles.upgradeBtn} onPress={() => router.push('/subscribe')}>
                    <MaterialCommunityIcons name="crown" size={14} color="#F59E0B" />
                    <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
                  </TouchableOpacity>
                )}
                {subStatus.status === 'free' && (
                  <Text style={styles.freeInfo}>{subStatus.free_remaining} free diagnosis left</Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>VEHICLE</Text>
            <View style={styles.row}>
              <View style={styles.inputHalf}>
                <TextInput testID="input-year" style={styles.input} placeholder="Year" placeholderTextColor="#737373" value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} />
              </View>
              <View style={styles.inputHalf}>
                <TextInput testID="input-make" style={styles.input} placeholder="Make" placeholderTextColor="#737373" value={make} onChangeText={setMake} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.inputHalf}>
                <TextInput testID="input-model" style={styles.input} placeholder="Model" placeholderTextColor="#737373" value={model} onChangeText={setModel} />
              </View>
              <View style={styles.inputHalf}>
                <TextInput testID="input-engine" style={styles.input} placeholder="Engine (opt)" placeholderTextColor="#737373" value={engine} onChangeText={setEngine} />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DESCRIBE THE ISSUE</Text>
            <TextInput testID="input-issue" style={[styles.input, styles.textArea]}
              placeholder="e.g. My car is overheating and I smell coolant..."
              placeholderTextColor="#737373" value={issue} onChangeText={setIssue} multiline numberOfLines={4} textAlignVertical="top" />
          </View>

          {paywallError ? (
            <TouchableOpacity testID="paywall-upgrade" style={styles.paywallCard} onPress={() => { setPaywallError(''); router.push('/subscribe'); }}>
              <MaterialCommunityIcons name="lock" size={20} color="#F59E0B" />
              <View style={styles.paywallInfo}>
                <Text style={styles.paywallTitle}>Free limit reached</Text>
                <Text style={styles.paywallText}>Upgrade to FixPilot Pro for unlimited diagnoses</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#F59E0B" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity testID="diagnose-button" style={[styles.button, (!issue.trim() || loading) && styles.buttonDisabled]}
            onPress={handleDiagnose} disabled={!issue.trim() || loading} activeOpacity={0.7}>
            {loading ? <ActivityIndicator color="#000" size="small" /> :
              <View style={styles.buttonInner}>
                <MaterialCommunityIcons name="magnify" size={20} color="#000" />
                <Text style={styles.buttonText}>Get Diagnosis</Text>
              </View>}
          </TouchableOpacity>

          {recentDiagnoses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RECENT</Text>
              {recentDiagnoses.map((d: any) => (
                <TouchableOpacity testID={`recent-${d.id}`} key={d.id} style={styles.recentCard}
                  onPress={() => router.push({ pathname: '/results', params: { id: d.id } })}>
                  <View style={styles.recentTop}>
                    <MaterialCommunityIcons name="car" size={16} color="#A3A3A3" />
                    <Text style={styles.recentVehicle} numberOfLines={1}>{d.vehicle_summary || 'Unknown'}</Text>
                  </View>
                  <Text style={styles.recentIssue} numberOfLines={2}>{d.issue}</Text>
                  <Text style={styles.recentDate}>{new Date(d.created_at).toLocaleDateString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  flex: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginBottom: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoText: { fontSize: 32, fontWeight: '300', color: '#FFFFFF', letterSpacing: -1 },
  greeting: { fontSize: 13, color: '#A3A3A3', marginTop: 4 },
  logoutBtn: { padding: 8, borderWidth: 1, borderColor: '#333333', borderRadius: 4 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  proBadge: { backgroundColor: '#22C55E', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 3 },
  proBadgeText: { fontSize: 10, fontWeight: '700', color: '#000', letterSpacing: 1 },
  upgradeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#F59E0B', borderRadius: 4 },
  upgradeBtnText: { fontSize: 11, fontWeight: '600', color: '#F59E0B' },
  freeInfo: { fontSize: 12, color: '#737373' },
  paywallCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1F1F1F', borderWidth: 1, borderColor: '#F59E0B', borderRadius: 4, padding: 14, marginBottom: 12 },
  paywallInfo: { flex: 1 },
  paywallTitle: { fontSize: 14, fontWeight: '600', color: '#F59E0B' },
  paywallText: { fontSize: 12, color: '#A3A3A3', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#737373', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  inputHalf: { flex: 1 },
  input: { backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#333333', borderRadius: 4, color: '#FFFFFF', fontSize: 15, paddingHorizontal: 14, paddingVertical: 12 },
  textArea: { minHeight: 100, paddingTop: 12 },
  button: { backgroundColor: '#FFFFFF', borderRadius: 4, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  buttonDisabled: { opacity: 0.4 },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#000000' },
  recentCard: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#333333', borderRadius: 4, padding: 14, marginBottom: 8 },
  recentTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  recentVehicle: { fontSize: 13, color: '#A3A3A3', fontWeight: '600' },
  recentIssue: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, marginBottom: 4 },
  recentDate: { fontSize: 11, color: '#737373' },
});
