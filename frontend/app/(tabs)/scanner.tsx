import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const OBD2_PIDS: Record<string, { name: string; unit: string; icon: string; parse: (a: number, b: number) => number }> = {
  '010C': { name: 'Engine RPM', unit: 'RPM', icon: 'engine', parse: (a, b) => Math.round(((a * 256) + b) / 4) },
  '010D': { name: 'Vehicle Speed', unit: 'km/h', icon: 'speedometer', parse: (a, b) => a },
  '0105': { name: 'Coolant Temp', unit: '°C', icon: 'thermometer', parse: (a, b) => a - 40 },
  '010F': { name: 'Intake Air Temp', unit: '°C', icon: 'weather-windy', parse: (a, b) => a - 40 },
  '0111': { name: 'Throttle Position', unit: '%', icon: 'percent', parse: (a, b) => Math.round((a / 255) * 100) },
  '012F': { name: 'Fuel Level', unit: '%', icon: 'gas-station', parse: (a, b) => Math.round((a / 255) * 100) },
  '0142': { name: 'Battery Voltage', unit: 'V', icon: 'battery', parse: (a, b) => Math.round(((a * 256) + b) / 1000 * 10) / 10 },
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
    setState('demo');
    setError('');
    setDtcCodes(['P0301', 'P0420']);
    const update = () => {
      setLiveData({
        '010C': 750 + Math.floor(Math.random() * 200),
        '010D': Math.floor(Math.random() * 5),
        '0105': 85 + Math.floor(Math.random() * 10),
        '010F': 22 + Math.floor(Math.random() * 5),
        '0111': 15 + Math.floor(Math.random() * 8),
        '012F': 68 + Math.floor(Math.random() * 3),
        '0142': 12.4 + Math.random() * 0.4,
      });
    };
    update();
    demoInterval.current = setInterval(update, 2000);
  };

  const stopDemo = () => {
    if (demoInterval.current) clearInterval(demoInterval.current);
    setState('idle');
    setLiveData({});
    setDtcCodes([]);
  };

  useEffect(() => {
    return () => { if (demoInterval.current) clearInterval(demoInterval.current); };
  }, []);

  const startScan = () => {
    if (isWeb) {
      setError('Bluetooth requires a physical device. Use Demo Mode to preview.');
      return;
    }
    setState('scanning');
    setError('');
    setTimeout(() => {
      setDevices([
        { id: '1', name: 'OBD2-ELM327', rssi: -45 },
        { id: '2', name: 'OBDII-BLE', rssi: -62 },
      ]);
      setState('idle');
      setError('BLE scanning requires a development build. Use Demo Mode for now.');
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="bluetooth-connect" size={22} color="#E5E5E5" />
        <Text style={styles.headerTitle}>{t('obd2Scanner')}</Text>
        {state === 'demo' && (
          <View style={styles.demoBadge}><Text style={styles.demoBadgeText}>DEMO</Text></View>
        )}
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        {/* Connection Controls */}
        {(state === 'idle' || state === 'scanning') && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('connectObd2')}</Text>
            <Text style={styles.cardDesc}>
              {isWeb
                ? 'Bluetooth is not available on web. Use Demo Mode to preview the scanner interface, or open the app on a physical device.'
                : 'Pair your ELM327 Bluetooth OBD2 adapter and scan for devices.'}
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity testID="scan-ble-button" style={styles.scanBtn} onPress={startScan} disabled={state === 'scanning'}>
                {state === 'scanning' ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <View style={styles.btnInner}>
                    <MaterialCommunityIcons name="bluetooth-audio" size={18} color="#000" />
                    <Text style={styles.scanBtnText}>{t('scanDevices')}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity testID="demo-mode-button" style={styles.demoBtn} onPress={startDemo}>
                <MaterialCommunityIcons name="play-outline" size={18} color="#E5E5E5" />
                <Text style={styles.demoBtnText}>{t('demoMode')}</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="information-outline" size={16} color="#F59E0B" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {devices.length > 0 && (
              <View style={styles.deviceList}>
                <Text style={styles.deviceListLabel}>{t('foundDevices')}</Text>
                {devices.map(d => (
                  <View key={d.id} style={styles.deviceItem}>
                    <MaterialCommunityIcons name="bluetooth" size={18} color="#3B82F6" />
                    <Text style={styles.deviceName}>{d.name}</Text>
                    <Text style={styles.deviceRssi}>{d.rssi} dBm</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Live Data */}
        {(state === 'demo' || state === 'reading' || state === 'connected') && (
          <View>
            <View style={styles.liveHeader}>
              <Text style={styles.liveTitle}>{t('liveData')}</Text>
              <TouchableOpacity testID="stop-scanner" style={styles.stopBtn} onPress={stopDemo}>
                <MaterialCommunityIcons name="stop" size={16} color="#EF4444" />
                <Text style={styles.stopBtnText}>Stop</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.gaugeGrid}>
              {Object.entries(OBD2_PIDS).map(([pid, info]) => {
                const value = liveData[pid];
                return (
                  <View key={pid} style={styles.gaugeCard}>
                    <MaterialCommunityIcons name={info.icon as any} size={22} color="#A3A3A3" />
                    <Text style={styles.gaugeName}>{info.name}</Text>
                    <Text style={styles.gaugeValue}>
                      {value !== undefined ? (typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value) : '--'}
                    </Text>
                    <Text style={styles.gaugeUnit}>{info.unit}</Text>
                  </View>
                );
              })}
            </View>

            {/* DTC Codes */}
            {dtcCodes.length > 0 && (
              <View style={styles.card}>
                <View style={styles.dtcHeader}>
                  <MaterialCommunityIcons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={styles.dtcTitle}>{t('dtcCodes')}</Text>
                </View>
                {dtcCodes.map((code, i) => (
                  <View key={i} style={styles.dtcItem}>
                    <Text style={styles.dtcCode}>{code}</Text>
                    <Text style={styles.dtcDesc}>
                      {code === 'P0301' ? 'Cylinder 1 Misfire Detected' :
                       code === 'P0420' ? 'Catalyst System Efficiency Below Threshold' : 'Unknown code'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t('howItWorks')}</Text>
          <View style={styles.stepList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
              <Text style={styles.stepText}>Plug an ELM327 Bluetooth OBD2 adapter into your vehicle's OBD port (usually under the dashboard)</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
              <Text style={styles.stepText}>Turn the ignition on (engine can be off or running)</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
              <Text style={styles.stepText}>Tap "Scan Devices" to find and connect to your adapter</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>4</Text></View>
              <Text style={styles.stepText}>View live engine data and read diagnostic trouble codes</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#333333' },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#FFFFFF', flex: 1 },
  demoBadge: { backgroundColor: '#F59E0B', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  demoBadgeText: { fontSize: 10, fontWeight: '700', color: '#000', letterSpacing: 1 },
  content: { padding: 16 },
  card: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#333333', borderRadius: 4, padding: 16, marginBottom: 12 },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#737373', letterSpacing: 2, marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#A3A3A3', lineHeight: 21, marginBottom: 16 },
  btnRow: { flexDirection: 'row', gap: 10 },
  scanBtn: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 4, paddingVertical: 12, alignItems: 'center' },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scanBtnText: { fontSize: 14, fontWeight: '600', color: '#000' },
  demoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#333333', borderRadius: 4, paddingVertical: 12 },
  demoBtnText: { fontSize: 14, fontWeight: '600', color: '#E5E5E5' },
  errorBox: { flexDirection: 'row', gap: 8, marginTop: 12, padding: 10, backgroundColor: '#1F1F1F', borderWidth: 1, borderColor: '#4D4D4D', borderRadius: 4 },
  errorText: { fontSize: 13, color: '#F59E0B', flex: 1 },
  deviceList: { marginTop: 16 },
  deviceListLabel: { fontSize: 10, fontWeight: '700', color: '#737373', letterSpacing: 2, marginBottom: 8 },
  deviceItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1F1F1F' },
  deviceName: { fontSize: 14, fontWeight: '500', color: '#E5E5E5', flex: 1 },
  deviceRssi: { fontSize: 12, color: '#737373' },
  liveHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  liveTitle: { fontSize: 11, fontWeight: '700', color: '#737373', letterSpacing: 2 },
  stopBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#EF4444', borderRadius: 4 },
  stopBtnText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
  gaugeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  gaugeCard: { width: '47%', backgroundColor: '#141414', borderWidth: 1, borderColor: '#333333', borderRadius: 4, padding: 14, alignItems: 'center' },
  gaugeName: { fontSize: 11, color: '#737373', fontWeight: '600', marginTop: 6, textAlign: 'center' },
  gaugeValue: { fontSize: 28, fontWeight: '300', color: '#FFFFFF', marginTop: 4 },
  gaugeUnit: { fontSize: 11, color: '#A3A3A3', marginTop: 2 },
  dtcHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dtcTitle: { fontSize: 10, fontWeight: '700', color: '#EF4444', letterSpacing: 2 },
  dtcItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1F1F1F' },
  dtcCode: { fontSize: 16, fontWeight: '600', color: '#EF4444', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  dtcDesc: { fontSize: 13, color: '#A3A3A3', marginTop: 2 },
  stepList: { gap: 12 },
  stepItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum: { width: 24, height: 24, borderRadius: 4, backgroundColor: '#292929', alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 12, fontWeight: '700', color: '#A3A3A3' },
  stepText: { fontSize: 14, color: '#E5E5E5', lineHeight: 20, flex: 1 },
});
