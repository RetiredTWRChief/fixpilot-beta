import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth-context';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HistoryScreen() {
  const router = useRouter();
  const { authHeaders } = useAuth();
  const { t } = useTranslation();
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/history`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDiagnoses(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API}/api/history/${id}`, { method: 'DELETE' });
      setDiagnoses(prev => prev.filter(d => d.id !== id));
    } catch (e) {}
  };

  const getDifficultyColor = (diff: string) => {
    if (!diff) return '#737373';
    const d = diff.toLowerCase();
    if (d.includes('easy')) return '#22C55E';
    if (d.includes('moderate')) return '#F59E0B';
    if (d.includes('advanced')) return '#EF4444';
    return '#A3A3A3';
  };

  const renderItem = ({ item }: { item: any }) => {
    const difficulty = item.repair_match?.difficulty || item.ai_analysis?.difficulty || '';
    const title = item.repair_match?.title || item.ai_analysis?.title || 'Diagnosis';

    return (
      <TouchableOpacity
        testID={`history-item-${item.id}`}
        style={styles.card}
        onPress={() => router.push({ pathname: '/results', params: { id: item.id } })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="car-wrench" size={18} color="#E62020" />
            <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
          </View>
          <TouchableOpacity testID={`delete-${item.id}`} onPress={() => handleDelete(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close" size={16} color="#737373" />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardVehicle}>{item.vehicle_summary || 'Unknown vehicle'}</Text>
        <Text style={styles.cardIssue} numberOfLines={2}>{item.issue}</Text>

        <View style={styles.cardFooter}>
          {difficulty ? (
            <View style={styles.diffBadge}>
              <View style={[styles.diffDot, { backgroundColor: getDifficultyColor(difficulty) }]} />
              <Text style={[styles.diffText, { color: getDifficultyColor(difficulty) }]}>{difficulty}</Text>
            </View>
          ) : null}
          <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color="#A3A3A3" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="history" size={22} color="#E62020" />
        <Text style={styles.headerTitle}>{t('diagnosisHistory')}</Text>
        <Text style={styles.headerCount}>{diagnoses.length}</Text>
      </View>

      {diagnoses.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#2A2A2A" />
          <Text style={styles.emptyTitle}>{t('noDiagnosesYet')}</Text>
          <Text style={styles.emptyText}>{t('historyPrompt')}</Text>
        </View>
      ) : (
        <FlatList
          data={diagnoses}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A3A3A3" />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2A2A2A',
  },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#FFFFFF', flex: 1 },
  headerCount: {
    fontSize: 12, fontWeight: '700', color: '#777', backgroundColor: '#1F1F1F',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },
  list: { padding: 16 },
  card: {
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A',
    borderRadius: 8, padding: 16, marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#FFF', flex: 1 },
  cardVehicle: { fontSize: 12, color: '#777', fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  cardIssue: { fontSize: 14, color: '#AAA', lineHeight: 20, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  diffBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  diffText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardDate: { fontSize: 11, color: '#777' },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: '#AAA', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#777', marginTop: 6 },
});
