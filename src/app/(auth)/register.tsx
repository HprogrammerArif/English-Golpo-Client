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
import { Link, router, useLocalSearchParams } from "expo-router";
import Checkbox from "expo-checkbox";
import CustomInput from "@/components/CustomInput";
import { GradientButton } from "@/components/GradientButton";
import { useAppDispatch } from "@/redux/hooks";
import { useRegisterPhoneMutation } from "@/redux/api/authApi";
import { setCredentials } from "@/redux/features/auth/authSlice";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const { path } = useLocalSearchParams();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const [registerPhone] = useRegisterPhoneMutation();

  const handleRegister = async () => {
    if (!fullName || !phone) {
      return Alert.alert("Error", "Please fill in your name and phone number.");
    }
    if (!acceptTerms) {
      return Alert.alert("Terms", "Please accept the Terms & Conditions to continue.");
    }

    setIsLoading(true);
    try {
      // Ensure phone contains country code, e.g. +880 for Bangladesh
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith("+")) {
        if (formattedPhone.startsWith("0")) {
          formattedPhone = "+88" + formattedPhone;
        } else {
          formattedPhone = "+880" + formattedPhone;
        }
      }

      const response = await registerPhone({
        name: fullName.trim(),
        phone: formattedPhone,
        email: email.trim() ? email.trim().toLowerCase() : undefined,
        password: password.trim() ? password.trim() : undefined,
        learningPath: (path as string) || "KIDS",
      }).unwrap();

      dispatch(setCredentials({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      }));

      Toast.show({
        type: "success",
        text1: "Account Created! 🎉",
        text2: `Welcome to English Golpo, ${response.user.name}!`,
      });

      router.replace("/(app)/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message ?? "Registration failed. Phone number may already be in use.");
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
          <Text style={styles.sub}>Join English Golpo to begin learning</Text>

          {/* Form */}
          <View style={styles.form}>
            {path && (
              <View className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-1 flex-row justify-between items-center">
                <Text className="text-sm font-semibold text-emerald-800">
                  Selected Path: {path}
                </Text>
                <Link href="/(auth)/welcome" asChild>
                  <TouchableOpacity>
                    <Text className="text-xs text-emerald-600 font-bold underline">Change</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            )}

            <CustomInput
              label="Full Name"
              placeholder="Rafi Ahmed"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              textContentType="name"
            />

            <CustomInput
              label="Phone Number"
              placeholder="+8801712345678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
            />

            <CustomInput
              label="Email Address (Optional)"
              placeholder="rafi@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCapitalize="none"
            />

            <CustomInput
              label="Password (Optional)"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              autoCapitalize="none"
            />

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.8}
            >
              <Checkbox
                value={acceptTerms}
                onValueChange={setAcceptTerms}
                color={acceptTerms ? "#10B981" : undefined}
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
  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 4 },
  checkbox: { width: 18, height: 18, marginTop: 2 },
  termsText: { flex: 1, fontSize: 13, color: "#6B7280", lineHeight: 20 },
  termsLink: { color: "#10B981", fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", paddingTop: 4 },
  footerText: { color: "#6B7280", fontSize: 14 },
  footerLink: { color: "#10B981", fontWeight: "700", fontSize: 14 },
});

