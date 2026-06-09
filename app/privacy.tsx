import { ScrollView, Text, View } from 'react-native';
import { Stack } from 'expo-router';

const LAST_UPDATED = '2026-06-09';
const SUPPORT_EMAIL = 'support@rheumatrack.app';
const COMPANY = 'RheumaTrack';

export default function PrivacyPolicy() {
  return (
    <>
      <Stack.Screen options={{ title: 'Privacy Policy', headerShown: true }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: 'white' }}
        contentContainerStyle={{ padding: 20, paddingBottom: 60, maxWidth: 720, alignSelf: 'center' }}
      >
        <H1>Privacy Policy</H1>
        <Meta>Last updated: {LAST_UPDATED}</Meta>

        <P>
          {COMPANY} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates the RheumaTrack
          mobile and web application. This policy describes what personal data
          we collect, why we collect it, how we use and protect it, and the
          rights you have over your data under the Digital Personal Data
          Protection Act 2023 (India) and similar applicable laws.
        </P>

        <H2>1. Who is responsible</H2>
        <P>
          {COMPANY} is the Data Fiduciary for personal data processed through
          the app. You can reach us at <B>{SUPPORT_EMAIL}</B> for any privacy
          question or request.
        </P>

        <H2>2. What we collect</H2>
        <P>We collect only what the app needs to do its job:</P>
        <Bullet>
          <B>Account identifiers.</B> Email address (and password hash, managed
          by Supabase) when you sign up.
        </Bullet>
        <Bullet>
          <B>Profile.</B> Name, age, city/state/country, patient ID, doctor
          contact, language and theme preference.
        </Bullet>
        <Bullet>
          <B>Health data you enter.</B> Medicines, medication-log entries,
          diary entries (pain, stiffness, fatigue, affected joints, notes),
          lab reports, appointments.
        </Bullet>
        <Bullet>
          <B>Prescription images.</B> When you scan a prescription, the image
          is sent to Anthropic&rsquo;s Claude API for OCR extraction, then
          discarded by our servers. We do not retain the original image.
        </Bullet>
        <Bullet>
          <B>Device data for notifications.</B> Expo push token, used only to
          schedule local medication reminders. Not used for tracking.
        </Bullet>
        <Bullet>
          <B>Operational logs.</B> Standard server logs (timestamp, route, IP)
          retained for up to 30 days for security and debugging.
        </Bullet>
        <P>
          We do <B>not</B> collect location, contacts, advertising IDs, or
          analytics about your in-app behavior beyond what server logs
          incidentally record.
        </P>

        <H2>3. How we use your data</H2>
        <Bullet>To provide the medication tracking, diary, and reminder features.</Bullet>
        <Bullet>To extract medicines from prescription images you upload.</Bullet>
        <Bullet>To let admin/clinical staff (where applicable) review your records on your behalf.</Bullet>
        <Bullet>To debug failures and protect the service against abuse.</Bullet>
        <P>
          We do <B>not</B> sell your data. We do <B>not</B> use your health data
          to train AI models. We do <B>not</B> share your data with advertisers.
        </P>

        <H2>4. Third parties we share data with</H2>
        <Bullet>
          <B>Supabase</B> — hosts the database and authentication. Data is
          encrypted at rest and in transit.
        </Bullet>
        <Bullet>
          <B>Anthropic</B> — receives prescription images at the moment of
          scan, returns extracted medicine names + doses, and does not retain
          the image per their zero-retention API policy.
        </Bullet>
        <Bullet>
          <B>Railway / Vercel</B> — hosts our backend and web app.
        </Bullet>
        <Bullet>
          <B>Expo (EAS)</B> — delivers app updates and (if you opt in) push
          notifications.
        </Bullet>
        <P>
          These processors are bound by their own data-protection commitments.
          We do not transfer your data outside this set.
        </P>

        <H2>5. Where data is stored</H2>
        <P>
          The primary database and backend are hosted in <B>India (ap-south-1)</B>.
          Some processors (Anthropic, Vercel) may process data in other
          regions; transfers occur under those vendors&rsquo; standard
          contractual safeguards.
        </P>

        <H2>6. Your rights</H2>
        <Bullet>
          <B>Access.</B> See everything you&rsquo;ve recorded by opening the
          app — every entry is yours and editable.
        </Bullet>
        <Bullet>
          <B>Correction.</B> Edit any profile field, medicine, log, diary
          entry, or lab report from within the app.
        </Bullet>
        <Bullet>
          <B>Deletion.</B> Use the &ldquo;Delete account&rdquo; button in the
          Me → Profile tab, or email <B>{SUPPORT_EMAIL}</B>. We delete your
          account and all associated data within <B>30 days</B> of the request.
        </Bullet>
        <Bullet>
          <B>Withdraw consent.</B> Sign out and delete your account at any
          time. The app does not collect data after deletion.
        </Bullet>
        <Bullet>
          <B>Grievance.</B> If you believe your rights have been violated,
          email <B>{SUPPORT_EMAIL}</B> with subject &ldquo;Privacy
          grievance&rdquo;. We respond within 7 working days.
        </Bullet>

        <H2>7. Children</H2>
        <P>
          RheumaTrack is intended for users 18 years or older. If you believe a
          child has an account, email us and we will delete it.
        </P>

        <H2>8. Security</H2>
        <P>
          Data is encrypted in transit (HTTPS) and at rest (Supabase Postgres
          on AWS). Authentication uses ES256-signed JWTs. Database access is
          gated by row-level security policies so each user can only read
          their own records.
        </P>

        <H2>9. Changes to this policy</H2>
        <P>
          We&rsquo;ll update this page when our practices change. The
          &ldquo;Last updated&rdquo; date at the top will reflect the most
          recent revision.
        </P>

        <H2>10. Contact</H2>
        <P>
          Email: <B>{SUPPORT_EMAIL}</B>
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
