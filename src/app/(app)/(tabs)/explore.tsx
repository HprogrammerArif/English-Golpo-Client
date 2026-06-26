import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Scaffold data — replace with real API data
const CATEGORIES = ["All", "Popular", "New", "Trending", "Featured"];
const ITEMS = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  title: `Item ${i + 1}`,
  subtitle: "Tap to view details",
  emoji: ["🎯", "🚀", "⭐", "🎨", "💡", "🔥", "🎉", "📱"][i],
}));

export default function ExploreScreen() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = ITEMS.filter(
    (item) =>
      query === "" || item.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Explore</Text>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
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

        {/* Category chips */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(c) => c}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, activeCategory === item && styles.chipActive]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[styles.chipText, activeCategory === item && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Grid */}
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.75}>
            <Text style={styles.cardEmoji}>{item.emoji}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.subtitle}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  heading: { fontSize: 26, fontWeight: "800", color: "#111827", marginBottom: 14 },
  searchRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 14, height: 46, gap: 8, marginBottom: 14 },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: 15, color: "#111827" },
  chips: { gap: 8, paddingBottom: 14 },
  chip: { paddingHorizontal: 16, height: 34, borderRadius: 17, backgroundColor: "#F3F4F6", justifyContent: "center" },
  chipActive: { backgroundColor: "#2B7FFF" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  chipTextActive: { color: "#fff" },
  grid: { padding: 16, paddingTop: 12 },
  row: { gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 18, alignItems: "flex-start", gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardEmoji: { fontSize: 32 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  cardSub: { fontSize: 12, color: "#9CA3AF" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: "#6B7280", fontSize: 15 },
});
