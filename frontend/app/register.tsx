import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from './auth-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) return;
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    const err = await register(name.trim(), email.trim(), password);
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
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Create Account</Text>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>NAME</Text>
            <TextInput testID="register-name" style={styles.input} placeholder="Your name" placeholderTextColor="#737373"
              value={name} onChangeText={setName} />

            <Text style={styles.label}>EMAIL</Text>
            <TextInput testID="register-email" style={styles.input} placeholder="you@email.com" placeholderTextColor="#737373"
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput testID="register-password" style={styles.input} placeholder="Min 6 characters" placeholderTextColor="#737373"
              value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity testID="register-submit" style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.buttonText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity testID="go-to-login" style={styles.linkBtn} onPress={() => router.push('/login')}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
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
