/**
 * Video Learning Tab — English Golpo
 *
 * A kid-friendly, YouTube-embedded video learning screen.
 * Videos are curated for each learning path (KIDS, SPOKEN, IELTS, etc.)
 * and award XP on completion.
 */
import { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Dimensions, Image,
  FlatList, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGetVideosQuery, useGetMyVideoProgressQuery, VideoLesson } from "@/redux/api/videoApi";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { WebView } from "react-native-webview";

const { width: SCREEN_W } = Dimensions.get("window");

const PATH_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  ALL:       { label: "সব ভিডিও",     emoji: "🎬", color: "#6366F1" },
  KIDS:      { label: "বাচ্চাদের",     emoji: "🧒", color: "#10B981" },
  SPOKEN:    { label: "স্পোকেন",       emoji: "🗣️", color: "#F59E0B" },
  IELTS:     { label: "IELTS",         emoji: "📝", color: "#EF4444" },
  ADMISSION: { label: "অ্যাডমিশন",    emoji: "🏫", color: "#8B5CF6" },
  JOB:       { label: "চাকরি",         emoji: "💼", color: "#0EA5E9" },
  VOCAB:     { label: "শব্দভাণ্ডার",  emoji: "📚", color: "#EC4899" },
};

const FILTER_KEYS = Object.keys(PATH_LABELS);

// Format seconds as mm:ss
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface VideoCardProps {
  video: VideoLesson;
  isCompleted: boolean;
  onPress: () => void;
}

