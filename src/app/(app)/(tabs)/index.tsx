import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { selectDailyGoal } from "@/redux/features/gamification/gameSlice";
import { useGetStreakQuery } from "@/redux/api/gamificationApi";
import { useGetStoriesQuery } from "@/redux/api/storyApi";
import { useRouter } from "expo-router";

const PATH_CONFIG: Record<string, { label: string; emoji: string; color: string[]; desc: string }> = {
  KIDS:     { label: "Kids English",       emoji: "🌟", color: ["#10B981","#059669"], desc: "বাচ্চাদের ইংরেজি শিক্ষা" },
  SPOKEN:   { label: "Spoken English",     emoji: "💬", color: ["#3B82F6","#2563EB"], desc: "কথা বলা শিখুন" },
  JOB:      { label: "Job English",        emoji: "💼", color: ["#8B5CF6","#7C3AED"], desc: "চাকরির ইংরেজি" },
  IELTS:    { label: "IELTS Prep",         emoji: "🎯", color: ["#F59E0B","#D97706"], desc: "আইইএলটিএস প্রস্তুতি" },
  ADMISSION:{ label: "Admission English",  emoji: "🏛️", color: ["#EC4899","#DB2777"], desc: "বিশ্ববিদ্যালয় ভর্তি" },
  VOCAB:    { label: "Vocabulary",         emoji: "📖", color: ["#06B6D4","#0891B2"], desc: "শব্দ ভান্ডার" },
};

