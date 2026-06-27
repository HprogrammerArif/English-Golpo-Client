import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import {
  useGetBookmarksQuery,
  useRemoveBookmarkMutation,
  useGetFlashcardQueueQuery,
  useSubmitFlashcardResultMutation,
  useGetMistakesQuery,
  useResolveMistakeMutation,
  useGetSentencePatternsQuery,
  useGetLearnedWordsQuery,
  useToggleLearnedWordMutation,
} from "@/redux/api/progressApi";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";

type TabType = "PATTERNS" | "FLASHCARDS" | "BOOKMARKS" | "MISTAKES" | "LEARNED";

export default function PracticeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("PATTERNS");
  const user = useAppSelector(selectCurrentUser);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>অনুশীলন কেন্দ্র ⚡</Text>
        <Text style={styles.headerSubtitle}>Practice & Vocabulary Hub</Text>
      </View>

      {/* Tabs Selector Bar */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <TabButton id="PATTERNS" label="প্যাটার্ন" sub="Spoken" active={activeTab === "PATTERNS"} onPress={setActiveTab} icon="chatbubble-ellipses-outline" />
          <TabButton id="FLASHCARDS" label="ফ্ল্যাশ কার্ড" sub="Review" active={activeTab === "FLASHCARDS"} onPress={setActiveTab} icon="layers-outline" />
          <TabButton id="BOOKMARKS" label="বুকমার্ক" sub="Bookmarks" active={activeTab === "BOOKMARKS"} onPress={setActiveTab} icon="bookmark-outline" />
          <TabButton id="MISTAKES" label="ভুলগুলো" sub="Mistakes" active={activeTab === "MISTAKES"} onPress={setActiveTab} icon="alert-circle-outline" />
          <TabButton id="LEARNED" label="শেখা শব্দ" sub="Learned" active={activeTab === "LEARNED"} onPress={setActiveTab} icon="ribbon-outline" />
        </ScrollView>
      </View>

      {/* Content Rendering */}
      <View style={styles.content}>
        {activeTab === "PATTERNS" && <SentencePatternsTab />}
        {activeTab === "FLASHCARDS" && <FlashcardsTab />}
        {activeTab === "BOOKMARKS" && <BookmarksTab />}
        {activeTab === "MISTAKES" && <MistakesTab />}
        {activeTab === "LEARNED" && <LearnedTab />}
      </View>
    </SafeAreaView>
  );
}

// ─── Shared Tab Button ───────────────────────────────────────────
function TabButton({ id, label, sub, active, onPress, icon }: { id: TabType; label: string; sub: string; active: boolean; onPress: (id: TabType) => void; icon: any }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(id)}
      style={[styles.tabButton, active && styles.tabButtonActive]}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={16} color={active ? "#FFF" : "#6B7280"} />
      <View>
        <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
        <Text style={[styles.tabButtonSubText, active && styles.tabButtonSubTextActive]}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── 1. Sentence Patterns Tab ─────────────────────────────────────
