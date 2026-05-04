import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { notify } from '../../lib/notify';

export default function ProfileScreen() {
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) notify('Error', error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <Text style={styles.body}>Your profile details will appear here.</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.background },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: Colors.text },
  body: { fontSize: 14, color: Colors.muted, marginBottom: 32 },
  button: { borderWidth: 1, borderColor: Colors.error, borderRadius: 8, padding: 12, paddingHorizontal: 24 },
  buttonText: { color: Colors.error, fontWeight: '600' },
});
