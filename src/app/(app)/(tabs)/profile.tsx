import { ComponentProps } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, selectCurrentUser } from "@/redux/features/auth/authSlice";
import { useGetStreakQuery } from "@/redux/api/gamificationApi";

const PATH_FRIENDLY_NAMES: Record<string, string> = {
  KIDS:      "Kids English (বাচ্চাদের ইংরেজি)",
  SPOKEN:    "Spoken English (স্পোকেন)",
  JOB:       "Job English (চাকরি প্রার্থী)",
  IELTS:     "IELTS Preparation (আইইএলটিএস)",
  ADMISSION: "University Admission",
  VOCAB:     "Vocabulary Mastery",
};

const STAT_CARDS = [
  { key: "xp",     label: "মোট XP",    sublabel: "Total XP",    emoji: "⚡", bg: "#FEF9E7", numColor: "#92400E" },
  { key: "gems",   label: "পাথর",      sublabel: "Gems",         emoji: "💎", bg: "#EFF6FF", numColor: "#1D4ED8" },
  { key: "streak", label: "ধারাবাহিক", sublabel: "Day Streak",   emoji: "🔥", bg: "#FEF2F2", numColor: "#EF4444" },
  { key: "lives",  label: "জীবন",      sublabel: "Lives Left",   emoji: "❤️", bg: "#FDF2F8", numColor: "#DB2777" },
];

interface MenuItemProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  emoji?: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  iconBg?: string;
  iconColor?: string;
  danger?: boolean;
}