const QUICK_ACTIONS = [
  { id: "shop",    emoji: "💎", label: "Gems Shop",     sublabel: "পাথর কিনুন",    bg: "#EFF6FF", route: "/(app)/shop" as const },
  { id: "refer",   emoji: "🎁", label: "Invite & Earn", sublabel: "বন্ধুকে ডাকুন",  bg: "#FDF4FF", route: "/(app)/growth/refer" as const },
  { id: "parents", emoji: "👨‍👩‍👧", label: "Parent Mode",  sublabel: "অভিভাবক মোড", bg: "#FFF7ED", route: "/(app)/parents/dashboard" as const },
  { id: "premium", emoji: "👑", label: "Go Premium",    sublabel: "আনলিমিটেড",    bg: "#F0FDF4", route: "/(app)/subscription/paywall" as const },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const dailyGoal = useAppSelector(selectDailyGoal);
  const { data: streakData } = useGetStreakQuery();
  const { data: storiesData } = useGetStoriesQuery({ path: user?.learningPath || "KIDS" });

  const name       = user?.name?.split(" ")[0] || "Learner";
  const streak     = streakData?.currentStreak || 0;
  const xpTotal    = user?.xpTotal || 0;
  const gems       = user?.gems || 0;
  const lives      = user?.lives || 5;
  const isPremium  = user?.role === "PREMIUM";
  const pathKey    = user?.learningPath || "KIDS";
  const pathCfg    = PATH_CONFIG[pathKey] || PATH_CONFIG.KIDS;

  const storyList  = Array.isArray(storiesData) ? storiesData
    : (storiesData as any)?.stories || [];
  const recentStory = storyList[0];

  const dailyPct = Math.min(100, Math.round((xpTotal / dailyGoal) * 100));

  // Greeting by time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "সুপ্রভাত" : hour < 17 ? "শুভ অপরাহ্ন" : "শুভ সন্ধ্যা";

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Top Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* Streak pill */}
        <TouchableOpacity style={styles.streakPill} activeOpacity={0.8}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakNum}>{streak}</Text>
        </TouchableOpacity>

        {/* Center logo */}
        <Text style={styles.logoText}>English<Text style={styles.logoAccent}> Golpo</Text></Text>

        {/* Right icons */}
        <View style={styles.headerRight}>
          {/* Gems */}
          <View style={styles.statPill}>
            <Text>💎</Text>
            <Text style={styles.statNum}>{gems}</Text>
          </View>
          {/* Lives */}
          <View style={[styles.statPill, { backgroundColor: "#FEF2F2" }]}>
            <Ionicons name="heart" size={14} color="#EF4444" />
            <Text style={[styles.statNum, { color: "#EF4444" }]}>
              {isPremium ? "∞" : lives}
            </Text>
          </View>
          {/* Notifications */}
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/(app)/notifications" as any)}
          >
            <Ionicons name="notifications" size={20} color="#374151" />
            {/* Unread dot */}
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Greeting ──────────────────────────────────────────── */}
        <View style={styles.greetRow}>
          <View>
            <Text style={styles.greetSub}>{greeting} 👋</Text>
            <Text style={styles.greetName}>{name}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifAvatarBtn}
            onPress={() => router.push("/(app)/(tabs)/profile")}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name[0]?.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Daily Goal Bar ───────────────────────────────────── */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View>
              <Text style={styles.goalLabel}>আজকের লক্ষ্য</Text>
              <Text style={styles.goalSub}>Daily Goal</Text>
            </View>
            <Text style={styles.goalPct}>{dailyPct}%</Text>
          </View>
          <View style={styles.goalTrack}>
            <View style={[styles.goalFill, { width: `${dailyPct}%` as any }]} />
          </View>
          <Text style={styles.goalCaption}>{xpTotal} / {dailyGoal} XP earned today</Text>
        </View>

        {/* ── Active Path Hero Card ─────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => router.push("/(app)/paths")}
          style={styles.pathCardWrap}
        >
          <LinearGradient
            colors={pathCfg.color as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pathCard}
          >
            {/* Top row */}
            <View style={styles.pathTop}>
              <View style={styles.pathBadge}>
                <Text style={styles.pathBadgeText}>আমার পথ</Text>
              </View>
              <View style={styles.pathEditBtn}>
                <Ionicons name="swap-horizontal" size={14} color="#fff" />
                <Text style={styles.pathEditText}>পরিবর্তন</Text>
              </View>
            </View>

            {/* Emoji + Name */}
            <Text style={styles.pathEmoji}>{pathCfg.emoji}</Text>
            <Text style={styles.pathName}>{pathCfg.label}</Text>
            <Text style={styles.pathDesc}>{pathCfg.desc}</Text>

            {/* XP pill */}
            <View style={styles.pathXpRow}>
              <View style={styles.pathXpPill}>
                <Ionicons name="flash" size={12} color="#FBBF24" />
                <Text style={styles.pathXpText}>{xpTotal} XP</Text>
              </View>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>👑 Premium</Text>
                </View>
              )}
            </View>

            {/* CTA button */}
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => router.push("/(app)/(tabs)/explore")}
            >
              <Text style={[styles.ctaBtnText, { color: pathCfg.color[0] }]}>
                পড়া শুরু করুন
              </Text>
              <Ionicons name="play-circle" size={18} color={pathCfg.color[0]} />
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Continue Reading (last story) ─────────────────────── */}
        {recentStory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 এখানেই ছিলেন</Text>
            <TouchableOpacity
              style={styles.recentCard}
              onPress={() => router.push(`/(app)/stories/${recentStory.id}` as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.recentThumb, { backgroundColor: "#D1FAE5" }]}>
                <Text style={{ fontSize: 28 }}>📖</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentTitle} numberOfLines={1}>{recentStory.title}</Text>
                <Text style={styles.recentSub} numberOfLines={1}>{recentStory.titleBn}</Text>
                <View style={styles.recentMeta}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>Level {recentStory.level}</Text>
                  </View>
                  <Text style={styles.recentTime}>
                    {Math.round(recentStory.durationSeconds / 60)} মিনিট
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-circle" size={28} color="#10B981" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Quick Actions Grid ────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ দ্রুত অ্যাকশন</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { backgroundColor: action.bg }]}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <Text style={styles.actionSub}>{action.sublabel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── League Banner ─────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.leagueBanner}
          onPress={() => router.push("/(app)/(tabs)/leaderboard")}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={["#1E1B4B", "#312E81"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.leagueBannerGrad}
          >
            <Text style={styles.leagueBannerEmoji}>🏆</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.leagueBannerTitle}>লিগ র‌্যাঙ্কিং</Text>
              <Text style={styles.leagueBannerSub}>আপনি কত নম্বরে আছেন?</Text>
            </View>
            <View style={styles.leagueBannerArrow}>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: "#F0FDF4" },
  scroll:          { paddingBottom: 48 },

  /* Header */
  header:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E7F9EE" },
  streakPill:      { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  streakFire:      { fontSize: 16 },
  streakNum:       { fontSize: 14, fontWeight: "800", color: "#92400E" },
  logoText:        { fontSize: 18, fontWeight: "900", color: "#1F2937" },
  logoAccent:      { color: "#10B981" },
  headerRight:     { flexDirection: "row", alignItems: "center", gap: 8 },
  statPill:        { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statNum:         { fontSize: 12, fontWeight: "800", color: "#1D4ED8" },
  notifBtn:        { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", position: "relative" },
  notifDot:        { position: "absolute", top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#fff" },

  /* Greeting */
  greetRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  greetSub:        { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  greetName:       { fontSize: 26, fontWeight: "900", color: "#111827", marginTop: 2 },
  notifAvatarBtn:  {},
  avatar:          { width: 44, height: 44, borderRadius: 22, backgroundColor: "#10B981", alignItems: "center", justifyContent: "center" },
  avatarText:      { fontSize: 18, fontWeight: "900", color: "#fff" },

  /* Daily Goal */
  goalCard:        { marginHorizontal: 20, backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: "#10B981", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  goalHeader:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  goalLabel:       { fontSize: 14, fontWeight: "800", color: "#111827" },
  goalSub:         { fontSize: 11, color: "#9CA3AF", fontWeight: "600", marginTop: 1 },
  goalPct:         { fontSize: 24, fontWeight: "900", color: "#10B981" },
  goalTrack:       { height: 10, backgroundColor: "#D1FAE5", borderRadius: 5, overflow: "hidden" },
  goalFill:        { height: "100%", backgroundColor: "#10B981", borderRadius: 5 },
  goalCaption:     { fontSize: 11, color: "#6B7280", fontWeight: "600", marginTop: 8, textAlign: "right" },

  /* Active Path Hero */
  pathCardWrap:    { marginHorizontal: 20, marginBottom: 20 },
  pathCard:        { borderRadius: 28, padding: 22, overflow: "hidden" },
  pathTop:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  pathBadge:       { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pathBadgeText:   { fontSize: 11, color: "#fff", fontWeight: "700" },
  pathEditBtn:     { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pathEditText:    { fontSize: 11, color: "#fff", fontWeight: "600" },
  pathEmoji:       { fontSize: 36, marginBottom: 4 },
  pathName:        { fontSize: 22, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  pathDesc:        { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "600", marginTop: 2, marginBottom: 14 },
  pathXpRow:       { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  pathXpPill:      { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  pathXpText:      { fontSize: 12, fontWeight: "800", color: "#fff" },
  premiumBadge:    { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  premiumBadgeText:{ fontSize: 12, fontWeight: "800", color: "#fff" },
  ctaBtn:          { backgroundColor: "#fff", borderRadius: 16, height: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  ctaBtnText:      { fontSize: 15, fontWeight: "900" },

  /* Recent story */
  section:         { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle:    { fontSize: 16, fontWeight: "800", color: "#1F2937", marginBottom: 12 },
  recentCard:      { backgroundColor: "#fff", borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  recentThumb:     { width: 60, height: 60, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  recentTitle:     { fontSize: 15, fontWeight: "800", color: "#111827" },
  recentSub:       { fontSize: 12, color: "#6B7280", fontWeight: "600", marginTop: 2 },
  recentMeta:      { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  levelBadge:      { backgroundColor: "#D1FAE5", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  levelBadgeText:  { fontSize: 10, fontWeight: "800", color: "#059669" },
  recentTime:      { fontSize: 11, color: "#9CA3AF", fontWeight: "600" },

  /* Quick Actions */
  actionsGrid:     { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionCard:      { width: "47%", borderRadius: 20, padding: 16, alignItems: "center" },
  actionEmoji:     { fontSize: 28, marginBottom: 6 },
  actionLabel:     { fontSize: 13, fontWeight: "800", color: "#1F2937", textAlign: "center" },
  actionSub:       { fontSize: 10, color: "#6B7280", fontWeight: "600", marginTop: 2, textAlign: "center" },

  /* League banner */
  leagueBanner:    { marginHorizontal: 20, marginBottom: 8, borderRadius: 20, overflow: "hidden" },
  leagueBannerGrad:{ flexDirection: "row", alignItems: "center", padding: 18, gap: 14 },
  leagueBannerEmoji:{ fontSize: 30 },
  leagueBannerTitle:{ fontSize: 16, fontWeight: "900", color: "#fff" },
  leagueBannerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "600", marginTop: 2 },
  leagueBannerArrow:{ width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
});
