import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from './auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);
    const err = await login(email.trim(), password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="wrench" size={36} color="#E5E5E5" />
            <Text style={styles.logo}>FixPilot</Text>
            <Text style={styles.subtitle}>AI Mechanic Assistant</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Sign In</Text>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>EMAIL</Text>
            <TextInput testID="login-email" style={styles.input} placeholder="you@email.com" placeholderTextColor="#737373"
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput testID="login-password" style={styles.input} placeholder="Enter password" placeholderTextColor="#737373"
              value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity testID="login-submit" style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.buttonText}>Sign In</Text>}
            </TouchableOpacity>

            <TouchableOpacity testID="go-to-register" style={styles.linkBtn} onPress={() => router.push('/register')}>
              <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Create one</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 36, fontWeight: '300', color: '#FFFFFF', letterSpacing: -1, marginTop: 12 },
  subtitle: { fontSize: 13, color: '#737373', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 },
  form: {},
  formTitle: { fontSize: 20, fontWeight: '500', color: '#FFFFFF', marginBottom: 20 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1F1F1F', borderWidth: 1, borderColor: '#EF4444', borderRadius: 4, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, color: '#EF4444', flex: 1 },
  label: { fontSize: 10, fontWeight: '700', color: '#737373', letterSpacing: 2, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#333333', borderRadius: 4, color: '#FFFFFF', fontSize: 15, paddingHorizontal: 14, paddingVertical: 12 },
  button: { backgroundColor: '#FFFFFF', borderRadius: 4, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#000' },
  linkBtn: { alignItems: 'center', marginTop: 20 },
  linkText: { fontSize: 14, color: '#737373' },
  linkBold: { color: '#E5E5E5', fontWeight: '600' },
});
