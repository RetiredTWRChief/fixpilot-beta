import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const router = useRouter();
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [engine, setEngine] = useState('');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentDiagnoses, setRecentDiagnoses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setRecentDiagnoses(data.slice(0, 3));
      }
    } catch (e) {}
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecent();
    setRefreshing(false);
  }, [fetchRecent]);

  useEffect(() => { fetchRecent(); }, [fetchRecent]);

  const handleDiagnose = async () => {
    if (!issue.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: { year, make, model, engine },
          issue: issue.trim(),
        }),
      });
      const data = await res.json();
      if (data.id) {
        router.push({ pathname: '/results', params: { id: data.id } });
      }
    } catch (e) {
      console.error('Diagnosis error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A3A3A3" />}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <MaterialCommunityIcons name="wrench" size={28} color="#E5E5E5" />
              <Text style={styles.logoText}>FixPilot</Text>
            </View>
            <Text style={styles.subtitle}>AI Mechanic Assistant</Text>
          </View>

          {/* Vehicle Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>VEHICLE</Text>
            <View style={styles.row}>
              <View style={styles.inputHalf}>
                <TextInput
                  testID="input-year"
                  style={styles.input}
                  placeholder="Year"
                  placeholderTextColor="#737373"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
              <View style={styles.inputHalf}>
                <TextInput
                  testID="input-make"
                  style={styles.input}
                  placeholder="Make"
                  placeholderTextColor="#737373"
                  value={make}
                  onChangeText={setMake}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.inputHalf}>
                <TextInput
                  testID="input-model"
                  style={styles.input}
                  placeholder="Model"
                  placeholderTextColor="#737373"
                  value={model}
                  onChangeText={setModel}
                />
              </View>
              <View style={styles.inputHalf}>
                <TextInput
                  testID="input-engine"
                  style={styles.input}
                  placeholder="Engine (optional)"
                  placeholderTextColor="#737373"
                  value={engine}
                  onChangeText={setEngine}
                />
              </View>
            </View>
          </View>

          {/* Issue Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DESCRIBE THE ISSUE</Text>
            <TextInput
              testID="input-issue"
              style={[styles.input, styles.textArea]}
              placeholder="e.g. My car is overheating and I smell coolant near the front..."
              placeholderTextColor="#737373"
              value={issue}
              onChangeText={setIssue}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Diagnose Button */}
          <TouchableOpacity
            testID="diagnose-button"
            style={[styles.button, (!issue.trim() || loading) && styles.buttonDisabled]}
            onPress={handleDiagnose}
            disabled={!issue.trim() || loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <View style={styles.buttonInner}>
                <MaterialCommunityIcons name="magnify" size={20} color="#000" />
                <Text style={styles.buttonText}>Get Diagnosis</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Recent Diagnoses */}
          {recentDiagnoses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RECENT</Text>
              {recentDiagnoses.map((d: any) => (
                <TouchableOpacity
                  testID={`recent-diagnosis-${d.id}`}
                  key={d.id}
                  style={styles.recentCard}
                  onPress={() => router.push({ pathname: '/results', params: { id: d.id } })}
                >
                  <View style={styles.recentTop}>
                    <MaterialCommunityIcons name="car" size={16} color="#A3A3A3" />
                    <Text style={styles.recentVehicle} numberOfLines={1}>
                      {d.vehicle_summary || 'Unknown vehicle'}
                    </Text>
                  </View>
                  <Text style={styles.recentIssue} numberOfLines={2}>{d.issue}</Text>
                  <Text style={styles.recentDate}>
                    {new Date(d.created_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.spacer} />
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
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoText: { fontSize: 32, fontWeight: '300', color: '#FFFFFF', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#737373', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#737373', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  inputHalf: { flex: 1 },
  input: {
    backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#333333', borderRadius: 4,
    color: '#FFFFFF', fontSize: 15, paddingHorizontal: 14, paddingVertical: 12,
  },
  textArea: { minHeight: 100, paddingTop: 12 },
  button: {
    backgroundColor: '#FFFFFF', borderRadius: 4, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#000000' },
  recentCard: {
    backgroundColor: '#141414', borderWidth: 1, borderColor: '#333333',
    borderRadius: 4, padding: 14, marginBottom: 8,
  },
  recentTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  recentVehicle: { fontSize: 13, color: '#A3A3A3', fontWeight: '600' },
  recentIssue: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, marginBottom: 4 },
  recentDate: { fontSize: 11, color: '#737373' },
  spacer: { height: 40 },
});
