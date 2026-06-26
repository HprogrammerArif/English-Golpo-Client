import { useState, useEffect } from "react";
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
import * as SecureStore from "expo-secure-store";
import Checkbox from "expo-checkbox";
import CustomInput from "@/components/CustomInput";
import { GradientButton } from "@/components/GradientButton";
import { useAppDispatch } from "@/redux/hooks";
// import { useLoginMutation } from "@/redux/features/auth/authApi";
// import { setCredentials } from "@/redux/features/auth/authSlice";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  // const [login] = useLoginMutation();

  // Load saved credentials on mount (Remember Me)
  useEffect(() => {
    (async () => {
      const savedEmail = await SecureStore.getItemAsync("user_email");
      const savedPassword = await SecureStore.getItemAsync("user_password");
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter your email and password.");
    }

    setIsLoading(true);
    try {
      // TODO: Wire up RTK Query
      // const response = await login({ email: email.trim().toLowerCase(), password }).unwrap();
      // dispatch(setCredentials({ user: response.user, role: response.role, token: response.access, ... }));

      // Save / clear remember me
      if (rememberMe) {
        await SecureStore.setItemAsync("user_email", email.trim().toLowerCase());
        await SecureStore.setItemAsync("user_password", password);
      } else {
        await SecureStore.deleteItemAsync("user_email");
        await SecureStore.deleteItemAsync("user_password");
      }

      // Navigation is handled by the auth guard in (app)/_layout.tsx
      // after dispatch(setCredentials()) — no explicit router.replace needed
      router.replace("/(app)" as any);
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message ?? "Invalid email or password.");
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
          <Text style={styles.sub}>Sign in to continue</Text>

          {/* Form */}
          <View style={styles.form}>
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
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showEye
              passwordVisible={showPwd}
              onTogglePassword={setShowPwd}
              textContentType="password"
            />

            {/* Remember Me + Forgot Password */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <Checkbox
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  color={rememberMe ? "#2B7FFF" : undefined}
                  style={styles.checkbox}
                />
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <GradientButton title="Sign In" onPress={handleLogin} isLoading={isLoading} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Sign Up</Text>
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
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: { width: 18, height: 18 },
  rememberText: { fontSize: 14, color: "#374151" },
  forgotText: { fontSize: 14, color: "#2B7FFF", fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", paddingTop: 4 },
  footerText: { color: "#6B7280", fontSize: 14 },
  footerLink: { color: "#2B7FFF", fontWeight: "700", fontSize: 14 },
});
