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
  const { authHeaders, token } = useAuth();
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
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) Object.assign(headers, authHeaders());
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST', headers,
        body: JSON.stringify({ session_id: sessionId, vehicle: { year, make, model, engine: '' }, message: text, language: i18n.language }),
      });
      const data = await res.json();
      setSessionId(data.session_id || sessionId);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply || 'No response', repair_match: data.repair_match };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [message, loading, sessionId, year, make, model, token, authHeaders, i18n.language]);

  const handleQuickDiagnose = useCallback(async (match: any) => {
    try {
      setLoading(true);
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) Object.assign(headers, authHeaders());
      const res = await fetch(`${API}/api/diagnose`, {
        method: 'POST', headers,
        body: JSON.stringify({ vehicle: { year, make, model, engine: '' }, issue: match.title || '', verified_diagnosis: match.key || '', language: i18n.language }),
      });
      const data = await res.json();
      if (data.id) router.push({ pathname: '/results', params: { id: data.id } });
    } catch (e) {} finally { setLoading(false); }
  }, [year, make, model, router, token, authHeaders, i18n.language]);

  const startNew = () => { setMessages([]); setSessionId(''); setShowVehicle(true); };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <MaterialCommunityIcons name="chat-processing-outline" size={22} color="#E62020" />
            <Text style={s.headerTitle}>{t('aiDiagnosis')}</Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity testID="new-chat-button" onPress={startNew} style={s.newBtn}>
              <MaterialCommunityIcons name="plus" size={16} color="#E62020" />
              <Text style={s.newBtnText}>{t('newChat')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {showVehicle && (
          <View style={s.vehicleBar}>
            <TextInput testID="chat-input-year" style={s.vehicleInput} placeholder={t('year')} placeholderTextColor="#555" value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} />
            <TextInput testID="chat-input-make" style={s.vehicleInput} placeholder={t('make')} placeholderTextColor="#555" value={make} onChangeText={setMake} />
            <TextInput testID="chat-input-model" style={s.vehicleInput} placeholder={t('model')} placeholderTextColor="#555" value={model} onChangeText={setModel} />
          </View>
        )}

        <ScrollView ref={scrollRef} style={s.flex} contentContainerStyle={s.msgContent}>
          {messages.length === 0 && (
            <View style={s.empty}>
              <MaterialCommunityIcons name="engine" size={52} color="#E62020" style={{ opacity: 0.4 }} />
              <Text style={s.emptyTitle}>{t('describeVehicleIssue')}</Text>
              <Text style={s.emptyText}>{t('describeSymptoms')}</Text>
            </View>
          )}
          {messages.map(msg => (
            <View key={msg.id} style={[s.msgRow, msg.role === 'user' && s.msgRowUser]}>
              <View style={[s.msgBubble, msg.role === 'user' ? s.userBubble : s.aiBubble]}>
                {msg.role === 'assistant' && (
                  <View style={s.aiLabel}>
                    <MaterialCommunityIcons name="wrench" size={12} color="#E62020" />
                    <Text style={s.aiLabelText}>FixPilot</Text>
                  </View>
                )}
                <Text style={s.msgText}>{msg.content}</Text>
                {msg.repair_match && (
                  <TouchableOpacity testID={`view-report-${msg.id}`} style={s.matchCard} onPress={() => handleQuickDiagnose(msg.repair_match)}>
                    <View style={s.matchHeader}>
                      <MaterialCommunityIcons name="file-document-outline" size={16} color="#E62020" />
                      <Text style={s.matchTitle}>{msg.repair_match.title}</Text>
                    </View>
                    <Text style={s.matchDiff}>{t('difficulty')}: {msg.repair_match.difficulty}</Text>
                    <Text style={s.matchAction}>{t('tapFullReport')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          {loading && (
            <View style={s.loadingRow}>
              <ActivityIndicator color="#E62020" size="small" />
              <Text style={s.loadingText}>{t('analyzing')}</Text>
            </View>
          )}
        </ScrollView>

        <View style={s.inputBar}>
          <TextInput testID="chat-message-input" style={s.chatInput} placeholder={t('describeIssue')}
            placeholderTextColor="#555" value={message} onChangeText={setMessage} multiline maxLength={1000} onSubmitEditing={sendMessage} />
          <TouchableOpacity testID="chat-send-button"
            style={[s.sendBtn, (!message.trim() || loading) && s.sendBtnOff]}
            onPress={sendMessage} disabled={!message.trim() || loading}>
            <MaterialCommunityIcons name="send" size={20} color={message.trim() && !loading ? '#FFF' : '#555'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: '#E62020', borderRadius: 6 },
  newBtnText: { fontSize: 12, color: '#E62020', fontWeight: '700' },
  vehicleBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1F1F1F' },
  vehicleInput: { flex: 1, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 8, color: '#FFF', fontSize: 13, paddingHorizontal: 10, paddingVertical: 8 },
  msgContent: { padding: 20, paddingBottom: 10 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: '#CCC', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#777', textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 32 },
  msgRow: { marginBottom: 12, alignItems: 'flex-start' },
  msgRowUser: { alignItems: 'flex-end' },
  msgBubble: { maxWidth: '85%', borderRadius: 10, padding: 14 },
  userBubble: { backgroundColor: '#E62020', borderWidth: 0 },
  aiBubble: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A' },
  aiLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  aiLabelText: { fontSize: 10, color: '#E62020', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  msgText: { fontSize: 14, color: '#FFF', lineHeight: 21 },
  matchCard: { marginTop: 12, backgroundColor: '#111', borderWidth: 1.5, borderColor: '#E62020', borderRadius: 8, padding: 12 },
  matchHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  matchTitle: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  matchDiff: { fontSize: 12, color: '#AAA', marginBottom: 4 },
  matchAction: { fontSize: 11, color: '#E62020', fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  loadingText: { fontSize: 13, color: '#E62020' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#2A2A2A', backgroundColor: '#141414' },
  chatInput: { flex: 1, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 8, color: '#FFF', fontSize: 15, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, backgroundColor: '#E62020', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sendBtnOff: { backgroundColor: '#222' },
});
