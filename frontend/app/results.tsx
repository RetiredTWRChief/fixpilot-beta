import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ResultsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetch(`${API}/api/history/${id}`)
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const openUrl = (url: string) => { if (url) Linking.openURL(url); };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator color="#A3A3A3" size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Diagnosis not found</Text>
          <TouchableOpacity testID="go-back-button" style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const match = data.repair_match;
  const ai = data.ai_analysis;
  const title = match?.title || ai?.title || 'Diagnosis Result';
  const summary = match?.summary || ai?.summary || '';
  const difficulty = match?.difficulty || ai?.difficulty || 'Unknown';

  const getDiffColor = (d: string) => {
    if (!d) return '#A3A3A3';
    const dl = d.toLowerCase();
    if (dl.includes('easy')) return '#22C55E';
    if (dl.includes('moderate')) return '#F59E0B';
    if (dl.includes('advanced')) return '#EF4444';
    return '#A3A3A3';
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'information-outline' as const },
    { key: 'diy', label: 'DIY', icon: 'tools' as const },
    { key: 'parts', label: 'Parts', icon: 'cog-outline' as const },
    { key: 'videos', label: 'Videos', icon: 'play-circle-outline' as const },
  ];

  const renderOverview = () => (
    <View>
      {/* AI Analysis */}
      {ai && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>AI ANALYSIS</Text>
          <Text style={styles.cardText}>{ai.summary || ai.recommended_approach || JSON.stringify(ai)}</Text>
          {ai.likely_causes && ai.likely_causes.length > 0 && (
            <View style={styles.listSection}>
              <Text style={styles.listTitle}>Likely Causes</Text>
              {ai.likely_causes.map((c: string, i: number) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>-</Text>
                  <Text style={styles.listText}>{c}</Text>
                </View>
              ))}
            </View>
          )}
          {ai.safety_notes && (
            <View style={styles.warningBox}>
              <MaterialCommunityIcons name="alert-outline" size={16} color="#F59E0B" />
              <Text style={styles.warningText}>{ai.safety_notes}</Text>
            </View>
          )}
        </View>
      )}

      {/* Inspection Steps */}
      {(match?.inspection_steps || ai?.inspection_steps) && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>INSPECTION STEPS</Text>
          {(match?.inspection_steps || ai?.inspection_steps || []).map((step: string, i: number) => (
            <View key={i} style={styles.stepItem}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Inspection Tools */}
      {match?.inspection_tools && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>INSPECTION TOOLS</Text>
          {match.inspection_tools.map((tool: any, i: number) => (
            <TouchableOpacity key={i} testID={`inspection-tool-${i}`} style={styles.toolItem} onPress={() => openUrl(tool.url)}>
              <MaterialCommunityIcons name="open-in-new" size={14} color="#3B82F6" />
              <View style={styles.toolInfo}>
                <Text style={styles.toolName}>{tool.title}</Text>
                {tool.description && <Text style={styles.toolDesc}>{tool.description}</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Cost Comparison */}
      <View style={styles.costRow}>
        <View style={[styles.costCard, styles.costCardDiy]}>
          <Text style={styles.costLabel}>DIY COST</Text>
          <Text style={styles.costAmount}>
            ${match?.diy?.estimated_cost?.min || ai?.estimated_diy_cost?.min || '?'} - ${match?.diy?.estimated_cost?.max || ai?.estimated_diy_cost?.max || '?'}
          </Text>
        </View>
        <View style={[styles.costCard, styles.costCardMech]}>
          <Text style={styles.costLabel}>MECHANIC COST</Text>
          <Text style={styles.costAmount}>
            ${match?.mechanic?.estimated_cost?.min || ai?.estimated_mechanic_cost?.min || '?'} - ${match?.mechanic?.estimated_cost?.max || ai?.estimated_mechanic_cost?.max || '?'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderDiy = () => (
    <View>
      {match?.diy?.tools && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TOOLS NEEDED</Text>
          {match.diy.tools.map((tool: any, i: number) => (
            <TouchableOpacity key={i} testID={`diy-tool-${i}`} style={styles.toolItem} onPress={() => openUrl(tool.url)}>
              <MaterialCommunityIcons name="wrench" size={16} color="#A3A3A3" />
              <View style={styles.toolInfo}>
                <Text style={styles.toolName}>{tool.title}</Text>
                {tool.description !== 'Recommended tool' && <Text style={styles.toolDesc}>{tool.description}</Text>}
              </View>
              <MaterialCommunityIcons name="cart-outline" size={16} color="#3B82F6" />
            </TouchableOpacity>
          ))}
        </View>
      )}
      {!match?.diy && ai && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>AI REPAIR GUIDANCE</Text>
          <Text style={styles.cardText}>{ai.recommended_approach || 'Consult a professional mechanic for this repair.'}</Text>
        </View>
      )}
    </View>
  );

  const renderParts = () => (
    <View>
      {match?.diy?.parts && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>RECOMMENDED PARTS</Text>
          {match.diy.parts.map((part: any, i: number) => (
            <View key={i} style={styles.partItem}>
              <View style={styles.partHeader}>
                <MaterialCommunityIcons name="cog" size={16} color="#A3A3A3" />
                <Text style={styles.partName}>{part.title}</Text>
              </View>
              {part.description !== 'Recommended part' && <Text style={styles.partDesc}>{part.description}</Text>}
              {part.vendors && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vendorRow}>
                  {part.vendors.slice(0, 4).map((v: any, j: number) => (
                    <TouchableOpacity key={j} testID={`vendor-${i}-${j}`} style={styles.vendorBtn} onPress={() => openUrl(v.url)}>
                      <Text style={styles.vendorText}>{v.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          ))}
        </View>
      )}
      {!match?.diy?.parts && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PARTS</Text>
          <Text style={styles.cardText}>Use the AI analysis above to identify which parts may be needed. Verify before purchasing.</Text>
        </View>
      )}
    </View>
  );

  const renderVideos = () => {
    const videos = [
      ...(match?.related_videos || []),
      ...(match?.diy?.repair_videos || []),
    ];
    return (
      <View>
        {videos.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>INSTRUCTION VIDEOS</Text>
            {videos.map((v: any, i: number) => (
              <TouchableOpacity key={i} testID={`video-${i}`} style={styles.videoItem} onPress={() => openUrl(v.url)}>
                <MaterialCommunityIcons name="youtube" size={24} color="#EF4444" />
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{v.title}</Text>
                  {v.description && <Text style={styles.videoDesc}>{v.description}</Text>}
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#737373" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>VIDEOS</Text>
            <Text style={styles.cardText}>No specific videos matched. Try searching YouTube for your vehicle and issue.</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity testID="results-back-button" onPress={() => router.back()} style={styles.topBackBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#E5E5E5" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>Diagnosis Report</Text>
        <View style={styles.topBackBtn} />
      </View>

      {/* Diagnosis Header */}
      <View style={styles.diagHeader}>
        <Text style={styles.diagTitle}>{title}</Text>
        <Text style={styles.diagVehicle}>{data.vehicle_summary}</Text>
        <View style={styles.diffRow}>
          <View style={[styles.diffDot, { backgroundColor: getDiffColor(difficulty) }]} />
          <Text style={[styles.diffLabel, { color: getDiffColor(difficulty) }]}>{difficulty}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{summary}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            testID={`tab-${tab.key}`}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialCommunityIcons name={tab.icon} size={16} color={activeTab === tab.key ? '#FFFFFF' : '#737373'} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.flex} contentContainerStyle={styles.tabContent}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'diy' && renderDiy()}
        {activeTab === 'parts' && renderParts()}
        {activeTab === 'videos' && renderVideos()}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: '#A3A3A3' },
  backBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#141414', borderWidth: 1, borderColor: '#333333', borderRadius: 4 },
  backBtnText: { fontSize: 14, color: '#FFFFFF' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333333' },
  topBackBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  diagHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  diagTitle: { fontSize: 22, fontWeight: '300', color: '#FFFFFF', letterSpacing: -0.5 },
  diagVehicle: { fontSize: 13, color: '#737373', fontWeight: '600', letterSpacing: 0.5, marginTop: 4, textTransform: 'uppercase' },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  diffDot: { width: 8, height: 8, borderRadius: 4 },
  diffLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryBox: { marginHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1F1F1F' },
  summaryText: { fontSize: 14, color: '#A3A3A3', lineHeight: 21 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#333333' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#FFFFFF' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#737373', textTransform: 'uppercase', letterSpacing: 0.5 },
  tabTextActive: { color: '#FFFFFF' },
  tabContent: { padding: 16 },
  card: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#333333', borderRadius: 4, padding: 16, marginBottom: 12 },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#737373', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' },
  cardText: { fontSize: 14, color: '#E5E5E5', lineHeight: 21 },
  listSection: { marginTop: 12 },
  listTitle: { fontSize: 12, fontWeight: '600', color: '#A3A3A3', marginBottom: 6 },
  listItem: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  bullet: { fontSize: 14, color: '#737373' },
  listText: { fontSize: 14, color: '#E5E5E5', lineHeight: 20, flex: 1 },
  warningBox: { flexDirection: 'row', gap: 8, marginTop: 12, padding: 10, backgroundColor: '#1F1F1F', borderWidth: 1, borderColor: '#4D4D4D', borderRadius: 4 },
  warningText: { fontSize: 13, color: '#F59E0B', flex: 1, lineHeight: 19 },
  stepItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stepNum: { width: 24, height: 24, borderRadius: 4, backgroundColor: '#292929', alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 12, fontWeight: '700', color: '#A3A3A3' },
  stepText: { fontSize: 14, color: '#E5E5E5', lineHeight: 20, flex: 1 },
  toolItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1F1F1F' },
  toolInfo: { flex: 1 },
  toolName: { fontSize: 14, fontWeight: '500', color: '#E5E5E5' },
  toolDesc: { fontSize: 12, color: '#737373', marginTop: 2 },
  costRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  costCard: { flex: 1, padding: 14, borderRadius: 4, borderWidth: 1 },
  costCardDiy: { backgroundColor: '#141414', borderColor: '#22C55E' },
  costCardMech: { backgroundColor: '#141414', borderColor: '#F59E0B' },
  costLabel: { fontSize: 10, fontWeight: '700', color: '#737373', letterSpacing: 2, marginBottom: 6 },
  costAmount: { fontSize: 18, fontWeight: '300', color: '#FFFFFF' },
  partItem: { marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#1F1F1F' },
  partHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  partName: { fontSize: 14, fontWeight: '500', color: '#E5E5E5' },
  partDesc: { fontSize: 12, color: '#737373', marginBottom: 8 },
  vendorRow: { marginTop: 4 },
  vendorBtn: { backgroundColor: '#292929', borderWidth: 1, borderColor: '#4D4D4D', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  vendorText: { fontSize: 11, fontWeight: '600', color: '#E5E5E5' },
  videoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1F1F1F' },
  videoInfo: { flex: 1 },
  videoTitle: { fontSize: 14, fontWeight: '500', color: '#E5E5E5' },
  videoDesc: { fontSize: 12, color: '#737373', marginTop: 2 },
  bottomSpacer: { height: 40 },
});
