import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async () => {
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setMessage(data.message || 'Check your email for a reset link.');
      if (data.reset_token) setToken(data.reset_token);
      setStep('reset');
    } catch (e) {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!token || !newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Reset failed'); setLoading(false); return; }
      setStep('done');
    } catch (e) {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <TouchableOpacity testID="forgot-back" style={styles.backRow} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#A3A3A3" />
            <Text style={styles.backText}>Back to login</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <MaterialCommunityIcons name="lock-reset" size={36} color="#E5E5E5" />
            <Text style={styles.title}>
              {step === 'email' ? 'Forgot Password' : step === 'reset' ? 'Reset Password' : 'Password Reset'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {step === 'email' && (
            <View>
              <Text style={styles.desc}>Enter your email and we'll send you a reset code.</Text>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput testID="forgot-email" style={styles.input} placeholder="you@email.com" placeholderTextColor="#737373"
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <TouchableOpacity testID="forgot-submit" style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleForgot} disabled={loading}>
                {loading ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.buttonText}>Send Reset Code</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 'reset' && (
            <View>
              <Text style={styles.desc}>{message}</Text>
              <Text style={styles.label}>RESET TOKEN</Text>
              <TextInput testID="reset-token" style={styles.input} placeholder="Paste reset token" placeholderTextColor="#737373"
                value={token} onChangeText={setToken} />
              <Text style={styles.label}>NEW PASSWORD</Text>
              <TextInput testID="reset-new-password" style={styles.input} placeholder="Min 6 characters" placeholderTextColor="#737373"
                value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              <TouchableOpacity testID="reset-submit" style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleReset} disabled={loading}>
                {loading ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.buttonText}>Reset Password</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 'done' && (
            <View>
              <View style={styles.successBox}>
                <MaterialCommunityIcons name="check-circle-outline" size={20} color="#22C55E" />
                <Text style={styles.successText}>Password has been reset successfully!</Text>
              </View>
              <TouchableOpacity testID="back-to-login" style={styles.button} onPress={() => router.replace('/login')}>
                <Text style={styles.buttonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, position: 'absolute', top: 20, left: 24 },
  backText: { fontSize: 14, color: '#A3A3A3' },
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: '500', color: '#FFFFFF', marginTop: 12 },
  desc: { fontSize: 14, color: '#A3A3A3', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 10, fontWeight: '700', color: '#737373', letterSpacing: 2, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#333333', borderRadius: 4, color: '#FFFFFF', fontSize: 15, paddingHorizontal: 14, paddingVertical: 12 },
  button: { backgroundColor: '#FFFFFF', borderRadius: 4, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#000' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1F1F1F', borderWidth: 1, borderColor: '#EF4444', borderRadius: 4, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, color: '#EF4444', flex: 1 },
  successBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1F1F1F', borderWidth: 1, borderColor: '#22C55E', borderRadius: 4, padding: 16, marginBottom: 12 },
  successText: { fontSize: 14, color: '#22C55E', flex: 1 },
});
