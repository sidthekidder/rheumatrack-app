import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: 'Sign In · RheumaTrack' }} />
      <Stack.Screen name="register" options={{ title: 'Create Account · RheumaTrack' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Reset Password · RheumaTrack' }} />
    </Stack>
  );
}
