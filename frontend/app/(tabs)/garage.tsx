import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../auth-context';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function GarageScreen() {
  const { authHeaders } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [engine, setEngine] = useState('');
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/vehicles`, { headers: authHeaders() });
      if (res.ok) setVehicles(await res.json());
    } catch (e) {}
    setLoading(false);
  }, [authHeaders]);

  useFocusEffect(useCallback(() => { fetchVehicles(); }, [fetchVehicles]));

  const onRefresh = async () => { setRefreshing(true); await fetchVehicles(); setRefreshing(false); };

  const saveVehicle = async () => {
    if (!year || !make || !model) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/vehicles`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ year, make, model, engine, nickname }),
      });
      if (res.ok) {
        setYear(''); setMake(''); setModel(''); setEngine(''); setNickname('');
        setShowForm(false);
        fetchVehicles();
      }
    } catch (e) {}
    setSaving(false);
  };

  const deleteVehicle = async (id: string) => {
    try {
      await fetch(`${API}/api/vehicles/${id}`, { method: 'DELETE', headers: authHeaders() });
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (e) {}
  };

  const renderVehicle = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="car" size={22} color="#E5E5E5" />
        <View style={styles.cardInfo}>
          {item.nickname ? <Text style={styles.nickname}>{item.nickname}</Text> : null}
          <Text style={styles.vehicleText}>{item.year} {item.make} {item.model}</Text>
          {item.engine ? <Text style={styles.engineText}>{item.engine}</Text> : null}
        </View>
        <TouchableOpacity testID={`delete-vehicle-${item.id}`} onPress={() => deleteVehicle(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="close" size={18} color="#737373" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator color="#A3A3A3" size="large" /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="car-multiple" size={22} color="#E5E5E5" />
        <Text style={styles.headerTitle}>My Garage</Text>
        <TouchableOpacity testID="add-vehicle-button" style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <MaterialCommunityIcons name={showForm ? "close" : "plus"} size={18} color="#A3A3A3" />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>ADD VEHICLE</Text>
          <View style={styles.formRow}>
            <TextInput testID="garage-year" style={[styles.input, styles.inputSmall]} placeholder="Year" placeholderTextColor="#737373" value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} />
            <TextInput testID="garage-make" style={[styles.input, styles.inputSmall]} placeholder="Make" placeholderTextColor="#737373" value={make} onChangeText={setMake} />
          </View>
          <View style={styles.formRow}>
            <TextInput testID="garage-model" style={[styles.input, styles.inputSmall]} placeholder="Model" placeholderTextColor="#737373" value={model} onChangeText={setModel} />
            <TextInput testID="garage-engine" style={[styles.input, styles.inputSmall]} placeholder="Engine" placeholderTextColor="#737373" value={engine} onChangeText={setEngine} />
          </View>
          <TextInput testID="garage-nickname" style={styles.input} placeholder="Nickname (optional)" placeholderTextColor="#737373" value={nickname} onChangeText={setNickname} />
          <TouchableOpacity testID="garage-save" style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={saveVehicle} disabled={saving}>
            {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.saveBtnText}>Save Vehicle</Text>}
          </TouchableOpacity>
        </View>
      )}

      {vehicles.length === 0 && !showForm ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="car-off" size={48} color="#333333" />
          <Text style={styles.emptyTitle}>No vehicles saved</Text>
          <Text style={styles.emptyText}>Add your vehicles to quickly start diagnoses</Text>
        </View>
      ) : (
        <FlatList data={vehicles} renderItem={renderVehicle} keyExtractor={item => item.id}
          contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A3A3A3" />} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#333333' },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#FFFFFF', flex: 1 },
  addBtn: { padding: 8, borderWidth: 1, borderColor: '#333333', borderRadius: 4 },
  formCard: { backgroundColor: '#141414', borderBottomWidth: 1, borderBottomColor: '#333333', padding: 16 },
  formLabel: { fontSize: 10, fontWeight: '700', color: '#737373', letterSpacing: 2, marginBottom: 10 },
  formRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  input: { backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#333333', borderRadius: 4, color: '#FFFFFF', fontSize: 14, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  inputSmall: { flex: 1, marginBottom: 0 },
  saveBtn: { backgroundColor: '#FFFFFF', borderRadius: 4, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: '#000' },
  list: { padding: 16 },
  card: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#333333', borderRadius: 4, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardInfo: { flex: 1 },
  nickname: { fontSize: 15, fontWeight: '600', color: '#E5E5E5', marginBottom: 2 },
  vehicleText: { fontSize: 14, color: '#A3A3A3' },
  engineText: { fontSize: 12, color: '#737373', marginTop: 2 },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: '#A3A3A3', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#737373', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
});
