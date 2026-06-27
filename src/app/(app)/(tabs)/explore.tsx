import { useState } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { useGetStoriesQuery } from "@/redux/api/storyApi";
import { useRouter } from "expo-router";

const LEVELS = [
  { id: 0, label: "সব",         en: "All" },
  { id: 1, label: "Beginner",   en: "Beginner" },
  { id: 2, label: "Elementary", en: "Elementary" },
  { id: 3, label: "Intermediate",en: "Intermediate" },
  { id: 4, label: "Advanced",   en: "Advanced" },
];

const LEVEL_COLORS = ["#10B981","#3B82F6","#8B5CF6","#F59E0B","#EF4444"];

const STORY_THUMB_COLORS = [
  ["#D1FAE5","#059669"],
  ["#DBEAFE","#2563EB"],
  ["#EDE9FE","#7C3AED"],
  ["#FEF3C7","#D97706"],
  ["#FCE7F3","#DB2777"],
];

export default function ExploreScreen() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const [query, setQuery] = useState("");
  const [activeLevel, setActiveLevel] = useState(0);

  const { data: stories, isLoading, error, refetch } = useGetStoriesQuery({
    path: user?.learningPath || "KIDS",
  });

  const isPremiumUser = user?.role === "PREMIUM";

  const handleStoryPress = (story: any) => {
    const isLocked = story.isPremium && !isPremiumUser;
    if (isLocked) {
      router.push({ pathname: "/(app)/subscription/paywall", params: { storyId: story.id } } as any);
    } else {
      router.push(`/(app)/stories/${story.id}`);
    }
  };

  const storyList = Array.isArray(stories)
    ? stories
    : (stories && typeof stories === "object" && "stories" in (stories as any) && Array.isArray((stories as any).stories))
    ? (stories as any).stories
    : [];

  const filteredStories = storyList.filter((story: any) => {
    const matchesSearch =
      query === "" ||
      story.title.toLowerCase().includes(query.toLowerCase()) ||
      story.titleBn.toLowerCase().includes(query.toLowerCase());
    const matchesLevel = activeLevel === 0 || story.level === activeLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.heading}>গল্প পড়ুন 📚</Text>
            <Text style={styles.headingSub}>Stories — {storyList.length} available</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => refetch()}>
              <Ionicons name="refresh" size={18} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: "#D1FAE5" }]}
              onPress={() => router.push("/(app)/stories/download-manager" as any)}
            >
              <Ionicons name="download-outline" size={18} color="#059669" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="গল্প খুঁজুন... (Search stories)"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Level filter chips */}
        <FlatList
          data={LEVELS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                activeLevel === item.id && { backgroundColor: LEVEL_COLORS[item.id] },
              ]}
              onPress={() => setActiveLevel(item.id)}
            >
              <Text style={[styles.chipText, activeLevel === item.id && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Story List ──────────────────────────────────────── */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>গল্প লোড হচ্ছে...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>😕</Text>
          <Text style={styles.errorText}>গল্প লোড করতে সমস্যা হয়েছে</Text>
          <Text style={styles.errorSub}>Check database seeding status</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>আবার চেষ্টা করুন</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredStories}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 56, marginBottom: 12 }}>📭</Text>
              <Text style={styles.emptyTitle}>কোনো গল্প পাওয়া যায়নি</Text>
              <Text style={styles.emptySub}>Try a different level or search term</Text>
            </View>
          }
          renderItem={({ item, index }: any) => {
            const isLocked = item.isPremium && !isPremiumUser;
            const thumbColors = STORY_THUMB_COLORS[index % STORY_THUMB_COLORS.length];

            return (
              <TouchableOpacity
                onPress={() => handleStoryPress(item)}
                activeOpacity={0.88}
                style={styles.storyCard}
              >
                {/* Thumb */}
                <LinearGradient
                  colors={thumbColors as any}
                  style={styles.thumb}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {item.illustrationUrl ? (
                    <Image
                      source={{ uri: item.illustrationUrl }}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontSize: 32 }}>📖</Text>
                  )}
                  {isLocked && (
                    <View style={styles.lockOverlay}>
                      <Ionicons name="lock-closed" size={20} color="#fff" />
                    </View>
                  )}
                </LinearGradient>

                {/* Info */}
                <View style={styles.storyInfo}>
                  <View style={styles.storyBadgeRow}>
                    <View style={[styles.levelBadge, { backgroundColor: thumbColors[0] }]}>
                      <Text style={[styles.levelBadgeText, { color: thumbColors[1] }]}>
                        Level {item.level}
                      </Text>
                    </View>
                    {item.isPremium && (
                      <View style={styles.premiumTag}>
                        <Text style={styles.premiumTagText}>👑 Premium</Text>
                      </View>
                    )}
                    {item.nctbClass && (
                      <View style={styles.nctbTag}>
                        <Text style={styles.nctbTagText}>Class {item.nctbClass}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.storyTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.storyTitleBn} numberOfLines={1}>{item.titleBn}</Text>

                  <View style={styles.storyMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={11} color="#9CA3AF" />
                      <Text style={styles.metaText}>{Math.round(item.durationSeconds / 60)} মিনিট</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="text-outline" size={11} color="#9CA3AF" />
                      <Text style={styles.metaText}>{item.wordCount} words</Text>
                    </View>
                  </View>
                </View>

                {/* Arrow */}
                <View style={styles.arrowWrap}>
                  <Ionicons
                    name={isLocked ? "lock-closed" : "chevron-forward"}
                    size={18}
                    color={isLocked ? "#F59E0B" : "#10B981"}
                  />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: "#F0FDF4" },

  header:        { backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: "#E7F9EE" },
  headerTop:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  heading:       { fontSize: 22, fontWeight: "900", color: "#111827" },
  headingSub:    { fontSize: 12, color: "#6B7280", fontWeight: "600", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  headerBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },

  searchRow:     { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 16, paddingHorizontal: 14, height: 46, gap: 8, marginBottom: 14 },
  searchInput:   { flex: 1, fontSize: 14, color: "#111827", fontWeight: "500" },

  chips:         { gap: 8, paddingBottom: 12 },
  chip:          { paddingHorizontal: 16, height: 32, borderRadius: 16, backgroundColor: "#F3F4F6", justifyContent: "center" },
  chipText:      { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  chipTextActive:{ color: "#fff" },

  list:          { padding: 16, paddingBottom: 48 },

  storyCard:     { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 20, marginBottom: 12, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  thumb:         { width: 88, height: 88, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  lockOverlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },

  storyInfo:     { flex: 1, paddingVertical: 12, paddingHorizontal: 12 },
  storyBadgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 4 },
  levelBadge:    { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  levelBadgeText:{ fontSize: 9, fontWeight: "800" },
  premiumTag:    { backgroundColor: "#FEF3C7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  premiumTagText:{ fontSize: 9, fontWeight: "800", color: "#92400E" },
  nctbTag:       { backgroundColor: "#EDE9FE", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  nctbTagText:   { fontSize: 9, fontWeight: "800", color: "#5B21B6" },

  storyTitle:    { fontSize: 14, fontWeight: "800", color: "#111827" },
  storyTitleBn:  { fontSize: 11, fontWeight: "600", color: "#6B7280", marginTop: 1 },
  storyMeta:     { flexDirection: "row", gap: 10, marginTop: 6 },
  metaItem:      { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText:      { fontSize: 10, color: "#9CA3AF", fontWeight: "600" },

  arrowWrap:     { paddingRight: 14 },

  center:        { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  loadingText:   { marginTop: 12, color: "#6B7280", fontWeight: "600" },
  errorText:     { fontSize: 16, fontWeight: "800", color: "#1F2937", textAlign: "center" },
  errorSub:      { fontSize: 12, color: "#9CA3AF", marginTop: 4, marginBottom: 16, textAlign: "center" },
  retryBtn:      { backgroundColor: "#10B981", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText:     { color: "#fff", fontWeight: "800", fontSize: 14 },

  empty:         { alignItems: "center", paddingTop: 48 },
  emptyTitle:    { fontSize: 16, fontWeight: "800", color: "#374151" },
  emptySub:      { fontSize: 12, color: "#9CA3AF", fontWeight: "600", marginTop: 4 },
});
