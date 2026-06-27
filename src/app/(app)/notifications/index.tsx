import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Scaffold data — replace with RTK Query
type NotifType = "info" | "success" | "alert";
const NOTIFICATIONS: { id: string; type: NotifType; title: string; body: string; time: string; read: boolean }[] = [
  { id: "1", type: "success", title: "Welcome aboard! 🎉", body: "Your account has been created successfully.", time: "Just now", read: false },
  { id: "2", type: "info", title: "New feature available", body: "Check out what's new in the latest update.", time: "2h ago", read: false },
  { id: "3", type: "alert", title: "Action required", body: "Please complete your profile to get started.", time: "Yesterday", read: true },
  { id: "4", type: "info", title: "Weekly summary", body: "Here's what happened this week.", time: "Mon", read: true },
];

const TYPE_CONFIG = {
  info:    { icon: "information-circle", color: "#2B7FFF", bg: "#EFF6FF" },
  success: { icon: "checkmark-circle",   color: "#10B981", bg: "#ECFDF5" },
  alert:   { icon: "warning",            color: "#F59E0B", bg: "#FFFBEB" },
} as const;

export default function NotificationsScreen() {
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = TYPE_CONFIG[item.type];
          return (
            <TouchableOpacity
              style={[styles.item, !item.read && styles.itemUnread]}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon} size={22} color={cfg.color} />
              </View>
              <View style={styles.textWrap}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  heading: { fontSize: 26, fontWeight: "800", color: "#111827" },
  badge: { backgroundColor: "#EFF6FF", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: "#2B7FFF", fontSize: 12, fontWeight: "700" },
  list: { padding: 16 },
  separator: { height: 8 },
  item: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 12 },
  itemUnread: { borderLeftWidth: 3, borderLeftColor: "#2B7FFF" },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  textWrap: { flex: 1 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  title: { fontSize: 14, fontWeight: "600", color: "#374151", flex: 1, marginRight: 8 },
  titleUnread: { color: "#111827", fontWeight: "700" },
  time: { fontSize: 11, color: "#9CA3AF", flexShrink: 0 },
  body: { fontSize: 13, color: "#6B7280", lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2B7FFF", flexShrink: 0 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: "#9CA3AF", fontSize: 15 },
});
