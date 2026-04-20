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
import { LANGUAGES, changeLanguage } from '../../lib/i18n';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropdownPicker from '../../lib/DropdownPicker';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;
const FREE_LIMIT = 1;

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, authHeaders, token } = useAuth();
  const { t, i18n } = useTranslation();
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [engine, setEngine] = useState('');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [subStatus, setSubStatus] = useState<any>(null);
  const [paywallError, setPaywallError] = useState('');
  const [localUsed, setLocalUsed] = useState(0);
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Vehicle dropdown data
  const [years, setYears] = useState<string[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [engines, setEngines] = useState<string[]>([]);
  const [makesLoading, setMakesLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [enginesLoading, setEnginesLoading] = useState(false);

  useEffect(() => {
    fetchSubStatus(); loadLocalUsage(); fetchYearsAndMakes();
  }, []);

  const fetchYearsAndMakes = async () => {
    try {
      const [yRes, mRes] = await Promise.all([
        fetch(`${API}/api/vehicle-years`),
        fetch(`${API}/api/vehicle-makes`),
      ]);
      if (yRes.ok) setYears(await yRes.json());
      if (mRes.ok) setMakes(await mRes.json());
    } catch (e) {}
  };

  useEffect(() => {
    if (make) {
      setModel(''); setEngine(''); setModels([]); setEngines([]);
      setModelsLoading(true);
      fetch(`${API}/api/vehicle-models?make=${encodeURIComponent(make)}`)
        .then(r => r.json()).then(d => { setModels(d); setModelsLoading(false); })
        .catch(() => setModelsLoading(false));
    }
  }, [make]);

  useEffect(() => {
    if (make && model) {
      setEngine(''); setEngines([]);
      setEnginesLoading(true);
      fetch(`${API}/api/vehicle-engines?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`)
        .then(r => r.json()).then(d => { setEngines(d); setEnginesLoading(false); })
        .catch(() => setEnginesLoading(false));
    }
  }, [make, model]);

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
    await fetchSubStatus();
    setRefreshing(false);
  }, []);

  const handleDiagnose = async () => {
    if (!issue.trim()) return;
    if (!isPro && freeRemaining <= 0) {
      setPaywallError('Free limit reached. Upgrade to FixPilot Pro for unlimited diagnoses.');
      return;
    }
    setLoading(true); setPaywallError('');
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) Object.assign(headers, authHeaders());
      const res = await fetch(`${API}/api/diagnose`, {
        method: 'POST', headers,
        body: JSON.stringify({ vehicle: { year, make, model, engine }, issue: issue.trim(), language: i18n.language }),
      });
      const data = await res.json();
      if (res.status === 403) { setPaywallError(data.detail || 'Upgrade required'); setLoading(false); return; }
      if (data.id) {
        const nc = localUsed + 1; setLocalUsed(nc);
        await AsyncStorage.setItem('fixpilot_diag_count', nc.toString());
        router.push({ pathname: '/results', params: { id: data.id } });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={s.flex} contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E62020" />}>

          {/* Hero */}
          <View style={s.hero}>
            <View style={s.heroTop}>
              <Image source={{ uri: LOGO_BASE64 }} style={s.logo} resizeMode="contain" />
              <View style={s.heroTextCol}>
                <Text style={s.heroTitle}>{t('appName')}</Text>
                <Text style={s.heroTagline}>{t('tagline')}</Text>
                <Text style={s.heroSub}>{t('taglineSub')}</Text>
              </View>
              <TouchableOpacity testID="lang-picker-btn" style={s.langBtn} onPress={() => setShowLangPicker(!showLangPicker)}>
                <MaterialCommunityIcons name="translate" size={18} color="#E62020" />
                <Text style={s.langBtnText}>{i18n.language.toUpperCase()}</Text>
              </TouchableOpacity>
              {user ? (
                <TouchableOpacity testID="logout-button" onPress={logout} style={s.logoutBtn}>
                  <MaterialCommunityIcons name="logout" size={18} color="#777" />
                </TouchableOpacity>
              ) : null}
            </View>

            {showLangPicker && (
              <View style={s.langDropdown}>
                <Text style={s.langDropdownLabel}>{t('selectLanguage')}</Text>
                <View style={s.langGrid}>
                  {LANGUAGES.map(lang => (
                    <TouchableOpacity key={lang.code} testID={`lang-${lang.code}`}
                      style={[s.langItem, i18n.language === lang.code && s.langItemActive]}
                      onPress={() => { changeLanguage(lang.code); setShowLangPicker(false); }}>
                      <Text style={[s.langItemText, i18n.language === lang.code && s.langItemTextActive]}>{lang.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={s.statusBar}>
              {isPro ? (
                <View style={s.proBadge}><Text style={s.proBadgeText}>PRO</Text></View>
              ) : (
                <TouchableOpacity testID="upgrade-button" style={s.upgradeBtn} onPress={() => router.push('/subscribe')}>
                  <MaterialCommunityIcons name="crown" size={14} color="#E62020" />
                  <Text style={s.upgradeBtnText}>{t('upgradePro')}</Text>
                </TouchableOpacity>
              )}
              {!isPro && <Text style={s.freeCount}>{t('freeDiagLeft', { count: freeRemaining })}</Text>}
              {user && <Text style={s.userGreet}>{t('hi', { name: user.name })}</Text>}
            </View>
          </View>

          {/* Vehicle Dropdowns */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <MaterialCommunityIcons name="car" size={16} color="#E62020" />
              <Text style={s.sectionLabel}>{t('vehicleDetails')}</Text>
            </View>
            <View style={s.row}>
              <DropdownPicker testID="input-year" label={t('year')} value={year} options={years}
                onSelect={setYear} placeholder={t('year')} />
              <DropdownPicker testID="input-make" label={t('make')} value={make} options={makes}
                onSelect={setMake} placeholder={t('make')} loading={makesLoading} />
            </View>
            <View style={s.row}>
              <DropdownPicker testID="input-model" label={t('model')} value={model} options={models}
                onSelect={setModel} placeholder={t('model')} disabled={!make} loading={modelsLoading} />
              <DropdownPicker testID="input-engine" label={t('engineOpt')} value={engine} options={engines}
                onSelect={setEngine} placeholder={t('engineOpt')} disabled={!model} loading={enginesLoading} />
            </View>
          </View>

          {/* Issue */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#E62020" />
              <Text style={s.sectionLabel}>{t('whatsProblem')}</Text>
            </View>
            <TextInput testID="input-issue" style={[s.input, s.textArea]}
              placeholder={t('issuePlaceholder')} placeholderTextColor="#555"
              value={issue} onChangeText={setIssue} multiline numberOfLines={4} textAlignVertical="top" />
          </View>

          {paywallError ? (
            <TouchableOpacity testID="paywall-upgrade" style={s.paywallCard} onPress={() => { setPaywallError(''); router.push('/subscribe'); }}>
              <MaterialCommunityIcons name="lock" size={22} color="#E62020" />
              <View style={s.paywallInfo}>
                <Text style={s.paywallTitle}>{t('freeLimitReached')}</Text>
                <Text style={s.paywallText}>{t('upgradeMsg')}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#E62020" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity testID="diagnose-button"
            style={[s.ctaBtn, (!issue.trim() || loading) && s.ctaBtnDisabled]}
            onPress={handleDiagnose} disabled={!issue.trim() || loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#FFF" size="small" /> :
              <View style={s.ctaInner}>
                <MaterialCommunityIcons name="magnify" size={22} color="#FFF" />
                <Text style={s.ctaText}>{t('getDiagnosis')}</Text>
              </View>}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111' },
  flex: { flex: 1 },
  scroll: { padding: 20 },
  hero: { marginBottom: 24 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: { width: 72, height: 72, borderRadius: 12 },
  heroTextCol: { flex: 1 },
  heroTitle: { fontSize: 30, fontWeight: '700', color: '#FFF', letterSpacing: -0.5 },
  heroTagline: { fontSize: 13, color: '#CCC', fontWeight: '500', marginTop: 1 },
  heroSub: { fontSize: 11, color: '#777', marginTop: 2 },
  logoutBtn: { padding: 8, borderWidth: 1, borderColor: '#333', borderRadius: 6 },
  langBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#E62020', borderRadius: 6 },
  langBtnText: { fontSize: 11, fontWeight: '700', color: '#E62020' },
  langDropdown: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 14, marginTop: 12 },
  langDropdownLabel: { fontSize: 10, fontWeight: '700', color: '#777', letterSpacing: 1.5, marginBottom: 10 },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langItem: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#333', borderRadius: 6 },
  langItemActive: { borderColor: '#E62020', backgroundColor: '#2A1010' },
  langItemText: { fontSize: 13, color: '#999' },
  langItemTextActive: { color: '#E62020', fontWeight: '700' },
  statusBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  proBadge: { backgroundColor: '#E62020', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 3 },
  proBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 1.5 },
  upgradeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1.5, borderColor: '#E62020', borderRadius: 6 },
  upgradeBtnText: { fontSize: 11, fontWeight: '700', color: '#E62020' },
  freeCount: { fontSize: 12, color: '#777' },
  userGreet: { fontSize: 12, color: '#999', marginLeft: 'auto' },
  section: { marginBottom: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#999', letterSpacing: 1.5 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  input: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 8, color: '#FFF', fontSize: 15, paddingHorizontal: 14, paddingVertical: 12 },
  textArea: { minHeight: 100, paddingTop: 14 },
  paywallCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#E62020', borderRadius: 8, padding: 14, marginBottom: 14 },
  paywallInfo: { flex: 1 },
  paywallTitle: { fontSize: 14, fontWeight: '700', color: '#E62020' },
  paywallText: { fontSize: 12, color: '#AAA', marginTop: 2 },
  ctaBtn: { backgroundColor: '#E62020', borderRadius: 10, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  ctaBtnDisabled: { opacity: 0.35 },
  ctaInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
});