function SentencePatternsTab() {
  const { data: patterns, isLoading, error } = useGetSentencePatternsQuery();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (error || !patterns) return <ErrorState text="প্যাটার্ন লোড করা যায়নি" />;

  return (
    <FlatList
      data={patterns}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listPadding}
      ListHeaderComponent={<Text style={styles.sectionTitle}>💬 Spoken English Patterns ({patterns.length})</Text>}
      renderItem={({ item }) => {
        const isExpanded = expandedId === item.id;
        return (
          <TouchableOpacity
            style={styles.patternCard}
            onPress={() => setExpandedId(isExpanded ? null : item.id)}
            activeOpacity={0.9}
          >
            <View style={styles.patternHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.patternCategory}>{item.category}</Text>
                <Text style={styles.patternTitle}>{item.pattern}</Text>
                <Text style={styles.patternBn}>{item.patternBn}</Text>
              </View>
              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
            </View>

            {isExpanded && (
              <View style={styles.patternDetails}>
                <View style={styles.divider} />
                <View style={styles.exampleRow}>
                  <Text style={styles.exampleLabel}>Example (ইংরেজিতে):</Text>
                  <Text style={styles.exampleEn}>{item.exampleEn}</Text>
                </View>
                <View style={styles.exampleRow}>
                  <Text style={styles.exampleLabel}>অনুবাদ (বাংলায়):</Text>
                  <Text style={styles.exampleBn}>{item.exampleBn}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}

// ─── 2. Spaced Repetition Flashcards Tab ──────────────────────────
function FlashcardsTab() {
  const { data, isLoading, error, refetch } = useGetFlashcardQueueQuery();
  const [submitResult] = useSubmitFlashcardResultMutation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) return <ErrorState text="ফ্ল্যাশ কার্ড লোড করা যায়নি" />;

  const cards = data.cards || [];

  if (cards.length === 0 || currentIndex >= cards.length) {
    return (
      <View style={styles.centerBox}>
        <Text style={{ fontSize: 50, marginBottom: 12 }}>🎉</Text>
        <Text style={styles.emptyTitle}>সব শব্দ রিভিশন শেষ!</Text>
        <Text style={styles.emptySubtitle}>All caught up! Check back later.</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => { setCurrentIndex(0); refetch(); }}>
          <Text style={styles.refreshBtnText}>রিফ্রেশ করুন</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = cards[currentIndex];

  const handleScore = async (quality: number) => {
    try {
      await submitResult({ word: currentCard.englishWord, quality }).unwrap();
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
      Toast.show({
        type: "success",
        text1: "রিভিশন সেভ হয়েছে 💾",
        text2: `Interval adjusted based on score!`,
        visibilityTime: 1500,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to submit result");
    }
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardProgress}>Progress: {currentIndex + 1} / {cards.length}</Text>
      
      {/* Flipping Card body */}
      <TouchableOpacity
        style={styles.flashcard}
        onPress={() => setIsFlipped(!isFlipped)}
        activeOpacity={0.95}
      >
        <LinearGradient colors={["#FFFFFF", "#F9FAF6"]} style={styles.cardGrad}>
          {!isFlipped ? (
            <View style={styles.cardInner}>
              <Text style={styles.cardWord}>{currentCard.englishWord}</Text>
              <Text style={styles.cardActionHint}>Tap to reveal meaning 👆</Text>
            </View>
          ) : (
            <View style={styles.cardInner}>
              <Text style={styles.cardWordRevealed}>{currentCard.englishWord}</Text>
              <Text style={styles.cardMeaningBn}>{currentCard.banglaMeaning}</Text>
              <View style={styles.cardContextBox}>
                <Text style={styles.cardContextLabel}>Context:</Text>
                <Text style={styles.cardContextText}>"{currentCard.context}"</Text>
              </View>
              <Text style={styles.cardActionHint}>Tap to flip back</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Spaced Repetition Scoring Controls */}
      {isFlipped && (
        <View style={styles.controls}>
          <Text style={styles.controlTitle}>কতটা মনে করতে পেরেছেন?</Text>
          <View style={styles.scoreRow}>
            <ScoreButton label="ভুলে গেছি" color="#EF4444" onPress={() => handleScore(1)} />
            <ScoreButton label="কঠিন" color="#F59E0B" onPress={() => handleScore(3)} />
            <ScoreButton label="পেরেছি" color="#10B981" onPress={() => handleScore(4)} />
            <ScoreButton label="সহজ" color="#3B82F6" onPress={() => handleScore(5)} />
          </View>
        </View>
      )}
    </View>
  );
}

function ScoreButton({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.scoreBtn, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.scoreBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── 3. Bookmarks Tab ─────────────────────────────────────────────
function BookmarksTab() {
  const { data, isLoading, error } = useGetBookmarksQuery({});
  const [removeBookmark] = useRemoveBookmarkMutation();
  const [toggleLearned] = useToggleLearnedWordMutation();

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) return <ErrorState text="বুকমার্ক লোড করা যায়নি" />;

  const list = data.bookmarks || [];

  const handleRemove = async (word: string) => {
    try {
      await removeBookmark(word).unwrap();
      Toast.show({ type: "info", text1: "বুকমার্ক মুছে ফেলা হয়েছে 🧹" });
    } catch {
      Alert.alert("Error", "Failed to remove bookmark");
    }
  };

  const handleLearned = async (word: string) => {
    try {
      await toggleLearned({ word }).unwrap();
      Toast.show({ type: "success", text1: "শেখার তালিকা আপডেট হয়েছে! 🌟" });
    } catch {
      Alert.alert("Error", "Failed to update learned status");
    }
  };

  return (
    <FlatList
      data={list}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listPadding}
      ListHeaderComponent={<Text style={styles.sectionTitle}>🔖 আমার সংরক্ষিত বুকমার্ক ({list.length})</Text>}
      ListEmptyComponent={
        <View style={styles.emptyCenter}>
          <Text style={{ fontSize: 40 }}>📭</Text>
          <Text style={styles.emptyTitle}>কোনো বুকমার্ক নেই</Text>
          <Text style={styles.emptySubtitle}>গল্প পড়ার সময় নতুন শব্দ সেভ করুন।</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.bookmarkCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookmarkEn}>{item.englishWord}</Text>
            <Text style={styles.bookmarkBn}>{item.banglaMeaning}</Text>
            <Text style={styles.bookmarkContext}>"{item.context}"</Text>
          </View>
          <View style={styles.bookmarkActions}>
            <TouchableOpacity style={styles.bookmarkBtn} onPress={() => handleLearned(item.englishWord)}>
              <Ionicons name={item.isLearned ? "ribbon" : "ribbon-outline"} size={20} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookmarkBtn} onPress={() => handleRemove(item.englishWord)}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

// ─── 4. Mistakes review Tab ───────────────────────────────────────
function MistakesTab() {
  const { data: mistakes, isLoading, error } = useGetMistakesQuery();
  const [resolveMistake] = useResolveMistakeMutation();

  if (isLoading) return <LoadingSpinner />;
  if (error || !mistakes) return <ErrorState text="ভুলগুলো লোড করা যায়নি" />;

  const handleResolve = async (id: string) => {
    try {
      await resolveMistake({ id }).unwrap();
      Toast.show({ type: "success", text1: "ভুল সংশোধন সেভ হয়েছে! 🎉" });
    } catch {
      Alert.alert("Error", "Failed to resolve mistake");
    }
  };

  return (
    <FlatList
      data={mistakes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listPadding}
      ListHeaderComponent={<Text style={styles.sectionTitle}>❌ ভুল করা শব্দ ও বাক্য ({mistakes.length})</Text>}
      ListEmptyComponent={
        <View style={styles.emptyCenter}>
          <Text style={{ fontSize: 40 }}>🏆</Text>
          <Text style={styles.emptyTitle}>কোনো ভুল নেই!</Text>
          <Text style={styles.emptySubtitle}>আপনি সব কুইজ এবং স্পিকিং সঠিক করেছেন।</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.mistakeCard}>
          <View style={{ flex: 1 }}>
            <View style={styles.mistakeTagRow}>
              <Text style={styles.mistakeTag}>{item.type}</Text>
              <Text style={styles.mistakeCount}>ভুল হয়েছে: {item.incorrectCount} বার</Text>
            </View>
            <Text style={styles.mistakeEn}>{item.englishText}</Text>
            <Text style={styles.mistakeBn}>{item.banglaText}</Text>
          </View>
          <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(item.id)}>
            <Text style={styles.resolveBtnText}>ক্লিয়ার</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

// ─── 5. Completely Learned Tab ────────────────────────────────────
function LearnedTab() {
  const { data: learnedList, isLoading, error } = useGetLearnedWordsQuery();
  const [toggleLearned] = useToggleLearnedWordMutation();

  if (isLoading) return <LoadingSpinner />;
  if (error || !learnedList) return <ErrorState text="শেখা শব্দ লোড করা যায়নি" />;

  const handleToggle = async (word: string) => {
    try {
      await toggleLearned({ word }).unwrap();
      Toast.show({ type: "info", text1: "শব্দটি পুনরায় বুকমার্কে ফেরত পাঠানো হয়েছে।" });
    } catch {
      Alert.alert("Error", "Failed to update learned status");
    }
  };

  return (
    <FlatList
      data={learnedList}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listPadding}
      ListHeaderComponent={
        <View style={styles.learnedHeader}>
          <Text style={styles.sectionTitle}>🏆 সম্পূর্ণ মুখস্থ করা শব্দসমূহ ({learnedList.length})</Text>
          <Text style={styles.learnedSubTitle}>এখানে আপনার সফলভাবে শিখে ফেলা শব্দগুলো দেখতে পাবেন।</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyCenter}>
          <Text style={{ fontSize: 40 }}>📖</Text>
          <Text style={styles.emptyTitle}>এখনো কোনো শব্দ শেখা হয়নি</Text>
          <Text style={styles.emptySubtitle}>বুকমার্কের রিভন বাটন চাপ দিয়ে শিখে ফেলা ঘোষণা করুন।</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.learnedCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.learnedWordEn}>{item.englishWord}</Text>
            <Text style={styles.learnedWordBn}>{item.banglaMeaning}</Text>
            <Text style={styles.learnedWordMeta}>রিভিশন সম্পন্ন: {item.repetitions} বার</Text>
          </View>
          <TouchableOpacity style={styles.undoLearnedBtn} onPress={() => handleToggle(item.englishWord)}>
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

// ─── Atoms & UI Common Components ─────────────────────────────────
function LoadingSpinner() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}

function ErrorState({ text }: { text: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F0FDF4" },
  header: { backgroundColor: "#FFF", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#E7F9EE" },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#111827" },
  headerSubtitle: { fontSize: 12, color: "#6B7280", fontWeight: "600", marginTop: 2 },

  // Tabs style
  tabContainer: { backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  tabScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tabButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: "#F3F4F6" },
  tabButtonActive: { backgroundColor: "#10B981" },
  tabButtonText: { fontSize: 13, fontWeight: "800", color: "#374151" },
  tabButtonTextActive: { color: "#FFF" },
  tabButtonSubText: { fontSize: 9, fontWeight: "600", color: "#9CA3AF" },
  tabButtonSubTextActive: { color: "rgba(255,255,255,0.7)" },

  content: { flex: 1 },

  // Patterns List
  listPadding: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1F2937", marginBottom: 12 },
  patternCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  patternCardActive: { borderColor: "#10B981", borderWidth: 1.5 },
  patternHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  patternCategory: { fontSize: 9, fontWeight: "800", color: "#059669", backgroundColor: "#D1FAE5", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start", marginBottom: 6 },
  patternTitle: { fontSize: 15, fontWeight: "800", color: "#1F2937" },
  patternBn: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginTop: 2 },
  patternDetails: { marginTop: 12 },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 10 },
  exampleRow: { marginBottom: 6 },
  exampleLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF" },
  exampleEn: { fontSize: 14, fontWeight: "800", color: "#111827", marginTop: 1 },
  exampleBn: { fontSize: 13, fontWeight: "600", color: "#059669", marginTop: 1 },

  // Flashcards
  cardContainer: { flex: 1, padding: 20, justifyContent: "center" },
  cardProgress: { fontSize: 12, fontWeight: "800", color: "#6B7280", textAlign: "center", marginBottom: 12 },
  flashcard: { height: 280, borderRadius: 28, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4, marginBottom: 20, overflow: "hidden" },
  cardGrad: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  cardInner: { width: "100%", height: "100%", justifyContent: "space-between", alignItems: "center" },
  cardWord: { fontSize: 32, fontWeight: "900", color: "#111827", textAlign: "center", marginVertical: "auto" },
  cardWordRevealed: { fontSize: 24, fontWeight: "900", color: "#6B7280", textAlign: "center" },
  cardMeaningBn: { fontSize: 28, fontWeight: "900", color: "#10B981", textAlign: "center", marginVertical: 10 },
  cardContextBox: { backgroundColor: "#F0FDF4", padding: 12, borderRadius: 16, width: "100%" },
  cardContextLabel: { fontSize: 10, fontWeight: "800", color: "#059669", textTransform: "uppercase" },
  cardContextText: { fontSize: 12, color: "#4B5563", fontWeight: "600", fontStyle: "italic", marginTop: 2 },
  cardActionHint: { fontSize: 10, fontWeight: "700", color: "#9CA3AF" },

  controls: { paddingHorizontal: 10 },
  controlTitle: { fontSize: 13, fontWeight: "800", color: "#4B5563", textAlign: "center", marginBottom: 10 },
  scoreRow: { flexDirection: "row", gap: 6, justifyContent: "space-between" },
  scoreBtn: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: "center" },
  scoreBtnText: { color: "#FFF", fontSize: 11, fontWeight: "800" },

  // Bookmarks list
  bookmarkCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  bookmarkEn: { fontSize: 16, fontWeight: "800", color: "#1F2937" },
  bookmarkBn: { fontSize: 13, fontWeight: "700", color: "#10B981", marginTop: 1 },
  bookmarkContext: { fontSize: 11, fontStyle: "italic", color: "#6B7280", marginTop: 4 },
  bookmarkActions: { flexDirection: "row", gap: 6 },
  bookmarkBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },

  // Mistakes List
  mistakeCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  mistakeTagRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  mistakeTag: { fontSize: 8, fontWeight: "800", color: "#EF4444", backgroundColor: "#FEF2F2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  mistakeCount: { fontSize: 9, fontWeight: "700", color: "#9CA3AF" },
  mistakeEn: { fontSize: 15, fontWeight: "800", color: "#1F2937" },
  mistakeBn: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginTop: 1 },
  resolveBtn: { backgroundColor: "#10B981", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  resolveBtnText: { color: "#FFF", fontSize: 11, fontWeight: "800" },

  // Learned List
  learnedHeader: { marginBottom: 10 },
  learnedSubTitle: { fontSize: 11, fontWeight: "600", color: "#9CA3AF", marginTop: -6, marginBottom: 12 },
  learnedCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  learnedWordEn: { fontSize: 16, fontWeight: "800", color: "#059669" },
  learnedWordBn: { fontSize: 13, fontWeight: "700", color: "#1F2937", marginTop: 1 },
  learnedWordMeta: { fontSize: 10, fontWeight: "600", color: "#9CA3AF", marginTop: 4 },
  undoLearnedBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center" },

  // Common UI states
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyCenter: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#374151", marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: "#9CA3AF", fontWeight: "600", marginTop: 4, textAlign: "center" },
  refreshBtn: { backgroundColor: "#10B981", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, marginTop: 16 },
  refreshBtnText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
  errorText: { fontSize: 14, color: "#EF4444", fontWeight: "700" },
});
