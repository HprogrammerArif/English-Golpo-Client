import React from "react";
import {
  View, Text, FlatList, ActivityIndicator,
  StyleSheet, TouchableOpacity, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useGetLeaderboardQuery } from "@/redux/api/gamificationApi";
import { useRouter } from "expo-router";

const LEAGUE_CONFIG: Record<string, {
  name: string; nameBn: string; emoji: string;
  gradient: string[]; textColor: string;
}> = {
  BRONZE:   { name: "Bronze League",   nameBn: "ব্রোঞ্জ লিগ",   emoji: "🥉", gradient: ["#78350F","#B45309"], textColor: "#FEF3C7" },
  SILVER:   { name: "Silver League",   nameBn: "সিলভার লিগ",   emoji: "🥈", gradient: ["#374151","#6B7280"], textColor: "#F9FAFB" },
  GOLD:     { name: "Gold League",     nameBn: "গোল্ড লিগ",    emoji: "🥇", gradient: ["#92400E","#D97706"], textColor: "#FEF3C7" },
  PLATINUM: { name: "Platinum League", nameBn: "প্লাটিনাম লিগ", emoji: "💎", gradient: ["#065F46","#10B981"], textColor: "#D1FAE5" },
  DIAMOND:  { name: "Diamond League",  nameBn: "ডায়মন্ড লিগ",  emoji: "👑", gradient: ["#312E81","#7C3AED"], textColor: "#EDE9FE" },
};

const RANK_EMOJIS = ["🥇","🥈","🥉"];

