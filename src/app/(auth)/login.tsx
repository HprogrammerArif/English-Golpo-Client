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
import CustomInput from "@/components/CustomInput";
import { GradientButton } from "@/components/GradientButton";
import { useAppDispatch } from "@/redux/hooks";
import { useLoginPhoneMutation, useVerifyOtpMutation } from "@/redux/api/authApi";
import { setCredentials } from "@/redux/features/auth/authSlice";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const [loginPhone] = useLoginPhoneMutation();
  const [verifyOtp] = useVerifyOtpMutation();

  const handleRequestOtp = async () => {
    if (!phone || phone.length < 9) {
      return Alert.alert("Error", "Please enter a valid phone number.");
    }

    setIsLoading(true);
    try {
      // Ensure phone contains country code if not present, e.g. Bangladesh code +880
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith("+")) {
        if (formattedPhone.startsWith("0")) {
          formattedPhone = "+88" + formattedPhone;
        } else {
          formattedPhone = "+880" + formattedPhone;
        }
      }

      await loginPhone({ phone: formattedPhone }).unwrap();
      setPhone(formattedPhone);
      setOtpSent(true);
      Toast.show({
        type: "info",
        text1: "Verification Code Sent 💬",
        text2: "Use development code '1234' to verify.",
      });
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message ?? "Failed to send OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!code || code.length < 4) {
      return Alert.alert("Error", "Please enter the verification code.");
    }

    setIsLoading(true);
    try {
      const response = await verifyOtp({ phone, code: code.trim() }).unwrap();
      dispatch(setCredentials({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      }));

      Toast.show({
        type: "success",
        text1: `Welcome back, ${response.user.name || "Learner"}! 🎉`,
      });

      router.replace("/(app)/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message ?? "Invalid or expired verification code.");
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
          <Text style={styles.heading}>Welcome back 👋</Text>
          <Text style={styles.sub}>Sign in using your mobile number</Text>

          {/* Form */}
          <View style={styles.form}>
            {!otpSent ? (
              <>
                <CustomInput
                  label="Phone Number"
                  placeholder="+8801712345678"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                />
                <GradientButton
                  title="Send Verification Code"
                  onPress={handleRequestOtp}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <>
                <View className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-2">
                  <Text className="text-sm font-semibold text-emerald-800">
                    Code sent to {phone}
                  </Text>
                  <Text className="text-xs text-emerald-600 mt-1">
                    (Tip: Enter "1234" for development sandbox)
                  </Text>
                </View>
                
                <CustomInput
                  label="Verification Code (OTP)"
                  placeholder="e.g. 1234"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="numeric"
                  textContentType="oneTimeCode"
                />
                <GradientButton
                  title="Verify & Sign In"
                  onPress={handleVerifyOtp}
                  isLoading={isLoading}
                />
                
                <TouchableOpacity
                  onPress={() => setOtpSent(false)}
                  className="mt-2 items-center"
                >
                  <Text className="text-xs text-gray-500 font-semibold underline">
                    Change Phone Number
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <Link href="/(auth)/welcome" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Get Started</Text>
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
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },
  heading: { fontSize: 30, fontWeight: "800", color: "#111827", marginBottom: 6, letterSpacing: -0.3 },
  sub: { fontSize: 15, color: "#6B7280", marginBottom: 32 },
  form: { gap: 14 },
  footer: { flexDirection: "row", justifyContent: "center", paddingTop: 14 },
  footerText: { color: "#6B7280", fontSize: 14 },
  footerLink: { color: "#10B981", fontWeight: "700", fontSize: 14 },
});
