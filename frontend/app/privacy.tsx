import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EFFECTIVE_DATE = 'June 1, 2025';
const SUPPORT_EMAIL = 'support@tryfixpilot.com';
const COMPANY_NAME = 'FixPilot';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const canGoBack = Platform.OS !== 'web' || (typeof window !== 'undefined' && window.history.length > 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        {canGoBack ? (
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack && router.canGoBack()) router.back();
              else router.replace('/');
            }}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h1}>FixPilot Privacy Policy</Text>
        <Text style={styles.meta}>Effective date: {EFFECTIVE_DATE}</Text>

        <Text style={styles.p}>
          {COMPANY_NAME} ("we", "us", or "our") operates the FixPilot mobile application and the website
          tryfixpilot.com (collectively, the "Service"). This Privacy Policy explains what information we
          collect, how we use it, and the choices you have. By using the Service, you agree to this Policy.
        </Text>

        <Text style={styles.h2}>1. Information We Collect</Text>
        <Text style={styles.p}>We collect the following categories of information:</Text>
        <Text style={styles.li}>
          <Text style={styles.bold}>Account Information:</Text> your email address and password hash when you
          create an account. We never store your plaintext password.
        </Text>
        <Text style={styles.li}>
          <Text style={styles.bold}>Vehicle & Diagnostic Data:</Text> vehicle year, make, model, engine, and the
          symptom descriptions you submit for AI diagnosis. This data is associated with your account to power
          your diagnostic history.
        </Text>
        <Text style={styles.li}>
          <Text style={styles.bold}>Location (optional):</Text> with your permission, we use your device's
          approximate or precise location solely to find nearby auto repair shops on demand. Location is not
          stored on our servers.
        </Text>
        <Text style={styles.li}>
          <Text style={styles.bold}>Payment Information:</Text> subscription payments are processed by Stripe.
          We do not receive or store your full card number. We store only a Stripe customer ID and subscription
          status.
        </Text>
        <Text style={styles.li}>
          <Text style={styles.bold}>Push Notification Tokens:</Text> if you opt in, we store the device push
          token so we can notify you when a diagnosis is complete.
        </Text>
        <Text style={styles.li}>
          <Text style={styles.bold}>Usage Data:</Text> basic, non-identifying logs (API requests, error events)
          used to keep the Service reliable.
        </Text>

        <Text style={styles.h2}>2. How We Use Your Information</Text>
        <Text style={styles.li}>• Provide AI-powered vehicle diagnoses and repair guidance.</Text>
        <Text style={styles.li}>• Show nearby mechanics when you request them.</Text>
        <Text style={styles.li}>• Manage your FixPilot Pro subscription and billing.</Text>
        <Text style={styles.li}>• Send transactional notifications related to your diagnoses.</Text>
        <Text style={styles.li}>• Improve the Service, fix bugs, and prevent abuse.</Text>

        <Text style={styles.h2}>3. Third-Party Services</Text>
        <Text style={styles.p}>
          We rely on trusted third parties to provide parts of the Service. Your data may be processed by:
        </Text>
        <Text style={styles.li}>
          <Text style={styles.bold}>OpenAI (GPT):</Text> the symptom text and vehicle context you submit are
          sent to OpenAI to generate the diagnosis. Do not include personal identifiers in your symptom
          descriptions.
        </Text>
        <Text style={styles.li}>
          <Text style={styles.bold}>Stripe:</Text> processes subscription payments and handles card data
          directly under Stripe's privacy policy.
        </Text>
        <Text style={styles.li}>
          <Text style={styles.bold}>Google Maps / Places API:</Text> used to return nearby auto repair shops
          based on the coordinates you provide at the moment of the request.
        </Text>
        <Text style={styles.li}>
          <Text style={styles.bold}>Expo Push Notifications:</Text> used to deliver optional push
          notifications to your device.
        </Text>
        <Text style={styles.li}>
          <Text style={styles.bold}>MongoDB Atlas / hosting providers:</Text> store account and diagnosis data
          in secured cloud databases.
        </Text>

        <Text style={styles.h2}>4. Data Retention</Text>
        <Text style={styles.p}>
          We retain your account and diagnostic history for as long as your account is active. You can request
          deletion of your account and associated data at any time by emailing us at {SUPPORT_EMAIL}. We will
          complete verified deletion requests within 30 days, except where retention is required by law (for
          example, billing records).
        </Text>

        <Text style={styles.h2}>5. Children's Privacy</Text>
        <Text style={styles.p}>
          FixPilot is not directed to children under 13. We do not knowingly collect personal information from
          children under 13. If you believe a child has provided us personal information, contact us and we
          will delete it.
        </Text>

        <Text style={styles.h2}>6. Your Rights</Text>
        <Text style={styles.p}>
          Depending on your jurisdiction (including the EU, UK, and California), you may have the right to
          access, correct, delete, or port your personal information, and to object to or restrict certain
          processing. To exercise these rights, email {SUPPORT_EMAIL}.
        </Text>

        <Text style={styles.h2}>7. Security</Text>
        <Text style={styles.p}>
          We use industry-standard measures including encrypted transport (HTTPS), hashed passwords, and
          access controls. No method of transmission or storage is 100% secure; we cannot guarantee absolute
          security.
        </Text>

        <Text style={styles.h2}>8. International Transfers</Text>
        <Text style={styles.p}>
          Your information may be processed in the United States or other countries where our service
          providers operate. By using the Service, you consent to this transfer.
        </Text>

        <Text style={styles.h2}>9. Changes to This Policy</Text>
        <Text style={styles.p}>
          We may update this Policy from time to time. Material changes will be announced in the app or on
          our website. The "Effective date" above indicates the latest revision.
        </Text>

        <Text style={styles.h2}>10. Contact Us</Text>
        <Text style={styles.p}>If you have any questions about this Privacy Policy, contact:</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
          <Text style={styles.link}>{SUPPORT_EMAIL}</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>© {new Date().getFullYear()} FixPilot. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222',
    backgroundColor: '#111',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  h1: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 6 },
  meta: { color: '#888', fontSize: 13, marginBottom: 20 },
  h2: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  p: {
    color: '#CFCFCF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  li: {
    color: '#CFCFCF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
    paddingLeft: 4,
  },
  bold: { color: '#FFF', fontWeight: '600' },
  link: {
    color: '#E62020',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  footer: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
  },
});
