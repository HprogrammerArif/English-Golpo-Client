import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

interface CustomInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  showEye?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: (visible: boolean) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  textContentType?: "none" | "name" | "emailAddress" | "password" | "username" | "oneTimeCode" | "newPassword" | "familyName" | "givenName" | "telephoneNumber" | "URL";
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function CustomInput({
  label,
  placeholder = "Enter text",
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  showEye = false,
  passwordVisible = false,
  onTogglePassword,
  onFocus: externalOnFocus,
  onBlur: externalOnBlur,
  autoCapitalize = "none",
  autoCorrect = false,
  textContentType,
  editable = true,
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            !editable && styles.inputDisabled,
            showEye && styles.inputWithEye,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !passwordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          editable={editable}
          onFocus={() => { setIsFocused(true); externalOnFocus?.(); }}
          onBlur={() => { setIsFocused(false); externalOnBlur?.(); }}
        />
        {showEye && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => onTogglePassword?.(!passwordVisible)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", marginBottom: 4 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  inputRow: { position: "relative" },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },
  inputFocused: {
    borderColor: "#2B7FFF",
    backgroundColor: "#fff",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
  },
  inputWithEye: { paddingRight: 46 },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 16,
  },
});
