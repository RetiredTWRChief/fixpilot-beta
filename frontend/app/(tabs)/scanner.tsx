import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const OBD2_PIDS: Record<string, { nameKey: string; unit: string; icon: string; parse: (a: number, b: number) => number }> = {
  '010C': { nameKey: 'engineRpm', unit: 'RPM', icon: 'engine', parse: (a, b) => Math.round(((a * 256) + b) / 4) },
  '010D': { nameKey: 'vehicleSpeed', unit: 'km/h', icon: 'speedometer', parse: (a, b) => a },
  '0105': { nameKey: 'coolantTemp', unit: '°C', icon: 'thermometer', parse: (a, b) => a - 40 },
  '010F': { nameKey: 'intakeAirTemp', unit: '°C', icon: 'weather-windy', parse: (a, b) => a - 40 },
  '0111': { nameKey: 'throttlePos', unit: '%', icon: 'percent', parse: (a, b) => Math.round((a / 255) * 100) },
  '012F': { nameKey: 'fuelLevel', unit: '%', icon: 'gas-station', parse: (a, b) => Math.round((a / 255) * 100) },
  '0142': { nameKey: 'batteryVoltage', unit: 'V', icon: 'battery', parse: (a, b) => Math.round(((a * 256) + b) / 1000 * 10) / 10 },
};

type ScannerState = 'idle' | 'scanning' | 'connected' | 'reading' | 'demo';

