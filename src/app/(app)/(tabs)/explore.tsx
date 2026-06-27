import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { useGetStoriesQuery } from "@/redux/api/storyApi";
import { useRouter } from "expo-router";

const LEVELS = [
  { id: 0, label: "All" },
  { id: 1, label: "Beginner" },
  { id: 2, label: "Elementary" },
  { id: 3, label: "Intermediate" },
  { id: 4, label: "Advanced" },
];

export default function ExploreScreen() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const [query, setQuery] = useState("");
  const [activeLevel, setActiveLevel] = useState(0); // 0 = All

  const { data: stories, isLoading, error, refetch } = useGetStoriesQuery({
    path: user?.learningPath || "KIDS",
  });

  const isPremiumUser = user?.role === "PREMIUM";

  const handleStoryPress = (story: any) => {
    const isLocked = story.isPremium && !isPremiumUser;
    if (isLocked) {
      router.push({
        pathname: "/(app)/subscription/paywall",
        params: { storyId: story.id }
      } as any);
    } else {
      router.push(`/(app)/stories/${story.id}`);
    }
  };

  const filteredStories = (stories || []).filter((story) => {
    const matchesSearch =
      query === "" ||
      story.title.toLowerCase().includes(query.toLowerCase()) ||
      story.titleBn.toLowerCase().includes(query.toLowerCase());
      
    const matchesLevel = activeLevel === 0 || story.level === activeLevel;

    return matchesSearch && matchesLevel;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View className="flex-row justify-between items-center mb-4">
          <Text style={styles.heading}>Explore Stories</Text>
          <TouchableOpacity onPress={() => refetch()} className="p-1">
            <Ionicons name="refresh" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories in English or Bangla..."
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

        {/* Level filter tabs */}
        <FlatList
          data={LEVELS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, activeLevel === item.id && styles.chipActive]}
              onPress={() => setActiveLevel(item.id)}
            >
              <Text style={[styles.chipText, activeLevel === item.id && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Stories list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-gray-500 font-semibold text-center mb-4">
            Failed to load stories from the server. Check database seeding status!
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-emerald-500 px-5 py-2.5 rounded-full"
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredStories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>No stories found for this level</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isLocked = item.isPremium && !isPremiumUser;
            return (
              <TouchableOpacity
                onPress={() => handleStoryPress(item)}
                activeOpacity={0.8}
                className="bg-white border border-gray-100 rounded-3xl p-4 mb-4 flex-row items-center space-x-4 shadow-sm"
              >
                {/* Book cover placeholder */}
                <Image
                  source={{ uri: item.illustrationUrl }}
                  className="w-20 h-20 rounded-2xl bg-emerald-50"
                  resizeMode="cover"
                />

                {/* Content details */}
                <View className="flex-1">
                  <View className="flex-row items-center space-x-1">
                    <Text className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      LEVEL {item.level}
                    </Text>
                    {item.isPremium && (
                      <Text className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Premium
                      </Text>
                    )}
                  </View>
                  <Text className="text-base font-extrabold text-gray-800 mt-1">
                    {item.title}
                  </Text>
                  <Text className="text-xs font-semibold text-gray-400 font-bangla mt-0.5">
                    {item.titleBn}
                  </Text>
                  <Text className="text-[11px] text-gray-400 mt-2 font-medium">
                    {item.wordCount} words • {Math.round(item.durationSeconds / 60)} min read
                  </Text>
                </View>

                {/* Status indicator */}
                <View className="p-2">
                  <Ionicons
                    name={isLocked ? "lock-closed" : "chevron-forward-circle"}
                    size={24}
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
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  heading: { fontSize: 24, fontWeight: "900", color: "#111827" },
  searchRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 16, paddingHorizontal: 14, height: 46, gap: 8, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, color: "#111827", fontWeight: "500" },
  chips: { gap: 8, paddingBottom: 14 },
  chip: { paddingHorizontal: 16, height: 34, borderRadius: 17, backgroundColor: "#F3F4F6", justifyContent: "center" },
  chipActive: { backgroundColor: "#10B981" },
  chipText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  chipTextActive: { color: "#fff" },
  list: { padding: 20, paddingBottom: 40 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: "#6B7280", fontSize: 15, fontWeight: "600" },
});

