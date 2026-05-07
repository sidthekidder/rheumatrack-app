import { Defs, LinearGradient, Path, Circle, Stop, Svg } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

/**
 * RheumaTrack logo: two curved arcs (articular surfaces) + horizontal pulse
 * line through a center dot. Teal → blue gradient (135deg).
 */
export default function Logo({ size = 64 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0D9488" />
          <Stop offset="1" stopColor="#0284C7" />
        </LinearGradient>
      </Defs>
      <Path d="M 16 22 Q 32 6 48 22" stroke="url(#logoGrad)" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M 16 42 Q 32 58 48 42" stroke="url(#logoGrad)" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M 4 32 L 22 32 L 26 26 L 30 38 L 34 32 L 60 32" stroke="url(#logoGrad)" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={32} cy={32} r={3} fill="url(#logoGrad)" />
    </Svg>
  );
}
