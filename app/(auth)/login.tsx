import { useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { notify } from '../../lib/notify';
import { useT } from '@/lib/i18n/useT';

export default function LoginScreen() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      notify(t('auth_sign_in_failed'), error.message);
      return;
    }
    // On success keep the spinner — the auth gate will route us away once the
    // session listener fires and the patient query resolves; this screen will
    // unmount before we'd ever clear loading.
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>RheumaTrack</Text>

      <TextInput
        style={styles.input}
        placeholder={t('auth_email')}
        placeholderTextColor={Colors.muted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth_password')}
        placeholderTextColor={Colors.muted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.buttonRow}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.buttonText}>{t('auth_signing_in')}</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>{t('auth_sign_in')}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Link href="/(auth)/register" style={styles.link}>{t('auth_create_account_link')}</Link>
        <Link href="/(auth)/forgot-password" style={styles.link}>{t('auth_forgot_password')}</Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: Colors.text },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, color: Colors.text, backgroundColor: Colors.background },
  button: { backgroundColor: Colors.primary, borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  link: { color: Colors.primary, fontSize: 14 },
});
