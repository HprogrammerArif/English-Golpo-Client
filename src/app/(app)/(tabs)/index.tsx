import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";

const QUICK_ACTIONS = [
  { icon: "add-circle-outline", label: "New", color: "#2B7FFF", bg: "#EFF6FF" },
  { icon: "search-outline", label: "Search", color: "#10B981", bg: "#ECFDF5" },
  { icon: "heart-outline", label: "Saved", color: "#F59E0B", bg: "#FFFBEB" },
  { icon: "settings-outline", label: "Settings", color: "#8B5CF6", bg: "#F5F3FF" },
] as const;

export default function HomeScreen() {
  const user = useAppSelector(selectCurrentUser);
  const firstName = user?.first_name || user?.username || "there";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <Text style={styles.avatarText}>
              {(user?.first_name?.[0] ?? user?.username?.[0] ?? "U").toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Getting Started</Text>
          <Text style={styles.heroTitle}>Build something amazing</Text>
          <Text style={styles.heroSub}>
            This starter is ready for your next project. Wire up the API and you&apos;re live.
          </Text>
          <TouchableOpacity style={styles.heroCta}>
            <Text style={styles.heroCtaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={16} color="#2B7FFF" />
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionCard, { backgroundColor: action.bg }]}
              activeOpacity={0.75}
            >
              <Ionicons name={action.icon} size={28} color={action.color} />
              <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent — scaffold */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.activityRow}>
            <View style={styles.activityIcon}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Activity item {i}</Text>
              <Text style={styles.activitySub}>Replace with real data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 4 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 14, color: "#6B7280" },
  name: { fontSize: 22, fontWeight: "800", color: "#111827" },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#2B7FFF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  heroLabel: { fontSize: 12, fontWeight: "700", color: "#2B7FFF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  heroTitle: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 8 },
  heroSub: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 14 },
  heroCta: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroCtaText: { color: "#2B7FFF", fontWeight: "700", fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 12 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  actionCard: { width: "47%", borderRadius: 14, padding: 18, alignItems: "center", gap: 8 },
  actionLabel: { fontSize: 13, fontWeight: "700" },
  recentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  seeAll: { color: "#2B7FFF", fontWeight: "600", fontSize: 13 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  activityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  activityText: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  activitySub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
});
