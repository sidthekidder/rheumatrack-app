import { ScrollView, Text, View } from 'react-native';
import { Stack } from 'expo-router';

const LAST_UPDATED = '2026-06-10';
const SUPPORT_EMAIL = 'rheumatrack.support@gmail.com';
const APP_NAME = 'RheumaTrack';

export default function DeleteAccount() {
  return (
    <>
      <Stack.Screen options={{ title: 'Delete Account', headerShown: true }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: 'white' }}
        contentContainerStyle={{ padding: 20, paddingBottom: 60, maxWidth: 720, alignSelf: 'center' }}
      >
        <H1>Delete your {APP_NAME} account</H1>
        <Meta>Last updated: {LAST_UPDATED}</Meta>

        <P>
          This page explains how to permanently delete your {APP_NAME} account
          and all data associated with it. {APP_NAME} is a personal medication
          and symptom tracking app for people living with rheumatic conditions.
        </P>

        <H2>Option 1: Delete from inside the app (recommended)</H2>
        <Bullet><B>Step 1.</B> Open the {APP_NAME} app on your phone.</Bullet>
        <Bullet><B>Step 2.</B> Sign in if you are not already signed in.</Bullet>
        <Bullet><B>Step 3.</B> Tap the <B>Me</B> tab at the bottom right.</Bullet>
        <Bullet><B>Step 4.</B> Open <B>Profile</B>.</Bullet>
        <Bullet><B>Step 5.</B> Scroll to the bottom and tap <B>Delete account</B>.</Bullet>
        <Bullet><B>Step 6.</B> Confirm the action in the dialog that appears. You will be signed out immediately.</Bullet>

        <H2>Option 2: Email request</H2>
        <P>
          If you cannot sign in (for example, you forgot your password or your
          email has changed), email <B>{SUPPORT_EMAIL}</B> from the address
          your account is registered under. Use the subject line{' '}
          <B>&ldquo;Delete my account&rdquo;</B>. We verify the request matches
          the registered email before processing.
        </P>

        <H2>What gets deleted</H2>
        <P>When your deletion request is processed, the following are permanently removed:</P>
        <Bullet>Your account credentials (email, password hash).</Bullet>
        <Bullet>Your profile (name, age, location, doctor contact, language and theme preferences).</Bullet>
        <Bullet>All diary entries (pain, stiffness, fatigue, affected joints, notes).</Bullet>
        <Bullet>All medications, medication-log entries, and reminder schedules.</Bullet>
        <Bullet>All lab reports and appointments you recorded.</Bullet>
        <Bullet>Any prescription images linked to your account.</Bullet>
        <Bullet>Your push notification token.</Bullet>

        <H2>What we may retain</H2>
        <P>
          For security, fraud prevention, and legal-compliance reasons, the
          following may be retained for up to 30 days after deletion before
          being purged:
        </P>
        <Bullet>Operational server logs (timestamp, route, IP).</Bullet>
        <Bullet>Anonymized records required by Indian law (DPDPA 2023) for audit.</Bullet>
        <P>
          We never share this retained data, never use it for marketing or
          model training, and purge it within 30 days.
        </P>

        <H2>Timeline</H2>
        <P>
          In-app deletion takes effect immediately for your access. Your data
          is fully purged from our active databases within{' '}
          <B>30 days</B> of the request, in line with our privacy policy.
        </P>

        <H2>Contact</H2>
        <P>
          Questions or grievances about deletion: <B>{SUPPORT_EMAIL}</B>.
          See also our{' '}
          <B>privacy policy</B> at https://rheumatrack-app.vercel.app/privacy.
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
