import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CustomInput from "@/components/CustomInput";
import { GradientButton } from "@/components/GradientButton";

type Step = "input" | "success";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("input");

  const handleSubmit = async () => {
    if (!email) {
      return Alert.alert("Error", "Please enter your email address.");
    }

    setIsLoading(true);
    try {
      // TODO: Wire up RTK Query
      // await forgotPassword({ email: email.trim().toLowerCase() }).unwrap();

      await new Promise((r) => setTimeout(r, 800)); // remove when RTK is wired
      setStep("success");
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-outline" size={44} color="#2B7FFF" />
          </View>
          <Text style={styles.successTitle}>Check your inbox</Text>
          <Text style={styles.successDesc}>
            We sent a password reset link to{"\n"}
            <Text style={styles.successEmail}>{email}</Text>
          </Text>
          <GradientButton
            title="Back to Sign In"
            onPress={() => router.replace("/(auth)/login")}
          />
          <TouchableOpacity
            style={styles.resendBtn}
            onPress={() => setStep("input")}
          >
            <Text style={styles.resendText}>Didn&apos;t receive it? Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.heading}>Forgot Password?</Text>
          <Text style={styles.sub}>
            Enter the email associated with your account and we&apos;ll send a reset link.
          </Text>

          <View style={styles.form}>
            <CustomInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <GradientButton
              title="Send Reset Link"
              onPress={handleSubmit}
              isLoading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  heading: { fontSize: 28, fontWeight: "800", color: "#111827", marginBottom: 10, letterSpacing: -0.3 },
  sub: { fontSize: 15, color: "#6B7280", lineHeight: 22, marginBottom: 28 },
  form: { gap: 14 },
  // Success state
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: { fontSize: 24, fontWeight: "800", color: "#111827" },
  successDesc: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 22 },
  successEmail: { color: "#111827", fontWeight: "600" },
  resendBtn: { paddingVertical: 4 },
  resendText: { color: "#2B7FFF", fontSize: 14, fontWeight: "600" },
});