export default function ScannerScreen() {
  const { t } = useTranslation();
  const [state, setState] = useState<ScannerState>('idle');
  const [devices, setDevices] = useState<any[]>([]);
  const [liveData, setLiveData] = useState<Record<string, number>>({});
  const [dtcCodes, setDtcCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const demoInterval = useRef<any>(null);
  const isWeb = Platform.OS === 'web';

  const startDemo = () => {
    setState('demo'); setError(''); setDtcCodes(['P0301', 'P0420']);
    const update = () => {
      setLiveData({
        '010C': 750 + Math.floor(Math.random() * 200), '010D': Math.floor(Math.random() * 5),
        '0105': 85 + Math.floor(Math.random() * 10), '010F': 22 + Math.floor(Math.random() * 5),
        '0111': 15 + Math.floor(Math.random() * 8), '012F': 68 + Math.floor(Math.random() * 3),
        '0142': 12.4 + Math.random() * 0.4,
      });
    };
    update(); demoInterval.current = setInterval(update, 2000);
  };

  const stopDemo = () => { if (demoInterval.current) clearInterval(demoInterval.current); setState('idle'); setLiveData({}); setDtcCodes([]); };

  useEffect(() => { return () => { if (demoInterval.current) clearInterval(demoInterval.current); }; }, []);

  const startScan = () => {
    if (isWeb) { setError(t('bleWebMsg')); return; }
    setState('scanning'); setError('');
    setTimeout(() => {
      setDevices([{ id: '1', name: 'OBD2-ELM327', rssi: -45 }, { id: '2', name: 'OBDII-BLE', rssi: -62 }]);
      setState('idle'); setError('BLE scanning requires a development build. Use Demo Mode for now.');
    }, 3000);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <MaterialCommunityIcons name="bluetooth-connect" size={22} color="#E62020" />
        <Text style={s.headerTitle}>{t('obd2Scanner')}</Text>
        {state === 'demo' && <View style={s.demoBadge}><Text style={s.demoBadgeText}>DEMO</Text></View>}
      </View>

      <ScrollView style={s.flex} contentContainerStyle={s.content}>
        {(state === 'idle' || state === 'scanning') && (
          <View style={s.card}>
            <Text style={s.cardLabel}>{t('connectObd2')}</Text>
            <Text style={s.cardDesc}>{isWeb ? t('bleWebMsg') : t('blePairMsg')}</Text>
            <View style={s.btnRow}>
              <TouchableOpacity testID="scan-ble-button" style={s.scanBtn} onPress={startScan} disabled={state === 'scanning'}>
                {state === 'scanning' ? <ActivityIndicator color="#FFF" size="small" /> :
                  <View style={s.btnInner}><MaterialCommunityIcons name="bluetooth-audio" size={18} color="#FFF" /><Text style={s.scanBtnText}>{t('scanDevices')}</Text></View>}
              </TouchableOpacity>
              <TouchableOpacity testID="demo-mode-button" style={s.demoBtn} onPress={startDemo}>
                <MaterialCommunityIcons name="play-outline" size={18} color="#E62020" />
                <Text style={s.demoBtnText}>{t('demoMode')}</Text>
              </TouchableOpacity>
            </View>
            {error ? <View style={s.infoBox}><MaterialCommunityIcons name="information-outline" size={16} color="#E62020" /><Text style={s.infoText}>{error}</Text></View> : null}
            {devices.length > 0 && (
              <View style={s.deviceList}>
                <Text style={s.deviceLabel}>{t('foundDevices')}</Text>
                {devices.map(d => (
                  <View key={d.id} style={s.deviceItem}>
                    <MaterialCommunityIcons name="bluetooth" size={18} color="#E62020" /><Text style={s.deviceName}>{d.name}</Text><Text style={s.deviceRssi}>{d.rssi} dBm</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {(state === 'demo' || state === 'reading' || state === 'connected') && (
          <View>
            <View style={s.liveHeader}>
              <Text style={s.liveTitle}>{t('liveData')}</Text>
              <TouchableOpacity testID="stop-scanner" style={s.stopBtn} onPress={stopDemo}>
                <MaterialCommunityIcons name="stop" size={16} color="#E62020" /><Text style={s.stopText}>{t('stop')}</Text>
              </TouchableOpacity>
            </View>
            <View style={s.gaugeGrid}>
              {Object.entries(OBD2_PIDS).map(([pid, info]) => {
                const value = liveData[pid];
                return (
                  <View key={pid} style={s.gaugeCard}>
                    <MaterialCommunityIcons name={info.icon as any} size={22} color="#E62020" />
                    <Text style={s.gaugeName}>{t(info.nameKey)}</Text>
                    <Text style={s.gaugeValue}>{value !== undefined ? (Number.isInteger(value) ? value : (value as number).toFixed(1)) : '--'}</Text>
                    <Text style={s.gaugeUnit}>{info.unit}</Text>
                  </View>
                );
              })}
            </View>
            {dtcCodes.length > 0 && (
              <View style={s.card}>
                <View style={s.dtcHeader}><MaterialCommunityIcons name="alert-circle" size={18} color="#E62020" /><Text style={s.dtcTitle}>{t('dtcCodes')}</Text></View>
                {dtcCodes.map((code, i) => (
                  <View key={i} style={s.dtcItem}>
                    <Text style={s.dtcCode}>{code}</Text>
                    <Text style={s.dtcDesc}>{code === 'P0301' ? 'Cylinder 1 Misfire Detected' : code === 'P0420' ? 'Catalyst System Efficiency Below Threshold' : 'Unknown'}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={s.card}>
          <Text style={s.cardLabel}>{t('howItWorks')}</Text>
          {[t('step1'), t('step2'), t('step3'), t('step4')].map((step, i) => (
            <View key={i} style={s.stepItem}>
              <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', flex: 1 },
  demoBadge: { backgroundColor: '#E62020', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  demoBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  content: { padding: 16 },
  card: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 10, padding: 16, marginBottom: 12 },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#E62020', letterSpacing: 2, marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#AAA', lineHeight: 21, marginBottom: 16 },
  btnRow: { flexDirection: 'row', gap: 10 },
  scanBtn: { flex: 1, backgroundColor: '#E62020', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scanBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  demoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#E62020', borderRadius: 8, paddingVertical: 12 },
  demoBtnText: { fontSize: 14, fontWeight: '700', color: '#E62020' },
  infoBox: { flexDirection: 'row', gap: 8, marginTop: 12, padding: 10, backgroundColor: '#222', borderWidth: 1, borderColor: '#333', borderRadius: 8 },
  infoText: { fontSize: 13, color: '#CCC', flex: 1 },
  deviceList: { marginTop: 16 },
  deviceLabel: { fontSize: 10, fontWeight: '700', color: '#E62020', letterSpacing: 2, marginBottom: 8 },
  deviceItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  deviceName: { fontSize: 14, fontWeight: '500', color: '#FFF', flex: 1 },
  deviceRssi: { fontSize: 12, color: '#777' },
  liveHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  liveTitle: { fontSize: 11, fontWeight: '700', color: '#E62020', letterSpacing: 2 },
  stopBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: '#E62020', borderRadius: 6 },
  stopText: { fontSize: 12, color: '#E62020', fontWeight: '700' },
  gaugeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  gaugeCard: { width: '47%', backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 10, padding: 14, alignItems: 'center' },
  gaugeName: { fontSize: 11, color: '#999', fontWeight: '600', marginTop: 6, textAlign: 'center' },
  gaugeValue: { fontSize: 28, fontWeight: '300', color: '#FFF', marginTop: 4 },
  gaugeUnit: { fontSize: 11, color: '#777', marginTop: 2 },
  dtcHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dtcTitle: { fontSize: 10, fontWeight: '700', color: '#E62020', letterSpacing: 2 },
  dtcItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  dtcCode: { fontSize: 16, fontWeight: '700', color: '#E62020', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  dtcDesc: { fontSize: 13, color: '#AAA', marginTop: 2 },
  stepItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 12 },
  stepNum: { width: 26, height: 26, borderRadius: 6, backgroundColor: '#E62020', alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  stepText: { fontSize: 14, color: '#CCC', lineHeight: 20, flex: 1 },
});
