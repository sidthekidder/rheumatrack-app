import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function MedicationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Medications</Text>
      <Text style={styles.body}>Your medication list will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.background },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: Colors.text },
  body: { fontSize: 14, color: Colors.muted },
});