export default function LeaderboardScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetLeaderboardQuery();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>লিডারবোর্ড লোড হচ্ছে...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ fontSize: 52, marginBottom: 12 }}>😓</Text>
          <Text style={styles.errorTitle}>তালিকা পাওয়া যায়নি</Text>
          <Text style={styles.errorSub}>XP অর্জন করুন এবং লিগে যোগ দিন!</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>আবার চেষ্টা করুন</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const leagueKey = (data.league || "BRONZE") as keyof typeof LEAGUE_CONFIG;
  const league = LEAGUE_CONFIG[leagueKey] || LEAGUE_CONFIG.BRONZE;
  const top3 = (data.leaderboard || []).slice(0, 3);
  const rest = (data.leaderboard || []).slice(3);

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* ── League Hero Banner ──────────────────────── */}
            <LinearGradient
              colors={league.gradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.leagueBanner}
            >
              <Text style={styles.leagueEmoji}>{league.emoji}</Text>
              <Text style={[styles.leagueName, { color: league.textColor }]}>
                {league.nameBn}
              </Text>
              <Text style={[styles.leagueNameEn, { color: league.textColor + "99" }]}>
                {league.name}
              </Text>
              <View style={styles.weekBadge}>
                <Ionicons name="calendar-outline" size={12} color={league.textColor} />
                <Text style={[styles.weekText, { color: league.textColor }]}>
                  {new Date(data.weekStarting).toLocaleDateString("bn-BD", { month: "long", day: "numeric" })} থেকে
                </Text>
              </View>
            </LinearGradient>

            {/* ── Podium Top 3 ─────────────────────────────── */}
            {top3.length >= 3 && (
              <View style={styles.podiumSection}>
                <Text style={styles.podiumTitle}>🏅 শীর্ষ তিনজন</Text>
                <View style={styles.podium}>
                  {/* 2nd place */}
                  <PodiumCard item={top3[1]} rank={2} height={90} />
                  {/* 1st place — center, tallest */}
                  <PodiumCard item={top3[0]} rank={1} height={120} />
                  {/* 3rd place */}
                  <PodiumCard item={top3[2]} rank={3} height={72} />
                </View>
              </View>
            )}

            <Text style={styles.listHeader}>সব প্রতিযোগী</Text>
          </>
        )}
        data={rest}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }: any) => {
          const rank = index + 4; // starts at 4 since top3 shown above
          return <LeaderboardRow item={item} rank={rank} />;
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity style={styles.inviteBtn} onPress={() => router.push("/(app)/growth/refer" as any)}>
              <Text style={styles.inviteBtnText}>🎁 বন্ধুকে চ্যালেঞ্জ করুন</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function PodiumCard({ item, rank, height }: { item: any; rank: number; height: number }) {
  const rankColors = ["#F59E0B","#94A3B8","#92400E"];
  const color = rankColors[rank - 1];

  return (
    <View style={styles.podiumCard}>
      {/* Avatar */}
      <Image
        source={{ uri: item.avatarUrl || `https://api.dicebear.com/7.x/adventurer/png?seed=${item.name}` }}
        style={[styles.podiumAvatar, item.isCurrentUser && { borderColor: "#10B981", borderWidth: 3 }]}
      />
      <Text style={styles.podiumRankEmoji}>{RANK_EMOJIS[rank - 1]}</Text>
      <Text style={styles.podiumName} numberOfLines={1}>{item.name?.split(" ")[0]}</Text>
      <Text style={styles.podiumXP}>{item.xpEarned} XP</Text>

      {/* Block */}
      <View style={[styles.podiumBlock, { height, backgroundColor: color + "22", borderTopColor: color }]}>
        <Text style={[styles.podiumRankNum, { color }]}>{rank}</Text>
      </View>
    </View>
  );
}

function LeaderboardRow({ item, rank }: { item: any; rank: number }) {
  return (
    <View style={[styles.row, item.isCurrentUser && styles.rowHighlight]}>
      <Text style={styles.rowRank}>{rank}</Text>
      <Image
        source={{ uri: item.avatarUrl || `https://api.dicebear.com/7.x/adventurer/png?seed=${item.name}` }}
        style={styles.rowAvatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowName, item.isCurrentUser && styles.rowNameHighlight]} numberOfLines={1}>
          {item.name}
          {item.isCurrentUser && <Text style={styles.youTag}> (আপনি)</Text>}
        </Text>
      </View>
      <View style={styles.xpPill}>
        <Ionicons name="flash" size={12} color="#F59E0B" />
        <Text style={styles.xpPillText}>{item.xpEarned} XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: "#F0FDF4" },
  center:         { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  loadingText:    { marginTop: 12, color: "#6B7280", fontWeight: "600" },
  errorTitle:     { fontSize: 18, fontWeight: "900", color: "#1F2937", textAlign: "center" },
  errorSub:       { fontSize: 13, color: "#6B7280", fontWeight: "600", textAlign: "center", marginTop: 6, marginBottom: 20 },
  retryBtn:       { backgroundColor: "#10B981", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText:      { color: "#fff", fontWeight: "800", fontSize: 14 },

  leagueBanner:   { margin: 16, borderRadius: 24, padding: 24, alignItems: "center" },
  leagueEmoji:    { fontSize: 48, marginBottom: 6 },
  leagueName:     { fontSize: 22, fontWeight: "900", letterSpacing: 0.5 },
  leagueNameEn:   { fontSize: 13, fontWeight: "600", marginTop: 2 },
  weekBadge:      { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10, backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  weekText:       { fontSize: 11, fontWeight: "700" },

  podiumSection:  { paddingHorizontal: 20, marginBottom: 8 },
  podiumTitle:    { fontSize: 15, fontWeight: "800", color: "#1F2937", marginBottom: 12 },
  podium:         { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", gap: 8 },

  podiumCard:     { flex: 1, alignItems: "center", maxWidth: 110 },
  podiumAvatar:   { width: 52, height: 52, borderRadius: 26, backgroundColor: "#D1FAE5", marginBottom: 4 },
  podiumRankEmoji:{ fontSize: 18, marginBottom: 2 },
  podiumName:     { fontSize: 11, fontWeight: "800", color: "#1F2937", maxWidth: 80, textAlign: "center" },
  podiumXP:       { fontSize: 10, fontWeight: "700", color: "#10B981", marginTop: 2, marginBottom: 4 },
  podiumBlock:    { width: "100%", borderTopWidth: 3, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  podiumRankNum:  { fontSize: 20, fontWeight: "900", marginTop: 6 },

  listHeader:     { fontSize: 15, fontWeight: "800", color: "#1F2937", paddingHorizontal: 20, paddingVertical: 10 },
  listContent:    { paddingHorizontal: 16, paddingBottom: 32 },

  row:            { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 12, marginBottom: 8, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  rowHighlight:   { backgroundColor: "#ECFDF5", borderWidth: 1.5, borderColor: "#10B981" },
  rowRank:        { fontSize: 14, fontWeight: "900", color: "#6B7280", width: 24, textAlign: "center" },
  rowAvatar:      { width: 40, height: 40, borderRadius: 20, backgroundColor: "#D1FAE5" },
  rowName:        { fontSize: 14, fontWeight: "700", color: "#1F2937" },
  rowNameHighlight:{ color: "#059669", fontWeight: "900" },
  youTag:         { fontSize: 11, fontWeight: "700", color: "#10B981" },
  xpPill:         { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#FEF9E7", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  xpPillText:     { fontSize: 12, fontWeight: "800", color: "#92400E" },

  footer:         { padding: 20 },
  inviteBtn:      { backgroundColor: "#10B981", borderRadius: 20, paddingVertical: 14, alignItems: "center" },
  inviteBtnText:  { color: "#fff", fontSize: 15, fontWeight: "800" },
});
