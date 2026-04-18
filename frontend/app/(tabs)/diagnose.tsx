import { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { useTranslation } from 'react-i18next';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  repair_match?: any;
};

export default function DiagnoseScreen() {
  const router = useRouter();
  const { authHeaders } = useAuth();
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVehicle, setShowVehicle] = useState(true);

  const sendMessage = useCallback(async () => {
    const text = message.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);
    setShowVehicle(false);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          session_id: sessionId,
          vehicle: { year, make, model, engine: '' },
          message: text, language: i18n.language,
        }),
      });
      const data = await res.json();
      setSessionId(data.session_id || sessionId);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'No response',
        repair_match: data.repair_match,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please try again.',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [message, loading, sessionId, year, make, model]);

  const handleQuickDiagnose = useCallback(async (match: any) => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          vehicle: { year, make, model, engine: '' },
          issue: match.title || '', language: i18n.language,
          verified_diagnosis: match.key || '',
        }),
      });
      const data = await res.json();
      if (data.id) {
        router.push({ pathname: '/results', params: { id: data.id } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [year, make, model, router]);

  const startNew = () => {
    setMessages([]);
    setSessionId('');
    setShowVehicle(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="chat-processing-outline" size={22} color="#E5E5E5" />
            <Text style={styles.headerTitle}>{t('aiDiagnosis')}</Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity testID="new-chat-button" onPress={startNew} style={styles.newBtn}>
              <MaterialCommunityIcons name="plus" size={18} color="#A3A3A3" />
              <Text style={styles.newBtnText}>{t('newChat')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Vehicle Inputs (collapsible) */}
        {showVehicle && (
          <View style={styles.vehicleBar}>
            <TextInput testID="chat-input-year" style={styles.vehicleInput} placeholder="Year" placeholderTextColor="#737373" value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} />
            <TextInput testID="chat-input-make" style={styles.vehicleInput} placeholder="Make" placeholderTextColor="#737373" value={make} onChangeText={setMake} />
            <TextInput testID="chat-input-model" style={styles.vehicleInput} placeholder="Model" placeholderTextColor="#737373" value={model} onChangeText={setModel} />
          </View>
        )}

        {/* Messages */}
        <ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={styles.messagesContent}>
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="engine" size={48} color="#333333" />
              <Text style={styles.emptyTitle}>{t('describeVehicleIssue')}</Text>
              <Text style={styles.emptyText}>{t('describeSymptoms')}</Text>
            </View>
          )}

          {messages.map(msg => (
            <View key={msg.id} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
              <View style={[styles.msgBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                {msg.role === 'assistant' && (
                  <View style={styles.aiLabel}>
                    <MaterialCommunityIcons name="wrench" size={12} color="#737373" />
                    <Text style={styles.aiLabelText}>FixPilot</Text>
                  </View>
                )}
                <Text style={styles.msgText}>{msg.content}</Text>
                {msg.repair_match && (
                  <TouchableOpacity
                    testID={`view-report-${msg.id}`}
                    style={styles.matchCard}
                    onPress={() => handleQuickDiagnose(msg.repair_match)}
                  >
                    <View style={styles.matchHeader}>
                      <MaterialCommunityIcons name="file-document-outline" size={16} color="#E5E5E5" />
                      <Text style={styles.matchTitle}>{msg.repair_match.title}</Text>
                    </View>
                    <Text style={styles.matchDiff}>Difficulty: {msg.repair_match.difficulty}</Text>
                    <Text style={styles.matchAction}>{t('tapFullReport')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#A3A3A3" size="small" />
              <Text style={styles.loadingText}>{t('analyzing')}</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            testID="chat-message-input"
            style={styles.chatInput}
            placeholder={t('describeIssue')}
            placeholderTextColor="#737373"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            testID="chat-send-button"
            style={[styles.sendBtn, (!message.trim() || loading) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!message.trim() || loading}
          >
            <MaterialCommunityIcons name="send" size={20} color={message.trim() && !loading ? '#000' : '#737373'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#333333',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#FFFFFF' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#333333', borderRadius: 4 },
  newBtnText: { fontSize: 12, color: '#A3A3A3', fontWeight: '600' },
  vehicleBar: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#1F1F1F',
  },
  vehicleInput: {
    flex: 1, backgroundColor: '#141414', borderWidth: 1, borderColor: '#333333',
    borderRadius: 4, color: '#FFFFFF', fontSize: 13, paddingHorizontal: 10, paddingVertical: 8,
  },
  messagesContent: { padding: 20, paddingBottom: 10 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: '#A3A3A3', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#737373', textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 40 },
  msgRow: { marginBottom: 12, alignItems: 'flex-start' },
  msgRowUser: { alignItems: 'flex-end' },
  msgBubble: { maxWidth: '85%', borderRadius: 4, padding: 14 },
  userBubble: { backgroundColor: '#292929', borderWidth: 1, borderColor: '#4D4D4D' },
  aiBubble: { backgroundColor: '#1F1F1F', borderWidth: 1, borderColor: '#333333' },
  aiLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  aiLabelText: { fontSize: 10, color: '#737373', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  msgText: { fontSize: 14, color: '#FFFFFF', lineHeight: 21 },
  matchCard: {
    marginTop: 12, backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#4D4D4D',
    borderRadius: 4, padding: 12,
  },
  matchHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  matchTitle: { fontSize: 14, fontWeight: '600', color: '#E5E5E5' },
  matchDiff: { fontSize: 12, color: '#A3A3A3', marginBottom: 4 },
  matchAction: { fontSize: 11, color: '#3B82F6', fontWeight: '600' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  loadingText: { fontSize: 13, color: '#737373' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#333333', backgroundColor: '#141414',
  },
  chatInput: {
    flex: 1, backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#333333',
    borderRadius: 4, color: '#FFFFFF', fontSize: 15, paddingHorizontal: 14,
    paddingVertical: 10, marginRight: 10, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#292929' },
});
