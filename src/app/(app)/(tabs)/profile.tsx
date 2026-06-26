import { ComponentProps } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, selectCurrentUser } from "@/redux/features/auth/authSlice";

// ─── Helpers ────────────────────────────────────────────────────────────────
function getInitials(user: { first_name?: string; last_name?: string; username?: string; email?: string } | null): string {
  if (!user) return "?";
  if (user.first_name && user.last_name) {
    return (user.first_name[0] + user.last_name[0]).toUpperCase();
  }
  if (user.first_name) return user.first_name[0].toUpperCase();
  if (user.username) return user.username[0].toUpperCase();
  if (user.email) return user.email[0].toUpperCase();
  return "?";
}

function getDisplayName(user: { first_name?: string; last_name?: string; username?: string; email?: string } | null): string {
  if (!user) return "User";
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return full || user.username || user.email?.split("@")[0] || "User";
}

// ─── List item ──────────────────────────────────────────────────────────────
interface ListItemProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  iconBg?: string;
  iconColor?: string;
  rightComponent?: React.ReactNode;
  danger?: boolean;
}

function ListItem({ icon, label, onPress, iconBg = "#F3F4F6", iconColor = "#374151", rightComponent, danger }: ListItemProps) {
  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.listIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={danger ? "#EF4444" : iconColor} />
      </View>
      <Text style={[styles.listLabel, danger && styles.listLabelDanger]}>{label}</Text>
      {rightComponent ?? <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />}
    </TouchableOpacity>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          {user?.email && <Text style={styles.email}>{user.email}</Text>}
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.card}>
            <ListItem icon="person-outline" label="Personal Information" onPress={() => {}} iconBg="#EFF6FF" iconColor="#2B7FFF" />
            <View style={styles.divider} />
            <ListItem icon="lock-closed-outline" label="Change Password" onPress={() => {}} />
            <View style={styles.divider} />
            <ListItem icon="mail-outline" label="Email Preferences" onPress={() => {}} />
          </View>
        </View>

        {/* App section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>App</Text>
          <View style={styles.card}>
            <ListItem icon="notifications-outline" label="Notifications" onPress={() => {}} iconBg="#FFF7ED" iconColor="#F97316" />
            <View style={styles.divider} />
            <ListItem icon="star-outline" label="Subscription" onPress={() => {}} iconBg="#FEFCE8" iconColor="#EAB308" />
            <View style={styles.divider} />
            <ListItem icon="shield-checkmark-outline" label="Privacy & Security" onPress={() => {}} />
          </View>
        </View>

        {/* Support section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.card}>
            <ListItem icon="help-circle-outline" label="Help Center" onPress={() => {}} />
            <View style={styles.divider} />
            <ListItem icon="document-text-outline" label="Terms & Privacy" onPress={() => {}} />
            <View style={styles.divider} />
            <ListItem icon="information-circle-outline" label="About" onPress={() => {}} />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.card}>
            <ListItem icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
          </View>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  avatarSection: { alignItems: "center", marginBottom: 28 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#2B7FFF", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  displayName: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 2 },
  email: { fontSize: 14, color: "#6B7280", marginBottom: 12 },
  editBtn: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: "#E5E7EB" },
  editBtnText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  section: { marginBottom: 14 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  listItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  listIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  listLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: "#111827" },
  listLabelDanger: { color: "#EF4444" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginLeft: 64 },
  version: { textAlign: "center", color: "#D1D5DB", fontSize: 12, marginTop: 8 },
});
