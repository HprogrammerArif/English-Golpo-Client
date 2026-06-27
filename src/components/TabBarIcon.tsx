import { ComponentProps } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TabBarIconProps {
  focused: boolean;
  iconName: ComponentProps<typeof Ionicons>['name'];
  iconNameFocused: ComponentProps<typeof Ionicons>['name'];
  label: string;
  hasIndicator?: boolean;
  emoji?: string;
}

/**
 * TabBarIcon — vibrant custom tab icon pill for English Golpo.
 * Active state gets a green pill background + filled icon.
 */
export function TabBarIcon({
  focused,
  iconName,
  iconNameFocused,
  label,
  hasIndicator = false,
  emoji,
}: TabBarIconProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
        {emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : (
          <Ionicons
            name={focused ? iconNameFocused : iconName}
            size={22}
            color={focused ? "#fff" : "#9CA3AF"}
          />
        )}
        {hasIndicator && !focused && <View style={styles.dot} />}
      </View>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", gap: 4 },
  iconWrap: {
    width: 46,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconWrapFocused: {
    backgroundColor: "#10B981",
  },
  emoji: { fontSize: 20 },
  dot: {
    position: "absolute",
    top: 2,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  label: { fontSize: 10, fontWeight: "600", color: "#9CA3AF", letterSpacing: 0.3 },
  labelFocused: { color: "#10B981", fontWeight: "800" },
});
