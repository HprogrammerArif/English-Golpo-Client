import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from "react-native";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost";
}

export function GradientButton({
  title,
  onPress,
  isLoading = false,
  leftIcon,
  disabled = false,
  variant = "primary",
}: GradientButtonProps) {
  const isDisabled = isLoading || disabled;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.btn,
        variant === "primary" && styles.primary,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        isDisabled && styles.disabled,
      ]}
    >
      {leftIcon && !isLoading && <View style={styles.iconWrap}>{leftIcon}</View>}
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === "primary" ? "#fff" : "#2B7FFF"} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "outline" && styles.textOutline,
            variant === "ghost" && styles.textGhost,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: "#2B7FFF" },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#2B7FFF",
  },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.55 },
  iconWrap: { marginRight: 8 },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  textOutline: { color: "#2B7FFF" },
  textGhost: { color: "#2B7FFF" },
});
