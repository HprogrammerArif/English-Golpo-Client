import { ComponentProps } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TabBarIconProps {
  focused: boolean;
  iconName: ComponentProps<typeof Ionicons>['name'];
  iconNameFocused: ComponentProps<typeof Ionicons>['name'];
  label: string;
  hasIndicator?: boolean;
}

/**
 * TabBarIcon — custom tab icon with label and optional notification dot.
 * Uses filled icon when focused, outline when not.
 */
export function TabBarIcon({
  focused,
  iconName,
  iconNameFocused,
  label,
  hasIndicator = false,
}: TabBarIconProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={focused ? iconNameFocused : iconName}
          size={24}
          color={focused ? "#2B7FFF" : "#9CA3AF"}
        />
        {hasIndicator && !focused && <View style={styles.dot} />}
      </View>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", gap: 3 },
  iconWrap: { position: "relative" },
  dot: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  label: { fontSize: 10, fontWeight: "500", color: "#9CA3AF" },
  labelFocused: { color: "#2B7FFF", fontWeight: "700" },
});
