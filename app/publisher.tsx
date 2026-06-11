import { ScrollView, Text, View } from 'react-native';
import { Stack } from 'expo-router';

const LAST_UPDATED = '2026-06-11';
const LEGAL_NAME = 'NIKALAS PHARMACY';
const SUPPORT_EMAIL = 'rheumatrack.support@gmail.com';
const ADDRESS_LINE_1 = '29/2, Nikalas Tower, Central Bazar Road';
const ADDRESS_LINE_2 = 'Ramdas Peth, Nagpur, Maharashtra 440010, India';

export default function Publisher() {
  return (
    <>
      <Stack.Screen options={{ title: 'About the Publisher', headerShown: true }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: 'white' }}
        contentContainerStyle={{ padding: 20, paddingBottom: 60, maxWidth: 720, alignSelf: 'center' }}
      >
        <H1>About the Publisher</H1>
        <Meta>Last updated: {LAST_UPDATED}</Meta>

        <H2>Who we are</H2>
        <P>
          <B>{LEGAL_NAME}</B> is a registered Indian pharmacy partnership
          based in Nagpur, Maharashtra. We publish the <B>RheumaTrack</B>{' '}
          mobile and web application — a self-tracking journal for people
          living with rheumatic conditions. It helps patients record daily
          symptoms, medications, and lab values to share with their treating
          rheumatologist.
        </P>

        <H2>Business details</H2>
        <Bullet><B>Legal name:</B> {LEGAL_NAME}</Bullet>
        <Bullet><B>Constitution:</B> Partnership Firm</Bullet>
        <Bullet><B>Registered address:</B> {ADDRESS_LINE_1}, {ADDRESS_LINE_2}</Bullet>
        <Bullet><B>Country of operation:</B> India</Bullet>

        <H2>Products</H2>
        <Bullet>
          <B>RheumaTrack</B> — a daily diary and medication tracker for
          patients with rheumatoid arthritis, lupus, ankylosing spondylitis,
          psoriatic arthritis, and other rheumatic conditions. Available on
          Google Play and at{' '}
          <B>https://rheumatrack-app.vercel.app</B>.
        </Bullet>

        <H2>Contact</H2>
        <P>
          For support, privacy, or business queries, email{' '}
          <B>{SUPPORT_EMAIL}</B>.
        </P>
        <P>
          See also our{' '}
          <B>privacy policy</B> at https://rheumatrack-app.vercel.app/privacy
          {' '}and our{' '}
          <B>account deletion instructions</B> at
          {' '}https://rheumatrack-app.vercel.app/delete-account.
        </P>
      </ScrollView>
    </>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 6, color: '#0F172A' }}>{children}</Text>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 22, marginBottom: 8, color: '#0F172A' }}>{children}</Text>;
}
function Meta({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>{children}</Text>;
}
function P({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 15, lineHeight: 22, color: '#0F172A', marginBottom: 10 }}>{children}</Text>;
}
function B({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontWeight: '700' }}>{children}</Text>;
}
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 6, paddingLeft: 4 }}>
      <Text style={{ fontSize: 15, color: '#0F172A', marginRight: 8 }}>•</Text>
      <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: '#0F172A' }}>{children}</Text>
    </View>
  );
}