function MenuItem({ icon, emoji, label, sublabel, onPress, iconBg = "#F3F4F6", iconColor = "#374151", danger }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? "#FEF2F2" : iconBg }]}>
        {emoji
          ? <Text style={{ fontSize: 18 }}>{emoji}</Text>
          : <Ionicons name={icon} size={18} color={danger ? "#EF4444" : iconColor} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && { color: "#EF4444" }]}>{label}</Text>
        {sublabel && <Text style={styles.menuSub}>{sublabel}</Text>}
      </View>
      <Ionicons name={danger ? "chevron-forward" : "chevron-forward"} size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const { data: streakData, isLoading: isStreakLoading } = useGetStreakQuery();

  const handleLogout = () => {
    Alert.alert("সাইন আউট", "আপনি কি সাইন আউট করতে চান?", [
      { text: "না", style: "cancel" },
      {
        text: "হ্যাঁ, সাইন আউট",
        style: "destructive",
        onPress: () => { dispatch(logout()); router.replace("/(auth)/login"); },
      },
    ]);
  };

  const name      = user?.name || "Learner";
  const initials  = name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "L";
  const isPremium = user?.role === "PREMIUM";
  const userPath  = user?.learningPath ? PATH_FRIENDLY_NAMES[user.learningPath] : "Not Selected";
  const streak    = streakData?.currentStreak || 0;

  const statValues: Record<string, string | number> = {
    xp:     user?.xpTotal || 0,
    gems:   user?.gems || 0,
    streak: isStreakLoading ? "..." : `${streak}d`,
    lives:  isPremium ? "∞" : (user?.lives || 5),
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Profile Hero ─────────────────────────────────── */}
        <LinearGradient
          colors={["#059669", "#10B981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Notification icon top right */}
          <TouchableOpacity
            style={styles.heroNotif}
            onPress={() => router.push("/(app)/notifications" as any)}
          >
            <Ionicons name="notifications" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={{ fontSize: 14 }}>👑</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroName}>{name}</Text>
          <Text style={styles.heroPhone}>{user?.phone || user?.email || "No contact linked"}</Text>

          <View style={[styles.memberBadge, isPremium ? styles.memberBadgePremium : styles.memberBadgeFree]}>
            <Text style={[styles.memberBadgeText, { color: isPremium ? "#92400E" : "#374151" }]}>
              {isPremium ? "👑 Premium Member" : "🆓 Free Account"}
            </Text>
          </View>
        </LinearGradient>

        {/* ── Stats Row ─────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {STAT_CARDS.map((card) => (
            <View key={card.key} style={[styles.statCard, { backgroundColor: card.bg }]}>
              <Text style={styles.statEmoji}>{card.emoji}</Text>
              <Text style={[styles.statNum, { color: card.numColor }]}>{statValues[card.key]}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
              <Text style={styles.statSub}>{card.sublabel}</Text>
            </View>
          ))}
        </View>

        {/* ── Current Path ─────────────────────────────────── */}
        <TouchableOpacity
          style={styles.pathCard}
          onPress={() => router.push("/(app)/paths" as any)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#ECFDF5", "#D1FAE5"]}
            style={styles.pathCardGrad}
          >
            <View style={styles.pathIcon}>
              <Ionicons name="school" size={22} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pathCardLabel}>আমার শেখার পথ</Text>
              <Text style={styles.pathCardName} numberOfLines={1}>{userPath}</Text>
              {user?.nctbClass && (
                <Text style={styles.pathCardSub}>Class {user.nctbClass} · NCTB Curriculum</Text>
              )}
            </View>
            <View style={styles.pathChangeBtn}>
              <Ionicons name="swap-horizontal" size={16} color="#059669" />
              <Text style={styles.pathChangeTxt}>পরিবর্তন</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Menu Sections ─────────────────────────────────── */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>📚 লার্নিং টুলস</Text>
          <View style={styles.menuCard}>
            <MenuItem emoji="💎" icon="cart-outline"     label="Gems Shop"          sublabel="পাথর কিনুন" onPress={() => router.push("/(app)/shop" as any)} iconBg="#EFF6FF" iconColor="#3B82F6" />
            <View style={styles.divider} />
            <MenuItem emoji="📥" icon="download-outline" label="Offline Downloads"  sublabel="ডাউনলোড ম্যানেজার" onPress={() => router.push("/(app)/stories/download-manager" as any)} iconBg="#F0FDF4" iconColor="#10B981" />
            <View style={styles.divider} />
            <MenuItem emoji="👨‍👩‍👧" icon="people-outline"  label="Parent Mode"        sublabel="অভিভাবক নিয়ন্ত্রণ" onPress={() => router.push("/(app)/parents/dashboard" as any)} iconBg="#FFF7ED" iconColor="#F97316" />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>⭐ বেড়ে উঠুন</Text>
          <View style={styles.menuCard}>
            <MenuItem emoji="👑" icon="ribbon-outline"  label="Go Premium"         sublabel="আনলিমিটেড অ্যাক্সেস পান" onPress={() => router.push("/(app)/subscription/paywall" as any)} iconBg="#FEFCE8" iconColor="#EAB308" />
            <View style={styles.divider} />
            <MenuItem emoji="🎁" icon="gift-outline"    label="Invite & Earn"      sublabel="বন্ধুদের ডাকুন" onPress={() => router.push("/(app)/growth/refer" as any)} iconBg="#FDF2F8" iconColor="#EC4899" />
            <View style={styles.divider} />
            <MenuItem emoji="⭐" icon="star-outline"    label="Rate English Golpo" sublabel="আমাদের রেট করুন" onPress={() => router.push("/(app)/growth/review-prompt" as any)} iconBg="#FEF3C7" iconColor="#F59E0B" />
          </View>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            <MenuItem icon="log-out-outline" label="সাইন আউট" onPress={handleLogout} danger />
          </View>
        </View>

        <Text style={styles.version}>English Golpo v1.0 · Made with ❤️ in Bangladesh</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: "#F0FDF4" },
  scroll:   { paddingBottom: 40 },

  /* Hero */
  hero:       { paddingTop: 20, paddingBottom: 28, alignItems: "center", paddingHorizontal: 20 },
  heroNotif:  { position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatar:     { width: 84, height: 84, borderRadius: 42, backgroundColor: "rgba(255,255,255,0.25)", borderWidth: 3, borderColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 32, fontWeight: "900", color: "#fff" },
  premiumBadge:{ position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: "#FEF3C7", borderWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  heroName:   { fontSize: 22, fontWeight: "900", color: "#fff", letterSpacing: -0.3 },
  heroPhone:  { fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: "600", marginTop: 3 },
  memberBadge:{ marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  memberBadgePremium: { backgroundColor: "#FEF3C7" },
  memberBadgeFree:    { backgroundColor: "rgba(255,255,255,0.2)" },
  memberBadgeText:    { fontSize: 12, fontWeight: "800" },

  /* Stats */
  statsRow:   { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginTop: 16, marginBottom: 16 },
  statCard:   { flex: 1, borderRadius: 18, padding: 12, alignItems: "center" },
  statEmoji:  { fontSize: 22, marginBottom: 4 },
  statNum:    { fontSize: 16, fontWeight: "900" },
  statLabel:  { fontSize: 10, fontWeight: "800", color: "#374151", marginTop: 2, textAlign: "center" },
  statSub:    { fontSize: 8, color: "#9CA3AF", fontWeight: "600", textAlign: "center" },

  /* Path card */
  pathCard:     { marginHorizontal: 16, marginBottom: 16, borderRadius: 20, overflow: "hidden" },
  pathCardGrad: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  pathIcon:     { width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  pathCardLabel:{ fontSize: 11, fontWeight: "700", color: "#059669", textTransform: "uppercase", letterSpacing: 0.5 },
  pathCardName: { fontSize: 14, fontWeight: "800", color: "#1F2937", marginTop: 2 },
  pathCardSub:  { fontSize: 11, color: "#6B7280", fontWeight: "600", marginTop: 2 },
  pathChangeBtn:{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  pathChangeTxt:{ fontSize: 11, fontWeight: "700", color: "#059669" },

  /* Menu */
  menuSection:      { paddingHorizontal: 16, marginBottom: 16 },
  menuSectionTitle: { fontSize: 13, fontWeight: "800", color: "#374151", marginBottom: 8, marginLeft: 4 },
  menuCard:         { backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  menuItem:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIcon:         { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  menuLabel:        { fontSize: 14, fontWeight: "700", color: "#1F2937" },
  menuSub:          { fontSize: 11, color: "#9CA3AF", fontWeight: "600", marginTop: 1 },
  divider:          { height: 1, backgroundColor: "#F3F4F6", marginLeft: 68 },

  version:  { textAlign: "center", fontSize: 11, color: "#9CA3AF", fontWeight: "600", marginTop: 8 },
});