function VideoCard({ video, isCompleted, onPress }: VideoCardProps) {
  const pathInfo = PATH_LABELS[video.learningPath] ?? PATH_LABELS.KIDS;
  const levelColors = ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  const levelColor = levelColors[(video.level - 1) % levelColors.length] || "#10B981";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Thumbnail */}
      <View style={styles.thumbWrap}>
        <Image
          source={{ uri: video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` }}
          style={styles.thumb}
          resizeMode="cover"
        />
        {/* Play overlay */}
        <View style={styles.playOverlay}>
          <LinearGradient
            colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.55)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.playBtn}>
            <Ionicons name="play" size={22} color="#fff" />
          </View>
        </View>
        {/* Duration badge */}
        {video.durationSeconds > 0 && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(video.durationSeconds)}</Text>
          </View>
        )}
        {/* Completion badge */}
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
        )}
        {/* Premium lock */}
        {video.isPremium && (
          <View style={styles.premiumLock}>
            <Ionicons name="lock-closed" size={12} color="#fff" />
            <Text style={styles.premiumLockText}>Premium</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <View style={styles.cardMeta}>
          <View style={[styles.pathPill, { backgroundColor: pathInfo.color + "18" }]}>
            <Text style={{ fontSize: 10 }}>{pathInfo.emoji}</Text>
            <Text style={[styles.pathPillText, { color: pathInfo.color }]}>{pathInfo.label}</Text>
          </View>
          <View style={[styles.levelDot, { backgroundColor: levelColor + "22" }]}>
            <Text style={[styles.levelDotText, { color: levelColor }]}>Lv.{video.level}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.cardTitleBn} numberOfLines={1}>{video.titleBn}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{video.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Inline YouTube Player Modal ───────────────────────────────────────── */
function VideoPlayer({ video, onClose }: { video: VideoLesson; onClose: () => void }) {
  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`;
  const playerH = Math.round(SCREEN_W * 9 / 16);

  return (
    <View style={styles.playerOverlay}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={styles.playerHeader}>
          <TouchableOpacity onPress={onClose} style={styles.playerClose}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.playerTitle} numberOfLines={1}>{video.title}</Text>
            <Text style={styles.playerSub} numberOfLines={1}>{video.titleBn}</Text>
          </View>
        </View>

        {/* YouTube embed */}
        <View style={[styles.playerWebView, { height: playerH }]}>
          <WebView
            source={{ uri: embedUrl }}
            style={{ flex: 1, backgroundColor: "#000" }}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
          />
        </View>

        {/* Description */}
        <ScrollView style={styles.playerBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.playerDescTitle}>{video.title}</Text>
          <Text style={styles.playerDescTitleBn}>{video.titleBn}</Text>
          <Text style={styles.playerDesc}>{video.description}</Text>
          <Text style={styles.playerDescBn}>{video.descriptionBn}</Text>
          {video.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {video.tags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>#{t}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function VideoScreen() {
  const user = useAppSelector(selectCurrentUser);
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const path = activeFilter === "ALL" ? undefined : activeFilter;
  const { data, isLoading, refetch } = useGetVideosQuery({ path, limit: 40 });
  const { data: progressData } = useGetMyVideoProgressQuery();

  const completedIds = new Set(
    (progressData || []).filter((p) => p.completed).map((p) => p.videoId)
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (selectedVideo) {
    return <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Header ──────────────────────────────── */}
      <LinearGradient
        colors={["#6366F1", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.headerHi}>🎬 ভিডিও দিয়ে শিখুন</Text>
          <Text style={styles.headerSub}>Learn English Through Videos</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>⚡ {user?.xpTotal || 0} XP</Text>
        </View>
      </LinearGradient>

      {/* ── Filter Pills ─────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {FILTER_KEYS.map((key) => {
          const info = PATH_LABELS[key];
          const active = activeFilter === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveFilter(key)}
              style={[styles.filterPill, active && { backgroundColor: info.color }]}
              activeOpacity={0.8}
            >
              <Text style={styles.filterEmoji}>{info.emoji}</Text>
              <Text style={[styles.filterText, active && { color: "#fff", fontWeight: "800" }]}>
                {info.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Content ──────────────────────────────── */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>ভিডিও লোড হচ্ছে...</Text>
        </View>
      ) : !data?.videos?.length ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 48 }}>📹</Text>
          <Text style={styles.emptyTitle}>কোনো ভিডিও নেই</Text>
          <Text style={styles.emptySub}>এই বিভাগে এখনো ভিডিও যোগ করা হয়নি।</Text>
        </View>
      ) : (
        <FlatList
          data={data.videos}
          keyExtractor={(item) => item.id}
          numColumns={1}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
          }
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              isCompleted={completedIds.has(item.id)}
              onPress={() => setSelectedVideo(item)}
            />
          )}
          ListFooterComponent={<View style={{ height: 24 }} />}
        />
      )}
    </SafeAreaView>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F3FF" },

  /* Header */
  header:      { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerHi:    { fontSize: 20, fontWeight: "900", color: "#fff", letterSpacing: -0.3 },
  headerSub:   { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "600", marginTop: 2 },
  xpBadge:     { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  xpText:      { fontSize: 13, fontWeight: "800", color: "#fff" },

  /* Filters */
  filterScroll: { flexGrow: 0 },
  filterRow:    { paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexDirection: "row" },
  filterPill:   { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#EDE9FE", borderWidth: 1.5, borderColor: "transparent" },
  filterEmoji:  { fontSize: 14 },
  filterText:   { fontSize: 12, fontWeight: "700", color: "#7C3AED" },

  /* Card */
  list: { paddingHorizontal: 16, paddingTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 20, marginBottom: 16, overflow: "hidden", shadowColor: "#6366F1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },

  /* Thumbnail */
  thumbWrap:    { width: "100%", height: 200, backgroundColor: "#E0E7FF" },
  thumb:        { width: "100%", height: "100%" },
  playOverlay:  { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  playBtn:      { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(99,102,241,0.9)", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  durationBadge:{ position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.75)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  durationText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  completedBadge:{ position: "absolute", top: 8, right: 8, backgroundColor: "#fff", borderRadius: 12, padding: 2 },
  premiumLock:  { position: "absolute", top: 8, left: 8, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F59E0B", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  premiumLockText:{ fontSize: 10, fontWeight: "800", color: "#fff" },

  /* Card info */
  cardInfo:    { padding: 14 },
  cardMeta:    { flexDirection: "row", gap: 8, marginBottom: 8 },
  pathPill:    { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  pathPillText:{ fontSize: 10, fontWeight: "700" },
  levelDot:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  levelDotText:{ fontSize: 10, fontWeight: "800" },
  cardTitle:   { fontSize: 15, fontWeight: "800", color: "#1F2937", lineHeight: 21, marginBottom: 2 },
  cardTitleBn: { fontSize: 12, fontWeight: "700", color: "#6366F1", marginBottom: 4 },
  cardDesc:    { fontSize: 12, color: "#6B7280", lineHeight: 17 },

  /* Player */
  playerOverlay:  { flex: 1, backgroundColor: "#0F0F0F" },
  playerHeader:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  playerClose:    { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  playerTitle:    { fontSize: 15, fontWeight: "800", color: "#fff" },
  playerSub:      { fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  playerWebView:  { width: "100%", backgroundColor: "#000" },
  playerBody:     { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  playerDescTitle: { fontSize: 18, fontWeight: "900", color: "#fff", marginBottom: 4 },
  playerDescTitleBn:{ fontSize: 14, fontWeight: "700", color: "#A5B4FC", marginBottom: 12 },
  playerDesc:     { fontSize: 14, color: "#D1D5DB", lineHeight: 22, marginBottom: 8 },
  playerDescBn:   { fontSize: 13, color: "#9CA3AF", lineHeight: 20, marginBottom: 16 },
  tagsRow:        { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag:            { backgroundColor: "#1F2937", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText:        { fontSize: 11, color: "#A5B4FC", fontWeight: "700" },

  /* States */
  centered:    { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: "#7C3AED", fontWeight: "700" },
  emptyTitle:  { fontSize: 18, fontWeight: "800", color: "#374151" },
  emptySub:    { fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingHorizontal: 32 },
});
