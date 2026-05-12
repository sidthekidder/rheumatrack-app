import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { notify } from '../../lib/notify';
import { useT } from '@/lib/i18n/useT';

export default function ForgotPasswordScreen() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      notify(t('auth_error'), error.message);
      return;
    }
    notify(t('auth_email_sent'), t('auth_check_inbox'));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth_reset_password')}</Text>
      <Text style={styles.subtitle}>
        {t('auth_reset_subtitle')}
      </Text>

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

      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t('auth_sending') : t('auth_send_reset_link')}</Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" style={styles.link}>{t('auth_back_to_sign_in')}</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.muted, textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, color: Colors.text, backgroundColor: Colors.background },
  button: { backgroundColor: Colors.primary, borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { color: Colors.primary, fontSize: 14, textAlign: 'center', marginTop: 20 },
});
