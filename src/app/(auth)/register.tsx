import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import Checkbox from "expo-checkbox";
import CustomInput from "@/components/CustomInput";
import { GradientButton } from "@/components/GradientButton";

// ─── Password strength rules ──────────────────────────────────────────────────
const PASSWORD_RULES = [
  { label: "At least 8 characters",         test: (p: string) => p.length >= 8 },
  { label: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "At least one number",           test: (p: string) => /[0-9]/.test(p) },
  { label: "At least one special character (!@#$%^&*)",
    test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function PasswordRequirements({ password, show }: { password: string; show: boolean }) {
  if (!show) return null;
  return (
    <View style={styles.pwdRules}>
      {PASSWORD_RULES.map((rule, i) => {
        const ok = rule.test(password);
        return (
          <View key={i} style={styles.pwdRow}>
            <Text style={[styles.pwdDot, ok && styles.pwdDotOk]}>
              {ok ? "✓" : "○"}
            </Text>
            <Text style={[styles.pwdRuleText, ok && styles.pwdRuleOk]}>
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [showPwdRules, setShowPwdRules] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password));

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      return Alert.alert("Error", "Please fill in all fields.");
    }
    if (!allRulesPassed) {
      return Alert.alert("Weak Password", "Please meet all password requirements.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }
    if (!acceptTerms) {
      return Alert.alert("Terms", "Please accept the Terms & Conditions to continue.");
    }

    setIsLoading(true);
    try {
      // TODO: dispatch RTK Query register mutation
      // const result = await register({ fullName, email, password }).unwrap();
      // dispatch(setCredentials(result));

      router.replace("/(app)" as any);
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message ?? "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.sub}>Join us — it only takes a minute</Text>

          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              label="Full Name"
              placeholder="John Doe"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              textContentType="name"
            />

            <CustomInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <CustomInput
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showEye
              passwordVisible={showPwd}
              onTogglePassword={setShowPwd}
              textContentType="newPassword"
              onFocus={() => setShowPwdRules(true)}
            />
            <PasswordRequirements password={password} show={showPwdRules && password.length > 0} />

            <CustomInput
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              showEye
              passwordVisible={showConfirmPwd}
              onTogglePassword={setShowConfirmPwd}
              textContentType="newPassword"
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text style={styles.mismatch}>Passwords do not match</Text>
            )}

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.8}
            >
              <Checkbox
                value={acceptTerms}
                onValueChange={setAcceptTerms}
                color={acceptTerms ? "#2B7FFF" : undefined}
                style={styles.checkbox}
              />
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {" & "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <GradientButton
              title="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              disabled={!acceptTerms}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  heading: { fontSize: 30, fontWeight: "800", color: "#111827", marginBottom: 6, letterSpacing: -0.3 },
  sub: { fontSize: 15, color: "#6B7280", marginBottom: 28 },
  form: { gap: 12 },
  mismatch: { fontSize: 12, color: "#EF4444", marginTop: -6 },
  pwdRules: { gap: 4, paddingVertical: 6, paddingHorizontal: 2 },
  pwdRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pwdDot: { fontSize: 13, color: "#D1D5DB", width: 14 },
  pwdDotOk: { color: "#10B981" },
  pwdRuleText: { fontSize: 12, color: "#9CA3AF" },
  pwdRuleOk: { color: "#10B981" },
  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 4 },
  checkbox: { width: 18, height: 18, marginTop: 2 },
  termsText: { flex: 1, fontSize: 13, color: "#6B7280", lineHeight: 20 },
  termsLink: { color: "#2B7FFF", fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", paddingTop: 4 },
  footerText: { color: "#6B7280", fontSize: 14 },
  footerLink: { color: "#2B7FFF", fontWeight: "700", fontSize: 14 },
});
