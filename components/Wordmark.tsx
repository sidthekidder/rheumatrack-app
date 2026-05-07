import { Text } from 'react-native';

interface WordmarkProps {
  size?: number;
}

/**
 * "RheumaTrack" wordmark: "Rheuma" in teal, "Track" in blue.
 * Replaces the v3.2 buggy "RheumTrack" rendering.
 */
export default function Wordmark({ size = 24 }: WordmarkProps) {
  return (
    <Text style={{ fontSize: size, fontWeight: '900', letterSpacing: -0.5 }}>
      <Text style={{ color: '#0D9488' }}>Rheuma</Text>
      <Text style={{ color: '#0284C7' }}>Track</Text>
    </Text>
  );
}
